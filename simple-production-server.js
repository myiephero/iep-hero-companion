// Simple production server for IEP Hero
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS support for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from dist directory with proper headers
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: false,
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

// Basic API endpoints for health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    mode: 'production',
    version: '1.0.0'
  });
});

// Mock auth status for frontend
app.get('/api/auth/status', (req, res) => {
  res.json({ 
    authenticated: false, 
    message: 'Production mode - authentication temporarily simplified',
    user: null
  });
});

// Basic user profile endpoint
app.get('/api/user/profile', (req, res) => {
  res.json({ 
    user: null,
    message: 'Please log in to access your profile'
  });
});

// Catch-all handler: send back React's index.html file for SPA routing
app.use((req, res, next) => {
  // If it's a file request that wasn't found, let it 404
  if (req.path.includes('.')) {
    return res.status(404).send('File not found');
  }
  
  // For all other routes (SPA routes), serve index.html
  res.sendFile(path.join(__dirname, 'dist/index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong. Please try refreshing the page.'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ IEP Hero production server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving static files from dist/`);
  console.log(`🔗 Basic API endpoints available at /api/*`);
  console.log(`📱 Frontend application ready!`);
});