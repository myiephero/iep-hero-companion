import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { conversations, messages, advocates, students, match_proposals, users } from '../../shared/schema';
import { eq, and, or, desc, asc, ne, isNull } from 'drizzle-orm';
import { getUserId } from '../utils';

const router = Router();

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
  content: z.string().min(1),
  message_type: z.enum(['text', 'file', 'system']).default('text'),
  file_url: z.string().optional(),
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
      const advocate = await db.select().from(advocates)
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
    const existingConversation = await db.select().from(conversations)
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
      const advocateResults = await db.select().from(advocates)
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
    })
    .from(conversations)
    .leftJoin(advocates, eq(conversations.advocate_id, advocates.id))
    .leftJoin(students, eq(conversations.student_id, students.id))
    .where(whereClause)
    .orderBy(desc(conversations.last_message_at));
    
    console.log('Found conversations:', userConversations.length);

    // Get the latest message for each conversation
    const conversationsWithMessages = await Promise.all(
      userConversations.map(async ({ conversation, advocate, student }) => {
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

    // Get all messages for this conversation
    const conversationMessages = await db.select()
      .from(messages)
      .where(eq(messages.conversation_id, id))
      .orderBy(asc(messages.created_at));

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
      messages: conversationMessages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// POST /api/messaging/messages - Send a message
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const data = sendMessageSchema.parse(req.body);

    // Verify user has access to this conversation
    const conversation = await db.select({
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
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Determine sender type
    const senderType = userId === conversation.conversation.parent_id ? 'parent' : 'advocate';

    // Create the message
    const [message] = await db.insert(messages)
      .values({
        conversation_id: data.conversation_id,
        sender_id: userId,
        sender_type: senderType,
        content: data.content,
        message_type: data.message_type,
        file_url: data.file_url,
      })
      .returning();

    // Update conversation's last_message_at
    await db.update(conversations)
      .set({ 
        last_message_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(conversations.id, data.conversation_id));

    res.status(201).json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
});

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
    const advocate = await db.select().from(advocates)
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
        const existingConversation = await db.select()
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