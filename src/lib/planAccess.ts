// Comprehensive subscription plan access control for IEP Hero platform
export type SubscriptionPlan = 'free' | 'basic' | 'plus' | 'premium' | 'hero';

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
    maxDocuments: 5,
    aiAnalysisLimit: 0,
    letterGenerationLimit: 2
  },

  basic: {
    // Dashboard Features - Basic
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: false,
    progressAnalytics: false,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Basic
    iepReviewTool: true,
    unifiedIEPReview: false,
    askAIAboutDocs: false,
    expertAnalysis: false,
    aiIEPReview: false,
    
    // Communication & Documentation - Basic
    smartLetterGenerator: true,
    documentVault: true,
    parentMessages: false,
    communicationTracker: false,
    progressNotes: true,
    
    // Meeting & Planning Tools - Expanded
    meetingPrepWizard: true,
    meetingPrepAssistant: false,
    parentMeetingPrep: false,
    timelineCalculator: true,
    
    // Specialized Support Tools - Limited
    accommodationBuilder: false,
    autismAccommodationBuilder: false,
    giftedTwoeSupport: false,
    plan504Builder: false,
    goalGenerator: false,
    otActivityRecommender: false,
    
    // Educational Resources - Expanded
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: false,
    parentEmotionTracker: false,
    
    // Premium Services - Limited
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
    storageLimit: '2GB',
    supportLevel: 'Email support',
    prioritySupport: false,
    maxChildren: 2,
    maxDocuments: 50,
    aiAnalysisLimit: 5,
    letterGenerationLimit: 10
  },

  plus: {
    // Dashboard Features - Enhanced
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
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
    parentMessages: true,
    communicationTracker: true,
    progressNotes: true,
    
    // Meeting & Planning Tools - Full
    meetingPrepWizard: true,
    meetingPrepAssistant: true,
    parentMeetingPrep: true,
    timelineCalculator: true,
    
    // Specialized Support Tools - Basic
    accommodationBuilder: true,
    autismAccommodationBuilder: false,
    giftedTwoeSupport: false,
    plan504Builder: true,
    goalGenerator: true,
    otActivityRecommender: false,
    
    // Educational Resources - Full
    ideaRightsGuide: true,
    ferpaOverview: true,
    plan504Guide: true,
    emotionTracker: true,
    parentEmotionTracker: true,
    
    // Premium Services - Limited
    heroPlan: false,
    advocateMatchingTool: true,
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
    storageLimit: '5GB',
    supportLevel: 'Priority email support',
    prioritySupport: true,
    maxChildren: 3,
    maxDocuments: 200,
    aiAnalysisLimit: 15,
    letterGenerationLimit: 25
  },

  premium: {
    // Dashboard Features - Advanced
    goalManagement: true,
    meetingScheduler: true,
    aiInsights: true,
    progressAnalytics: true,
    studentProfileManagement: true,
    subscriptionManagement: true,
    
    // Analysis & Review Tools - Advanced
    iepReviewTool: true,
    unifiedIEPReview: true,
    askAIAboutDocs: true,
    expertAnalysis: true,
    aiIEPReview: true,
    
    // Communication & Documentation - Advanced
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
    
    // Specialized Support Tools - Enhanced
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
    storageLimit: '10GB',
    supportLevel: 'Priority email support',
    prioritySupport: true,
    maxChildren: 5,
    maxDocuments: 500,
    aiAnalysisLimit: 50,
    letterGenerationLimit: 100
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
    
    // Limits - Unlimited
    storageLimit: 'Unlimited',
    supportLevel: 'Priority phone & email support + monthly strategy calls',
    prioritySupport: true,
    maxChildren: 999,
    maxDocuments: 999999,
    aiAnalysisLimit: 999,
    letterGenerationLimit: 999
  }
};

// Enhanced utility functions
export function hasFeatureAccess(plan: SubscriptionPlan, feature: keyof PlanFeatures): boolean {
  return PLAN_FEATURES[plan][feature] as boolean;
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
  if (!plan) return 'free';
  
  const normalized = plan.toLowerCase().replace(/\s+/g, '');
  
  switch (normalized) {
    case 'herofamilypack':
    case 'hero-family-pack':
    case 'hero_family_pack':
      return 'hero';
    default:
      if (['free', 'basic', 'plus', 'premium', 'hero'].includes(normalized)) {
        return normalized as SubscriptionPlan;
      }
      return 'free';
  }
}

export function shouldShowUpgrade(currentPlan: SubscriptionPlan, requiredPlan: SubscriptionPlan): boolean {
  const planOrder: SubscriptionPlan[] = ['free', 'basic', 'plus', 'premium', 'hero'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const requiredIndex = planOrder.indexOf(requiredPlan);
  return currentIndex < requiredIndex;
}

export function getPlanDisplayName(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'free': return 'Free';
    case 'basic': return 'Basic';
    case 'plus': return 'Plus'; 
    case 'premium': return 'Premium';
    case 'hero': return 'Hero Family Pack';
    default: return 'Free';
  }
}

// New utility for checking specific tool access with upgrade prompts
export function checkToolAccess(userPlan: SubscriptionPlan, requiredTool: keyof PlanFeatures): {
  hasAccess: boolean;
  upgradeRequired?: SubscriptionPlan;
  message?: string;
} {
  if (hasFeatureAccess(userPlan, requiredTool)) {
    return { hasAccess: true };
  }

  // Find the minimum plan that offers this tool
  const planOrder: SubscriptionPlan[] = ['basic', 'plus', 'premium', 'hero'];
  for (const plan of planOrder) {
    if (hasFeatureAccess(plan, requiredTool)) {
      return {
        hasAccess: false,
        upgradeRequired: plan,
        message: `This tool requires ${getPlanDisplayName(plan)} plan or higher.`
      };
    }
  }

  return {
    hasAccess: false,
    message: 'This tool is not available in any current plan.'
  };
}