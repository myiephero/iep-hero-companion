import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  Crown, 
  Heart, 
  Star,
  Shield,
  Target,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCheckoutUrl, requiresPayment } from '@/lib/stripePricing';
import { 
  MobileAppShell,
  PremiumMobileHeader,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { cn } from "@/lib/utils";

const ParentPricingPlan = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for highlight parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightParam = urlParams.get('highlight');
    if (highlightParam) {
      setHighlightedPlan(highlightParam);
      // Auto-scroll to highlighted plan after a short delay
      setTimeout(() => {
        const planElement = document.querySelector(`[data-plan-id="${highlightParam}"]`);
        if (planElement) {
          planElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, []);

  const pricingTiers = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      period: isYearly ? '/year' : '/month',
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
      icon: Heart,
      gradient: 'from-gray-500 to-gray-600',
      accentColor: 'gray',
      popular: false
    },
    {
      id: 'essential',
      name: 'Essential',
      monthlyPrice: '$59',
      yearlyPrice: '$49',
      period: isYearly ? '/month (billed yearly)' : '/month',
      yearlyDiscount: '17% off',
      description: 'AI-powered tools for comprehensive IEP support',
      toolCount: '25+ Tools + AI Analysis',
      features: [
        'Everything in Free',
        '1 Student profile',
        'AI Insights & Analytics',
        'Progress Analytics dashboard',
        'Unified IEP Review with AI',
        'Ask AI About Documents',
        'Document Vault (5GB)',
        'Meeting Prep Wizard',
        'All Accommodation Builders',
        'Goal Generator (AI)',
        'Emotion Trackers',
        'Communication Tracker',
        'Priority email support',
        '100 documents, 25 AI analyses, 50 letters/month'
      ],
      limitations: [
        'Limited to 1 child',
        'No expert support',
        'Basic specialization tools'
      ],
      icon: Star,
      gradient: 'from-blue-500 to-indigo-600',
      accentColor: 'blue',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: '$199',
      yearlyPrice: '$149',
      period: isYearly ? '/month (billed yearly)' : '/month',
      yearlyDiscount: '25% off',
      description: 'Multi-child families with expert support',
      toolCount: '35+ Professional Tools',
      features: [
        'Everything in Essential',
        '3 Student profiles',
        'Expert Support (phone & email)',
        'Advanced AI IEP Review',
        'Autism Accommodation Builder',
        'Gifted & 2e Learner tools',
        'OT Activity Recommender',
        'Advanced analytics & insights',
        'Professional meeting prep',
        'Advocate Matching Tool',
        'Document storage (25GB)',
        '1000 documents, 100 AI analyses, 200 letters/month'
      ],
      limitations: [
        'No dedicated support manager',
        'No strategy calls'
      ],
      icon: Crown,
      gradient: 'from-purple-500 to-indigo-600',
      accentColor: 'purple',
      popular: false
    },
    {
      id: 'hero',
      name: 'Hero',
      monthlyPrice: '$249',
      yearlyPrice: '$199',
      period: isYearly ? '/month (billed yearly)' : '/month',
      yearlyDiscount: '20% off',
      description: 'Ultimate tier with unlimited access',
      toolCount: '50+ Premium Tools + Unlimited',
      features: [
        'Everything in Premium',
        'Unlimited student profiles',
        'Dedicated support manager',
        'White-glove setup ($495 value)',
        'Monthly strategy calls',
        'Full advocate tool access',
        'Priority platform features',
        'Advanced specialization tools',
        'Professional meeting coordination',
        'Unlimited storage',
        'Unlimited documents, AI analyses & letters'
      ],
      limitations: [],
      icon: Shield,
      gradient: 'from-orange-500 to-pink-600',
      accentColor: 'orange',
      popular: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    
    if (planId === 'free') {
      // Free plan - redirect to account creation with free plan metadata
      toast({
        title: "Free Plan Selected",
        description: "Let's create your account...",
      });
      setTimeout(() => {
        window.location.href = '/subscription-setup?plan=free&role=parent&priceId=&amount=0&planName=Free';
      }, 1000);
      return;
    }
    
    // Paid plans - redirect to Stripe checkout
    const checkoutUrl = getCheckoutUrl(planId, 'parent');
    console.log('Plan selected:', planId, 'Checkout URL:', checkoutUrl);
    
    if (!checkoutUrl || checkoutUrl === '/' || checkoutUrl.includes('undefined')) {
      console.error('Invalid checkout URL for plan:', planId);
      toast({
        title: "Setup Error",
        description: "Unable to process this plan. Please contact support.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: `${planId.charAt(0).toUpperCase() + planId.slice(1)} plan selected`,
      description: "Redirecting to checkout...",
    });
    
    setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 1000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <MobileAppShell showBottomNav={false}>
      <SafeAreaFull>
        {/* Premium Mobile Header */}
        <PremiumMobileHeader
          title="Parent Pricing"
          subtitle="Empower Your Child's Journey"
          showBack={true}
          onBack={handleBack}
          variant="elevated"
        />

        <ContainerMobile className="pb-8">
          {/* Hero Section */}
          <div className="px-6 py-8 text-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                  <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Parent & Family Plans
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  Empower Your Child's
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                    IEP Journey
                  </span>
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                  Choose the perfect plan to advocate effectively for your child's educational needs
                </p>
              </div>

              {/* Value Proposition */}
              <PremiumCard variant="glass" className="p-6">
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Our Partnership Promise</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    "We provide the <span className="font-semibold text-blue-600 dark:text-blue-400">platform, tools, and coordination</span>. Your matched advocate provides the <span className="font-semibold text-blue-600 dark:text-blue-400">professional services</span>. Together, we make sure you're never alone in this journey."
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    — The Operating System for IEP Advocacy
                  </p>
                </div>
              </PremiumCard>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="px-6 mb-8">
            <div className="flex items-center justify-center">
              <PremiumCard variant="glass" className="p-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    !isYearly ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                  )}>
                    Monthly
                  </span>
                  <Switch 
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                    data-testid="billing-toggle"
                  />
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isYearly ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                  )}>
                    Yearly
                  </span>
                  {isYearly && (
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 ml-2">
                      💰 Save up to 25%
                    </Badge>
                  )}
                </div>
              </PremiumCard>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="px-6 space-y-6">
            {pricingTiers.map((tier) => {
              const IconComponent = tier.icon;
              const isHighlighted = highlightedPlan === tier.id;
              
              return (
                <PremiumCard 
                  key={tier.id}
                  data-plan-id={tier.id}
                  variant={tier.popular ? "gradient" : "elevated"}
                  className={cn(
                    "p-6 transition-all duration-300 relative overflow-hidden",
                    isHighlighted && "ring-2 ring-orange-400 dark:ring-orange-500 shadow-xl scale-[1.02]",
                    tier.popular && "ring-2 ring-blue-400 dark:ring-blue-500"
                  )}
                >
                  {/* Background Pattern */}
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full transform translate-x-16 -translate-y-16 opacity-10",
                    tier.accentColor === 'gray' && "bg-gradient-to-bl from-gray-500",
                    tier.accentColor === 'blue' && "bg-gradient-to-bl from-blue-500",
                    tier.accentColor === 'purple' && "bg-gradient-to-bl from-purple-500",
                    tier.accentColor === 'orange' && "bg-gradient-to-bl from-orange-500"
                  )} />

                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 dark:bg-blue-500 text-white border-0 shadow-lg">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto",
                        tier.accentColor === 'gray' && "from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900",
                        tier.accentColor === 'blue' && "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
                        tier.accentColor === 'purple' && "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
                        tier.accentColor === 'orange' && "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
                      )}>
                        <IconComponent className={cn(
                          "h-8 w-8",
                          tier.accentColor === 'gray' && "text-gray-600 dark:text-gray-400",
                          tier.accentColor === 'blue' && "text-blue-600 dark:text-blue-400",
                          tier.accentColor === 'purple' && "text-purple-600 dark:text-purple-400",
                          tier.accentColor === 'orange' && "text-orange-600 dark:text-orange-400"
                        )} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{tier.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{tier.description}</p>
                        
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            tier.accentColor === 'gray' && "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
                            tier.accentColor === 'blue' && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                            tier.accentColor === 'purple' && "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
                            tier.accentColor === 'orange' && "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                          )}
                        >
                          {tier.toolCount}
                        </Badge>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                            {isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {tier.period}
                          </span>
                        </div>
                        {isYearly && tier.yearlyDiscount && (
                          <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                            {tier.yearlyDiscount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {tier.features.slice(0, 8).map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                              {feature}
                            </span>
                          </div>
                        ))}
                        
                        {tier.features.length > 8 && (
                          <div className="text-center">
                            <Badge variant="outline" className="text-xs">
                              +{tier.features.length - 8} more features
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Limitations */}
                      {tier.limitations && tier.limitations.length > 0 && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 border-dashed">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Limitations:</p>
                          <div className="space-y-1">
                            {tier.limitations.map((limitation, index) => (
                              <p key={index} className="text-xs text-gray-500 dark:text-gray-400">
                                • {limitation}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button 
                      className={cn(
                        "w-full h-12 font-semibold transition-all duration-200 active:scale-[0.98]",
                        tier.popular 
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg" 
                          : tier.accentColor === 'purple'
                          ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                          : tier.accentColor === 'orange'
                          ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                          : "bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900"
                      )}
                      onClick={() => handlePlanSelection(tier.id)}
                      data-testid={`select-plan-${tier.id}`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {selectedPlan === tier.id ? (
                          <>
                            <Shield className="h-4 w-4" />
                            Selected
                          </>
                        ) : (
                          <>
                            Choose {tier.name}
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </PremiumCard>
              );
            })}
          </div>

          {/* Hero Family Pack - Ultimate Promotion */}
          <div className="px-6 mt-12">
            <PremiumCard variant="gradient" className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-pink-600 border-orange-500 p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-pink-600/90" />
            
            {/* Limited Time Badge */}
            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-red-500 text-white border-red-600 font-bold px-3 py-2 animate-pulse">
                🔥 FOUNDING FAMILIES ONLY
              </Badge>
            </div>
            
            {/* Countdown Timer */}
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-xs text-white/80 mb-1">Spots Remaining</div>
                <div className="text-xl font-bold text-white">47</div>
              </div>
            </div>
            
            <div className="relative z-10 p-8 pt-16">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Hero Family Pack</h3>
                      <p className="text-orange-100">Platform onboarding + ongoing premium subscription</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">$495 Family Setup Includes:</h4>
                    <div className="grid md:grid-cols-1 gap-2 mb-4">
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">AI-powered IEP review & analysis</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">30-minute strategy consultation</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Certified advocate matching</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Complete platform setup & training</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm font-bold">🎁 FREE 2nd student setup ($495 value)</span>
                      </div>
                    </div>
                    
                    {/* Special Bonuses */}
                    <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-3 mb-4">
                      <h5 className="text-sm font-bold text-white mb-2">🏆 FOUNDING FAMILY BONUSES:</h5>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white text-xs">
                          <Shield className="h-3 w-3 text-yellow-200" />
                          <span>60-Day Money-Back Guarantee</span>
                        </div>
                        <div className="flex items-center gap-2 text-white text-xs">
                          <Crown className="h-3 w-3 text-yellow-200" />
                          <span>Lifetime rate lock at $249/month</span>
                        </div>
                        <div className="flex items-center gap-2 text-white text-xs">
                          <Star className="h-3 w-3 text-yellow-200" />
                          <span>IEP Success Bonus: 3 free months when goal achieved</span>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-white mb-3">$249/Month Ongoing Includes:</h4>
                    <div className="mb-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-3">
                        ALL 50+ Professional Tools
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-1 gap-2 mb-6">
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">All Premium platform features + unlimited access</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Ongoing advocate communication hub</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Up to 3 students, unlimited documents & AI analysis</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Monthly strategy calls & priority support</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Professional meeting coordination</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Unlimited document storage & organization</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Priority platform support</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-4 mb-6">
                      <p className="text-sm text-orange-100">
                        <strong>Note:</strong> Your matched advocate sets their own rates for professional services (IEP meeting attendance, hourly consultations, etc.). We facilitate the connection and provide organized data.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center lg:text-right">
                  <div className="mb-6">
                    {/* Ultimate Value Badges */}
                    <div className="mb-4 space-y-2">
                      <Badge className="bg-yellow-400 text-yellow-900 border-yellow-500 font-semibold px-3 py-1 block text-center">
                        🎉 FIRST MONTH FREE!
                      </Badge>
                      <Badge className="bg-green-500 text-white border-green-600 font-semibold px-3 py-1 block text-center">
                        🛡️ 60-DAY GUARANTEE
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-orange-100 mb-2">Founding Family Exclusive</div>
                    
                    {/* Value Breakdown */}
                    <div className="bg-white/10 rounded-lg p-4 mb-4">
                      <div className="text-xs text-orange-100 mb-2">TOTAL VALUE BREAKDOWN:</div>
                      <div className="space-y-1 text-xs text-white">
                        <div className="flex justify-between">
                          <span>Setup for 2 students</span>
                          <span>$990</span>
                        </div>
                        <div className="flex justify-between">
                          <span>First month subscription</span>
                          <span>$249</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IEP Success Bonus (3 months)</span>
                          <span>$747</span>
                        </div>
                        <div className="border-t border-white/20 pt-1 mt-1">
                          <div className="flex justify-between font-bold">
                            <span>Total Value</span>
                            <span>$1,986</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center lg:justify-end gap-2">
                        <span className="text-lg line-through text-orange-300">$1,986</span>
                        <span className="text-3xl font-bold text-white">$495</span>
                        <span className="text-orange-100">today only</span>
                      </div>
                      <div className="text-sm text-orange-200">Then locked at $249/month forever</div>
                    </div>
                    <div className="text-sm text-orange-200 mt-2">Covers your entire family</div>
                    
                    {/* Ultimate Savings callout */}
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 mt-4">
                      <p className="text-sm text-white font-bold">
                        🔥 SAVE $1,491 TODAY!
                      </p>
                      <p className="text-xs text-orange-100">
                        LIMITED: Only 47 founding families accepted
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 transform hover:scale-105 transition-all shadow-lg"
                    onClick={() => handlePlanSelection('hero')}
                    data-testid="button-select-hero"
                  >
                    🚀 CLAIM YOUR FOUNDING FAMILY SPOT
                  </Button>
                  <div className="text-xs text-orange-100 mt-2 text-center lg:text-right">
                    ✓ Instant access • ✓ 60-day guarantee • ✓ Rate locked forever
                  </div>
                </div>
              </div>
            </div>
            </PremiumCard>
          </div>

          {/* Footer */}
          <div className="px-6 mt-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Need help choosing? <a href="/auth" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Contact our support team</a> for personalized guidance.
            </p>
          </div>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
};

export default ParentPricingPlan;