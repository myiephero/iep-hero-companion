import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Zap, 
  Star, 
  Users,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCheckoutUrl, requiresPayment } from '@/lib/stripePricing';

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
      toolCount: '12 Core Professional Tools',
      features: [
        '1 Advocate seat',
        'Client Management CRM',
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
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$75',
      period: '/month',
      seats: '1 Seat',
      description: 'Adds AI analysis and professional planning',
      toolCount: '20+ Tools + AI Analysis',
      features: [
        'Everything in Starter',
        'AI IEP Review & Compliance',
        'Progress Analyzer with AI',
        'Professional Unified IEP Review',
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
      popular: true
    },
    {
      id: 'agency',
      name: 'Agency',
      price: '$149',
      period: '/month',
      seats: '2 Seats',
      description: 'Team collaboration with billing tools',
      toolCount: '30+ Professional Tools + Team',
      features: [
        'Everything in Pro',
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
      popular: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    
    // All advocate plans are paid - redirect to Stripe checkout
    const checkoutUrl = getCheckoutUrl(planId, 'advocate');
    const planName = pricingTiers.find(p => p.id === planId)?.name || planId;
    console.log('Advocate plan selected:', planId, 'Checkout URL:', checkoutUrl);
    
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


  return (
      <div className="min-h-screen">
        {/* Back Button */}
        <div className="px-6 pt-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-primary hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

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
                  <strong>Agency+ Extra Seats:</strong> $39/month each - Flexible expansion for larger teams
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                    <div className="mb-3">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400">
                        {tier.toolCount}
                      </Badge>
                    </div>
                    <div className="flex items-baseline justify-center gap-1 mt-4">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground text-sm">{tier.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 flex-grow flex flex-col">
                    <ul className="space-y-3 flex-grow">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {tier.limitations && tier.limitations.length > 0 && (
                      <div className="border-t border-border pt-4">
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

        {/* Agency+ - Enterprise Upsell */}
        <div className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-gradient-to-r from-amber-600 to-orange-600 border-amber-500 relative overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/90 to-orange-600/90" />
              <div className="relative z-10 p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Crown className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Agency+ Enterprise</h3>
                        <p className="text-amber-100">Complete advocacy practice solution</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="mb-4">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-3">
                          ALL 40+ Professional Tools
                        </Badge>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-white mb-3">Enterprise Features Include:</h4>
                      <div className="grid md:grid-cols-1 gap-2 mb-4">
                        <div className="flex items-center gap-2 text-white">
                          <Check className="h-4 w-4 text-amber-200" />
                          <span className="text-sm">3 Advocate seats (+ $39/month per additional seat)</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Check className="h-4 w-4 text-amber-200" />
                          <span className="text-sm">Unlimited AI Credits & Analysis</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Check className="h-4 w-4 text-amber-200" />
                          <span className="text-sm">White-label branding options</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Check className="h-4 w-4 text-amber-200" />
                          <span className="text-sm">Dedicated account manager</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Check className="h-4 w-4 text-amber-200" />
                          <span className="text-sm">Custom integrations & API access</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Check className="h-4 w-4 text-amber-200" />
                          <span className="text-sm">Professional training hub access</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Check className="h-4 w-4 text-amber-200" />
                          <span className="text-sm">Crisis intervention planning tools</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Check className="h-4 w-4 text-amber-200" />
                          <span className="text-sm">Unlimited storage & premium priority support</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 rounded-lg p-4 mb-6">
                        <p className="text-sm text-amber-100">
                          <strong>Perfect for:</strong> Established advocacy practices ready to scale with enterprise-grade tools, white-label solutions, and dedicated support to grow their business.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center lg:text-right">
                    <div className="mb-6">
                      <div className="text-sm text-amber-100 mb-2">Enterprise Investment</div>
                      <div className="flex items-baseline justify-center lg:justify-end gap-2">
                        <span className="text-4xl font-bold text-white">$249</span>
                        <span className="text-amber-100">/month</span>
                      </div>
                      <div className="text-sm text-amber-200 mt-2">3 advocates included</div>
                      <div className="text-xs text-amber-300 mt-1">Extra seats: $39/month each</div>
                    </div>
                    
                    <Button 
                      size="lg"
                      className="bg-white text-amber-600 hover:bg-amber-50 font-semibold px-8 py-4"
                      onClick={() => handlePlanSelection('agency-plus')}
                      data-testid="button-select-agency-plus"
                    >
                      Start Agency+ Plan
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>
  );
};

export default AdvocatePricingPlan;