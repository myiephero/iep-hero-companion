import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import { getUserId } from '../utils';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

// POST /api/refund/request - Request a refund
router.post('/request', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { paymentIntentId, chargeId, amount, reason, description } = req.body;

    console.log(`💰 Processing refund request for user: ${userId}`);

    if (!paymentIntentId && !chargeId) {
      return res.status(400).json({ error: 'Payment Intent ID or Charge ID is required' });
    }

    // Get user info
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let refund: Stripe.Refund;
    let paymentIntent: Stripe.PaymentIntent | null = null;
    let charge: Stripe.Charge | null = null;

    // Process refund based on what ID was provided
    if (paymentIntentId) {
      // Get payment intent details
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Verify the payment intent belongs to this user
      if (paymentIntent.metadata.user_id !== userId) {
        return res.status(403).json({ error: 'Payment does not belong to this user' });
      }

      // Create refund from payment intent
      refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if specified
        reason: reason || 'requested_by_customer',
        metadata: {
          user_id: userId,
          refund_reason: description || reason || 'Customer requested refund',
        },
      });
    } else if (chargeId) {
      // Get charge details to verify ownership before refunding
      const charge = await stripe.charges.retrieve(chargeId);
      
      // Verify charge belongs to this user's customer
      if (charge.customer !== user.stripeCustomerId) {
        return res.status(403).json({ error: 'Charge does not belong to this user' });
      }
      
      // Create refund from charge ID
      refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if specified
        reason: reason || 'requested_by_customer',
        metadata: {
          user_id: userId,
          refund_reason: description || reason || 'Customer requested refund',
        },
      });
    } else {
      return res.status(400).json({ error: 'Invalid refund request' });
    }

    // Store refund information in database
    await db.insert(schema.refunds).values({
      user_id: userId,
      stripe_refund_id: refund.id,
      stripe_payment_intent_id: paymentIntentId,
      amount: refund.amount || 0, // Amount in cents from Stripe
      currency: refund.currency,
      reason: reason || 'requested_by_customer',
      status: refund.status,
      refund_type: amount ? 'partial' : 'full',
      requested_by: userId,
      customer_reason: description,
      processed_at: refund.status === 'succeeded' ? new Date() : undefined,
    });

    console.log(`✅ Successfully processed refund ${refund.id} for user ${userId}`);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: (refund.amount || 0) / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        created: refund.created,
      },
    });
  } catch (error) {
    console.error('❌ Error processing refund:', error);
    res.status(500).json({
      error: 'Failed to process refund',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/refund/status/:refundId - Get refund status
router.get('/status/:refundId', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { refundId } = req.params;

    // Get refund from database
    const [dbRefund] = await db
      .select()
      .from(schema.refunds)
      .where(eq(schema.refunds.stripe_refund_id, refundId));

    if (!dbRefund) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    // Verify the refund belongs to this user
    if (dbRefund.user_id !== userId) {
      return res.status(403).json({ error: 'Refund does not belong to this user' });
    }

    // Get updated status from Stripe
    const stripeRefund = await stripe.refunds.retrieve(refundId);

    // Update database with latest status
    if (stripeRefund.status !== dbRefund.status) {
      await db
        .update(schema.refunds)
        .set({
          status: stripeRefund.status,
          processed_at: stripeRefund.status === 'succeeded' ? new Date() : undefined,
          updated_at: new Date(),
        })
        .where(eq(schema.refunds.stripe_refund_id, refundId));
    }

    res.json({
      id: stripeRefund.id,
      amount: (stripeRefund.amount || 0) / 100,
      currency: stripeRefund.currency,
      status: stripeRefund.status,
      reason: stripeRefund.reason,
      created: stripeRefund.created,
      description: dbRefund.customer_reason,
    });
  } catch (error) {
    console.error('❌ Error fetching refund status:', error);
    res.status(500).json({
      error: 'Failed to fetch refund status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/refund/history - Get user's refund history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);

    // Get user's refund history from database
    const refunds = await db
      .select()
      .from(schema.refunds)
      .where(eq(schema.refunds.user_id, userId))
      .orderBy(desc(schema.refunds.requested_at));

    res.json({
      refunds: refunds.map(refund => ({
        id: refund.stripe_refund_id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        description: refund.customer_reason,
        created_at: refund.created_at,
        processed_at: refund.processed_at,
      })),
    });
  } catch (error) {
    console.error('❌ Error fetching refund history:', error);
    res.status(500).json({
      error: 'Failed to fetch refund history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/refund/eligible-payments - Get user's eligible payments for refund
router.get('/eligible-payments', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'User or customer not found' });
    }

    // Get customer's payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      customer: user.stripeCustomerId,
      limit: 20,
    });

    // Filter for successful payments
    const eligiblePayments = paymentIntents.data
      .filter(pi => pi.status === 'succeeded')
      .map(pi => ({
        id: pi.id,
        amount: pi.amount / 100,
        currency: pi.currency,
        created: pi.created,
        description: pi.description,
        metadata: pi.metadata,
      }));

    res.json({ eligiblePayments });
  } catch (error) {
    console.error('❌ Error fetching eligible payments:', error);
    res.status(500).json({
      error: 'Failed to fetch eligible payments',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;