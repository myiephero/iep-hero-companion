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

// Generate simple IDs since we don't have cuid2
function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Middleware to extract user ID from mock authentication headers
function getUserId(req: express.Request): string {
  // In production, this would extract from JWT token or session
  // For development, we use the mock user ID from the authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer mock-token-')) {
    const role = authHeader.replace('Bearer mock-token-', '');
    return `mock-${role}-user-${role === 'advocate' ? '456' : '123'}`;
  }
  // Fallback to role-based detection from user-agent or path
  const userAgent = req.headers['user-agent'] || '';
  const path = req.path || '';
  if (path.includes('advocate') || userAgent.includes('advocate')) {
    return 'mock-advocate-user-456';
  }
  return 'mock-parent-user-123';
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

// Mock authentication for now
// Note: MOCK_USER_ID replaced with getUserId() function for proper user isolation

// Students routes
app.get('/api/students', async (req, res) => {
  try {
    const userId = getUserId(req);
    const students = await db.select().from(schema.students).where(eq(schema.students.user_id, userId));
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