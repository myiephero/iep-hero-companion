import express, { Request, Response } from 'express';
import { db } from '../db';
import { expert_analyses } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Mock user ID for development
const MOCK_USER_ID = "mock-user-123";

// POST /api/expert-analysis - Request expert analysis (simplified without file upload for now)
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Request body:', req.body); // Debug log
    
    const { 
      analysis_type = 'comprehensive', 
      student_name = 'Student Analysis',
      analysisType = 'comprehensive',
      studentName = 'Student Analysis'
    } = req.body || {};

    // Use camelCase or snake_case depending on what's sent
    const finalAnalysisType = analysis_type || analysisType;
    const finalStudentName = student_name || studentName;

    // Create analysis record - simplified version
    const [analysis] = await db.insert(expert_analyses).values({
      user_id: MOCK_USER_ID,
      student_name: finalStudentName,
      analysis_type: finalAnalysisType,
      file_name: 'uploaded_document.pdf',
      file_type: 'application/pdf',
      file_content: 'Mock file content for development',
      status: 'pending'
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
    // In production, filter by user_id from authentication
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
    .orderBy(expert_analyses.submitted_at);

    res.json({ analyses });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// GET /api/expert-analysis/:id - Get specific analysis
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [analysis] = await db.select()
      .from(expert_analyses)
      .where(eq(expert_analyses.id, parseInt(id)));

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Don't return file_content in the response for security
    const { file_content, ...analysisData } = analysis;

    res.json({ analysis: analysisData });
  } catch (error) {
    console.error('Error fetching analysis:', error);
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