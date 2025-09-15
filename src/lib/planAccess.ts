// Comprehensive subscription plan access control for IEP Hero platform
export type SubscriptionPlan = 'free' | 'essential' | 'premium' | 'hero' | 'starter' | 'pro' | 'agency' | 'agency-plus';

// Development-only logging utility
const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
function debugLog(message: string, ...args: any[]) {
  if (isDevelopment) {
    console.log(message, ...args);
  }
}

// Define all tools and features available in the platform
export interface PlanFeatures {
  // === PARENT DASHBOARD FEATURES ===
  goalManagement: boolean;
  meetingScheduler: boolean;
  aiInsights: boolean;
  progressAnalytics: boolean;
  studentProfileManagement: boolean;
  subscriptionManagement: boolean;
  
  // === ANALYSIS & REVIEW TOOLS ===
  iepReviewTool: boolean;
  unifiedIEPReview: boolean;
  askAIAboutDocs: boolean;
  expertAnalysis: boolean;
  aiIEPReview: boolean;
  
  // === COMMUNICATION & DOCUMENTATION ===
  smartLetterGenerator: boolean;
  documentVault: boolean;
  parentMessages: boolean;
  communicationTracker: boolean;
  progressNotes: boolean;
  
  // === MEETING & PLANNING TOOLS ===
  meetingPrepWizard: boolean;
  meetingPrepAssistant: boolean;
  parentMeetingPrep: boolean;
  timelineCalculator: boolean;
  
  // === SPECIALIZED SUPPORT TOOLS ===
  accommodationBuilder: boolean;
  autismAccommodationBuilder: boolean;
  giftedTwoeSupport: boolean;
  plan504Builder: boolean;
  goalGenerator: boolean;
  otActivityRecommender: boolean;
  
  // === EDUCATIONAL RESOURCES ===
  ideaRightsGuide: boolean;
  ferpaOverview: boolean;
  plan504Guide: boolean;
  emotionTracker: boolean;
  parentEmotionTracker: boolean;
  
  // === PREMIUM SERVICES ===
  heroPlan: boolean;
  advocateMatchingTool: boolean;
  expertSupport: boolean;
  
  // === ADVOCATE TOOLS (for dual-role users) ===
  clientManagement: boolean;
  caseAnalytics: boolean;
  caseMatching: boolean;
  billingTools: boolean;
  scheduleManagement: boolean;
  teamCollaboration: boolean;
  professionalAnalysis: boolean;
  advocateMessaging: boolean;
  advocacyReports: boolean;
  caseManagement: boolean;
  professionalPlanning: boolean;
  professionalResources: boolean;
  businessManagement: boolean;
  specializedProfessionalTools: boolean;
  
  // === STORAGE & SUPPORT ===
  storageLimit: string;
  supportLevel: string;
  prioritySupport: boolean;
  
  // === ACCESS LIMITS ===
  maxChildren: number;
  maxDocuments: number;
  aiAnalysisLimit: number; // per month
  letterGenerationLimit: number; // per month
}

