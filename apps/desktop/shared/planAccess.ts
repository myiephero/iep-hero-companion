// Comprehensive subscription plan access control for IEP Hero platform
export type SubscriptionPlan = 'free' | 'essential' | 'premium' | 'hero' | 'starter' | 'pro' | 'agency' | 'agency-plus';

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
    expertAnalysis: false,
    aiIEPReview: true,
    
    // Communication & Documentation - Complete (Premium merge)
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Complete (Premium features)
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - Premium merge (all premium tools)
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: true,
    
    // Educational Resources - Complete
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - No (Hero-specific)
    heroPlan: false,
    advocateMatchingTool: false,
    expertSupport: false,
    
    // Advocate Tools - None (role-specific)
    clientManagement: false,
    caseAnalytics: false,
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
    
    // Enhanced limits
    storageLimit: 'Unlimited secure cloud storage',
    supportLevel: 'Priority email support',
    prioritySupport: true,
    maxChildren: 5,
    maxDocuments: 50,
    aiAnalysisLimit: 25,
    letterGenerationLimit: 15
  },

  premium: {
    // Dashboard Features - Complete
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - All included
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: false,
    aiIEPReview: true,
    
    // Communication & Documentation - All included
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - All included
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - All included
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: true,
    
    // Educational Resources - All included
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - No (Hero-specific)
    heroPlan: false,
    advocateMatchingTool: false,
    expertSupport: false,
    
    // Advocate Tools - None (role-specific)
    clientManagement: false,
    caseAnalytics: false,
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
    
    // Premium limits
    storageLimit: 'Unlimited secure cloud storage',
    supportLevel: 'Priority email support',
    prioritySupport: true,
    maxChildren: 10,
    maxDocuments: 100,
    aiAnalysisLimit: 50,
    letterGenerationLimit: 25
  },

  hero: {
    // Dashboard Features - Complete
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - All including expert
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: true,
    aiIEPReview: true,
    
    // Communication & Documentation - All included
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - All included
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - All included
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: true,
    
    // Educational Resources - All included
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - Hero-specific features
    heroPlan: true,
    advocateMatchingTool: true,
    expertSupport: true,
    
    // Advocate Tools - None (role-specific)
    clientManagement: false,
    caseAnalytics: false,
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
    
    // Hero limits
    storageLimit: 'Unlimited secure cloud storage',
    supportLevel: 'White-glove phone + email support',
    prioritySupport: true,
    maxChildren: 999,
    maxDocuments: 999,
    aiAnalysisLimit: 999,
    letterGenerationLimit: 999
  },

  // === ADVOCATE PLANS ===
  starter: {
    // Dashboard Features - Basic for advocates
    goalManagement: false,
    meetingScheduler: true,
    aiInsights: false,
    progressAnalytics: false,
    studentProfileManagement: false,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Limited
    iepReviewTool: false,
    unifiedIEPReview: false,
    askAIAboutDocs: false,
    expertAnalysis: false,
    aiIEPReview: false,
    
    // Communication & Documentation - Limited
    smartLetterGenerator: false,
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
    
    // Educational Resources - Basic
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: false,
    emotionTracker: false,
    parentEmotionTracker: false,
    
    // Premium Services - None
    heroPlan: false,
    advocateMatchingTool: false,
    expertSupport: false,
    
    // Advocate Tools - Starter level
    clientManagement: false,
    caseAnalytics: false,
    billingTools: false,
    scheduleManagement: true,
    teamCollaboration: false,
    professionalAnalysis: false,
    advocateMessaging: true,
    advocacyReports: false,
    caseManagement: true,
    professionalPlanning: false,
    professionalResources: false,
    businessManagement: false,
    specializedProfessionalTools: false,
    
    // Starter limits
    storageLimit: 'Basic cloud storage',
    supportLevel: 'Email support',
    prioritySupport: false,
    maxChildren: 10,
    maxDocuments: 25,
    aiAnalysisLimit: 5,
    letterGenerationLimit: 5
  },

  pro: {
    // Dashboard Features - Enhanced for pro advocates
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: false,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Enhanced
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: false,
    aiIEPReview: true,
    
    // Communication & Documentation - Enhanced
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: false,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Enhanced
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: false,
    timelineCalculator: true,
    
    // Specialized Support Tools - Some included
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: false,
    
    // Educational Resources - Enhanced
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: false,
    
    // Premium Services - None
    heroPlan: false,
    advocateMatchingTool: false,
    expertSupport: false,
    
    // Advocate Tools - Pro level
    clientManagement: true,
    caseAnalytics: false,
    billingTools: true,
    scheduleManagement: true,
    teamCollaboration: false,
    professionalAnalysis: false,
    advocateMessaging: true,
    advocacyReports: true,
    caseManagement: true,
    professionalPlanning: false,
    professionalResources: true,
    businessManagement: false,
    specializedProfessionalTools: false,
    
    // Pro limits
    storageLimit: 'Enhanced cloud storage',
    supportLevel: 'Priority email support',
    prioritySupport: true,
    maxChildren: 50,
    maxDocuments: 100,
    aiAnalysisLimit: 25,
    letterGenerationLimit: 20
  },

  agency: {
    // Dashboard Features - Full for agency
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: false,
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
    parentMessages: false,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Full
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: false,
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
    parentEmotionTracker: false,
    
    // Premium Services - None
    heroPlan: false,
    advocateMatchingTool: false,
    expertSupport: false,
    
    // Advocate Tools - Agency level
    clientManagement: true,
    caseAnalytics: true,
    billingTools: true,
    scheduleManagement: true,
    teamCollaboration: true,
    professionalAnalysis: true,
    advocateMessaging: true,
    advocacyReports: true,
    caseManagement: true,
    professionalPlanning: true,
    professionalResources: true,
    businessManagement: false,
    specializedProfessionalTools: false,
    
    // Agency limits
    storageLimit: 'Unlimited secure cloud storage',
    supportLevel: 'Priority email + phone support',
    prioritySupport: true,
    maxChildren: 200,
    maxDocuments: 500,
    aiAnalysisLimit: 100,
    letterGenerationLimit: 75
  },

  'agency-plus': {
    // Dashboard Features - Complete
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: false,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Complete
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: true,
    aiIEPReview: true,
    
    // Communication & Documentation - Complete
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: false,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Complete
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: false,
    timelineCalculator: true,
    
    // Specialized Support Tools - Complete
    accommodationBuilder: true,
    autismAccommodationBuilder: true,
    giftedTwoeSupport: true,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: true,
    
    // Educational Resources - Complete
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: false,
    
    // Premium Services - None
    heroPlan: false,
    advocateMatchingTool: false,
    expertSupport: false,
    
    // Advocate Tools - Agency Plus level (everything)
    clientManagement: true,
    caseAnalytics: true,
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
    
    // Agency Plus limits - Unlimited
    storageLimit: 'Unlimited secure cloud storage',
    supportLevel: 'White-glove phone + email support',
    prioritySupport: true,
    maxChildren: 999999,
    maxDocuments: 999999,
    aiAnalysisLimit: 999999,
    letterGenerationLimit: 999999
  }
};

/**
 * Check if a user has access to a specific feature based on their plan
 */
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

/**
 * Normalize a subscription plan name to a standard format
 */
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
    case 'agency+':
      result = 'agency-plus';
      break;
    
    default:
      // Direct match for known plans - STRICT VALIDATION
      const validPlans: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero', 'starter', 'pro', 'agency', 'agency-plus'];
      if (validPlans.includes(normalized as SubscriptionPlan)) {
        result = normalized as SubscriptionPlan;
      } else {
        console.warn('🚨 normalizeSubscriptionPlan - Unknown plan format:', plan, '-> DEFAULT-DENY to "free"');
        result = 'free';
      }
      break;
  }
  
  console.log('🔍 normalizeSubscriptionPlan - Final result:', result);
  return result;
}