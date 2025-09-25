import express, { Request, Response } from 'express';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { getUserId } from '../utils'; // Import the unified database-based getUserId
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
    const userId = await getUserId(req);
    
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

// GET /api/match/advocate-proposals - Get proposals for advocate 
router.get('/advocate-proposals', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    
    // Get advocate record for current user
    const advocate = await db.select().from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .then(results => results[0]);
    
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found' });
    }
    
    // Get proposals where this advocate is the target
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

// POST /api/match/auto-match - AI-powered automatic matching based on student needs
router.post('/auto-match', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { student_id, max_matches = 3, urgency_level = 'medium' } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
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

    // Get all available advocates
    const advocates = await db.select().from(schema.advocates)
      .where(eq(schema.advocates.status, 'active'));

    // Define student needs array for reuse
    const studentNeeds = [
      student.disability_category,
      student.grade_level,
      ...(student.notes?.split(',') || [])
    ].filter((item): item is string => Boolean(item)).map(s => s.toLowerCase().trim()).filter(Boolean);

    // AI-powered matching algorithm
    const scoredMatches = advocates.map(advocate => {
      let totalScore = 0;
      const reasons: string[] = [];

      // 1. Specializations match (45% weight)
      const advocateSpecs = ((advocate.specializations as string[]) || [])
        .filter((s): s is string => Boolean(s) && typeof s === 'string')
        .map(s => s.toLowerCase().trim());

      const specOverlap = calculateJaccardSimilarity(studentNeeds, advocateSpecs);
      const specScore = specOverlap * 45;
      totalScore += specScore;
      
      if (specScore > 15) {
        reasons.push(`Strong specialization match (${Math.round(specOverlap * 100)}%)`);
      }

      // 2. Grade level fit (15% weight)
      const gradeScore = student.grade_level && advocateSpecs.some(spec => 
        spec.includes(student.grade_level?.toLowerCase() || '') || 
        spec.includes('k-12') || spec.includes('all grades')
      ) ? 15 : 0;
      totalScore += gradeScore;
      
      if (gradeScore > 0) {
        reasons.push(`Grade level expertise (${student.grade_level || 'current grade'})`);
      }

      // 3. Availability score (15% weight)
      const availabilityScore = advocate.availability === 'immediate' ? 15 : 
                               advocate.availability === 'within_week' ? 10 : 5;
      totalScore += availabilityScore;

      // 4. Experience and rating (10% weight)
      const experienceScore = Math.min((advocate.years_experience || 0) / 10, 1) * 5 +
                             Math.min((advocate.rating || 0) / 5, 1) * 5;
      totalScore += experienceScore;

      // 5. Urgency compatibility (10% weight)
      const urgencyScore = (urgency_level === 'high' && advocate.availability === 'immediate') ? 10 :
                          (urgency_level === 'medium' && advocate.availability !== 'not_available') ? 7 : 5;
      totalScore += urgencyScore;

      // 6. Case load capacity (5% weight)
      // TODO: Calculate actual case load, for now assume all have capacity
      const capacityScore = 5;
      totalScore += capacityScore;

      return {
        advocate,
        score: Math.round(totalScore),
        match_reason: {
          total_score: Math.round(totalScore),
          specialization_overlap: Math.round(specOverlap * 100),
          reasons: reasons.length > 0 ? reasons : ['General IEP expertise match'],
          algorithm_version: '1.0'
        }
      };
    });

    // Sort by score and take top matches
    const topMatches = scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, max_matches)
      .filter(match => match.score > 20); // Minimum threshold

    if (topMatches.length === 0) {
      return res.json({
        message: 'No suitable matches found. Try expanding search criteria.',
        matches: [],
        student_info: {
          name: student.full_name,
          grade: student.grade_level,
          needs: studentNeeds
        }
      });
    }

    // Create match proposals for top advocates
    const createdProposals: any[] = [];
    for (const match of topMatches) {
      const [proposal] = await db.insert(schema.match_proposals)
        .values({
          student_id,
          advocate_id: match.advocate.id,
          parent_id: userId,
          score: match.score,
          status: 'pending',
          match_reason: match.match_reason
        })
        .returning();

      if (proposal) {
        createdProposals.push({
          proposal,
          advocate: match.advocate,
          match_details: match.match_reason
        });
      }
    }

    res.json({
      message: `Found ${topMatches.length} high-quality matches for ${student.full_name}`,
      matches_created: createdProposals.length,
      proposals: createdProposals,
      student_info: {
        name: student.full_name,
        grade: student.grade_level,
        school: student.school_name,
        needs: studentNeeds
      }
    });
  } catch (error) {
    console.error('Auto-matching error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/propose - Create match proposals (legacy manual selection)
router.post('/propose', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
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

    const createdProposals: any[] = [];

    for (const advocateId of advocate_ids) {
      // Verify advocate exists
      const advocate = await db.select().from(schema.advocates)
        .where(eq(schema.advocates.id, advocateId))
        .then(results => results[0]);
      
      if (!advocate) continue;

      // Calculate match score
      const studentNeeds = student.disability_category ? [student.disability_category] : [];
      const score = calculateMatchScore(studentNeeds, advocate.specializations || []);

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

      if (proposal) {
        createdProposals.push(proposal);
      }
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
    const userId = await getUserId(req);
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
    const userId = await getUserId(req);
    const { id } = req.params;

    // Get full proposal details including student information
    const proposalData = await db.select({
      proposal: schema.match_proposals,
      advocate: schema.advocates,
      student: schema.students
    })
    .from(schema.match_proposals)
    .leftJoin(schema.advocates, eq(schema.match_proposals.advocate_id, schema.advocates.id))
    .leftJoin(schema.students, eq(schema.match_proposals.student_id, schema.students.id))
    .where(and(
      eq(schema.match_proposals.id, id),
      eq(schema.advocates.user_id, userId)
    ))
    .then(results => results[0]);

    if (!proposalData || !proposalData.advocate) {
      return res.status(404).json({ error: 'Proposal not found or advocate not found' });
    }

    const { proposal, advocate, student } = proposalData;

    // Update proposal status
    const [updatedProposal] = await db.update(schema.match_proposals)
      .set({
        status: 'accepted',
        updated_at: new Date()
      })
      .where(eq(schema.match_proposals.id, id))
      .returning();

    // Create advocate-client relationship
    const clientRelationship = await db.insert(schema.advocate_clients)
      .values({
        advocate_id: advocate.id,
        client_id: proposal.parent_id,
        relationship_type: 'active_client',
        status: 'active',
        start_date: new Date().toISOString(),
        notes: `Started from accepted match proposal for student: ${student?.full_name || 'Unknown'}`
      })
      .returning()
      .then(results => results[0])
      .catch(err => {
        // If relationship already exists, that's fine
        console.log('Client relationship may already exist:', err.message);
        return null;
      });

    // Create case record for the accepted proposal
    const caseRecord = await db.insert(schema.cases)
      .values({
        advocate_id: advocate.id,
        client_id: proposal.parent_id,
        student_id: proposal.student_id,
        case_title: `IEP Support for ${student?.full_name || 'Student'}`,
        description: `Case created from accepted match proposal. Student: ${student?.full_name}, Grade: ${student?.grade_level}, School: ${student?.school_name}`,
        case_type: 'iep_support',
        status: 'active',
        priority: 'medium',
        billing_rate: advocate.rate_per_hour || 0,
        total_hours: 0,
        next_action: 'Initial consultation',
        next_action_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })
      .returning()
      .then(results => results[0])
      .catch(err => {
        console.error('Error creating case record:', err);
        return null;
      });

    // Create or find existing conversation
    let conversation = await db.select()
      .from(schema.conversations)
      .where(and(
        eq(schema.conversations.advocate_id, advocate.id),
        eq(schema.conversations.parent_id, proposal.parent_id),
        eq(schema.conversations.student_id, proposal.student_id)
      ))
      .then(results => results[0]);

    if (!conversation) {
      const newConversation = await db.insert(schema.conversations)
        .values({
          advocate_id: advocate.id,
          parent_id: proposal.parent_id,
          student_id: proposal.student_id,
          match_proposal_id: proposal.id,
          title: `IEP Support Discussion - ${student?.full_name || 'Student'}`,
          status: 'active',
          last_message_at: new Date()
        })
        .returning()
        .then(results => results[0])
        .catch(err => {
          console.error('Error creating conversation:', err);
          return null;
        });
      
      if (newConversation) {
        conversation = newConversation;
      }
    }

    console.log('Proposal acceptance completed:', {
      proposalId: updatedProposal.id,
      advocateId: advocate.id,
      clientId: proposal.parent_id,
      studentId: proposal.student_id,
      clientRelationshipCreated: !!clientRelationship,
      caseCreated: !!caseRecord,
      conversationReady: !!conversation
    });

    res.json({ 
      message: 'Proposal accepted successfully',
      proposal: updatedProposal,
      clientRelationship,
      caseRecord,
      conversation
    });
  } catch (error) {
    console.error('Server error accepting proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/match/:id/decline - Decline a proposal (advocate side)
router.post('/:id/decline', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
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

// GET /api/match/pending-assignments - Get pending assignments for advocate dashboard
router.get('/pending-assignments', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    
    // Get advocate record for current user - NO FALLBACK for security
    const advocate = await db.select().from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .then(results => results[0]);

    // SECURITY: Return 403 if no advocate found - never use another advocate's data
    if (!advocate) {
      console.log(`SECURITY: No advocate profile found for userId: ${userId}`);
      return res.status(403).json({ 
        error: 'Advocate profile not found', 
        message: 'You must have an advocate profile to access pending assignments' 
      });
    }

    // Get pending proposals for this advocate with parent notes from advocate_requests
    const pendingProposals = await db.select({
      proposal: schema.match_proposals,
      student: schema.students,
      advocate: schema.advocates,
      parent: schema.users,
      request: schema.advocate_requests
    })
    .from(schema.match_proposals)
    .leftJoin(schema.students, eq(schema.match_proposals.student_id, schema.students.id))
    .leftJoin(schema.advocates, eq(schema.match_proposals.advocate_id, schema.advocates.id))
    .leftJoin(schema.users, eq(schema.match_proposals.parent_id, schema.users.id))
    .leftJoin(schema.advocate_requests, and(
      eq(schema.advocate_requests.parent_id, schema.match_proposals.parent_id),
      eq(schema.advocate_requests.student_id, schema.match_proposals.student_id)
    ))
    .where(
      and(
        eq(schema.match_proposals.advocate_id, advocate.id),
        eq(schema.match_proposals.status, 'pending')
      )
    );

    const formattedAssignments = pendingProposals.map(({ proposal, student, advocate: advocateData, parent, request }) => ({
      id: proposal.id,
      student: {
        id: student?.id || '',
        name: student?.full_name || 'Unknown Student',
        grade: student?.grade_level || '',
        school: student?.school_name || '',
        disability_category: student?.disability_category || '',
        needs: student?.notes ? student.notes.split(',').map(n => n.trim()).filter(Boolean) : [],
        iep_status: student?.iep_status || '',
        next_review_date: student?.next_review_date || ''
      },
      parent: {
        id: parent?.id || '',
        name: `${parent?.firstName || ''} ${parent?.lastName || ''}`.trim() || 'Unknown Parent',
        email: parent?.email || '',
        phone: '', // TODO: Add phone from profiles table if needed
        notes: request?.message || '', // Parent's request details/notes
        subject: request?.subject || '',
        urgency_level: request?.urgency_level || 'medium',
        budget_range: request?.budget_range || '',
        preferred_contact_method: request?.preferred_contact_method || 'email'
      },
      match: {
        score: proposal.score,
        reasons: proposal.match_reason && typeof proposal.match_reason === 'object' && 'reasons' in proposal.match_reason ? 
          (Array.isArray((proposal.match_reason as any).reasons) ? (proposal.match_reason as any).reasons : ['General IEP expertise match']) :
          ['General IEP expertise match'],
        specialization_overlap: proposal.match_reason && typeof proposal.match_reason === 'object' && 'specialization_overlap' in proposal.match_reason ? 
          ((proposal.match_reason as any).specialization_overlap || 0) : 0,
        created_at: proposal.created_at,
        urgency: request?.urgency_level || 'medium'
      },
      proposal_id: proposal.id,
      status: proposal.status
    }));

    res.json({ 
      assignments: formattedAssignments,
      total_pending: formattedAssignments.length
    });
  } catch (error) {
    console.error('Server error getting pending assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/match/advocate - Get proposals for advocate
router.get('/advocate', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    
    // Get advocate record for current user
    let advocate = await db.select().from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .then(results => results[0]);

    // Fallback: if no advocate found for this user, use the first advocate (for testing)
    if (!advocate) {
      console.log(`No advocate found for userId: ${userId}, using first available advocate for testing`);
      advocate = await db.select().from(schema.advocates)
        .limit(1)
        .then(results => results[0]);
    }

    if (!advocate) {
      return res.status(404).json({ error: 'No advocates found in system' });
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