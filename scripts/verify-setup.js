/**
 * Setup Verification Script
 * Run this to verify your environment is configured correctly
 * Usage: node scripts/verify-setup.js
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'ANTHROPIC_API_KEY',
];

const optionalEnvVars = [
  'EMBEDDING_API_KEY',
  'EMBEDDING_API_URL',
];

console.log('🔍 Verifying Nimbus Setup...\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Node.js version must be 18 or higher');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
} else {
  console.log(`✅ Node.js version: ${nodeVersion}`);
}

// Check required environment variables
console.log('\n📋 Checking Environment Variables:');
let allRequiredPresent = true;

requiredEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} is set`);
  } else {
    console.log(`   ❌ ${varName} is missing (REQUIRED)`);
    allRequiredPresent = false;
  }
});

optionalEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} is set (optional)`);
  } else {
    console.log(`   ⚠️  ${varName} is not set (optional)`);
  }
});

if (!allRequiredPresent) {
  console.log('\n❌ Missing required environment variables!');
  console.log('   Please set them in .env.local file');
  process.exit(1);
}

// Check if .env.local exists
const fs = require('fs');
const path = require('path');
const envLocalPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envLocalPath)) {
  console.log('\n✅ .env.local file exists');
} else {
  console.log('\n⚠️  .env.local file not found');
  console.log('   Create it from .env.example');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules directory exists');
} else {
  console.log('⚠️  node_modules directory not found');
  console.log('   Run: npm install');
}

// Check if .next exists (build directory)
const nextPath = path.join(process.cwd(), '.next');
if (fs.existsSync(nextPath)) {
  console.log('✅ .next build directory exists');
} else {
  console.log('⚠️  .next build directory not found');
  console.log('   Run: npm run build (or npm run dev)');
}

console.log('\n✨ Setup verification complete!');
console.log('\nNext steps:');
console.log('  1. Ensure DATABASE_URL points to your PostgreSQL database');
console.log('  2. Verify database has pgvector extension installed');
console.log('  3. Verify database has team_pegasus.frontier_reviews_processed table');
console.log('  4. Run: npm run dev');

