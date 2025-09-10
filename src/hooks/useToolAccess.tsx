import { useAuth } from "@/hooks/useAuth";
import { checkToolAccess, hasFeatureAccess, type PlanFeatures, type SubscriptionPlan } from "@/lib/planAccess";

export function useToolAccess() {
  const { user } = useAuth();
  
  // Debug logging to track the issue
  console.log('🔍 useToolAccess - Full user object:', user);
  console.log('🔍 useToolAccess - Raw subscriptionPlan:', user?.subscriptionPlan);
  
  // Default to 'free' plan if no subscription data
  const currentPlan: SubscriptionPlan = user?.subscriptionPlan || 'free';
  
  console.log('🔍 useToolAccess - Final currentPlan:', currentPlan);

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