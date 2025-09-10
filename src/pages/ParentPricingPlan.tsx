import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  Crown, 
  Heart, 
  Star,
  Shield,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCheckoutUrl, requiresPayment } from '@/lib/stripePricing';

const ParentPricingPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();

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
      icon: <Heart className="h-6 w-6 text-white" />,
      gradient: 'from-gray-500 to-gray-600',
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
      icon: <Star className="h-6 w-6 text-white" />,
      gradient: 'from-blue-500 to-indigo-600',
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
      icon: <Crown className="h-6 w-6 text-white" />,
      gradient: 'from-purple-500 to-indigo-600',
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
      icon: <Shield className="h-6 w-6 text-white" />,
      gradient: 'from-orange-500 to-pink-600',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Shortened Hero Section */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Empower Your Child's <span className="text-blue-600">IEP Journey</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Choose the perfect plan to advocate effectively for your child's educational needs
          </p>
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
            <p className="text-gray-800 font-medium text-lg">
              "We provide the <span className="text-blue-600">platform, tools, and coordination</span>. Your matched advocate provides the <span className="text-blue-600">professional services</span>. Together, we make sure you're never alone in this journey."
            </p>
            <p className="text-blue-600 text-sm mt-2">
              — The Operating System for IEP Advocacy
            </p>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-6 mb-12">
          <div className="relative bg-gray-100 rounded-full p-1 flex items-center">
            <div
              className={`absolute inset-y-1 w-32 bg-blue-600 rounded-full transition-transform duration-300 ease-in-out ${
                isYearly ? 'translate-x-32' : 'translate-x-0'
              }`}
            />
            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 px-6 py-3 rounded-full font-semibold text-base transition-colors duration-300 w-32 ${
                !isYearly 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 px-6 py-3 rounded-full font-semibold text-base transition-colors duration-300 w-32 ${
                isYearly 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Yearly
            </button>
          </div>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
            💰 Save up to 25%
          </Badge>
        </div>

        {/* 4 Equal-sized Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`bg-white shadow-lg border-gray-200 relative min-h-[420px] flex flex-col hover:shadow-xl transition-shadow ${
                tier.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${tier.gradient} rounded-xl mb-4 mx-auto`}>
                  {tier.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{tier.name}</CardTitle>
                <CardDescription className="text-gray-600 text-sm mb-3">
                  {tier.description}
                </CardDescription>
                <div className="mb-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                    {tier.toolCount}
                  </Badge>
                </div>
                <div className="text-center">
                  {isYearly && tier.yearlyDiscount && (
                    <div className="mb-2">
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                        {tier.yearlyDiscount}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-gray-500 text-sm">{tier.period}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 flex-grow flex flex-col">
                <ul className="space-y-3 flex-grow">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {tier.limitations && tier.limitations.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-600 mb-2">Limitations:</p>
                    <ul className="space-y-1">
                      {tier.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-gray-500">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button 
                  className={`w-full mt-auto ${
                    tier.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
                  }`}
                  onClick={() => handlePlanSelection(tier.id)}
                  data-testid={`button-select-${tier.id}`}
                >
                  {selectedPlan === tier.id ? 'Selected' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hero Family Pack - Ultimate Promotion */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-orange-600 to-pink-600 border-orange-500 relative overflow-hidden min-h-[400px]">
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
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            Need help choosing? <a href="/auth" className="text-blue-400 hover:underline">Contact our support team</a> for personalized guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentPricingPlan;