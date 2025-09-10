// Quick test script to verify access control logic
import { normalizeSubscriptionPlan, hasFeatureAccess, checkToolAccess, PLAN_FEATURES } from './src/lib/planAccess.ts';

console.log('🧪 TESTING ACCESS CONTROL LOGIC');
console.log('=================================');

// Test the free plan user
const testPlan = 'free';
console.log(`\n🔍 Testing plan: "${testPlan}"`);

// Test specific tools for free plan
const testCases = [
  { tool: 'smartLetterGenerator', expected: true, description: 'Smart Letter Generator (should be accessible)' },
  { tool: 'studentProfileManagement', expected: true, description: 'Student Profiles (should be accessible)' },
  { tool: 'ideaRightsGuide', expected: true, description: 'IDEA Rights Guide (should be accessible)' },
  { tool: 'unifiedIEPReview', expected: false, description: 'Unified IEP Review (should require upgrade)' },
  { tool: 'meetingPrepWizard', expected: false, description: 'Meeting Prep Wizard (should require upgrade)' },
  { tool: 'documentVault', expected: false, description: 'Document Vault (should require upgrade)' },
  { tool: 'expertAnalysis', expected: false, description: 'Expert Analysis (should require upgrade)' },
  { tool: 'autismAccommodationBuilder', expected: false, description: 'Autism Accommodation Builder (should require upgrade)' },
  { tool: 'advocateMatchingTool', expected: false, description: 'Advocate Matching Tool (should require upgrade)' }
];

console.log('\n📊 ACCESS CONTROL TEST RESULTS:');
console.log('=====================================');

testCases.forEach(({ tool, expected, description }) => {
  try {
    const hasAccess = hasFeatureAccess(testPlan, tool);
    const status = hasAccess === expected ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${description}`);
    console.log(`   - Expected: ${expected}, Got: ${hasAccess}`);
    
    if (hasAccess !== expected) {
      console.log(`   - 🔍 Plan features for "${testPlan}":`, PLAN_FEATURES[testPlan][tool]);
    }
  } catch (error) {
    console.log(`❌ ERROR ${description}: ${error.message}`);
  }
  console.log('');
});

// Test normalization function
console.log('\n🔧 TESTING PLAN NORMALIZATION:');
console.log('===============================');
const testPlans = ['free', 'Free', 'FREE', null, undefined, '', 'invalid'];
testPlans.forEach(plan => {
  const normalized = normalizeSubscriptionPlan(plan);
  console.log(`Input: "${plan}" -> Normalized: "${normalized}"`);
});

console.log('\n🧪 Test completed!');