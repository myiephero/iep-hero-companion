import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Heart, 
  Star,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ParentPricingPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const pricingTiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Essential tools to get started',
      features: [
        'Template Library access',
        'Education Hub',
        'Basic IEP tracking',
        'Community support',
        'Mobile app access'
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
      description: 'Adds document management and letters',
      features: [
        'Everything in Free',
        'Intake Vault',
        'Pre-built Letters',
        'Document storage (2GB)',
        'Email support'
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
      description: 'Adds progress tracking and self-service tools',
      features: [
        'Everything in Basic',
        'Progress Tracker',
        'Self-IEP Tools',
        'Goal tracking dashboard',
        'Document storage (5GB)',
        'Priority support'
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
      description: 'Adds live support and IEP review',
      features: [
        'Everything in Plus',
        'Live Chat support',
        'IEP Review tools',
        'Member discounts',
        'Document storage (10GB)',
        'Advanced analytics'
      ],
      icon: <Crown className="h-6 w-6 text-white" />,
      gradient: 'from-purple-500 to-indigo-600',
      popular: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: `${planId.charAt(0).toUpperCase() + planId.slice(1)} plan selected`,
      description: "Redirecting to checkout...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Shortened Hero Section */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            Empower Your Child's <span className="text-blue-400">IEP Journey</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan to advocate effectively for your child's educational needs
          </p>
        </div>

        {/* 4 Equal-sized Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`bg-slate-800/50 backdrop-blur border-slate-700 relative min-h-[420px] flex flex-col ${
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
                <CardTitle className="text-xl font-bold text-white">{tier.name}</CardTitle>
                <CardDescription className="text-gray-400 text-sm mb-3">
                  {tier.description}
                </CardDescription>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400 text-sm">{tier.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 flex-grow flex flex-col">
                <ul className="space-y-3 flex-grow">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
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

        {/* Hero Family Pack - Large as 4 cards combined */}
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
                      <p className="text-orange-100">Complete advocacy package with expert support</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Everything in Premium</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Dedicated advocate assignment</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Monthly strategy sessions</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Priority document review</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Unlimited storage</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">24/7 emergency support</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">IEP meeting attendance</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-orange-200" />
                        <span className="text-sm">Legal consultation access</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center lg:text-right">
                  <div className="mb-6">
                    <div className="text-sm text-orange-100 mb-2">Starting at</div>
                    <div className="flex items-baseline justify-center lg:justify-end gap-2">
                      <span className="text-4xl font-bold text-white">$199</span>
                      <span className="text-orange-100">/month</span>
                    </div>
                    <div className="text-sm text-orange-200 mt-2">Includes up to 3 children</div>
                  </div>
                  
                  <Button 
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8 py-4"
                    onClick={() => handlePlanSelection('hero')}
                    data-testid="button-select-hero"
                  >
                    Choose Hero Plan
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