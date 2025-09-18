import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  Crown, 
  Zap, 
  Star, 
  Users,
  Sparkles,
  ChevronRight,
  Shield,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCheckoutUrl } from '@/lib/stripePricing';
import { 
  MobileAppShell,
  PremiumMobileHeader,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { cn } from "@/lib/utils";

const AdvocatePricingPlan = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
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

  const getPriceForPlan = (tier: any, isAnnual: boolean) => {
    // Handle Agency plan with setup fee (like Hero Parent plan)
    if (tier.id === 'agency') {
      if (isAnnual) {
        const monthlyTotal = tier.monthlyPrice * 12; // $249 * 12 = $2988
        const annualTotal = tier.annualPrice * 12; // $199 * 12 = $2388
        const annualSavings = monthlyTotal - annualTotal; // $2988 - $2388 = $600
        return {
          price: `$${tier.annualPrice}`,
          period: '/month',
          annualSavings: `Save $${annualSavings}/year`,
          setupFee: tier.setupFee
        };
      }
      return {
        price: `$${tier.monthlyPrice}`,
        period: '/month',
        annualSavings: null,
        setupFee: tier.setupFee
      };
    }
    
    // Custom annual pricing for Starter and Pro plans
    if (isAnnual) {
      let annualMonthlyRate;
      let annualSavings;
      
      if (tier.id === 'starter') {
        annualMonthlyRate = 39; // $39/month when paid annually
        const monthlyTotal = tier.monthlyPrice * 12; // $49 * 12 = $588
        const annualTotal = 39 * 12; // $468/year
        annualSavings = monthlyTotal - annualTotal; // $588 - $468 = $120
      } else if (tier.id === 'pro') {
        annualMonthlyRate = 99; // $99/month when paid annually
        const monthlyTotal = tier.monthlyPrice * 12; // $149 * 12 = $1788
        const annualTotal = 99 * 12; // $1188/year
        annualSavings = monthlyTotal - annualTotal; // $1788 - $1188 = $600
      } else {
        // Fallback to 10% discount for other plans
        const monthlyTotal = tier.monthlyPrice * 12;
        const annualTotal = Math.round(tier.monthlyPrice * 12 * 0.9);
        annualMonthlyRate = Math.round(annualTotal / 12);
        annualSavings = monthlyTotal - annualTotal;
      }
      
      return {
        price: `$${annualMonthlyRate}`,
        period: '/month',
        annualSavings: `Save $${annualSavings}/year`
      };
    }
    
    return {
      price: `$${tier.monthlyPrice}`,
      period: '/month',
      annualSavings: null
    };
  };

  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 49,
      seats: '1 Seat',
      description: 'Essential tools for solo advocates',
      toolCount: '12 Core Professional Tools',
      features: [
        '1 Advocate seat',
        'Client Management CRM',
        'Basic IEP Review (non-AI)',
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
      icon: Zap,
      gradient: 'from-blue-500 to-blue-600',
      popular: false,
      accentColor: 'blue'
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 149,
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
      icon: Star,
      gradient: 'from-purple-500 to-purple-600',
      popular: true,
      accentColor: 'purple'
    },
    {
      id: 'agency',
      name: 'Agency',
      monthlyPrice: 249,
      seats: '3 Seats',
      description: 'Complete advocacy practice solution',
      toolCount: 'ALL 40+ Professional Tools + Enterprise',
      setupFee: 495,
      annualPrice: 199, // Monthly rate when paid annually + setup fee ($2,388/year = $199/month)
      features: [
        'Everything in Pro',
        'Priority Client Matching & Premium Leads',
        '3 Advocate seats (+ $39/month per additional seat)',
        'Unlimited AI Credits & Analysis',
        'Team CRM access',
        'Shared client management',
        'Multi-client management',
        'Performance analytics',
        'Advocacy Reports generation',
        'Professional behavioral support',
        'Legal compliance tools',
        'Dedicated account manager',
        'Unlimited storage & premium priority support',
        '— Additional Tools Coming Soon —',
        'Billing & Invoicing tools (Coming Soon)',
        'Time tracking system (Coming Soon)',
        'Team collaboration features (Coming Soon)',
        'White-label branding options (Coming Soon)',
        'Custom integrations & API access (Coming Soon)',
        'Professional training hub access (Coming Soon)',
        'Crisis intervention planning tools (Coming Soon)'
      ],
      limitations: [],
      icon: Crown,
      gradient: 'from-amber-500 to-orange-600',
      popular: false,
      accentColor: 'orange'
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    
    // All advocate plans are paid - redirect to Stripe checkout
    const checkoutUrl = getCheckoutUrl(planId, 'advocate', isAnnual);
    const planName = pricingTiers.find(p => p.id === planId)?.name || planId;
    const billingType = isAnnual ? 'Annual' : 'Monthly';
    console.log('Advocate plan selected:', planId, 'Billing:', billingType, 'Checkout URL:', checkoutUrl);
    
    if (!checkoutUrl || checkoutUrl === '/' || checkoutUrl.includes('undefined')) {
      console.error('Invalid checkout URL for advocate plan:', planId);
      toast({
        title: "Setup Error",
        description: "Unable to process this plan. Please contact support.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: `${planName} Plan Selected`,
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
          title="Advocate Pricing"
          subtitle="Scale Your Practice"
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
                  <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Professional Advocate Plans
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  Scale Your
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                    Advocacy Practice
                  </span>
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                  Choose the perfect plan to grow your advocacy business with professional-grade tools and support
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
                    "We bring you <span className="font-semibold text-blue-600 dark:text-blue-400">qualified leads</span> and provide them with <span className="font-semibold text-blue-600 dark:text-blue-400">organized data/docs</span>. You focus on what you do best - <span className="font-semibold text-blue-600 dark:text-blue-400">advocacy</span>. We handle the tech and coordination."
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    — Partner with the Operating System for IEP Advocacy
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
                    !isAnnual ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                  )}>
                    Monthly
                  </span>
                  <Switch 
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                    data-testid="billing-toggle"
                  />
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isAnnual ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                  )}>
                    Annual
                  </span>
                  {isAnnual && (
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 ml-2">
                      Save Up To 25%
                    </Badge>
                  )}
                </div>
              </PremiumCard>
            </div>
          </div>

          {/* Extra Seats Notice */}
          <div className="px-6 mb-6">
            <PremiumCard variant="default" className="p-4">
              <div className="flex items-center gap-3 text-center justify-center">
                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Agency Extra Seats:</span> $39/month each - Flexible expansion for larger teams
                </span>
              </div>
            </PremiumCard>
          </div>

          {/* Pricing Cards */}
          <div className="px-6 space-y-6">
            {pricingTiers.map((tier) => {
              const IconComponent = tier.icon;
              const priceInfo = getPriceForPlan(tier, isAnnual);
              const isHighlighted = highlightedPlan === tier.id;
              
              return (
                <PremiumCard 
                  key={tier.id}
                  data-plan-id={tier.id}
                  variant={tier.popular ? "gradient" : "elevated"}
                  className={cn(
                    "p-6 transition-all duration-300 relative overflow-hidden",
                    isHighlighted && "ring-2 ring-orange-400 dark:ring-orange-500 shadow-xl scale-[1.02]",
                    tier.popular && "ring-2 ring-purple-400 dark:ring-purple-500"
                  )}
                >
                  {/* Background Pattern */}
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full transform translate-x-16 -translate-y-16 opacity-10",
                    tier.accentColor === 'blue' && "bg-gradient-to-bl from-blue-500",
                    tier.accentColor === 'purple' && "bg-gradient-to-bl from-purple-500",
                    tier.accentColor === 'orange' && "bg-gradient-to-bl from-orange-500"
                  )} />

                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 dark:bg-purple-500 text-white border-0 shadow-lg">
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
                        tier.accentColor === 'blue' && "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
                        tier.accentColor === 'purple' && "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
                        tier.accentColor === 'orange' && "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
                      )}>
                        <IconComponent className={cn(
                          "h-8 w-8",
                          tier.accentColor === 'blue' && "text-blue-600 dark:text-blue-400",
                          tier.accentColor === 'purple' && "text-purple-600 dark:text-purple-400",
                          tier.accentColor === 'orange' && "text-orange-600 dark:text-orange-400"
                        )} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{tier.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{tier.seats}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{tier.description}</p>
                        
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
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
                            {priceInfo.price}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {priceInfo.period}
                          </span>
                        </div>
                        {priceInfo.annualSavings && (
                          <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                            {priceInfo.annualSavings}
                          </Badge>
                        )}
                        {priceInfo.setupFee && !isAnnual && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            + ${priceInfo.setupFee} setup fee
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {tier.features.slice(0, 8).map((feature, index) => (
                          <div key={index} className={cn(
                            "flex items-start gap-3",
                            feature.startsWith('—') && "mt-4 mb-2"
                          )}>
                            {feature.startsWith('—') ? (
                              <div className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            ) : feature.includes('(Coming Soon)') ? (
                              <Sparkles className="h-4 w-4 text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            )}
                            <span className={cn(
                              "text-sm leading-relaxed",
                              feature.startsWith('—') 
                                ? "font-medium text-gray-500 dark:text-gray-400 italic" 
                                : "text-gray-700 dark:text-gray-300"
                            )}>
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
                          ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg" 
                          : tier.accentColor === 'blue'
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
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
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
};

export default AdvocatePricingPlan;