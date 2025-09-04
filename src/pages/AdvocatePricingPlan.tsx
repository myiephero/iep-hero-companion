import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Zap, 
  Star, 
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdvocatePricingPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$49',
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
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$75',
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
      popular: true
    },
    {
      id: 'agency',
      name: 'Agency',
      price: '$149',
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
      popular: false
    },
    {
      id: 'agency-plus',
      name: 'Agency+',
      price: '$249',
      period: '/month',
      seats: '5 Seats',
      description: 'Premium features with AI and training',
      features: [
        'Everything in Agency',
        'AI Credits included',
        'Training Hub access',
        'Premium support',
        'White-label options',
        'Custom integrations',
        'Dedicated account manager'
      ],
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-amber-500 to-amber-600',
      popular: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Plan Selected",
      description: `You've selected the ${pricingTiers.find(p => p.id === planId)?.name}. Contact our team to upgrade.`,
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
                <Crown className="h-4 w-4 mr-2" />
                Professional Advocate Pricing
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gradient text-glow">
                  Scale Your Advocacy Practice
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
                Choose the perfect plan to grow your advocacy business with professional-grade tools and support
              </p>
              
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-6 max-w-4xl mx-auto mb-8">
                <p className="text-white font-medium text-lg">
                  "We bring you <span className="text-secondary">qualified leads</span> and provide them with <span className="text-secondary">organized data/docs</span>. You focus on what you do best - <span className="text-secondary">advocacy</span>. We handle the tech and coordination."
                </p>
                <p className="text-secondary/80 text-sm mt-2">
                  — Partner with the Operating System for IEP Advocacy
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Extra Seats Notice */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-muted/50 rounded-lg">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <strong>Extra Seats:</strong> $29-$39/month each - Flexible expansion for larger teams
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                 style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
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
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${tier.gradient} rounded-2xl mb-4 mx-auto`}>
                      {tier.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                    <div className="text-sm text-muted-foreground mb-2">{tier.seats}</div>
                    <CardDescription className="text-muted-foreground text-sm">
                      {tier.description}
                    </CardDescription>
                    <div className="flex items-baseline justify-center gap-1 mt-4">
                      <span className="text-3xl font-bold">{tier.price}</span>
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

export default AdvocatePricingPlan;