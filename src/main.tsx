import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Starting application...');

try {
  const root = document.getElementById("root");
  if (!root) {
    console.error('Root element not found!');
    throw new Error('Root element not found');
  }
  
  console.log('Creating React root...');
  createRoot(root).render(<App />);
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Error starting application:', error);
  // Show error to user
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
    <h1>Application Error</h1>
    <p>Failed to start application: ${error instanceof Error ? error.message : String(error)}</p>
    <pre>${error instanceof Error ? error.stack : ''}</pre>
  </div>`;
}
