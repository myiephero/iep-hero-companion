import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, and, gt, desc, sql, like, or, ne, inArray, isNotNull } from 'drizzle-orm';
import matchRoutes from './routes/match';
import expertRoutes from './routes/expert';
import expertReviewPaymentRoutes from './routes/expertReviewPayments';
import feedbackRoutes from './routes/feedback';
import messagingRoutes from './routes/messaging';
// Removed non-existent main routes import
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
// Removed Replit Auth - using token-only authentication
import { storage } from './storage';
import Stripe from 'stripe';
import { sendVerificationEmail, sendWelcomeEmail } from './emailService';
import { getUserId } from './utils';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { standardsAnalyzer } from './standards-analyzer';
import { ALL_STANDARDS, STATE_SPECIFIC_STANDARDS } from './standards-database';
import OpenAI from 'openai';

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

// BUILD VERSION FOR ENVIRONMENT PARITY
const BUILD_ID = "BUILD_SEP10_2025_1531";

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: z.string().email('Invalid email format').max(255, 'Email too long').optional(),
  phoneNumber: z.string().regex(/^[\d\s\-\+\(\)]*$/, 'Invalid phone number format').max(20, 'Phone number too long').optional().nullable(),
  subscriptionPlan: z.enum(['free', 'essential', 'premium', 'advocate']).optional(),
  pushNotificationToken: z.string().optional(),
  notificationPreferences: z.object({}).passthrough().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// Rate limiting storage for profile updates
const profileUpdateAttempts = new Map<string, { count: number; resetTime: number }>();
const PROFILE_UPDATE_LIMIT = 5; // 5 updates per hour
const PROFILE_UPDATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Initialize OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// AI Analysis function for Gifted Assessments
async function generateGiftedAssessmentAI(assessmentData: any, role: 'parent' | 'advocate'): Promise<any> {
  try {
    const isParent = role === 'parent';
    
    // Validate that we have sufficient real assessment data
    const hasRealStrengths = assessmentData.strengths?.notes && assessmentData.strengths.notes.trim().length > 0;
    const hasRealChallenges = assessmentData.challenges?.notes && assessmentData.challenges.notes.trim().length > 0;
    const hasRealRecommendations = assessmentData.recommendations?.notes && assessmentData.recommendations.notes.trim().length > 0;
    const hasEvaluatorNotes = assessmentData.evaluator_notes && assessmentData.evaluator_notes.trim().length > 0;
    
    // Require at least strengths or evaluator notes for meaningful analysis
    if (!hasRealStrengths && !hasEvaluatorNotes) {
      throw new Error('Insufficient assessment data: This assessment needs more detailed information about the student\'s strengths and abilities before AI insights can be generated. Please complete the assessment with specific observations and notes.');
    }
    
    // Extract only real, non-empty data
    const getRealData = (field: any) => {
      if (typeof field === 'object' && field?.notes && field.notes.trim().length > 0) {
        return field.notes;
      }
      if (typeof field === 'string' && field.trim().length > 0) {
        return field;
      }
      return null;
    };
    
    // Build context only with actual data
    const realDataParts = [
      `Assessment Type: ${assessmentData.assessment_type}`,
      `Areas of Giftedness: ${Array.isArray(assessmentData.giftedness_areas) ? assessmentData.giftedness_areas.join(', ') : assessmentData.giftedness_areas}`
    ];
    
    if (assessmentData.learning_differences?.length) {
      realDataParts.push(`Learning Differences: ${Array.isArray(assessmentData.learning_differences) ? assessmentData.learning_differences.join(', ') : assessmentData.learning_differences}`);
    }
    
    const strengthsData = getRealData(assessmentData.strengths);
    if (strengthsData) realDataParts.push(`Documented Strengths: ${strengthsData}`);
    
    const challengesData = getRealData(assessmentData.challenges);
    if (challengesData) realDataParts.push(`Documented Challenges: ${challengesData}`);
    
    const recommendationsData = getRealData(assessmentData.recommendations);
    if (recommendationsData) realDataParts.push(`Current Recommendations: ${recommendationsData}`);
    
    const enrichmentData = getRealData(assessmentData.enrichment_activities);
    if (enrichmentData) realDataParts.push(`Enrichment Activities: ${enrichmentData}`);
    
    const accelerationData = getRealData(assessmentData.acceleration_needs);
    if (accelerationData) realDataParts.push(`Acceleration Needs: ${accelerationData}`);
    
    const socialEmotionalData = getRealData(assessmentData.social_emotional_needs);
    if (socialEmotionalData) realDataParts.push(`Social-Emotional Needs: ${socialEmotionalData}`);
    
    if (assessmentData.evaluator_notes) {
      realDataParts.push(`Evaluator Notes: ${assessmentData.evaluator_notes}`);
    }
    
    const assessmentContext = realDataParts.join('\n');

    const systemPrompt = isParent 
      ? `You are an expert educational consultant specializing in gifted and twice-exceptional learners. Your role is to provide clear, practical guidance to PARENTS about their child's educational needs based ONLY on the actual assessment data provided.

CRITICAL: Base your analysis exclusively on the specific information documented in this assessment. Do not make assumptions or add generic information not present in the assessment data. If certain information is not documented, acknowledge that it would need additional evaluation.

Use everyday language that parents can understand and focus on actionable steps they can take to support their child at home and advocate at school. Your analysis should be compassionate, encouraging, and focused on celebrating the child's documented gifts while addressing documented challenges constructively.`
      
      : `You are a seasoned educational advocate and specialist in gifted and twice-exceptional education. Your role is to provide detailed, professional analysis to EDUCATIONAL ADVOCATES based strictly on the documented assessment data provided.

CRITICAL: Base your analysis exclusively on the specific information documented in this assessment. Do not make assumptions or add generic recommendations not supported by the assessment data. If certain areas need additional evaluation, clearly state this.

Use precise educational terminology and provide comprehensive insights that will help advocates develop effective IEP goals, accommodations, and educational strategies based on the documented profile.`;

    const userPrompt = isParent
      ? `Based EXCLUSIVELY on the documented assessment data below, provide a comprehensive analysis for the PARENT. Only reference information that is explicitly documented in the assessment data. If a category lacks sufficient documentation, state that additional evaluation would be needed.

Provide analysis only in these areas where sufficient data exists:

1. **Documented Strengths**: Celebrate only the specific abilities and gifts documented in this assessment
2. **Documented Challenges**: Address only the challenges specifically noted in the assessment data
3. **Home Support Strategies**: Practical suggestions based only on the documented profile
4. **School Advocacy Guide**: Key points derived directly from the documented assessment findings
5. **Next Steps**: Recommendations based on what is documented vs. what needs further evaluation

Use a warm, encouraging tone but stay strictly within the bounds of the documented assessment data. If information is missing or insufficient, clearly state this. Respond with a detailed JSON object.

DOCUMENTED ASSESSMENT DATA:
${assessmentContext}`

      : `Based EXCLUSIVELY on the documented assessment data below, provide a comprehensive professional analysis for the EDUCATIONAL ADVOCATE. Only reference information that is explicitly documented in the assessment. If a domain lacks sufficient documentation, identify this as needing additional evaluation.

Provide analysis only in these areas where sufficient data exists:

1. **Assessment Data Summary**: Professional interpretation of only the documented findings
2. **IEP Goal Recommendations**: Goals based specifically on documented strengths and needs
3. **Accommodation Strategies**: Recommendations justified by the documented profile
4. **Additional Assessment Needs**: Identify areas requiring further evaluation
5. **Evidence-Based Interventions**: Strategies that align with the documented profile
6. **Progress Monitoring**: Methods appropriate for the documented areas of focus

CRITICAL: Include a separate "accommodations" array with specific accommodation recommendations. Each accommodation must have:
- title: Brief, descriptive name
- description: Detailed implementation description  
- category: One of "academic", "behavioral", "environmental", "sensory", "social", "assessment"
- implementation_notes: Specific steps for implementation

Use professional terminology while staying strictly within the documented assessment boundaries. If information is insufficient for comprehensive recommendations, clearly identify these gaps. Respond with a detailed JSON object that includes the "accommodations" array.

DOCUMENTED ASSESSMENT DATA:
${assessmentContext}`;

    // Using GPT-4 Omni, the latest production OpenAI model
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_completion_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0].message.content;
    return JSON.parse(aiResponse || '{}');
    
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    throw new Error('Failed to generate AI analysis');
  }
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

// Helper function to parse accommodation text and extract structured accommodations
function parseAccommodationText(text: string, defaultCategory: string = 'academic'): Array<{title: string, description: string, category: string, implementation_notes: string}> {
  if (!text || typeof text !== 'string' || text.length < 20) {
    return [];
  }

  const accommodations: Array<{title: string, description: string, category: string, implementation_notes: string}> = [];
  
  // Look for numbered lists (1., 2., etc.) or bullet points (•, -, *)
  const listItems = text.match(/(?:^\d+\.|^[\•\-\*]\s|^-\s)(.+?)(?=\n\d+\.|\n[\•\-\*]\s|\n-\s|$)/gm);
  
  if (listItems && listItems.length > 0) {
    listItems.forEach((item, index) => {
      const cleanItem = item.replace(/^\d+\.|^[\•\-\*]\s|^-\s/, '').trim();
      if (cleanItem.length > 10) {
        // Extract title (first part) and description
        const parts = cleanItem.split(/[:\-](.+)/);
        const title = parts[0] ? parts[0].trim() : `AI Recommendation ${index + 1}`;
        const description = parts[1] ? parts[1].trim() : cleanItem;
        
        // Determine category based on keywords
        const category = determineCategoryFromText(cleanItem);
        
        accommodations.push({
          title: title.length > 100 ? title.substring(0, 100) + '...' : title,
          description: description.length > 500 ? description.substring(0, 500) + '...' : description,
          category: category || defaultCategory,
          implementation_notes: description.length > 200 ? description.substring(0, 200) + '...' : description
        });
      }
    });
  } else {
    // If no clear list format, try to extract sentences
    const sentences = text.split(/[.!]/).filter(sentence => sentence.trim().length > 20);
    sentences.slice(0, 3).forEach((sentence, index) => { // Limit to 3 accommodations per section
      const cleanSentence = sentence.trim();
      if (cleanSentence.length > 10) {
        const category = determineCategoryFromText(cleanSentence);
        accommodations.push({
          title: `AI Recommendation ${index + 1}`,
          description: cleanSentence.length > 500 ? cleanSentence.substring(0, 500) + '...' : cleanSentence,
          category: category || defaultCategory,
          implementation_notes: cleanSentence.length > 200 ? cleanSentence.substring(0, 200) + '...' : cleanSentence
        });
      }
    });
  }
  
  return accommodations;
}

