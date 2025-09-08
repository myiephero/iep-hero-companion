import express from 'express';
import cors from 'cors';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import matchRoutes from './routes/match';
import expertRoutes from './routes/expert';
import feedbackRoutes from './routes/feedback';
import messagingRoutes from './routes/messaging';
import simpleMessagingRoutes from './routes/simple-messages';
// Removed non-existent main routes import
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { setupAuth, isAuthenticated } from './replitAuth';
import { storage } from './storage';
import Stripe from 'stripe';
import { sendVerificationEmail, sendWelcomeEmail } from './emailService';
import { getUserId } from './utils';
import { standardsAnalyzer } from './standards-analyzer';
import { ALL_STANDARDS, STATE_SPECIFIC_STANDARDS } from './standards-database';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

// Generate simple IDs since we don't have cuid2
function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate verification token
function generateVerificationToken(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

// Helper function to get accommodation templates
function getAccommodationTemplates() {
  return {
    sensory: [
      { id: "noise-canceling", title: "Noise-Canceling Headphones", description: "Provide noise-canceling headphones for noisy environments", category: "sensory", accommodation_type: "environmental" },
      { id: "sensory-breaks", title: "Sensory Breaks", description: "Regular breaks to sensory room or quiet space every 30 minutes", category: "sensory", accommodation_type: "schedule" },
      { id: "fidget-tools", title: "Fidget Tools", description: "Allow use of fidget toys or stress balls during instruction", category: "sensory", accommodation_type: "material" },
      { id: "weighted-blanket", title: "Weighted Lap Pad", description: "Use of weighted lap pad for self-regulation during work time", category: "sensory", accommodation_type: "material" },
      { id: "lighting", title: "Lighting Adjustments", description: "Adjusted lighting or seating away from fluorescent lights", category: "sensory", accommodation_type: "environmental" }
    ],
    communication: [
      { id: "visual-schedules", title: "Visual Schedules", description: "Visual schedules and social stories for transitions", category: "communication", accommodation_type: "visual_support" },
      { id: "communication-device", title: "AAC Device", description: "Access to AAC device or picture cards for communication", category: "communication", accommodation_type: "technology" },
      { id: "peer-support", title: "Peer Support", description: "Structured peer interaction opportunities", category: "communication", accommodation_type: "social" },
      { id: "social-scripts", title: "Social Scripts", description: "Pre-written social scripts for common situations", category: "communication", accommodation_type: "instructional" }
    ],
    academic: [
      { id: "extended-time", title: "Extended Time", description: "Extended time for assignments and tests (1.5x)", category: "academic", accommodation_type: "timing" },
      { id: "chunking", title: "Task Chunking", description: "Breaking assignments into smaller, manageable chunks", category: "academic", accommodation_type: "instructional" },
      { id: "visual-supports", title: "Visual Supports", description: "Visual supports and graphic organizers for learning", category: "academic", accommodation_type: "visual_support" },
      { id: "repetition", title: "Repeated Instructions", description: "Repeated instructions and clarification as needed", category: "academic", accommodation_type: "instructional" }
    ],
    social: [
      { id: "social-skills-group", title: "Social Skills Group", description: "Participation in structured social skills group sessions", category: "social", accommodation_type: "social" },
      { id: "peer-buddy", title: "Peer Buddy System", description: "Assignment of peer buddy for social support", category: "social", accommodation_type: "social" },
      { id: "lunch-club", title: "Lunch Club", description: "Structured lunch club for social interaction practice", category: "social", accommodation_type: "social" }
    ],
    behavioral: [
      { id: "behavior-plan", title: "Positive Behavior Support Plan", description: "Individualized positive behavior support plan", category: "behavioral", accommodation_type: "behavioral" },
      { id: "break-cards", title: "Break Request Cards", description: "Visual cards to request breaks when overwhelmed", category: "behavioral", accommodation_type: "self_regulation" },
      { id: "calm-down-space", title: "Calm Down Space", description: "Access to designated calm down space when needed", category: "behavioral", accommodation_type: "environmental" }
    ],
    environmental: [
      { id: "preferential-seating", title: "Preferential Seating", description: "Seating near teacher, away from distractions", category: "environmental", accommodation_type: "environmental" },
      { id: "quiet-space", title: "Access to Quiet Space", description: "Access to quiet space for work completion", category: "environmental", accommodation_type: "environmental" },
      { id: "reduced-stimuli", title: "Reduced Environmental Stimuli", description: "Minimize visual and auditory distractions in workspace", category: "environmental", accommodation_type: "environmental" }
    ]
  };
}

// Helper function to generate IEP language from accommodations
function generateIEPLanguage(accommodations: any[], format: string = 'formal') {
  const categorizedAccommodations = accommodations.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  let iepLanguage = '';

  if (format === 'formal') {
    iepLanguage += "ACCOMMODATIONS AND MODIFICATIONS\n\n";
    
    Object.entries(categorizedAccommodations).forEach(([category, items]: [string, any]) => {
      iepLanguage += `${category.toUpperCase()} SUPPORTS:\n`;
      items.forEach((item: any) => {
        iepLanguage += `• ${item.title}: ${item.description}\n`;
        if (item.implementation_notes) {
          iepLanguage += `  Implementation: ${item.implementation_notes}\n`;
        }
      });
      iepLanguage += '\n';
    });
  } else {
    // Bullet point format
    accommodations.forEach((item) => {
      iepLanguage += `• ${item.title} - ${item.description}\n`;
    });
  }

  return iepLanguage;
}

// Helper function to generate accommodation preview
function generateAccommodationPreview(accommodations: any[], student: any, templateType: string = 'iep') {
  const studentName = student?.full_name || 'Student';
  const grade = student?.grade_level || 'N/A';
  
  let preview = '';
  
  if (templateType === 'iep') {
    preview = `INDIVIDUALIZED EDUCATION PROGRAM (IEP)
ACCOMMODATION PLAN

Student: ${studentName}
Grade: ${grade}
Date: ${new Date().toLocaleDateString()}

AUTISM-SPECIFIC ACCOMMODATIONS:

`;
    
    const categorized = accommodations.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    Object.entries(categorized).forEach(([category, items]: [string, any]) => {
      preview += `${category.toUpperCase()} SUPPORTS:\n`;
      items.forEach((item: any) => {
        preview += `• ${item.title}\n  ${item.description}\n`;
        if (item.implementation_notes) {
          preview += `  Implementation Notes: ${item.implementation_notes}\n`;
        }
      });
      preview += '\n';
    });
  } else if (templateType === '504') {
    preview = `SECTION 504 ACCOMMODATION PLAN

Student: ${studentName}
Grade: ${grade}
Date: ${new Date().toLocaleDateString()}

The following accommodations will be provided to ensure equal access to education:

`;
    accommodations.forEach((item) => {
      preview += `${item.title}: ${item.description}\n`;
    });
  }

  return preview;
}

// getUserId is imported from './utils' - using the database-based version

// Helper function to get or create advocate profile
async function getOrCreateAdvocateProfile(userId: string) {
  // First check if advocate profile exists
  let advocate = await db.select().from(schema.advocates)
    .where(eq(schema.advocates.user_id, userId))
    .then(results => results[0]);
  
  if (!advocate) {
    // Get user details to create advocate profile
    const user = await storage.getUser(userId);
    if (user) {
      const [newAdvocate] = await db.insert(schema.advocates)
        .values({
          user_id: userId,
          full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Advocate',
          email: user.email || '',
          phone: null, // phoneNumber field doesn't exist in current schema
          bio: '',
          location: '',
          specializations: [],
          certifications: [],
          education: '',
          years_experience: 0,
          languages: ['English'],
          case_types: [],
          rate_per_hour: 150,
          availability: 'weekdays',
          rating: 0,
          total_reviews: 0,
          verification_status: 'pending',
          status: 'active',
          profile_image_url: user.profileImageUrl
        })
        .returning();
      advocate = newAdvocate;
    }
  }
  
  return advocate;
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
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Unified auth endpoint that checks both Replit Auth and custom login
app.get('/api/auth/user', async (req: any, res) => {
  try {
    // Use the unified getUserId function to check both token-based and Replit auth
    const userId = await getUserId(req);
    
    if (userId !== 'anonymous-user') {
      const [userResult] = await db.select({
        id: schema.users.id,
        email: schema.users.email,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        profileImageUrl: schema.users.profileImageUrl,
        role: schema.users.role,
        subscriptionPlan: schema.users.subscriptionPlan,
        subscriptionStatus: schema.users.subscriptionStatus,
        stripeCustomerId: schema.users.stripeCustomerId,
        stripeSubscriptionId: schema.users.stripeSubscriptionId,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        phoneNumber: schema.profiles.phone
      })
        .from(schema.users)
        .leftJoin(schema.profiles, eq(schema.users.id, schema.profiles.user_id))
        .where(eq(schema.users.id, userId))
        .limit(1);
      
      if (userResult) {
        return res.json(userResult);
      }
    }
    
    // If getUserId returned 'anonymous-user', then authentication failed
    return res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Update profile endpoint
app.put('/api/auth/update-profile', async (req: any, res) => {
  try {
    let userId;
    
    // First check for token-based auth
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const tokenParts = token.split('-');
      if (tokenParts.length >= 3) {
        const extractedUserId = tokenParts[0];
        const timestamp = parseInt(tokenParts[1]);
        const isValidTimestamp = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        
        if (isValidTimestamp) {
          userId = extractedUserId;
        }
      }
    }
    
    // Fall back to Replit Auth
    if (!userId && req.isAuthenticated && req.isAuthenticated()) {
      userId = req.user.claims.sub;
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { firstName, lastName, email, phoneNumber, subscriptionPlan } = req.body;
    
    // Update user table
    if (firstName || lastName || email || subscriptionPlan) {
      await db.update(schema.users)
        .set({ 
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          email: email || undefined,
          subscriptionPlan: subscriptionPlan || undefined,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, userId));
    }
    
    // Update or create profile for phone number
    if (phoneNumber !== undefined) {
      // First try to find existing profile
      const [existingProfile] = await db.select()
        .from(schema.profiles)
        .where(eq(schema.profiles.user_id, userId))
        .limit(1);
      
      if (existingProfile) {
        // Update existing profile
        await db.update(schema.profiles)
          .set({
            phone: phoneNumber || null,
            updated_at: new Date()
          })
          .where(eq(schema.profiles.user_id, userId));
      } else {
        // Create new profile
        await db.insert(schema.profiles)
          .values({
            user_id: userId,
            phone: phoneNumber || null,
            updated_at: new Date()
          });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
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

// Update user plan for testing (temporary endpoint)
app.put('/api/test/update-plan', async (req: any, res) => {
  try {
    const { userId, subscriptionPlan } = req.body;
    
    if (!userId || !subscriptionPlan) {
      return res.status(400).json({ error: 'userId and subscriptionPlan are required' });
    }

    await db.update(schema.users)
      .set({ 
        subscriptionPlan: subscriptionPlan,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId));

    const updatedUser = await storage.getUser(userId);
    res.json({ 
      success: true, 
      message: `User plan updated to ${subscriptionPlan}`,
      user: updatedUser 
    });
  } catch (error: any) {
    console.error('Error updating user plan:', error);
    res.status(500).json({ 
      error: 'Failed to update user plan', 
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
// REMOVED - Wrong implementation that was intercepting checkout requests
// The correct implementation is below starting at line 759

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

    // ⚠️  SECURITY FIX: DO NOT send verification email here!
    // Email verification will ONLY be sent AFTER successful payment
    // via the /api/process-checkout-success endpoint
    console.log(`Account created but email verification PENDING payment for ${email}`);

    res.json({ 
      success: true, 
      message: 'Account created successfully. Complete payment to activate.',
      userId,
      needsEmailVerification: false, // Will be true AFTER payment
      paymentRequired: true
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
    await sendWelcomeEmail(user.email || '', user.firstName || 'User', user.role || 'parent');

    console.log(`Email verified successfully for ${user.email}`);

    // Redirect to appropriate dashboard based on role and subscription plan, or homepage if no plan
    let dashboardUrl;
    
    if (user.role === 'parent') {
      // Parent role - check if they have a subscription plan
      if (user.subscriptionPlan && user.subscriptionPlan !== 'Free Plan') {
        // Map subscription plans to dashboard routes
        const planMapping = {
          'basic': 'basic',
          'plus': 'plus', 
          'premium': 'premium',
          'hero family pack': 'hero',
          'explorer': 'explorer'
        };
        const planKey = user.subscriptionPlan.toLowerCase();
        const planSlug = planMapping[planKey] || 'free';
        dashboardUrl = `/parent/dashboard-${planSlug}`;
      } else {
        // No paid plan - redirect to homepage
        dashboardUrl = '/';
      }
    } else if (user.role === 'advocate') {
      // Advocate role - check if they have a subscription plan
      if (user.subscriptionPlan && user.subscriptionPlan !== 'Free Plan') {
        // Map advocate subscription plans to dashboard routes
        const advocatePlanMapping = {
          'starter': 'starter',
          'pro': 'pro',
          'agency': 'agency', 
          'agency plus': 'agency-plus',
          'agencyplus': 'agency-plus'
        };
        const planKey = user.subscriptionPlan.toLowerCase();
        const planSlug = advocatePlanMapping[planKey] || 'starter';
        dashboardUrl = `/advocate/dashboard-${planSlug}`;
      } else {
        // No paid plan - redirect to homepage  
        dashboardUrl = '/';
      }
    } else {
      // Unknown role - redirect to homepage
      dashboardUrl = '/';
    }
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully',
      redirectTo: dashboardUrl
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
async function verifyPassword(password: string, hashedPassword: string | null): Promise<boolean> {
  if (!hashedPassword) {
    return false; // User has no password set (probably OAuth user)
  }
  
  const crypto = await import('crypto');
  const parts = hashedPassword.split(':');
  if (parts.length !== 2) {
    return false; // Invalid hash format
  }
  
  const [salt, hash] = parts;
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

    // Check if user has a password set (OAuth users don't have passwords)
    if (!user.password) {
      return res.status(401).json({ 
        message: 'This account was created through subscription checkout. Please use the "Sign in with Replit" option instead.' 
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Create a simple token for immediate use
    const loginToken = `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store token in database for persistent storage (instead of memory)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    try {
      await db.insert(schema.auth_tokens).values({
        token: loginToken,
        user_id: user.id,
        user_role: user.role,
        expires_at: expiresAt
      });
    } catch (error) {
      console.error('Error storing auth token:', error);
      return res.status(500).json({ message: 'Login failed. Please try again.' });
    }

    res.json({ 
      success: true,
      message: 'Login successful',
      token: loginToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan
      },
      redirectTo: user.role === 'parent' 
        ? `/parent/dashboard-${user.subscriptionPlan?.toLowerCase().replace(/\s+/g, '') || 'free'}` 
        : (() => {
            const advocatePlanMapping = {
              'starter': 'starter',
              'pro': 'pro',
              'agency': 'agency', 
              'agency plus': 'agency-plus',
              'agencyplus': 'agency-plus'
            };
            const planSlug = advocatePlanMapping[user.subscriptionPlan?.toLowerCase()] || 'starter';
            return `/advocate/dashboard-${planSlug}`;
          })()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Create account endpoint (standalone account creation)
app.post('/api/create-account', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, planName, subscriptionMetadata } = req.body;
    // Extract planName from either direct property or subscriptionMetadata
    const actualPlanName = planName || subscriptionMetadata?.planName;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const [existingUser] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Create user account
    const userId = createId();
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    
    // 🔒 SECURITY FIX: Only FREE PLAN gets immediate verification
    // ALL paid plans must complete payment before verification
    const isFreeplan = actualPlanName === 'Free Plan' || !actualPlanName;
    
    console.log('🔒 SECURITY CHECK:', {
      actualPlanName,
      isFreeplan,
      willSendEmailNow: isFreeplan
    });
    
    await db.insert(schema.users).values({
      id: userId,
      email,
      firstName,
      lastName,
      role,
      emailVerified: false,
      verificationToken,
      password: hashedPassword,
      subscriptionPlan: actualPlanName || 'free',
      subscriptionStatus: isFreeplan ? 'active' : 'pending_payment',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 🔒 CRITICAL SECURITY: Only send verification email for FREE plans
    // Paid plans must complete payment first
    if (isFreeplan) {
      await sendVerificationEmail({
        email,
        firstName,
        verificationToken,
        role
      });
      
      res.json({ 
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        requiresPayment: false
      });
    } else {
      res.json({ 
        success: true,
        message: 'Account created successfully. You will receive a verification email after completing your payment.',
        requiresPayment: true,
        userId // Return userId so checkout can reference it
      });
    }
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ 
      message: 'Failed to create account. Please try again.' 
    });
  }
});

// Forgot password endpoint
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        success: true,
        message: 'If an account with this email exists, you will receive a password reset email.'
      });
    }

    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account was created through subscription checkout and uses OAuth authentication. Please use the "Sign in with Replit" option instead.'
      });
    }

    // Generate password reset token
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await db.update(schema.users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, user.id));

    // Send password reset email
    await sendPasswordResetEmail(user.email!, user.firstName || 'User', resetToken);

    res.json({ 
      success: true,
      message: 'If an account with this email exists, you will receive a password reset email.'
    });
  } catch (error) {
    console.error('Error sending password reset:', error);
    res.status(500).json({ 
      message: 'Failed to send password reset email. Please try again.' 
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

// Simple Stripe Checkout Session - Clean Implementation
app.post('/api/create-checkout-session', async (req, res) => {
  console.log('🎯 Creating checkout session for:', req.body);
  
  try {
    const { priceId, planName, planId, role, amount, setupFee } = req.body;
    
    if (!priceId || !planName || !planId || !role) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const currentDomain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:8080';
    const protocol = currentDomain.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${currentDomain}`;
    
    // Check if this is Hero Family Pack (hybrid pricing)
    const isHeroPackage = planId === 'hero';
    
    let lineItems;
    let discounts = undefined;
    
    if (isHeroPackage) {
      // Hero Family Pack: $495 setup fee charged immediately + $199/month subscription with trial
      console.log('🏆 Creating Hero Family Pack session with setup fee and subscription');
      
      lineItems = [
        {
          price: 'price_1RsEn58iKZXV0srZ0UH8e4tg', // $495 one-time setup fee (charged today)
          quantity: 1,
        },
        {
          price: 'price_1S3nyI8iKZXV0srZy1awxPBd', // $199/month recurring subscription  
          quantity: 1,
        }
      ];
      
      console.log('🔍 Hero lineItems created:', JSON.stringify(lineItems, null, 2));
      
      // No discounts for Hero plan - pricing is already built in
      // Setup fee charged today, subscription starts after trial period
    } else {
      // Standard single price
      lineItems = [{
        price: priceId,
        quantity: 1,
      }];
    }
    
    // Create Stripe Checkout Session - Simple & Clean
    console.log('🔍 DEBUG: discounts value:', discounts);
    console.log('🔍 DEBUG: !discounts value:', !discounts);
    console.log('🔍 DEBUG: lineItems:', JSON.stringify(lineItems, null, 2));
    console.log('🔍 DEBUG: isHeroPackage:', isHeroPackage);
    
    const sessionConfig: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}&role=${role}`,
      cancel_url: `${baseUrl}/${role}/pricing`,
      metadata: {
        planId,
        planName,
        role,
        ...(isHeroPackage && { setupFee: '495', isHeroPackage: 'true', promotion: 'first_month_free' })
      },
      billing_address_collection: 'required'
    };

    // Add free trial for Hero Plan - This ensures subscription billing starts after 1 month
    if (isHeroPackage) {
      sessionConfig.subscription_data = {
        trial_period_days: 30, // First month free for Hero Plan subscription
        metadata: {
          hero_plan_trial: 'true',
          setup_fee_charged: 'true'
        }
      };
      
      console.log('🏆 Added subscription_data with 30-day trial for Hero plan');
    }
    
    // For Hero Plan, we use trial_period_days instead of discounts
    // For other plans, allow promotion codes
    if (!isHeroPackage) {
      console.log('🎯 Non-hero plan, setting allow_promotion_codes to true');
      sessionConfig.allow_promotion_codes = true;
    } else {
      console.log('🎯 Hero plan uses trial period, no promotion codes needed');
    }
    
    console.log('🔍 Final sessionConfig keys:', Object.keys(sessionConfig));
    console.log('🔍 Final sessionConfig content:', JSON.stringify(sessionConfig, null, 2));
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('✅ Stripe session created:', {
      sessionId: session.id,
      url: session.url ? 'URL generated' : 'No URL',
      mode: session.mode
    });
    
    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }
    
    res.json({ url: session.url });
    
  } catch (error) {
    console.error('❌ Stripe checkout error:', error.message);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

// Process successful checkout and create account + send verification email
app.post('/api/process-checkout-success', async (req, res) => {
  console.log('🎯 PROCESS CHECKOUT SUCCESS CALLED!', req.body);
  try {
    const { sessionId, planId, role } = req.body;
    
    if (!sessionId) {
      console.error('🚨 No session ID provided');
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    console.log('🎯 Retrieving Stripe session:', sessionId);
    
    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription']
    });
    
    console.log('🎯 Stripe session retrieved:', {
      status: session.payment_status,
      customer_email: session.customer_email,
      customer_details: session.customer_details,
      subscription: session.subscription ? 'Present' : 'None'
    });
    
    // For subscription mode, customer email might be in different places
    const email = session.customer_email || session.customer_details?.email;
    const customerObject = session.customer;
    let customerId: string | null = null;
    
    if (typeof customerObject === 'string') {
      customerId = customerObject;
    } else if (customerObject && typeof customerObject === 'object' && 'id' in customerObject) {
      customerId = customerObject.id;
    } else if (session.subscription && typeof session.subscription === 'object' && 'customer' in session.subscription) {
      customerId = typeof session.subscription.customer === 'string' ? session.subscription.customer : null;
    }
    
    console.log('🎯 Extracted customer info:', {
      email,
      customerId,
      customerObject: typeof customerObject
    });
    
    if (!email) {
      console.error('🚨 No customer email found in session');
      return res.status(400).json({ error: 'No customer email found' });
    }
    
    if (!customerId) {
      console.error('🚨 No customer ID found in session');
      return res.status(400).json({ error: 'No customer ID found' });
    }
    
    // Extract name from session if available
    const customerName = session.customer_details?.name || '';
    const [firstName, ...lastNameParts] = customerName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    // Check if user already exists
    const [existingUser] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    
    let user;
    let emailSent = false;
    
    if (existingUser) {
      // Update existing user with Stripe information
      [user] = await db.update(schema.users)
        .set({
          stripeCustomerId: customerId,
          subscriptionPlan: planId,
          subscriptionStatus: session.subscription ? 'active' : 'incomplete',
          stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
          updatedAt: new Date()
        })
        .where(eq(schema.users.email, email))
        .returning();
      
      console.log('🎯 Updated existing user with Stripe info:', {
        userId: user.id,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
        previousStatus: existingUser.subscriptionStatus,
        newStatus: user.subscriptionStatus
      });
      
      // 🔒 SECURITY FIX: Send verification email for users who were pending payment
      if (existingUser.subscriptionStatus === 'pending_payment' && !existingUser.emailVerified) {
        emailSent = await sendVerificationEmail({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName || '',
          verificationToken: user.verificationToken,
          role: user.role
        });
        console.log('🔒 Sent verification email to previously pending user:', user.email);
      } else {
        // User already verified or was free plan - no duplicate email
        emailSent = true;
      }
    } else {
      // Create new user account only if one doesn't exist
      const verificationToken = generateVerificationToken();
      
      [user] = await db.insert(schema.users).values({
        email,
        firstName: firstName || 'User',
        lastName: lastName || '',
        role: role as 'parent' | 'advocate',
        stripeCustomerId: customerId,
        subscriptionPlan: planId,
        subscriptionStatus: session.subscription ? 'active' : 'incomplete',
        stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
        emailVerified: false,
        verificationToken
      }).returning();
      
      // Send verification email only for new users
      emailSent = await sendVerificationEmail({
        email,
        firstName: firstName || 'User',
        lastName: lastName || '',
        verificationToken
      });
      
      if (!emailSent) {
        console.error('Failed to send verification email');
      }
    }
    
    res.json({ 
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      emailSent
    });
    
  } catch (error) {
    console.error('🚨 ERROR PROCESSING CHECKOUT SUCCESS:', error);
    console.error('🚨 Error message:', error.message);
    console.error('🚨 Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to process checkout success',
      message: error.message 
    });
  }
});

// Stripe subscription routes (keeping for reference but using payment intent for testing)
app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { priceId, billingPeriod, amount, planName, planId } = req.body;
    
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
        metadata: { userId, planId }
      });
      customerId = customer.id;
      
      // Update user with customer ID
      await db.update(schema.users)
        .set({ stripeCustomerId: customerId })
        .where(eq(schema.users.id, userId));
    }

    // Check if this is Hero Family Pack (hybrid pricing: $495 setup + $199/month)
    const isHeroPackage = planId === 'hero' || priceId === 'price_1S3nyI8iKZXV0srZy1awxPBd';
    
    if (isHeroPackage) {
      // For Hero Family Pack: Create setup fee payment intent + subscription
      
      // 1. Create one-time setup fee payment intent ($495)
      const setupPaymentIntent = await stripe.paymentIntents.create({
        amount: 49500, // $495 in cents
        currency: 'usd',
        customer: customerId,
        metadata: {
          userId,
          planId: 'hero',
          planName: 'Hero Family Pack Setup Fee',
          type: 'setup_fee'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // 2. Create subscription for monthly payment ($199/month) with trial
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId, // Your real price ID for $199/month
        }],
        trial_period_days: 30, // 30-day trial to allow setup fee payment first
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
          payment_method_types: ['card']
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planId: 'hero',
          setup_fee_payment_intent: setupPaymentIntent.id
        }
      });

      // Update user with subscription details
      await db.update(schema.users)
        .set({ 
          stripeSubscriptionId: subscription.id,
          subscriptionPlan: 'hero',
          subscriptionStatus: 'trialing'
        })
        .where(eq(schema.users.id, userId));

      // Return setup fee payment intent for immediate payment
      return res.json({
        clientSecret: setupPaymentIntent.client_secret,
        subscriptionId: subscription.id,
        setupFee: 495,
        monthlyAmount: 199,
        type: 'hybrid_pricing'
      });
      
    } else {
      // Regular subscription flow for other plans
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
    } // Close the else block for regular subscription flow
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

// Parents/Clients routes moved to AFTER auth setup for proper session context

// Cases routes - for advocates to see their active cases
app.get('/api/cases-old-disabled', isAuthenticated, async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (userId === 'anonymous-user') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get advocate profile
    const advocate = await db.select().from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .then(results => results[0]);
    
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found' });
    }
    
    // Get all cases for this advocate with related data
    const cases = await db.select({
      case: schema.cases,
      client: schema.users,
      student: schema.students
    })
    .from(schema.cases)
    .leftJoin(schema.users, eq(schema.cases.client_id, schema.users.id))
    .leftJoin(schema.students, eq(schema.cases.student_id, schema.students.id))
    .where(eq(schema.cases.advocate_id, advocate.id));
    
    const formattedCases = cases.map(({ case: caseData, client, student }) => ({
      ...caseData,
      client: client ? {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName
      } : null,
      student: student ? {
        id: student.id,
        full_name: student.full_name,
        grade_level: student.grade_level,
        school_name: student.school_name,
        disability_category: student.disability_category
      } : null
    }));
    
    // Add cache-busting headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json(formattedCases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Students endpoints moved to AFTER auth setup for proper session context

// Autism accommodations routes - Enhanced with comprehensive CRUD operations
app.get('/api/autism_accommodations', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { student_id, category, template } = req.query;
    
    let query = db.select().from(schema.autism_accommodations).where(eq(schema.autism_accommodations.user_id, userId));
    
    // Filter by student if specified
    if (student_id) {
      query = query.where(eq(schema.autism_accommodations.student_id, student_id as string));
    }
    
    // Filter by category if specified
    if (category) {
      query = query.where(eq(schema.autism_accommodations.category, category as string));
    }
    
    const accommodations = await query;
    
    // If requesting templates, return predefined accommodation templates
    if (template === 'true') {
      const templates = getAccommodationTemplates();
      res.json({ accommodations, templates });
    } else {
      res.json(accommodations);
    }
  } catch (error) {
    console.error('Error fetching autism accommodations:', error);
    res.status(500).json({ error: 'Failed to fetch autism accommodations' });
  }
});

app.post('/api/autism_accommodations', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const accommodationData = { 
      ...req.body, 
      user_id: userId,
      status: req.body.status || 'active',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [accommodation] = await db.insert(schema.autism_accommodations).values(accommodationData).returning();
    res.json(accommodation);
  } catch (error) {
    console.error('Error creating autism accommodation:', error);
    res.status(500).json({ error: 'Failed to create autism accommodation' });
  }
});

app.put('/api/autism_accommodations/:id', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;
    
    const [accommodation] = await db.update(schema.autism_accommodations)
      .set({ ...req.body, updated_at: new Date() })
      .where(and(
        eq(schema.autism_accommodations.id, id),
        eq(schema.autism_accommodations.user_id, userId)
      ))
      .returning();
    
    if (!accommodation) {
      return res.status(404).json({ error: 'Accommodation not found' });
    }
    
    res.json(accommodation);
  } catch (error) {
    console.error('Error updating autism accommodation:', error);
    res.status(500).json({ error: 'Failed to update autism accommodation' });
  }
});

app.delete('/api/autism_accommodations/:id', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;
    
    await db.delete(schema.autism_accommodations)
      .where(and(
        eq(schema.autism_accommodations.id, id),
        eq(schema.autism_accommodations.user_id, userId)
      ));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting autism accommodation:', error);
    res.status(500).json({ error: 'Failed to delete autism accommodation' });
  }
});

// Bulk operations for accommodations
app.post('/api/autism_accommodations/bulk', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { accommodations, student_id } = req.body;
    
    const accommodationData = accommodations.map((acc: any) => ({
      ...acc,
      user_id: userId,
      student_id: student_id || null,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    const createdAccommodations = await db.insert(schema.autism_accommodations)
      .values(accommodationData)
      .returning();
    
    res.json(createdAccommodations);
  } catch (error) {
    console.error('Error creating bulk accommodations:', error);
    res.status(500).json({ error: 'Failed to create accommodations' });
  }
});

// Generate IEP language from accommodations
app.post('/api/autism_accommodations/generate-iep', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { accommodation_ids, student_id, format } = req.body;
    
    // Fetch the accommodations
    const accommodations = await db.select()
      .from(schema.autism_accommodations)
      .where(eq(schema.autism_accommodations.user_id, userId));
    
    // Generate formal IEP language
    const iepLanguage = generateIEPLanguage(accommodations, format);
    
    res.json({ iep_language: iepLanguage, format });
  } catch (error) {
    console.error('Error generating IEP language:', error);
    res.status(500).json({ error: 'Failed to generate IEP language' });
  }
});

// Preview accommodation document
app.post('/api/autism_accommodations/preview', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { accommodation_ids, student_id, template_type } = req.body;
    
    // Fetch student info if provided
    let student = null;
    if (student_id) {
      [student] = await db.select()
        .from(schema.students)
        .where(eq(schema.students.id, student_id));
    }
    
    // Fetch accommodations
    const accommodations = await db.select()
      .from(schema.autism_accommodations)
      .where(eq(schema.autism_accommodations.user_id, userId));
    
    const preview = generateAccommodationPreview(accommodations, student, template_type);
    
    res.json({ preview, student, accommodations });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// Documents routes
app.get('/api/documents', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const documents = await db.select().from(schema.documents).where(eq(schema.documents.user_id, userId));
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const userId = await getUserId(req);
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
    const updateData = { ...req.body, updated_at: new Date() };
    const userId = await getUserId(req);
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
    const userId = await getUserId(req);
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
    const userId = await getUserId(req);
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
    
    const userId = await getUserId(req);
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
    
    const userId = await getUserId(req);
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
    const userId = await getUserId(req);
    const goals = await db.select().from(schema.goals).where(eq(schema.goals.user_id, userId));
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const userId = await getUserId(req);
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
    const userId = await getUserId(req);
    const meetings = await db.select().from(schema.meetings).where(eq(schema.meetings.user_id, userId));
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const meetingData = { ...req.body, user_id: userId };
    const [meeting] = await db.insert(schema.meetings).values(meetingData).returning();
    res.json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Parents routes
app.get('/api/parents', async (req, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Fetching parents for user:', userId);
    
    // Get parent users (role = 'parent') that this advocate can access
    const parents = await db.select({
      id: schema.users.id,
      full_name: schema.profiles.full_name,
      email: schema.users.email,
      phone: schema.profiles.phone,
      role: schema.users.role,
      created_at: schema.users.createdAt
    })
    .from(schema.users)
    .leftJoin(schema.profiles, eq(schema.users.id, schema.profiles.user_id))
    .where(eq(schema.users.role, 'parent'));
    
    res.json(parents);
  } catch (error) {
    console.error('❌ Error fetching parents:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch parents' });
  }
});

app.post('/api/parents', async (req, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Creating parent account by user:', userId);
    
    const { full_name, email, phone, role = 'parent' } = req.body;
    
    if (!full_name || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    // Check if user already exists
    const [existingUser] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user account
    const [newUser] = await db.insert(schema.users).values({
      email,
      role: 'parent',
      emailVerified: false, // They'll need to verify via email
    }).returning();

    // Create profile
    const [newProfile] = await db.insert(schema.profiles).values({
      user_id: newUser.id,
      full_name,
      email,
      phone,
      role: 'parent'
    }).returning();

    // Send invitation email to new parent
    try {
      await sendWelcomeEmail(email, full_name);
      console.log(`✅ PRODUCTION: Created parent account for ${email} and sent invitation email`);
    } catch (emailError) {
      console.error('❌ Failed to send invitation email:', emailError);
      // Don't fail the parent creation if email fails - just log it
    }

    res.json({
      id: newUser.id,
      full_name,
      email,
      phone,
      role: newUser.role,
      created_at: newUser.createdAt
    });
  } catch (error) {
    console.error('❌ Error creating parent:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to create parent' });
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
    const userId = await getUserId(req);
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
    const userId = await getUserId(req);
    await db.insert(schema.documents).values({
      id: documentId,
      user_id: userId,
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
    const userId = await getUserId(req);
    await db.insert(schema.ai_reviews).values({
      id: analysisId,
      user_id: userId,
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
app.post('/api/invite-parent', isAuthenticated, async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields: email, firstName, lastName' });
    }

    // Get the authenticated advocate user ID  
    const advocateUserId = getUserId(req);
    
    // Create parent user record
    const userId = createId();
    await db.insert(schema.profiles).values({
      id: userId,
      user_id: userId,
      email,
      full_name: `${firstName} ${lastName}`,
      role: 'parent',
      created_by: advocateUserId // Track which advocate created this parent
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

// Advocate Profile API endpoints
app.get('/api/advocates/profile', async (req, res) => {
  try {
    const userId = await getUserId(req);
    console.log('🔍 Profile GET - User ID:', userId);
    
    if (!userId || userId === 'anonymous-user') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const advocate = await getOrCreateAdvocateProfile(userId);
    
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found' });
    }

    res.json(advocate);
  } catch (error) {
    console.error('Error fetching advocate profile:', error);
    res.status(500).json({ error: 'Failed to fetch advocate profile' });
  }
});

app.put('/api/advocates/profile', async (req, res) => {
  try {
    const userId = await getUserId(req);
    
    if (!userId || userId === 'anonymous-user') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      bio,
      location,
      specializations,
      certifications,
      education,
      years_experience,
      languages,
      case_types,
      rate_per_hour,
      availability
    } = req.body;

    // Ensure advocate profile exists first
    const existingAdvocate = await getOrCreateAdvocateProfile(userId);
    
    if (!existingAdvocate) {
      return res.status(404).json({ error: 'Advocate profile not found' });
    }

    // Update advocate profile
    const [updatedAdvocate] = await db.update(schema.advocates)
      .set({
        bio: bio || existingAdvocate.bio,
        location: location || existingAdvocate.location,
        specializations: specializations || existingAdvocate.specializations,
        certifications: certifications || existingAdvocate.certifications,
        education: education || existingAdvocate.education,
        years_experience: years_experience !== undefined ? years_experience : existingAdvocate.years_experience,
        languages: languages || existingAdvocate.languages,
        case_types: case_types || existingAdvocate.case_types,
        rate_per_hour: rate_per_hour !== undefined ? rate_per_hour : existingAdvocate.rate_per_hour,
        availability: availability || existingAdvocate.availability,
        updated_at: new Date()
      })
      .where(eq(schema.advocates.user_id, userId))
      .returning();

    res.json({
      message: 'Advocate profile updated successfully',
      profile: updatedAdvocate
    });
  } catch (error) {
    console.error('Error updating advocate profile:', error);
    res.status(500).json({ error: 'Failed to update advocate profile' });
  }
});


// Get available states for standards
app.get('/api/standards/states', (req, res) => {
  const availableStates = ['national', ...Object.keys(STATE_SPECIFIC_STANDARDS)].sort();
  res.json({ states: availableStates });
});

// Get standards by subject and grade
app.get('/api/standards', (req, res) => {
  try {
    const { subject = 'all', grade, state = 'national' } = req.query;
    
    let standards = [...ALL_STANDARDS];
    
    // Add state-specific standards
    if (state !== 'national' && STATE_SPECIFIC_STANDARDS[state as string]) {
      standards = [...standards, ...STATE_SPECIFIC_STANDARDS[state as string]];
    }
    
    // Filter by subject
    if (subject !== 'all') {
      standards = standards.filter(standard => standard.subject === subject);
    }
    
    // Filter by grade (with flexibility)
    if (grade) {
      standards = standards.filter(standard => {
        if (standard.grade.includes('-')) {
          const [start, end] = standard.grade.split('-');
          const gradeNum = grade === 'K' ? 0 : parseInt(grade as string);
          const startNum = start === 'K' ? 0 : parseInt(start);
          const endNum = end === 'K' ? 0 : parseInt(end);
          return gradeNum >= startNum && gradeNum <= endNum;
        }
        return standard.grade === grade || 
               (standard.grade === 'K' && grade === '0') ||
               (standard.grade === '0' && grade === 'K');
      });
    }
    
    // Group by domain for better organization
    const grouped = standards.reduce((acc, standard) => {
      const domain = standard.domain || 'Other';
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(standard);
      return acc;
    }, {} as Record<string, typeof standards>);
    
    res.json({ 
      total: standards.length,
      grouped,
      standards: standards.slice(0, 50) // Limit for performance
    });
  } catch (error) {
    console.error('Error fetching standards:', error);
    res.status(500).json({ error: 'Failed to fetch standards' });
  }
});

// Analyze goal alignment with standards
app.post('/api/standards/analyze', async (req, res) => {
  try {
    const { goalText, selectedState = 'national', selectedSubject = 'all', gradeLevel } = req.body;
    
    if (!goalText || goalText.trim().length === 0) {
      return res.status(400).json({ error: 'Goal text is required' });
    }
    
    console.log(`Analyzing goal alignment for: "${goalText.substring(0, 100)}..."`);
    console.log(`Parameters - State: ${selectedState}, Subject: ${selectedSubject}, Grade: ${gradeLevel}`);
    
    const result = await standardsAnalyzer.analyzeGoalAlignment(
      goalText,
      selectedState,
      selectedSubject,
      gradeLevel
    );
    
    console.log(`Analysis complete - Found ${result.primaryStandards.length} primary and ${result.secondaryStandards.length} secondary alignments`);
    
    res.json(result);
  } catch (error) {
    console.error('Error analyzing goal alignment:', error);
    res.status(500).json({ 
      error: 'Failed to analyze goal alignment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get detailed information about a specific standard
app.get('/api/standards/:code', (req, res) => {
  try {
    const { code } = req.params;
    const { state = 'national' } = req.query;
    
    let allStandards = [...ALL_STANDARDS];
    
    if (state !== 'national' && STATE_SPECIFIC_STANDARDS[state as string]) {
      allStandards = [...allStandards, ...STATE_SPECIFIC_STANDARDS[state as string]];
    }
    
    const standard = allStandards.find(s => s.code === code);
    
    if (!standard) {
      return res.status(404).json({ error: 'Standard not found' });
    }
    
    // Find related standards in the same domain
    const relatedStandards = allStandards
      .filter(s => s.domain === standard.domain && s.code !== standard.code)
      .slice(0, 5);
    
    res.json({
      standard,
      relatedStandards
    });
  } catch (error) {
    console.error('Error fetching standard details:', error);
    res.status(500).json({ error: 'Failed to fetch standard details' });
  }
});

// Mount new route modules
app.use('/api/match', matchRoutes);
app.use('/api/expert-analysis', expertRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/simple-messages', simpleMessagingRoutes);
// app.use('/api', mainRoutes); // Temporarily disabled - session context issue

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/parents', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Getting clients for authenticated user:', userId);
    
    // Get user's profile to determine role
    const [userProfile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.user_id, userId))
      .limit(1);
    
    if (!userProfile) {
      console.log('❌ User profile not found for:', userId);
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Only advocates should have clients/parents
    if (userProfile.role !== 'advocate') {
      console.log('❌ Non-advocate user requesting clients:', userProfile.role);
      return res.status(403).json({ error: 'Only advocates can access client data' });
    }
    
    // Get real client data for the authenticated advocate
    const clients = await db
      .select({
        id: schema.profiles.user_id,
        full_name: schema.profiles.full_name,
        email: schema.profiles.email,
        role: schema.profiles.role,
        created_at: schema.profiles.created_at,
        updated_at: schema.profiles.updated_at
      })
      .from(schema.advocate_clients)
      .leftJoin(schema.profiles, eq(schema.advocate_clients.client_id, schema.profiles.user_id))
      .where(eq(schema.advocate_clients.advocate_id, userId));
    
    console.log(`✅ PRODUCTION: Found ${clients.length} clients for advocate:`, clients.map(c => c.full_name));
    res.json(clients);
  } catch (error) {
    console.error('❌ Error getting clients:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

app.get('/api/students', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Getting students for authenticated user:', userId);
    
    // Get user's data from users table (created by Replit Auth)
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    if (!user) {
      console.log('❌ User not found for:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Use user role, default to 'parent' if not set
    const userRole = user.role || 'parent';
    
    let students = [];
    
    if (userRole === 'advocate') {
      // Advocate: Get students from all their clients
      students = await db
        .select({
          id: schema.students.id,
          full_name: schema.students.full_name,
          grade_level: schema.students.grade_level,
          parent_id: schema.students.parent_id,
          created_at: schema.students.created_at,
          updated_at: schema.students.updated_at
        })
        .from(schema.students)
        .leftJoin(schema.advocate_clients, eq(schema.students.parent_id, schema.advocate_clients.client_id))
        .where(eq(schema.advocate_clients.advocate_id, userId));
    } else {
      // Parent: Get their own students
      students = await db
        .select({
          id: schema.students.id,
          full_name: schema.students.full_name,
          grade_level: schema.students.grade_level,
          parent_id: schema.students.parent_id,
          created_at: schema.students.created_at,
          updated_at: schema.students.updated_at
        })
        .from(schema.students)
        .where(eq(schema.students.parent_id, userId));
    }
    
    console.log(`✅ PRODUCTION: Found ${students.length} students for ${userRole}:`, students.map(s => s.full_name));
    res.json(students);
  } catch (error) {
    console.error('❌ Error getting students:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST endpoint for creating new students
app.post('/api/students', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Creating student for authenticated user:', userId);
    
    // Get user's data from users table
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    if (!user) {
      console.log('❌ User not found for:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userRole = user.role || 'parent';
    const studentData = req.body;
    
    // Create new student record
    const [newStudent] = await db
      .insert(schema.students)
      .values({
        ...studentData,
        user_id: userId,
        parent_id: userRole === 'parent' ? userId : studentData.parent_id,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    console.log('✅ PRODUCTION: Created new student:', newStudent.full_name);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('❌ Error creating student:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
});

app.get('/api/cases', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Getting cases for authenticated user:', userId);
    
    // Get user's data from users table (created by Replit Auth)
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    if (!user) {
      console.log('❌ User not found for:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Use user role, default to 'advocate' for cases endpoint
    const userRole = user.role || 'advocate';
    
    let cases = [];
    
    if (userRole === 'advocate') {
      // Advocate: Get cases where they are the advocate
      cases = await db
        .select({
          id: schema.cases.id,
          advocate_id: schema.cases.advocate_id,
          client_id: schema.cases.client_id,
          student_id: schema.cases.student_id,
          case_title: schema.cases.case_title,
          description: schema.cases.description,
          case_type: schema.cases.case_type,
          status: schema.cases.status,
          priority: schema.cases.priority,
          billing_rate: schema.cases.billing_rate,
          total_hours: schema.cases.total_hours,
          next_action: schema.cases.next_action,
          next_action_date: schema.cases.next_action_date,
          created_at: schema.cases.created_at,
          updated_at: schema.cases.updated_at
        })
        .from(schema.cases)
        .where(eq(schema.cases.advocate_id, userId));
    } else {
      // Parent: Get cases where they are the client
      cases = await db
        .select({
          id: schema.cases.id,
          advocate_id: schema.cases.advocate_id,
          client_id: schema.cases.client_id,
          student_id: schema.cases.student_id,
          case_title: schema.cases.case_title,
          description: schema.cases.description,
          case_type: schema.cases.case_type,
          status: schema.cases.status,
          priority: schema.cases.priority,
          billing_rate: schema.cases.billing_rate,
          total_hours: schema.cases.total_hours,
          next_action: schema.cases.next_action,
          next_action_date: schema.cases.next_action_date,
          created_at: schema.cases.created_at,
          updated_at: schema.cases.updated_at
        })
        .from(schema.cases)
        .where(eq(schema.cases.client_id, userId));
    }
    
    console.log(`✅ PRODUCTION: Found ${cases.length} cases for ${userRole}:`, cases.map(c => c.case_title));
    res.json(cases);
  } catch (error) {
    console.error('❌ Error getting cases:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Initialize server with proper authentication setup
(async () => {
  console.log('Setting up Replit Auth...');
  await setupAuth(app);
  console.log('Replit Auth setup completed successfully');
  
  // 🔥 DEFINE MAIN ROUTES AFTER AUTH SETUP (same pattern as /api/auth/user)
  
  // Parents/Clients routes - for advocates to see their clients
  app.get('/api/parents', async (req: any, res) => {
    console.log('🚨 /API/PARENTS ENDPOINT HIT - AFTER AUTH SETUP');
    try {
      // Use same pattern as /api/auth/user (which works!)
      let userId = null;
      
      // Try token-based auth first
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token && token.trim()) {
        try {
          const [tokenRecord] = await db.select()
            .from(schema.auth_tokens)
            .where(and(
              eq(schema.auth_tokens.token, token),
              gt(schema.auth_tokens.expires_at, new Date())
            ))
            .limit(1);
          
          if (tokenRecord) {
            userId = tokenRecord.user_id;
          }
        } catch (error) {
          console.warn('Token auth failed:', error);
        }
      }
      
      // Try Replit Auth session  
      if (!userId) {
        const user = req.user;
        if (user && user.claims && user.claims.sub) {
          userId = user.claims.sub;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      console.log('✅ PARENTS: Got user ID:', userId);
      
      // Get advocate profile
      const advocate = await db.select().from(schema.advocates)
        .where(eq(schema.advocates.user_id, userId))
        .then(results => results[0]);
      
      if (!advocate) {
        return res.status(404).json({ error: 'Advocate profile not found' });
      }
      
      console.log('✅ PARENTS: Found advocate:', advocate.id);
      
      // Get all clients (parents) for this advocate
      const clientRelations = await db.select({
        relationship: schema.advocate_clients,
        client: schema.users
      })
      .from(schema.advocate_clients)
      .leftJoin(schema.users, eq(schema.advocate_clients.client_id, schema.users.id))
      .where(and(
        eq(schema.advocate_clients.advocate_id, advocate.id),
        eq(schema.advocate_clients.status, 'active')
      ));

      const clients = clientRelations.map(({ relationship, client }) => ({
        id: client?.id || '',
        email: client?.email || '',
        firstName: client?.firstName || '',
        lastName: client?.lastName || '',
        role: client?.role || 'parent',
        subscriptionPlan: client?.subscriptionPlan || 'Free Plan',
        specializations: [],
        // Add advocate relationship info
        relationship_status: relationship.status,
        created_at: relationship.created_at,
        case_type: relationship.case_type || 'general'
      }));
      
      console.log(`✅ PARENTS: Found ${clients.length} clients for advocate ${userId}`);
      res.json(clients);
    } catch (error) {
      console.error('Error fetching parents:', error);
      res.status(500).json({ error: 'Failed to fetch parents' });
    }
  });

  // Students endpoint - for advocates viewing their clients' students
  app.get('/api/students', async (req: any, res) => {
    console.log('🚨 /API/STUDENTS ENDPOINT HIT - AFTER AUTH SETUP');
    try {
      // Same auth pattern as /api/auth/user
      let userId = null;
      
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token && token.trim()) {
        try {
          const [tokenRecord] = await db.select()
            .from(schema.auth_tokens)
            .where(and(
              eq(schema.auth_tokens.token, token),
              gt(schema.auth_tokens.expires_at, new Date())
            ))
            .limit(1);
          
          if (tokenRecord) {
            userId = tokenRecord.user_id;
          }
        } catch (error) {
          console.warn('Token auth failed:', error);
        }
      }
      
      if (!userId) {
        const user = req.user;
        if (user && user.claims && user.claims.sub) {
          userId = user.claims.sub;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      console.log('✅ STUDENTS: Got user ID:', userId);
      
      // Check if user is a parent or advocate
      const user = await storage.getUser(userId);
      let students = [];
      
      if (user?.role === 'advocate') {
        console.log('Fetching students for advocate:', userId);
        
        // For advocates, get their profile first
        const advocate = await db.select().from(schema.advocates)
          .where(eq(schema.advocates.user_id, userId))
          .then(results => results[0]);
        
        if (advocate) {
          console.log('✅ STUDENTS: Found advocate profile:', advocate.id);
          
          // Get students from multiple sources:
          // 1. From active cases
          const caseStudents = await db.select({
            student: schema.students,
            case: schema.cases,
            client: schema.users
          })
          .from(schema.cases)
          .leftJoin(schema.students, eq(schema.cases.student_id, schema.students.id))
          .leftJoin(schema.users, eq(schema.cases.parent_id, schema.users.id))
          .where(and(
            eq(schema.cases.advocate_id, advocate.id),
            eq(schema.cases.status, 'active')
          ));
          
          // 2. From direct advocate-client relationships where clients have students
          const clientStudents = await db.select({
            student: schema.students,
            client: schema.users
          })
          .from(schema.advocate_clients)
          .leftJoin(schema.users, eq(schema.advocate_clients.client_id, schema.users.id))
          .leftJoin(schema.students, eq(schema.students.parent_id, schema.users.id))
          .where(and(
            eq(schema.advocate_clients.advocate_id, advocate.id),
            eq(schema.advocate_clients.status, 'active')
          ));
          
          // Combine and deduplicate students
          const allStudents = [...caseStudents, ...clientStudents];
          const studentMap = new Map();
          
          allStudents.forEach(({ student, client }) => {
            if (student && !studentMap.has(student.id)) {
              studentMap.set(student.id, {
                ...student,
                parent: client ? {
                  id: client.id,
                  email: client.email,
                  firstName: client.firstName,
                  lastName: client.lastName
                } : null
              });
            }
          });
          
          students = Array.from(studentMap.values());
        }
      } else if (user?.role === 'parent') {
        // For parents, get their own students
        students = await db.select().from(schema.students)
          .where(eq(schema.students.parent_id, userId));
      }
      
      console.log(`✅ STUDENTS: Found ${students.length} students for user ${userId}`);
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });
  
  // Start the server after all setup is complete
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
})().catch(console.error);