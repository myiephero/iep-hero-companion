// Systematic Route Testing Script
// Tests all routes to ensure they're working before Supabase migration

const routes = [
  // Public routes
  '/', '/pricing', '/parent/pricing', '/advocate/pricing', '/auth',
  
  // Parent tools
  '/parent/tools', '/parent/tools/emergent', '/parent/tools/unified-iep-review',
  '/parent/tools/autism-accommodation-builder', '/parent/tools/smart-letter-generator',
  '/parent/tools/meeting-prep', '/parent/tools/expert-analysis', '/parent/tools/emotion-tracker',
  '/parent/tools/goal-generator', '/parent/tools/iep-master-suite', '/parent/tools/idea-rights-guide',
  '/parent/tools/plan-504-guide', '/parent/tools/progress-notes', '/parent/tools/ask-ai-documents',
  '/parent/tools/communication-tracker', '/parent/tools/ot-activities',
  
  // Advocate tools
  '/advocate/tools',
  
  // Shared tools
  '/tools', '/tools/advocate-matching', '/tools/gifted-2e-learners', 
  '/tools/document-vault', '/tools/student-profiles',
  
  // Dashboard routes for pricing tiers
  '/parent/dashboard-free', '/parent/dashboard-essential', 
  '/parent/dashboard-premium', '/parent/dashboard-hero',
  '/advocate/dashboard-starter', '/advocate/dashboard-pro',
  '/advocate/dashboard-agency', '/advocate/dashboard-agency-plus'
];

console.log('🧪 SYSTEMATIC ROUTE TESTING');
console.log('============================');
console.log(`Testing ${routes.length} routes\n`);

let passed = 0;
let failed = 0;

for (const route of routes) {
  try {
    // Use Node.js child_process to call curl
    const { execSync } = require('child_process');
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000${route}`, { encoding: 'utf8' });
    const statusCode = parseInt(result.trim());
    
    if (statusCode === 200) {
      console.log(`✅ ${route} - OK (${statusCode})`);
      passed++;
    } else if (statusCode === 401 || statusCode === 403) {
      console.log(`🔒 ${route} - Protected (${statusCode}) - Expected`);
      passed++;
    } else {
      console.log(`⚠️  ${route} - Status ${statusCode}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${route} - Error: ${error.message}`);
    failed++;
  }
}

console.log('\n📊 TESTING SUMMARY:');
console.log('===================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 ALL ROUTES WORKING PERFECTLY!');
  console.log('✅ Ready for Supabase migration');
} else {
  console.log('\n⚠️  Some routes need attention before migration');
}