import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Crown, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useToolAccess } from '@/hooks/useToolAccess';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { PlanFeatures, SubscriptionPlan } from '@/lib/planAccess';

interface AccessControlledToolCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge: string;
  features: string[];
  requiredFeature: keyof PlanFeatures;
  requiredPlan: SubscriptionPlan;
  className?: string;
}

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case "Core": return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600";
    case "New": return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700";
    case "Enhanced": return "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600";
    case "Specialized": return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700";
    case "Connect": return "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700";
    case "2e": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
    case "Templates": return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700";
    case "Prep": return "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700";
    case "Secure": return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700";
    case "Wellness": return "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700";
    case "Parent-Friendly": return "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700";
    case "Pro": return "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700";
    case "Essential": return "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700";
    case "Tracking": return "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700";
    case "Interactive": return "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700";
    case "Organize": return "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700";
    case "Personalized": return "bg-lime-100 dark:bg-lime-900 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-700";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
  }
};

const getPlanColor = (plan: SubscriptionPlan) => {
  switch (plan) {
    case 'hero':
      return 'from-orange-500 to-pink-500';
    case 'premium':
      return 'from-purple-500 to-indigo-500';
    case 'essential':
      return 'from-blue-500 to-cyan-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const getPlanDisplayName = (plan: SubscriptionPlan) => {
  switch (plan) {
    case 'free': return 'Free';
    case 'essential': return 'Essential';
    case 'premium': return 'Premium';
    case 'hero': return 'Hero';
    default: return 'Unknown';
  }
};

export function AccessControlledToolCard({
  title,
  description,
  icon: Icon,
  path,
  badge,
  features,
  requiredFeature,
  requiredPlan,
  className = ""
}: AccessControlledToolCardProps) {
  const { hasAccess, currentPlan } = useToolAccess();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // CRITICAL FIX: Use proper access control based on plan features
  let isAccessible = hasAccess(requiredFeature);
  
  // ENHANCED DEBUG: Log all access checks to diagnose issues
  console.log('🔍 AccessControlledToolCard DEBUG:', {
    title,
    requiredFeature,
    requiredPlan,
    currentPlan,
    hasAccess: isAccessible,
    timestamp: new Date().toISOString()
  });
  
  // STRICT ACCESS CONTROL: For free plan, only allow explicitly free features
  if (currentPlan === 'free') {
    // Only these features are available to free plan users
    const freeFeatures: (keyof PlanFeatures)[] = [
      'ideaRightsGuide',
      'ferpaOverview', 
      'timelineCalculator',
      'smartLetterGenerator', // Limited usage
      'studentProfileManagement' // Limited to 1 child
    ];
    
    // If not in free features list, deny access
    if (!freeFeatures.includes(requiredFeature)) {
      isAccessible = false;
      console.log('🚫 FREE PLAN RESTRICTION:', title, '- Access denied, upgrade required');
    } else {
      console.log('✅ FREE PLAN ACCESS:', title, '- Feature available to free users');
    }
  }
  
  // FINAL ACCESS DECISION 
  console.log(`🔒 FINAL ACCESS DECISION: ${title} | Current Plan: ${currentPlan} | Required Plan: ${requiredPlan} | Is Accessible: ${isAccessible}`);
  const truncatedDescription = description.length > 80 ? `${description.substring(0, 80)}...` : description;

  const handleClick = (e: React.MouseEvent) => {
    if (!isAccessible) {
      e.preventDefault();
      setShowUpgradeDialog(true);
    }
  };

  return (
    <>
      <Card className={`hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group border h-[280px] flex flex-col ${
        isAccessible 
          ? 'border-gray-200 hover:border-primary/30 bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-primary/50 cursor-pointer' 
          : 'border-gray-300 bg-gray-50/70 dark:bg-gray-900/50 dark:border-gray-600 relative'
      } ${className}`}>
        
        {/* Lock Overlay for restricted tools */}
        {!isAccessible && (
          <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg mx-auto">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <Badge className={`bg-gradient-to-r ${getPlanColor(requiredPlan)} text-white text-xs px-3 py-1 font-semibold shadow-sm`}>
                {getPlanDisplayName(requiredPlan)} Required
              </Badge>
            </div>
          </div>
        )}

        <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={`p-3 rounded-lg shadow-sm transition-all duration-200 ${
              isAccessible 
                ? 'bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 group-hover:from-primary/20 group-hover:to-primary/10 dark:group-hover:from-primary/30 dark:group-hover:to-primary/20'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              <Icon className={`h-6 w-6 ${isAccessible ? 'text-primary dark:text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
            <div className="space-y-2">
              <Badge className={`${getBadgeVariant(badge)} text-xs px-2 py-1 shadow-sm`}>
                {badge}
              </Badge>
              <CardTitle className={`text-sm font-semibold leading-tight transition-colors ${
                isAccessible 
                  ? 'group-hover:text-primary dark:text-gray-100' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 px-4 pb-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3 flex-1">
            <p className={`text-xs text-center leading-relaxed ${
              isAccessible 
                ? 'text-gray-600 dark:text-gray-300' 
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {truncatedDescription}
            </p>
          </div>
          
          {isAccessible ? (
            <Button asChild size="sm" className="w-full text-xs py-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary dark:from-primary dark:to-primary/90 shadow-sm">
              <Link to={path} data-testid={`button-open-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                <Zap className="h-3 w-3 mr-1" />
                Open Tool
              </Link>
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className="w-full text-xs py-2 border-gray-300 text-gray-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white hover:border-transparent transition-all duration-200"
              onClick={handleClick}
              data-testid={`button-upgrade-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade Now
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Lock className="h-4 w-4 text-white" />
              </div>
              Unlock {title}
            </DialogTitle>
            <DialogDescription className="text-base">
              This powerful tool requires <Badge className={`bg-gradient-to-r ${getPlanColor(requiredPlan)} text-white font-semibold ml-1`}>
                {getPlanDisplayName(requiredPlan)}
              </Badge> access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                What you'll unlock:
              </h4>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowUpgradeDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                <Link to={`/parent/pricing?highlight=${requiredPlan}`}>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}