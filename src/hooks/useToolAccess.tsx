import { useAuth } from "@/hooks/useAuth";
import { checkToolAccess, hasFeatureAccess, type PlanFeatures } from "@/lib/planAccess";
import { SubscriptionPlan } from "@shared/schema";

export function useToolAccess() {
  const { user } = useAuth();
  
  // Default to 'free' plan if no subscription data
  const currentPlan: SubscriptionPlan = user?.subscriptionPlan || 'free';

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