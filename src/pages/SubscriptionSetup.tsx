import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
  console.log('🔥 SubscriptionSetup component loaded!');
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'account' | 'payment'>('account');
  
  // Account creation form state
  const [accountForm, setAccountForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  
  // Get subscription details from URL params
  const priceId = searchParams.get('priceId');
  const planName = searchParams.get('planName');
  const planId = searchParams.get('plan'); // URL uses 'plan' not 'planId'
  const role = searchParams.get('role');

  // Validate params on load
  useEffect(() => {
    if (!planName || !planId || !role) {
      console.error('Missing subscription parameters:', {
        planName: !!planName,
        planId: !!planId, 
        role: !!role
      });
      toast({
        title: "Invalid Subscription",
        description: "Missing subscription details. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, [planName, planId, role, toast]);

  // Handle account creation
  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accountForm.password !== accountForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (accountForm.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setAccountLoading(true);

    try {
      // Create the user account
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: accountForm.firstName,
          lastName: accountForm.lastName,
          email: accountForm.email,
          password: accountForm.password,
          role: role,
          // Include subscription metadata for later processing
          subscriptionMetadata: {
            priceId,
            planName,
            planId,
            role,
            amount: searchParams.get('amount')
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      toast({
        title: "Account Created!",
        description: "Now setting up your payment...",
      });

      // Move to payment step
      setStep('payment');
      
      // Create checkout session for authenticated user
      await createCheckoutSession();
      
    } catch (error: any) {
      toast({
        title: "Account Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAccountLoading(false);
    }
  };

  // Create checkout session after account creation OR activate free plan
  const createCheckoutSession = async () => {
    setIsLoading(true);
    
    try {
      // Check if this is a free plan
      if (planId === 'free' || searchParams.get('amount') === '0') {
        // Free plan - activate account immediately without payment
        toast({
          title: "Account Activated!",
          description: "Welcome to My IEP Hero!",
        });
        
        setTimeout(() => {
          window.location.href = '/parent/dashboard-free';
        }, 2000);
        return;
      }

      // Paid plans - redirect to Stripe checkout
      const endpoint = '/api/create-checkout-session';
      const amount = searchParams.get('amount');
      const setupFee = planId === 'hero' ? 495 : undefined;
      
      const requestBody = {
        priceId,
        planName,
        planId,
        role,
        amount,
        ...(setupFee && { setupFee }),
        mode: priceId ? 'subscription' : 'payment'
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
      setStep('account'); // Go back to account creation
    } finally {
      setIsLoading(false);
    }
  };

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

  // Show account creation form first
  if (step === 'account') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-md">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="p-2 hover:bg-muted"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your Account
            </h1>
            <p className="text-lg text-gray-600">
              First, let's create your {role} account for the {planName} plan.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Account Information</CardTitle>
              <CardDescription>
                Plan: {planName} • Role: {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountCreation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={accountForm.firstName}
                      onChange={(e) => setAccountForm({ ...accountForm, firstName: e.target.value })}
                      required
                      data-testid="input-firstname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={accountForm.lastName}
                      onChange={(e) => setAccountForm({ ...accountForm, lastName: e.target.value })}
                      required
                      data-testid="input-lastname"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={accountForm.password}
                      onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                      required
                      data-testid="input-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={accountForm.confirmPassword}
                      onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                      required
                      data-testid="input-confirm-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={accountLoading}
                  data-testid="button-create-account"
                >
                  {accountLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account & Continue to Payment'
                  )}
                </Button>
              </form>
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

  // Loading state during payment setup
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
              <h3 className="font-semibold text-lg mb-2">Setting up your payment...</h3>
              <p className="text-muted-foreground">Redirecting to checkout...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This should rarely be reached since we redirect to Stripe
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Redirecting to Payment...</h3>
              <p className="text-muted-foreground mb-4">
                If you're not redirected automatically, please try again.
              </p>
              <Button onClick={() => window.location.href = '/pricing'}>
                Back to Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}