import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

import { getStripePlanConfig } from '@/lib/stripePricing';

// Helper function to get plan price (uses Stripe pricing configuration)
function getPlanPrice(planId: string | null): string {
  if (!planId) return '0';
  const config = getStripePlanConfig(planId);
  return config ? config.amount.toString() : '0';
}

// Payment form component
function PaymentForm({ planName, price }: { planName: string; price: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/subscription-success',
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong with your payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Complete Subscription - ${price}`
        )}
      </Button>
    </form>
  );
}

export default function SubscriptionSetup() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get subscription details from URL params
  const priceId = searchParams.get('priceId');
  const planName = searchParams.get('planName');
  const planId = searchParams.get('planId');
  const role = searchParams.get('role');

  useEffect(() => {
    const createSubscription = async () => {
      if (!planName || !planId || !role) {
        toast({
          title: "Invalid Subscription",
          description: "Missing subscription details. Please try again.",
          variant: "destructive",
        });
        window.location.href = '/';
        return;
      }

      try {
        // Use subscription endpoint if we have a priceId, otherwise use payment intent
        const endpoint = priceId ? '/api/create-subscription' : '/api/create-payment-intent';
        const requestBody = priceId ? {
          priceId,
          planName,
          planId,
          role
        } : {
          amount: parseInt(getPlanPrice(planId)),
          planName: planName || 'Subscription Plan'
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Authentication Required",
              description: "Please sign in again to complete your subscription.",
              variant: "destructive",
            });
            window.location.href = '/api/login';
            return;
          }
          throw new Error('Failed to create subscription');
        }

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No payment details received');
        }
      } catch (error: any) {
        toast({
          title: "Subscription Error",
          description: error.message || "Failed to set up subscription",
          variant: "destructive",
        });
        // Redirect back to pricing page
        setTimeout(() => {
          window.location.href = '/parent/subscribe';
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    createSubscription();
  }, [priceId, planName, planId, role, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
              <h3 className="font-semibold text-lg mb-2">Setting up your subscription...</h3>
              <p className="text-muted-foreground">Please wait while we prepare your payment.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Subscription Setup Failed</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't set up your subscription. Redirecting you back...
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your Subscription
          </h1>
          <p className="text-lg text-gray-600">
            You're almost done! Complete your payment to activate your {planName} plan.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Payment Details</CardTitle>
            <CardDescription>
              Plan: {planName} • Role: {role?.charAt(0).toUpperCase() + role?.slice(1)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                planName={planName || ''} 
                price={`$${getPlanPrice(planId)}/month`}
              />
            </Elements>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Need help? <a href="mailto:support@myiephero.com" className="underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}