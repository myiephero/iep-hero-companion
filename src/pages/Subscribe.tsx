import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SimpleCheckout from './SimpleCheckout';

// Parent pricing tiers
const PARENT_PRICING = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
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
    popular: false,
    isFree: true
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 19,
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
    priceId: 'price_1Rr3bk8iKZXV0srZ0URHZo4O'
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 29,
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
    popular: true,
    priceId: 'price_1Rr3co8iKZXV0srZA1kEdBW1'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49,
    period: '/month',
    description: 'Adds live support and full IEP review',
    features: [
      'Everything in Plus',
      'Live Chat support',
      'Full IEP Review tools',
      'Advanced analytics',
      'Document storage (10GB)',
      'Advanced analytics',
      'Custom integrations'
    ],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-purple-500 to-purple-600',
    priceId: 'price_1Rr3ds8iKZXV0srZdGlZvDbN'
  },
  {
    id: 'hero',
    name: 'Hero Family Pack',
    price: 79,
    period: '/month',
    seats: '5 Children',
    description: 'Perfect for large families with multiple children',
    features: [
      'Everything in Premium',
      'Support for up to 5 children',
      'Family dashboard',
      'Shared document vault',
      'Priority customer success manager',
      'Monthly strategy calls',
      'Unlimited document storage'
    ],
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-amber-500 to-orange-600',
    priceId: 'price_1Rr3ew8iKZXV0srZQBFTZx7C'
  }
];

// Advocate pricing tiers
const ADVOCATE_PRICING = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
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
    priceId: 'price_1Rr3gL8iKZXV0srZmfuD32yv',
    isFree: false
  },
  {
    id: 'pro',
    name: 'Pro', 
    price: 75,
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
    popular: true,
    priceId: 'price_1Rr3hR8iKZXV0srZ5lPscs0p',
    isFree: false
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 99,
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
    priceId: 'price_1Rr3ik8iKZXV0srZPRPByMQx',
    isFree: false
  }
];

export default function Subscribe() {
  const location = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Determine role from URL path
  const role = location.pathname.includes('/parent/') ? 'parent' : 'advocate';
  const pricingTiers = role === 'parent' ? PARENT_PRICING : ADVOCATE_PRICING;

  const handleFreePlan = () => {
    toast({
      title: "Free Plan Selected",
      description: "To get started with the free plan, please sign in first.",
    });
    window.location.href = '/api/login';
  };

  const handleSubscribe = (plan: any) => {
    if (plan.isFree) {
      handleFreePlan();
      return;
    }
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {role === 'parent' ? 'Parent' : 'Advocate'} Subscription Plans
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {role === 'parent' 
              ? 'Choose the perfect plan to advocate effectively for your child\'s educational needs' 
              : 'Select the right tools and features to grow your advocacy practice'
            }
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" 
             style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                tier.popular ? 'ring-2 ring-primary scale-105' : 'hover:scale-102'
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
                <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                {tier.seats && (
                  <div className="text-sm text-muted-foreground">{tier.seats}</div>
                )}
                <CardDescription className="text-muted-foreground mb-4">
                  {tier.description}
                </CardDescription>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(tier)}
                >
                  {tier.isFree ? 'Get Started Free' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Simple Checkout Dialog */}
        <SimpleCheckout
          plan={selectedPlan}
          role={role}
          isOpen={showCheckout}
          onClose={() => {
            setShowCheckout(false);
            setSelectedPlan(null);
          }}
        />
      </div>
    </div>
  );
}