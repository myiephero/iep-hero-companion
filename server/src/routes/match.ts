import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://mock.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'mock-key'
);

// Initialize OpenAI client (optional)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Matching algorithm weights
const MATCHING_WEIGHTS = {
  tag_overlap: 0.45,
  grade_area_fit: 0.15,
  capacity_available: 0.15,
  language_match: 0.10,
  price_fit: 0.10,
  timezone_compatibility: 0.05
};

// Helper function to get authenticated Supabase client
function getSupabaseClient(authHeader?: string) {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
  }
  return supabase;
}

// Helper function to calculate Jaccard similarity
function calculateJaccardSimilarity(set1: string[], set2: string[]): number {
  if (!set1.length || !set2.length) return 0;
  
  const s1 = new Set(set1);
  const s2 = new Set(set2);
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  
  return intersection.size / union.size;
}

// Helper function to extract tags using OpenAI
async function extractTags(narrative: string): Promise<string[]> {
  if (!narrative || !openai) {
    return [];
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an IEP specialist. Extract relevant tags from student descriptions. 
          Return only a JSON array of lowercase tags from this list: 
          ["autism", "adhd", "speech", "language", "ot", "occupational_therapy", "pt", "physical_therapy", 
          "behavioral", "executive_function", "sensory", "motor_skills", "gifted", "twice_exceptional", 
          "learning_disability", "dyslexia", "communication", "social_skills", "adaptive_behavior", 
          "cognitive", "developmental_delay", "visual_impairment", "hearing_impairment"].
          If no tags match, return an empty array.`
        },
        {
          role: "user", 
          content: narrative
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const tags = JSON.parse(response);
      return Array.isArray(tags) ? tags : [];
    }
  } catch (error) {
    console.error('Error extracting tags:', error);
  }
  
  return [];
}

// Helper function to calculate match score
async function calculateMatchScore(
  student: any, 
  advocate: any, 
  client: ReturnType<typeof createClient>
): Promise<{ score: number; breakdown: any }> {
  const scores: any = {};
  
  // Tag overlap (45%)
  const tagSimilarity = calculateJaccardSimilarity(student.needs || [], advocate.tags || []);
  scores.tag_overlap = tagSimilarity * MATCHING_WEIGHTS.tag_overlap;
  
  // Language match (10%)
  const langSimilarity = calculateJaccardSimilarity(student.languages || [], advocate.languages || []);
  scores.language_match = langSimilarity * MATCHING_WEIGHTS.language_match;
  
  // Grade/area fit (15%) - simplified: assume all advocates can handle all grades
  scores.grade_area_fit = 1.0 * MATCHING_WEIGHTS.grade_area_fit;
  
  // Capacity available (15%)
  const { count: activeProposals } = await client
    .from('match_proposals')
    .select('*', { count: 'exact', head: true })
    .eq('advocate_id', advocate.id)
    .in('status', ['accepted', 'scheduled']);
    
  const capacityRatio = Math.max(0, (advocate.max_caseload - (activeProposals || 0)) / advocate.max_caseload);
  scores.capacity_available = capacityRatio * MATCHING_WEIGHTS.capacity_available;
  
  // Price fit (10%)
  let priceScore = 1.0; // Default good fit
  if (student.budget && advocate.hourly_rate) {
    if (advocate.hourly_rate <= student.budget) {
      priceScore = 1.0;
    } else if (advocate.hourly_rate <= student.budget * 1.2) {
      priceScore = 0.7;
    } else {
      priceScore = 0.3;
    }
  }
  scores.price_fit = priceScore * MATCHING_WEIGHTS.price_fit;
  
  // Timezone compatibility (5%)
  const timezoneScore = student.timezone === advocate.timezone ? 1.0 : 0.5;
  scores.timezone_compatibility = timezoneScore * MATCHING_WEIGHTS.timezone_compatibility;
  
  const totalScore = Object.values(scores).reduce((sum: number, score: any) => sum + score, 0) * 100;
  
  return {
    score: Math.min(100, Math.max(0, totalScore)),
    breakdown: scores
  };
}

// Helper function to create notification
async function createNotification(
  client: ReturnType<typeof createClient>,
  userId: string,
  title: string,
  message: string,
  proposalId?: string
) {
  await client
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      proposal_id: proposalId
    });
}

// GET /api/match - List proposals visible to current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const client = getSupabaseClient(req.headers.authorization);
    
    // Get current user
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user profile to determine role
    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get proposals with related data
    const { data: proposals, error } = await client
      .from('match_proposals')
      .select(`
        *,
        students:student_id (
          id, name, grade, needs, languages, timezone, budget, narrative
        ),
        advocates:advocate_id (
          id, tags, languages, timezone, hourly_rate, bio, experience_years
        ),
        profiles:created_by (
          id, name, email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
      return res.status(500).json({ error: 'Failed to fetch proposals' });
    }

    res.json({ proposals: proposals || [] });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/match/:id/events - Get events for a proposal
router.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = getSupabaseClient(req.headers.authorization);
    
    const { data: events, error } = await client
      .from('match_events')
      .select(`
        *,
        profiles:actor_id (
          id, name, email
        )
      `)
      .eq('proposal_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    res.json({ events: events || [] });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/propose - Create match proposals
router.post('/propose', async (req: Request, res: Response) => {
  try {
    const { student_id, advocate_ids, reason = {} } = req.body;
    const client = getSupabaseClient(req.headers.authorization);
    
    // Get current user
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!student_id || !advocate_ids || !Array.isArray(advocate_ids)) {
      return res.status(400).json({ error: 'student_id and advocate_ids array required' });
    }

    // Get student details
    const { data: student, error: studentError } = await client
      .from('students')
      .select('*')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Extract tags from narrative if available
    let extractedTags: string[] = [];
    if (student.narrative && openai) {
      extractedTags = await extractTags(student.narrative);
      
      // Merge extracted tags with existing needs
      const allTags = [...new Set([...student.needs, ...extractedTags])];
      
      // Update student with extracted tags
      if (extractedTags.length > 0) {
        await client
          .from('students')
          .update({ needs: allTags })
          .eq('id', student_id);
        
        student.needs = allTags; // Update local copy for scoring
      }
    }

    const createdProposals = [];

    // Create proposals for each advocate
    for (const advocateId of advocate_ids) {
      // Get advocate details
      const { data: advocate, error: advocateError } = await client
        .from('advocate_profiles')
        .select('*')
        .eq('id', advocateId)
        .single();

      if (advocateError || !advocate) {
        continue; // Skip if advocate not found
      }

      // Calculate match score
      const { score, breakdown } = await calculateMatchScore(student, advocate, client);

      // Create proposal
      const { data: proposal, error: proposalError } = await client
        .from('match_proposals')
        .insert({
          student_id,
          advocate_id: advocateId,
          score: parseFloat(score.toFixed(2)),
          reason: { ...reason, score_breakdown: breakdown, extracted_tags: extractedTags },
          created_by: user.id
        })
        .select()
        .single();

      if (proposalError) {
        console.error('Error creating proposal:', proposalError);
        continue;
      }

      // Create event
      await client
        .from('match_events')
        .insert({
          proposal_id: proposal.id,
          event_type: 'proposal_created',
          actor_id: user.id,
          details: { score, extracted_tags: extractedTags }
        });

      // Create notification for advocate
      await createNotification(
        client,
        advocateId,
        'New Matching Opportunity',
        `You have a new student match proposal for ${student.name} (Grade ${student.grade})`,
        proposal.id
      );

      createdProposals.push(proposal);
    }

    res.json({ 
      created: createdProposals.length, 
      proposals: createdProposals,
      extracted_tags: extractedTags 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/:id/intro - Request/schedule intro call
router.post('/:id/intro', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { when_ts, channel = 'zoom', link, notes } = req.body;
    const client = getSupabaseClient(req.headers.authorization);
    
    // Get current user
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get proposal
    const { data: proposal, error: proposalError } = await client
      .from('match_proposals')
      .select('*, students:student_id(name, parent_id)')
      .eq('id', id)
      .single();

    if (proposalError || !proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Create intro call record
    const { data: introCall, error: introError } = await client
      .from('intro_calls')
      .insert({
        proposal_id: id,
        scheduled_at: when_ts ? new Date(when_ts).toISOString() : null,
        channel,
        meeting_link: link,
        notes,
        created_by: user.id
      })
      .select()
      .single();

    if (introError) {
      console.error('Error creating intro call:', introError);
      return res.status(500).json({ error: 'Failed to create intro call' });
    }

    // Update proposal status
    const newStatus = when_ts ? 'scheduled' : 'intro_requested';
    await client
      .from('match_proposals')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    // Create event
    const eventType = when_ts ? 'intro_scheduled' : 'intro_requested';
    await client
      .from('match_events')
      .insert({
        proposal_id: id,
        event_type: eventType,
        actor_id: user.id,
        details: { intro_call_id: introCall.id, when_ts, channel, link }
      });

    // Create notifications
    const notificationTitle = when_ts ? 'Intro Call Scheduled' : 'Intro Call Requested';
    const notificationMessage = when_ts 
      ? `An intro call has been scheduled for ${new Date(when_ts).toLocaleDateString()}`
      : 'An intro call has been requested for this match';

    // Notify the other party
    const targetUserId = user.id === proposal.advocate_id 
      ? proposal.students.parent_id 
      : proposal.advocate_id;
      
    await createNotification(client, targetUserId, notificationTitle, notificationMessage, id);

    res.json({ intro_call: introCall, status: newStatus });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/:id/accept - Accept a proposal
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = getSupabaseClient(req.headers.authorization);
    
    // Get current user
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get proposal with student details
    const { data: proposal, error: proposalError } = await client
      .from('match_proposals')
      .select('*, students:student_id(name, parent_id)')
      .eq('id', id)
      .single();

    if (proposalError || !proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Update proposal status
    await client
      .from('match_proposals')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', id);

    // Create event
    await client
      .from('match_events')
      .insert({
        proposal_id: id,
        event_type: 'proposal_accepted',
        actor_id: user.id
      });

    // Create assignment if it doesn't exist
    await client
      .from('assignments')
      .upsert({
        advocate_id: proposal.advocate_id,
        parent_id: proposal.students.parent_id
      }, { 
        onConflict: 'advocate_id,parent_id',
        ignoreDuplicates: true 
      });

    // Notify parent
    await createNotification(
      client,
      proposal.students.parent_id,
      'Match Proposal Accepted!',
      `Your advocate match proposal for ${proposal.students.name} has been accepted!`,
      id
    );

    res.json({ status: 'accepted' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/:id/decline - Decline a proposal  
router.post('/:id/decline', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = getSupabaseClient(req.headers.authorization);
    
    // Get current user
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get proposal with student details
    const { data: proposal, error: proposalError } = await client
      .from('match_proposals')
      .select('*, students:student_id(name, parent_id)')
      .eq('id', id)
      .single();

    if (proposalError || !proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Update proposal status
    await client
      .from('match_proposals')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', id);

    // Create event
    await client
      .from('match_events')
      .insert({
        proposal_id: id,
        event_type: 'proposal_declined',
        actor_id: user.id
      });

    // Notify parent
    await createNotification(
      client,
      proposal.students.parent_id,
      'Match Proposal Declined',
      `Your advocate match proposal for ${proposal.students.name} was declined`,
      id
    );

    res.json({ status: 'declined' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;