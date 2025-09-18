import { useState, startTransition, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToolAccess } from "@/hooks/useToolAccess";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumToolCard,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  allAdvocateTools
} from "@/lib/advocateToolsRegistry";
import { getPlanDisplayName } from "@/lib/planAccess";
import { 
  ArrowRight,
  Star,
  Sparkles,
  Lock,
  Crown,
  Zap,
  Shield,
  Target,
  Search,
  Filter
} from "lucide-react";

interface ToolCardProps {
  tool: any;
  hasAccess: boolean;
  currentPlan: string;
  onNavigate?: (route: string) => void;
}

function AdvancedToolCard({ tool, hasAccess, currentPlan, onNavigate }: ToolCardProps) {
  const handleNavigate = () => {
    if (onNavigate && hasAccess) {
      onNavigate(tool.route);
    }
  };

  return (
    <PremiumToolCard
      icon={<tool.icon className="h-6 w-6" />}
      title={tool.title}
      description={tool.description}
      badge={tool.badge}
      isPopular={tool.isPopular}
      isNew={tool.isNew}
      isLocked={!hasAccess}
      requiredPlan={hasAccess ? undefined : getPlanDisplayName(tool.requiredPlan)}
      onClick={handleNavigate}
      className={hasAccess ? "cursor-pointer" : ""}
    />
  );
}

export default function AdvocateToolsHubPremium() {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { canUse, currentPlan } = useToolAccess();

  // Concurrent navigation handler using startTransition
  const handleToolNavigation = (route: string) => {
    startTransition(() => {
      navigate(route);
    });
  };

  // Compute dynamic data
  const totalTools = allAdvocateTools.length;
  const newCount = allAdvocateTools.filter(t => t.isNew).length;
  const popularTools = allAdvocateTools.filter(t => t.isPopular);
  const availableTools = allAdvocateTools.filter(t => canUse(t.requiredFeature));
  const lockedTools = allAdvocateTools.filter(t => !canUse(t.requiredFeature));

  return (
    <MobileAppShell>
      <SafeAreaFull>
        {/* Premium Header */}
        <PremiumLargeHeader
          title="Professional Tools"
          subtitle="Complete advocacy toolkit for special education"
          rightAction={
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          }
        />

        <ContainerMobile padding="md" className="space-y-8 pb-32">
          {/* Premium Stats Section */}
          <PremiumCard variant="gradient" className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {getPlanDisplayName(currentPlan)} Plan
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access to {availableTools.length} professional tools
                  </p>
                </div>
              </div>
              
              {/* Plan Features */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <Zap className="h-4 w-4" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Shield className="h-4 w-4" />
                  <span>Legal Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Target className="h-4 w-4" />
                  <span>Evidence-Based</span>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Popular Tools Section */}
          {popularTools.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Popular Tools
                  </h3>
                  {newCount > 0 && (
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {newCount} New
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                {popularTools.slice(0, 3).map((tool) => {
                  const hasAccess = canUse(tool.requiredFeature);
                  return (
                    <AdvancedToolCard
                      key={tool.id}
                      tool={tool}
                      hasAccess={hasAccess}
                      currentPlan={currentPlan}
                      onNavigate={handleToolNavigation}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Tools Section */}
          {availableTools.length > popularTools.length && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Available Tools
              </h3>
              
              <div className="space-y-4">
                {allAdvocateTools
                  .filter(tool => !tool.isPopular && canUse(tool.requiredFeature))
                  .map((tool) => (
                    <AdvancedToolCard
                      key={tool.id}
                      tool={tool}
                      hasAccess={true}
                      currentPlan={currentPlan}
                      onNavigate={handleToolNavigation}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Upgrade Section for Locked Tools */}
          {lockedTools.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Upgrade to Unlock
                </h3>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  onClick={() => navigate('/advocate/pricing')}
                >
                  <Crown className="h-4 w-4 mr-1" />
                  View Plans
                </Button>
              </div>
              
              <div className="space-y-4">
                {lockedTools.slice(0, 2).map((tool) => (
                  <AdvancedToolCard
                    key={tool.id}
                    tool={tool}
                    hasAccess={false}
                    currentPlan={currentPlan}
                    onNavigate={handleToolNavigation}
                  />
                ))}
              </div>
              
              {lockedTools.length > 2 && (
                <PremiumCard variant="glass" className="p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +{lockedTools.length - 2} more premium tools available
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate('/advocate/pricing')}
                  >
                    See All Plans
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </PremiumCard>
              )}
            </div>
          )}
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}