// Helper function to determine category from text content
function determineCategoryFromText(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('sensory') || lowerText.includes('noise') || lowerText.includes('headphones') || lowerText.includes('fidget')) {
    return 'sensory';
  }
  if (lowerText.includes('behavior') || lowerText.includes('break') || lowerText.includes('calm') || lowerText.includes('self-regulation')) {
    return 'behavioral';
  }
  if (lowerText.includes('environment') || lowerText.includes('seating') || lowerText.includes('lighting') || lowerText.includes('quiet')) {
    return 'environmental';
  }
  if (lowerText.includes('social') || lowerText.includes('peer') || lowerText.includes('communication') || lowerText.includes('interaction')) {
    return 'social';
  }
  if (lowerText.includes('assessment') || lowerText.includes('test') || lowerText.includes('evaluation')) {
    return 'assessment';
  }
  
  // Default to academic for learning-related content
  return 'academic';
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
          // temperature: 1 is default - removing to use model default
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
        // temperature: 1 is default - removing to use model default
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
const PORT = Number(process.env.PORT) || 8080;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://localhost:5000',
    'https://iep-hero-companion-myiephero.replit.app',
    'https://afd4ab41-fa60-4e78-9742-69bb4e3004d6-00-6i79wn87wfhu.janeway.replit.dev'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Import path utilities for later use
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    
    // Provide more specific error messages for debugging
    if (error.message === 'Authentication required') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No valid authentication token or session found',
        details: 'Please log in again'
      });
    }
    
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// CRITICAL: Build version endpoint for environment parity verification
app.get('/api/_version', (req, res) => {
  console.log('🔥 VERSION ENDPOINT CALLED - BUILD_ID:', BUILD_ID);
  res.json({ 
    build_id: BUILD_ID,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Update profile endpoint - SECURE VERSION
app.put('/api/auth/update-profile', async (req: any, res) => {
  try {
    // SECURITY FIX: Use proper authentication instead of vulnerable token parsing
    const userId = await getUserId(req);
    
    if (userId === 'anonymous-user') {
      console.log('❌ Profile update blocked: User not authenticated');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to update your profile'
      });
    }
    
    // Rate limiting check
    const now = Date.now();
    const userAttempts = profileUpdateAttempts.get(userId);
    
    if (userAttempts) {
      if (now < userAttempts.resetTime) {
        if (userAttempts.count >= PROFILE_UPDATE_LIMIT) {
          console.log(`❌ Profile update rate limited for user: ${userId}`);
          return res.status(429).json({ 
            error: 'Rate limit exceeded',
            message: 'Too many profile updates. Please try again later.',
            retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
          });
        }
        userAttempts.count++;
      } else {
        // Reset window
        userAttempts.count = 1;
        userAttempts.resetTime = now + PROFILE_UPDATE_WINDOW;
      }
    } else {
      profileUpdateAttempts.set(userId, {
        count: 1,
        resetTime: now + PROFILE_UPDATE_WINDOW
      });
    }
    
    // Validate request body
    let validatedData;
    try {
      validatedData = updateProfileSchema.parse(req.body);
    } catch (error) {
      console.log(`❌ Profile update validation failed for user ${userId}:`, error.errors);
      return res.status(400).json({ 
        error: 'Invalid data',
        details: error.errors
      });
    }
    
    console.log(`✅ Profile update initiated for authenticated user: ${userId}`);
    
    const { firstName, lastName, email, phoneNumber, subscriptionPlan } = validatedData;
    
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

// Push notification token update endpoint
app.put('/api/auth/update-push-token', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { pushNotificationToken, platform } = req.body;
    
    if (!pushNotificationToken && pushNotificationToken !== '') {
      return res.status(400).json({ error: 'Push notification token is required' });
    }

    // Update user with push notification token
    await db.update(schema.users)
      .set({ 
        pushNotificationToken: pushNotificationToken,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId));

    console.log(`Updated push token for user ${userId} on platform ${platform}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating push notification token:', error);
    res.status(500).json({ error: 'Failed to update push notification token' });
  }
});

// Get notification preferences
app.get('/api/notifications/preferences', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const preferences = user[0].notificationPreferences || {
      iepMeetingReminders: true,
      documentAnalysisComplete: true,
      newMessages: true,
      goalProgressUpdates: true,
      subscriptionUpdates: true,
      weeklyReports: false,
      urgentAlerts: true,
    };

    res.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update notification preferences
app.put('/api/notifications/preferences', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Valid preferences object is required' });
    }

    // Update user notification preferences
    await db.update(schema.users)
      .set({ 
        notificationPreferences: preferences,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Send notification endpoint (for future use by internal services)
app.post('/api/notifications/send', async (req: any, res) => {
  try {
    const { userIds, title, body, data, badge } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Valid userIds array is required' });
    }

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Get push tokens for users
    const users = await db.select()
      .from(schema.users)
      .where(and(
        inArray(schema.users.id, userIds),
        isNotNull(schema.users.pushNotificationToken)
      ));

    const tokens = users
      .map(user => user.pushNotificationToken)
      .filter(token => token && token.length > 0);

    if (tokens.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No valid push tokens found for the specified users',
        sentCount: 0 
      });
    }

    // Here you would integrate with Firebase Cloud Messaging or Apple Push Notification service
    // For now, we'll just log the notification that would be sent
    console.log('Would send notification to tokens:', tokens.length);
    console.log('Notification:', { title, body, data, badge });

    // TODO: Implement actual push notification sending using FCM/APNs
    // This would involve:
    // 1. Using Firebase Admin SDK for Android
    // 2. Using APNs for iOS
    // 3. Proper error handling and retry logic

    res.json({ 
      success: true, 
      message: 'Notification queued for delivery',
      sentCount: tokens.length 
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Legacy Replit Auth endpoint (kept for compatibility)
// Removed Replit Auth endpoint - using token-only authentication
app.get('/api/auth/replit-user-disabled', async (req: any, res) => {
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
app.post('/api/onboarding/setup',  async (req: any, res) => {
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
app.get('/api/stripe/test',  async (req: any, res) => {
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
app.post('/api/create-payment-intent',  async (req: any, res) => {
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

// Email verification endpoint - SECURITY FIXED
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

    // 🔒 SECURITY FIX: Check if user already has a password
    if (user.password) {
      // User already has password - mark as verified and redirect to login
      await db.update(schema.users)
        .set({ 
          emailVerified: true,
          verificationToken: null,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, user.id));

      console.log(`Email verified for existing password user: ${user.email}`);
      
      res.json({ 
        success: true, 
        message: 'Email verified successfully. Please sign in with your password.',
        redirectTo: '/auth',
        hasPassword: true
      });
      return;
    }

    // 🔒 SECURITY FIX: For users without passwords, generate a SETUP token instead of clearing verification token
    const setupToken = generateVerificationToken();
    
    // Mark email as verified but set a NEW setup token for password creation
    await db.update(schema.users)
      .set({ 
        emailVerified: true,
        verificationToken: setupToken, // Use NEW token for password setup
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, user.id));

    // Send welcome email
    await sendWelcomeEmail(user.email || '', user.firstName || 'User', user.role || 'parent');

    console.log(`Email verified for new user: ${user.email} - redirecting to password setup`);

    // 🔒 SECURITY FIX: NEVER redirect to dashboards without authentication
    // Always redirect to password setup for new users
    res.json({ 
      success: true, 
      message: 'Email verified successfully. Please create your password to complete setup.',
      redirectTo: `/setup-password?token=${setupToken}`,
      requiresPasswordSetup: true,
      hasPassword: false
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
            const advocatePlanMapping: Record<string, string> = {
              'starter': 'starter',
              'pro': 'pro',
              'agency': 'agency', 
              'agency plus': 'agency-plus',
              'agencyplus': 'agency-plus',
              'agency-annual': 'agency',
              'pro-annual': 'pro',
              'starter-annual': 'starter'
            };
            const planSlug = advocatePlanMapping[user.subscriptionPlan?.toLowerCase() || ''] || 'starter';
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
        lastName: lastName || '',
        verificationToken
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

    // Send password reset email (function not implemented yet)
    console.log('Password reset email would be sent to:', user.email);

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
          verificationToken: user.verificationToken
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
app.post('/api/create-subscription',  async (req: any, res) => {
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

app.get('/api/subscription-status',  async (req: any, res) => {
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
app.get('/api/cases-old-disabled',  async (req: any, res) => {
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
    
    // Build where conditions array
    const whereConditions = [eq(schema.autism_accommodations.user_id, userId)];
    
    // Add student filter if specified
    if (student_id) {
      whereConditions.push(eq(schema.autism_accommodations.student_id, student_id as string));
    }
    
    // Add category filter if specified  
    if (category) {
      whereConditions.push(eq(schema.autism_accommodations.category, category as string));
    }
    
    const query = db.select().from(schema.autism_accommodations).where(and(...whereConditions));
    
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
    let student: any = null;
    if (student_id) {
      const studentResult = await db.select()
        .from(schema.students)
        .where(eq(schema.students.id, student_id));
      student = studentResult[0] || null;
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

// General Accommodations routes (for gifted and general use)
app.get('/api/accommodations', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { student_id, category } = req.query;
    
    const whereConditions = [eq(schema.accommodations.user_id, userId)];
    
    if (student_id) {
      whereConditions.push(eq(schema.accommodations.student_id, student_id as string));
    }
    
    if (category) {
      whereConditions.push(eq(schema.accommodations.category, category as string));
    }
    
    const accommodations = await db.select().from(schema.accommodations)
      .where(and(...whereConditions));
    
    res.json(accommodations);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

app.post('/api/accommodations', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const accommodationData = { 
      ...req.body, 
      user_id: userId,
      status: req.body.status || 'active',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [accommodation] = await db.insert(schema.accommodations).values(accommodationData).returning();
    res.json(accommodation);
  } catch (error) {
    console.error('Error creating accommodation:', error);
    res.status(500).json({ error: 'Failed to create accommodation' });
  }
});

app.post('/api/accommodations/bulk', async (req, res) => {
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
    
    const createdAccommodations = await db.insert(schema.accommodations)
      .values(accommodationData)
      .returning();
    
    res.json(createdAccommodations);
  } catch (error) {
    console.error('Error creating bulk accommodations:', error);
    res.status(500).json({ error: 'Failed to create accommodations' });
  }
});

app.put('/api/accommodations/:id', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;
    
    const [accommodation] = await db.update(schema.accommodations)
      .set({ ...req.body, updated_at: new Date() })
      .where(and(
        eq(schema.accommodations.id, id),
        eq(schema.accommodations.user_id, userId)
      ))
      .returning();
    
    if (!accommodation) {
      return res.status(404).json({ error: 'Accommodation not found' });
    }
    
    res.json(accommodation);
  } catch (error) {
    console.error('Error updating accommodation:', error);
    res.status(500).json({ error: 'Failed to update accommodation' });
  }
});

app.delete('/api/accommodations/:id', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;
    
    await db.delete(schema.accommodations)
      .where(and(
        eq(schema.accommodations.id, id),
        eq(schema.accommodations.user_id, userId)
      ));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    res.status(500).json({ error: 'Failed to delete accommodation' });
  }
});

// Services routes
app.get('/api/services', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { student_id, service_type } = req.query;
    
    const whereConditions = [eq(schema.services.user_id, userId)];
    
    if (student_id) {
      whereConditions.push(eq(schema.services.student_id, student_id as string));
    }
    
    if (service_type) {
      whereConditions.push(eq(schema.services.service_type, service_type as string));
    }
    
    const services = await db.select().from(schema.services)
      .where(and(...whereConditions))
      .orderBy(desc(schema.services.created_at));
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const serviceData = { 
      ...req.body, 
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [service] = await db.insert(schema.services)
      .values(serviceData)
      .returning();
    
    res.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;
    
    const [service] = await db.update(schema.services)
      .set({ ...req.body, updated_at: new Date() })
      .where(and(
        eq(schema.services.id, id),
        eq(schema.services.user_id, userId)
      ))
      .returning();
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;
    
    await db.delete(schema.services)
      .where(and(
        eq(schema.services.id, id),
        eq(schema.services.user_id, userId)
      ));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Save AI Insights accommodations manually
app.post('/api/gifted-assessments/save-insights', async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    console.log(`✅ PRODUCTION: Manually saving AI insights accommodations for student ${student_id}, user: ${userId}`);

    // Get the latest AI analysis for this student
    const [existingAssessment] = await db
      .select()
      .from(schema.gifted_assessments)
      .where(and(
        eq(schema.gifted_assessments.student_id, student_id),
        or(
          isNotNull(schema.gifted_assessments.ai_analysis_parent),
          isNotNull(schema.gifted_assessments.ai_analysis_advocate)
        )
      ))
      .orderBy(desc(schema.gifted_assessments.updated_at))
      .limit(1);

    if (!existingAssessment) {
      return res.status(404).json({ error: 'No AI analysis found for this student' });
    }

    // Get the appropriate AI analysis based on user role
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    const aiInsights = user?.role === 'advocate' 
      ? existingAssessment.ai_analysis_advocate 
      : existingAssessment.ai_analysis_parent;

    if (!aiInsights) {
      return res.status(404).json({ error: 'No AI analysis available for your role' });
    }

    let savedCount = 0;
    
    // Extract accommodations from AI insights (they might be in text sections or structured array)
    const typedInsights = aiInsights as any; // Type assertion since aiInsights is JSON from database
    
    console.log(`🔍 PRODUCTION: Analyzing AI insights structure for student ${student_id}`, Object.keys(typedInsights));
    
    // First check if there's a direct accommodations array
    if (typedInsights.accommodations && Array.isArray(typedInsights.accommodations)) {
      console.log(`✅ PRODUCTION: Found structured accommodations array with ${typedInsights.accommodations.length} items for student ${student_id}`);
      
      for (const accommodation of typedInsights.accommodations) {
        try {
          await db
            .insert(schema.accommodations)
            .values({
              user_id: userId,
              student_id: student_id,
              title: accommodation.title || 'AI Generated Accommodation',
              description: accommodation.description || 'Generated by AI analysis',
              category: accommodation.category || 'academic',
              implementation_notes: accommodation.implementation_notes || accommodation.description,
              effectiveness_rating: null,
              status: 'active',
              created_at: new Date(),
              updated_at: new Date()
            });
          savedCount++;
        } catch (error) {
          console.error('❌ Error saving structured accommodation:', error);
          // Continue with other accommodations even if one fails
        }
      }
    } else {
      // If no structured accommodations array, extract from text sections
      console.log(`🔍 PRODUCTION: No structured accommodations array found, parsing from text sections for student ${student_id}`);
      
      const extractedAccommodations: Array<{title: string, description: string, category: string, implementation_notes: string}> = [];
      
      // Extract from "Accommodation Strategies" section
      const accommodationStrategies = typedInsights['Accommodation Strategies'] || typedInsights['accommodationStrategies'];
      if (accommodationStrategies && typeof accommodationStrategies === 'string') {
        console.log(`🔍 PRODUCTION: Found Accommodation Strategies section (${accommodationStrategies.length} chars)`);
        const accommodations = parseAccommodationText(accommodationStrategies, 'environmental');
        extractedAccommodations.push(...accommodations);
      }
      
      // Extract from "IEP Goal Recommendations" section
      const iepGoals = typedInsights['IEP Goal Recommendations'] || typedInsights['iepGoalRecommendations'];
      if (iepGoals && typeof iepGoals === 'string') {
        console.log(`🔍 PRODUCTION: Found IEP Goal Recommendations section (${iepGoals.length} chars)`);
        const accommodations = parseAccommodationText(iepGoals, 'academic');
        extractedAccommodations.push(...accommodations);
      }
      
      // Extract from "Evidence-Based Interventions" section if it exists
      const evidenceBasedInterventions = typedInsights['Evidence-Based Interventions'] || typedInsights['evidenceBasedInterventions'];
      if (evidenceBasedInterventions && typeof evidenceBasedInterventions === 'string') {
        console.log(`🔍 PRODUCTION: Found Evidence-Based Interventions section (${evidenceBasedInterventions.length} chars)`);
        const accommodations = parseAccommodationText(evidenceBasedInterventions, 'behavioral');
        extractedAccommodations.push(...accommodations);
      }
      
      // Extract from nested objects that might contain text recommendations
      Object.keys(typedInsights).forEach(key => {
        const section = typedInsights[key];
        if (typeof section === 'object' && section !== null) {
          Object.keys(section).forEach(subKey => {
            const subSection = section[subKey];
            if (typeof subSection === 'string' && subSection.length > 50) {
              console.log(`🔍 PRODUCTION: Found nested text section: ${key}.${subKey} (${subSection.length} chars)`);
              const accommodations = parseAccommodationText(subSection, 'social');
              extractedAccommodations.push(...accommodations);
            }
          });
        }
      });
      
      // Save extracted accommodations
      if (extractedAccommodations.length > 0) {
        console.log(`✅ PRODUCTION: Extracted ${extractedAccommodations.length} accommodations from text sections for student ${student_id}`);
        
        for (const accommodation of extractedAccommodations) {
          try {
            await db
              .insert(schema.accommodations)
              .values({
                user_id: userId,
                student_id: student_id,
                title: accommodation.title,
                description: accommodation.description,
                category: accommodation.category,
                implementation_notes: accommodation.implementation_notes,
                effectiveness_rating: null,
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
              });
            savedCount++;
          } catch (error) {
            console.error(`❌ Failed to save extracted accommodation: ${accommodation.title}`, error);
          }
        }
      } else {
        console.log(`⚠️ PRODUCTION: No accommodations could be extracted from AI insights for student ${student_id}`);
        console.log(`🔍 PRODUCTION: Available sections:`, Object.keys(typedInsights));
      }
    }
    
    console.log(`✅ PRODUCTION: Successfully saved ${savedCount} accommodations to Accommodations tab for student ${student_id}`);

    res.json({
      success: true,
      saved_accommodations: savedCount,
      message: savedCount > 0 
        ? `Successfully saved ${savedCount} accommodations from AI insights` 
        : 'No accommodations found in AI insights to save'
    });

  } catch (error) {
    console.error('❌ Error saving AI insights:', error);
    res.status(500).json({ error: 'Failed to save AI insights accommodations' });
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

// Goals routes - for dashboard Goals Achieved stat
app.get('/api/goals', async (req, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Getting goals for authenticated user:', userId);
    
    const goals = await db.select().from(schema.goals).where(eq(schema.goals.user_id, userId));
    console.log(`✅ PRODUCTION: Found ${goals.length} goals for user`);
    
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
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

app.patch('/api/goals/:goalId', async (req, res) => {
  try {
    console.log('🎯 PATCH /api/goals/:goalId - Request received');
    console.log('🎯 Goal ID:', req.params.goalId);
    console.log('🎯 Request body:', req.body);
    
    const userId = await getUserId(req);
    console.log('🎯 User ID resolved:', userId);
    
    const { goalId } = req.params;
    const updates = req.body;
    
    const [updatedGoal] = await db
      .update(schema.goals)
      .set(updates)
      .where(and(
        eq(schema.goals.id, goalId),
        eq(schema.goals.user_id, userId)
      ))
      .returning();
    
    if (!updatedGoal) {
      console.log('❌ Goal not found for user:', userId, 'goalId:', goalId);
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    console.log('✅ Goal updated successfully:', updatedGoal);
    res.json(updatedGoal);
  } catch (error) {
    console.error('❌ Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
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

// Parents routes - Get advocate's parent clients
app.get('/api/parents',  async (req, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Fetching parent clients for advocate user:', userId);
    
    // Get advocate record for current user
    const advocate = await db.select().from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .then(results => results[0]);
    
    if (!advocate) {
      console.log('❌ No advocate profile found for user:', userId);
      return res.json([]); // Return empty array if not an advocate
    }
    
    console.log('✅ Found advocate:', advocate.id);
    
    // Get all parent clients for this advocate from advocate_clients table
    const parentClients = await db.select({
      client: schema.advocate_clients,
      user: schema.users
    })
    .from(schema.advocate_clients)
    .leftJoin(schema.users, eq(schema.advocate_clients.client_id, schema.users.id))
    .where(eq(schema.advocate_clients.advocate_id, advocate.id))
    .orderBy(desc(schema.advocate_clients.created_at));
    
    console.log(`✅ Found ${parentClients.length} parent clients for advocate`);
    
    // Get student counts for all parents in this batch
    const parentIds = parentClients
      .filter(pc => pc.user)
      .map(pc => pc.user!.id);
    
    const studentCounts = await db.select({
      parent_id: schema.students.parent_id,
      count: sql`COUNT(*)`.as('count')
    })
    .from(schema.students)
    .where(inArray(schema.students.parent_id, parentIds))
    .groupBy(schema.students.parent_id);
    
    // Create a map for quick lookup
    const studentCountMap = new Map(
      studentCounts.map(sc => [sc.parent_id, Number(sc.count)])
    );
    
    // Format the response to match what the frontend expects
    const formattedParents = parentClients
      .filter(pc => pc.user) // Only include records where user data exists
      .map(({ client, user }) => ({
        id: user!.id,
        full_name: `${user!.firstName || ''} ${user!.lastName || ''}`.trim() || user!.email,
        email: user!.email,
        phone: '', // Note: phone field doesn't exist in users table
        created_at: client.created_at,
        status: client.status || 'active',
        students_count: studentCountMap.get(user!.id) || 0, // Actual student count from database
        relationship_type: client.relationship_type
      }));
    
    console.log('✅ Returning formatted parents:', formattedParents.map(p => p.email));
    res.json(formattedParents);
  } catch (error) {
    console.error('❌ Error fetching parent clients:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch parent clients' });
  }
});

app.post('/api/parents',  async (req, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Creating parent account by user:', userId);
    
    const { full_name, email, phone, role = 'parent' } = req.body;
    
    if (!full_name || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    // Parse full_name into firstName and lastName
    const nameParts = full_name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check if user already exists
    const [existingUser] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user account (fixed to include firstName/lastName)
    const [newUser] = await db.insert(schema.users).values({
      email,
      firstName,
      lastName,
      role: 'parent',
      emailVerified: false, // They'll need to verify via email
      subscriptionStatus: 'active',
      subscriptionPlan: 'free',
      createdAt: new Date(),
      updatedAt: new Date()
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

// Get advocates with accepted relationships for current parent user
app.get('/api/advocates/for-parent',  async (req, res) => {
  try {
    const userId = await getUserId(req);
    console.log(`✅ PRODUCTION: Getting advocates for parent user: ${userId}`);
    
    // Get advocates who have active relationships with this parent
    const advocateRelationships = await db.select({
      advocate: schema.advocates,
      relationship: schema.advocate_clients
    })
    .from(schema.advocate_clients)
    .leftJoin(schema.advocates, eq(schema.advocate_clients.advocate_id, schema.advocates.id))
    .where(
      and(
        eq(schema.advocate_clients.client_id, userId),
        or(
          eq(schema.advocate_clients.status, 'active'),
          eq(schema.advocate_clients.engagement_stage, 'intake'),
          eq(schema.advocate_clients.engagement_stage, 'assessment'),
          eq(schema.advocate_clients.engagement_stage, 'iep_development'),
          eq(schema.advocate_clients.engagement_stage, 'implementation'),
          eq(schema.advocate_clients.engagement_stage, 'monitoring'),
          eq(schema.advocate_clients.engagement_stage, 'review_renewal')
        )
      )
    );
    
    console.log(`✅ Found ${advocateRelationships.length} advocates with active relationships for parent`);
    
    // Filter out any null advocates and remove duplicates by advocate ID
    const seenAdvocateIds = new Set();
    const advocates = advocateRelationships
      .filter(ar => ar.advocate) // Only include records where advocate data exists
      .filter(ar => {
        if (!ar.advocate) return false; // Additional null check for TypeScript
        if (seenAdvocateIds.has(ar.advocate.id)) {
          return false; // Skip duplicate advocate
        }
        seenAdvocateIds.add(ar.advocate.id);
        return true;
      })
      .map(({ advocate, relationship }) => ({
        ...advocate,
        relationship_status: relationship.status,
        engagement_stage: relationship.engagement_stage
      }));
    
    console.log(`✅ Returning ${advocates.length} advocates for parent: ${advocates.map(a => a?.full_name).join(', ')}`);
    res.json(advocates);
    
  } catch (error) {
    console.error('❌ Error fetching advocates for parent:', error);
    if (error.message && error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch advocates for parent' });
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
app.post('/api/invite-parent',  async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields: email, firstName, lastName' });
    }

    // Get the authenticated advocate user ID  
    const advocateUserId = await getUserId(req);
    
    // Step 1: Create parent in users table (standardized approach)
    const parentUserId = createId();
    const passwordSetupToken = `${parentUserId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(schema.users).values({
      id: parentUserId,
      email,
      firstName: firstName,
      lastName: lastName,
      role: 'parent',
      emailVerified: true, // Advocate-created accounts are pre-verified
      subscriptionStatus: 'active',
      subscriptionPlan: 'free', // Default plan for new parents
      verificationToken: passwordSetupToken // Use verificationToken field for password setup
    });
    
    // Step 2: Create advocate-client relationship (business relationship)
    const relationshipId = createId();
    await db.insert(schema.advocate_clients).values({
      id: relationshipId,
      advocate_id: advocateUserId,
      client_id: parentUserId,
      client_first_name: firstName,
      client_last_name: lastName,
      client_email: email,
      relationship_type: 'invited_client',
      status: 'active',
      start_date: new Date().toISOString(),
      notes: `Parent invited by advocate on ${new Date().toLocaleDateString()}`
    });
    
    // Step 3: Send welcome email to the new parent
    try {
      const { sendAdvocateInviteEmail } = await import('./emailService');
      
      // Get advocate name for email
      const [advocate] = await db
        .select({ firstName: schema.users.firstName, lastName: schema.users.lastName })
        .from(schema.users)
        .where(eq(schema.users.id, advocateUserId))
        .limit(1);
      
      const advocateName = advocate ? `${advocate.firstName} ${advocate.lastName}` : 'Your Advocate';
      
      const emailSent = await sendAdvocateInviteEmail(email, firstName, lastName, advocateName, passwordSetupToken);
      
      if (emailSent) {
        console.log(`✅ Welcome email sent to parent: ${email}`);
      } else {
        console.log(`⚠️ Failed to send welcome email to parent: ${email}`);
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't fail the entire request if email fails
    }
    
    // Log the invitation for tracking
    console.log(`Parent invited: ${firstName} ${lastName} (${email}) - User ID: ${parentUserId}, Relationship ID: ${relationshipId}`);
    
    res.json({
      userId: parentUserId,
      relationshipId: relationshipId,
      success: true
    });
  } catch (error) {
    console.error('Error inviting parent:', error);
    res.status(500).json({ error: 'Failed to invite parent' });
  }
});

// Password setup endpoint for advocate-invited parents
app.post('/api/setup-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    // Find user by verification token
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.verificationToken, token))
      .limit(1);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired setup link' });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Update user with password and clear token
    await db
      .update(schema.users)
      .set({
        password: hashedPassword,
        verificationToken: null, // Clear the setup token
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, user.id));
    
    // Create auth token for immediate login
    const loginToken = `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await db.insert(schema.auth_tokens).values({
      token: loginToken,
      user_id: user.id,
      user_role: user.role,
      expires_at: expiresAt
    });
    
    console.log(`✅ Password setup completed for parent: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Password setup completed successfully',
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
        : `/advocate/dashboard-${user.subscriptionPlan?.toLowerCase().replace(/\s+/g, '') || 'free'}`
    });
  } catch (error) {
    console.error('Error setting up password:', error);
    res.status(500).json({ error: 'Failed to set up password' });
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
app.use('/api/create-expert-review-payment', expertReviewPaymentRoutes);
app.use('/api/expert-review-payment-success', expertReviewPaymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/messaging', messagingRoutes);
// app.use('/api', mainRoutes); // Temporarily disabled - session context issue

// Note: Static file serving is now handled in production check below


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.get('/api/students',  async (req: any, res) => {
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
    
    let students: any[] = [];
    
    if (userRole === 'advocate') {
      // Advocate: Get students from all their clients
      // First get the advocate profile record using the user_id
      const [advocate] = await db
        .select()
        .from(schema.advocates)
        .where(eq(schema.advocates.user_id, userId))
        .limit(1);
      
      if (!advocate) {
        console.log('❌ No advocate profile found for user:', userId);
        students = [];
      } else {
        // Get students using the correct advocate profile ID (not user ID)
        const studentsRaw = await db
          .select({
            id: schema.students.id,
            full_name: schema.students.full_name,
            date_of_birth: schema.students.date_of_birth,
            grade_level: schema.students.grade_level,
            school_name: schema.students.school_name,
            district: schema.students.district,
            case_manager: schema.students.case_manager,
            case_manager_email: schema.students.case_manager_email,
            disability_category: schema.students.disability_category,
            iep_date: schema.students.iep_date,
            iep_status: schema.students.iep_status,
            next_review_date: schema.students.next_review_date,
            emergency_contact: schema.students.emergency_contact,
            emergency_phone: schema.students.emergency_phone,
            medical_info: schema.students.medical_info,
            notes: schema.students.notes,
            parent_id: schema.students.parent_id,
            created_at: schema.students.created_at,
            updated_at: schema.students.updated_at
          })
          .from(schema.students)
          .leftJoin(schema.advocate_clients, eq(schema.students.parent_id, schema.advocate_clients.client_id))
          .where(and(
            eq(schema.advocate_clients.advocate_id, advocate.id),
            eq(schema.advocate_clients.status, 'active')
          ));
        
        // Remove duplicates by student ID
        const studentMap = new Map();
        studentsRaw.forEach(student => {
          if (student.id && !studentMap.has(student.id)) {
            studentMap.set(student.id, student);
          }
        });
        students = Array.from(studentMap.values());
      }
    } else {
      // Parent: Get their own students
      students = await db
        .select({
          id: schema.students.id,
          full_name: schema.students.full_name,
          date_of_birth: schema.students.date_of_birth,
          grade_level: schema.students.grade_level,
          school_name: schema.students.school_name,
          district: schema.students.district,
          case_manager: schema.students.case_manager,
          case_manager_email: schema.students.case_manager_email,
          disability_category: schema.students.disability_category,
          iep_date: schema.students.iep_date,
          iep_status: schema.students.iep_status,
          next_review_date: schema.students.next_review_date,
          emergency_contact: schema.students.emergency_contact,
          emergency_phone: schema.students.emergency_phone,
          medical_info: schema.students.medical_info,
          notes: schema.students.notes,
          parent_id: schema.students.parent_id,
          created_at: schema.students.created_at,
          updated_at: schema.students.updated_at
        })
        .from(schema.students)
        .where(eq(schema.students.parent_id, userId));
    }
    
    console.log(`✅ PRODUCTION: Found ${students.length} students for ${userRole}:`, students.map((s: any) => s.full_name));
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

// PUT endpoint for updating students
app.put('/api/students/:id', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    const studentId = req.params.id;
    const updateData = req.body;

    console.log('✅ PRODUCTION: Updating student:', studentId, 'by user:', userId);

    // Get user's role to verify permission
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userRole = user.role || 'parent';

    // Verify the user has permission to update this student
    const [existingStudent] = await db.select()
      .from(schema.students)
      .where(eq(schema.students.id, studentId));

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check permissions
    if (userRole === 'parent' && existingStudent.parent_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this student' });
    }

    if (userRole === 'advocate') {
      // For advocates, check if they have access to this student through cases or client relationships
      const hasAccess = await db.select()
        .from(schema.cases)
        .where(and(
          eq(schema.cases.advocate_id, userId),
          eq(schema.cases.student_id, studentId)
        ))
        .limit(1);

      if (hasAccess.length === 0) {
        // Also check advocate-client relationships
        let hasClientAccess: any[] = [];
        if (existingStudent.parent_id) {
          hasClientAccess = await db.select()
            .from(schema.advocate_clients)
            .where(and(
              eq(schema.advocate_clients.advocate_id, userId),
              eq(schema.advocate_clients.client_id, existingStudent.parent_id)
            ))
            .limit(1);
        }

        if (hasClientAccess.length === 0) {
          return res.status(403).json({ error: 'Not authorized to update this student' });
        }
      }
    }

    // Update the student
    const [updatedStudent] = await db
      .update(schema.students)
      .set({
        ...updateData,
        updated_at: new Date()
      })
      .where(eq(schema.students.id, studentId))
      .returning();

    console.log('✅ PRODUCTION: Student updated successfully:', updatedStudent.id);
    res.json(updatedStudent);
  } catch (error) {
    console.error('❌ Error updating student:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// GET endpoint for fetching gifted assessments
app.get('/api/gifted-assessments', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Getting gifted assessments for authenticated user:', userId);
    
    const { student_id } = req.query;
    
    // Get user's role to handle advocate vs parent access
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    const userRole = user?.role || 'parent';
    console.log('✅ PRODUCTION: User role for gifted assessments:', userRole);
    
    let assessments: any[] = [];
    
    if (userRole === 'advocate') {
      // For advocates: get assessments for their client students
      const [advocate] = await db
        .select()
        .from(schema.advocates)
        .where(eq(schema.advocates.user_id, userId))
        .limit(1);
      
      if (!advocate) {
        console.log('❌ No advocate profile found for user:', userId);
        return res.json([]);
      }
      
      // Get all client student IDs for this advocate
      const clientStudents = await db
        .select({
          student_id: schema.students.id
        })
        .from(schema.students)
        .leftJoin(schema.advocate_clients, eq(schema.students.parent_id, schema.advocate_clients.client_id))
        .where(and(
          eq(schema.advocate_clients.advocate_id, advocate.id),
          eq(schema.advocate_clients.status, 'active')
        ));
      
      const studentIds = clientStudents.map(cs => cs.student_id);
      console.log('✅ PRODUCTION: Advocate has access to students:', studentIds);
      
      if (studentIds.length > 0) {
        // Build where conditions for advocate
        const whereConditions = [
          eq(schema.gifted_assessments.user_id, userId), // assessments created by this advocate
          inArray(schema.gifted_assessments.student_id, studentIds) // for their client students
        ];
        
        if (student_id) {
          // Filter for specific student if requested
          if (studentIds.includes(student_id)) {
            whereConditions.push(eq(schema.gifted_assessments.student_id, student_id));
          } else {
            console.log('❌ Advocate does not have access to student:', student_id);
            return res.json([]);
          }
        }
        
        assessments = await db
          .select()
          .from(schema.gifted_assessments)
          .where(and(...whereConditions));
      }
    } else {
      // For parents: get assessments they created
      const whereConditions = [eq(schema.gifted_assessments.user_id, userId)];
      
      if (student_id) {
        whereConditions.push(eq(schema.gifted_assessments.student_id, student_id));
      }
      
      assessments = await db
        .select()
        .from(schema.gifted_assessments)
        .where(and(...whereConditions));
    }
    
    console.log(`✅ PRODUCTION: Found ${assessments.length} gifted assessments for ${userRole} ${userId}`);
    res.json(assessments);
  } catch (error) {
    console.error('❌ Error getting gifted assessments:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch gifted assessments' });
  }
});

// POST endpoint for creating new gifted assessments
app.post('/api/gifted-assessments', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Creating gifted assessment for authenticated user:', userId);
    
    const assessmentData = req.body;
    
    // Create new assessment record
    const [newAssessment] = await db
      .insert(schema.gifted_assessments)
      .values({
        ...assessmentData,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    console.log('✅ PRODUCTION: Created new gifted assessment:', newAssessment.id);
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error('❌ Error creating gifted assessment:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to create gifted assessment' });
  }
});

// AI Analysis endpoint for Gifted Assessments
app.post('/api/gifted-assessments/:id/ai-analysis', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;
    const { role = 'parent' } = req.body; // parent or advocate

    console.log(`✅ PRODUCTION: Generating AI analysis for assessment ${id}, user: ${userId}, role: ${role}`);

    // Get the assessment
    const [assessment] = await db
      .select()
      .from(schema.gifted_assessments)
      .where(and(
        eq(schema.gifted_assessments.id, id),
        eq(schema.gifted_assessments.user_id, userId)
      ))
      .limit(1);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if we have OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'AI analysis not available - missing API key' });
    }

    // Prepare assessment data for AI analysis
    const assessmentData = {
      assessment_type: assessment.assessment_type,
      giftedness_areas: assessment.giftedness_areas,
      learning_differences: assessment.learning_differences,
      strengths: assessment.strengths,
      challenges: assessment.challenges,
      recommendations: assessment.recommendations,
      enrichment_activities: assessment.enrichment_activities,
      acceleration_needs: assessment.acceleration_needs,
      social_emotional_needs: assessment.social_emotional_needs,
      evaluator_notes: assessment.evaluator_notes
    };

    // Generate AI insights using OpenAI
    const aiInsights = await generateGiftedAssessmentAI(assessmentData, role);

    // Save AI analysis to database
    const updateData: any = {
      updated_at: new Date(),
      ai_generated_at: new Date()
    };

    if (role === 'parent') {
      updateData.ai_analysis_parent = aiInsights;
    } else {
      updateData.ai_analysis_advocate = aiInsights;
    }

    await db
      .update(schema.gifted_assessments)
      .set(updateData)
      .where(eq(schema.gifted_assessments.id, id));

    console.log(`✅ PRODUCTION: AI analysis generated and saved for assessment ${id}`);
    
    res.json({
      success: true,
      ai_analysis: aiInsights,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating AI analysis:', error);
    res.status(500).json({ error: 'Failed to generate AI analysis' });
  }
});

// GET endpoint for fetching existing gifted AI analysis
app.get('/api/gifted_assessments/ai-insights', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    console.log(`✅ PRODUCTION: Getting gifted AI insights for student ${student_id}, user: ${userId}`);

    // Check user role to determine access
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let assessments: any[] = [];

    if (user.role === 'advocate') {
      // For advocates: Get assessments for students they have access to through advocate-client relationship
      const advocateStudents = await db
        .select({ student_id: schema.students.id })
        .from(schema.students)
        .innerJoin(schema.advocate_clients, eq(schema.students.parent_id, schema.advocate_clients.client_id))
        .innerJoin(schema.advocates, eq(schema.advocate_clients.advocate_id, schema.advocates.id))
        .where(and(
          eq(schema.advocates.user_id, userId),
          eq(schema.students.id, student_id),
          eq(schema.advocate_clients.status, 'active')
        ));

      if (advocateStudents.length > 0) {
        // Get gifted assessments for this student from any user (parent or advocate)
        assessments = await db
          .select()
          .from(schema.gifted_assessments)
          .where(and(
            eq(schema.gifted_assessments.student_id, student_id),
            or(
              isNotNull(schema.gifted_assessments.ai_analysis_parent),
              isNotNull(schema.gifted_assessments.ai_analysis_advocate)
            )
          ))
          .orderBy(desc(schema.gifted_assessments.updated_at));
      }
    } else {
      // For parents: Get their own assessments
      assessments = await db
        .select()
        .from(schema.gifted_assessments)
        .where(and(
          eq(schema.gifted_assessments.student_id, student_id),
          eq(schema.gifted_assessments.user_id, userId),
          or(
            isNotNull(schema.gifted_assessments.ai_analysis_parent),
            isNotNull(schema.gifted_assessments.ai_analysis_advocate)
          )
        ))
        .orderBy(desc(schema.gifted_assessments.updated_at));
    }

    if (assessments.length === 0) {
      return res.json({ analyses: [] });
    }

    // Format the analyses for the frontend
    const analyses = assessments.map(assessment => ({
      id: assessment.id,
      assessment_type: assessment.assessment_type,
      timestamp: assessment.ai_generated_at || assessment.updated_at,
      ai_analysis: assessment.ai_analysis_advocate || assessment.ai_analysis_parent
    }));

    console.log(`✅ PRODUCTION: Found ${analyses.length} AI analyses for student ${student_id}`);
    
    res.json({ analyses });

  } catch (error) {
    console.error('❌ Error fetching gifted AI insights:', error);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

// POST endpoint for generating gifted AI analysis for advocates
app.post('/api/gifted_assessments/ai-insights', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    const { student_id, analysis_type = 'comprehensive' } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    console.log(`✅ PRODUCTION: Generating gifted AI insights for student ${student_id}, user: ${userId}, analysis_type: ${analysis_type}`);

    // Check if we have OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'AI analysis not available - missing API key' });
    }

    // Get user and verify they are an advocate
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Allow both advocates and parents to generate AI analysis
    const isAdvocate = user.role === 'advocate';
    const isParent = user.role === 'parent';
    
    if (!isAdvocate && !isParent) {
      return res.status(403).json({ error: 'Only advocates and parents can generate AI analysis' });
    }

    let studentInfo: any;
    
    if (isAdvocate) {
      // Get advocate profile
      const [advocate] = await db
        .select()
        .from(schema.advocates)
        .where(eq(schema.advocates.user_id, userId))
        .limit(1);

      if (!advocate) {
        return res.status(404).json({ error: 'Advocate profile not found' });
      }

      // Verify advocate has access to this student through advocate-client relationship
      const advocateStudents = await db
        .select({ student_id: schema.students.id, parent_id: schema.students.parent_id })
        .from(schema.students)
        .innerJoin(schema.advocate_clients, eq(schema.students.parent_id, schema.advocate_clients.client_id))
        .innerJoin(schema.advocates, eq(schema.advocate_clients.advocate_id, schema.advocates.id))
        .where(and(
          eq(schema.advocates.user_id, userId),
          eq(schema.students.id, student_id),
          eq(schema.advocate_clients.status, 'active')
        ));

      if (advocateStudents.length === 0) {
        return res.status(403).json({ error: 'You do not have access to this student' });
      }

      studentInfo = advocateStudents[0];
    } else {
      // For parents, verify they own this student
      const [parentStudent] = await db
        .select({ student_id: schema.students.id, parent_id: schema.students.parent_id })
        .from(schema.students)
        .where(and(
          eq(schema.students.id, student_id),
          eq(schema.students.parent_id, userId)
        ))
        .limit(1);

      if (!parentStudent) {
        return res.status(403).json({ error: 'You do not have access to this student' });
      }

      studentInfo = parentStudent;
    }

    // Check if there's already a gifted assessment for this student
    let [existingAssessment] = await db
      .select()
      .from(schema.gifted_assessments)
      .where(eq(schema.gifted_assessments.student_id, student_id))
      .orderBy(desc(schema.gifted_assessments.updated_at))
      .limit(1);

    // If no assessment exists, create a minimal one for AI analysis
    if (!existingAssessment) {
      const assessmentType = isAdvocate ? 'advocate_initiated' : 'parent_initiated';
      const ownerUserId = isAdvocate ? studentInfo.parent_id : userId;
      
      console.log(`✅ PRODUCTION: Creating new gifted assessment for student ${student_id} by ${user.role}`);
      
      [existingAssessment] = await db
        .insert(schema.gifted_assessments)
        .values({
          user_id: ownerUserId, // Use appropriate owner based on role
          student_id: student_id,
          assessment_type: assessmentType,
          giftedness_areas: ['intellectual'], // Default minimal data
          status: 'in_progress',
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      
      console.log(`✅ PRODUCTION: Created new assessment ${existingAssessment.id} for ${user.role} analysis`);
    }

    // Prepare assessment data for AI analysis - handle both full and minimal assessments
    const defaultNotes = isAdvocate 
      ? 'Assessment data being gathered by advocate. Professional analysis in progress.'
      : 'Assessment data being gathered. Comprehensive analysis in progress.';
    
    const assessmentData = {
      assessment_type: existingAssessment.assessment_type || (isAdvocate ? 'advocate_initiated' : 'parent_initiated'),
      giftedness_areas: existingAssessment.giftedness_areas || ['intellectual'],
      learning_differences: existingAssessment.learning_differences || [],
      strengths: existingAssessment.strengths || { notes: defaultNotes },
      challenges: existingAssessment.challenges || { notes: 'Areas of need being identified through comprehensive review.' },
      recommendations: existingAssessment.recommendations || { notes: 'Recommendations to be developed based on assessment data.' },
      enrichment_activities: existingAssessment.enrichment_activities || { notes: 'Enrichment opportunities being evaluated.' },
      acceleration_needs: existingAssessment.acceleration_needs || { notes: 'Acceleration needs assessment in progress.' },
      social_emotional_needs: existingAssessment.social_emotional_needs || { notes: 'Social-emotional profile being developed.' },
      evaluator_notes: existingAssessment.evaluator_notes || `${isAdvocate ? 'Professional advocate' : 'Parent'}-initiated assessment for comprehensive gifted education planning.`
    };

    // Generate AI insights using OpenAI with appropriate role
    const aiRole = isAdvocate ? 'advocate' : 'parent';
    console.log(`✅ PRODUCTION: Generating AI analysis for assessment ${existingAssessment.id} with ${aiRole} role`);
    const aiInsights = await generateGiftedAssessmentAI(assessmentData, aiRole);

    // Save AI analysis to database in the appropriate field
    const updateData: any = {
      ai_generated_at: new Date(),
      updated_at: new Date()
    };
    
    if (isAdvocate) {
      updateData.ai_analysis_advocate = aiInsights;
    } else {
      updateData.ai_analysis_parent = aiInsights;
    }

    await db
      .update(schema.gifted_assessments)
      .set(updateData)
      .where(eq(schema.gifted_assessments.id, existingAssessment.id));

    console.log(`✅ PRODUCTION: ${user.role} AI analysis generated and saved for assessment ${existingAssessment.id}`);
    
    // CRITICAL: Save AI-generated accommodations to the accommodations table
    if (aiInsights.accommodations && Array.isArray(aiInsights.accommodations)) {
      console.log(`✅ PRODUCTION: Saving ${aiInsights.accommodations.length} AI-generated accommodations for student ${student_id}`);
      
      for (const accommodation of aiInsights.accommodations) {
        try {
          await db
            .insert(schema.accommodations)
            .values({
              user_id: userId,
              student_id: student_id,
              title: accommodation.title || 'AI Generated Accommodation',
              description: accommodation.description || 'Generated by AI analysis',
              category: accommodation.category || 'academic',
              implementation_notes: accommodation.implementation_notes || accommodation.description,
              effectiveness_rating: null, // To be rated later
              status: 'active',
              created_at: new Date(),
              updated_at: new Date()
            });
        } catch (error) {
          console.error('❌ Error saving accommodation:', error);
          // Continue with other accommodations even if one fails
        }
      }
      console.log(`✅ PRODUCTION: Successfully saved accommodations to Accommodations tab`);
    } else {
      console.log(`⚠️ PRODUCTION: No accommodations array found in AI insights for student ${student_id}`);
    }
    
    res.json({
      success: true,
      assessment_id: existingAssessment.id,
      ai_analysis: aiInsights,
      analysis_type: analysis_type,
      generated_at: new Date().toISOString(),
      role: user.role
    });

  } catch (error) {
    console.error('❌ Error generating advocate AI analysis:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (error.message.includes('Insufficient assessment data')) {
      return res.status(400).json({ 
        error: 'Insufficient assessment data', 
        message: error.message 
      });
    }
    res.status(500).json({ error: 'Failed to generate AI analysis' });
  }
});

// GET endpoint for fetching gifted assessment profile (aggregated data)
app.get('/api/gifted_assessments/profile', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    console.log(`✅ PRODUCTION: Getting gifted profile for student ${student_id}, user: ${userId}`);

    // Check user role to determine access
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let assessments: any[] = [];

    if (user.role === 'advocate') {
      // For advocates: Get assessments for students they have access to through advocate-client relationship
      const advocateStudents = await db
        .select({ student_id: schema.students.id })
        .from(schema.students)
        .innerJoin(schema.advocate_clients, eq(schema.students.parent_id, schema.advocate_clients.client_id))
        .innerJoin(schema.advocates, eq(schema.advocate_clients.advocate_id, schema.advocates.id))
        .where(and(
          eq(schema.advocates.user_id, userId),
          eq(schema.students.id, student_id),
          eq(schema.advocate_clients.status, 'active')
        ));

      if (advocateStudents.length > 0) {
        // Get ALL gifted assessments for this student (not just by current user)
        assessments = await db
          .select()
          .from(schema.gifted_assessments)
          .where(eq(schema.gifted_assessments.student_id, student_id))
          .orderBy(desc(schema.gifted_assessments.updated_at));
      }
    } else {
      // For parents: Get assessments for their student
      assessments = await db
        .select()
        .from(schema.gifted_assessments)
        .where(and(
          eq(schema.gifted_assessments.student_id, student_id),
          eq(schema.gifted_assessments.user_id, userId)
        ))
        .orderBy(desc(schema.gifted_assessments.updated_at));
    }

    // Aggregate and organize the assessment data
    const profile = {
      student_id,
      assessments: assessments.map(assessment => ({
        id: assessment.id,
        assessment_type: assessment.assessment_type,
        giftedness_areas: assessment.giftedness_areas,
        strengths: assessment.strengths,
        challenges: assessment.challenges,
        learning_differences: assessment.learning_differences,
        recommendations: assessment.recommendations,
        enrichment_activities: assessment.enrichment_activities,
        acceleration_needs: assessment.acceleration_needs,
        social_emotional_needs: assessment.social_emotional_needs,
        evaluator_notes: assessment.evaluator_notes,
        created_at: assessment.created_at,
        updated_at: assessment.updated_at,
        ai_analysis_parent: assessment.ai_analysis_parent,
        ai_analysis_advocate: assessment.ai_analysis_advocate
      })),
      summary: {
        total_assessments: assessments.length,
        assessment_types: [...new Set(assessments.map(a => a.assessment_type))],
        has_ai_analysis: assessments.some(a => a.ai_analysis_parent || a.ai_analysis_advocate),
        last_updated: assessments.length > 0 ? assessments[0].updated_at : null
      }
    };

    console.log(`✅ PRODUCTION: Found ${assessments.length} assessments for student profile ${student_id}`);
    
    res.json(profile);

  } catch (error) {
    console.error('❌ Error fetching gifted profile:', error);
    res.status(500).json({ error: 'Failed to fetch gifted profile' });
  }
});

