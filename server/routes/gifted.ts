import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase clients
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// For user operations (with RLS)
const createUserSupabase = (authToken: string) => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  });
  return supabase;
};

// For admin operations (bypass RLS when needed)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Middleware to extract auth token
const requireAuth = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  req.authToken = authHeader.substring(7);
  req.supabase = createUserSupabase(req.authToken);
  next();
};

// Type definitions
interface ProfileInput {
  student_id: string;
  domain: string;
  strengths: Array<{
    label: string;
    evidence?: string;
    level?: string;
  }>;
  notes?: string;
}

interface GoalInput {
  student_id: string;
  title: string;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  target_date?: string; // YYYY-MM-DD
  resources_hint?: string;
  progress_note?: string;
}

interface ResourceInput {
  student_id: string;
  kind: 'link' | 'file';
  title: string;
  url?: string;
  storage_path?: string;
}

interface CommentInput {
  goal_id: string;
  text: string;
}

// Validation helpers
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// === GIFTED PROFILES ROUTES ===

// GET /api/gifted/profiles?studentId=uuid
router.get('/profiles', requireAuth, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    
    if (!studentId || !isValidUUID(studentId as string)) {
      return res.status(400).json({ error: 'Valid studentId is required' });
    }

    const { data, error } = await req.supabase
      .from('gifted_profiles')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return res.status(500).json({ error: 'Failed to fetch profiles' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Profiles route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gifted/profiles
router.post('/profiles', requireAuth, async (req: Request, res: Response) => {
  try {
    const profileData: ProfileInput = req.body;
    
    if (!profileData.student_id || !isValidUUID(profileData.student_id)) {
      return res.status(400).json({ error: 'Valid student_id is required' });
    }
    
    if (!profileData.domain || !profileData.strengths || !Array.isArray(profileData.strengths)) {
      return res.status(400).json({ error: 'domain and strengths array are required' });
    }

    // Get current user ID
    const { data: { user }, error: userError } = await req.supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const insertData = {
      student_id: profileData.student_id,
      owner_id: user.id,
      domain: profileData.domain,
      strengths: profileData.strengths,
      notes: profileData.notes || null,
    };

    const { data, error } = await req.supabase
      .from('gifted_profiles')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return res.status(500).json({ error: 'Failed to create profile' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === GIFTED GOALS ROUTES ===

// GET /api/gifted/goals?studentId=uuid
router.get('/goals', requireAuth, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    
    if (!studentId || !isValidUUID(studentId as string)) {
      return res.status(400).json({ error: 'Valid studentId is required' });
    }

    const { data, error } = await req.supabase
      .from('gifted_goals')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return res.status(500).json({ error: 'Failed to fetch goals' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Goals route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gifted/goals
router.post('/goals', requireAuth, async (req: Request, res: Response) => {
  try {
    const goalData: GoalInput = req.body;
    
    if (!goalData.student_id || !isValidUUID(goalData.student_id)) {
      return res.status(400).json({ error: 'Valid student_id is required' });
    }
    
    if (!goalData.title) {
      return res.status(400).json({ error: 'title is required' });
    }

    // Get current user ID
    const { data: { user }, error: userError } = await req.supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const insertData = {
      student_id: goalData.student_id,
      owner_id: user.id,
      title: goalData.title,
      status: goalData.status || 'active',
      target_date: goalData.target_date || null,
      resources_hint: goalData.resources_hint || null,
      progress_note: goalData.progress_note || null,
    };

    const { data, error } = await req.supabase
      .from('gifted_goals')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      return res.status(500).json({ error: 'Failed to create goal' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/gifted/goals/:id
router.patch('/goals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Valid goal ID is required' });
    }

    const updateData = req.body;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await req.supabase
      .from('gifted_goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return res.status(500).json({ error: 'Failed to update goal' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Goal not found or access denied' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === GIFTED RESOURCES ROUTES ===

// GET /api/gifted/resources?studentId=uuid
router.get('/resources', requireAuth, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    
    if (!studentId || !isValidUUID(studentId as string)) {
      return res.status(400).json({ error: 'Valid studentId is required' });
    }

    const { data, error } = await req.supabase
      .from('gifted_resources')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return res.status(500).json({ error: 'Failed to fetch resources' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Resources route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gifted/resources
router.post('/resources', requireAuth, async (req: Request, res: Response) => {
  try {
    const resourceData: ResourceInput = req.body;
    
    if (!resourceData.student_id || !isValidUUID(resourceData.student_id)) {
      return res.status(400).json({ error: 'Valid student_id is required' });
    }
    
    if (!resourceData.kind || !['link', 'file'].includes(resourceData.kind)) {
      return res.status(400).json({ error: 'kind must be "link" or "file"' });
    }
    
    if (!resourceData.title) {
      return res.status(400).json({ error: 'title is required' });
    }

    if (resourceData.kind === 'link' && !resourceData.url) {
      return res.status(400).json({ error: 'url is required for link resources' });
    }

    if (resourceData.kind === 'file' && !resourceData.storage_path) {
      return res.status(400).json({ error: 'storage_path is required for file resources' });
    }

    // Get current user ID
    const { data: { user }, error: userError } = await req.supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const insertData = {
      student_id: resourceData.student_id,
      owner_id: user.id,
      kind: resourceData.kind,
      title: resourceData.title,
      url: resourceData.url || null,
      storage_path: resourceData.storage_path || null,
    };

    const { data, error } = await req.supabase
      .from('gifted_resources')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating resource:', error);
      return res.status(500).json({ error: 'Failed to create resource' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === GIFTED COMMENTS ROUTES ===

// GET /api/gifted/comments?goalId=uuid
router.get('/comments', requireAuth, async (req: Request, res: Response) => {
  try {
    const { goalId } = req.query;
    
    if (!goalId || !isValidUUID(goalId as string)) {
      return res.status(400).json({ error: 'Valid goalId is required' });
    }

    const { data, error } = await req.supabase
      .from('gifted_comments')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          role
        )
      `)
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Comments route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gifted/comments
router.post('/comments', requireAuth, async (req: Request, res: Response) => {
  try {
    const commentData: CommentInput = req.body;
    
    if (!commentData.goal_id || !isValidUUID(commentData.goal_id)) {
      return res.status(400).json({ error: 'Valid goal_id is required' });
    }
    
    if (!commentData.text) {
      return res.status(400).json({ error: 'text is required' });
    }

    // Get current user ID
    const { data: { user }, error: userError } = await req.supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const insertData = {
      goal_id: commentData.goal_id,
      user_id: user.id,
      text: commentData.text,
    };

    const { data, error } = await req.supabase
      .from('gifted_comments')
      .insert(insertData)
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          role
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Failed to create comment' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === HELPER ROUTES ===

// GET /api/gifted/students - Get accessible students for the current user
router.get('/students', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data, error } = await req.supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error);
      return res.status(500).json({ error: 'Failed to fetch students' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Students route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add auth token and supabase to Request interface
declare global {
  namespace Express {
    interface Request {
      authToken?: string;
      supabase?: any;
    }
  }
}

export default router;