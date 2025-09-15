import { useState, ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, Check, Zap, ArrowRight } from 'lucide-react';
import { useToolAccess } from '@/hooks/useToolAccess';
import { PlanFeatures, SubscriptionPlan } from '@/lib/planAccess';
import { cn } from '@/lib/utils';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

interface LockedActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  requiredFeature: keyof PlanFeatures;
  requiredPlan?: SubscriptionPlan;
  onUnlockedClick?: () => void;
  lockedText?: string;
  unlockedText?: string;
  upgradeBenefits?: string[];
  children?: ReactNode;
  'data-testid'?: string;
}

export function LockedActionButton({
  requiredFeature,
  requiredPlan,
  onUnlockedClick,
  lockedText,
  unlockedText,
  upgradeBenefits = [],
  children,
  className,
  variant = "default",
  size = "default",
  'data-testid': dataTestId = `locked-action-${requiredFeature}`,
  ...buttonProps
}: LockedActionButtonProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { canUse, needsUpgrade, requiredPlanFor, currentPlan, user } = useToolAccess();

  const hasAccess = canUse(requiredFeature);
  const requiresUpgrade = needsUpgrade(requiredFeature);
  const minimumPlan = requiredPlan || requiredPlanFor(requiredFeature);

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'agency-plus':
        return <Crown className="h-4 w-4" />;
      case 'agency':
        return <Sparkles className="h-4 w-4" />;
      case 'pro':
        return <Zap className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
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

  const handleClick = () => {
    if (hasAccess && onUnlockedClick) {
      onUnlockedClick();
    } else {
      setShowUpgradeDialog(true);
    }
  };

  const handleUpgradeClick = async () => {
    // Open external browser with pricing page for Apple compliance
    const baseUrl = Capacitor.isNativePlatform() 
      ? 'https://myiephero.com' // Your actual website URL
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
    `Full access to ${requiredFeature.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
    'Priority customer support',
    'Advanced features and integrations',
    'Enhanced security and compliance'
  ];

  const benefits = upgradeBenefits.length > 0 ? upgradeBenefits : defaultBenefits;

  // If user has access, render normal button
  if (hasAccess) {
    return (
      <Button
        {...buttonProps}
        variant={variant}
        size={size}
        className={className}
        onClick={onUnlockedClick}
        data-testid={`${dataTestId}-unlocked`}
      >
        {children || unlockedText || 'Continue'}
      </Button>
    );
  }

  // If locked, render upgrade button
  return (
    <>
      <Button
        {...buttonProps}
        variant="outline"
        size={size}
        className={cn(
          "border-dashed border-muted-foreground/50 bg-muted/10 text-muted-foreground hover:bg-muted/20 hover:text-muted-foreground hover:border-muted-foreground/70",
          className
        )}
        onClick={handleClick}
        data-testid={`${dataTestId}-locked`}
      >
        <Lock className="h-4 w-4 mr-2" />
        {children || lockedText || `Requires ${getPlanDisplayName(minimumPlan)}`}
      </Button>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getPlanIcon(minimumPlan)}
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              This action requires 
              <Badge className={`ml-1 mr-1 bg-gradient-to-r ${getPlanColor(minimumPlan)} text-white font-semibold`}>
                {getPlanDisplayName(minimumPlan)}
              </Badge>
              access or higher.
            </DialogDescription>
            <div className="text-sm text-muted-foreground">
              Your current plan: <span className="font-medium">{getPlanDisplayName(currentPlan)}</span>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Upgrade Benefits:
              </h4>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpgradeClick}
                  className={`flex-1 bg-gradient-to-r ${getPlanColor(minimumPlan)} hover:opacity-90 text-white font-medium`}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {Capacitor.isNativePlatform() ? 'Visit Website to Upgrade' : `Upgrade to ${getPlanDisplayName(minimumPlan)}`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpgradeDialog(false)}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="text-xs text-center text-muted-foreground mt-3">
                • No long-term contracts • Cancel anytime • 30-day money back guarantee
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}