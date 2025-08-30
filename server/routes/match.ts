import express, { Request, Response } from 'express';
// Note: Using hybrid approach - this route uses Supabase for advocate matching
// while keeping our new PostgreSQL API for other features

const router = express.Router();

// Matching algorithm weights
const MATCHING_WEIGHTS = {
  tag_overlap: 0.45,
  grade_area_fit: 0.15,
  capacity_available: 0.15,
  language_match: 0.10,
  price_fit: 0.10,
  timezone_compatibility: 0.05
};

// Helper function to calculate Jaccard similarity
function calculateJaccardSimilarity(set1: string[], set2: string[]): number {
  if (!set1.length || !set2.length) return 0;

  const s1 = new Set(set1);
  const s2 = new Set(set2);
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);

  return intersection.size / union.size;
}

// Mock data for development - replace with Supabase calls in production
const mockAdvocates = [
  {
    id: 'adv1',
    name: 'Dr. Sarah Williams',
    email: 'sarah@example.com',
    bio: 'Certified special education advocate with 15 years of experience specializing in autism spectrum disorders.',
    tags: ['autism', 'behavioral', 'speech', 'sensory'],
    languages: ['English', 'Spanish'],
    timezone: 'America/New_York',
    hourly_rate: 125,
    experience_years: 15,
    rating: 4.9,
    max_caseload: 8,
    current_caseload: 5,
    location: 'New York, NY'
  },
  {
    id: 'adv2', 
    name: 'James Rodriguez',
    bio: 'Former special education teacher turned advocate, focusing on twice-exceptional and gifted students.',
    tags: ['gifted', 'twice_exceptional', 'adhd', 'executive_function'],
    languages: ['English', 'Spanish'],
    timezone: 'America/Los_Angeles',
    hourly_rate: 175,
    experience_years: 12,
    rating: 4.8,
    max_caseload: 6,
    current_caseload: 4,
    location: 'Los Angeles, CA'
  }
];

const mockStudents = [
  {
    id: '1',
    name: 'Emma Johnson',
    grade: '5th',
    needs: ['autism', 'speech', 'behavioral'],
    languages: ['English'],
    timezone: 'America/New_York',
    budget: 150,
    narrative: 'Emma is a bright 5th grader with autism who needs support with behavioral interventions and speech therapy goals.',
    parent_id: 'parent1'
  }
];

interface MatchProposal {
  id: string;
  student_id: string;
  advocate_id: string;
  score: number;
  status: string;
  created_at: string;
  reason: any;
  updated_at?: string;
  decline_reason?: string;
}

let mockProposals: MatchProposal[] = [];

// GET /api/match - List proposals
router.get('/', async (req: Request, res: Response) => {
  try {
    // Return proposals with populated student and advocate data
    const populatedProposals = mockProposals.map(proposal => {
      const student = mockStudents.find(s => s.id === proposal.student_id);
      const advocate = mockAdvocates.find(a => a.id === proposal.advocate_id);
      
      return {
        ...proposal,
        student,
        advocate
      };
    });

    res.json({ proposals: populatedProposals });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/propose - Create match proposals
router.post('/propose', async (req: Request, res: Response) => {
  try {
    const { student_id, advocate_ids, reason = {} } = req.body;

    if (!student_id || !advocate_ids || !Array.isArray(advocate_ids)) {
      return res.status(400).json({ error: 'student_id and advocate_ids array required' });
    }

    const student = mockStudents.find(s => s.id === student_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const createdProposals = [];

    for (const advocateId of advocate_ids) {
      const advocate = mockAdvocates.find(a => a.id === advocateId);
      if (!advocate) continue;

      // Calculate basic match score
      const tagSimilarity = calculateJaccardSimilarity(student.needs, advocate.tags);
      const score = Math.round(tagSimilarity * 100);

      const proposal = {
        id: `prop_${Date.now()}_${advocateId}`,
        student_id,
        advocate_id: advocateId,
        score,
        status: 'pending',
        created_at: new Date().toISOString(),
        reason
      };

      mockProposals.push(proposal);
      createdProposals.push(proposal);
    }

    res.json({
      created: createdProposals.length,
      proposals: createdProposals
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/:id/intro - Request intro call
router.post('/:id/intro', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { when_ts, channel = 'zoom', link, notes } = req.body;

    const proposalIndex = mockProposals.findIndex(p => p.id === id);
    if (proposalIndex === -1) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Update proposal status
    mockProposals[proposalIndex].status = when_ts ? 'scheduled' : 'intro_requested';
    mockProposals[proposalIndex].updated_at = new Date().toISOString();

    const introCall = {
      id: `call_${Date.now()}`,
      proposal_id: id,
      scheduled_at: when_ts ? new Date(when_ts).toISOString() : null,
      channel,
      meeting_link: link,
      notes,
      created_at: new Date().toISOString()
    };

    res.json({ 
      intro_call: introCall, 
      status: mockProposals[proposalIndex].status 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/:id/accept - Accept a proposal
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const proposalIndex = mockProposals.findIndex(p => p.id === id);
    if (proposalIndex === -1) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    mockProposals[proposalIndex].status = 'accepted';
    mockProposals[proposalIndex].updated_at = new Date().toISOString();

    res.json({ 
      message: 'Proposal accepted',
      proposal: mockProposals[proposalIndex]
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/:id/decline - Decline a proposal
router.post('/:id/decline', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const proposalIndex = mockProposals.findIndex(p => p.id === id);
    if (proposalIndex === -1) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    mockProposals[proposalIndex].status = 'declined';
    mockProposals[proposalIndex].decline_reason = reason;
    mockProposals[proposalIndex].updated_at = new Date().toISOString();

    res.json({ 
      message: 'Proposal declined',
      proposal: mockProposals[proposalIndex]
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;