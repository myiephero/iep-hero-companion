import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import giftedRouter from './routes/gifted';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required Supabase environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      supabase: error ? 'disconnected' : 'connected'
    });
  } catch (error) {
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      supabase: 'connection_test_failed'
    });
  }
});

// API routes placeholder for Gifted Snapshot
app.get('/api', (req, res) => {
  res.json({ message: 'Gifted Snapshot API Server' });
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Supabase URL: ${supabaseUrl}`);
});

export default app;