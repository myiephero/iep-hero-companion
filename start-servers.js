#!/usr/bin/env node

const { spawn } = require('child_process');

// Start the Express server
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['inherit', 'inherit', 'inherit'],
  cwd: process.cwd()
});

// Start the Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  stdio: ['inherit', 'inherit', 'inherit'],
  cwd: process.cwd()
});

console.log('Starting both servers...');
console.log('Express server (API): http://localhost:3001');
console.log('Vite server (Frontend): http://localhost:5000');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  server.kill();
  vite.kill();
  process.exit();
});

server.on('close', (code) => {
  console.log(`Express server exited with code ${code}`);
});

vite.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
});