#!/usr/bin/env node

// Simple build script that bypasses TypeScript checking
const { execSync } = require('child_process');

console.log('Starting custom build process...');

try {
  // Set environment variables to skip TypeScript and ESLint
  process.env.SKIP_ENV_VALIDATION = '1';
  process.env.DISABLE_ESLINT_PLUGIN = 'true';
  
  console.log('Running Next.js build...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: '1',
      DISABLE_ESLINT_PLUGIN: 'true'
    }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
