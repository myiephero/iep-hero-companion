import express from 'express';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
// Simple auth check that works with current setup
const simpleAuth = async (req: any, res: any, next: any) => {
  console.log('🔍 Simple Auth Check - Headers:', req.headers.authorization ? 'Token present' : 'No token');
  console.log('🔍 Simple Auth Check - Session:', !!req.session);
  console.log('🔍 Simple Auth Check - User:', !!req.user);
  
  // For testing, let's create a mock user with the right structure
  if (!req.user) {
    req.user = {
      claims: {
        sub: 'test-advocate-id'
      },
      email: 'wxwinn@gmail.com', 
      role: 'advocate'
    };
    console.log('🔍 Simple Auth Check - Mock user created for testing');
  }
  
  next();
};

const router = express.Router();

// Test endpoints without auth (for demo purposes)
router.get('/test-conversations', async (req: any, res) => {
  console.log('🔍 TEST: No-auth conversations endpoint hit');
  
  const sampleConversations = [
    {
      id: 'conv-1',
      title: 'IEP Meeting for Sarah Johnson',
      status: 'active',
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 24*60*60*1000).toISOString(),
      parentId: 'parent-123',
      advocateId: 'test-advocate-id',
      studentId: 'student-456'
    },
    {
      id: 'conv-2', 
      title: '504 Plan Discussion - Mike Thompson',
      status: 'active',
      lastMessageAt: new Date(Date.now() - 2*60*60*1000).toISOString(),
      createdAt: new Date(Date.now() - 48*60*60*1000).toISOString(),
      parentId: 'parent-789',
      advocateId: 'test-advocate-id',
      studentId: 'student-101'
    }
  ];
  
  res.json({ conversations: sampleConversations });
});

router.get('/test-conversations/:conversationId/messages', async (req: any, res) => {
  console.log('🔍 TEST: No-auth messages endpoint hit for conversation:', req.params.conversationId);
  
  const sampleMessages = [
    {
      id: 'msg-1',
      conversation_id: req.params.conversationId,
      sender_id: 'parent-123',
      sender_type: 'parent',
      content: 'Hi, I have some concerns about my daughter\'s IEP goals. Can we discuss the math accommodations?',
      message_type: 'text',
      created_at: new Date(Date.now() - 4*60*60*1000).toISOString()
    },
    {
      id: 'msg-2',
      conversation_id: req.params.conversationId,
      sender_id: 'test-advocate-id',
      sender_type: 'advocate', 
      content: 'Of course! I\'d be happy to help review the math accommodations. Can you share what specific areas you\'re concerned about?',
      message_type: 'text',
      created_at: new Date(Date.now() - 3*60*60*1000).toISOString()
    },
    {
      id: 'msg-3',
      conversation_id: req.params.conversationId,
      sender_id: 'parent-123',
      sender_type: 'parent',
      content: 'The current goals seem too broad. She needs more specific targets for word problems and time management during tests.',
      message_type: 'text',
      created_at: new Date(Date.now() - 2*60*60*1000).toISOString()
    }
  ];
  
  res.json({ messages: sampleMessages });
});

router.post('/test-conversations/:conversationId/messages', async (req: any, res) => {
  console.log('🔍 TEST: No-auth send message endpoint hit');
  
  // Just return success for demo
  res.json({ 
    success: true, 
    message: {
      id: 'msg-' + Date.now(),
      conversation_id: req.params.conversationId,
      sender_id: 'test-advocate-id',
      sender_type: 'advocate',
      content: req.body.content,
      message_type: 'text',
      created_at: new Date().toISOString()
    }
  });
});

// Get conversations for current user
router.get('/conversations', simpleAuth, async (req: any, res) => {
  try {
    console.log('🔍 SIMPLE TEST: Conversations endpoint hit');
    
    // For now, return sample data to test the interface
    const sampleConversations = [
      {
        id: 'conv-1',
        title: 'IEP Meeting for Sarah Johnson',
        status: 'active',
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 24*60*60*1000).toISOString(),
        parentId: 'parent-123',
        advocateId: 'test-advocate-id',
        studentId: 'student-456'
      },
      {
        id: 'conv-2', 
        title: '504 Plan Discussion - Mike Thompson',
        status: 'active',
        lastMessageAt: new Date(Date.now() - 2*60*60*1000).toISOString(),
        createdAt: new Date(Date.now() - 48*60*60*1000).toISOString(),
        parentId: 'parent-789',
        advocateId: 'test-advocate-id',
        studentId: 'student-101'
      }
    ];
    
    return res.json({ conversations: sampleConversations });

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
router.get('/conversations/:conversationId/messages', simpleAuth, async (req: any, res) => {
  try {
    console.log('🔍 SIMPLE TEST: Messages endpoint hit for conversation:', req.params.conversationId);
    
    // Return sample messages for testing
    const sampleMessages = [
      {
        id: 'msg-1',
        conversation_id: req.params.conversationId,
        sender_id: 'parent-123',
        sender_type: 'parent',
        content: 'Hi, I have some concerns about my daughter\'s IEP goals. Can we discuss the math accommodations?',
        message_type: 'text',
        created_at: new Date(Date.now() - 4*60*60*1000).toISOString()
      },
      {
        id: 'msg-2',
        conversation_id: req.params.conversationId,
        sender_id: 'test-advocate-id',
        sender_type: 'advocate', 
        content: 'Of course! I\'d be happy to help review the math accommodations. Can you share what specific areas you\'re concerned about?',
        message_type: 'text',
        created_at: new Date(Date.now() - 3*60*60*1000).toISOString()
      },
      {
        id: 'msg-3',
        conversation_id: req.params.conversationId,
        sender_id: 'parent-123',
        sender_type: 'parent',
        content: 'The current goals seem too broad. She needs more specific targets for word problems and time management during tests.',
        message_type: 'text',
        created_at: new Date(Date.now() - 2*60*60*1000).toISOString()
      }
    ];
    
    return res.json({ messages: sampleMessages });

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
router.post('/conversations/:conversationId/messages', simpleAuth, async (req: any, res) => {
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
router.post('/conversations', simpleAuth, async (req: any, res) => {
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