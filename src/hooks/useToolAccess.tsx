import { useAuth } from "@/hooks/useAuth";
import { checkToolAccess, hasFeatureAccess, normalizeSubscriptionPlan, type PlanFeatures, type SubscriptionPlan } from "@/lib/planAccess";

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

  console.log('🔍 useToolAccess - Returning with currentPlan:', currentPlan);
  console.log('🔍 useToolAccess - User authenticated:', !!user);
  console.log('🔍 useToolAccess - Ready to gate access');
  
  return {
    currentPlan,
    checkAccess,
    hasAccess,
    getCurrentPlan,
    isUpgradeRequired,
    user
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