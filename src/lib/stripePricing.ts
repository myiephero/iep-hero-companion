// Stripe pricing configuration for My IEP Hero platform
// This file maps all 9 subscription plans to their Stripe price IDs and details

export interface StripePlanConfig {
  priceId: string; // Stripe price ID (needs to be created in Stripe Dashboard)
  amount: number; // Amount in dollars
  interval: 'month' | 'year';
  description: string;
  features: string[];
  setupFee?: number; // Optional one-time setup fee
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
    priceId: 'price_1Rr3bk8iKZXV0srZ0URHZo4O', // PRODUCTION: Parent Basic $19/month
    amount: 19,
    interval: 'month',
    description: 'Essential tools without AI',
    features: ['1 student', '12 tools', 'Email support', 'No AI features']
  },
  plus: {
    priceId: 'price_1Rr3co8iKZXV0srZA1kEdBW1', // PRODUCTION: Parent Plus $29/month
    amount: 29,
    interval: 'month',
    description: 'AI-powered analysis and planning',
    features: ['1 student', '25+ tools', 'AI analysis', 'Priority support']
  },
  premium: {
    priceId: 'price_1Rr3e68iKZXV0srZnPPK5J3R', // PRODUCTION: Parent Premium $49/month
    amount: 49,
    interval: 'month',
    description: 'Advanced tools and analytics',
    features: ['2 students', '35+ tools', 'Advanced AI', 'Phone support']
  },
  hero: {
    priceId: 'price_1S3nyI8iKZXV0srZy1awxPBd', // PRODUCTION: Hero Family Pack $199/month
    amount: 199,
    interval: 'month',
    description: 'Complete advocacy platform with matching',
    features: ['3 students', 'ALL 50+ tools', 'Advocate matching', 'White-glove setup'],
    setupFee: 495 // One-time setup fee for Hero Family Pack
  }
};

// Advocate Plans (4 total)
export const ADVOCATE_STRIPE_PLANS: Record<string, StripePlanConfig> = {
  starter: {
    priceId: 'price_1Rr3gL8iKZXV0srZmfuD32yv', // PRODUCTION: Advocate Starter $49/month
    amount: 49,
    interval: 'month',
    description: 'Essential tools for solo advocates',
    features: ['1 advocate seat', '12 tools', 'Basic CRM', 'Email support']
  },
  pro: {
    priceId: 'price_1Rr3hR8iKZXV0srZ5lPscs0p', // PRODUCTION: Advocate Pro $75/month
    amount: 75,
    interval: 'month',
    description: 'AI analysis and professional planning',
    features: ['1 advocate seat', '20+ tools', 'AI analysis', 'Priority support']
  },
  agency: {
    priceId: 'price_1Rr3ik8iKZXV0srZPRPByMQx', // PRODUCTION: Advocate Agency $149/month
    amount: 149,
    interval: 'month',
    description: 'Team collaboration with billing tools',
    features: ['2 advocate seats', '30+ tools', 'Team features', 'Billing tools']
  },
  'agency-plus': {
    priceId: 'price_1S36QJ8iKZXV0srZsrhA6ess', // PRODUCTION: Agency+ $249/month
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
  
  // Only free plan goes to dashboard
  if (planId === 'free') {
    return '/dashboard';
  }
  
  // All other plans go to subscription setup, even without price IDs
  if (!config) {
    console.error(`No config found for plan: ${planId}`);
    return '/parent/pricing'; // Fallback to pricing page
  }

  const params = new URLSearchParams({
    plan: planId,
    role: role,
    priceId: config.priceId || '',
    amount: config.amount.toString(),
    planName: planId.charAt(0).toUpperCase() + planId.slice(1)
  });

  return `/subscription-setup?${params.toString()}`;
}

// Validation function to check if all price IDs are configured
export function validateStripePricing(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  Object.entries(ALL_STRIPE_PLANS).forEach(([planId, config]) => {
    if (requiresPayment(planId) && (!config.priceId || !config.priceId.startsWith('price_'))) {
      missing.push(planId);
    }
  });

  return {
    valid: missing.length === 0,
    missing
  };
}