import express, { Request, Response } from 'express';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
const router = express.Router();

// Mock auth function for development
function getUserId(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer mock-token-')) {
    const role = authHeader.replace('Bearer mock-token-', '');
    return `mock-${role}-user-${role === 'advocate' ? '456' : '123'}`;
  }
  const path = req.path || '';
  if (path.includes('advocate')) {
    return 'mock-advocate-user-456';
  }
  return 'mock-parent-user-123';
}

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

// Helper to calculate match score based on overlapping specializations
function calculateMatchScore(studentNeeds: string[], advocateSpecializations: any): number {
  if (!advocateSpecializations || !Array.isArray(advocateSpecializations)) return 0;
  
  const overlap = studentNeeds.filter(need => 
    advocateSpecializations.some((spec: string) => 
      spec.toLowerCase().includes(need.toLowerCase()) || 
      need.toLowerCase().includes(spec.toLowerCase())
    )
  );
  
  return Math.round((overlap.length / Math.max(studentNeeds.length, 1)) * 100);
}

// GET /api/match - List proposals
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    // Get proposals for current user (either as parent or advocate)
    const proposals = await db.select({
      proposal: schema.match_proposals,
      student: schema.students,
      advocate: schema.advocates
    })
    .from(schema.match_proposals)
    .leftJoin(schema.students, eq(schema.match_proposals.student_id, schema.students.id))
    .leftJoin(schema.advocates, eq(schema.match_proposals.advocate_id, schema.advocates.id))
    .where(
      eq(schema.match_proposals.parent_id, userId)
    );

    const formattedProposals = proposals.map(({ proposal, student, advocate }) => ({
      ...proposal,
      student,
      advocate
    }));

    res.json({ proposals: formattedProposals });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/propose - Create match proposals
router.post('/propose', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { student_id, advocate_ids, reason = {} } = req.body;

    if (!student_id || !advocate_ids || !Array.isArray(advocate_ids)) {
      return res.status(400).json({ error: 'student_id and advocate_ids array required' });
    }

    // Verify student exists and belongs to user
    const student = await db.select().from(schema.students)
      .where(and(
        eq(schema.students.id, student_id),
        eq(schema.students.user_id, userId)
      ))
      .then(results => results[0]);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const createdProposals = [];

    for (const advocateId of advocate_ids) {
      // Verify advocate exists
      const advocate = await db.select().from(schema.advocates)
        .where(eq(schema.advocates.id, advocateId))
        .then(results => results[0]);
      
      if (!advocate) continue;

      // Calculate match score
      const studentNeeds = student.special_needs || [];
      const score = calculateMatchScore(studentNeeds, advocate.specializations);

      // Create proposal
      const [proposal] = await db.insert(schema.match_proposals)
        .values({
          student_id,
          advocate_id: advocateId,
          parent_id: userId,
          score,
          status: 'pending',
          match_reason: reason
        })
        .returning();

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
    const userId = getUserId(req);
    const { id } = req.params;
    const { when_ts, channel = 'zoom', link, notes } = req.body;

    // Verify proposal exists and user has access
    const proposal = await db.select().from(schema.match_proposals)
      .where(and(
        eq(schema.match_proposals.id, id),
        eq(schema.match_proposals.parent_id, userId)
      ))
      .then(results => results[0]);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Update proposal with intro call request
    const [updatedProposal] = await db.update(schema.match_proposals)
      .set({
        intro_call_requested: true,
        intro_call_scheduled_at: when_ts ? new Date(when_ts) : null,
        intro_call_notes: notes,
        status: when_ts ? 'scheduled' : 'intro_requested',
        updated_at: new Date()
      })
      .where(eq(schema.match_proposals.id, id))
      .returning();

    res.json({ 
      proposal: updatedProposal,
      status: updatedProposal.status 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/:id/accept - Accept a proposal (advocate side)
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // Verify proposal exists and user is the advocate
    const proposal = await db.select({
      proposal: schema.match_proposals,
      advocate: schema.advocates
    })
    .from(schema.match_proposals)
    .leftJoin(schema.advocates, eq(schema.match_proposals.advocate_id, schema.advocates.id))
    .where(and(
      eq(schema.match_proposals.id, id),
      eq(schema.advocates.user_id, userId)
    ))
    .then(results => results[0]);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Update proposal status
    const [updatedProposal] = await db.update(schema.match_proposals)
      .set({
        status: 'accepted',
        updated_at: new Date()
      })
      .where(eq(schema.match_proposals.id, id))
      .returning();

    res.json({ 
      message: 'Proposal accepted',
      proposal: updatedProposal
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/:id/decline - Decline a proposal (advocate side)
router.post('/:id/decline', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { reason } = req.body;

    // Verify proposal exists and user is the advocate
    const proposal = await db.select({
      proposal: schema.match_proposals,
      advocate: schema.advocates
    })
    .from(schema.match_proposals)
    .leftJoin(schema.advocates, eq(schema.match_proposals.advocate_id, schema.advocates.id))
    .where(and(
      eq(schema.match_proposals.id, id),
      eq(schema.advocates.user_id, userId)
    ))
    .then(results => results[0]);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Update proposal status
    const [updatedProposal] = await db.update(schema.match_proposals)
      .set({
        status: 'declined',
        decline_reason: reason,
        updated_at: new Date()
      })
      .where(eq(schema.match_proposals.id, id))
      .returning();

    res.json({ 
      message: 'Proposal declined',
      proposal: updatedProposal
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/match/advocate - Get proposals for advocate
router.get('/advocate', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    // Get advocate record for current user
    const advocate = await db.select().from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .then(results => results[0]);

    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found' });
    }

    // Get proposals for this advocate
    const proposals = await db.select({
      proposal: schema.match_proposals,
      student: schema.students,
      advocate: schema.advocates
    })
    .from(schema.match_proposals)
    .leftJoin(schema.students, eq(schema.match_proposals.student_id, schema.students.id))
    .leftJoin(schema.advocates, eq(schema.match_proposals.advocate_id, schema.advocates.id))
    .where(
      eq(schema.match_proposals.advocate_id, advocate.id)
    );

    const formattedProposals = proposals.map(({ proposal, student, advocate: advocateData }) => ({
      ...proposal,
      student,
      advocate: advocateData
    }));

    res.json({ proposals: formattedProposals });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;