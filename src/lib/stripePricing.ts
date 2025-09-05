// Stripe pricing configuration for My IEP Hero platform
// This file maps all 9 subscription plans to their Stripe price IDs and details

export interface StripePlanConfig {
  priceId: string; // Stripe price ID (needs to be created in Stripe Dashboard)
  amount: number; // Amount in dollars
  interval: 'month' | 'year';
  description: string;
  features: string[];
}

// Parent Plans (5 total)
export const PARENT_STRIPE_PLANS: Record<string, StripePlanConfig> = {
  free: {
    priceId: '', // Free plan doesn't need Stripe
    amount: 0,
    interval: 'month',
    description: 'Community access with basic tools',
    features: ['1 student', '3 core tools', 'Community support']
  },
  basic: {
    priceId: 'price_basic_parent_monthly', // TODO: Replace with actual Stripe price ID
    amount: 19,
    interval: 'month',
    description: 'Essential tools without AI',
    features: ['1 student', '12 tools', 'Email support', 'No AI features']
  },
  plus: {
    priceId: 'price_plus_parent_monthly', // TODO: Replace with actual Stripe price ID
    amount: 29,
    interval: 'month',
    description: 'AI-powered analysis and planning',
    features: ['1 student', '25+ tools', 'AI analysis', 'Priority support']
  },
  premium: {
    priceId: 'price_premium_parent_monthly', // TODO: Replace with actual Stripe price ID
    amount: 49,
    interval: 'month',
    description: 'Advanced tools and analytics',
    features: ['2 students', '35+ tools', 'Advanced AI', 'Phone support']
  },
  hero: {
    priceId: 'price_hero_parent_monthly', // TODO: Replace with actual Stripe price ID
    amount: 199,
    interval: 'month',
    description: 'Complete advocacy platform with matching',
    features: ['3 students', 'ALL 50+ tools', 'Advocate matching', 'White-glove setup']
  }
};

// Advocate Plans (4 total)
export const ADVOCATE_STRIPE_PLANS: Record<string, StripePlanConfig> = {
  starter: {
    priceId: 'price_starter_advocate_monthly', // TODO: Replace with actual Stripe price ID
    amount: 49,
    interval: 'month',
    description: 'Essential tools for solo advocates',
    features: ['1 advocate seat', '12 tools', 'Basic CRM', 'Email support']
  },
  pro: {
    priceId: 'price_pro_advocate_monthly', // TODO: Replace with actual Stripe price ID
    amount: 75,
    interval: 'month',
    description: 'AI analysis and professional planning',
    features: ['1 advocate seat', '20+ tools', 'AI analysis', 'Priority support']
  },
  agency: {
    priceId: 'price_agency_advocate_monthly', // TODO: Replace with actual Stripe price ID
    amount: 149,
    interval: 'month',
    description: 'Team collaboration with billing tools',
    features: ['2 advocate seats', '30+ tools', 'Team features', 'Billing tools']
  },
  'agency-plus': {
    priceId: 'price_agency_plus_advocate_monthly', // TODO: Replace with actual Stripe price ID
    amount: 249,
    interval: 'month',
    description: 'Enterprise features with unlimited AI',
    features: ['3 advocate seats', 'ALL 40+ tools', 'White-label', 'Dedicated support']
  }
};

// Combined plan lookup
export const ALL_STRIPE_PLANS = {
  ...PARENT_STRIPE_PLANS,
  ...ADVOCATE_STRIPE_PLANS
};

// Helper function to get plan config by ID
export function getStripePlanConfig(planId: string): StripePlanConfig | null {
  return ALL_STRIPE_PLANS[planId] || null;
}

// Helper function to determine if plan requires payment
export function requiresPayment(planId: string): boolean {
  return planId !== 'free';
}

// Helper function to get checkout URL with plan data
export function getCheckoutUrl(planId: string, role: 'parent' | 'advocate'): string {
  const config = getStripePlanConfig(planId);
  if (!config || !requiresPayment(planId)) {
    return '/dashboard'; // Free plan goes straight to dashboard
  }

  const params = new URLSearchParams({
    plan: planId,
    role: role,
    priceId: config.priceId,
    amount: config.amount.toString(),
    planName: planId.charAt(0).toUpperCase() + planId.slice(1)
  });

  return `/subscription-setup?${params.toString()}`;
}

// Validation function to check if all price IDs are configured
export function validateStripePricing(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  Object.entries(ALL_STRIPE_PLANS).forEach(([planId, config]) => {
    if (requiresPayment(planId) && (!config.priceId || config.priceId.startsWith('price_'))) {
      missing.push(planId);
    }
  });

  return {
    valid: missing.length === 0,
    missing
  };
}