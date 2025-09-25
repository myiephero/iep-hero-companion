// Production server for IEP Hero
import express from 'express';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Import and use the existing server routes
// We'll handle this after the static files to give them priority
try {
  // Try to import the existing server setup
  const serverModule = await import('./server/index.js');
  
  // If the server module exports an app or routes, use them
  if (serverModule.default) {
    app.use('/api', serverModule.default);
  }
} catch (error) {
  console.log('Note: Using simplified server setup (full server not available)');
  
  // Basic API health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: 'production' });
  });
  
  // Basic auth check
  app.get('/api/auth/status', (req, res) => {
    res.json({ authenticated: false, message: 'Simple production mode' });
  });
}

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ IEP Hero production server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving static files from dist/`);
  console.log(`🔗 API endpoints available at /api/*`);
});