import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

// Webhook endpoint for Stripe subscription events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // Verify webhook signature - REQUIRED for security
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured - rejecting webhook');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }
    
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Stripe webhook signature verified');

    console.log(`🔄 Processing Stripe webhook event: ${event.type}`);

    // Log the event for audit purposes
    try {
      await db.insert(schema.subscription_events).values({
        user_id: '', // Will be filled by specific handlers
        event_type: event.type,
        stripe_event_id: event.id,
        event_data: event.data,
        processed_at: new Date(),
      });
    } catch (logError) {
      console.warn('Failed to log subscription event:', logError);
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event);
        break;
      default:
        console.log(`⚡ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('❌ Stripe webhook error:', err);
    res.status(400).json({ error: 'Webhook error', message: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Handle subscription creation
async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log(`📝 Subscription created: ${subscription.id}`);

  try {
    // Find user by Stripe customer ID
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.stripeCustomerId, subscription.customer as string));

    if (!user) {
      console.error(`User not found for customer: ${subscription.customer}`);
      return;
    }

    // Update user with subscription info
    await db
      .update(schema.users)
      .set({
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlan: getSubscriptionPlan(subscription),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));

    // Log the event with user context
    await db.insert(schema.subscription_events).values({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      event_type: 'subscription.created',
      new_status: subscription.status,
      event_data: subscription,
    });

    console.log(`✅ Updated user ${user.id} with new subscription ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription>;
  
  console.log(`📝 Subscription updated: ${subscription.id}`);

  try {
    // Find user by subscription ID
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.stripeSubscriptionId, subscription.id));

    if (!user) {
      console.error(`User not found for subscription: ${subscription.id}`);
      return;
    }

    const previousStatus = previousAttributes.status || user.subscriptionStatus;

    // Update user subscription info
    await db
      .update(schema.users)
      .set({
        subscriptionStatus: subscription.status,
        subscriptionPlan: getSubscriptionPlan(subscription),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));

    // Log the event
    await db.insert(schema.subscription_events).values({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      event_type: 'subscription.updated',
      previous_status: previousStatus,
      new_status: subscription.status,
      event_data: subscription,
    });

    console.log(`✅ Updated user ${user.id} subscription status: ${previousStatus} → ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log(`🚫 Subscription cancelled: ${subscription.id}`);

  try {
    // Find user by subscription ID
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.stripeSubscriptionId, subscription.id));

    if (!user) {
      console.error(`User not found for subscription: ${subscription.id}`);
      return;
    }

    // Update user to canceled status (using Stripe's canonical spelling)
    await db
      .update(schema.users)
      .set({
        subscriptionStatus: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));

    // Log the event
    await db.insert(schema.subscription_events).values({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      event_type: 'subscription.cancelled',
      previous_status: user.subscriptionStatus,
      new_status: 'canceled',
      event_data: subscription,
    });

    console.log(`✅ Cancelled subscription for user ${user.id}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  console.log(`💰 Payment succeeded for invoice: ${invoice.id}`);

  // Cast to handle subscription invoices
  const subscriptionInvoice = invoice as Stripe.Invoice & { subscription?: string };
  if (subscriptionInvoice.subscription) {
    try {
      // Find user by subscription ID
      const subscriptionId = subscriptionInvoice.subscription as string;
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.stripeSubscriptionId, subscriptionId));

      if (user) {
        // Update subscription status to active
        await db
          .update(schema.users)
          .set({
            subscriptionStatus: 'active',
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, user.id));

        // Log the event
        await db.insert(schema.subscription_events).values({
          user_id: user.id,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: invoice.customer as string,
          event_type: 'payment.succeeded',
          new_status: 'active',
          event_data: invoice,
        });

        console.log(`✅ Payment succeeded for user ${user.id}`);
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }
}

// Handle failed payment
async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  console.log(`❌ Payment failed for invoice: ${invoice.id}`);

  // Cast to handle subscription invoices
  const subscriptionInvoice = invoice as Stripe.Invoice & { subscription?: string };
  if (subscriptionInvoice.subscription) {
    try {
      // Find user by subscription ID
      const subscriptionId = subscriptionInvoice.subscription as string;
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.stripeSubscriptionId, subscriptionId));

      if (user) {
        // Update subscription status to past_due
        await db
          .update(schema.users)
          .set({
            subscriptionStatus: 'past_due',
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, user.id));

        // Log the event
        await db.insert(schema.subscription_events).values({
          user_id: user.id,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: invoice.customer as string,
          event_type: 'payment.failed',
          previous_status: user.subscriptionStatus,
          new_status: 'past_due',
          event_data: invoice,
        });

        console.log(`⚠️ Payment failed for user ${user.id} - marked as past_due`);
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log(`⏰ Trial ending soon for subscription: ${subscription.id}`);

  try {
    // Find user by subscription ID
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.stripeSubscriptionId, subscription.id));

    if (user) {
      // Log the event
      await db.insert(schema.subscription_events).values({
        user_id: user.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        event_type: 'trial.ending',
        event_data: subscription,
      });

      console.log(`⏰ Trial ending notification for user ${user.id}`);
      // Here you could send an email notification or in-app notification
    }
  } catch (error) {
    console.error('Error handling trial ending:', error);
  }
}

// Helper function to extract subscription plan from Stripe subscription
function getSubscriptionPlan(subscription: Stripe.Subscription): string {
  if (subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id;
    
    // Map Stripe price IDs to plan names (updated with live price IDs)
    const priceToPlans: Record<string, string> = {
      // Parent plans
      'price_1Rr3gL8iKZXV0srZmfuD32yv': 'essential',
      'price_1Rr3hR8iKZXV0srZ5lPscs0p': 'premium', 
      'price_1S36QJ8iKZXV0srZsrhA6ess': 'hero',
      // Advocate plans - monthly
      'price_1S6c6r8iKZXV0srZEedxCBJ7': 'starter',
      'price_1SAeKP8iKZXV0srZoIstW64Q': 'pro', // NEW LIVE monthly price ID
      'price_1S6c6t8iKZXV0srZDefEOrXY': 'agency',
      // Advocate plans - annual
      'price_1S6c6r8iKZXV0srZstPTLriI': 'starter-annual',
      'price_1SAeLZ8iKZXV0srZ3VtZqVpT': 'pro-annual', // NEW LIVE annual price ID
      'price_1S6c6t8iKZXV0srZBu8sZgYD': 'agency-annual',
      // Legacy price IDs (keep for existing subscriptions)
      'price_1S6c6s8iKZXV0srZUQl201V9': 'pro', // Old test monthly
      'price_1S6c6s8iKZXV0srZ0645Yqpi': 'pro-annual', // Old test annual
    };
    
    return priceToPlans[priceId] || 'unknown';
  }
  
  return 'unknown';
}

export default router;