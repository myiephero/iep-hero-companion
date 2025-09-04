import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Heart, 
  Star
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
      icon: <Heart className="h-6 w-6" />,
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
      icon: <Heart className="h-6 w-6" />,
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
      icon: <Star className="h-6 w-6" />,
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
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-purple-500 to-purple-600',
      popular: false
    },
    {
      id: 'hero-family-pack',
      name: 'Hero Family Pack',
      price: '$495',
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
      popular: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Plan Selected",
      description: `You've selected the ${pricingTiers.find(p => p.id === planId)?.name}. Redirecting to checkout...`,
    });
  };


  return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-10" />
          <div className="relative px-6 py-16 text-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-6 py-3 glass-card text-sm font-medium text-primary-glow mb-8 animate-float">
                <Heart className="h-4 w-4 mr-2" />
                Parent Advocacy Pricing
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gradient text-glow">
                  Empower Your Child's Future
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Choose the perfect plan to advocate effectively for your child's educational needs
              </p>

            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                 style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {pricingTiers.map((tier) => (
                <Card 
                  key={tier.id}
                  className={`premium-card card-hover relative ${
                    tier.popular ? 'ring-2 ring-primary' : ''
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
                    <CardTitle className="text-lg font-bold">{tier.name}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm mb-3">
                      {tier.description}
                    </CardDescription>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground text-sm">{tier.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        tier.popular 
                          ? 'button-premium' 
                          : 'bg-gradient-to-r hover:opacity-90'
                      }`}
                      onClick={() => handlePlanSelection(tier.id)}
                    >
                      {selectedPlan === tier.id ? 'Selected' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

      </div>
  );
};

export default ParentPricingPlan;