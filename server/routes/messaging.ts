import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { db } from '../db';
import { conversations, messages, advocates, students, match_proposals, users, documents, message_attachments } from '../../shared/schema';
import { eq, and, or, desc, asc, ne, isNull } from 'drizzle-orm';
import { getUserId } from '../utils';
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
  advocate_id: z.string(),
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
router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const data = createConversationSchema.parse(req.body);
    
    console.log('Creating conversation:', { userId, data });
    
    // For advocates, we need to check if they own the advocate profile being used
    let authorizedAsAdvocate = false;
    if (data.advocate_id) {
      const advocate = await db.select({
        id: advocates.id,
        user_id: advocates.user_id,
        full_name: advocates.full_name
      }).from(advocates)
        .where(eq(advocates.id, data.advocate_id))
        .then(results => results[0]);
      
      if (advocate && advocate.user_id === userId) {
        authorizedAsAdvocate = true;
      }
    }
    
    // Verify the user is either the parent or owns the advocate profile
    if (userId !== data.parent_id && !authorizedAsAdvocate) {
      console.log('Authorization failed:', { userId, parent_id: data.parent_id, authorizedAsAdvocate });
      return res.status(403).json({ error: 'Not authorized to create this conversation' });
    }

    // Check if conversation already exists between these users
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
      .where(and(
        eq(conversations.advocate_id, data.advocate_id),
        eq(conversations.parent_id, data.parent_id),
        data.student_id ? eq(conversations.student_id, data.student_id) : undefined
      ))
      .then(results => results[0]);

    if (existingConversation) {
      return res.json({ conversation: existingConversation });
    }

    // Create new conversation
    const [conversation] = await db.insert(conversations)
      .values({
        ...data,
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

// GET /api/messaging/conversations - Get user's conversations
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    console.log('Fetching conversations for user:', userId);
    
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
      console.log('Found advocate profile:', advocateProfile?.id);
    } catch (error) {
      console.log('User is not an advocate or error finding advocate profile');
      advocateProfile = null;
    }
    
    // Get conversations where user is either parent or advocate
    let whereClause;
    if (advocateProfile) {
      // For advocates, use their advocate profile ID
      whereClause = or(
        eq(conversations.parent_id, userId),
        eq(conversations.advocate_id, advocateProfile.id)
      );
    } else {
      // For parents, only check parent_id
      whereClause = eq(conversations.parent_id, userId);
    }
    
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
    .where(whereClause)
    .orderBy(desc(conversations.last_message_at));
    
    console.log('Found conversations:', userConversations.length);

    // Get the latest message for each conversation
    const conversationsWithMessages = await Promise.all(
      userConversations.map(async ({ conversation, advocate, student, parent }) => {
        const latestMessage = await db.select({
            id: messages.id,
            conversation_id: messages.conversation_id,
            sender_id: messages.sender_id,
            content: messages.content,
            created_at: messages.created_at,
            read_at: messages.read_at
          })
          .from(messages)
          .where(eq(messages.conversation_id, conversation.id))
          .orderBy(desc(messages.created_at))
          .limit(1)
          .then(results => results[0]);

        const unreadCount = await db.select({ count: messages.id })
          .from(messages)
          .where(and(
            eq(messages.conversation_id, conversation.id),
            ne(messages.sender_id, userId), // Messages not sent by current user
            isNull(messages.read_at) // That haven't been read
          ))
          .then(results => results.length);

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
      })
    );

    res.json({ conversations: conversationsWithMessages });
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
    const uploadedFiles = [];
    
    for (const file of files) {
      try {
        const sanitizedName = sanitizeFileName(file.originalname);
        const filePath = generateSecureFilePath(sanitizedName, userId);
        
        // Upload to object storage
        const uploadResult = await uploadFileToStorage(
          file.buffer,
          filePath,
          file.mimetype
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

// GET /api/messaging/download/:filePath - Download file from object storage
router.get('/download/:filePath', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const filePath = decodeURIComponent(req.params.filePath);

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

export default router;