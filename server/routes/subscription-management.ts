import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { getUserId } from '../utils';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

// POST /api/subscription/cancel - Cancel user's subscription
router.post('/cancel', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { reason, feedback } = req.body;

    console.log(`🚫 Processing cancellation request for user: ${userId}`);

    // Get user's current subscription info
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel the subscription in Stripe
    const cancelledSubscription = await stripe.subscriptions.cancel(user.stripeSubscriptionId, {
      cancellation_details: {
        comment: feedback || 'Cancelled by user',
        feedback: reason || 'other',
      },
    });

    // Update user status in database (using Stripe's canonical status)
    await db
      .update(schema.users)
      .set({
        subscriptionStatus: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    // Log the cancellation event
    await db.insert(schema.subscription_events).values({
      user_id: userId,
      stripe_subscription_id: user.stripeSubscriptionId,
      stripe_customer_id: user.stripeCustomerId!,
      event_type: 'subscription.cancelled_by_user',
      previous_status: user.subscriptionStatus,
      new_status: 'canceled',
      event_data: { reason, feedback, cancelled_at: new Date() },
    });

    console.log(`✅ Successfully cancelled subscription for user ${userId}`);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: cancelledSubscription.id,
        status: cancelledSubscription.status,
        cancelled_at: cancelledSubscription.cancelled_at,
        current_period_end: cancelledSubscription.current_period_end,
      },
    });
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/subscription/status - Get user's subscription status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stripeSubscription = null;
    if (user.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      } catch (stripeError) {
        console.warn('Failed to fetch Stripe subscription:', stripeError);
      }
    }

    res.json({
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripe: stripeSubscription ? {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        current_period_start: stripeSubscription.current_period_start,
        current_period_end: stripeSubscription.current_period_end,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        cancelled_at: stripeSubscription.cancelled_at,
      } : null,
    });
  } catch (error) {
    console.error('❌ Error fetching subscription status:', error);
    res.status(500).json({
      error: 'Failed to fetch subscription status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/subscription/reactivate - Reactivate a cancelled subscription
router.post('/reactivate', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);

    console.log(`🔄 Processing reactivation request for user: ${userId}`);

    // Get user's current subscription info
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    if (subscription.status !== 'canceled') {
      return res.status(400).json({ error: 'Subscription is not cancelled' });
    }

    // Create a new subscription with the same plan
    const newSubscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId!,
      items: [
        {
          price: subscription.items.data[0].price.id,
        },
      ],
    });

    // Update user with new subscription
    await db
      .update(schema.users)
      .set({
        stripeSubscriptionId: newSubscription.id,
        subscriptionStatus: newSubscription.status,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    // Log the reactivation event
    await db.insert(schema.subscription_events).values({
      user_id: userId,
      stripe_subscription_id: newSubscription.id,
      stripe_customer_id: user.stripeCustomerId!,
      event_type: 'subscription.reactivated',
      previous_status: 'cancelled',
      new_status: newSubscription.status,
      event_data: { reactivated_at: new Date() },
    });

    console.log(`✅ Successfully reactivated subscription for user ${userId}`);

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        id: newSubscription.id,
        status: newSubscription.status,
        current_period_start: newSubscription.current_period_start,
        current_period_end: newSubscription.current_period_end,
      },
    });
  } catch (error) {
    console.error('❌ Error reactivating subscription:', error);
    res.status(500).json({
      error: 'Failed to reactivate subscription',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;