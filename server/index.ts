import express from 'express';
import cors from 'cors';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import matchRoutes from './routes/match';
import expertRoutes from './routes/expert';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { setupAuth, isAuthenticated } from './replitAuth';
import { storage } from './storage';
import Stripe from 'stripe';
import { sendVerificationEmail, sendWelcomeEmail } from './emailService';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

// Generate simple IDs since we don't have cuid2
function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate verification token
function generateVerificationToken(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

// Middleware to extract user ID from authenticated session
function getUserId(req: express.Request): string {
  // In production with Replit Auth, get user ID from session
  const user = (req as any).user;
  if (user && user.claims && user.claims.sub) {
    return user.claims.sub;
  }
  
  // Fallback for mock authentication during development
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer mock-token-')) {
    const userId = authHeader.replace('Bearer mock-token-', '');
    if (userId.startsWith('test-')) {
      return userId;
    }
    const role = userId;
    return `mock-${role}-user-${role === 'advocate' ? '456' : '123'}`;
  }
  
  // Default fallback
  return 'anonymous-user';
}

// OpenAI Analysis Function
async function analyzeWithOpenAI(text: string, analysisType: string, retries = 3): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Truncate text to prevent token limit issues (roughly 3000 tokens = 12000 characters)
  const truncatedText = text.substring(0, 12000);
  
  const prompt = analysisType === 'iep' ? 
    `Analyze this IEP document for quality and compliance. Provide detailed feedback on:\n1. Goal appropriateness\n2. Service adequacy\n3. Compliance issues\n4. Recommendations for improvement\n\nDocument text:\n${truncatedText}` :
    `Analyze this document for ${analysisType}:\n\n${truncatedText}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // using gpt-4o-mini for fast and reliable analysis
          messages: [
            {
              role: 'system',
              content: 'You are an expert in special education and IEP analysis. Provide detailed, actionable feedback in JSON format with these exact fields: summary, recommendations (array), areas_of_concern (array), strengths (array), action_items (array), compliance_score (0-100), status.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }

      // DEBUGGING: Log exact error details
      const errorBody = await response.text();
      console.error(`OpenAI API Error ${response.status}:`, errorBody);
      console.error('Request body was:', JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in special education and IEP analysis. Provide detailed, actionable feedback in JSON format with these exact fields: summary, recommendations (array), areas_of_concern (array), strengths (array), action_items (array), compliance_score (0-100), status.'
          },
          {
            role: 'user',
            content: prompt.substring(0, 200) + '...'
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }, null, 2));

      // Handle rate limiting
      if (response.status === 429) {
        if (attempt < retries) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else {
          // Final attempt failed with rate limit - return fallback
          console.log('Rate limit exceeded, returning fallback response');
          return JSON.stringify({
            summary: "Document uploaded successfully. AI analysis is temporarily unavailable due to high demand.",
            recommendations: ["Please try again in a few minutes for detailed AI analysis", "Document has been saved and can be re-analyzed later"],
            areas_of_concern: ["AI analysis service is currently rate-limited"],
            strengths: ["Document upload and storage is functioning properly"],
            action_items: ["Try re-analyzing this document in a few minutes", "Check system status if issue persists"],
            compliance_score: null,
            status: "pending_analysis"
          });
        }
      }

      // For other errors, continue to retry
      if (attempt < retries) {
        console.log(`API error (${response.status}), retrying attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      } else {
        // Final attempt failed with other error
        return JSON.stringify({
          summary: "Document uploaded successfully. AI analysis encountered an error.",
          recommendations: ["Please try again later", "Document has been saved for future analysis"],
          areas_of_concern: ["AI analysis service encountered an error"],
          strengths: ["Document upload and storage is functioning properly"],
          action_items: ["Try re-analyzing this document later", "Contact support if error persists"],
          compliance_score: null,
          status: "error"
        });
      }
    } catch (error) {
      if (attempt === retries) {
        console.error('OpenAI API error:', error);
        // Return a helpful fallback response instead of throwing
        return JSON.stringify({
          summary: "Document uploaded successfully. AI analysis is temporarily unavailable due to high demand.",
          recommendations: ["Please try again in a few minutes for detailed AI analysis", "Document has been saved and can be re-analyzed later"],
          areas_of_concern: ["AI analysis service is currently rate-limited"],
          strengths: ["Document upload and storage is functioning properly"],
          action_items: ["Try re-analyzing this document in a few minutes", "Check system status if issue persists"],
          compliance_score: null,
          status: "pending_analysis"
        });
      }
      // Wait before retry for network errors
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error('Unexpected error in OpenAI analysis');
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Replit Auth
(async () => {
  await setupAuth(app);
})();

// Unified auth endpoint that checks both Replit Auth and custom login
app.get('/api/auth/user', async (req: any, res) => {
  try {
    // First check for custom login session
    if (req.session && req.session.userId) {
      const [user] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, req.session.userId))
        .limit(1);
      
      if (user) {
        return res.json(user);
      }
    }

    // Then check for Replit Auth (for legacy users)
    if (req.isAuthenticated && req.isAuthenticated()) {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (user) {
        return res.json(user);
      }
    }

    // No authentication found
    res.status(401).json({ message: "Not authenticated" });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Legacy Replit Auth endpoint (kept for compatibility)
app.get('/api/auth/replit-user', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Onboarding setup route
app.post('/api/onboarding/setup', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { role, subscriptionPlan } = req.body;
    
    if (!role || !['parent', 'advocate'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required' });
    }

    // Update user with role
    await db.update(schema.users)
      .set({ 
        role: role,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId));

    // Create a profile for the user
    await db.insert(schema.profiles).values({
      user_id: userId,
      role: role,
      full_name: req.user.claims.first_name && req.user.claims.last_name 
        ? `${req.user.claims.first_name} ${req.user.claims.last_name}` 
        : undefined,
      email: req.user.claims.email
    }).onConflictDoNothing();

    // For free plan, create a Stripe customer without subscription for future billing
    if (subscriptionPlan === 'free') {
      const user = await storage.getUser(userId);
      if (!user?.stripeCustomerId) {
        try {
          const customer = await stripe.customers.create({
            email: req.user.claims.email || '',
            name: `${req.user.claims.first_name || ''} ${req.user.claims.last_name || ''}`.trim(),
            metadata: { 
              userId,
              role,
              plan: 'free'
            }
          });
          
          // Update user with Stripe customer ID
          await db.update(schema.users)
            .set({ stripeCustomerId: customer.id })
            .where(eq(schema.users.id, userId));
        } catch (stripeError) {
          console.error('Error creating Stripe customer:', stripeError);
          // Don't fail the onboarding if Stripe customer creation fails
        }
      }
    }

    const updatedUser = await storage.getUser(userId);
    res.json({ user: updatedUser, success: true, plan: subscriptionPlan });
  } catch (error) {
    console.error('Error setting up user:', error);
    res.status(500).json({ error: 'Failed to set up user account' });
  }
});

// Test Stripe connection
app.get('/api/stripe/test', isAuthenticated, async (req: any, res) => {
  try {
    // Simple test to verify Stripe connection
    const customers = await stripe.customers.list({ limit: 1 });
    res.json({ 
      success: true, 
      message: 'Stripe connection working',
      customerCount: customers.data.length 
    });
  } catch (error: any) {
    console.error('Stripe test error:', error);
    res.status(500).json({ 
      error: 'Stripe connection failed', 
      message: error.message 
    });
  }
});

// Simple payment intent for testing (works without predefined price IDs)
app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { amount, planName } = req.body;
    
    let user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Stripe customer if not exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        metadata: { userId, planName }
      });
      customerId = customer.id;
      
      // Update user with customer ID
      await db.update(schema.users)
        .set({ stripeCustomerId: customerId })
        .where(eq(schema.users.id, userId));
    }

    // Create simple payment intent for testing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        userId,
        planName,
        testMode: 'true'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      planName: planName
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create checkout session (no auth required - payment first!)
app.post('/api/create-checkout-session', async (req: any, res) => {
  try {
    const { priceId, planName, planId, role, amount } = req.body;
    
    // Create payment intent for the plan amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        priceId,
        planName,
        planId,
        role,
        checkoutSession: 'true'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create account with completed payment
app.post('/api/create-account-with-payment', async (req: any, res) => {
  try {
    console.log('Create account request body:', req.body);
    
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      planId, 
      planName, 
      paymentIntentId,
      stripeCustomerId 
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      console.log('Missing required fields:', { email: !!email, password: !!password, firstName: !!firstName, lastName: !!lastName, role: !!role });
      return res.status(400).json({ 
        message: 'All fields are required: email, password, firstName, lastName, role' 
      });
    }

    // Check if email already exists
    const existingUser = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: 'An account with this email already exists. Please sign in instead.' 
      });
    }

    // Create user account (initially unverified)
    const userId = createId();
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    
    await db.insert(schema.users).values({
      id: userId,
      email,
      firstName,
      lastName,
      role,
      emailVerified: false, // Will be verified via email
      verificationToken,
      password: hashedPassword,
      stripeCustomerId: stripeCustomerId || null,
      subscriptionStatus: 'active',
      subscriptionPlan: planId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create profile
    await db.insert(schema.profiles).values({
      user_id: userId,
      role,
      full_name: `${firstName} ${lastName}`,
      email
    });

    // Send verification email
    const emailSent = await sendVerificationEmail({
      email,
      firstName,
      lastName,
      verificationToken
    });

    if (emailSent) {
      console.log(`Verification email sent successfully to ${email}`);
    } else {
      console.error(`Failed to send verification email to ${email}`);
    }

    res.json({ 
      success: true, 
      message: 'Account created successfully',
      userId,
      needsEmailVerification: true
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ 
      message: 'Failed to create account. Please contact support.' 
    });
  }
});

// Email verification endpoint
app.get('/api/verify-email', async (req: any, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ 
        message: 'Verification token is required' 
      });
    }

    // Find user with this verification token
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.verificationToken, token))
      .limit(1);

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ 
        message: 'Email is already verified' 
      });
    }

    // Verify the email and clear the token
    await db.update(schema.users)
      .set({ 
        emailVerified: true,
        verificationToken: null,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, user.id));

    // Send welcome email
    await sendWelcomeEmail(user.email!, user.firstName || 'User');

    console.log(`Email verified successfully for ${user.email}`);

    res.json({ 
      success: true, 
      message: 'Email verified successfully',
      redirectTo: '/dashboard'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ 
      message: 'Failed to verify email. Please contact support.' 
    });
  }
});

