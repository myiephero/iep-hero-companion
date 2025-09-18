import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { getUserId } from '../utils';
import { EXPERT_REVIEW_PRODUCTS } from '@iep-hero/shared';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

// POST /api/create-expert-review-payment - Create payment intent for expert review
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Creating expert review payment for user:', userId);
    
    const { 
      productId, 
      priceId, 
      amount, 
      studentName, 
      fileName, 
      metadata = {} 
    } = req.body;

    // Validate product exists
    const product = EXPERT_REVIEW_PRODUCTS[productId];
    if (!product) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Validate amount matches product
    if (amount !== product.amount) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // Create payment intent with metadata for tracking
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        user_id: userId,
        product_id: productId,
        product_name: product.name,
        student_name: studentName || '',
        file_name: fileName || '',
        review_type: productId,
        ...metadata
      },
      description: `${product.name} for ${studentName || 'student'}`
    });

    console.log(`✅ PRODUCTION: Created payment intent ${paymentIntent.id} for $${amount}`);
    
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });

  } catch (error) {
    console.error('❌ Error creating expert review payment:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/expert-review-payment-success - Handle successful payment
router.post('/success', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }

    // Retrieve payment intent to verify it was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Verify the payment belongs to this user
    if (paymentIntent.metadata.user_id !== userId) {
      return res.status(403).json({ error: 'Payment does not belong to this user' });
    }

    console.log(`✅ PRODUCTION: Payment successful for expert review: ${paymentIntentId}`);
    
    // Here you would:
    // 1. Create the expert analysis record in the database
    // 2. Send notification to experts
    // 3. Send confirmation email to user
    
    // For now, we'll create a placeholder analysis record
    const analysisRecord = {
      id: `analysis_${Date.now()}`,
      userId,
      studentName: paymentIntent.metadata.student_name,
      reviewType: paymentIntent.metadata.product_id,
      fileName: paymentIntent.metadata.file_name,
      status: 'pending',
      amount: paymentIntent.amount / 100, // Convert back from cents
      paymentIntentId,
      submittedAt: new Date().toISOString(),
      estimatedCompletion: getEstimatedCompletion(paymentIntent.metadata.product_id)
    };

    res.json({
      success: true,
      analysis: analysisRecord,
      message: 'Expert review request submitted successfully'
    });

  } catch (error) {
    console.error('❌ Error processing payment success:', error);
    res.status(500).json({ 
      error: 'Failed to process payment success',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to get estimated completion time
function getEstimatedCompletion(productId: string): string {
  const now = new Date();
  const product = EXPERT_REVIEW_PRODUCTS[productId];
  
  if (!product) return '24-48 hours';
  
  // Parse timeframe and add to current time
  const timeframe = product.timeframe;
  if (timeframe.includes('12-24')) {
    now.setHours(now.getHours() + 24);
  } else if (timeframe.includes('24-48')) {
    now.setHours(now.getHours() + 48);
  } else if (timeframe.includes('24')) {
    now.setHours(now.getHours() + 24);
  } else {
    now.setHours(now.getHours() + 48); // Default
  }
  
  return now.toLocaleDateString();
}

export default router;