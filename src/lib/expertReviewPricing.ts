// Expert Review Products Configuration for Stripe
// These are one-time payment products, not subscriptions

export interface ExpertReviewProduct {
  priceId: string; // Stripe price ID
  productId: string; // Stripe product ID  
  amount: number; // Amount in dollars
  name: string;
  description: string;
  timeframe: string;
  features: string[];
}

// Expert Review Products (created in Stripe)
export const EXPERT_REVIEW_PRODUCTS: Record<string, ExpertReviewProduct> = {
  comprehensive: {
    priceId: 'price_1S5WZS8iKZXV0srZZdMYHgQS',
    productId: 'prod_T1ZifwG5XURI4i',
    amount: 150,
    name: 'IEP Comprehensive Expert Review',
    description: 'Complete IEP analysis covering goals, services, accommodations, and legal compliance',
    timeframe: '24-48 hours',
    features: [
      'Full goal analysis',
      'Service recommendations', 
      'Accommodation review',
      'Legal compliance check',
      'Progress monitoring plan',
      'Meeting preparation guide'
    ]
  },
  focused: {
    priceId: 'price_1S5WZS8iKZXV0srZPOr0AG5k',
    productId: 'prod_T1ZiPlV4NZQOEZ',
    amount: 75,
    name: 'IEP Focused Expert Review',
    description: 'Targeted review of specific areas of concern',
    timeframe: '24 hours',
    features: [
      'Specific goal areas',
      'Targeted recommendations',
      'Priority action items', 
      'Key compliance issues'
    ]
  },
  compliance: {
    priceId: 'price_1S5WZT8iKZXV0srZGq84lghp',
    productId: 'prod_T1Zi6S4CjWZxTN', 
    amount: 50,
    name: 'IEP Compliance Check',
    description: 'Legal compliance and procedural requirements review',
    timeframe: '12-24 hours',
    features: [
      'IDEA compliance check',
      'Procedural safeguards review',
      'Documentation analysis',
      'Rights protection'
    ]
  }
};

// Helper function to get product config by ID
export function getExpertReviewProduct(productId: string): ExpertReviewProduct | null {
  return EXPERT_REVIEW_PRODUCTS[productId] || null;
}

// Helper function to create Stripe checkout session URL
export function getExpertReviewCheckoutUrl(productId: string, metadata?: Record<string, string>): string {
  const product = getExpertReviewProduct(productId);
  if (!product) {
    throw new Error(`Unknown expert review product: ${productId}`);
  }

  // Create URL parameters for checkout
  const params = new URLSearchParams({
    product: productId,
    priceId: product.priceId,
    amount: product.amount.toString(),
    type: 'expert-review',
    ...metadata
  });

  return `/expert-review-checkout?${params.toString()}`;
}

// Validation function
export function validateExpertReviewPricing(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  Object.entries(EXPERT_REVIEW_PRODUCTS).forEach(([productId, config]) => {
    if (!config.priceId || !config.priceId.startsWith('price_')) {
      missing.push(`${productId}.priceId`);
    }
    if (!config.productId || !config.productId.startsWith('prod_')) {
      missing.push(`${productId}.productId`);
    }
  });

  return {
    valid: missing.length === 0,
    missing
  };
}