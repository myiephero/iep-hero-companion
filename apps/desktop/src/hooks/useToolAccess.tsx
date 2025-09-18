import { useAuth } from "@/hooks/useAuth";
import { checkToolAccess, hasFeatureAccess, normalizeSubscriptionPlan, type PlanFeatures, type SubscriptionPlan, PLAN_FEATURES } from "@/lib/planAccess";
import { allAdvocateTools, getToolById, type AdvocateTool } from "@/lib/advocateToolsRegistry";

export function useToolAccess() {
  const { user } = useAuth();
  
  // Enhanced debug logging to track the issue
  console.log('🔍 useToolAccess - Full user object:', JSON.stringify(user, null, 2));
  console.log('🔍 useToolAccess - Raw subscriptionPlan:', user?.subscriptionPlan);
  console.log('🔍 useToolAccess - User role:', user?.role);
  console.log('🔍 useToolAccess - User ID:', user?.id);
  
  // CRITICAL FIX: Use normalization function to handle different plan formats
  const rawPlan = user?.subscriptionPlan;
  const normalizedPlan = normalizeSubscriptionPlan(rawPlan);
  
  // STRICT default-deny approach: only allow known normalized plans
  const validPlans: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero', 'starter', 'pro', 'agency', 'agency-plus'];
  const currentPlan: SubscriptionPlan = validPlans.includes(normalizedPlan) ? normalizedPlan : 'free';
  
  console.log('🔍 useToolAccess - Raw plan:', rawPlan);
  console.log('🔍 useToolAccess - Normalized plan:', normalizedPlan);
  console.log('🔍 useToolAccess - Final currentPlan (STRICT default-deny):', currentPlan);
  console.log('🔍 useToolAccess - Plan validation result:', validPlans.includes(normalizedPlan) ? 'VALID' : 'INVALID -> DEFAULTED TO FREE');

  const checkAccess = (requiredTool: keyof PlanFeatures) => {
    console.log('🔍 useToolAccess.checkAccess - Called with:', requiredTool, 'for plan:', currentPlan);
    const result = checkToolAccess(currentPlan, requiredTool);
    console.log('🔍 useToolAccess.checkAccess - Result:', result);
    return result;
  };

  const hasAccess = (feature: keyof PlanFeatures): boolean => {
    console.log('🔍 useToolAccess.hasAccess - Called with feature:', feature, 'for plan:', currentPlan);
    const result = hasFeatureAccess(currentPlan, feature);
    console.log('🔍 useToolAccess.hasAccess - Result:', result);
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
    console.log('🔍 useToolAccess.canUse -', feature, ':', result, 'for plan:', currentPlan);
    return result;
  };

  const needsUpgrade = (feature: keyof PlanFeatures): boolean => {
    const needs = !hasFeatureAccess(currentPlan, feature);
    console.log('🔍 useToolAccess.needsUpgrade -', feature, ':', needs, 'for plan:', currentPlan);
    return needs;
  };

  const requiredPlanFor = (feature: keyof PlanFeatures): SubscriptionPlan => {
    // Find the minimum plan that provides this feature
    const planHierarchy: SubscriptionPlan[] = ['starter', 'pro', 'agency', 'agency-plus'];
    
    for (const plan of planHierarchy) {
      if (PLAN_FEATURES[plan]?.[feature]) {
        console.log('🔍 useToolAccess.requiredPlanFor -', feature, 'requires:', plan);
        return plan;
      }
    }
    
    // If not found in advocate plans, check parent plans
    const parentPlans: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero'];
    for (const plan of parentPlans) {
      if (PLAN_FEATURES[plan]?.[feature]) {
        console.log('🔍 useToolAccess.requiredPlanFor -', feature, 'requires:', plan);
        return plan;
      }
    }
    
    console.log('🔍 useToolAccess.requiredPlanFor -', feature, 'not found, defaulting to agency-plus');
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

  console.log('🔍 useToolAccess - Returning with currentPlan:', currentPlan);
  console.log('🔍 useToolAccess - User authenticated:', !!user);
  console.log('🔍 useToolAccess - Ready to gate access');
  
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