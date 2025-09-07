import express from 'express';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// Get conversations for current user
router.get('/conversations', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user's role to determine query
    const [profile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.user_id, userId))
      .limit(1);

    let conversations;
    
    if (profile?.role === 'advocate') {
      // Advocate sees conversations where they are the advocate
      conversations = await db
        .select({
          id: schema.conversations.id,
          title: schema.conversations.title,
          status: schema.conversations.status,
          lastMessageAt: schema.conversations.last_message_at,
          createdAt: schema.conversations.created_at,
          // Include parent info
          parentId: schema.conversations.parent_id,
          studentId: schema.conversations.student_id,
        })
        .from(schema.conversations)
        .where(eq(schema.conversations.advocate_id, userId))
        .orderBy(desc(schema.conversations.last_message_at));
    } else {
      // Parent sees conversations where they are the parent
      conversations = await db
        .select({
          id: schema.conversations.id,
          title: schema.conversations.title,
          status: schema.conversations.status,
          lastMessageAt: schema.conversations.last_message_at,
          createdAt: schema.conversations.created_at,
          // Include advocate info
          advocateId: schema.conversations.advocate_id,
          studentId: schema.conversations.student_id,
        })
        .from(schema.conversations)
        .where(eq(schema.conversations.parent_id, userId))
        .orderBy(desc(schema.conversations.last_message_at));
    }

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user has access to this conversation
    const [conversation] = await db
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.id, conversationId),
          // User must be either the advocate or parent
          // Using OR logic manually since Drizzle doesn't have direct OR
        )
      )
      .limit(1);

    if (!conversation || 
        (conversation.advocate_id !== userId && conversation.parent_id !== userId)) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Get messages for this conversation
    const messages = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversation_id, conversationId))
      .orderBy(schema.messages.created_at);

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/conversations/:conversationId/messages', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user has access to this conversation and get user role
    const [conversation] = await db
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.id, conversationId),
        )
      )
      .limit(1);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if user is authorized
    if (conversation.advocate_id !== userId && conversation.parent_id !== userId) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Determine sender type
    const senderType = conversation.advocate_id === userId ? 'advocate' : 'parent';

    // Insert the new message
    const [newMessage] = await db
      .insert(schema.messages)
      .values({
        conversation_id: conversationId,
        sender_id: userId,
        sender_type: senderType,
        content: content.trim(),
        message_type: 'text',
      })
      .returning();

    // Update conversation's last message time
    await db
      .update(schema.conversations)
      .set({ 
        last_message_at: new Date(),
        updated_at: new Date()
      })
      .where(eq(schema.conversations.id, conversationId));

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Create a new conversation
router.post('/conversations', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { parentId, advocateId, studentId, title } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate required fields
    if (!parentId || !advocateId) {
      return res.status(400).json({ error: 'Parent ID and Advocate ID are required' });
    }

    // User must be either the parent or advocate in this conversation
    if (userId !== parentId && userId !== advocateId) {
      return res.status(403).json({ error: 'You can only create conversations you participate in' });
    }

    // Check if conversation already exists
    const [existingConversation] = await db
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.parent_id, parentId),
          eq(schema.conversations.advocate_id, advocateId),
          studentId ? eq(schema.conversations.student_id, studentId) : sql`student_id IS NULL`
        )
      )
      .limit(1);

    if (existingConversation) {
      return res.status(200).json({ conversation: existingConversation });
    }

    // Create new conversation
    const [newConversation] = await db
      .insert(schema.conversations)
      .values({
        parent_id: parentId,
        advocate_id: advocateId,
        student_id: studentId || null,
        title: title || 'New Conversation',
        status: 'active',
        last_message_at: new Date(),
      })
      .returning();

    res.status(201).json({ conversation: newConversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

export default router;