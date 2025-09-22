// Script to create new Stripe prices for updated Pro plan pricing
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

async function createNewProPricing() {
  try {
    console.log('🔧 Creating new Stripe prices for Pro plan...');
    
    // Create Pro Monthly at $149/month
    console.log('Creating Pro Monthly at $149/month...');
    const proMonthly = await stripe.prices.create({
      unit_amount: 14900, // $149.00 in cents
      currency: 'usd',
      recurring: { 
        interval: 'month',
        interval_count: 1 
      },
      product_data: {
        name: 'Advocate Pro Monthly Plan',
      },
      nickname: 'Pro Monthly - $149/month',
      metadata: {
        plan_type: 'advocate_pro_monthly',
        updated_pricing: 'true'
      }
    });
    
    console.log(`✅ Pro Monthly created: ${proMonthly.id} - $149/month`);
    
    // Create Pro Annual at $1,188/year ($99/month equivalent)
    console.log('Creating Pro Annual at $1,188/year...');
    const proAnnual = await stripe.prices.create({
      unit_amount: 118800, // $1,188.00 in cents
      currency: 'usd',
      recurring: { 
        interval: 'year',
        interval_count: 1 
      },
      product_data: {
        name: 'Advocate Pro Annual Plan',
      },
      nickname: 'Pro Annual - $1,188/year ($99/month equivalent)',
      metadata: {
        plan_type: 'advocate_pro_annual',
        monthly_equivalent: '99',
        annual_savings: '600', // $149*12 - $1188 = $1788 - $1188 = $600
        updated_pricing: 'true'
      }
    });
    
    console.log(`✅ Pro Annual created: ${proAnnual.id} - $1,188/year`);
    
    console.log('\n📋 New Pro Plan Price Summary:');
    console.log(`Monthly: ${proMonthly.id} - $149/month`);
    console.log(`Annual:  ${proAnnual.id} - $1,188/year ($99/month equivalent)`);
    console.log(`Annual Savings: $600/year vs monthly billing`);
    
    console.log('\n🔄 Next: Update src/lib/stripePricing.ts with these new price IDs');
    
    return {
      monthly: proMonthly.id,
      annual: proAnnual.id
    };
    
  } catch (error) {
    console.error('❌ Error creating Stripe prices:', error.message);
    throw error;
  }
}

// Run the script
createNewProPricing()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));