// Comprehensive plan feature allocation
export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  free: {
    // Dashboard Features - Limited
    goalManagement: false,
    meetingScheduler: false,
    aiInsights: false,
    progressAnalytics: false,
    studentProfileManagement: true, // 1 child only
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Basic only
    iepReviewTool: false,
    unifiedIEPReview: false,
    askAIAboutDocs: false,
    expertAnalysis: false,
    aiIEPReview: false,
    
    // Communication & Documentation - Limited
    smartLetterGenerator: true, // 2 letters/month
    documentVault: false,
    parentMessages: false,
    communicationTracker: false,
    progressNotes: false,
    
    // Meeting & Planning Tools - Basic
    meetingPrepWizard: false,
    meetingPrepAssistant: false,
    parentMeetingPrep: false,
    timelineCalculator: true,
    
    // Specialized Support Tools - None
    accommodationBuilder: false,
    autismAccommodationBuilder: false,
    giftedTwoeSupport: false,
    plan504Builder: false,
    goalGenerator: false,
    otActivityRecommender: false,
    
    // Educational Resources - Limited
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: false,
    emotionTracker: false,
    parentEmotionTracker: false,
    
    // Premium Services - None
    heroPlan: false,
    advocateMatchingTool: false,
    expertSupport: false,
    
    // Advocate Tools - None
    clientManagement: false,
    caseAnalytics: false,
    caseMatching: false,
    billingTools: false,
    scheduleManagement: false,
    teamCollaboration: false,
    professionalAnalysis: false,
    advocateMessaging: false,
    advocacyReports: false,
    caseManagement: false,
    professionalPlanning: false,
    professionalResources: false,
    businessManagement: false,
    specializedProfessionalTools: false,
    
    // Limits
    storageLimit: 'Community access only',
    supportLevel: 'Community forum',
    prioritySupport: false,
    maxChildren: 1,
    maxDocuments: 1,
    aiAnalysisLimit: 0,
    letterGenerationLimit: 1
  },

  essential: {
    // Dashboard Features - Complete (merged Basic + Plus)
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - AI-Powered (Premium features for $59)
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: false, // Reserved for Premium
    aiIEPReview: true,
    
    // Communication & Documentation - Full Suite
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Complete
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - Core Features
    accommodationBuilder: true,
    autismAccommodationBuilder: false, // Reserved for Premium
    giftedTwoeSupport: false, // Reserved for Premium
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: false, // Reserved for Premium
    
    // Educational Resources - Full Access
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - Limited
    heroPlan: false,
    advocateMatchingTool: false, // Reserved for Premium/Hero
    expertSupport: false,
    
    // Advocate Tools - None
    clientManagement: false,
    caseAnalytics: false,
    caseMatching: false,
    billingTools: false,
    scheduleManagement: false,
    teamCollaboration: false,
    professionalAnalysis: false,
    advocateMessaging: false,
    advocacyReports: false,
    caseManagement: false,
    professionalPlanning: false,
    professionalResources: false,
    businessManagement: false,
    specializedProfessionalTools: false,
    
    // Limits - Enhanced for $59 tier
    storageLimit: '10GB',
    supportLevel: 'Priority email support',
    prioritySupport: true,
    maxChildren: 1,
    maxDocuments: 5,
    aiAnalysisLimit: 5,
    letterGenerationLimit: 5
  },

  premium: {
    // Dashboard Features - Advanced ($199/month value)
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Expert Level
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: true,
    aiIEPReview: true,
    
    // Communication & Documentation - Full Suite
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Complete
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - All Available
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: true,
    
    // Educational Resources - Complete Access
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - Enhanced for Multi-Child Families
    heroPlan: false,
    advocateMatchingTool: true,
    expertSupport: true,
    
    // Advocate Tools - None
    clientManagement: false,
    caseAnalytics: false,
    caseMatching: false,
    billingTools: false,
    scheduleManagement: false,
    teamCollaboration: false,
    professionalAnalysis: false,
    advocateMessaging: false,
    advocacyReports: false,
    caseManagement: false,
    professionalPlanning: false,
    professionalResources: false,
    businessManagement: false,
    specializedProfessionalTools: false,
    
    // Enhanced Limits for $199/month
    storageLimit: '25GB',
    supportLevel: 'Phone & email support',
    prioritySupport: true,
    maxChildren: 3,
    maxDocuments: 20,
    aiAnalysisLimit: 20,
    letterGenerationLimit: 20
  },

  hero: {
    // Dashboard Features - All
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - All
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: true,
    aiIEPReview: true,
    
    // Communication & Documentation - All
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - All
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - All
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: true,
    
    // Educational Resources - All
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - All
    heroPlan: true,
    advocateMatchingTool: true,
    expertSupport: true,
    
    // Advocate Tools - Basic (for dual-role access)
    clientManagement: true,
    caseAnalytics: false,
    caseMatching: false,
    billingTools: false,
    scheduleManagement: true,
    teamCollaboration: false,
    professionalAnalysis: true,
    advocateMessaging: true,
    advocacyReports: false,
    caseManagement: true,
    professionalPlanning: true,
    professionalResources: true,
    businessManagement: false,
    specializedProfessionalTools: true,
    
    // Enhanced Limits for $249/month + $495 setup
    storageLimit: 'Unlimited',
    supportLevel: 'Dedicated support manager + White-glove setup + Monthly strategy calls',
    prioritySupport: true,
    maxChildren: 999999, // Unlimited
    maxDocuments: 999999,
    aiAnalysisLimit: 999999,
    letterGenerationLimit: 999999
  },

  // === ADVOCATE PLANS ===
  starter: {
    // Dashboard Features - Basic
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: false, // No AI insights for starter
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - NO AI TOOLS FOR STARTER
    iepReviewTool: true, // Basic review only, no AI
    unifiedIEPReview: false, // AI tool - not available in starter
    askAIAboutDocs: false, // AI tool - not available in starter
    expertAnalysis: false,
    aiIEPReview: false, // AI tool - not available in starter
    
    // Communication & Documentation - Basic (No AI tools)
    smartLetterGenerator: false, // AI-powered tool not available in starter
    documentVault: true,
    parentMessages: false,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Basic
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - Limited
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: false,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: false,
    
    // Educational Resources - Full
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: false,
    
    // Premium Services - Limited
    heroPlan: false,
    advocateMatchingTool: true,
    expertSupport: false,
    
    // Advocate Tools - Basic
    clientManagement: true,
    caseAnalytics: false,
    caseMatching: false,
    billingTools: false,
    scheduleManagement: true,
    teamCollaboration: false,
    professionalAnalysis: true, // Basic professional analysis tools available in Starter
    advocateMessaging: true,
    advocacyReports: false,
    caseManagement: true,
    professionalPlanning: true,
    professionalResources: true,
    businessManagement: false,
    specializedProfessionalTools: false, // Enterprise-level compliance auditor tools - Agency+ only
    
    // Limits
    storageLimit: '10GB',
    supportLevel: 'Email support',
    prioritySupport: false,
    maxChildren: 10,
    maxDocuments: 100,
    aiAnalysisLimit: 0, // No AI tools available in Starter plan
    letterGenerationLimit: 0 // No AI letter generator in Starter plan
  },

  pro: {
    // Dashboard Features - Full
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Full
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: true,
    aiIEPReview: true,
    
    // Communication & Documentation - Full
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Full
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - Full
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: true,
    
    // Educational Resources - Full
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - Enhanced
    heroPlan: false,
    advocateMatchingTool: true,
    expertSupport: true,
    
    // Advocate Tools - Enhanced (Pro level)
    clientManagement: true,
    caseAnalytics: true,
    caseMatching: true,
    billingTools: false, // Agency feature
    scheduleManagement: true,
    teamCollaboration: false, // Agency feature
    professionalAnalysis: true,
    advocateMessaging: true,
    advocacyReports: true,
    caseManagement: true,
    professionalPlanning: true,
    professionalResources: true,
    businessManagement: false, // Agency feature
    specializedProfessionalTools: false, // Agency+ feature
    
    // Limits
    storageLimit: '50GB',
    supportLevel: 'Priority support',
    prioritySupport: true,
    maxChildren: 25,
    maxDocuments: 500,
    aiAnalysisLimit: 100,
    letterGenerationLimit: 200
  },

  agency: {
    // Dashboard Features - Full
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Full
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: true,
    aiIEPReview: true,
    
    // Communication & Documentation - Full
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Full
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - Full
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: true,
    
    // Educational Resources - Full
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - Full
    heroPlan: true,
    advocateMatchingTool: true,
    expertSupport: true,
    
    // Advocate Tools - Full
    clientManagement: true,
    caseAnalytics: true,
    caseMatching: true,
    billingTools: true,
    scheduleManagement: true,
    teamCollaboration: true,
    professionalAnalysis: true,
    advocateMessaging: true,
    advocacyReports: true,
    caseManagement: true,
    professionalPlanning: true,
    professionalResources: true,
    businessManagement: true,
    specializedProfessionalTools: true,
    
    // Limits
    storageLimit: '200GB',
    supportLevel: 'Premium support + training',
    prioritySupport: true,
    maxChildren: 100,
    maxDocuments: 2000,
    aiAnalysisLimit: 500,
    letterGenerationLimit: 1000
  },

  'agency-plus': {
    // Dashboard Features - Full
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Full
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: true,
    aiIEPReview: true,
    
    // Communication & Documentation - Full
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Full
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - Full
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: true,
    
    // Educational Resources - Full
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - Full
    heroPlan: true,
    advocateMatchingTool: true,
    expertSupport: true,
    
    // Advocate Tools - Full
    clientManagement: true,
    caseAnalytics: true,
    caseMatching: true,
    billingTools: true,
    scheduleManagement: true,
    teamCollaboration: true,
    professionalAnalysis: true,
    advocateMessaging: true,
    advocacyReports: true,
    caseManagement: true,
    professionalPlanning: true,
    professionalResources: true,
    businessManagement: true,
    specializedProfessionalTools: true,
    
    // Limits - Enterprise
    storageLimit: 'Unlimited',
    supportLevel: 'White-glove support + dedicated account manager',
    prioritySupport: true,
    maxChildren: 999999,
    maxDocuments: 999999,
    aiAnalysisLimit: 999999,
    letterGenerationLimit: 999999
  }
};