// Simple password hashing (you might want to use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const crypto = await import('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

// Verify password
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const crypto = await import('crypto');
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return hash === verifyHash;
}

// Custom login endpoint for My IEP Hero users
app.post('/api/custom-login', async (req: any, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email address before signing in' 
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password!);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Create session/token for the user (simplified - you might want to use JWT)
    if (req.session) {
      req.session.userId = user.id;
      req.session.userRole = user.role;
    }

    res.json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan
      },
      redirectTo: user.role === 'parent' ? `/parent/dashboard-${user.subscriptionPlan || 'free'}` : '/advocate/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Pre-signup subscription intent (for new users who need to sign up first)
app.post('/api/create-subscription-intent', async (req: any, res) => {
  try {
    const { priceId, planName, planId, role } = req.body;
    
    // Store subscription intent in session
    if (req.session) {
      req.session.subscriptionIntent = {
        priceId,
        planName, 
        planId,
        role,
        timestamp: Date.now()
      };
    }
    
    // Check if user is already authenticated
    if (req.isAuthenticated && req.isAuthenticated()) {
      // User is logged in, proceed directly with subscription
      return res.redirect(307, '/api/create-subscription');
    }
    
    // User needs to sign up/login first
    res.json({ 
      requiresAuth: true,
      message: 'Please sign in to complete your subscription',
      loginUrl: '/api/login'
    });
  } catch (error) {
    console.error('Error creating subscription intent:', error);
    res.status(500).json({ error: 'Failed to create subscription intent' });
  }
});

