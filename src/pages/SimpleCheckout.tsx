import React, { useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SimpleCheckoutProps {
  plan: any;
  role: string;
  onClose: () => void;
  isOpen: boolean;
}

// Minimal payment form
function PaymentForm({ plan, role, onClose }: { plan: any; role: string; onClose: () => void }) {
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
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Processing...' : `Pay $${plan.price}`}
        </Button>
      </div>
    </form>
  );
}

export default function SimpleCheckout({ plan, role, onClose, isOpen }: SimpleCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const { toast } = useToast();

  const initializePayment = async () => {
    try {
      // First try to create subscription intent (works for both authenticated and non-authenticated users)
      const response = await fetch('/api/create-subscription-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name,
          planId: plan.id,
          role: role
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription intent');
      }

      const data = await response.json();
      
      // If user needs to authenticate first
      if (data.requiresAuth) {
        toast({
          title: "Sign In Required",
          description: "Redirecting you to sign in to complete your subscription...",
        });
        // Redirect to login, which will handle the subscription after auth
        window.location.href = data.loginUrl;
        return;
      }

      // If user is already authenticated, we should get a client secret
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error('No payment client secret received');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
      onClose();
    }
  };

  // Initialize payment when dialog opens
  React.useEffect(() => {
    if (isOpen && plan && !clientSecret) {
      initializePayment();
    }
  }, [isOpen, plan]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to {plan?.name}</DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              ${plan?.price}/{plan?.period?.replace('/', '')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm plan={plan} role={role} onClose={onClose} />
              </Elements>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Setting up payment...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}