// Enhanced utility functions - FIXED: Default-deny for unknown plans
export function hasFeatureAccess(plan: SubscriptionPlan, feature: keyof PlanFeatures): boolean {
  // CRITICAL FIX: Default-deny approach for unknown plans
  const validPlans: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero', 'starter', 'pro', 'agency', 'agency-plus'];
  if (!validPlans.includes(plan)) {
    console.warn('🚨 hasFeatureAccess - Unknown plan detected:', plan, '-> DENYING access to feature:', feature);
    return false;
  }
  
  const planFeatures = PLAN_FEATURES[plan];
  if (!planFeatures) {
    console.warn('🚨 hasFeatureAccess - No features found for plan:', plan, '-> DENYING access to feature:', feature);
    return false;
  }
  
  const hasAccess = planFeatures[feature] as boolean;
  console.log('🔍 hasFeatureAccess - Plan:', plan, '| Feature:', feature, '| Access:', hasAccess);
  return hasAccess;
}

export function getPlanFeatures(plan: SubscriptionPlan): PlanFeatures {
  return PLAN_FEATURES[plan];
}

export function getToolAccessLevel(plan: SubscriptionPlan, tool: keyof PlanFeatures): boolean {
  return hasFeatureAccess(plan, tool);
}

export function getPlanToolCount(plan: SubscriptionPlan): number {
  const features = PLAN_FEATURES[plan];
  return Object.values(features).filter(value => value === true).length;
}