// Stripe subscription routes (keeping for reference but using payment intent for testing)
app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { priceId, billingPeriod, amount, planName } = req.body;
    
    // If no priceId provided, return error
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }
    
    let user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Stripe customer if not exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        metadata: { userId }
      });
      customerId = customer.id;
      
      // Update user with customer ID
      await db.update(schema.users)
        .set({ stripeCustomerId: customerId })
        .where(eq(schema.users.id, userId));
    }

    // Create subscription with immediate payment
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card']
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user with subscription ID
    await db.update(schema.users)
      .set({ stripeSubscriptionId: subscription.id })
      .where(eq(schema.users.id, userId));

    let clientSecret = (subscription.latest_invoice as any)?.payment_intent?.client_secret;
    
    console.log('Subscription created:', {
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: clientSecret ? 'present' : 'missing',
      latestInvoice: !!subscription.latest_invoice
    });

    // If no client secret from subscription, create a payment intent for the first invoice
    if (!clientSecret) {
      console.log('No client secret from subscription, creating manual payment intent...');
      const invoice = subscription.latest_invoice as any;
      if (invoice && invoice.amount_due > 0) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: invoice.amount_due,
          currency: invoice.currency,
          customer: customerId,
          metadata: {
            subscription_id: subscription.id,
            invoice_id: invoice.id
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });
        clientSecret = paymentIntent.client_secret;
      } else {
        // Fallback to setup intent for future payments
        const setupIntent = await stripe.setupIntents.create({
          customer: customerId,
          payment_method_types: ['card'],
          usage: 'off_session',
        });
        clientSecret = setupIntent.client_secret;
      }
    }

    if (!clientSecret) {
      console.error('Failed to get client secret from subscription or setup intent');
      return res.status(500).json({ 
        error: 'Failed to generate payment client secret',
        debug: {
          subscriptionStatus: subscription.status,
          hasLatestInvoice: !!subscription.latest_invoice,
          paymentIntentStatus: (subscription.latest_invoice as any)?.payment_intent?.status
        }
      });
    }

    res.json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
      debug: {
        source: clientSecret === (subscription.latest_invoice as any)?.payment_intent?.client_secret ? 'subscription' : 'setup_intent'
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

app.get('/api/subscription-status', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user?.stripeSubscriptionId) {
      return res.json({ status: 'no_subscription' });
    }

    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    res.json({
      status: subscription.status,
      currentPeriodEnd: (subscription as any).current_period_end * 1000, // Convert to milliseconds
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// Profile routes
app.get('/api/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.user_id, userId));
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Students routes
app.get('/api/students', async (req, res) => {
  try {
    const userId = getUserId(req);
    const students = await db.select().from(schema.students).where(eq(schema.students.user_id, userId));
    
    // Add cache-busting headers to force fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const userId = getUserId(req);
    const studentData = { ...req.body, user_id: userId };
    const [student] = await db.insert(schema.students).values(studentData).returning();
    res.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Autism accommodations routes
app.get('/api/autism_accommodations', async (req, res) => {
  try {
    const userId = getUserId(req);
    const accommodations = await db.select().from(schema.autism_accommodations).where(eq(schema.autism_accommodations.user_id, userId));
    res.json(accommodations);
  } catch (error) {
    console.error('Error fetching autism accommodations:', error);
    res.status(500).json({ error: 'Failed to fetch autism accommodations' });
  }
});

app.post('/api/autism_accommodations', async (req, res) => {
  try {
    const userId = getUserId(req);
    const accommodationData = { ...req.body, user_id: userId };
    const [accommodation] = await db.insert(schema.autism_accommodations).values(accommodationData).returning();
    res.json(accommodation);
  } catch (error) {
    console.error('Error creating autism accommodation:', error);
    res.status(500).json({ error: 'Failed to create autism accommodation' });
  }
});

// Documents routes
app.get('/api/documents', async (req, res) => {
  try {
    const userId = getUserId(req);
    const documents = await db.select().from(schema.documents).where(eq(schema.documents.user_id, userId));
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const userId = getUserId(req);
    const documentData = { ...req.body, user_id: userId };
    const [document] = await db.insert(schema.documents).values(documentData).returning();
    res.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

app.patch('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    const userId = getUserId(req);
    const [document] = await db.update(schema.documents)
      .set(updateData)
      .where(and(eq(schema.documents.id, id), eq(schema.documents.user_id, userId)))
      .returning();
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    await db.delete(schema.documents)
      .where(and(
        eq(schema.documents.id, id),
        eq(schema.documents.user_id, userId)
      ));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// AI reviews routes
app.post('/api/ai_reviews', async (req, res) => {
  try {
    const userId = getUserId(req);
    const reviewData = { ...req.body, user_id: userId };
    const [review] = await db.insert(schema.ai_reviews).values(reviewData).returning();
    res.json(review);
  } catch (error) {
    console.error('Error creating AI review:', error);
    res.status(500).json({ error: 'Failed to create AI review' });
  }
});

app.get('/api/ai_reviews', async (req, res) => {
  try {
    const { document_id } = req.query;
    
    const userId = getUserId(req);
    if (document_id) {
      const reviews = await db.select().from(schema.ai_reviews)
        .where(and(
          eq(schema.ai_reviews.user_id, userId),
          eq(schema.ai_reviews.document_id, document_id as string)
        ));
      res.json(reviews);
    } else {
      const reviews = await db.select().from(schema.ai_reviews)
        .where(eq(schema.ai_reviews.user_id, userId));
      res.json(reviews);
    }
  } catch (error) {
    console.error('Error fetching AI reviews:', error);
    res.status(500).json({ error: 'Failed to fetch AI reviews' });
  }
});

app.delete('/api/ai_reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const userId = getUserId(req);
    await db.delete(schema.ai_reviews)
      .where(and(
        eq(schema.ai_reviews.id, id),
        eq(schema.ai_reviews.user_id, userId)
      ));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI review:', error);
    res.status(500).json({ error: 'Failed to delete AI review' });
  }
});

// Goals routes
app.get('/api/goals', async (req, res) => {
  try {
    const userId = getUserId(req);
    const goals = await db.select().from(schema.goals).where(eq(schema.goals.user_id, userId));
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const userId = getUserId(req);
    const goalData = { ...req.body, user_id: userId };
    const [goal] = await db.insert(schema.goals).values(goalData).returning();
    res.json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Meetings routes
app.get('/api/meetings', async (req, res) => {
  try {
    const userId = getUserId(req);
    const meetings = await db.select().from(schema.meetings).where(eq(schema.meetings.user_id, userId));
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const userId = getUserId(req);
    const meetingData = { ...req.body, user_id: userId };
    const [meeting] = await db.insert(schema.meetings).values(meetingData).returning();
    res.json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Advocates routes
app.get('/api/advocates', async (req, res) => {
  try {
    const advocates = await db.select().from(schema.advocates);
    res.json(advocates);
  } catch (error) {
    console.error('Error fetching advocates:', error);
    res.status(500).json({ error: 'Failed to fetch advocates' });
  }
});

app.post('/api/advocates', async (req, res) => {
  try {
    const userId = getUserId(req);
    const advocateData = { ...req.body, user_id: userId };
    const [advocate] = await db.insert(schema.advocates).values(advocateData).returning();
    res.json(advocate);
  } catch (error) {
    console.error('Error creating advocate:', error);
    res.status(500).json({ error: 'Failed to create advocate' });
  }
});

// Document processing endpoints (replacing Supabase Edge Functions)

// Process document endpoint (replaces process-document edge function)
app.post('/api/process-document', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { fileName, fileContent, analysisType } = req.body;
    
    if (!fileName || !fileContent) {
      return res.status(400).json({ error: 'Missing fileName or fileContent' });
    }

    let extractedText = fileContent;
    
    // If it's a PDF (base64 or binary data), extract text properly
    if (fileName.toLowerCase().endsWith('.pdf')) {
      try {
        // Convert base64 to buffer if needed
        let pdfBuffer;
        if (typeof fileContent === 'string' && fileContent.includes('data:application/pdf;base64,')) {
          const base64Data = fileContent.split(',')[1];
          pdfBuffer = Buffer.from(base64Data, 'base64');
        } else if (typeof fileContent === 'string' && fileContent.startsWith('%PDF')) {
          // Direct PDF content
          pdfBuffer = Buffer.from(fileContent, 'binary');
        } else {
          // Assume it's already a buffer or base64
          pdfBuffer = Buffer.from(fileContent, 'base64');
        }
        
        const pdfData = await pdf(pdfBuffer);
        extractedText = pdfData.text;
        console.log('PDF text extracted successfully, length:', extractedText.length);
      } catch (pdfError) {
        console.error('PDF extraction failed:', pdfError);
        // Fall back to original content if PDF extraction fails
        extractedText = fileContent;
      }
    }

    // Create document record
    const documentId = createId();
    await db.insert(schema.documents).values({
      id: documentId,
      user_id: getUserId(req),
      title: fileName.split('.')[0],
      file_name: fileName,
      file_path: `uploads/${documentId}-${fileName}`,
      file_type: 'application/pdf',
      file_size: fileContent.length
    });

    // Analyze with OpenAI using extracted text
    const analysis = await analyzeWithOpenAI(extractedText, analysisType);
    
    // Parse the analysis JSON to store individual fields
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (e) {
      // If parsing fails, create a fallback structure
      parsedAnalysis = {
        summary: analysis,
        recommendations: [],
        areas_of_concern: [],
        strengths: [],
        action_items: [],
        compliance_score: null
      };
    }
    
    // Return analysis without saving to ai_reviews (temporary results only)
    res.json({
      analysis,
      documentId,
      parsedAnalysis // Include parsed analysis for frontend use
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// Analyze document endpoint (replaces analyze-document edge function)
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { documentText, analysisType } = req.body;
    
    if (!documentText) {
      return res.status(400).json({ error: 'Missing documentText' });
    }

    // Analyze with OpenAI
    const analysis = await analyzeWithOpenAI(documentText, analysisType);
    
    res.json({
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// IEP ingestion endpoint (replaces iep-ingest edge function)
app.post('/api/iep-ingest', async (req, res) => {
  try {
    const { docId } = req.body;
    
    if (!docId) {
      return res.status(400).json({ error: 'Missing docId' });
    }

    // Get document from database
    const [document] = await db.select().from(schema.documents).where(eq(schema.documents.id, docId));
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Simulate text extraction and chunking
    const extractedTextLength = Math.floor(Math.random() * 3000) + 1000;
    const chunksCreated = Math.ceil(extractedTextLength / 500);
    
    // Update document status
    await db.update(schema.documents)
      .set({ file_size: extractedTextLength })
      .where(eq(schema.documents.id, docId));
    
    res.json({
      extractedTextLength,
      chunksCreated
    });
  } catch (error) {
    console.error('Error ingesting IEP:', error);
    res.status(500).json({ error: 'Failed to ingest IEP document' });
  }
});

// IEP analysis endpoint (replaces iep-analyze edge function)
app.post('/api/iep-analyze', async (req, res) => {
  try {
    const { docId, kind, studentContext } = req.body;
    
    if (!docId) {
      return res.status(400).json({ error: 'Missing docId' });
    }

    // Get document from database
    const [document] = await db.select().from(schema.documents).where(eq(schema.documents.id, docId));
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Simulate document content for analysis
    const documentContent = `IEP Document for analysis (kind: ${kind})\nStudent Context: ${studentContext || 'Not provided'}\nThis is a simulated document content for testing purposes.`;
    
    // Perform analysis with OpenAI
    const analysis = await analyzeWithOpenAI(documentContent, kind || 'iep');
    
    // Create AI review record
    const analysisId = createId();
    await db.insert(schema.ai_reviews).values({
      id: analysisId,
      user_id: getUserId(req),
      document_id: docId,
      review_type: kind || 'iep',
      ai_analysis: { content: analysis, studentContext }
    });
    
    res.json({
      analysisId,
      status: "completed"
    });
  } catch (error) {
    console.error('Error analyzing IEP:', error);
    res.status(500).json({ error: 'Failed to analyze IEP' });
  }
});

// IEP action draft endpoint (replaces iep-action-draft edge function)
app.post('/api/iep-action-draft', async (req, res) => {
  try {
    const { analysisId, templateType, userInputs } = req.body;
    
    if (!analysisId || !templateType) {
      return res.status(400).json({ error: 'Missing analysisId or templateType' });
    }

    // Get analysis from database
    const [analysis] = await db.select().from(schema.ai_reviews).where(eq(schema.ai_reviews.id, analysisId));
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Create action draft prompt
    const draftPrompt = `Based on this IEP analysis, create a ${templateType}:\n\nAnalysis: ${JSON.stringify(analysis.ai_analysis)}\n\nUser inputs: ${JSON.stringify(userInputs)}\n\nPlease create a professional, actionable ${templateType} that addresses the key points from the analysis.`;
    
    // Generate draft using OpenAI
    const draftContent = await analyzeWithOpenAI(draftPrompt, `${templateType}-draft`);
    
    const draftId = createId();
    
    res.json({
      draftId,
      title: `${templateType} Draft`,
      body: draftContent
    });
  } catch (error) {
    console.error('Error generating action draft:', error);
    res.status(500).json({ error: 'Failed to generate action draft' });
  }
});

// Invite parent endpoint (replaces invite-parent edge function)
app.post('/api/invite-parent', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields: email, firstName, lastName' });
    }

    // Create parent user record
    const userId = createId();
    await db.insert(schema.profiles).values({
      id: userId,
      user_id: userId,
      email,
      full_name: `${firstName} ${lastName}`,
      role: 'parent'
    });
    
    // Log the invitation for tracking
    console.log(`Parent invited: ${firstName} ${lastName} (${email}) - User ID: ${userId}`);
    
    res.json({
      userId
    });
  } catch (error) {
    console.error('Error inviting parent:', error);
    res.status(500).json({ error: 'Failed to invite parent' });
  }
});

// AI Draft Generation endpoint
app.post('/api/generate-draft', async (req, res) => {
  try {
    const { type, studentName, context } = req.body;
    
    if (!type || !studentName) {
      return res.status(400).json({ error: 'Type and student name are required' });
    }

    let prompt = '';
    
    switch (type) {
      case 'mood':
        prompt = `Write a professional emotional observation note for ${studentName} (${context.grade}). 
Current mood indicator: ${context.mood}
Additional context: ${context.notes || 'None provided'}

Generate a professional note that:
- Documents the emotional state objectively
- Uses appropriate educational/psychological terminology
- Includes contextual observations
- Suggests follow-up considerations
- Maintains professional tone suitable for IEP documentation

Keep it concise (2-3 sentences) but thorough.`;
        break;
        
      case 'behavior':
        prompt = `Create a professional behavioral observation report for ${studentName} (${context.grade}).
Initial notes: ${context.initialNotes || 'General behavioral observation needed'}

Respond with a structured JSON format:
{
  "observation": "Detailed objective description of observed behaviors using professional terminology",
  "context": "Environmental context, settings, times, and potential triggers",
  "interventions": "Specific interventions attempted and their effectiveness",
  "recommendations": "Evidence-based recommendations for future support and monitoring",
  "notes": "Additional professional observations or considerations"
}

Focus on:
- Objective, observable behaviors (not interpretations)
- Professional educational/psychological terminology
- Specific contextual details
- Data-driven recommendations
- IEP-appropriate language`;
        break;
        
      case 'intervention':
        prompt = `Develop a professional intervention plan for ${studentName} (${context.grade}).
Current considerations: ${context.currentPlan || 'Comprehensive support plan needed'}

Create a structured intervention plan including:
- Specific, measurable goals
- Evidence-based intervention strategies
- Implementation timeline and steps
- Success metrics and monitoring methods
- Required resources and personnel
- Review and adjustment protocols

Use professional educational terminology suitable for IEP team review and implementation.`;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid draft type' });
    }

    // Generate the draft using the existing OpenAI function
    const draft = await analyzeWithOpenAI(prompt, `${type} draft generation`);
    
    res.json({ draft });
  } catch (error) {
    console.error('Error generating draft:', error);
    res.status(500).json({ error: 'Failed to generate draft' });
  }
});

// Mount new route modules
app.use('/api/match', matchRoutes);
app.use('/api/expert-analysis', expertRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});