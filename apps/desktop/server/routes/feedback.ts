import express, { Request, Response } from 'express';
import { sendFeedbackEmail } from '../emailService';

const router = express.Router();

// POST /api/feedback - Submit feedback with optional screenshot
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      type,
      message,
      screenshot,
      userEmail,
      userName,
      currentPage,
      timestamp,
      userAgent
    } = req.body;

    if (!message || !type) {
      return res.status(400).json({ 
        error: 'Message and type are required' 
      });
    }

    // Send feedback email to admin
    await sendFeedbackEmail({
      type,
      message,
      screenshot,
      userEmail: userEmail || 'anonymous@example.com',
      userName: userName || 'Anonymous User',
      currentPage,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || 'Unknown'
    });

    res.status(200).json({
      message: 'Feedback submitted successfully',
      success: true
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback' 
    });
  }
});

export default router;