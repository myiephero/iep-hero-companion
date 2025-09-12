import express from 'express';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// Production auth check - no mock users
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    // Check for authenticated user
    const user = req.user;
    
    if (!user || !user.claims || !user.claims.sub) {
      console.log('❌ Authentication required - no valid user found');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('✅ PRODUCTION: Authenticated user:', user.claims.sub);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const router = express.Router();

// Production endpoint for getting conversations
router.get('/conversations', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    console.log('✅ PRODUCTION: Getting conversations for user:', userId);
    
    // Get user's profile to determine role
    const [userProfile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.user_id, userId))
      .limit(1);
    
    if (!userProfile) {
      console.log('❌ User profile not found for:', userId);
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    let conversations: any[] = [];
    
    if (userProfile.role === 'advocate') {
      // Advocate: Get conversations where they are the advocate
      const [advocate] = await db
        .select({ id: schema.advocates.id })
        .from(schema.advocates)
        .where(eq(schema.advocates.user_id, userId))
        .limit(1);
      
      if (advocate) {
        conversations = await db
          .select({
            id: schema.conversations.id,
            title: schema.conversations.title,
            status: schema.conversations.status,
            lastMessageAt: schema.conversations.last_message_at,
            createdAt: schema.conversations.created_at,
            parentId: schema.conversations.parent_id,
            studentId: schema.conversations.student_id,
            // Include parent name information
            parentFirstName: schema.users.firstName,
            parentLastName: schema.users.lastName,
            parentEmail: schema.users.email,
          })
          .from(schema.conversations)
          .leftJoin(schema.users, eq(schema.conversations.parent_id, schema.users.id))
          .where(eq(schema.conversations.advocate_id, advocate.id))
          .orderBy(desc(schema.conversations.last_message_at));
      }
    } else {
      // Parent: Get conversations where they are the parent
      conversations = await db
        .select({
          id: schema.conversations.id,
          title: schema.conversations.title,
          status: schema.conversations.status,
          lastMessageAt: schema.conversations.last_message_at,
          createdAt: schema.conversations.created_at,
          parentId: schema.conversations.parent_id,
          studentId: schema.conversations.student_id,
          // Include parent name information (self in this case)
          parentFirstName: schema.users.firstName,
          parentLastName: schema.users.lastName,
          parentEmail: schema.users.email,
        })
        .from(schema.conversations)
        .leftJoin(schema.users, eq(schema.conversations.parent_id, schema.users.id))
        .where(eq(schema.conversations.parent_id, userId))
        .orderBy(desc(schema.conversations.last_message_at));
    }
    
    console.log(`✅ PRODUCTION: Found ${conversations.length} conversations for ${userProfile.role}`);
    res.json({ conversations });
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.get('/conversations/:conversationId/messages', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const conversationId = req.params.conversationId;
    console.log('✅ PRODUCTION: Getting messages for conversation:', conversationId, 'user:', userId);
    
    // First verify user has access to this conversation
    const [conversation] = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, conversationId))
      .limit(1);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is either the parent or advocate in this conversation
    const [advocate] = await db
      .select({ id: schema.advocates.id })
      .from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .limit(1);
    
    const isAuthorized = 
      conversation.parent_id === userId || 
      (advocate && conversation.advocate_id === advocate.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }
    
    const messages = await db
      .select({
        id: schema.messages.id,
        conversation_id: schema.messages.conversation_id,
        sender_id: schema.messages.sender_id,
        content: schema.messages.content,
        created_at: schema.messages.created_at,
      })
      .from(schema.messages)
      .where(eq(schema.messages.conversation_id, conversationId))
      .orderBy(schema.messages.created_at);

    // Add sender_type by looking up user role
    const messagesWithSenderType = await Promise.all(
      messages.map(async (message) => {
        const [sender] = await db
          .select({ role: schema.profiles.role })
          .from(schema.profiles) 
          .where(eq(schema.profiles.user_id, message.sender_id))
          .limit(1);
        
        return {
          ...message,
          sender_type: sender?.role || 'unknown',
          message_type: 'text'
        };
      })
    );

    console.log(`✅ PRODUCTION: Found ${messagesWithSenderType.length} messages`);
    res.json({ messages: messagesWithSenderType });
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/conversations/:conversationId/messages', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const conversationId = req.params.conversationId;
    const { content } = req.body;
    
    console.log('✅ PRODUCTION: Sending message to conversation:', conversationId, 'from user:', userId);
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Verify user has access to this conversation (same logic as get messages)
    const [conversation] = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, conversationId))
      .limit(1);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const [advocate] = await db
      .select({ id: schema.advocates.id })
      .from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .limit(1);
    
    const isAuthorized = 
      conversation.parent_id === userId || 
      (advocate && conversation.advocate_id === advocate.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to send messages to this conversation' });
    }
    
    // Insert the message
    const [newMessage] = await db
      .insert(schema.messages)
      .values({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        created_at: new Date()
      })
      .returning();
    
    // Update conversation last_message_at
    await db
      .update(schema.conversations)
      .set({ last_message_at: new Date() })
      .where(eq(schema.conversations.id, conversationId));
    
    // Get sender type
    const [userProfile] = await db
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.user_id, userId))
      .limit(1);
    
    const responseMessage = {
      ...newMessage,
      sender_type: userProfile?.role || 'unknown',
      message_type: 'text'
    };
    
    console.log('✅ PRODUCTION: Message sent successfully');
    res.json({ 
      success: true, 
      message: responseMessage
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});


export default router;