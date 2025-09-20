// Script to create Expert Review products in Stripe
// Run with: node scripts/create-expert-review-products.js

import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const expertReviewProducts = [
  {
    name: 'IEP Comprehensive Expert Review',
    description: 'Complete IEP analysis covering goals, services, accommodations, and legal compliance by certified special education experts. Includes full goal analysis, service recommendations, accommodation review, legal compliance check, progress monitoring plan, and meeting preparation guide.',
    unitAmount: 15000, // $150.00 in cents
    currency: 'usd',
    metadata: {
      type: 'expert-review',
      category: 'comprehensive',
      delivery_time: '24-48 hours',
      features: 'Full goal analysis,Service recommendations,Accommodation review,Legal compliance check,Progress monitoring plan,Meeting preparation guide'
    }
  },
  {
    name: 'IEP Focused Expert Review',
    description: 'Targeted review of specific areas of concern by certified special education experts. Includes analysis of specific goal areas, targeted recommendations, priority action items, and key compliance issues.',
    unitAmount: 7500, // $75.00 in cents
    currency: 'usd',
    metadata: {
      type: 'expert-review',
      category: 'focused',
      delivery_time: '24 hours',
      features: 'Specific goal areas,Targeted recommendations,Priority action items,Key compliance issues'
    }
  },
  {
    name: 'IEP Compliance Check',
    description: 'Legal compliance and procedural requirements review by certified special education experts. Includes IDEA compliance check, procedural safeguards review, documentation analysis, and rights protection.',
    unitAmount: 5000, // $50.00 in cents
    currency: 'usd',
    metadata: {
      type: 'expert-review',
      category: 'compliance',
      delivery_time: '12-24 hours',
      features: 'IDEA compliance check,Procedural safeguards review,Documentation analysis,Rights protection'
    }
  }
];

async function createExpertReviewProducts() {
  console.log('🚀 Creating Expert Review products in Stripe...');
  
  const createdProducts = [];
  
  for (const productData of expertReviewProducts) {
    try {
      // Create the product
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: productData.metadata,
        type: 'service' // One-time service, not recurring
      });
      
      console.log(`✅ Created product: ${product.name} (ID: ${product.id})`);
      
      // Create the price for this product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: productData.unitAmount,
        currency: productData.currency,
        metadata: productData.metadata
      });
      
      console.log(`✅ Created price: $${productData.unitAmount / 100} (ID: ${price.id})`);
      
      createdProducts.push({
        category: productData.metadata.category,
        productId: product.id,
        priceId: price.id,
        amount: productData.unitAmount / 100,
        name: productData.name
      });
      
    } catch (error) {
      console.error(`❌ Error creating ${productData.name}:`, error.message);
    }
  }
  
  console.log('\n📋 Summary of created products:');
  console.log('Copy these IDs to your code configuration:\n');
  
  createdProducts.forEach(product => {
    console.log(`${product.category.toUpperCase()}_REVIEW:`);
    console.log(`  priceId: '${product.priceId}'`);
    console.log(`  productId: '${product.productId}'`);
    console.log(`  amount: ${product.amount}`);
    console.log(`  name: '${product.name}'`);
    console.log('');
  });
  
  return createdProducts;
}

// Run the script
createExpertReviewProducts()
  .then((products) => {
    console.log(`🎉 Successfully created ${products.length} Expert Review products!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create products:', error);
    process.exit(1);
  });