export function getPlanDashboardRoute(plan: SubscriptionPlan): string {
  return `/parent/dashboard-${plan}`;
}

export function normalizeSubscriptionPlan(plan: string | null | undefined): SubscriptionPlan {
  console.log('🔍 normalizeSubscriptionPlan - Input plan:', plan);
  
  if (!plan) {
    console.log('🔍 normalizeSubscriptionPlan - No plan provided, defaulting to "free"');
    return 'free';
  }
  
  const normalized = plan.toLowerCase().replace(/\s+/g, '').replace(/[-_]/g, '');
  console.log('🔍 normalizeSubscriptionPlan - Normalized:', normalized);
  
  // Handle specific plan name variations
  let result: SubscriptionPlan;
  switch (normalized) {
    // Parent plan variations
    case 'herofamilypack':
    case 'herofamily':
    case 'familypack':
      result = 'hero';
      break;
    case 'essential':
    case 'basic':
      result = 'essential';
      break;
    case 'premium':
    case 'plus':
      result = 'premium';
      break;
    case 'free':
    case 'trial':
      result = 'free';
      break;
    
    // Advocate plan variations  
    case 'starter':
    case 'start':
      result = 'starter';
      break;
    case 'pro':
    case 'professional':
      result = 'pro';
      break;
    case 'agency':
      result = 'agency';
      break;
    case 'agencyplus':
    case 'agencyplus':
    case 'agency+':
      result = 'agency-plus';
      break;
    
    default:
      // Direct match for known plans - STRICT VALIDATION
      const validPlans: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero', 'starter', 'pro', 'agency', 'agency-plus'];
      if (validPlans.includes(normalized as SubscriptionPlan)) {
        result = normalized as SubscriptionPlan;
      } else {
        console.warn('Unknown plan format detected:', plan, '- defaulting to "free"');
        result = 'free';
      }
      break;
  }
  
  debugLog('Final normalized plan result:', result);
  return result;
}

export function shouldShowUpgrade(currentPlan: SubscriptionPlan, requiredPlan: SubscriptionPlan): boolean {
  const planOrder: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const requiredIndex = planOrder.indexOf(requiredPlan);
  return currentIndex < requiredIndex;
}

export function getPlanDisplayName(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'free': return 'Free';
    case 'essential': return 'Essential'; 
    case 'premium': return 'Premium';
    case 'hero': return 'Hero Family Pack';
    default: return 'Free';
  }
}

// New utility for checking specific tool access with upgrade prompts - FIXED: Enhanced debugging
export function checkToolAccess(userPlan: SubscriptionPlan, requiredTool: keyof PlanFeatures): {
  hasAccess: boolean;
  upgradeRequired?: SubscriptionPlan;
  message?: string;
} {
  debugLog('Checking tool access - UserPlan:', userPlan, 'RequiredTool:', requiredTool);
  
  // STRICT validation - ensure plan exists
  const validPlans: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero', 'starter', 'pro', 'agency', 'agency-plus'];
  if (!validPlans.includes(userPlan)) {
    console.warn('🚨 checkToolAccess - Invalid userPlan detected:', userPlan, '-> DENYING access');
    return {
      hasAccess: false,
      upgradeRequired: 'essential',
      message: 'Invalid subscription plan - please contact support.'
    };
  }
  
  const hasAccess = hasFeatureAccess(userPlan, requiredTool);
  console.log('🔍 checkToolAccess - Access result:', hasAccess);
  
  if (hasAccess) {
    console.log('✅ checkToolAccess - ACCESS GRANTED for', userPlan, 'to use', requiredTool);
    return { hasAccess: true };
  }

  // Find the minimum plan that offers this tool
  const planOrder: SubscriptionPlan[] = ['essential', 'premium', 'hero'];
  for (const plan of planOrder) {
    if (hasFeatureAccess(plan, requiredTool)) {
      console.log('🔒 checkToolAccess - ACCESS DENIED - Need to upgrade from', userPlan, 'to', plan, 'for', requiredTool);
      return {
        hasAccess: false,
        upgradeRequired: plan,
        message: `This tool requires ${getPlanDisplayName(plan)} plan or higher.`
      };
    }
  }

  console.log('🚨 checkToolAccess - Tool not available in any plan:', requiredTool);
  return {
    hasAccess: false,
    message: 'This tool is not available in any current plan.'
  };
}