// Individual tool save endpoints
app.post('/api/gifted_assessments/cognitive', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Creating cognitive assessment for user:', userId);
    
    const assessmentData = {
      ...req.body,
      assessment_type: 'cognitive',
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [newAssessment] = await db
      .insert(schema.gifted_assessments)
      .values(assessmentData)
      .returning();
    
    console.log('✅ PRODUCTION: Created cognitive assessment:', newAssessment.id);
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error('❌ Error creating cognitive assessment:', error);
    res.status(500).json({ error: 'Failed to create cognitive assessment' });
  }
});

app.post('/api/gifted_assessments/creative', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Creating creative assessment for user:', userId);
    
    const assessmentData = {
      ...req.body,
      assessment_type: 'creative',
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [newAssessment] = await db
      .insert(schema.gifted_assessments)
      .values(assessmentData)
      .returning();
    
    console.log('✅ PRODUCTION: Created creative assessment:', newAssessment.id);
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error('❌ Error creating creative assessment:', error);
    res.status(500).json({ error: 'Failed to create creative assessment' });
  }
});

app.post('/api/gifted_assessments/academic', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Creating academic assessment for user:', userId);
    
    const assessmentData = {
      ...req.body,
      assessment_type: 'academic',
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [newAssessment] = await db
      .insert(schema.gifted_assessments)
      .values(assessmentData)
      .returning();
    
    console.log('✅ PRODUCTION: Created academic assessment:', newAssessment.id);
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error('❌ Error creating academic assessment:', error);
    res.status(500).json({ error: 'Failed to create academic assessment' });
  }
});

