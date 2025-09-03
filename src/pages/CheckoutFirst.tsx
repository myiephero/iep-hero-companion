import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  plan: any;
  role: string;
  onClose: () => void;
}

// Combined payment + account creation form
function CheckoutForm({ plan, role, onClose }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Account creation fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Validate account info
    if (!email || !password || !firstName || !lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all account details.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          payment_method_data: {
            billing_details: {
              email: email,
              name: `${firstName} ${lastName}`,
            },
          },
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Payment succeeded, now create the account
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const response = await fetch('/api/create-account-with-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            role,
            planId: plan.id,
            planName: plan.name,
            paymentIntentId: paymentIntent.id,
            stripeCustomerId: (paymentIntent as any).customer,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          toast({
            title: "Account Created Successfully!",
            description: "Check your email for confirmation instructions.",
          });
          
          // Redirect to success page with instructions
          window.location.href = `/account-created?email=${encodeURIComponent(email)}`;
        } else {
          const errorData = await response.json();
          toast({
            title: "Account Creation Failed",
            description: errorData.message || "Please contact support.",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Account Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Must be at least 8 characters long
          </p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Information</h3>
        <PaymentElement />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Create Account & Pay $${plan.price}/month`
          )}
        </Button>
      </div>
    </form>
  );
}

export default function CheckoutFirst({ plan, role, isOpen, onClose }: {
  plan: any;
  role: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const { toast } = useToast();

  const initializeCheckout = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name,
          planId: plan.id,
          role: role,
          amount: plan.price
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error('No payment session created');
      }
    } catch (error: any) {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to initialize checkout",
        variant: "destructive",
      });
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen && plan && !clientSecret) {
      initializeCheckout();
    }
  }, [isOpen, plan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">
              Subscribe to {plan?.name}
            </CardTitle>
            <CardDescription>
              Create your account and complete payment in one step
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm plan={plan} role={role} onClose={onClose} />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
                <p className="text-muted-foreground">Setting up checkout...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}