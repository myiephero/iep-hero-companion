import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  const [isAnnual, setIsAnnual] = useState(false);
  const { toast } = useToast();

  const getPriceForPlan = (tier: any, isAnnual: boolean) => {
    // Handle Agency plan with setup fee (like Hero Parent plan)
    if (tier.id === 'agency') {
      if (isAnnual) {
        return {
          price: `$${tier.annualPrice}`,
          period: '/month',
          annualTotal: `$${tier.annualPrice * 12}/year + $${tier.setupFee} setup fee`,
          setupFee: tier.setupFee
        };
      }
      return {
        price: `$${tier.monthlyPrice}`,
        period: '/month',
        annualTotal: null,
        setupFee: tier.setupFee
      };
    }
    
    // Custom annual pricing for Starter and Pro plans
    if (isAnnual) {
      let annualMonthlyRate;
      let annualTotal;
      
      if (tier.id === 'starter') {
        annualMonthlyRate = 39; // $39/month when paid annually
        annualTotal = 39 * 12; // $468/year
      } else if (tier.id === 'pro') {
        annualMonthlyRate = 65; // $65/month when paid annually
        annualTotal = 65 * 12; // $780/year
      } else {
        // Fallback to 10% discount for other plans
        annualTotal = Math.round(tier.monthlyPrice * 12 * 0.9);
        annualMonthlyRate = Math.round(annualTotal / 12);
      }
      
      return {
        price: `$${annualMonthlyRate}`,
        period: '/month',
        annualTotal: `$${annualTotal}/year`
      };
    }
    
    return {
      price: `$${tier.monthlyPrice}`,
      period: '/month',
      annualTotal: null
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
      icon: <Zap className="h-6 w-6" />,
      gradient: 'from-blue-500 to-blue-600',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 75,
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
      popular: true
    },
    {
      id: 'agency',
      name: 'Agency',
      monthlyPrice: 249,
      seats: '3 Seats',
      description: 'Complete advocacy practice solution',
      toolCount: 'ALL 40+ Professional Tools + Enterprise',
      setupFee: 495,
      annualPrice: 195, // Monthly rate when paid annually + setup fee ($2,338/year = ~$195/month)
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
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-amber-500 to-orange-600',
      popular: false
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

        {/* Pricing Toggle */}
        <div className="px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-4 p-2 bg-muted/50 rounded-lg">
                <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <Switch 
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  data-testid="billing-toggle"
                />
                <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
                  Annual
                </span>
                {isAnnual && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-400 ml-2">
                    Save Up To 25%
                  </Badge>
                )}
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
                  <strong>Agency Extra Seats:</strong> $39/month each - Flexible expansion for larger teams
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
                    <div className="flex flex-col items-center justify-center mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{getPriceForPlan(tier, isAnnual).price}</span>
                        <span className="text-muted-foreground text-sm">{getPriceForPlan(tier, isAnnual).period}</span>
                      </div>
                      {getPriceForPlan(tier, isAnnual).annualTotal && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {getPriceForPlan(tier, isAnnual).annualTotal}
                        </div>
                      )}
                      {getPriceForPlan(tier, isAnnual).setupFee && !isAnnual && (
                        <div className="text-xs text-amber-600 font-medium mt-1">
                          + ${getPriceForPlan(tier, isAnnual).setupFee} setup fee
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 flex-grow flex flex-col">
                    <ul className="space-y-3 flex-grow">
                      {tier.features.map((feature, index) => (
                        <li key={index} className={`flex items-start gap-3 ${feature.startsWith('—') ? 'mt-4 mb-2' : ''}`}>
                          {feature.startsWith('—') ? (
                            <span className="w-4 h-4 mt-0.5 flex-shrink-0"></span>
                          ) : feature.includes('(Coming Soon)') ? (
                            <span className="text-amber-500 mt-0.5 flex-shrink-0">🚧</span>
                          ) : (
                            <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${feature.startsWith('—') ? 'font-medium text-muted-foreground italic' : ''}`}>
                            {feature}
                          </span>
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


      </div>
  );
};

export default AdvocatePricingPlan;