import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCheckoutUrl } from '@/lib/stripePricing';
// REMOVED CheckoutFirst - using unified checkout flow via SubscriptionSetup

// Parent pricing tiers
const PARENT_PRICING = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '/month',
    description: 'Try the basics with 1 student',
    toolCount: '3 Essential Tools',
    features: [
      '1 Student Profile',
      'IDEA Rights Guide',
      'FERPA Overview', 
      'Timeline Calculator',
      'Smart Letter Generator (2/month)',
      'Community forum support',
      '5 Documents max'
    ],
    limitations: [
      'No AI analysis',
      'No document vault', 
      'Limited letter templates'
    ],
    icon: <Heart className="h-6 w-6" />,
    gradient: 'from-gray-500 to-gray-600',
    popular: false,
    isFree: true
  },
  {
    id: 'essential',
    name: 'Essential',
    price: 59,
    period: '/month',
    description: 'AI-powered analysis and comprehensive tools',
    toolCount: '25+ Tools + AI',
    features: [
      'Everything in Free',
      '1 Student profile',
      'AI Insights & Analytics',
      'Progress Analytics dashboard',
      'Unified IEP Review with AI',
      'Ask AI About Documents',
      'Parent Messages system',
      'Communication Tracker',
      'Accommodation Builder',
      '504 Plan Builder',
      'Goal Generator (AI)',
      'Emotion Trackers',
      'Advocate Matching',
      'Priority email support (5GB)'
    ],
    limitations: [
      'Limited to 1 child',
      'No expert support',
      'Basic specialization tools'
    ],
    icon: <Star className="h-6 w-6" />,
    gradient: 'from-blue-500 to-indigo-600',
    popular: true,
    priceId: 'price_essential_59_monthly'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199,
    period: '/month',
    description: 'Multi-child families with expert support',
    toolCount: '35+ Professional Tools',
    features: [
      'Everything in Essential',
      '3 Student profiles',
      'Expert Analysis tools',
      'Specialized Autism tools',
      'Gifted/2E specialized support',
      'Advanced behavioral tools',
      'Crisis intervention planning',
      'Professional behavioral support',
      'Advanced data analytics',
      'Custom letter builder',
      'Priority phone support (25GB)',
      'Advanced report generation'
    ],
    limitations: [
      'No unlimited access',
      'No white-glove service'
    ],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-purple-500 to-purple-600',
    priceId: 'price_premium_199_monthly'
  },
  {
    id: 'hero',
    name: 'Hero',
    price: 249,
    period: '/month',
    description: 'Ultimate tier with unlimited access',
    toolCount: 'ALL 50+ Tools + Services',
    features: [
      'Everything in Premium',
      'Unlimited student profiles',
      'White-glove onboarding',
      'Advocate matching & pairing',
      'Crisis support hotline',
      'Dedicated success manager',
      'Unlimited AI & storage',
      'Priority everything'
    ],
    limitations: [],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-orange-500 to-red-600',
    popular: false,
    priceId: 'price_hero_249_monthly'
  },
  {
    id: 'hero-family',
    name: 'Hero Family Pack',
    price: 199,
    period: '/month',
    seats: 'Multiple Children',
    description: 'Complete platform + professional services',
    toolCount: 'ALL 50+ Tools + Services',
    features: [
      'Everything in Premium',
      'ALL 50+ specialized tools',
      'Unlimited student profiles',
      'Professional advocate services',
      'Monthly expert consultations',
      'Crisis support hotline',
      'Custom tool development',
      'White-glove onboarding',
      'Dedicated family success manager',
      'Unlimited document storage',
      'Priority everything'
    ],
    limitations: [],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-amber-500 to-orange-600',
    priceId: 'price_1Rr3ew8iKZXV0srZQBFTZx7C'
  }
];

