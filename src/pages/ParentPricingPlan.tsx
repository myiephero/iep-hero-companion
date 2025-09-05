import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { toast } = useToast();

  const pricingTiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
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
      icon: <Heart className="h-6 w-6 text-white" />,
      gradient: 'from-gray-500 to-gray-600',
      popular: false
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$19',
      period: '/month',
      description: 'Core tools for active IEP management',
      toolCount: '11 Core Tools (No AI)',
      features: [
        'Everything in Free',
        '1 Student profile',
        'Goal Management system',
        'Meeting Scheduler',
        'Document Vault (2GB)',
        'Progress Notes tracking',
        'Meeting Prep Wizard',
        'Plan 504 Guide',
        'Email support',
        '50 Documents, 10 letters/month'
      ],
      limitations: [
        'No AI analysis or insights',
        'No document review tools',
        'Basic templates only'
      ],
      icon: <Heart className="h-6 w-6 text-white" />,
      gradient: 'from-pink-500 to-rose-600',
      popular: false
    },
    {
      id: 'plus',
      name: 'Plus',
      price: '$29',
      period: '/month',
      description: 'AI-powered analysis and comprehensive tools',
      toolCount: '25+ Tools + AI',
      features: [
        'Everything in Basic',
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
        'No expert analysis',
        'Basic specialization tools'
      ],
      icon: <Star className="h-6 w-6 text-white" />,
      gradient: 'from-blue-500 to-indigo-600',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$49',
      period: '/month',
      description: 'Professional-grade tools with expert features',
      toolCount: '35+ Professional Tools',
      features: [
        'Everything in Plus',
        '2 Student profiles',
        'Expert Analysis requests',
        'Advanced AI IEP Review',
        'Autism Accommodation Builder',
        'Gifted & 2e Learner tools',
        'OT Activity Recommender',
        'Advanced analytics & insights',
        'Professional meeting prep',
        'Priority email support',
        'Document storage (10GB)',
        '500 documents, 100 letters/month'
      ],
      limitations: [
        'No strategy calls',
        'No advocate coordination'
      ],
      icon: <Crown className="h-6 w-6 text-white" />,
      gradient: 'from-purple-500 to-indigo-600',
      popular: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    
    if (planId === 'free') {
      // Free plan - redirect to registration/dashboard
      toast({
        title: "Free Plan Selected",
        description: "Redirecting you to get started...",
      });
      setTimeout(() => {
        window.location.href = '/auth';
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
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-500 text-sm">{tier.period}</span>
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

        {/* Hero Family Pack - Hybrid Model */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-orange-600 to-pink-600 border-orange-500 relative overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-pink-600/90" />
            <div className="relative z-10 p-8">
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
                    <h4 className="text-lg font-semibold text-white mb-3">$495 Per Student Setup Includes:</h4>
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
                    </div>
                    
                    <h4 className="text-lg font-semibold text-white mb-3">$199/Month Ongoing Includes:</h4>
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
                    <div className="text-sm text-orange-100 mb-2">Hybrid Investment</div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center lg:justify-end gap-2">
                        <span className="text-3xl font-bold text-white">$495</span>
                        <span className="text-orange-100">one-time</span>
                      </div>
                      <div className="text-orange-200">+</div>
                      <div className="flex items-baseline justify-center lg:justify-end gap-2">
                        <span className="text-3xl font-bold text-white">$199</span>
                        <span className="text-orange-100">/month</span>
                      </div>
                    </div>
                    <div className="text-sm text-orange-200 mt-2">Covers your entire family</div>
                  </div>
                  
                  <Button 
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8 py-4"
                    onClick={() => handlePlanSelection('hero')}
                    data-testid="button-select-hero"
                  >
                    Start Hero Plan
                  </Button>
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