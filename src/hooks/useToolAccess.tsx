import { useAuth } from "@/hooks/useAuth";
import { checkToolAccess, hasFeatureAccess, normalizeSubscriptionPlan, type PlanFeatures, type SubscriptionPlan, PLAN_FEATURES } from "@/lib/planAccess";
import { allAdvocateTools, getToolById, type AdvocateTool } from "@/lib/advocateToolsRegistry";

export function useToolAccess() {
  const { user } = useAuth();
  
  // CRITICAL FIX: Use normalization function to handle different plan formats
  const rawPlan = user?.subscriptionPlan;
  const normalizedPlan = normalizeSubscriptionPlan(rawPlan);
  
  // STRICT default-deny approach: only allow known normalized plans
  const validPlans: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero', 'starter', 'pro', 'agency', 'agency-plus'];
  const currentPlan: SubscriptionPlan = validPlans.includes(normalizedPlan) ? normalizedPlan : 'free';

  const checkAccess = (requiredTool: keyof PlanFeatures) => {
    const result = checkToolAccess(currentPlan, requiredTool);
    return result;
  };

  const hasAccess = (feature: keyof PlanFeatures): boolean => {
    const result = hasFeatureAccess(currentPlan, feature);
    return result;
  };

  const getCurrentPlan = (): SubscriptionPlan => {
    return currentPlan;
  };

  const isUpgradeRequired = (requiredTool: keyof PlanFeatures): boolean => {
    return !hasFeatureAccess(currentPlan, requiredTool);
  };

  // Enhanced helper functions for tier-based access control
  const canUse = (feature: keyof PlanFeatures): boolean => {
    const result = hasFeatureAccess(currentPlan, feature);
    return result;
  };

  const needsUpgrade = (feature: keyof PlanFeatures): boolean => {
    const needs = !hasFeatureAccess(currentPlan, feature);
    return needs;
  };

  const requiredPlanFor = (feature: keyof PlanFeatures): SubscriptionPlan => {
    // Find the minimum plan that provides this feature
    const planHierarchy: SubscriptionPlan[] = ['starter', 'pro', 'agency', 'agency-plus'];
    
    for (const plan of planHierarchy) {
      if (PLAN_FEATURES[plan]?.[feature]) {
        return plan;
      }
    }
    
    // If not found in advocate plans, check parent plans
    const parentPlans: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero'];
    for (const plan of parentPlans) {
      if (PLAN_FEATURES[plan]?.[feature]) {
        return plan;
      }
    }
    
    return 'agency-plus';
  };

  const getToolAccessInfo = (toolId: string): {
    tool: AdvocateTool | null;
    hasAccess: boolean;
    needsUpgrade: boolean;
    requiredPlan: SubscriptionPlan;
    upgradeMessage: string;
  } => {
    const tool = getToolById(toolId);
    if (!tool) {
      return {
        tool: null,
        hasAccess: false,
        needsUpgrade: true,
        requiredPlan: 'agency-plus',
        upgradeMessage: 'Tool not found'
      };
    }

    const hasToolAccess = canUse(tool.requiredFeature);
    const requiresUpgrade = needsUpgrade(tool.requiredFeature);
    const minimumPlan = requiredPlanFor(tool.requiredFeature);
    
    const upgradeMessage = requiresUpgrade 
      ? `This ${tool.title} requires ${minimumPlan.charAt(0).toUpperCase() + minimumPlan.slice(1)} plan or higher`
      : '';

    return {
      tool,
      hasAccess: hasToolAccess,
      needsUpgrade: requiresUpgrade,
      requiredPlan: minimumPlan,
      upgradeMessage
    };
  };

  const getPlanUpgradeOptions = (): Array<{
    plan: SubscriptionPlan;
    displayName: string;
    isUpgrade: boolean;
  }> => {
    const planHierarchy: Record<SubscriptionPlan, number> = {
      'free': 0,
      'essential': 1,
      'premium': 2,
      'hero': 3,
      'starter': 1,
      'pro': 2, 
      'agency': 3,
      'agency-plus': 4
    };
    
    const currentLevel = planHierarchy[currentPlan] || 0;
    
    return Object.entries(planHierarchy)
      .map(([plan, level]) => ({
        plan: plan as SubscriptionPlan,
        displayName: plan.charAt(0).toUpperCase() + plan.slice(1).replace('-', ' '),
        isUpgrade: level > currentLevel
      }))
      .filter(option => option.isUpgrade);
  };

  return {
    currentPlan,
    checkAccess,
    hasAccess,
    getCurrentPlan,
    isUpgradeRequired,
    user,
    // Enhanced helper functions
    canUse,
    needsUpgrade,
    requiredPlanFor,
    getToolAccessInfo,
    getPlanUpgradeOptions
  };
}

// Convenience hook for component-level access checks
export function useFeatureGate(requiredFeature: keyof PlanFeatures) {
  const { checkAccess, hasAccess, currentPlan } = useToolAccess();
  
  const accessResult = checkAccess(requiredFeature);
  
  return {
    hasAccess: hasAccess(requiredFeature),
    upgradeRequired: accessResult.upgradeRequired,
    message: accessResult.message,
    currentPlan,
    isBlocked: !accessResult.hasAccess
  };
}