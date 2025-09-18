import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { db } from '../db';
import { conversations, messages, advocates, students, match_proposals, users, documents, message_attachments, conversation_labels, conversation_label_assignments } from '../../shared/schema';
import { eq, and, or, desc, asc, ne, isNull, inArray, exists } from 'drizzle-orm';
import { getUserId } from '../utils';
import { isAuthenticated } from '../replitAuth';
import {
  validateFilesUpload,
  sanitizeFileName,
  generateSecureFilePath,
  getFileCategory,
  canPreviewFile,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_MESSAGE
} from '../fileUpload';
import {
  uploadFileToStorage,
  generatePresignedUpload,
  getDownloadUrl,
  getFileFromStorage,
  deleteFileFromStorage
} from '../objectStorage';

const router = Router();

// Helper function to detect mobile/Capacitor requests
const isMobileRequest = (req: any): boolean => {
  const origin = req.headers.origin || '';
  const userAgent = req.headers['user-agent'] || '';
  const platform = req.headers['x-iep-platform'] || '';
  
  return origin.includes('capacitor://') || 
         userAgent.includes('Capacitor') || 
         platform === 'mobile';
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_MESSAGE
  },
  fileFilter: (req, file, cb) => {
    if (Object.keys(ALLOWED_FILE_TYPES).includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Validation schemas
const createConversationSchema = z.object({
  advocate_id: z.string().optional(),
  parent_id: z.string(),
  student_id: z.string().optional(),
  match_proposal_id: z.string().optional(),
  title: z.string().optional(),
});

const sendMessageSchema = z.object({
  conversation_id: z.string(),
  content: z.string().optional(),
  attachment_ids: z.array(z.string()).optional(), // References to already uploaded files
}).refine((data) => data.content || (data.attachment_ids && data.attachment_ids.length > 0), {
  message: "Either content or attachments must be provided",
});

const presignedUploadSchema = z.object({
  files: z.array(z.object({
    name: z.string().min(1).max(255),
    type: z.string(),
    size: z.number().max(MAX_FILE_SIZE)
  })).max(MAX_FILES_PER_MESSAGE)
});

// POST /api/messaging/conversations - Create a new conversation
router.post('/conversations', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const data = createConversationSchema.parse(req.body);
    
    console.log('Creating conversation:', { userId, data });
    
    // Handle both advocate and parent flows
    const advocateProfile = await db.select({
      id: advocates.id,
      user_id: advocates.user_id,
      full_name: advocates.full_name
    }).from(advocates)
      .where(eq(advocates.user_id, userId))
      .then(results => results[0]);
    
    if (advocateProfile) {
      // User is an advocate - derive advocate_id from their profile (ignore client value)
      data.advocate_id = advocateProfile.id;
    } else {
      // User is a parent - must match parent_id and provide valid advocate_id
      if (userId !== data.parent_id) {
        console.log('Authorization failed: Parent user ID mismatch', { userId, parent_id: data.parent_id });
        return res.status(403).json({ error: 'Not authorized to create this conversation' });
      }
      
      if (!data.advocate_id) {
        console.log('Authorization failed: Parent must specify advocate_id');
        return res.status(400).json({ error: 'advocate_id required for parent-initiated conversations' });
      }
      
      // Validate advocate_id exists
      const targetAdvocate = await db.select({
        id: advocates.id
      }).from(advocates)
        .where(eq(advocates.id, data.advocate_id))
        .then(results => results[0]);
      
      if (!targetAdvocate) {
        console.log('Authorization failed: Invalid advocate_id', { advocate_id: data.advocate_id });
        return res.status(400).json({ error: 'Invalid advocate specified' });
      }
    }

    // Check if conversation already exists between these users
    const existingConversationConditions = [
      eq(conversations.advocate_id, data.advocate_id!),
      eq(conversations.parent_id, data.parent_id)
    ];
    
    if (data.student_id) {
      existingConversationConditions.push(eq(conversations.student_id, data.student_id));
    }
    
    const existingConversation = await db.select({
      id: conversations.id,
      advocate_id: conversations.advocate_id,
      parent_id: conversations.parent_id,
      student_id: conversations.student_id,
      match_proposal_id: conversations.match_proposal_id,
      title: conversations.title,
      status: conversations.status,
      last_message_at: conversations.last_message_at,
      created_at: conversations.created_at
    }).from(conversations)
      .where(and(...existingConversationConditions))
      .then(results => results[0]);

    if (existingConversation) {
      return res.json({ conversation: existingConversation });
    }

    // Create new conversation
    const [conversation] = await db.insert(conversations)
      .values({
        advocate_id: data.advocate_id!, // Guaranteed to be set by authorization logic
        parent_id: data.parent_id,
        student_id: data.student_id || null,
        match_proposal_id: data.match_proposal_id || null,
        title: data.title || null,
        status: 'active',
        last_message_at: new Date(),
      })
      .returning();

    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Validation schema for conversation filters
const conversationFiltersSchema = z.object({
  archived: z.enum(['true', 'false']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  status: z.enum(['active', 'closed']).optional(),
  label_ids: z.string().optional(), // Comma-separated label IDs
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional()
});

// GET /api/messaging/conversations - Get user's conversations with server-side filtering and pagination
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const filters = conversationFiltersSchema.parse(req.query);
    
    console.log('Fetching conversations for user:', userId, 'with filters:', filters);
    
    // First, check if user is an advocate and get their advocate profile
    let advocateProfile;
    try {
      const advocateResults = await db.select({
        id: advocates.id,
        user_id: advocates.user_id,
        full_name: advocates.full_name
      }).from(advocates)
        .where(eq(advocates.user_id, userId));
      advocateProfile = advocateResults[0] || null;
    } catch (error) {
      console.log('User is not an advocate or error finding advocate profile');
      advocateProfile = null;
    }
    
    // Build base where clause for user access
    let baseWhereClause;
    if (advocateProfile) {
      // For advocates, use their advocate profile ID
      baseWhereClause = or(
        eq(conversations.parent_id, userId),
        eq(conversations.advocate_id, advocateProfile.id)
      );
    } else {
      // For parents, only check parent_id
      baseWhereClause = eq(conversations.parent_id, userId);
    }
    
    // Build additional filter conditions
    const filterConditions = [baseWhereClause];
    
    // Archive filter
    if (filters.archived !== undefined) {
      filterConditions.push(eq(conversations.archived, filters.archived === 'true'));
    }
    
    // Priority filter
    if (filters.priority) {
      filterConditions.push(eq(conversations.priority, filters.priority));
    }
    
    // Status filter  
    if (filters.status) {
      filterConditions.push(eq(conversations.status, filters.status));
    }
    
    // Handle label filtering if specified - CRITICAL: Must happen BEFORE query construction
    if (filters.label_ids) {
      const labelIds = filters.label_ids.split(',').filter(id => id.trim());
      if (labelIds.length > 0) {
        // Use EXISTS subquery instead of JOIN + GROUP BY to avoid SQL errors
        const labelExistsSubquery = db.select({ id: conversation_label_assignments.conversation_id })
          .from(conversation_label_assignments)
          .where(and(
            eq(conversation_label_assignments.conversation_id, conversations.id),
            inArray(conversation_label_assignments.label_id, labelIds)
          ));

        // Add EXISTS condition to filter conditions
        filterConditions.push(exists(labelExistsSubquery));
      }
    }
    
    // Calculate pagination
    const offset = (filters.page - 1) * filters.limit;
    
    // Get conversations with joins and filters - ALL conditions now included
    const userConversations = await db.select({
      conversation: conversations,
      advocate: advocates,
      student: students,
      parent: users,
    })
    .from(conversations)
    .leftJoin(advocates, eq(conversations.advocate_id, advocates.id))
    .leftJoin(students, eq(conversations.student_id, students.id))
    .leftJoin(users, eq(conversations.parent_id, users.id))
    .where(and(...filterConditions))
    .orderBy(desc(conversations.last_message_at))
    .limit(filters.limit)
    .offset(offset);
    
    // Get total count for pagination using proper SQL count(*)
    const countResults = await db.select({ 
      count: conversations.id 
    })
      .from(conversations)
      .leftJoin(advocates, eq(conversations.advocate_id, advocates.id))
      .where(and(...filterConditions));
    
    const totalCount = countResults.length;
    
    console.log(`Found ${userConversations.length} conversations (page ${filters.page}, total: ${totalCount})`);

    // Efficiently get latest messages and unread counts for all conversations
    const conversationIds = userConversations.map(c => c.conversation.id);
    
    // Get latest messages for all conversations in one query
    const latestMessages = await db.select({
      conversation_id: messages.conversation_id,
      id: messages.id,
      sender_id: messages.sender_id,
      content: messages.content,
      created_at: messages.created_at,
      read_at: messages.read_at
    })
    .from(messages)
    .where(inArray(messages.conversation_id, conversationIds))
    .orderBy(desc(messages.created_at))
    .then(results => {
      // Group by conversation_id and take the first (latest) message for each
      const latestByConversation = new Map();
      results.forEach(msg => {
        if (!latestByConversation.has(msg.conversation_id)) {
          latestByConversation.set(msg.conversation_id, msg);
        }
      });
      return latestByConversation;
    });
    
    // Get unread counts for all conversations in one query
    const unreadCounts = await db.select({
      conversation_id: messages.conversation_id,
      count: messages.id
    })
    .from(messages)
    .where(and(
      inArray(messages.conversation_id, conversationIds),
      ne(messages.sender_id, userId), // Messages not sent by current user
      isNull(messages.read_at) // That haven't been read
    ))
    .then(results => {
      // Group by conversation_id and count
      const countsByConversation = new Map();
      results.forEach(result => {
        const currentCount = countsByConversation.get(result.conversation_id) || 0;
        countsByConversation.set(result.conversation_id, currentCount + 1);
      });
      return countsByConversation;
    });

    // Map conversations with their associated data
    const conversationsWithMessages = userConversations.map(({ conversation, advocate, student, parent }) => {
      const latestMessage = latestMessages.get(conversation.id);
      const unreadCount = unreadCounts.get(conversation.id) || 0;

      return {
        ...conversation,
        advocate: advocate ? {
          ...advocate,
          name: advocate.full_name, // Map full_name to name for client compatibility
          specialty: advocate.specializations?.[0] || 'General Advocacy' // Map first specialization as specialty
        } : null,
        student: student ? {
          ...student,
          name: student.full_name // Map full_name to name for client compatibility
        } : null,
        parent: parent ? {
          id: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
          name: `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || parent.email
        } : null,
        latest_message: latestMessage,
        unread_count: unreadCount,
      };
    });

    res.json({ 
      conversations: conversationsWithMessages,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / filters.limit),
        hasNext: filters.page < Math.ceil(totalCount / filters.limit),
        hasPrev: filters.page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/messaging/conversations/:id - Get a specific conversation with messages
router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;

    // Get conversation and verify user has access
    const conversation = await db.select({
      conversation: conversations,
      advocate: advocates,
      student: students,
    })
    .from(conversations)
    .leftJoin(advocates, eq(conversations.advocate_id, advocates.id))
    .leftJoin(students, eq(conversations.student_id, students.id))
    .where(
      and(
        eq(conversations.id, id),
        or(
          eq(conversations.parent_id, userId),
          eq(advocates.user_id, userId)
        )
      )
    )
    .then(results => results[0]);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get all messages for this conversation with their attachments
    const conversationMessages = await db.select({
      id: messages.id,
      conversation_id: messages.conversation_id,
      sender_id: messages.sender_id,
      content: messages.content,
      attachment_count: messages.attachment_count,
      created_at: messages.created_at,
      read_at: messages.read_at
    })
      .from(messages)
      .where(eq(messages.conversation_id, id))
      .orderBy(asc(messages.created_at));

    // Get attachments for all messages in this conversation
    const messageIds = conversationMessages.map(msg => msg.id);
    const attachments = messageIds.length > 0 ? await db.select({
      attachment: message_attachments,
      document: documents
    })
      .from(message_attachments)
      .leftJoin(documents, eq(message_attachments.document_id, documents.id))
      .where(or(...messageIds.map(id => eq(message_attachments.message_id, id))))
      : [];

    // Group attachments by message_id and add download URLs
    const attachmentsByMessage = attachments.reduce((acc: any, { attachment, document }) => {
      if (!acc[attachment.message_id]) {
        acc[attachment.message_id] = [];
      }
      
      if (document) {
        acc[attachment.message_id].push({
          ...document,
          downloadUrl: getDownloadUrl(document.file_path),
          previewUrl: canPreviewFile(document.file_type || '') ? getDownloadUrl(document.file_path) : null
        });
      }
      
      return acc;
    }, {});

    // Add attachments to messages
    const messagesWithAttachments = conversationMessages.map(message => ({
      ...message,
      attachments: attachmentsByMessage[message.id] || []
    }));

    // Mark messages as read (messages sent by the other party)
    await db.update(messages)
      .set({ read_at: new Date() })
      .where(and(
        eq(messages.conversation_id, id),
        ne(messages.sender_id, userId),
        isNull(messages.read_at)
      ));

    res.json({
      conversation: conversation.conversation,
      advocate: conversation.advocate ? {
        ...conversation.advocate,
        name: conversation.advocate.full_name, // Map full_name to name for client compatibility
        specialty: conversation.advocate.specializations?.[0] || 'General Advocacy' // Map first specialization as specialty
      } : null,
      student: conversation.student ? {
        ...conversation.student,
        name: conversation.student.full_name // Map full_name to name for client compatibility
      } : null,
      messages: messagesWithAttachments,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// POST /api/messaging/presigned-upload - Get presigned URLs for file uploads
router.post('/presigned-upload', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const data = presignedUploadSchema.parse(req.body);

    // Validate all files
    const validation = validateFilesUpload(data.files);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Generate presigned uploads for each file
    const uploads = await Promise.all(
      data.files.map(async (file) => {
        const sanitizedName = sanitizeFileName(file.name);
        const filePath = generateSecureFilePath(sanitizedName, userId);
        
        const presignedData = await generatePresignedUpload(
          filePath,
          file.type,
          file.size
        );

        return {
          ...presignedData,
          originalName: file.name,
          sanitizedName,
          fileSize: file.size,
          fileType: file.type
        };
      })
    );

    res.json({ uploads });
  } catch (error) {
    console.error('Error generating presigned uploads:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to generate upload URLs' });
  }
});

// POST /api/messaging/upload/:uploadId - Direct file upload endpoint
router.post('/upload/:uploadId', upload.array('files', MAX_FILES_PER_MESSAGE), async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { uploadId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Validate files
    const fileValidation = validateFilesUpload(files.map(f => ({
      name: f.originalname,
      type: f.mimetype,
      size: f.size
    })));

    if (!fileValidation.isValid) {
      return res.status(400).json({ error: fileValidation.error });
    }

    // Upload files and create document records
    const uploadedFiles: Array<{
      documentId: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      downloadUrl: string;
      previewUrl: string | undefined;
    }> = [];
    
    for (const file of files) {
      try {
        const sanitizedName = sanitizeFileName(file.originalname);
        const filePath = generateSecureFilePath(sanitizedName, userId);
        
        // Upload to object storage
        const uploadResult = await uploadFileToStorage(
          file.buffer,
          filePath,
          file.mimetype,
          userId // Pass userId for ACL policy
        );

        // Create document record
        const [document] = await db.insert(documents)
          .values({
            user_id: userId,
            title: sanitizedName,
            file_name: sanitizedName,
            file_path: uploadResult.filePath,
            file_type: file.mimetype,
            file_size: file.size,
            category: 'message_attachment',
            uploaded_by: userId,
          })
          .returning();

        uploadedFiles.push({
          documentId: document.id,
          fileName: sanitizedName,
          fileType: file.mimetype,
          fileSize: file.size,
          downloadUrl: uploadResult.downloadUrl,
          previewUrl: uploadResult.previewUrl
        });
      } catch (fileError) {
        console.error('Error uploading file:', file.originalname, fileError);
        return res.status(500).json({ 
          error: `Failed to upload file: ${file.originalname}` 
        });
      }
    }

    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Error in file upload:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// POST /api/messaging/messages - Send a message (TRANSACTIONAL)
router.post('/messages', async (req: Request, res: Response) => {
  const transaction = await db.transaction(async (tx) => {
    try {
      const userId = await getUserId(req);
      const data = sendMessageSchema.parse(req.body);

      // Verify user has access to this conversation
      const conversation = await tx.select({
        conversation: conversations,
        advocate: advocates,
      })
        .from(conversations)
        .leftJoin(advocates, eq(conversations.advocate_id, advocates.id))
        .where(
          and(
            eq(conversations.id, data.conversation_id),
            or(
              eq(conversations.parent_id, userId),
              eq(advocates.user_id, userId)
            )
          )
        )
        .then(results => results[0]);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Verify attachment ownership if provided
      if (data.attachment_ids && data.attachment_ids.length > 0) {
        const attachmentDocs = await tx.select({
          id: documents.id,
          user_id: documents.user_id,
        })
          .from(documents)
          .where(or(...data.attachment_ids.map(id => eq(documents.id, id))));

        if (attachmentDocs.length !== data.attachment_ids.length) {
          throw new Error('Some attachment documents not found');
        }

        // Check ownership
        const unauthorizedDocs = attachmentDocs.filter(doc => doc.user_id !== userId);
        if (unauthorizedDocs.length > 0) {
          throw new Error('Not authorized to attach some documents');
        }
      }

      // Create the message
      const [message] = await tx.insert(messages)
        .values({
          conversation_id: data.conversation_id,
          sender_id: userId,
          content: data.content || null,
          attachment_count: data.attachment_ids?.length || 0,
        })
        .returning();

      // Link attachments to message if provided
      if (data.attachment_ids && data.attachment_ids.length > 0) {
        await tx.insert(message_attachments)
          .values(
            data.attachment_ids.map(documentId => ({
              message_id: message.id,
              document_id: documentId,
            }))
          );
      }

      // Update conversation's last_message_at
      await tx.update(conversations)
        .set({ 
          last_message_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(conversations.id, data.conversation_id));

      return message;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  });

  try {
    res.status(201).json({ message: transaction });
  } catch (error) {
    console.error('Error sending message:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      if (error.message.includes('Conversation not found')) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      if (error.message.includes('not authorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messaging/download/:filePath - Download file from object storage (legacy)
router.get('/download/:filePath', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const filePath = decodeURIComponent(req.params.filePath);

    // Check if this is a new object storage path
    if (filePath.startsWith('/objects/')) {
      // Redirect to the objects handler
      const objectId = filePath.slice(9); // Remove '/objects/' prefix
      const objectsPath = `/api/messaging/objects/${objectId}`;
      
      if (isMobileRequest(req)) {
        // For mobile apps: return JSON with redirect path
        return res.json({ redirectTo: objectsPath });
      }
      
      // For web: use HTTP redirect
      return res.redirect(objectsPath);
    }

    // Get document record to verify access
    const document = await db.select({
      id: documents.id,
      user_id: documents.user_id,
      file_name: documents.file_name,
      file_type: documents.file_type,
      file_path: documents.file_path
    })
      .from(documents)
      .where(eq(documents.file_path, filePath))
      .then(results => results[0]);

    if (!document) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user has access (they uploaded it or are part of the conversation)
    const hasAccess = document.user_id === userId || await checkMessageAccess(document.id, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get file from storage
    const fileData = await getFileFromStorage(filePath);
    if (!fileData) {
      return res.status(404).json({ error: 'File not found in storage' });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': fileData.contentType,
      'Content-Disposition': `attachment; filename="${fileData.fileName}"`,
      'Content-Length': fileData.buffer.length.toString()
    });

    res.send(fileData.buffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Add route to serve /objects/ files - this handles the new object storage paths
router.get('/objects/:objectId', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const objectId = req.params.objectId;
    const objectPath = `/objects/${objectId}`;

    // Get document record to verify access and get metadata
    const document = await db.select({
      id: documents.id,
      user_id: documents.user_id,
      file_name: documents.file_name,
      file_type: documents.file_type,
      file_path: documents.file_path
    })
      .from(documents)
      .where(eq(documents.file_path, objectPath))
      .then(results => results[0]);

    if (!document) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user has access (they uploaded it or are part of the conversation)
    const hasAccess = document.user_id === userId || await checkMessageAccess(document.id, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Use the new ObjectStorageService to get and serve the file
    const { ObjectStorageService, ObjectNotFoundError } = await import('../objectStorage');
    const objectStorageService = new ObjectStorageService();
    
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Error accessing object storage file:', error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: 'File not found in storage' });
      }
      return res.status(500).json({ error: 'Failed to access file' });
    }
  } catch (error) {
    console.error('Error downloading file from objects:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Helper function to check if user has access to a message attachment
async function checkMessageAccess(documentId: string, userId: string): Promise<boolean> {
  try {
    const messageAccess = await db.select({
      conversation: conversations,
      advocate: advocates
    })
      .from(message_attachments)
      .leftJoin(messages, eq(message_attachments.message_id, messages.id))
      .leftJoin(conversations, eq(messages.conversation_id, conversations.id))
      .leftJoin(advocates, eq(conversations.advocate_id, advocates.id))
      .where(
        and(
          eq(message_attachments.document_id, documentId),
          or(
            eq(conversations.parent_id, userId),
            eq(advocates.user_id, userId)
          )
        )
      )
      .then(results => results[0]);

    return !!messageAccess;
  } catch (error) {
    console.error('Error checking message access:', error);
    return false;
  }
}

// POST /api/messaging/conversations/:id/mark-read - Mark all messages in conversation as read
router.post('/conversations/:id/mark-read', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;

    // Verify user has access to this conversation
    const conversation = await db.select({
      conversation: conversations,
      advocate: advocates,
    })
      .from(conversations)
      .leftJoin(advocates, eq(conversations.advocate_id, advocates.id))
      .where(
        and(
          eq(conversations.id, id),
          or(
            eq(conversations.parent_id, userId),
            eq(advocates.user_id, userId)
          )
        )
      )
      .then(results => results[0]);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark all unread messages from other party as read
    await db.update(messages)
      .set({ read_at: new Date() })
      .where(and(
        eq(messages.conversation_id, id),
        ne(messages.sender_id, userId),
        isNull(messages.read_at)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// GET /api/messaging/proposal-contacts - Get incoming proposals as potential contacts for advocates
router.get('/proposal-contacts', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    console.log('Fetching proposal contacts for user:', userId);
    
    // Get advocate record for current user
    const advocate = await db.select({
      id: advocates.id,
      user_id: advocates.user_id,
      full_name: advocates.full_name
    }).from(advocates)
      .where(eq(advocates.user_id, userId))
      .then(results => results[0]);
    
    console.log('Found advocate:', advocate ? { id: advocate.id, user_id: advocate.user_id } : 'none');
    
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found' });
    }
    
    // Get incoming proposals that could become messaging contacts
    const proposalContacts = await db.select({
      proposal: match_proposals,
      student: students,
      parent: users
    })
    .from(match_proposals)
    .leftJoin(students, eq(match_proposals.student_id, students.id))
    .leftJoin(users, eq(students.user_id, users.id))
    .where(
      and(
        eq(match_proposals.advocate_id, advocate.id),
        or(
          eq(match_proposals.status, 'pending'),
          eq(match_proposals.status, 'accepted')
        )
      )
    )
    .orderBy(desc(match_proposals.created_at));

    // Check if conversations already exist for each proposal
    const contactsWithConversationStatus = await Promise.all(
      proposalContacts.map(async ({ proposal, student, parent }) => {
        const existingConversation = await db.select({
          id: conversations.id,
          advocate_id: conversations.advocate_id,
          parent_id: conversations.parent_id,
          student_id: conversations.student_id,
          status: conversations.status
        })
          .from(conversations)
          .where(and(
            eq(conversations.advocate_id, advocate.id),
            eq(conversations.parent_id, proposal.parent_id),
            eq(conversations.student_id, proposal.student_id)
          ))
          .then(results => results[0]);

        return {
          proposal,
          student,
          parent,
          hasConversation: !!existingConversation,
          conversationId: existingConversation?.id,
          contactType: proposal.status === 'pending' ? 'can_message' : 'potential', // Allow messaging for pending
          canStartConversation: true // Always allow starting conversations from proposals
        };
      })
    );

    res.json({ contacts: contactsWithConversationStatus });
  } catch (error) {
    console.error('Error fetching proposal contacts:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch proposal contacts' });
  }
});

// Additional validation schemas for conversation management
const labelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex code"),
  description: z.string().optional()
});

const updateConversationStatusSchema = z.object({
  archived: z.boolean().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  status: z.enum(['active', 'archived', 'closed']).optional()
});

const assignLabelsSchema = z.object({
  label_ids: z.array(z.string())
});

// CONVERSATION MANAGEMENT ENDPOINTS

// POST /api/messaging/labels - Create a new conversation label
router.post('/labels', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const data = labelSchema.parse(req.body);
    
    const [label] = await db.insert(conversation_labels)
      .values({
        ...data,
        user_id: userId
      })
      .returning();
    
    res.status(201).json({ label });
  } catch (error) {
    console.error('Error creating label:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to create label' });
  }
});

// GET /api/messaging/labels - Get user's conversation labels
router.get('/labels', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    
    const labels = await db.select({
      id: conversation_labels.id,
      name: conversation_labels.name,
      color: conversation_labels.color,
      description: conversation_labels.description,
      is_default: conversation_labels.is_default,
      created_at: conversation_labels.created_at
    })
    .from(conversation_labels)
    .where(or(
      eq(conversation_labels.user_id, userId),
      eq(conversation_labels.is_default, true)
    ))
    .orderBy(conversation_labels.name);
    
    res.json({ labels });
  } catch (error) {
    console.error('Error fetching labels:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

// PUT /api/messaging/labels/:id - Update a conversation label
router.put('/labels/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const labelId = req.params.id;
    const data = labelSchema.partial().parse(req.body);
    
    // Verify ownership
    const existingLabel = await db.select({
      id: conversation_labels.id,
      user_id: conversation_labels.user_id,
      is_default: conversation_labels.is_default
    })
    .from(conversation_labels)
    .where(eq(conversation_labels.id, labelId))
    .then(results => results[0]);
    
    if (!existingLabel) {
      return res.status(404).json({ error: 'Label not found' });
    }
    
    if (existingLabel.is_default) {
      return res.status(403).json({ error: 'Cannot modify default labels' });
    }
    
    if (existingLabel.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this label' });
    }
    
    const [updatedLabel] = await db.update(conversation_labels)
      .set(data)
      .where(eq(conversation_labels.id, labelId))
      .returning();
    
    res.json({ label: updatedLabel });
  } catch (error) {
    console.error('Error updating label:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to update label' });
  }
});

// DELETE /api/messaging/labels/:id - Delete a conversation label
router.delete('/labels/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const labelId = req.params.id;
    
    // Verify ownership
    const existingLabel = await db.select({
      id: conversation_labels.id,
      user_id: conversation_labels.user_id,
      is_default: conversation_labels.is_default
    })
    .from(conversation_labels)
    .where(eq(conversation_labels.id, labelId))
    .then(results => results[0]);
    
    if (!existingLabel) {
      return res.status(404).json({ error: 'Label not found' });
    }
    
    if (existingLabel.is_default) {
      return res.status(403).json({ error: 'Cannot delete default labels' });
    }
    
    if (existingLabel.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this label' });
    }
    
    // Delete all label assignments first (cascade should handle this, but being explicit)
    await db.delete(conversation_label_assignments)
      .where(eq(conversation_label_assignments.label_id, labelId));
    
    // Delete the label
    await db.delete(conversation_labels)
      .where(eq(conversation_labels.id, labelId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting label:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to delete label' });
  }
});

// PATCH /api/messaging/conversations/:id - Update conversation status (archive, priority, etc.)
router.patch('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const conversationId = req.params.id;
    const data = updateConversationStatusSchema.parse(req.body);
    
    // Verify user has access to this conversation
    const conversation = await db.select({
      id: conversations.id,
      parent_id: conversations.parent_id,
      advocate_id: conversations.advocate_id
    })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .then(results => results[0]);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is either the parent or owns the advocate profile
    let hasAccess = conversation.parent_id === userId;
    
    if (!hasAccess) {
      const advocate = await db.select({
        id: advocates.id,
        user_id: advocates.user_id
      })
      .from(advocates)
      .where(and(
        eq(advocates.id, conversation.advocate_id),
        eq(advocates.user_id, userId)
      ))
      .then(results => results[0]);
      
      hasAccess = !!advocate;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to modify this conversation' });
    }
    
    const [updatedConversation] = await db.update(conversations)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(conversations.id, conversationId))
      .returning();
    
    res.json({ conversation: updatedConversation });
  } catch (error) {
    console.error('Error updating conversation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// POST /api/messaging/conversations/:id/labels - Assign labels to a conversation
router.post('/conversations/:id/labels', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const conversationId = req.params.id;
    const { label_ids } = assignLabelsSchema.parse(req.body);
    
    // Verify user has access to this conversation (same logic as above)
    const conversation = await db.select({
      id: conversations.id,
      parent_id: conversations.parent_id,
      advocate_id: conversations.advocate_id
    })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .then(results => results[0]);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    let hasAccess = conversation.parent_id === userId;
    
    if (!hasAccess) {
      const advocate = await db.select({
        id: advocates.id,
        user_id: advocates.user_id
      })
      .from(advocates)
      .where(and(
        eq(advocates.id, conversation.advocate_id),
        eq(advocates.user_id, userId)
      ))
      .then(results => results[0]);
      
      hasAccess = !!advocate;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to modify this conversation' });
    }
    
    // Remove existing label assignments
    await db.delete(conversation_label_assignments)
      .where(eq(conversation_label_assignments.conversation_id, conversationId));
    
    // Add new label assignments
    if (label_ids.length > 0) {
      const assignments = label_ids.map(labelId => ({
        conversation_id: conversationId,
        label_id: labelId,
        assigned_by: userId
      }));
      
      await db.insert(conversation_label_assignments)
        .values(assignments);
    }
    
    res.json({ success: true, assigned_labels: label_ids.length });
  } catch (error) {
    console.error('Error assigning labels:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to assign labels' });
  }
});

// GET /api/messaging/conversations/:id/labels - Get labels for a conversation
router.get('/conversations/:id/labels', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const conversationId = req.params.id;
    
    // Get labels assigned to this conversation
    const assignedLabels = await db.select({
      label: conversation_labels,
      assignment: conversation_label_assignments
    })
    .from(conversation_label_assignments)
    .leftJoin(conversation_labels, eq(conversation_label_assignments.label_id, conversation_labels.id))
    .where(eq(conversation_label_assignments.conversation_id, conversationId));
    
    const labels = assignedLabels.map(({ label }) => label);
    
    res.json({ labels });
  } catch (error) {
    console.error('Error fetching conversation labels:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch conversation labels' });
  }
});

export default router;