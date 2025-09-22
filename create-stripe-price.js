// Quick script to create the correct Stripe price for Pro Annual
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

async function createProAnnualPrice() {
  try {
    console.log('🔧 Creating Stripe price for Pro Annual at $900/year...');
    
    const price = await stripe.prices.create({
      unit_amount: 90000, // $900.00 in cents
      currency: 'usd',
      recurring: { 
        interval: 'year',
        interval_count: 1 
      },
      product_data: {
        name: 'Advocate Pro Annual Plan',
      },
      nickname: 'Pro Annual - $900/year',
      metadata: {
        plan_type: 'advocate_pro_annual',
        original_monthly_price: '99',
        annual_savings: '288'
      }
    });
    
    console.log(`✅ SUCCESS! Created Stripe price: ${price.id}`);
    console.log(`📋 Price details:`, {
      id: price.id,
      amount: price.unit_amount / 100,
      currency: price.currency,
      interval: price.recurring.interval,
      nickname: price.nickname
    });
    
    console.log('\n🔄 Next step: Update src/lib/stripePricing.ts');
    console.log(`Replace 'pro-annual' priceId with: ${price.id}`);
    
    return price.id;
    
  } catch (error) {
    console.error('❌ Error creating Stripe price:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.log('💡 This might be a duplicate or configuration issue in Stripe Dashboard');
    }
    throw error;
  }
}

// Run the script
createProAnnualPrice()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));