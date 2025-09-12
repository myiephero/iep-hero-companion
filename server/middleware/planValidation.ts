import { Request, Response, NextFunction } from 'express';
import { hasFeatureAccess, normalizeSubscriptionPlan, SubscriptionPlan, PlanFeatures } from '../../shared/planAccess';

// Extend the existing Express Request type to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    claims?: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
    };
    role?: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    emailVerified?: boolean;
  };
}

// Middleware to check if user has access to a specific feature
export function requiresFeature(requiredFeature: keyof PlanFeatures) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        console.log('🚨 PLAN VALIDATION - No authenticated user found');
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const userPlan = normalizeSubscriptionPlan(user.subscriptionPlan);
      console.log(`🔒 PLAN VALIDATION - User: ${user.claims?.sub || 'unknown'}, Plan: ${userPlan}, Feature: ${String(requiredFeature)}`);

      const hasAccess = hasFeatureAccess(userPlan, requiredFeature);
      
      if (!hasAccess) {
        console.log(`❌ PLAN VALIDATION - Access denied for feature: ${String(requiredFeature)} on plan: ${userPlan}`);
        return res.status(403).json({
          error: 'Upgrade required',
          code: 'UPGRADE_REQUIRED',
          feature: String(requiredFeature),
          currentPlan: userPlan,
          message: `This feature requires a higher subscription plan. Your current plan: ${userPlan}`
        });
      }

      console.log(`✅ PLAN VALIDATION - Access granted for feature: ${String(requiredFeature)}`);
      next();
    } catch (error) {
      console.error('🚨 PLAN VALIDATION - Error:', error);
      res.status(500).json({ 
        error: 'Internal server error during plan validation',
        code: 'VALIDATION_ERROR'
      });
    }
  };
}

// Middleware to check if user has a specific plan or higher
export function requiresPlan(minimumPlan: SubscriptionPlan) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        console.log('🚨 PLAN VALIDATION - No authenticated user found');
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const userPlan = normalizeSubscriptionPlan(user.subscriptionPlan);
      console.log(`🔒 PLAN VALIDATION - User: ${user.claims?.sub || 'unknown'}, Current Plan: ${userPlan}, Required: ${minimumPlan}`);

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

      const userPlanLevel = planHierarchy[userPlan] || 0;
      const requiredPlanLevel = planHierarchy[minimumPlan] || 999;

      if (userPlanLevel < requiredPlanLevel) {
        console.log(`❌ PLAN VALIDATION - Plan upgrade required. Current: ${userPlan} (${userPlanLevel}), Required: ${minimumPlan} (${requiredPlanLevel})`);
        return res.status(403).json({
          error: 'Plan upgrade required',
          code: 'UPGRADE_REQUIRED',
          currentPlan: userPlan,
          requiredPlan: minimumPlan,
          message: `This endpoint requires ${minimumPlan} plan or higher. Your current plan: ${userPlan}`
        });
      }

      console.log(`✅ PLAN VALIDATION - Plan access granted: ${userPlan}`);
      next();
    } catch (error) {
      console.error('🚨 PLAN VALIDATION - Error:', error);
      res.status(500).json({ 
        error: 'Internal server error during plan validation',
        code: 'VALIDATION_ERROR'
      });
    }
  };
}

// Middleware for advocate-specific features
export function requiresAdvocateAccess(requiredFeature: keyof PlanFeatures) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (user.role !== 'advocate') {
        console.log(`🚨 ADVOCATE VALIDATION - Non-advocate user attempted access: ${user.claims?.sub || 'unknown'}, Role: ${user.role}`);
        return res.status(403).json({
          error: 'Advocate access required',
          code: 'ROLE_REQUIRED',
          message: 'This endpoint is only available to advocates'
        });
      }

      const userPlan = normalizeSubscriptionPlan(user.subscriptionPlan);
      const hasAccess = hasFeatureAccess(userPlan, requiredFeature);
      
      if (!hasAccess) {
        console.log(`❌ ADVOCATE VALIDATION - Access denied for advocate feature: ${String(requiredFeature)} on plan: ${userPlan}`);
        return res.status(403).json({
          error: 'Advocate plan upgrade required',
          code: 'UPGRADE_REQUIRED',
          feature: String(requiredFeature),
          currentPlan: userPlan,
          message: `This advocate feature requires a higher subscription plan. Your current plan: ${userPlan}`
        });
      }

      console.log(`✅ ADVOCATE VALIDATION - Access granted for advocate feature: ${String(requiredFeature)}`);
      next();
    } catch (error) {
      console.error('🚨 ADVOCATE VALIDATION - Error:', error);
      res.status(500).json({ 
        error: 'Internal server error during advocate validation',
        code: 'VALIDATION_ERROR'
      });
    }
  };
}

// Utility function to get plan upgrade suggestions
export function getPlanUpgradeSuggestion(currentPlan: SubscriptionPlan, requiredFeature: keyof PlanFeatures) {
  const plans: SubscriptionPlan[] = ['essential', 'premium', 'hero', 'starter', 'pro', 'agency', 'agency-plus'];
  
  for (const plan of plans) {
    if (hasFeatureAccess(plan, requiredFeature)) {
      return {
        suggestedPlan: plan,
        message: `Upgrade to ${plan} plan to access this feature`
      };
    }
  }
  
  return {
    suggestedPlan: 'agency-plus' as SubscriptionPlan,
    message: 'Contact support for access to this feature'
  };
}