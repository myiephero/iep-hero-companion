// Subscription plan access control utility

export type SubscriptionPlan = 'free' | 'basic' | 'plus' | 'explorer' | 'premium' | 'hero';

export interface PlanFeatures {
  // Core features
  basicIEPTracking: boolean;
  documentStorage: boolean;
  letterTemplates: boolean;
  
  // Plus features
  progressTracking: boolean;
  selfIEPTools: boolean;
  goalDashboard: boolean;
  
  // Premium features
  liveChatSupport: boolean;
  fullIEPReview: boolean;
  advancedAnalytics: boolean;
  
  // Hero features
  multiChildSupport: boolean;
  familyDashboard: boolean;
  prioritySupport: boolean;
  strategyCalls: boolean;
  unlimitedStorage: boolean;
  
  // Storage limits
  storageLimit: string;
}

// Define what features each plan includes
export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  free: {
    basicIEPTracking: true,
    documentStorage: false,
    letterTemplates: true, // Limited templates
    progressTracking: false,
    selfIEPTools: false,
    goalDashboard: false,
    liveChatSupport: false,
    fullIEPReview: false,
    advancedAnalytics: false,
    multiChildSupport: false,
    familyDashboard: false,
    prioritySupport: false,
    strategyCalls: false,
    unlimitedStorage: false,
    storageLimit: 'Community support only'
  },
  basic: {
    basicIEPTracking: true,
    documentStorage: true,
    letterTemplates: true,
    progressTracking: false,
    selfIEPTools: false,
    goalDashboard: false,
    liveChatSupport: false,
    fullIEPReview: false,
    advancedAnalytics: false,
    multiChildSupport: false,
    familyDashboard: false,
    prioritySupport: false,
    strategyCalls: false,
    unlimitedStorage: false,
    storageLimit: '2GB'
  },
  plus: {
    basicIEPTracking: true,
    documentStorage: true,
    letterTemplates: true,
    progressTracking: true,
    selfIEPTools: true,
    goalDashboard: true,
    liveChatSupport: false,
    fullIEPReview: false,
    advancedAnalytics: false,
    multiChildSupport: false,
    familyDashboard: false,
    prioritySupport: true,
    strategyCalls: false,
    unlimitedStorage: false,
    storageLimit: '5GB'
  },
  explorer: {
    basicIEPTracking: true,
    documentStorage: true,
    letterTemplates: true,
    progressTracking: true,
    selfIEPTools: true,
    goalDashboard: true,
    liveChatSupport: true,
    fullIEPReview: true,
    advancedAnalytics: false,
    multiChildSupport: false,
    familyDashboard: false,
    prioritySupport: true,
    strategyCalls: false,
    unlimitedStorage: false,
    storageLimit: '7GB'
  },
  premium: {
    basicIEPTracking: true,
    documentStorage: true,
    letterTemplates: true,
    progressTracking: true,
    selfIEPTools: true,
    goalDashboard: true,
    liveChatSupport: true,
    fullIEPReview: true,
    advancedAnalytics: true,
    multiChildSupport: false,
    familyDashboard: false,
    prioritySupport: true,
    strategyCalls: false,
    unlimitedStorage: false,
    storageLimit: '10GB'
  },
  hero: {
    basicIEPTracking: true,
    documentStorage: true,
    letterTemplates: true,
    progressTracking: true,
    selfIEPTools: true,
    goalDashboard: true,
    liveChatSupport: true,
    fullIEPReview: true,
    advancedAnalytics: true,
    multiChildSupport: true,
    familyDashboard: true,
    prioritySupport: true,
    strategyCalls: true,
    unlimitedStorage: true,
    storageLimit: 'Unlimited'
  }
};

// Utility functions
export function hasFeatureAccess(plan: SubscriptionPlan, feature: keyof PlanFeatures): boolean {
  return PLAN_FEATURES[plan][feature] as boolean;
}

export function getPlanFeatures(plan: SubscriptionPlan): PlanFeatures {
  return PLAN_FEATURES[plan];
}

export function getPlanDashboardRoute(plan: SubscriptionPlan): string {
  return `/parent/dashboard-${plan}`;
}

export function normalizeSubscriptionPlan(plan: string | null | undefined): SubscriptionPlan {
  if (!plan) return 'free';
  
  const normalized = plan.toLowerCase().replace(/\s+/g, '');
  
  // Handle common variations
  switch (normalized) {
    case 'herofamilypack':
    case 'hero-family-pack':
    case 'hero_family_pack':
      return 'hero';
    default:
      if (['free', 'basic', 'plus', 'explorer', 'premium', 'hero'].includes(normalized)) {
        return normalized as SubscriptionPlan;
      }
      return 'free'; // Default fallback
  }
}

// Check if user should be upgraded (for upsell prompts)
export function shouldShowUpgrade(currentPlan: SubscriptionPlan, requiredPlan: SubscriptionPlan): boolean {
  const planOrder: SubscriptionPlan[] = ['free', 'basic', 'plus', 'explorer', 'premium', 'hero'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const requiredIndex = planOrder.indexOf(requiredPlan);
  return currentIndex < requiredIndex;
}

// Get plan display name
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'free': return 'Free';
    case 'basic': return 'Basic';
    case 'plus': return 'Plus';
    case 'explorer': return 'Explorer';
    case 'premium': return 'Premium';
    case 'hero': return 'Hero Family Pack';
    default: return 'Free';
  }
}