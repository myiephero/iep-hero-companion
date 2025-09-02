import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Star, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Pricing configuration
const PRICING = {
  monthly: {
    amount: 29.99,
    priceId: 'price_monthly_2999', // Replace with your actual Stripe price ID
    period: 'month'
  },
  annual: {
    amount: 299.99,
    priceId: 'price_annual_29999', // Replace with your actual Stripe price ID
    period: 'year',
    savings: 60 // Percentage savings vs monthly
  }
};

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
  const [isAnnual, setIsAnnual] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentPlan = isAnnual ? PRICING.annual : PRICING.monthly;
  const billingPeriod = isAnnual ? 'annual' : 'monthly';

  const features = [
    "Unlimited IEP document analysis",
    "AI-powered compliance checking", 
    "Professional advocacy matching",
    "Document vault & organization",
    "Meeting preparation tools",
    "Progress tracking & analytics",
    "Email support",
    "Mobile app access"
  ];

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: currentPlan.priceId,
          billingPeriod
        })
      });
      
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
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