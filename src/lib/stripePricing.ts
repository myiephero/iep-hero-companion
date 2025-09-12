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
    priceId: 'price_essential_59_monthly', // TODO: Create in Stripe Dashboard
    amount: 59,
    interval: 'month',
    description: 'AI-powered analysis and comprehensive planning tools',
    features: ['1 student', '30+ tools', 'AI analysis', 'IEP Master Suite', 'Letter generator', 'Priority support']
  },
  premium: {
    priceId: 'price_premium_199_monthly', // TODO: Create in Stripe Dashboard 
    amount: 199,
    interval: 'month',
    description: 'Advanced multi-child support with expert features',
    features: ['3 students', '45+ tools', 'Advanced AI', 'Expert analysis', 'Emotion tracking', 'Phone support']
  },
  hero: {
    priceId: 'price_hero_249_monthly', // TODO: Create in Stripe Dashboard
    amount: 249,
    interval: 'month',
    description: 'Complete advocacy platform with matching',
    features: ['Unlimited students', 'ALL 50+ tools', 'Advocate matching', 'White-glove setup', 'Dedicated support'],
    setupFee: 495 // One-time setup fee for Hero Family Pack (includes first month)
  }
};

// Advocate Plans (4 total with both monthly and annual options)
export const ADVOCATE_STRIPE_PLANS: Record<string, StripePlanConfig> = {
  // Monthly Plans
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
    features: ['2 advocate seats', '30+ tools', 'Team features (Coming Soon)', 'Billing tools (Coming Soon)']
  },
  'agency-plus': {
    priceId: 'price_1S36QJ8iKZXV0srZsrhA6ess', // PRODUCTION: Agency+ $249/month
    amount: 249,
    interval: 'month',
    description: 'Enterprise features with unlimited AI',
    features: ['3 advocate seats', 'ALL 40+ tools', 'White-label', 'Dedicated support']
  },

  // Annual Plans (10% discount)
  'starter-annual': {
    priceId: 'price_advocate_starter_annual', // TODO: Create in Stripe Dashboard
    amount: 529, // $49 * 12 * 0.9 = $529.20 rounded down
    interval: 'year',
    description: 'Essential tools for solo advocates (Annual)',
    features: ['1 advocate seat', '12 tools', 'Basic CRM', 'Email support', '10% savings']
  },
  'pro-annual': {
    priceId: 'price_advocate_pro_annual', // TODO: Create in Stripe Dashboard
    amount: 810, // $75 * 12 * 0.9 = $810
    interval: 'year',
    description: 'AI analysis and professional planning (Annual)',
    features: ['1 advocate seat', '20+ tools', 'AI analysis', 'Priority support', '10% savings']
  },
  'agency-annual': {
    priceId: 'price_advocate_agency_annual', // TODO: Create in Stripe Dashboard
    amount: 1608, // $149 * 12 * 0.9 = $1,608.40 rounded down
    interval: 'year',
    description: 'Team collaboration with billing tools (Annual)',
    features: ['2 advocate seats', '30+ tools', 'Team features (Coming Soon)', 'Billing tools (Coming Soon)', '10% savings']
  },
  'agency-plus-annual': {
    priceId: 'price_advocate_agency_plus_annual', // TODO: Create in Stripe Dashboard
    amount: 2688, // $249 * 12 * 0.9 = $2,688.40 rounded down
    interval: 'year',
    description: 'Enterprise features with unlimited AI (Annual)',
    features: ['3 advocate seats', 'ALL 40+ tools', 'White-label', 'Dedicated support', '10% savings']
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
    'agency-plus': 'Agency Plus',
    'starter-annual': 'Starter Annual',
    'pro-annual': 'Pro Annual',
    'agency-annual': 'Agency Annual',
    'agency-plus-annual': 'Agency Plus Annual'
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