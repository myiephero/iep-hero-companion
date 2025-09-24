// Comprehensive Testing Suite for IEP Hero Application
// Testing current Supabase integration and all critical functionality

import { normalizeSubscriptionPlan, hasFeatureAccess, checkToolAccess, PLAN_FEATURES } from './src/lib/planAccess.ts';

console.log('🔬 IEP HERO COMPREHENSIVE TEST SUITE');
console.log('=====================================');
console.log('Testing Current State Before Production Supabase Migration\n');

// Test 1: Access Control System
console.log('📋 TEST 1: ACCESS CONTROL SYSTEM');
console.log('----------------------------------');

const testPlans = ['free', 'essential', 'premium', 'advocate'];
const testTools = [
  'smartLetterGenerator',
  'studentProfileManagement', 
  'ideaRightsGuide',
  'unifiedIEPReview',
  'meetingPrepWizard',
  'documentVault',
  'expertAnalysis',
  'autismAccommodationBuilder',
  'advocateMatchingTool'
];

let accessControlPassed = true;

testPlans.forEach(plan => {
  console.log(`\n🔍 Testing plan: "${plan}"`);
  
  testTools.forEach(tool => {
    try {
      const hasAccess = hasFeatureAccess(plan, tool);
      const expectedAccess = plan === 'free' ? 
        ['smartLetterGenerator', 'studentProfileManagement', 'ideaRightsGuide'].includes(tool) :
        true;
      
      const status = hasAccess === expectedAccess ? '✅' : '❌';
      console.log(`  ${status} ${tool}: ${hasAccess ? 'ACCESSIBLE' : 'RESTRICTED'}`);
      
      if (hasAccess !== expectedAccess) {
        accessControlPassed = false;
      }
    } catch (error) {
      console.log(`  ❌ ERROR testing ${tool}: ${error.message}`);
      accessControlPassed = false;
    }
  });
});

console.log(`\n📊 Access Control Test: ${accessControlPassed ? '✅ PASSED' : '❌ FAILED'}`);

// Test 2: Plan Normalization
console.log('\n📋 TEST 2: PLAN NORMALIZATION');
console.log('-------------------------------');

const normalizationTests = [
  { input: 'free', expected: 'free' },
  { input: 'Free', expected: 'free' },
  { input: 'FREE', expected: 'free' },
  { input: 'premium', expected: 'premium' },
  { input: null, expected: 'free' },
  { input: undefined, expected: 'free' },
  { input: '', expected: 'free' },
  { input: 'invalid', expected: 'free' }
];

let normalizationPassed = true;

normalizationTests.forEach(({ input, expected }) => {
  try {
    const result = normalizeSubscriptionPlan(input);
    const status = result === expected ? '✅' : '❌';
    console.log(`  ${status} "${input}" → "${result}" (expected: "${expected}")`);
    
    if (result !== expected) {
      normalizationPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ ERROR normalizing "${input}": ${error.message}`);
    normalizationPassed = false;
  }
});

console.log(`\n📊 Plan Normalization Test: ${normalizationPassed ? '✅ PASSED' : '❌ FAILED'}`);

// Test 3: Environment Variables
console.log('\n📋 TEST 3: ENVIRONMENT CONFIGURATION');
console.log('--------------------------------------');

const requiredEnvVars = [
  'VITE_SUPABASE_PROJECT_ID',
  'VITE_SUPABASE_PUBLISHABLE_KEY', 
  'VITE_SUPABASE_URL',
  'DATABASE_URL',
  'SESSION_SECRET'
];

let envTestPassed = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  const status = value ? '✅' : '❌';
  const display = value ? (envVar.includes('SECRET') || envVar.includes('KEY') ? '[REDACTED]' : value.substring(0, 20) + '...') : 'MISSING';
  console.log(`  ${status} ${envVar}: ${display}`);
  
  if (!value) {
    envTestPassed = false;
  }
});

console.log(`\n📊 Environment Test: ${envTestPassed ? '✅ PASSED' : '❌ FAILED'}`);

// Summary
console.log('\n🎯 COMPREHENSIVE TEST SUMMARY');
console.log('==============================');
console.log(`Access Control System: ${accessControlPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`Plan Normalization: ${normalizationPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`Environment Config: ${envTestPassed ? '✅ PASSED' : '❌ FAILED'}`);

const overallStatus = accessControlPassed && normalizationPassed && envTestPassed;
console.log(`\n🏆 OVERALL STATUS: ${overallStatus ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (overallStatus) {
  console.log('\n✅ System is ready for comprehensive testing!');
  console.log('🔄 Next: Test authentication flows, API endpoints, and database operations');
} else {
  console.log('\n⚠️  Some issues detected. Review failed tests before proceeding.');
}

console.log('\n🧪 Test Suite Completed!');