import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      toast({
        title: "Free Plan Selected",
        description: "Let's create your account...",
      });
      setTimeout(() => {
        window.location.href = '/subscription-setup?plan=free&role=parent&priceId=&amount=0&planName=Free';
      }, 1000);
      return;
    }
    
    toast({
      title: `${planId.charAt(0).toUpperCase() + planId.slice(1)} plan selected`,
      description: "Redirecting to checkout...",
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Desktop Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-full border border-blue-200/50 dark:border-blue-800/50">
            <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Parent & Family Plans
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            Empower Your Child's
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              IEP Journey
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Choose the perfect plan to advocate effectively for your child's educational needs
          </p>

          {/* Value Proposition */}
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-background/80 to-background/60 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Our Partnership Promise</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                "We provide the <span className="font-semibold text-blue-600 dark:text-blue-400">platform, tools, and coordination</span>. Your matched advocate provides the <span className="font-semibold text-blue-600 dark:text-blue-400">professional services</span>. Together, we make sure you're never alone in this journey."
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                — The Operating System for IEP Advocacy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <Card className="bg-background/80 backdrop-blur border-0">
            <CardContent className="p-1">
              <div className="flex items-center gap-4 px-4 py-3">
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
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier) => {
            const IconComponent = tier.icon;
            const isHighlighted = highlightedPlan === tier.id;
            
            return (
              <Card 
                key={tier.id}
                data-plan-id={tier.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg",
                  isHighlighted && "ring-2 ring-orange-400 dark:ring-orange-500 shadow-xl scale-[1.02]",
                  tier.popular && "ring-2 ring-blue-400 dark:ring-blue-500",
                  tier.popular && "bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10"
                )}
              >
                {/* Background Pattern */}
                <div className={cn(
                  "absolute top-0 right-0 w-24 h-24 rounded-full transform translate-x-12 -translate-y-12 opacity-10",
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

                <CardHeader className="relative z-10 text-center pb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mx-auto mb-4",
                    tier.accentColor === 'gray' && "from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900",
                    tier.accentColor === 'blue' && "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
                    tier.accentColor === 'purple' && "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
                    tier.accentColor === 'orange' && "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
                  )}>
                    <IconComponent className={cn(
                      "h-6 w-6",
                      tier.accentColor === 'gray' && "text-gray-600 dark:text-gray-400",
                      tier.accentColor === 'blue' && "text-blue-600 dark:text-blue-400",
                      tier.accentColor === 'purple' && "text-purple-600 dark:text-purple-400",
                      tier.accentColor === 'orange' && "text-orange-600 dark:text-orange-400"
                    )} />
                  </div>
                  
                  <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                  
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "mt-2",
                      tier.accentColor === 'blue' && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    )}
                  >
                    {tier.toolCount}
                  </Badge>

                  {/* Pricing */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {tier.period}
                      </span>
                    </div>
                    {isYearly && tier.yearlyDiscount && (
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 mt-2">
                        {tier.yearlyDiscount}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {tier.features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                    
                    {tier.features.length > 6 && (
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs">
                          +{tier.features.length - 6} more features
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hero Family Pack Section */}
        <Card className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-pink-600 border-orange-500">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-pink-600/90" />
          
          <CardContent className="relative z-10 p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Hero Family Pack</h3>
                    <p className="text-orange-100">Platform onboarding + ongoing premium subscription</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-white">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-200" />
                    <span className="text-sm">AI-powered IEP review & analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-200" />
                    <span className="text-sm">30-minute strategy consultation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-200" />
                    <span className="text-sm">Certified advocate matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-200" />
                    <span className="text-sm">Complete platform setup & training</span>
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="text-4xl font-bold text-white mb-2">$495</div>
                <div className="text-orange-100 mb-4">One-time setup</div>
                <div className="text-3xl font-bold text-white mb-2">+ $249/mo</div>
                <div className="text-orange-100 mb-6">Ongoing premium access</div>
                
                <Button 
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100"
                  onClick={() => handlePlanSelection('hero')}
                >
                  Get Hero Family Pack
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentPricingPlan;