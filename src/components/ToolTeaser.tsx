import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpgradeDialog } from "./UpgradePrompt";
import { useState } from "react";
// Define subscription plan type locally
type SubscriptionPlan = 'free' | 'basic' | 'plus' | 'premium' | 'hero';
import { Lock, Sparkles } from "lucide-react";
import { getPlanDisplayName } from "@/lib/planAccess";

interface ToolTeaserProps {
  toolName: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  requiredPlan: SubscriptionPlan;
  previewImage?: string;
  currentValue?: string;
  className?: string;
}

export function ToolTeaser({
  toolName,
  description,
  icon,
  benefits,
  requiredPlan,
  previewImage,
  currentValue,
  className = ""
}: ToolTeaserProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

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
    <>
      <Card className={`group hover:shadow-lg transition-all duration-300 border-muted-foreground/20 bg-gradient-to-br from-muted/5 to-muted/10 ${className}`}>
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/20 rounded-lg group-hover:bg-primary/10 transition-colors">
                {icon}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {toolName}
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              </div>
            </div>
            <Badge 
              className={`bg-gradient-to-r ${getPlanColor(requiredPlan)} text-white text-xs px-2 py-1 font-medium`}
            >
              {getPlanDisplayName(requiredPlan)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {previewImage && (
            <div className="mb-4 relative">
              <img 
                src={previewImage} 
                alt={`${toolName} preview`}
                className="w-full h-32 object-cover rounded-md border border-muted-foreground/20"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                <Sparkles className="h-3 w-3 text-primary" />
                Premium Features:
              </h4>
              <ul className="space-y-1">
                {benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    {benefit}
                  </li>
                ))}
                {benefits.length > 3 && (
                  <li className="text-xs text-muted-foreground italic">
                    +{benefits.length - 3} more premium features...
                  </li>
                )}
              </ul>
            </div>

            {currentValue && (
              <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded border border-dashed">
                <strong>💰 Value:</strong> {currentValue}
              </div>
            )}

            <Button
              onClick={() => setShowUpgradeDialog(true)}
              className={`w-full bg-gradient-to-r ${getPlanColor(requiredPlan)} text-white hover:opacity-90 font-medium group-hover:shadow-md transition-all`}
              data-testid={`button-try-${toolName.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Try {toolName} Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        requiredPlan={requiredPlan}
        toolName={toolName}
        benefits={benefits}
        currentValue={currentValue}
      />
    </>
  );
}

interface ToolGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolGrid({ children, className = "" }: ToolGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
}