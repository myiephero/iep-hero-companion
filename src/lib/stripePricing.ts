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

// Parent Plans (7 total - Monthly & Annual Options)
export const PARENT_STRIPE_PLANS: Record<string, StripePlanConfig> = {
  free: {
    priceId: '', // Free plan doesn't need Stripe
    amount: 0,
    interval: 'month',
    description: 'Community access with basic tools',
    features: ['1 student', '5 core tools', 'Community support', 'IDEA Rights Guide']
  },
  // Monthly Plans
  essential: {
    priceId: 'price_1SAfBF5NUzvJWP8HQzBOdCmq', // LIVE: Essential $59/month
    amount: 59,
    interval: 'month',
    description: 'AI-powered analysis and comprehensive planning tools',
    features: ['1 student', '30+ tools', 'AI analysis', 'IEP Master Suite', 'Letter generator', 'Priority support']
  },
  premium: {
    priceId: 'price_1SAh1k5NUzvJWP8HxzZRqVfH', // LIVE: Premium $199/month (updated pricing)
    amount: 199,
    interval: 'month',
    description: 'Advanced multi-child support with expert features',
    features: ['3 students', '45+ tools', 'Advanced AI', 'Expert analysis', 'Emotion tracking', 'Phone support']
  },
  hero: {
    priceId: 'price_1SAfBG5NUzvJWP8HOW3WQrD4', // LIVE: Hero $249/month
    amount: 249,
    interval: 'month',
    description: 'Complete advocacy platform with matching',
    features: ['Unlimited students', 'ALL 50+ tools', 'Advocate matching', 'White-glove setup', 'Dedicated support'],
    setupFee: 495 // One-time setup fee for Hero Family Pack (includes first month)
  },
  // Annual Plans
  'essential-annual': {
    priceId: 'price_1SAh1k5NUzvJWP8H4q7qWdap', // LIVE: Essential Annual $588/year ($49/month equivalent)
    amount: 588,
    interval: 'year',
    description: 'AI-powered analysis and comprehensive planning tools (Annual)',
    features: ['1 student', '30+ tools', 'AI analysis', 'IEP Master Suite', 'Letter generator', 'Priority support', 'Save $120/year']
  },
  'premium-annual': {
    priceId: 'price_1SAh1k5NUzvJWP8HOSOkLRZP', // LIVE: Premium Annual $1,788/year ($149/month equivalent)
    amount: 1788,
    interval: 'year',
    description: 'Advanced multi-child support with expert features (Annual)',
    features: ['3 students', '45+ tools', 'Advanced AI', 'Expert analysis', 'Emotion tracking', 'Phone support', 'Save $600/year']
  },
  'hero-annual': {
    priceId: 'price_1SAh1l5NUzvJWP8HcO1suNBw', // LIVE: Hero Annual $2,388/year ($199/month equivalent)
    amount: 2388,
    interval: 'year',
    description: 'Complete advocacy platform with matching (Annual)',
    features: ['Unlimited students', 'ALL 50+ tools', 'Advocate matching', 'White-glove setup', 'Dedicated support', 'Save $600/year + $495 setup fee waived']
    // No setupFee for annual - setup fee waived for annual billing
  }
};

// Advocate Plans (3 total with both monthly and annual options)
export const ADVOCATE_STRIPE_PLANS: Record<string, StripePlanConfig> = {
  // Monthly Plans
  starter: {
    priceId: 'price_1SAfBH5NUzvJWP8HgO01WLxu', // LIVE: Advocate Starter $49/month
    amount: 49,
    interval: 'month',
    description: 'Essential tools for solo advocates',
    features: ['1 advocate seat', '12 tools', 'Basic CRM', 'Email support']
  },
  pro: {
    priceId: 'price_1SAtbg5NUzvJWP8HE0yqWnww', // FIXED: Advocate Pro $149/month (actual Stripe price ID)
    amount: 149,
    interval: 'month',
    description: 'AI analysis and professional planning',
    features: ['1 advocate seat', '20+ tools', 'AI analysis', 'Priority support']
  },
  agency: {
    priceId: 'price_1SAfBI5NUzvJWP8HktrpUMlX', // LIVE: Agency $249/month
    amount: 249,
    interval: 'month',
    description: 'Complete advocacy practice solution',
    features: ['3 advocate seats', 'ALL 40+ tools', 'Enterprise features', 'Unlimited AI'],
    setupFee: 495
  },

  // Annual Plans (significant savings vs monthly)
  'starter-annual': {
    priceId: 'price_1SAfBH5NUzvJWP8HegYOY3As', // LIVE: Advocate Starter Annual $468/year
    amount: 468, // $39 * 12 = $468 (save $120/year vs $49*12=$588)
    interval: 'year',
    description: 'Essential tools for solo advocates (Annual)',
    features: ['1 advocate seat', '12 tools', 'Basic CRM', 'Email support', 'Save $120/year']
  },
  'pro-annual': {
    priceId: 'price_1SAtbg5NUzvJWP8He4bMz5EE', // FIXED: Advocate Pro Annual $1,188/year ($99/month equivalent) (actual Stripe price ID)
    amount: 1188, // $99 * 12 = $1,188 (save $600/year vs $149*12=$1,788)
    interval: 'year',
    description: 'AI analysis and professional planning (Annual)',
    features: ['1 advocate seat', '20+ tools', 'AI analysis', 'Priority support', 'Save $600/year']
  },
  'agency-annual': {
    priceId: 'price_1SAfBI5NUzvJWP8HHkLy0ZiT', // LIVE: Advocate Agency Annual $2,388/year
    amount: 2388, // $199 * 12 = $2,388
    interval: 'year',
    description: 'Complete advocacy practice solution (Annual)',
    features: ['3 advocate seats', 'ALL 40+ tools', 'Enterprise features', 'Unlimited AI', 'Save $1,095/year']
    // Note: Setup fee waived for annual ($495 savings + $600 billing savings = $1,095 total)
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
  // For both parent and advocate plans, append -annual if annual billing is selected
  let actualPlanId = planId;
  if (isAnnual && !planId.includes('-annual')) {
    actualPlanId = `${planId}-annual`;
  }
  
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
    'essential-annual': 'Essential Annual',
    'premium-annual': 'Premium Annual',
    'hero-annual': 'Hero Family Pack Annual',
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