import express, { Request, Response } from 'express';
import { db } from '../db';
import { expert_analyses } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { getUserId } from '../utils';

const router = express.Router();

// POST /api/expert-analysis - Request expert analysis
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Expert analysis request from user:', userId);
    
    const { 
      analysis_type = 'comprehensive', 
      student_name = 'Student Analysis',
      analysisType = 'comprehensive',
      studentName = 'Student Analysis',
      file_name = 'document.pdf',
      file_size = 0
    } = req.body || {};

    // Use camelCase or snake_case depending on what's sent
    const finalAnalysisType = analysis_type || analysisType;
    const finalStudentName = student_name || studentName;

    // Create analysis record with real user authentication
    const [analysis] = await db.insert(expert_analyses).values({
      user_id: userId,
      student_name: finalStudentName,
      analysis_type: finalAnalysisType,
      file_name: file_name,
      file_type: 'application/pdf',
      file_content: 'File uploaded successfully - content will be processed by expert',
      status: 'pending',
      submitted_at: new Date()
    }).returning();

    // In production, this would trigger the expert review process
    // For now, we'll just return the pending analysis
    res.json({
      message: 'Expert analysis request submitted successfully',
      analysis_id: analysis.id,
      status: 'pending',
      estimated_completion: '24-48 hours'
    });

  } catch (error) {
    console.error('Error submitting expert analysis:', error);
    res.status(500).json({ error: 'Failed to submit analysis request' });
  }
});

// GET /api/expert-analysis - Get user's analyses
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Fetching expert analyses for user:', userId);
    
    // Filter by authenticated user's ID
    const analyses = await db.select({
      id: expert_analyses.id,
      student_name: expert_analyses.student_name,
      analysis_type: expert_analyses.analysis_type,
      status: expert_analyses.status,
      overall_score: expert_analyses.overall_score,
      submitted_at: expert_analyses.submitted_at,
      completed_at: expert_analyses.completed_at,
      strengths: expert_analyses.strengths,
      areas_for_improvement: expert_analyses.areas_for_improvement,
      recommendations: expert_analyses.recommendations,
      compliance_issues: expert_analyses.compliance_issues
    }).from(expert_analyses)
    .where(eq(expert_analyses.user_id, userId))
    .orderBy(expert_analyses.submitted_at);

    console.log(`✅ PRODUCTION: Found ${analyses.length} analyses for user`);
    res.json({ analyses });
  } catch (error) {
    console.error('❌ Error fetching analyses:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// GET /api/expert-analysis/:id - Get specific analysis
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;

    const [analysis] = await db.select()
      .from(expert_analyses)
      .where(eq(expert_analyses.id, parseInt(id)));

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Verify user owns this analysis
    if (analysis.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this analysis' });
    }

    // Don't return file_content in the response for security
    const { file_content, ...analysisData } = analysis;

    res.json({ analysis: analysisData });
  } catch (error) {
    console.error('❌ Error fetching analysis:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// PUT /api/expert-analysis/:id - Update analysis (for experts to complete)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      overall_score, 
      strengths, 
      areas_for_improvement, 
      recommendations, 
      compliance_issues,
      expert_notes
    } = req.body;

    const [updatedAnalysis] = await db.update(expert_analyses)
      .set({
        status: 'completed',
        overall_score,
        strengths,
        areas_for_improvement,
        recommendations,
        compliance_issues,
        expert_notes,
        completed_at: new Date()
      })
      .where(eq(expert_analyses.id, parseInt(id)))
      .returning();

    if (!updatedAnalysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ 
      message: 'Analysis completed successfully',
      analysis: updatedAnalysis 
    });

  } catch (error) {
    console.error('Error updating analysis:', error);
    res.status(500).json({ error: 'Failed to update analysis' });
  }
});

export default router;