import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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
        console.error('❌ Stripe payment error:', error);
        
        // Enhanced error handling for different payment failure types
        let errorTitle = "Payment Failed";
        let errorDescription = error.message || "Your payment could not be processed";
        
        if (error.code === 'card_declined') {
          errorTitle = "Card Declined";
          errorDescription = "Your card was declined. Please try a different card or contact your bank.";
        } else if (error.code === 'insufficient_funds') {
          errorTitle = "Insufficient Funds";
          errorDescription = "Your card has insufficient funds. Please try a different card.";
        } else if (error.code === 'expired_card') {
          errorTitle = "Card Expired";
          errorDescription = "Your card has expired. Please use a different card.";
        } else if (error.code === 'incorrect_cvc') {
          errorTitle = "Invalid Security Code";
          errorDescription = "The security code you entered is incorrect. Please check and try again.";
        } else if (error.code === 'processing_error') {
          errorTitle = "Processing Error";
          errorDescription = "We encountered an error processing your payment. Please try again.";
        }

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });

        // Log the specific error for debugging
        console.log('🔍 Payment error details:', {
          code: error.code,
          type: error.type,
          message: error.message,
          decline_code: error.decline_code
        });
      }
    } catch (err) {
      console.error('❌ Payment processing error:', err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again or contact support.",
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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

  // Validate params and handle existing users
  useEffect(() => {
    console.log('🔍 Subscription Setup Validation:', {
      planName,
      planId,
      role,
      priceId,
      amount: searchParams.get('amount'),
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    console.log('🔍 AUTH VALIDATION:', {
      timestamp: Date.now(),
      hasToken: !!localStorage.getItem('authToken'),
      hasUser: !!user,
      isConsistent: isAuthenticated,
      tokenFormat: localStorage.getItem('authToken')?.substring(0, 3) === 'mfe' || localStorage.getItem('authToken')?.substring(0, 3) === 'mf7' ? 'valid' : 'invalid'
    });
    
    if (!planId || !role) {
      console.error('Missing REQUIRED subscription parameters:', {
        planName: !!planName,
        planId: !!planId, 
        role: !!role,
        actualValues: { planName, planId, role }
      });
      toast({
        title: "Invalid Subscription",
        description: "Missing subscription details. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate('/');
      }, 3000);
      return;
    }
    
    // If user is already authenticated, skip account creation and go to payment
    if (isAuthenticated && user && !authLoading) {
      console.log('✅ SubscriptionSetup: User already logged in, skipping account creation:', user.email);
      
      // Pre-populate form with existing user data
      setAccountForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });
      
      // Skip account creation, go directly to checkout
      console.log('🚀 SubscriptionSetup: Existing user upgrading, creating checkout session...');
      createCheckoutSession();
    }
  }, [planName, planId, role, priceId, toast, searchParams, isAuthenticated, user, authLoading]);

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
      const response = await fetch('/api/create-account', {
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
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to create account');
      }

      const result = await response.json();
      console.log('Account creation result:', result);

      toast({
        title: "Account Created!",
        description: "Now setting up your payment...",
      });

      // Move to payment step
      setStep('payment');
      
      // Create checkout session for authenticated user
      await createCheckoutSession();
      
    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Account Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAccountLoading(false);
    }
  };

  // Create checkout session for existing user upgrade OR activate free plan
  const createCheckoutSession = async () => {
    setIsLoading(true);
    
    try {
      // Check if this is a free plan
      if (planId === 'free' || searchParams.get('amount') === '0') {
        // Free plan - handle differently for existing vs new users
        if (isAuthenticated && user) {
          toast({
            title: "Plan Updated!",
            description: "Your account has been updated to the free plan.",
          });
          
          setTimeout(() => {
            navigate('/parent/dashboard-free'); // Navigate to correct dashboard
          }, 2000);
        } else {
          // New user - go to confirmation page
          toast({
            title: "Account Created!",
            description: "Check your email to complete setup...",
          });
          
          setTimeout(() => {
            navigate('/subscription-success?plan=free&role=parent');
          }, 2000);
        }
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
        mode: priceId ? 'subscription' : 'payment',
        // Include existing user info if upgrading
        ...(isAuthenticated && user && { existingUserId: user.id })
      };

      console.log('🔍 CHECKOUT REQUEST BODY:', requestBody);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(isAuthenticated && { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` })
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('Checkout session result:', data);
      
      if (data.url) {
        // Show upgrade message for existing users
        if (isAuthenticated && user) {
          toast({
            title: "Upgrading Account!",
            description: `Upgrading ${user.email} to ${planName} plan...`,
          });
        }
        
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error: any) {
      console.error('Checkout session error:', error);
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
      // Only go back to account creation for new users
      if (!isAuthenticated) {
        setStep('account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is being checked or payment is being processed
  if (authLoading || isLoading) {
    const message = authLoading 
      ? "Checking your account status..." 
      : "Setting up your subscription...";
    const submessage = authLoading 
      ? "Please wait while we verify your login status." 
      : "Please wait while we prepare your payment.";
      
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
              <h3 className="font-semibold text-lg mb-2">{message}</h3>
              <p className="text-muted-foreground">{submessage}</p>
              {isAuthenticated && user && (
                <p className="text-sm text-muted-foreground mt-2">
                  Upgrading account for {user.email}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Remove clientSecret check since we're using account-first flow

  // Show account creation form first
  if (step === 'account') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-md">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
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
              <Button onClick={() => navigate('/pricing')}>
                Back to Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}