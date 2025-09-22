// Stripe pricing configuration for My IEP Hero platform - Updated for testing
// This file maps all 9 subscription plans to their Stripe price IDs and details

export interface StripePlanConfig {
  priceId: string; // Stripe price ID (needs to be created in Stripe Dashboard)
  amount: number; // Amount in dollars
  interval: 'month' | 'year';
  description: string;
  features: string[];
  setupFee?: number; // Optional one-time setup fee
}

// Parent Plans (4 total - Streamlined Structure)
export const PARENT_STRIPE_PLANS: Record<string, StripePlanConfig> = {
  free: {
    priceId: '', // Free plan doesn't need Stripe
    amount: 0,
    interval: 'month',
    description: 'Community access with basic tools',
    features: ['1 student', '5 core tools', 'Community support', 'IDEA Rights Guide']
  },
  essential: {
    priceId: 'price_1Rr3gL8iKZXV0srZmfuD32yv', // Using existing advocate price ID for testing
    amount: 59,
    interval: 'month',
    description: 'AI-powered analysis and comprehensive planning tools',
    features: ['1 student', '30+ tools', 'AI analysis', 'IEP Master Suite', 'Letter generator', 'Priority support']
  },
  premium: {
    priceId: 'price_1Rr3hR8iKZXV0srZ5lPscs0p', // Using existing advocate price ID for testing
    amount: 199,
    interval: 'month',
    description: 'Advanced multi-child support with expert features',
    features: ['3 students', '45+ tools', 'Advanced AI', 'Expert analysis', 'Emotion tracking', 'Phone support']
  },
  hero: {
    priceId: 'price_1S36QJ8iKZXV0srZsrhA6ess', // Using existing advocate price ID for testing
    amount: 249,
    interval: 'month',
    description: 'Complete advocacy platform with matching',
    features: ['Unlimited students', 'ALL 50+ tools', 'Advocate matching', 'White-glove setup', 'Dedicated support'],
    setupFee: 495 // One-time setup fee for Hero Family Pack (includes first month)
  }
};

// Advocate Plans (3 total with both monthly and annual options)
export const ADVOCATE_STRIPE_PLANS: Record<string, StripePlanConfig> = {
  // Monthly Plans
  starter: {
    priceId: 'price_1Rr3gL8iKZXV0srZmfuD32yv', // PRODUCTION: Advocate Starter $99/month
    amount: 99,
    interval: 'month',
    description: 'Essential tools for solo advocates',
    features: ['1 advocate seat', '12 tools', 'Basic CRM', 'Email support']
  },
  pro: {
    priceId: 'price_1Rr3hR8iKZXV0srZ5lPscs0p', // PRODUCTION: Advocate Pro $99/month
    amount: 99,
    interval: 'month',
    description: 'AI analysis and professional planning',
    features: ['1 advocate seat', '20+ tools', 'AI analysis', 'Priority support']
  },
  agency: {
    priceId: 'price_1S36QJ8iKZXV0srZsrhA6ess', // PRODUCTION: Agency $249/month
    amount: 249,
    interval: 'month',
    description: 'Complete advocacy practice solution',
    features: ['3 advocate seats', 'ALL 40+ tools', 'Enterprise features', 'Unlimited AI'],
    setupFee: 495
  },

  // Annual Plans (significant savings vs monthly)
  'starter-annual': {
    priceId: 'price_1S6eXk8iKZXV0srZYfDQoLE5', // Advocate Starter Annual $588/year
    amount: 588, // $49 * 12 = $588
    interval: 'year',
    description: 'Essential tools for solo advocates (Annual)',
    features: ['1 advocate seat', '12 tools', 'Basic CRM', 'Email support', 'Save $600/year']
  },
  'pro-annual': {
    priceId: 'price_1SABAn8iKZXV0srZnqnkGO6z', // CORRECTED: Advocate Pro Annual $900/year (was charging monthly)
    amount: 900, // $75 * 12 = $900 (save $288/year vs monthly)
    interval: 'year',
    description: 'AI analysis and professional planning (Annual)',
    features: ['1 advocate seat', '20+ tools', 'AI analysis', 'Priority support', 'Save $288/year']
  },
  'agency-annual': {
    priceId: 'price_1S6eXl8iKZXV0srZNPTt6cI1', // Advocate Agency Annual $2,388/year
    amount: 2388, // $199 * 12 = $2,388
    interval: 'year',
    description: 'Complete advocacy practice solution (Annual)',
    features: ['3 advocate seats', 'ALL 40+ tools', 'Enterprise features', 'Unlimited AI'],
    setupFee: 495
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
export function getCheckoutUrl(planId: string, role: 'parent' | 'advocate', isAnnual: boolean = false): string {
  // For advocate plans, append -annual if annual billing is selected
  const actualPlanId = role === 'advocate' && isAnnual && !planId.includes('-annual') ? `${planId}-annual` : planId;
  const config = getStripePlanConfig(actualPlanId);
  
  // Only free plan goes to dashboard
  if (planId === 'free') {
    return '/dashboard';
  }
  
  // All other plans go to subscription setup, even without price IDs
  if (!config) {
    console.error(`No config found for plan: ${actualPlanId}`);
    return role === 'advocate' ? '/advocate/pricing' : '/parent/pricing'; // Fallback to pricing page
  }

  // Get proper plan names based on the plan ID
  const planNameMap: Record<string, string> = {
    'essential': 'Essential',
    'premium': 'Premium',
    'hero': 'Hero Family Pack',
    'starter': 'Starter',
    'pro': 'Pro',
    'agency': 'Agency',
    'starter-annual': 'Starter Annual',
    'pro-annual': 'Pro Annual',
    'agency-annual': 'Agency Annual'
  };

  const params = new URLSearchParams({
    plan: actualPlanId,
    role: role,
    priceId: config.priceId || '',
    amount: config.amount.toString(),
    planName: planNameMap[actualPlanId] || actualPlanId.charAt(0).toUpperCase() + actualPlanId.slice(1)
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