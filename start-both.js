#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting both frontend and backend servers...');

// Start backend server
const backend = spawn('npx', ['tsx', 'index.ts'], {
  cwd: path.join(__dirname, 'server'),
  stdio: ['pipe', 'pipe', 'pipe']
});

backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data}`);
});

// Start frontend server  
const frontend = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

frontend.stdout.on('data', (data) => {
  console.log(`[FRONTEND] ${data}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`[FRONTEND ERROR] ${data}`);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

// Keep process alive
setInterval(() => {
  // Check if processes are still running
  if (backend.killed || frontend.killed) {
    console.log('One of the servers stopped, exiting...');
    process.exit(1);
  }
}, 5000);