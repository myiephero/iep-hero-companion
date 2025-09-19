import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCheckoutUrl } from '@/lib/stripePricing';
import {
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from '@/components/mobile';
import { cn } from '@/lib/utils';
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
    priceId: 'price_1S6c6r8iKZXV0srZEedxCBJ7', // Updated Starter monthly pricing
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
    priceId: 'price_1S6c6s8iKZXV0srZUQl201V9', // Updated Pro monthly pricing
    isFree: false
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 249,
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
    priceId: 'price_1S6c6t8iKZXV0srZDefEOrXY', // Updated Agency monthly pricing
    isFree: false
  },
  {
    id: 'agency-plus',
    name: 'Agency+',
    price: 399,
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
    priceId: 'price_1S6c6u8iKZXV0srZXnPPjJp7', // Updated Agency Plus monthly pricing
    isFree: false
  }
];

// Premium Subscription Card Component
interface PremiumSubscriptionCardProps {
  tier: any;
  onSubscribe: () => void;
  className?: string;
}

function PremiumSubscriptionCard({ tier, onSubscribe, className }: PremiumSubscriptionCardProps) {
  return (
    <PremiumCard
      variant={tier.popular ? "elevated" : "glass"}
      className={cn("overflow-hidden", className)}
    >
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Background Gradient */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl rounded-full transform translate-x-12 -translate-y-12 opacity-10",
        tier.gradient
      )} />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            {/* Icon */}
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
              tier.gradient
            )}>
              {tier.icon}
            </div>

            {/* Title & Seats */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {tier.name}
              </h3>
              {tier.seats && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tier.seats}
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                ${tier.price}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {tier.period}
              </span>
            </div>
            {tier.isFree && (
              <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 border-green-200">
                Free Forever
              </Badge>
            )}
          </div>
        </div>

        {/* Description & Tool Count */}
        <div className="space-y-3">
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {tier.description}
          </p>
          {tier.toolCount && (
            <Badge 
              variant="secondary" 
              className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            >
              {tier.toolCount}
            </Badge>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            What's included:
          </h4>
          <div className="grid gap-2">
            {tier.features.slice(0, 6).map((feature: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature}
                </span>
              </div>
            ))}
            {tier.features.length > 6 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic pl-8">
                +{tier.features.length - 6} more features
              </div>
            )}
          </div>
        </div>

        {/* Limitations */}
        {tier.limitations && tier.limitations.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 border-dashed space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Limitations:
            </h4>
            <div className="space-y-1">
              {tier.limitations.map((limitation: string, index: number) => (
                <div key={index} className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-xs mt-1.5">•</span>
                  <span>{limitation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={onSubscribe}
          className={cn(
            "w-full h-12 rounded-xl font-semibold transition-all duration-200 shadow-lg",
            tier.popular
              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-blue-500/30"
              : tier.isFree
              ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-green-500/30"
              : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
          )}
          data-testid={`subscribe-${tier.id}`}
        >
          {tier.isFree ? 'Get Started Free' : 'Start Free Trial'}
        </Button>
      </div>
    </PremiumCard>
  );
}

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
    // Use custom login instead of OAuth to avoid Safari redirect on iOS
    window.location.replace('/m/auth');
  };

  const handleSubscribe = async (plan: any) => {
    if (plan.isFree) {
      handleFreePlan();
      return;
    }

    // Use unified checkout flow
    try {
      const checkoutUrl = getCheckoutUrl(plan.id, role);

      if (checkoutUrl) {
        toast({
          title: `${plan.name} Plan Selected`,
          description: "Redirecting to secure checkout...",
        });
        // 🔒 CRITICAL iOS FIX: Normalize checkoutUrl to prevent Safari redirect
        let dest = checkoutUrl;
        try { 
          const u = new URL(checkoutUrl, window.location.origin); 
          if (u.origin !== window.location.origin) dest = u.pathname + u.search + u.hash; 
        } catch (_) { dest = checkoutUrl; }
        console.log('🔍 Subscribe redirect normalized:', checkoutUrl, '→', dest);
        window.location.replace(dest);
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
    <MobileAppShell showBottomNav={false}>
      <SafeAreaFull>
        {/* Premium Header */}
        <PremiumLargeHeader
          title={`${role === 'parent' ? 'Parent' : 'Advocate'} Plans`}
          subtitle={role === 'parent' 
            ? 'Choose the perfect plan to advocate for your child' 
            : 'Select the right tools to grow your practice'
          }
          showBack={true}
        />

        <ContainerMobile className="space-y-6 pt-6 pb-8">

          {/* Premium Mobile Pricing Cards */}
          <div className="space-y-4">
            {pricingTiers.map((tier) => (
              <PremiumSubscriptionCard
                key={tier.id}
                tier={tier}
                onSubscribe={() => handleSubscribe(tier)}
                className={cn(
                  "relative",
                  tier.popular && "ring-2 ring-blue-500 ring-opacity-50"
                )}
              />
            ))}
          </div>

          {/* Premium Features Section */}
          <PremiumCard variant="glass" className="mt-8 p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Premium {role === 'parent' ? 'Parent' : 'Advocate'} Experience
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {role === 'parent' 
                    ? 'Join thousands of parents who have successfully advocated for their children\'s educational rights with our comprehensive toolkit.'
                    : 'Trusted by professional advocates nationwide to streamline their practice and deliver exceptional results for families.'
                  }
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 border-dashed">
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-600 dark:text-blue-400">50+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tools</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-600 dark:text-green-400">15k+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Families</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-purple-600 dark:text-purple-400">98%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Success</div>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Trust Indicators */}
          <div className="text-center space-y-4 mt-6 px-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Check className="h-4 w-4 text-green-500" />
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Check className="h-4 w-4 text-green-500" />
              <span>Secure checkout</span>
            </div>
          </div>

        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}