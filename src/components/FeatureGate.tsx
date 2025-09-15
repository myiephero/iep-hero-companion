import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, ArrowRight, Check, X, Zap } from 'lucide-react';
import { useToolAccess } from '@/hooks/useToolAccess';
import { PlanFeatures, SubscriptionPlan } from '@/lib/planAccess';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

interface FeatureGateProps {
  requiredFeature: keyof PlanFeatures;
  requiredPlan?: SubscriptionPlan;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  upgradeBenefits?: string[];
  className?: string;
  'data-testid'?: string;
}

export function FeatureGate({ 
  requiredFeature, 
  requiredPlan,
  children, 
  fallback,
  showUpgradePrompt = true,
  upgradeBenefits = [],
  className = "",
  'data-testid': dataTestId = `feature-gate-${requiredFeature}`
}: FeatureGateProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { canUse, needsUpgrade, requiredPlanFor, currentPlan, user } = useToolAccess();

  const hasAccess = canUse(requiredFeature);
  const requiresUpgrade = needsUpgrade(requiredFeature);
  const minimumPlan = requiredPlan || requiredPlanFor(requiredFeature);

  // If user has access, render children normally
  if (hasAccess) {
    return <div data-testid={dataTestId} className={className}>{children}</div>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <div data-testid={`${dataTestId}-fallback`} className={className}>{fallback}</div>;
  }

  // If no upgrade prompt requested, render nothing
  if (!showUpgradePrompt) {
    return null;
  }

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'agency-plus':
        return <Crown className="h-5 w-5 text-orange-500" />;
      case 'agency':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      case 'pro':
        return <Zap className="h-5 w-5 text-blue-500" />;
      default:
        return <ArrowRight className="h-5 w-5 text-green-500" />;
    }
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'agency-plus':
        return 'from-orange-500 to-pink-500';
      case 'agency':
        return 'from-purple-500 to-indigo-500';
      case 'pro':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-green-500 to-blue-500';
    }
  };

  const getPlanDisplayName = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'starter': return 'Starter';
      case 'pro': return 'Pro';
      case 'agency': return 'Agency';
      case 'agency-plus': return 'Agency Plus';
      default: return 'Pro';
    }
  };

  const handleUpgradeClick = async () => {
    // Open external browser with pricing page for Apple compliance
    const baseUrl = Capacitor.isNativePlatform() 
      ? 'https://afd4ab41-fa60-4e78-9742-69bb4e3004d6-00-6i79wn87wfhu.janeway.replit.dev'
      : window.location.origin;
    
    const pricingUrl = user?.role === 'advocate' 
      ? `${baseUrl}/advocate/pricing?highlight=${minimumPlan}`
      : `${baseUrl}/parent/pricing?highlight=${minimumPlan}`;
    
    if (Capacitor.isNativePlatform()) {
      // Open in external browser on mobile (Netflix model)
      await Browser.open({ url: pricingUrl });
    } else {
      // Open in new tab on web
      window.open(pricingUrl, '_blank');
    }
  };

  const defaultBenefits = [
    `Access to ${requiredFeature.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
    'Priority customer support',
    'Advanced analytics and reporting',
    'Enhanced security features'
  ];

  const benefits = upgradeBenefits.length > 0 ? upgradeBenefits : defaultBenefits;

  return (
    <>
      <Card 
        data-testid={`${dataTestId}-upgrade-prompt`}
        className={`border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/20 to-muted/10 ${className}`}
      >
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-3">
            {getPlanIcon(minimumPlan)}
          </div>
          <CardTitle className="text-xl mb-2 flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Feature Locked
          </CardTitle>
          <CardDescription className="text-base">
            This feature requires 
            <Badge className={`ml-2 bg-gradient-to-r ${getPlanColor(minimumPlan)} text-white font-semibold`}>
              {getPlanDisplayName(minimumPlan)}
            </Badge>
            {' '}access or higher
          </CardDescription>
          <div className="text-sm text-muted-foreground mt-2">
            Current plan: <span className="font-medium">{getPlanDisplayName(currentPlan)}</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Unlock Premium Benefits:
              </h4>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleUpgradeClick}
                className={`flex-1 bg-gradient-to-r ${getPlanColor(minimumPlan)} hover:opacity-90 text-white font-medium`}
                data-testid={`${dataTestId}-upgrade-button`}
              >
                <Crown className="h-4 w-4 mr-2" />
                {Capacitor.isNativePlatform() ? 'Visit Website to Upgrade' : `Upgrade to ${getPlanDisplayName(minimumPlan)}`}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowUpgradeDialog(true)}
                data-testid={`${dataTestId}-learn-more-button`}
              >
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getPlanIcon(minimumPlan)}
              Upgrade to {getPlanDisplayName(minimumPlan)}
            </DialogTitle>
            <DialogDescription>
              Unlock advanced features and capabilities for professional advocacy work.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">What you'll get:</h4>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleUpgradeClick}
                className={`flex-1 bg-gradient-to-r ${getPlanColor(minimumPlan)} hover:opacity-90 text-white`}
              >
                {Capacitor.isNativePlatform() ? 'Visit Website to Upgrade' : 'Upgrade Now'}
              </Button>
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}