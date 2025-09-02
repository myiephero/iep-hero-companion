import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Star, Zap, Crown, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Parent pricing tiers (matching ParentPricingPlan.tsx)
const PARENT_PRICING = [
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
  billingPeriod: 'monthly' | 'annual';
}

function SubscriptionForm({ clientSecret, billingPeriod }: SubscriptionFormProps) {
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
        description: `You're now subscribed to IEP Hero ${billingPeriod} plan!`,
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Processing...' : `Subscribe ${billingPeriod === 'annual' ? 'Annually' : 'Monthly'}`}
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

  if (clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
            <p className="text-gray-600">
              You're subscribing to the {billingPeriod} plan for ${currentPlan.amount}/{currentPlan.period}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscriptionForm clientSecret={clientSecret} billingPeriod={billingPeriod} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your IEP Hero Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get unlimited access to professional IEP advocacy tools
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Label htmlFor="billing-toggle" className="text-base">Monthly</Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle" className="text-base">
              Annual 
              {PRICING.annual.savings && (
                <Badge variant="secondary" className="ml-2">
                  Save {PRICING.annual.savings}%
                </Badge>
              )}
            </Label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card className="relative border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Free Trial</CardTitle>
              <CardDescription>Try IEP Hero for free</CardDescription>
              <div className="text-3xl font-bold">
                $0<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>3 document analyses</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Basic document vault</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Community support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-primary shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                <Star className="h-4 w-4 mr-1" />
                Recommended
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">IEP Hero Pro</CardTitle>
              <CardDescription>Full access to all features</CardDescription>
              <div className="text-3xl font-bold">
                ${currentPlan.amount}
                <span className="text-lg font-normal text-gray-600">/{currentPlan.period}</span>
              </div>
              {isAnnual && (
                <p className="text-sm text-green-600 font-medium">
                  Save ${((PRICING.monthly.amount * 12) - PRICING.annual.amount).toFixed(2)} vs monthly
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start {billingPeriod === 'annual' ? 'Annual' : 'Monthly'} Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            No contracts. Cancel anytime. 30-day money-back guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}