// Advocate pricing tiers
const ADVOCATE_PRICING = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    period: '/month',
    seats: '1 Seat',
    description: 'Essential tools for solo advocates',
    toolCount: '12 Core Professional Tools',
    features: [
      '1 Advocate seat',
      'Client Management CRM',
      'Unified IEP Review',
      'Smart Letter Generator',
      'Document Management',
      'Communication Tracker',
      'Progress Notes & Service Log',
      'Case Timeline Management',
      'Rights Explainer tools',
      'Professional Standards access',
      'Basic document storage (5GB)',
      'Email support',
      'Standard compliance updates'
    ],
    limitations: [
      'No AI analysis tools',
      'No team collaboration',
      'Basic reporting only'
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
    description: 'Adds AI analysis and professional planning',
    toolCount: '20+ Tools + AI Analysis',
    features: [
      'Everything in Starter',
      'Enhanced Client Matching & Referrals',
      'AI IEP Review & Compliance',
      'Progress Analyzer with AI',
      'IEP Master Suite',
      'Ask AI About Client Docs',
      'Client Scheduler system',
      'Professional intake forms',
      'IEP Goal Generator (AI-powered)',
      'Accommodation Builder',
      '504 Plan Builder',
      'Enhanced CRM features',
      'Advanced reporting & analytics',
      'Priority email support (10GB storage)'
    ],
    limitations: [
      'Single advocate only',
      'No billing tools',
      'No team features'
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
    price: 149,
    period: '/month',
    seats: '2 Seats',
    description: 'Team collaboration with billing tools',
    toolCount: '30+ Professional Tools + Team',
    features: [
      'Everything in Pro',
      'Priority Client Matching & Premium Leads',
      '2 Advocate seats',
      'Team CRM access',
      'Billing & Invoicing tools',
      'Time tracking system',
      'Shared client management',
      'Team collaboration features',
      'Multi-client management',
      'Performance analytics',
      'Advocacy Reports generation',
      'Professional behavioral support',
      'Legal compliance tools',
      'Phone support (20GB storage)'
    ],
    limitations: [
      'Limited to 2 advocates',
      'No white-label options'
    ],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-green-500 to-green-600',
    priceId: 'price_1Rr3ik8iKZXV0srZPRPByMQx',
    isFree: false
  },
  {
    id: 'agency-plus',
    name: 'Agency+',
    price: 249,
    period: '/month',
    seats: '5 Seats',
    description: 'Enterprise features with unlimited AI',
    toolCount: 'ALL 40+ Professional Tools',
    features: [
      'Everything in Agency',
      '5 Advocate seats',
      'Unlimited AI Credits',
      'Professional training hub access',
      'Specialized professional tools',
      'Emotion tracker (professional)',
      'Crisis intervention planning',
      'Legal documentation suite',
      'White-label branding options',
      'Custom integrations',
      'Dedicated account manager',
      'Unlimited storage',
      'Premium priority support'
    ],
    limitations: [],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-amber-500 to-amber-600',
    priceId: 'price_1Rr3jz8iKZXV0srZNewPlan',
    isFree: false
  }
];

export default function Subscribe() {
  const location = useLocation();
  const { toast } = useToast();
  
  // Determine role from URL path
  const role = location.pathname.includes('/parent/') ? 'parent' : 'advocate';
  const pricingTiers = role === 'parent' ? PARENT_PRICING : ADVOCATE_PRICING;

  const handleFreePlan = () => {
    toast({
      title: "Free Plan Selected",
      description: "To get started with the free plan, please sign in first.",
    });
    window.location.href = '/api/login';
  };

  const handleSubscribe = async (plan: any) => {
    if (plan.isFree) {
      handleFreePlan();
      return;
    }

    // Use unified checkout flow
    try {
      const checkoutUrl = getCheckoutUrl({
        planId: plan.id,
        role: role,
        amount: plan.price,
        planName: plan.name
      });

      if (checkoutUrl) {
        toast({
          title: `${plan.name} Plan Selected`,
          description: "Redirecting to secure checkout...",
        });
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Invalid checkout URL');
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout process. Please try again.",
        variant: "destructive"
      });
    }
  };

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
                <CardDescription className="text-muted-foreground mb-3">
                  {tier.description}
                </CardDescription>
                {tier.toolCount && (
                  <div className="mb-3">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400">
                      {tier.toolCount}
                    </Badge>
                  </div>
                )}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 flex flex-col h-full">
                <ul className="space-y-3 mb-4 flex-grow">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {tier.limitations && tier.limitations.length > 0 && (
                  <div className="border-t border-border pt-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                    <ul className="space-y-1">
                      {tier.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-muted-foreground">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-auto"
                  variant={tier.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(tier)}
                >
                  {tier.isFree ? 'Get Started Free' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout handled by unified SubscriptionSetup flow */}
      </div>
    </div>
  );
}