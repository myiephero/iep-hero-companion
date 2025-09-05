import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, ArrowRight, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { SubscriptionPlan } from "@shared/schema";
import { getPlanDisplayName } from "@/lib/planAccess";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  requiredPlan: SubscriptionPlan;
  toolName: string;
  benefits: string[];
  currentValue?: string;
  onClose?: () => void;
  className?: string;
}

export function UpgradePrompt({
  requiredPlan,
  toolName,
  benefits,
  currentValue,
  onClose,
  className = ""
}: UpgradePromptProps) {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    // Navigate to pricing with the required plan highlighted
    navigate(`/parent/pricing?highlight=${requiredPlan}`);
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'hero':
        return <Crown className="h-6 w-6 text-orange-500" />;
      case 'premium':
        return <Sparkles className="h-6 w-6 text-purple-500" />;
      default:
        return <ArrowRight className="h-6 w-6 text-blue-500" />;
    }
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'hero':
        return 'from-orange-500 to-pink-500';
      case 'premium':
        return 'from-purple-500 to-indigo-500';
      case 'plus':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Card className={`border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/20 to-muted/10 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-3">
          {getPlanIcon(requiredPlan)}
        </div>
        <CardTitle className="text-xl mb-2">
          🔒 {toolName}
        </CardTitle>
        <CardDescription className="text-base">
          This powerful tool requires <Badge className={`bg-gradient-to-r ${getPlanColor(requiredPlan)} text-white font-semibold`}>
            {getPlanDisplayName(requiredPlan)}
          </Badge> access
        </CardDescription>
        {currentValue && (
          <div className="text-sm text-muted-foreground mt-2 italic">
            Current plan value: {currentValue}
          </div>
        )}
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
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-muted-foreground/20">
            <Button 
              onClick={handleUpgradeClick}
              className={`w-full bg-gradient-to-r ${getPlanColor(requiredPlan)} text-white hover:opacity-90 font-semibold`}
              size="lg"
              data-testid={`button-upgrade-${requiredPlan}`}
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to {getPlanDisplayName(requiredPlan)}
            </Button>
            
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="w-full mt-2 text-muted-foreground hover:text-foreground"
                data-testid="button-close-upgrade"
              >
                Maybe Later
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UpgradeDialogProps extends UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeDialog({
  open,
  onOpenChange,
  requiredPlan,
  toolName,
  benefits,
  currentValue
}: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Upgrade Required
          </DialogTitle>
          <DialogDescription>
            Access {toolName} with {getPlanDisplayName(requiredPlan)} plan
          </DialogDescription>
        </DialogHeader>
        
        <UpgradePrompt
          requiredPlan={requiredPlan}
          toolName={toolName}
          benefits={benefits}
          currentValue={currentValue}
          onClose={() => onOpenChange(false)}
          className="border-0 bg-transparent"
        />
      </DialogContent>
    </Dialog>
  );
}