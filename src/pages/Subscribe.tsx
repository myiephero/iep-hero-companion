import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Parent pricing tiers (matching ParentPricingPlan.tsx)
const PARENT_PRICING = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '/month',
    description: 'Essential tools to get started',
    features: [
      'Template Library access',
      'Education Hub',
      'Basic IEP tracking',
      'Community support',
      'Mobile app access'
    ],
    icon: <Heart className="h-6 w-6" />,
    gradient: 'from-gray-500 to-gray-600',
    popular: false,
    isFree: true
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 19,
    period: '/month',
    description: 'Adds document management and letters',
    features: [
      'Everything in Free',
      'Intake Vault', 
      'Pre-built Letters',
      'Document storage (2GB)',
      'Email support'
    ],
    icon: <Heart className="h-6 w-6" />,
    gradient: 'from-pink-500 to-rose-600',
    priceId: 'price_parent_basic_1900'
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 29,
    period: '/month',
    description: 'Adds progress tracking and self-service tools',
    features: [
      'Everything in Basic',
      'Progress Tracker',
      'Self-IEP Tools',
      'Goal tracking dashboard',
      'Document storage (5GB)',
      'Priority support'
    ],
    icon: <Star className="h-6 w-6" />,
    gradient: 'from-blue-500 to-indigo-600',
    popular: true,
    priceId: 'price_parent_plus_2900'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49,
    period: '/month',
    description: 'Adds live support and IEP review',
    features: [
      'Everything in Plus',
      'Live Chat support',
      'IEP Review tools',
      'Member discounts',
      'Document storage (10GB)',
      'Advanced analytics'
    ],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-purple-500 to-purple-600',
    priceId: 'price_parent_premium_4900'
  },
  {
    id: 'hero-family-pack',
    name: 'Hero Family Pack',
    price: 495,
    period: '/one-time',
    description: 'Complete advocacy package with expert support',
    features: [
      'Advocate Pairing',
      'Strategy Call included',
      'Document Review service',
      'IEP Meeting support',
      '30-Day Complete Toolbox Access',
      'One-time comprehensive package'
    ],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-amber-500 to-orange-600',
    popular: false,
    isOneTime: true,
    priceId: 'price_parent_hero_49500'
  }
];

// Advocate pricing tiers (matching AdvocatePricingPlan.tsx)
const ADVOCATE_PRICING = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    period: '/month',
    seats: '1 Seat',
    description: 'Essential tools for solo advocates',
    features: [
      'CRM for client management',
      'Letter Generator',
      'Basic document storage',
      'Email support',
      'Standard compliance updates'
    ],
    icon: <Zap className="h-6 w-6" />,
    gradient: 'from-blue-500 to-blue-600',
    priceId: 'price_advocate_starter_4900'
  },
  {
    id: 'pro',
    name: 'Pro', 
    price: 75,
    period: '/month',
    seats: '1 Seat',
    description: 'Adds scheduling and intake capabilities',
    features: [
      'Everything in Starter',
      'Scheduling system',
      'Intake forms',
      'Enhanced CRM features',
      'Priority email support',
      'Advanced reporting'
    ],
    icon: <Star className="h-6 w-6" />,
    gradient: 'from-purple-500 to-purple-600',
    popular: true,
    priceId: 'price_advocate_pro_7500'
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 149,
    period: '/month',
    seats: '2 Seats',
    description: 'Team collaboration with billing tools',
    features: [
      'Everything in Pro',
      'Team CRM access',
      'Billing tools',
      'Shared client management',
      'Team collaboration features',
      'Advanced analytics',
      'Phone support'
    ],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-green-500 to-green-600',
    priceId: 'price_advocate_agency_14900'
  }
];

interface SubscriptionFormProps {
  clientSecret: string;
  planName: string;
  planPrice: number;
  planPeriod: string;
}

function SubscriptionForm({ clientSecret, planName, planPrice, planPeriod }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription-success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Created!",
        description: `You're now subscribed to ${planName}!`,
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        size="lg" 
        className="w-full" 
        disabled={!stripe || !elements || isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Processing...
          </>
        ) : (
          `Subscribe for $${planPrice}${planPeriod}`
        )}
      </Button>
    </form>
  );
}

export default function Subscribe() {
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Detect role from URL path
  const isParent = location.pathname.includes('/parent/');
  const isAdvocate = location.pathname.includes('/advocate/');
  const role = isParent ? 'parent' : isAdvocate ? 'advocate' : 'parent';
  
  // Get pricing based on role
  const pricingTiers = role === 'parent' ? PARENT_PRICING : ADVOCATE_PRICING;
  
  // Auto-select the popular plan if none selected
  useEffect(() => {
    if (!selectedPlan) {
      const popularPlan = pricingTiers.find(p => p.popular) || pricingTiers[0];
      setSelectedPlan(popularPlan);
    }
  }, [pricingTiers, selectedPlan]);

  const handleFreePlan = () => {
    toast({
      title: "Free Plan Selected",
      description: "To get started with the free plan, please sign in first.",
    });
    // Redirect to login for free plan signup
    window.location.href = '/api/login';
  };

  const handleSubscribe = async (plan: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          role: role,
          planId: plan.id
        })
      });
      
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setSelectedPlan(plan);
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error", 
        description: "Failed to initialize subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (clientSecret && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
            <p className="text-gray-600">
              You're subscribing to {selectedPlan.name} for ${selectedPlan.price}{selectedPlan.period}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscriptionForm 
                  clientSecret={clientSecret} 
                  planName={selectedPlan.name}
                  planPrice={selectedPlan.price}
                  planPeriod={selectedPlan.period}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {role === 'parent' ? 'Parent' : 'Advocate'} Subscription Plans
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {role === 'parent' 
              ? 'Choose the perfect plan to advocate effectively for your child\'s educational needs' 
              : 'Select the right tools and features to grow your advocacy practice'
            }
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" 
             style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                tier.popular ? 'ring-2 ring-primary scale-105' : 'hover:scale-102'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${tier.gradient} rounded-2xl mb-4 mx-auto`}>
                  {tier.icon}
                </div>
                <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                {tier.seats && (
                  <div className="text-sm text-muted-foreground">{tier.seats}</div>
                )}
                <CardDescription className="text-muted-foreground mb-4">
                  {tier.description}
                </CardDescription>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => tier.isFree ? handleFreePlan() : handleSubscribe(tier)}
                  size="lg" 
                  className={`w-full ${
                    tier.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : tier.isFree
                      ? 'bg-gray-500 hover:bg-gray-600 text-white'
                      : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Setting up...
                    </>
                  ) : tier.isFree ? (
                    'Get Started Free'
                  ) : tier.isOneTime ? (
                    `One-time Payment $${tier.price}`
                  ) : (
                    `Subscribe to ${tier.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8 text-sm text-gray-500">
          Cancel anytime • 30-day money-back guarantee • Secure payment processing
        </div>
      </div>
    </div>
  );
}