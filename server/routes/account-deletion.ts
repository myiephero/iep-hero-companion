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

// POST /api/account/delete - Delete user account and cancel all subscriptions
router.post('/delete', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    const { reason, feedback, confirmEmail } = req.body;

    console.log(`🗑️ Processing account deletion request for user: ${userId}`);

    // Get user's current info
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify email confirmation if provided
    if (confirmEmail && confirmEmail !== user.email) {
      return res.status(400).json({ 
        error: 'Email confirmation does not match account email' 
      });
    }

    let cancelledSubscription = null;

    // Cancel active subscription if exists
    if (user.stripeSubscriptionId && user.subscriptionStatus !== 'canceled') {
      try {
        console.log(`🚫 Cancelling subscription ${user.stripeSubscriptionId} for account deletion`);
        
        cancelledSubscription = await stripe.subscriptions.cancel(user.stripeSubscriptionId, {
          cancellation_details: {
            comment: `Account deletion - ${feedback || 'No additional feedback'}`,
            feedback: reason || 'other',
          },
        });

        // Log the cancellation event
        await db.insert(schema.subscription_events).values({
          user_id: userId,
          stripe_subscription_id: user.stripeSubscriptionId,
          stripe_customer_id: user.stripeCustomerId!,
          event_type: 'subscription.cancelled_for_deletion',
          previous_status: user.subscriptionStatus,
          new_status: 'canceled',
          event_data: { 
            reason, 
            feedback, 
            cancelled_for_deletion: true,
            cancelled_at: new Date() 
          },
        });

        console.log(`✅ Cancelled subscription for account deletion`);
      } catch (stripeError) {
        console.error('❌ Error cancelling subscription during account deletion:', stripeError);
        // Continue with account deletion even if subscription cancellation fails
        // This ensures users can still delete their accounts
      }
    }

    // Mark account for deletion (soft delete approach)
    const deletionTimestamp = new Date();
    await db
      .update(schema.users)
      .set({
        // Clear sensitive data
        email: `deleted_${userId}@deleted.local`,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        profileImageUrl: null,
        // Mark as deleted
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null,
        // Keep stripe customer ID for potential billing cleanup
        updatedAt: deletionTimestamp,
      })
      .where(eq(schema.users.id, userId));

    // Log the account deletion
    try {
      await db.insert(schema.subscription_events).values({
        user_id: userId,
        stripe_subscription_id: cancelledSubscription?.id || null,
        stripe_customer_id: user.stripeCustomerId || null,
        event_type: 'account.deleted',
        previous_status: user.subscriptionStatus,
        new_status: 'deleted',
        event_data: { 
          reason, 
          feedback,
          deletion_timestamp: deletionTimestamp,
          email: user.email, // Keep original email in logs for audit
        },
      });
    } catch (logError) {
      console.warn('Failed to log account deletion event:', logError);
    }

    console.log(`✅ Successfully deleted account for user ${userId}`);

    res.json({
      success: true,
      message: 'Account deleted successfully',
      details: {
        subscriptionCancelled: !!cancelledSubscription,
        deletedAt: deletionTimestamp,
      },
    });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/account/deletion-info - Get info about what account deletion entails
router.get('/deletion-info', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasActiveSubscription = user.stripeSubscriptionId && user.subscriptionStatus !== 'canceled';

    res.json({
      hasActiveSubscription,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      email: user.email,
      memberSince: user.createdAt,
      consequences: [
        'Your account and all associated data will be permanently deleted',
        'Any active subscription will be immediately cancelled',
        'You will stop being charged for any subscriptions',
        'This action cannot be undone',
        'You will need to create a new account to use our services again'
      ]
    });
  } catch (error) {
    console.error('❌ Error fetching deletion info:', error);
    res.status(500).json({
      error: 'Failed to fetch account deletion information',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;