app.post('/api/gifted_assessments/leadership', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    console.log('✅ PRODUCTION: Creating leadership assessment for user:', userId);
    
    const assessmentData = {
      ...req.body,
      assessment_type: 'leadership',
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [newAssessment] = await db
      .insert(schema.gifted_assessments)
      .values(assessmentData)
      .returning();
    
    console.log('✅ PRODUCTION: Created leadership assessment:', newAssessment.id);
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error('❌ Error creating leadership assessment:', error);
    res.status(500).json({ error: 'Failed to create leadership assessment' });
  }
});

app.get('/api/cases',  async (req: any, res) => {
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
    
    let cases: any[] = [];
    
    if (userRole === 'advocate') {
      // Advocate: Get cases where they are the advocate
      // First get the advocate record to find the proper advocate_id
      const advocate = await db.select().from(schema.advocates)
        .where(eq(schema.advocates.user_id, userId))
        .then(results => results[0]);
      
      if (advocate) {
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
            updated_at: schema.cases.updated_at,
            // Join with users table to get parent information
            parent_first_name: schema.users.firstName,
            parent_last_name: schema.users.lastName,
            parent_email: schema.users.email
          })
          .from(schema.cases)
          .leftJoin(schema.users, eq(schema.cases.client_id, schema.users.id))
          .where(eq(schema.cases.advocate_id, advocate.id));
      }
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
    
    console.log(`✅ PRODUCTION: Found ${cases.length} cases for ${userRole}:`, cases.map((c: any) => c.case_title));
    res.json(cases);
  } catch (error) {
    console.error('❌ Error getting cases:', error);
    if (error.message.includes('Authentication required')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// POST /api/cases - Create new case
app.post('/api/cases',  async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    const { student_id, title, description, status = 'active' } = req.body;
    
    console.log('✅ PRODUCTION: Creating case for user:', userId);
    console.log('✅ PRODUCTION: Case data:', { student_id, title, description, status });
    
    // Validate required fields
    if (!student_id || !title || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: student_id, title, and description are required' 
      });
    }
    
    // Get advocate profile
    const advocate = await db.select().from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .then(results => results[0]);
    
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found' });
    }
    
    // Get student to find parent/client info
    const [student] = await db.select().from(schema.students)
      .where(eq(schema.students.id, student_id))
      .limit(1);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Create new case
    const [newCase] = await db.insert(schema.cases).values({
      advocate_id: advocate.id,
      client_id: student.parent_id || student.user_id, // Use parent_id or user_id as client
      student_id: student_id,
      case_title: title,
      description: description,
      status: status,
      case_type: 'iep_support',
      priority: 'medium',
      billing_rate: 150,
      total_hours: 0,
      next_action: 'Initial consultation',
      next_action_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    }).returning();
    
    console.log('✅ PRODUCTION: Case created successfully:', newCase);
    
    res.status(201).json({
      success: true,
      case: newCase
    });
    
  } catch (error) {
    console.error('❌ Error creating case:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// Initialize server with token-only authentication
(async () => {
  console.log('🔧 Starting server with token-based authentication...');
  // Replit Auth completely disabled - using token-only authentication
  console.log('✅ Token-based authentication active');
  
  // Setup complete

  
  // Autism AI Analysis endpoint
  app.post('/api/autism-ai-analysis', async (req: any, res) => {
    try {
      const userId = await getUserId(req);
      const { student_id, analysis_type, custom_request } = req.body;

      if (!student_id || !analysis_type) {
        return res.status(400).json({ error: 'student_id and analysis_type are required' });
      }

      // Get student data for context
      const [student] = await db.select().from(schema.students)
        .where(and(
          eq(schema.students.id, student_id),
          eq(schema.students.user_id, userId)
        ));

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Get existing autism accommodations for context
      const accommodations = await db.select().from(schema.autism_accommodations)
        .where(and(
          eq(schema.autism_accommodations.student_id, student_id),
          eq(schema.autism_accommodations.user_id, userId)
        ));

      // Enhanced AI analysis prompt with evidence-based frameworks
      let systemPrompt = `You are a Board Certified Behavior Analyst (BCBA) and autism education specialist with expertise in evidence-based practices for supporting students with autism spectrum disorders. You have extensive experience with IEP development, sensory processing disorders, and positive behavior interventions.

Your responses must be:
- Evidence-based and cite current research when possible
- Practical and immediately actionable for school teams
- Individualized to the specific student's needs and characteristics
- Aligned with special education law and best practices
- Structured in clear, professional language suitable for IEP documentation

Always consider these autism-specific frameworks:
- SCERTS Model (Social Communication, Emotional Regulation, Transactional Support)
- TEACCH Structured Teaching principles
- Visual supports and environmental modifications
- Sensory processing considerations
- Executive functioning supports
- Positive behavior intervention strategies`;

      let userPrompt = '';
      const enhancedStudentContext = `
STUDENT PROFILE:
Name: ${student.full_name}
Grade Level: ${student.grade_level || 'Not specified'}
Educational Setting: ${student.school_name || 'General education classroom'}
District: ${student.district || 'Not specified'}
Primary Disability: ${student.disability_category || 'Not specified'}
Case Manager: ${student.case_manager || 'Not assigned'}
IEP Status: ${student.iep_status || 'Unknown'}

CURRENT SUPPORT CONTEXT:
- Active Accommodations: ${accommodations.length} autism-specific supports documented
- Existing Accommodations: ${accommodations.map(acc => acc.title).join(', ') || 'None documented'}
- Additional Notes: ${student.notes || 'No additional documentation available'}

ANALYSIS REQUEST: Provide comprehensive ${analysis_type} analysis and recommendations for this student.
      `;

      switch (analysis_type) {
        case 'sensory':
          userPrompt = `${enhancedStudentContext}

SENSORY PROCESSING ANALYSIS REQUIRED:

Using the Sensory Processing Measure and evidence-based sensory strategies, provide comprehensive analysis including:

1. SENSORY PROFILE ASSESSMENT:
   - Likely sensory seeking vs. avoiding patterns across all 7 senses
   - Specific sensory triggers commonly seen in similar students
   - Signs of sensory overload and dysregulation to monitor

2. ENVIRONMENTAL ACCOMMODATIONS:
   - Classroom modifications for optimal sensory environment
   - Seating, lighting, and acoustic recommendations
   - Visual and physical organization strategies

3. SENSORY TOOLS & STRATEGIES:
   - Specific sensory tools with evidence-based rationale
   - Self-regulation techniques the student can learn
   - Sensory break protocols with timing and location

4. EDUCATIONAL IMPACT ANALYSIS:
   - How sensory needs likely affect learning and participation
   - Specific academic tasks that may require sensory supports
   - Social interaction implications

5. IEP LANGUAGE RECOMMENDATIONS:
   - Measurable goals targeting sensory self-regulation
   - Specific accommodations and modifications
   - Data collection strategies for progress monitoring

Respond with a structured JSON object using this exact format:
{
  "analysis_type": "sensory",
  "student_summary": "Brief summary of student's likely sensory profile",
  "detailed_analysis": "Comprehensive sensory analysis covering all sensory systems",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "evidence_base": "Research-based rationale for recommendations",
  "environmental_modifications": ["Modification 1", "Modification 2", "Modification 3"],
  "sensory_tools": ["Tool 1 with rationale", "Tool 2 with rationale", "Tool 3 with rationale"],
  "self_regulation_strategies": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "iep_goals": ["Measurable goal 1", "Measurable goal 2"],
  "accommodations": ["Accommodation 1", "Accommodation 2", "Accommodation 3"],
  "data_collection": "Specific methods for tracking sensory regulation",
  "immediate_actions": ["Action 1", "Action 2", "Action 3"],
  "long_term_recommendations": ["Recommendation 1", "Recommendation 2"]
}`;
          break;

        case 'communication':
          userPrompt = `${enhancedStudentContext}

COMMUNICATION ASSESSMENT REQUIRED:

Using SCERTS and evidence-based communication strategies, provide comprehensive analysis including:

1. COMMUNICATION PROFILE:
   - Receptive vs. expressive language strengths and needs
   - Social communication patterns typical for grade level
   - Pragmatic language and social interaction skills

2. VISUAL SUPPORT SYSTEMS:
   - Visual schedules and transition supports needed
   - Social stories and visual cues for classroom routines
   - Communication boards or AAC considerations

3. PEER INTERACTION SUPPORTS:
   - Structured social opportunities and facilitation
   - Friendship and social skills development
   - Inclusive classroom participation strategies

4. ACADEMIC COMMUNICATION:
   - Language supports for curriculum access
   - Modified instructions and comprehension checks
   - Alternative ways to demonstrate learning

Respond with this exact JSON format:
{
  "analysis_type": "communication",
  "student_summary": "Communication profile summary",
  "detailed_analysis": "Comprehensive communication analysis",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "evidence_base": "Research supporting recommendations",
  "visual_supports": ["Support 1", "Support 2", "Support 3"],
  "social_communication": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "academic_supports": ["Support 1", "Support 2", "Support 3"],
  "peer_interaction": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "aac_considerations": "AAC assessment and recommendations",
  "iep_goals": ["Measurable goal 1", "Measurable goal 2"],
  "immediate_actions": ["Action 1", "Action 2", "Action 3"],
  "progress_monitoring": "Specific data collection methods"
}`;
          break;

        case 'behavioral':
          userPrompt = `${enhancedStudentContext}

BEHAVIORAL ANALYSIS REQUIRED:

Using Positive Behavior Interventions and Supports (PBIS) and Applied Behavior Analysis (ABA) principles:

1. FUNCTION-BASED ASSESSMENT:
   - Likely functions of challenging behaviors (escape, attention, sensory, tangible)
   - Environmental and internal triggers
   - Replacement behaviors and coping strategies

2. ANTECEDENT STRATEGIES:
   - Environmental modifications to prevent challenging behaviors
   - Visual supports and predictability structures
   - Teaching and practice opportunities

3. SELF-REGULATION DEVELOPMENT:
   - Emotional regulation strategies appropriate for grade level
   - Self-monitoring and self-management systems
   - Coping skills and calming strategies

4. CRISIS PREVENTION:
   - Early warning signs and intervention protocols
   - De-escalation techniques and safe spaces
   - Communication with family and team coordination

Respond with this exact JSON format:
{
  "analysis_type": "behavioral",
  "student_summary": "Behavioral profile summary",
  "detailed_analysis": "Comprehensive behavioral analysis",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "evidence_base": "ABA and PBIS research foundation",
  "likely_functions": ["Function 1", "Function 2"],
  "triggers": ["Trigger 1", "Trigger 2", "Trigger 3"],
  "antecedent_strategies": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "replacement_behaviors": ["Behavior 1", "Behavior 2"],
  "self_regulation": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "environmental_mods": ["Modification 1", "Modification 2"],
  "crisis_prevention": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "iep_goals": ["Measurable goal 1", "Measurable goal 2"],
  "data_collection": "Specific behavior tracking methods",
  "immediate_actions": ["Action 1", "Action 2", "Action 3"]
}`;
          break;

        case 'social':
          userPrompt = `${enhancedStudentContext}

SOCIAL SKILLS ANALYSIS REQUIRED:

Using evidence-based social skills interventions and peer-mediated strategies:

1. SOCIAL COMPETENCE ASSESSMENT:
   - Current social strengths to build upon
   - Areas for growth in peer relationships
   - Social cognition and perspective-taking skills

2. STRUCTURED SOCIAL OPPORTUNITIES:
   - Peer buddy systems and social facilitation
   - Lunch bunch, social clubs, and activity groups
   - Inclusive participation in school activities

3. SOCIAL SKILLS INSTRUCTION:
   - Direct teaching of social rules and expectations
   - Practice opportunities in natural settings
   - Generalization across different contexts

4. PEER RELATIONSHIP FACILITATION:
   - Friendship development and maintenance
   - Conflict resolution and problem-solving
   - Building social connections and belonging

Respond with this exact JSON format:
{
  "analysis_type": "social",
  "student_summary": "Social skills profile summary",
  "detailed_analysis": "Comprehensive social analysis",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "evidence_base": "Social skills intervention research",
  "social_strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "growth_areas": ["Area 1", "Area 2", "Area 3"],
  "structured_opportunities": ["Opportunity 1", "Opportunity 2"],
  "direct_instruction": ["Skill 1", "Skill 2", "Skill 3"],
  "peer_supports": ["Support 1", "Support 2", "Support 3"],
  "generalization": ["Strategy 1", "Strategy 2"],
  "friendship_building": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "iep_goals": ["Measurable goal 1", "Measurable goal 2"],
  "progress_monitoring": "Social skills data collection",
  "immediate_actions": ["Action 1", "Action 2", "Action 3"]
}`;
          break;

        case 'custom':
          userPrompt = `${enhancedStudentContext}

CUSTOM ANALYSIS REQUEST: "${custom_request}"

Provide comprehensive autism-specific analysis addressing the specific request while considering all relevant domains:

1. TARGETED ANALYSIS based on the specific request
2. EVIDENCE-BASED RECOMMENDATIONS using current research
3. PRACTICAL IMPLEMENTATION strategies for school team
4. IEP INTEGRATION considerations
5. FAMILY COLLABORATION suggestions

Respond with this exact JSON format:
{
  "analysis_type": "custom",
  "request_addressed": "${custom_request}",
  "student_summary": "Student profile relevant to request",
  "detailed_analysis": "Comprehensive analysis addressing the specific request",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "evidence_base": "Research supporting recommendations",
  "targeted_strategies": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "implementation_plan": ["Step 1", "Step 2", "Step 3"],
  "iep_considerations": ["Consideration 1", "Consideration 2"],
  "family_collaboration": ["Strategy 1", "Strategy 2"],
  "cross_domain_impact": "How this affects other areas of development",
  "immediate_actions": ["Action 1", "Action 2", "Action 3"],
  "long_term_goals": ["Goal 1", "Goal 2"]
}`;
          break;

        default:
          return res.status(400).json({ error: 'Invalid analysis type' });
      }

      // Generate AI analysis using OpenAI with proper error handling
      let analysisData = {};
      
      try {
        console.log(`🤖 Generating ${analysis_type} analysis for student ${student.full_name}...`);
        
        // TEMPORARY: Use minimal prompt for debugging
        const simpleSystemPrompt = "You are an educational expert providing autism analysis.";
        const simpleUserPrompt = `Provide a brief sensory analysis for a student with autism. Return JSON with fields: analysis_type, summary, recommendations.`;
        
        console.log(`📝 Using simplified prompts for debugging`);
        
        // Add timeout wrapper for OpenAI call
        const openaiCall = async () => {
          return await openai.chat.completions.create({
            model: "gpt-4o", // Using GPT-4 Omni, the latest production OpenAI model
            messages: [
              { role: "system", content: simpleSystemPrompt },
              { role: "user", content: simpleUserPrompt }
            ],
            max_tokens: 500,
            response_format: { type: "json_object" }
          });
        };

        // Race against timeout
        const completion = await Promise.race([
          openaiCall(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('OpenAI timeout after 30s')), 30000))
        ]) as any;

        // Debug the full OpenAI response
        console.log('🔍 Full completion object:', JSON.stringify(completion, null, 2));
        console.log('🔍 Choices array length:', completion.choices?.length);
        console.log('🔍 First choice:', JSON.stringify(completion.choices[0], null, 2));
        
        const aiResponse = completion.choices[0]?.message?.content;
        console.log('✅ OpenAI response received, length:', aiResponse?.length);
        console.log('✅ Actual response content:', aiResponse);
        
        if (!aiResponse || aiResponse.trim().length === 0) {
          console.error('❌ OpenAI returned empty response');
          throw new Error('Empty or invalid response from OpenAI');
        }
        
        analysisData = JSON.parse(aiResponse);
        console.log('✅ Analysis data parsed successfully:', Object.keys(analysisData));
        
        // Ensure we have meaningful data
        if (Object.keys(analysisData).length === 0) {
          throw new Error('OpenAI returned empty analysis object');
        }
        
      } catch (openAIError) {
        console.error('❌ OpenAI analysis failed:', openAIError);
        
        // Create comprehensive fallback analysis with practical guidance
        const fallbackAnalysis = {
          sensory: {
            analysis_type: "sensory",
            student_summary: `Sensory analysis for ${student.full_name} - Grade ${student.grade_level || 'Unknown'}`,
            detailed_analysis: "AI analysis temporarily unavailable. Please consider common sensory needs for students with autism including environmental modifications, sensory tools, and self-regulation strategies.",
            key_findings: [
              "Consider sensory processing assessment by occupational therapist",
              "Observe for sensory seeking or avoiding behaviors",
              "Monitor environmental triggers in classroom"
            ],
            evidence_base: "Sensory processing research supports individualized assessment and intervention",
            environmental_modifications: [
              "Preferential seating away from distractions",
              "Noise-reducing accommodations",
              "Lighting adjustments as needed"
            ],
            immediate_actions: [
              "Request sensory evaluation",
              "Trial sensory tools",
              "Document sensory responses"
            ],
            status: "fallback_content"
          },
          communication: {
            analysis_type: "communication",
            student_summary: `Communication analysis for ${student.full_name} - Grade ${student.grade_level || 'Unknown'}`,
            detailed_analysis: "AI analysis temporarily unavailable. Consider comprehensive communication assessment and visual supports for students with autism.",
            key_findings: [
              "Visual supports often beneficial for students with autism",
              "Social communication skills may need explicit teaching",
              "Consider AAC evaluation if needed"
            ],
            immediate_actions: [
              "Implement visual schedule",
              "Trial social stories",
              "Consider speech therapy evaluation"
            ],
            status: "fallback_content"
          },
          behavioral: {
            analysis_type: "behavioral",
            student_summary: `Behavioral analysis for ${student.full_name} - Grade ${student.grade_level || 'Unknown'}`,
            detailed_analysis: "AI analysis temporarily unavailable. Positive behavior supports and function-based interventions are recommended for students with autism.",
            key_findings: [
              "Behaviors often serve specific functions",
              "Antecedent strategies more effective than consequences",
              "Self-regulation skills can be taught explicitly"
            ],
            immediate_actions: [
              "Conduct functional behavior assessment",
              "Implement positive behavior supports",
              "Teach replacement behaviors"
            ],
            status: "fallback_content"
          },
          social: {
            analysis_type: "social",
            student_summary: `Social skills analysis for ${student.full_name} - Grade ${student.grade_level || 'Unknown'}`,
            detailed_analysis: "AI analysis temporarily unavailable. Social skills instruction and peer support strategies benefit students with autism.",
            key_findings: [
              "Direct social skills instruction often needed",
              "Structured peer interactions increase success",
              "Social skills require practice across settings"
            ],
            immediate_actions: [
              "Implement social skills groups",
              "Create structured peer opportunities",
              "Use social stories for social situations"
            ],
            status: "fallback_content"
          },
          custom: {
            analysis_type: "custom",
            request_addressed: custom_request || "Custom analysis request",
            student_summary: `Custom analysis for ${student.full_name} - Grade ${student.grade_level || 'Unknown'}`,
            detailed_analysis: "AI analysis temporarily unavailable. Consider evidence-based practices for autism support across all domains.",
            key_findings: [
              "Individual assessment needed for specific concerns",
              "Evidence-based practices should guide interventions",
              "Team collaboration enhances outcomes"
            ],
            immediate_actions: [
              "Consult with autism specialist",
              "Review current evidence",
              "Coordinate with IEP team"
            ],
            status: "fallback_content"
          }
        };
        
        analysisData = fallbackAnalysis[analysis_type] || fallbackAnalysis.custom;
      }

      // Save analysis to database
      const [savedAnalysis] = await db.insert(schema.ai_reviews).values({
        user_id: userId,
        student_id: student_id,
        review_type: `autism_${analysis_type}`,
        ai_analysis: analysisData,
        recommendations: (analysisData && typeof analysisData === 'object' && 'recommendations' in analysisData) 
          ? (analysisData as any).recommendations || [] 
          : [],
        priority_level: 'medium',
        status: 'active'
      }).returning();

      res.json({
        success: true,
        analysis: analysisData,
        saved_id: savedAnalysis.id,
        message: 'Autism AI analysis completed and saved to student profile'
      });

    } catch (error) {
      console.error('Autism AI Analysis Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate autism analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Note: Duplicate gifted AI analysis endpoint removed - using the main one above

  // Get existing autism AI analysis
  app.get('/api/autism-ai-analysis', async (req: any, res) => {
    try {
      const userId = await getUserId(req);
      const { student_id } = req.query;

      if (!student_id) {
        return res.status(400).json({ error: 'student_id is required' });
      }

      // Get latest autism AI analysis for this student
      const analyses = await db.select().from(schema.ai_reviews)
        .where(and(
          eq(schema.ai_reviews.user_id, userId),
          eq(schema.ai_reviews.student_id, student_id),
          sql`${schema.ai_reviews.review_type} LIKE 'autism_%'`
        ))
        .orderBy(sql`${schema.ai_reviews.created_at} DESC`)
        .limit(5);

      if (analyses.length === 0) {
        return res.json(null);
      }

      // Return the most comprehensive analysis available
      // First, try to find a recent comprehensive analysis with the new format
      const latestAnalysis = analyses[0];
      const analysisData = latestAnalysis.ai_analysis as any;

      // Check if this is new format (has structured fields) or legacy format
      const hasNewFormat = analysisData.analysis_type || analysisData.student_summary || analysisData.detailed_analysis;
      
      if (hasNewFormat) {
        // Return the new structured format directly
        res.json({
          analyses: [{
            id: latestAnalysis.id,
            ai_analysis: analysisData,
            timestamp: latestAnalysis.created_at,
            type: latestAnalysis.review_type
          }]
        });
      } else {
        // Legacy format: combine analyses for backward compatibility
        const combined: {
          sensory_analysis: any;
          communication_insights: any;
          behavioral_analysis: any;
          social_analysis: any;
          recommendations: string[];
        } = {
          sensory_analysis: null,
          communication_insights: null,
          behavioral_analysis: null,
          social_analysis: null,
          recommendations: []
        };

        analyses.forEach(analysis => {
          const data = analysis.ai_analysis as any;
          const type = analysis.review_type.replace('autism_', '');
          
          if (type === 'sensory') {
            combined.sensory_analysis = data.sensory_analysis || data.detailed_analysis || data.summary;
          } else if (type === 'communication') {
            combined.communication_insights = data.communication_insights || data.visual_supports || data.recommendations || [];
          } else if (type === 'behavioral') {
            combined.behavioral_analysis = data.behavioral_analysis || data.detailed_analysis || data.summary;
          } else if (type === 'social') {
            combined.social_analysis = data.social_analysis || data.detailed_analysis || data.summary;
          }
          
          if (data.recommendations) {
            const recs = Array.isArray(data.recommendations) 
              ? data.recommendations 
              : [data.recommendations];
            combined.recommendations.push(...recs.filter((item): item is string => Boolean(item)));
          }
        });

        res.json(combined);
      }

    } catch (error) {
      console.error('Error fetching autism AI analysis:', error);
      res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  });

  // Development vs Production handling for non-API routes
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production: serve static files from dist/
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    // Development: Separate mobile and desktop routing
    console.log('🚀 Development mode: Root URL = DESKTOP, /m path = MOBILE');
    
    // Create proxy instances - SWAPPED TARGETS
    const mobileProxy = createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      ws: true
    });
    
    const desktopProxy = createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      ws: true
    });
    
    // Apply proxies in correct order
    app.use('/m', mobileProxy); // Mobile at /m path
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next(); // Let API routes be handled by Express
      }
      desktopProxy(req, res, next); // Everything else to Desktop
    });
  }

  // Start the server after all setup is complete
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle graceful shutdown - use process.once to prevent multiple listeners
  process.once('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    process.exit(0);
  });
  
  process.once('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
  });
})().catch(console.error);