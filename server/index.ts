import express from 'express';
import cors from 'cors';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, and } from 'drizzle-orm';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock authentication for now
const MOCK_USER_ID = "mock-user-123";

// Students routes
app.get('/api/students', async (req, res) => {
  try {
    const students = await db.select().from(schema.students).where(eq(schema.students.user_id, MOCK_USER_ID));
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const studentData = { ...req.body, user_id: MOCK_USER_ID };
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
    const accommodations = await db.select().from(schema.autism_accommodations).where(eq(schema.autism_accommodations.user_id, MOCK_USER_ID));
    res.json(accommodations);
  } catch (error) {
    console.error('Error fetching autism accommodations:', error);
    res.status(500).json({ error: 'Failed to fetch autism accommodations' });
  }
});

app.post('/api/autism_accommodations', async (req, res) => {
  try {
    const accommodationData = { ...req.body, user_id: MOCK_USER_ID };
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
    const documents = await db.select().from(schema.documents).where(eq(schema.documents.user_id, MOCK_USER_ID));
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const documentData = { ...req.body, user_id: MOCK_USER_ID };
    const [document] = await db.insert(schema.documents).values(documentData).returning();
    res.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// AI reviews routes
app.post('/api/ai_reviews', async (req, res) => {
  try {
    const reviewData = { ...req.body, user_id: MOCK_USER_ID };
    const [review] = await db.insert(schema.ai_reviews).values(reviewData).returning();
    res.json(review);
  } catch (error) {
    console.error('Error creating AI review:', error);
    res.status(500).json({ error: 'Failed to create AI review' });
  }
});

app.get('/api/ai_reviews', async (req, res) => {
  try {
    const reviews = await db.select().from(schema.ai_reviews).where(eq(schema.ai_reviews.user_id, MOCK_USER_ID));
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching AI reviews:', error);
    res.status(500).json({ error: 'Failed to fetch AI reviews' });
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
    const advocateData = { ...req.body, user_id: MOCK_USER_ID };
    const [advocate] = await db.insert(schema.advocates).values(advocateData).returning();
    res.json(advocate);
  } catch (error) {
    console.error('Error creating advocate:', error);
    res.status(500).json({ error: 'Failed to create advocate' });
  }
});

// Document processing endpoints (replacing Supabase Edge Functions)

// Process document endpoint (replaces process-document edge function)
app.post('/api/process-document', express.raw({ type: 'multipart/form-data', limit: '50mb' }), async (req, res) => {
  try {
    // For now, return a mock response to prevent the error
    // TODO: Implement actual file processing when packages are available
    const mockAnalysis = {
      analysis: "Document processing is temporarily disabled during migration. This is a mock response to prevent errors.",
      documentId: "mock-doc-id",
      reviewId: "mock-review-id"
    };
    
    res.json(mockAnalysis);
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// Analyze document endpoint (replaces analyze-document edge function)
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { documentText, analysisType } = req.body;
    
    // Mock analysis response
    const mockAnalysis = {
      analysis: `Mock analysis for ${analysisType}: Document contains ${documentText?.length || 0} characters. This is a temporary response during migration.`,
      timestamp: new Date().toISOString()
    };
    
    res.json(mockAnalysis);
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// IEP ingestion endpoint (replaces iep-ingest edge function)
app.post('/api/iep-ingest', async (req, res) => {
  try {
    const { docId } = req.body;
    
    // Mock ingestion response
    const mockResponse = {
      extractedTextLength: 1500,
      chunksCreated: 5
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error ingesting IEP:', error);
    res.status(500).json({ error: 'Failed to ingest IEP document' });
  }
});

// IEP analysis endpoint (replaces iep-analyze edge function)
app.post('/api/iep-analyze', async (req, res) => {
  try {
    const { docId, kind, studentContext } = req.body;
    
    // Mock analysis response
    const mockResponse = {
      analysisId: "mock-analysis-id",
      status: "completed"
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error analyzing IEP:', error);
    res.status(500).json({ error: 'Failed to analyze IEP' });
  }
});

// IEP action draft endpoint (replaces iep-action-draft edge function)
app.post('/api/iep-action-draft', async (req, res) => {
  try {
    const { analysisId, templateType, userInputs } = req.body;
    
    // Mock draft response
    const mockDraft = {
      draftId: "mock-draft-id",
      title: `Mock ${templateType} Draft`,
      body: "This is a mock draft generated during migration. Full functionality will be restored after migration completion."
    };
    
    res.json(mockDraft);
  } catch (error) {
    console.error('Error generating action draft:', error);
    res.status(500).json({ error: 'Failed to generate action draft' });
  }
});

// Invite parent endpoint (replaces invite-parent edge function)
app.post('/api/invite-parent', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    // Mock invite response
    const mockResponse = {
      userId: `mock-user-${Date.now()}`
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error inviting parent:', error);
    res.status(500).json({ error: 'Failed to invite parent' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});