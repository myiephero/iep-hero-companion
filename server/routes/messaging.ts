import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { conversations, messages, advocates, students } from '../../shared/schema';
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
    
    // Verify the user is either the parent or advocate in this conversation
    if (userId !== data.parent_id && userId !== data.advocate_id) {
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
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /api/messaging/conversations - Get user's conversations
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    
    // Get conversations where user is either parent or advocate
    const userConversations = await db.select({
      conversation: conversations,
      advocate: advocates,
      student: students,
    })
    .from(conversations)
    .leftJoin(advocates, eq(conversations.advocate_id, advocates.id))
    .leftJoin(students, eq(conversations.student_id, students.id))
    .where(
      or(
        eq(conversations.parent_id, userId),
        eq(conversations.advocate_id, userId)
      )
    )
    .orderBy(desc(conversations.last_message_at));

    // Get the latest message for each conversation
    const conversationsWithMessages = await Promise.all(
      userConversations.map(async ({ conversation, advocate, student }) => {
        const latestMessage = await db.select()
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
          advocate,
          student,
          latest_message: latestMessage,
          unread_count: unreadCount,
        };
      })
    );

    res.json({ conversations: conversationsWithMessages });
  } catch (error) {
    console.error('Error fetching conversations:', error);
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
          eq(conversations.advocate_id, userId)
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
      advocate: conversation.advocate,
      student: conversation.student,
      messages: conversationMessages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// POST /api/messaging/messages - Send a message
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const data = sendMessageSchema.parse(req.body);

    // Verify user has access to this conversation
    const conversation = await db.select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, data.conversation_id),
          or(
            eq(conversations.parent_id, userId),
            eq(conversations.advocate_id, userId)
          )
        )
      )
      .then(results => results[0]);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Determine sender type
    const senderType = userId === conversation.parent_id ? 'parent' : 'advocate';

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
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /api/messaging/conversations/:id/mark-read - Mark all messages in conversation as read
router.post('/conversations/:id/mark-read', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;

    // Verify user has access to this conversation
    const conversation = await db.select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, id),
          or(
            eq(conversations.parent_id, userId),
            eq(conversations.advocate_id, userId)
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
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router;