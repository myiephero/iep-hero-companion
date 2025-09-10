import { useAuth } from "@/hooks/useAuth";
import { checkToolAccess, hasFeatureAccess, normalizeSubscriptionPlan, type PlanFeatures, type SubscriptionPlan } from "@/lib/planAccess";

export function useToolAccess() {
  const { user } = useAuth();
  
  // Debug logging to track the issue
  console.log('🔍 useToolAccess - Full user object:', user);
  console.log('🔍 useToolAccess - Raw subscriptionPlan:', user?.subscriptionPlan);
  console.log('🔍 useToolAccess - User role:', user?.role);
  
  // CRITICAL FIX: Use normalization function to handle different plan formats
  const rawPlan = user?.subscriptionPlan;
  const normalizedPlan = normalizeSubscriptionPlan(rawPlan);
  
  // Default-deny approach: only allow known normalized plans
  const validPlans: SubscriptionPlan[] = ['free', 'essential', 'premium', 'hero', 'starter', 'pro', 'agency', 'agency-plus'];
  const currentPlan: SubscriptionPlan = validPlans.includes(normalizedPlan) ? normalizedPlan : 'free';
  
  console.log('🔍 useToolAccess - Raw plan:', rawPlan);
  console.log('🔍 useToolAccess - Normalized plan:', normalizedPlan);
  console.log('🔍 useToolAccess - Final currentPlan (default-deny):', currentPlan);

  const checkAccess = (requiredTool: keyof PlanFeatures) => {
    return checkToolAccess(currentPlan, requiredTool);
  };

  const hasAccess = (feature: keyof PlanFeatures): boolean => {
    return hasFeatureAccess(currentPlan, feature);
  };

  const getCurrentPlan = (): SubscriptionPlan => {
    return currentPlan;
  };

  const isUpgradeRequired = (requiredTool: keyof PlanFeatures): boolean => {
    return !hasFeatureAccess(currentPlan, requiredTool);
  };

  console.log('🔍 useToolAccess - Returning with currentPlan:', currentPlan);
  
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