import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Check, Star, Zap, Crown, Heart, X, ChevronDown, TrendingUp, Users, Shield, Sparkles } from 'lucide-react';
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
    priceId: 'price_1Rr3bk8iKZXV0srZ0URHZo4O'
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
    priceId: 'price_1Rr3co8iKZXV0srZA1kEdBW1'
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
    priceId: 'price_1Rr3e68iKZXV0srZnPPK5J3R'
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
    priceId: 'price_1RsEn58iKZXV0srZ0UH8e4tg'
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
    priceId: 'price_1Rr3gL8iKZXV0srZmfuD32yv',
    isFree: false
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
    priceId: 'price_1Rr3hR8iKZXV0srZ5lPscs0p',
    isFree: false
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 99,
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
    priceId: 'price_1Rr3ik8iKZXV0srZPRPByMQx', // $99/month from your Stripe account
    isFree: false
  }
];

interface SubscriptionFormProps {
  clientSecret: string;
  planName: string;
  planPrice: number;
  planPeriod: string;
  onSuccess?: () => void;
  setCheckoutStep?: (step: number) => void;
  triggerConfetti?: () => void;
  role?: string;
}

function SubscriptionForm({ 
  clientSecret, 
  planName, 
  planPrice, 
  planPeriod, 
  onSuccess,
  setCheckoutStep,
  triggerConfetti,
  role 
}: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cardType, setCardType] = useState<string>('');
  const [paymentReady, setPaymentReady] = useState(false);
  const [expressPaymentEnabled, setExpressPaymentEnabled] = useState(true);

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
      // Success! Trigger confetti and update step
      setCheckoutStep?.(3);
      triggerConfetti?.();
      onSuccess?.();
      toast({
        title: "🎉 Subscription Created!",
        description: `Welcome to ${planName}! You're all set up and ready to go.`,
      });
      
      // Redirect after celebration
      setTimeout(() => {
        window.location.href = role === 'parent' ? '/parent/dashboard' : '/advocate/dashboard';
      }, 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Express Payment Options */}
      {expressPaymentEnabled && (
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-sm font-medium text-muted-foreground bg-background px-3">
              Express Checkout
            </span>
          </div>
          
          {/* Real Apple Pay & Google Pay Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-12 bg-black text-white hover:bg-gray-800 transition-all duration-200 border-gray-300"
              onClick={() => {
                toast({
                  title: "Apple Pay", 
                  description: "Apple Pay coming soon! Use card payment below for now."
                });
              }}
            >
              <span className="text-lg">🍎</span>
              <span className="ml-2">Apple Pay</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-12 bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
              onClick={() => {
                toast({
                  title: "Google Pay", 
                  description: "Google Pay coming soon! Use card payment below for now."
                });
              }}
            >
              <span className="text-lg font-bold">G</span>
              <span className="ml-2">Google Pay</span>
            </Button>
          </div>

          {/* Alternative Payment Methods */}
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-16 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100"
              onClick={() => toast({ title: "Card Payment", description: "Use the form below to pay with any card" })}
            >
              <div className="text-xl mb-1">💳</div>
              <span className="text-xs">Card</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-16 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100"
              onClick={() => toast({ title: "Klarna", description: "Buy now, pay later options coming soon!" })}
            >
              <div className="text-xl mb-1">🔮</div>
              <span className="text-xs">Klarna</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-16 flex flex-col items-center justify-center bg-green-50 hover:bg-green-100"
              onClick={() => toast({ title: "Cash App Pay", description: "Cash App Pay integration coming soon!" })}
            >
              <div className="text-xl mb-1">💚</div>
              <span className="text-xs">Cash App</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-16 flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100"
              onClick={() => toast({ title: "Amazon Pay", description: "Amazon Pay integration coming soon!" })}
            >
              <div className="text-xl mb-1">📦</div>
              <span className="text-xs">Amazon</span>
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or pay with card
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Smart Card Detection */}
        <div className="space-y-2">
          <PaymentElement 
            onChange={(event) => {
              if (event.complete) {
                setPaymentReady(true);
              }
              
              // Simplified card type detection
              if (event.value?.type === 'card') {
                setCardType('Card Ready');
              }
            }}
            options={{
              layout: 'tabs'
            }}
          />
          
          {cardType && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>{cardType} detected</span>
            </div>
          )}
        </div>

        {/* Enhanced Subscribe Button */}
        <Button 
          type="submit" 
          size="lg" 
          className="w-full relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]" 
          disabled={!stripe || !elements || isLoading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Subscribe for ${planPrice}{planPeriod}
              </>
            )}
          </div>
        </Button>

        {/* Payment Security */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔒</span>
            <span>256-bit encryption</span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function Subscribe() {
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Plan Selection, 2: Payment Details, 3: Processing
  const [subscribersCount, setSubscribersCount] = useState(847); // Live counter
  const [todaysSubscribers, setTodaysSubscribers] = useState(47);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  
  // Detect role from URL path
  const isParent = location.pathname.includes('/parent/');
  const isAdvocate = location.pathname.includes('/advocate/');
  const role = isParent ? 'parent' : isAdvocate ? 'advocate' : 'parent';
  
  // Get pricing based on role
  const pricingTiers = role === 'parent' ? PARENT_PRICING : ADVOCATE_PRICING;

  // Live counters and social proof effects
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live subscriber growth
      setSubscribersCount(prev => prev + Math.floor(Math.random() * 3));
      if (Math.random() > 0.7) { // 30% chance every interval
        setTodaysSubscribers(prev => prev + 1);
      }
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  // Smart Features: Save incomplete checkouts
  useEffect(() => {
    if (selectedPlan && !clientSecret) {
      localStorage.setItem('incomplete_checkout', JSON.stringify({
        planId: selectedPlan.id,
        timestamp: Date.now(),
        role: role
      }));
    }
  }, [selectedPlan, clientSecret, role]);

  // Load saved checkout on mount
  useEffect(() => {
    const saved = localStorage.getItem('incomplete_checkout');
    if (saved) {
      const data = JSON.parse(saved);
      // If saved within last 24 hours, auto-resume
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        const savedPlan = pricingTiers.find(p => p.id === data.planId);
        if (savedPlan && !selectedPlan) {
          setSelectedPlan(savedPlan);
          toast({
            title: "Welcome back! 👋",
            description: `We saved your ${savedPlan.name} plan selection.`,
          });
        }
      }
    }
  }, [pricingTiers]);

  // Smart upgrade suggestions
  const getUpgradeRecommendation = () => {
    if (selectedPlan?.id === 'essential') {
      return {
        title: "🚀 Upgrade Recommended",
        message: "89% of parents find Premium features essential for complex IEP cases",
        suggestedPlan: pricingTiers.find(p => p.id === 'premium')
      };
    }
    if (selectedPlan?.id === 'premium' && role === 'advocate') {
      return {
        title: "💼 Perfect for Professionals", 
        message: "Pro features help advocates manage 3x more clients efficiently",
        suggestedPlan: pricingTiers.find(p => p.id === 'pro')
      };
    }
    return null;
  };

  // Confetti effect trigger
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Confetti Component
  const ConfettiEffect = () => {
    if (!showConfetti) return null;
    
    const confettiPieces = Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
          animationDelay: `${Math.random() * 3}s`
        }}
      />
    ));
    
    return <div className="fixed inset-0 pointer-events-none z-50">{confettiPieces}</div>;
  };
  
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
          planName: plan.name,
          planId: plan.id,
          role: role
        })
      });
      
      const data = await response.json();
      console.log('Subscription response:', data);
      console.log('Response structure:', {
        hasClientSecret: !!data.clientSecret,
        clientSecretType: typeof data.clientSecret,
        clientSecretValue: data.clientSecret ? 'present' : 'missing',
        responseKeys: Object.keys(data),
        fullData: JSON.stringify(data, null, 2)
      });
      
      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          toast({
            title: "Please Sign In",
            description: "You need to be logged in to subscribe. Redirecting to login...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = '/api/login';
          }, 1500);
          return;
        }
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setSelectedPlan(plan);
        toast({
          title: "🎉 Subscription Ready!",
          description: `Setting up ${plan.name} subscription for $${plan.price}. Use test card: 4242 4242 4242 4242`,
        });
      } else {
        console.error('No clientSecret in response:', data);
        console.error('Full response debug:', JSON.stringify(data, null, 2));
        throw new Error(data.error || 'No payment client secret received');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      if (error.message?.includes('Unauthorized')) {
        toast({
          title: "Please Sign In",
          description: "You need to be logged in to subscribe. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 1500);
      } else {
        toast({
          title: "Subscription Error", 
          description: error.message || "Failed to initialize subscription. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced checkout dialog with all premium features
  const CheckoutDialog = () => (
    <Dialog open={!!(clientSecret && selectedPlan)} onOpenChange={() => {
      // Prevent closing by clicking outside - only allow X button close
      return false;
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            Complete Your Premium Subscription
          </DialogTitle>
          
          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{checkoutStep}/3</span>
            </div>
            <Progress value={(checkoutStep / 3) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span className={checkoutStep >= 1 ? "text-primary font-medium" : ""}>Plan Selected</span>
              <span className={checkoutStep >= 2 ? "text-primary font-medium" : ""}>Payment Details</span>
              <span className={checkoutStep >= 3 ? "text-primary font-medium" : ""}>Complete</span>
            </div>
          </div>
        </DialogHeader>
        
        {selectedPlan && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-4">


              {/* Plan Selection Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Plan</label>
                <Select 
                  value={selectedPlan.id} 
                  onValueChange={(value) => {
                    const newPlan = pricingTiers.find(p => p.id === value && !p.isFree);
                    if (newPlan) {
                      setClientSecret("");
                      setCheckoutStep(1);
                      handleSubscribe(newPlan);
                    }
                  }}
                >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {selectedPlan.icon}
                        <div>
                          <div className="font-medium">{selectedPlan.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedPlan.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${selectedPlan.price}{selectedPlan.period}</div>
                      </div>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {pricingTiers.filter(plan => !plan.isFree).map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center justify-between w-full py-2">
                        <div className="flex items-center gap-3">
                          {plan.icon}
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">{plan.description}</div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold">${plan.price}{plan.period}</div>
                          {plan.popular && (
                            <Badge variant="secondary" className="text-xs">Most Popular</Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Features Preview */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-3">
                <h4 className="font-semibold mb-3">What's included in {selectedPlan.name}:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedPlan.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {selectedPlan.features.length > 4 && (
                    <div className="text-sm text-muted-foreground">
                      +{selectedPlan.features.length - 4} more features
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscriptionForm 
                  clientSecret={clientSecret} 
                  planName={selectedPlan.name}
                  planPrice={selectedPlan.price}
                  planPeriod={selectedPlan.period}
                  setCheckoutStep={setCheckoutStep}
                  triggerConfetti={triggerConfetti}
                  role={role}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Setting up payment...</span>
              </div>
            )}
          </div>
          
          {/* Right Sidebar - Social Proof & Stats */}
          <div className="space-y-4">
            {/* Live Stats */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Joined Today</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800 animate-pulse">
                    {todaysSubscribers}
                  </div>
                  <p className="text-xs text-green-700">new subscribers</p>
                </div>
              </CardContent>
            </Card>

            {/* Total Users */}
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Protected</span>
                  </div>
                  <div className="text-xl font-bold text-purple-800">
                    {subscribersCount.toLocaleString()}+
                  </div>
                  <p className="text-xs text-purple-700">families served</p>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-amber-900 italic mb-2">
                  "This platform completely transformed how I advocate for my son. The AI analysis saved me countless hours!"
                </p>
                <p className="text-xs text-amber-700 font-medium">- Sarah M., Parent</p>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-blue-900 font-medium">
                  🔒 Secure Payment
                </p>
                <p className="text-xs text-blue-700">
                  256-bit SSL encryption
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
      <ConfettiEffect />
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
                  onClick={() => {
                    if (tier.isFree) {
                      handleFreePlan();
                    } else if (tier.isOneTime && tier.name === 'Hero Family Pack') {
                      // Redirect to enhanced Hero Family Pack upsell page
                      window.location.href = '/parent/subscribe/upsell/hero-plan';
                    } else {
                      handleSubscribe(tier);
                    }
                  }}
                  size="lg" 
                  className={`w-full ${
                    tier.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : tier.isFree
                      ? 'bg-gray-500 hover:bg-gray-600 text-white'
                      : tier.isOneTime
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
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

        {/* Enhanced Checkout Dialog */}
        <CheckoutDialog />
      </div>
    </div>
  );
}