import { useState, startTransition, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToolAccess } from "@/hooks/useToolAccess";
import { 
  ContainerMobile, 
  SafeAreaFull 
} from "@/components/mobile";
import { 
  MobileCard, 
  MobileCardInteractive, 
  MobileH3, 
  MobileBody, 
  MobileCaption 
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
  Crown
} from "lucide-react";

// Types
interface ToolCardProps {
  tool: any;
  hasAccess: boolean;
  currentPlan: string;
  onNavigate?: (route: string) => void;
}

function ToolCard({ tool, hasAccess, currentPlan, onNavigate }: ToolCardProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!hasAccess) {
    return (
      <>
        <MobileCard variant="outline" padding="md" className="relative overflow-hidden opacity-75">
          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/10 pointer-events-none" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-4 p-2">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground shadow-md">
                  <tool.icon className="h-8 w-8" />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="text-sm px-2 py-1 font-medium bg-muted/20 text-muted-foreground border-muted/40">
                      {tool.badge}
                    </Badge>
                  </div>
                  <MobileH3 className="text-muted-foreground">{tool.title}</MobileH3>
                  <MobileBody className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {tool.description}
                  </MobileBody>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-dashed border-muted/40">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Crown className="h-4 w-4" />
                <MobileCaption>Tap to unlock with {getPlanDisplayName(tool.requiredPlan)}</MobileCaption>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline"
            className="w-full mt-4 min-h-[44px] text-base border-dashed border-muted-foreground/50 bg-muted/10 text-muted-foreground active:bg-muted/20 active:scale-95 transition-all duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setShowUpgrade(true);
            }}
            data-testid={`button-upgrade-${tool.id}`}
          >
            <Lock className="h-4 w-4 mr-2" />
            Upgrade to Access
          </Button>
        </MobileCard>
      </>
    );
  }

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(tool.route);
    }
  };

  return (
    <MobileCardInteractive 
      data-testid={`tool-card-unlocked-${tool.id}`}
      className="group active:scale-[0.98] transition-all duration-150 cursor-pointer"
      padding="md"
      onClick={handleNavigate}
    >
        <div className="flex items-center gap-4 p-2">
          {/* Icon Section */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary group-active:from-primary group-active:to-accent group-active:text-primary-foreground transition-all duration-200 shadow-md">
              <tool.icon className="h-8 w-8" />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="text-sm px-2 py-1 font-medium shadow-sm bg-blue-50 text-blue-700 border-blue-200">
                  {tool.badge}
                </Badge>
                {tool.isPopular && (
                  <Badge className="text-sm px-2 py-1 font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {tool.isNew && (
                  <Badge className="text-sm px-2 py-1 font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>
              <MobileH3>{tool.title}</MobileH3>
              <MobileBody className="text-muted-foreground line-clamp-2 leading-relaxed">
                {tool.description}
              </MobileBody>
            </div>
          </div>
        </div>

        {/* Action Indicator */}
        <Button 
          variant="ghost" 
          className="w-full mt-4 min-h-[44px] text-base text-primary group-active:bg-primary group-active:text-primary-foreground transition-all duration-200 border border-primary/20 group-active:border-primary"
          data-testid={`button-open-${tool.id}`}
        >
          <div>
            <ArrowRight className="h-4 w-4 mr-2" />
            Open Tool
          </div>
        </Button>
      </MobileCardInteractive>
  );
}

export default function AdvocateToolsHub() {
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

  return (
    <DashboardLayout>
      <SafeAreaFull>
        <ContainerMobile padding="md" className="space-y-4 pb-32">
          {/* Simple Tool Cards - No Headers or Extras */}
          <div className="space-y-4">
            {allAdvocateTools.map((tool) => {
              const hasAccess = canUse(tool.requiredFeature);
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  hasAccess={hasAccess}
                  currentPlan={currentPlan}
                  onNavigate={handleToolNavigation}
                />
              );
            })}
          </div>
        </ContainerMobile>
      </SafeAreaFull>
    </DashboardLayout>
  );
}