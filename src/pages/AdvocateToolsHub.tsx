import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { UpgradeDialog } from "@/components/UpgradePrompt";
import { useToolAccess } from "@/hooks/useToolAccess";
import { useAuth } from "@/hooks/useAuth";
import { PlanFeatures, SubscriptionPlan } from "@/lib/planAccess";
import { 
  allAdvocateTools,
  coreAdvocateTools,
  specializedAdvocateTools,
  getToolsByCategory,
  getCategoriesWithCounts,
  getPopularTools,
  getNewTools,
  type AdvocateTool
} from "@/lib/advocateToolsRegistry";
import {
  ContainerMobile,
  MobileCard,
  MobileCardInteractive,
  MobileH1,
  MobileH2,
  MobileH3,
  MobileBody,
  MobileBodySmall,
  MobileCaption,
  SafeAreaFull,
  ActionBar,
  BottomSheet,
  BottomSheetControlled
} from "@/components/mobile";
import { 
  Brain, 
  FileText, 
  Users, 
  Calendar,
  Scale,
  Lightbulb, 
  BarChart3, 
  Target,
  MessageSquare, 
  Star,
  Clipboard, 
  Phone, 
  FileBarChart,
  Smile,
  Zap,
  PenTool,
  Sparkles,
  GraduationCap,
  Building,
  TrendingUp,
  Crown,
  Lock,
  ArrowRight,
  Check,
  DollarSign,
  Search,
  Filter,
  Settings
} from "lucide-react";
import { useState } from "react";

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case "Enhanced": return "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600";
    case "Master": return "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600";
    case "Templates": return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700";
    case "Legal": return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700";
    case "Prep": return "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700";
    case "Analytics": return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700";
    case "SMART": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
    case "Secure": return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700";
    case "AI": return "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700";
    case "Tracking": return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    case "Monitor": return "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700";
    case "Reports": return "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700";
    case "Wellness": return "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700";
    case "Autism": return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700";
    case "2e": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
    case "504": return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700";
    case "OT": return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700";
    case "Pro": return "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700";
    case "Agency": return "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700";
    case "Enterprise": return "bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900 dark:to-pink-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600";
    case "Agency+": return "bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900 dark:to-pink-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
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

const getPlanBadgeColor = (plan: SubscriptionPlan) => {
  switch (plan) {
    case 'starter': return 'bg-green-100 text-green-800 border-green-200';
    case 'pro': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'agency': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'agency-plus': return 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface ToolCardProps {
  tool: AdvocateTool;
  hasAccess: boolean;
  currentPlan: SubscriptionPlan;
  onUpgradeClick?: () => void;
}

// Mobile-Native General Upgrade Bottom Sheet Component
function MobileGeneralUpgradeBottomSheet({ 
  isOpen, 
  onClose, 
  currentPlan 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentPlan: SubscriptionPlan;
}) {
  const planOptions = [
    {
      plan: 'pro' as SubscriptionPlan,
      name: 'Pro',
      price: '$29/month',
      features: ['All Pro tools', 'Priority support', 'Advanced analytics', 'Goal tracking'],
      highlight: false
    },
    {
      plan: 'agency' as SubscriptionPlan,
      name: 'Agency',
      price: '$99/month',
      features: ['All Agency tools', 'Team collaboration', 'Custom templates', 'Client management'],
      highlight: true
    },
    {
      plan: 'agency-plus' as SubscriptionPlan,
      name: 'Agency Plus',
      price: '$199/month',
      features: ['Everything included', 'White-label options', 'API access', 'Custom integrations'],
      highlight: false
    }
  ];

  const availablePlans = planOptions.filter(p => p.plan !== currentPlan);

  return (
    <BottomSheetControlled
      isOpen={isOpen}
      onClose={onClose}
      title="Upgrade Your Plan"
      description="Unlock all professional advocacy tools and features"
    >
      <div className="space-y-6">
        {/* Current Plan */}
        <MobileCard variant="outline" padding="md" className="bg-muted/20">
          <div className="text-center space-y-2">
            <MobileCaption>Your Current Plan</MobileCaption>
            <div className="flex items-center justify-center gap-2">
              <Badge className={getPlanBadgeColor(currentPlan)}>
                {getPlanDisplayName(currentPlan)}
              </Badge>
            </div>
          </div>
        </MobileCard>

        {/* Upgrade Options */}
        <div className="space-y-4">
          <MobileH3>Choose Your Upgrade</MobileH3>
          <div className="space-y-3">
            {availablePlans.map((planOption) => (
              <MobileCard 
                key={planOption.plan}
                variant={planOption.highlight ? "elevated" : "outline"}
                padding="md" 
                className={`cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                  planOption.highlight 
                    ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20' 
                    : 'hover:bg-muted/10'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <MobileH3>{planOption.name}</MobileH3>
                        {planOption.highlight && (
                          <Badge className="bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 border-orange-200 text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-primary mt-1">
                        {planOption.price}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {planOption.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <MobileBody className="text-sm">{feature}</MobileBody>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full min-h-[44px] ${
                      planOption.highlight 
                        ? 'bg-gradient-to-r from-primary to-primary/90' 
                        : 'bg-primary'
                    }`}
                    data-testid={`button-upgrade-to-${planOption.plan}`}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to {planOption.name}
                  </Button>
                </div>
              </MobileCard>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4">
          <Button 
            variant="outline" 
            className="w-full min-h-[44px]"
            onClick={onClose}
            data-testid="button-maybe-later-main"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </BottomSheetControlled>
  );
}

// Mobile-Native Tool-Specific Upgrade Bottom Sheet Component
function MobileUpgradeBottomSheet({ 
  isOpen, 
  onClose, 
  tool, 
  currentPlan 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  tool: AdvocateTool;
  currentPlan: SubscriptionPlan;
}) {
  const planPrices = {
    'starter': '$9/month',
    'pro': '$29/month', 
    'agency': '$99/month',
    'agency-plus': '$199/month'
  };

  const planFeatures = {
    'starter': ['Basic tools', 'Email support'],
    'pro': ['All Pro tools', 'Priority support', 'Advanced analytics'],
    'agency': ['All Agency tools', 'Team collaboration', 'Custom templates'],
    'agency-plus': ['Everything included', 'White-label options', 'API access']
  };

  return (
    <BottomSheetControlled
      isOpen={isOpen}
      onClose={onClose}
      title={`Upgrade to ${getPlanDisplayName(tool.requiredPlan)}`}
      description={`Unlock ${tool.title} and all premium features`}
    >
      <div className="space-y-6">
        {/* Tool Preview */}
        <MobileCard variant="outline" padding="md" className="bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <tool.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <MobileH3>{tool.title}</MobileH3>
              <MobileBodySmall className="text-muted-foreground">
                {tool.description}
              </MobileBodySmall>
            </div>
          </div>
        </MobileCard>

        {/* Plan Benefits */}
        <div className="space-y-4">
          <MobileH3>What's Included in {getPlanDisplayName(tool.requiredPlan)}</MobileH3>
          <div className="space-y-3">
            {(planFeatures[tool.requiredPlan] || planFeatures.pro).map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <MobileBody>{feature}</MobileBody>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <MobileCard variant="elevated" padding="md" className="bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">
              {planPrices[tool.requiredPlan] || planPrices.pro}
            </div>
            <MobileCaption>Billed monthly, cancel anytime</MobileCaption>
          </div>
        </MobileCard>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            className="w-full min-h-[52px] text-lg bg-gradient-to-r from-primary to-primary/90"
            data-testid="button-upgrade-plan"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to {getPlanDisplayName(tool.requiredPlan)}
          </Button>
          <Button 
            variant="outline" 
            className="w-full min-h-[44px]"
            onClick={onClose}
            data-testid="button-maybe-later"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </BottomSheetControlled>
  );
}

function ToolCard({ tool, hasAccess, currentPlan, onUpgradeClick }: ToolCardProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!hasAccess) {
    return (
      <>
        <MobileCard 
          data-testid={`tool-card-locked-${tool.id}`}
          variant="outline"
          className="border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/10 to-muted/5 active:from-muted/20 active:to-muted/10 transition-all duration-200 cursor-pointer"
          padding="md"
          onClick={() => setShowUpgrade(true)}
        >
          <div className="flex items-center gap-4 p-2">
            {/* Icon Section */}
            <div className="flex-shrink-0">
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center text-muted-foreground">
                <tool.icon className="h-8 w-8" />
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-muted-foreground/80 rounded-full flex items-center justify-center">
                  <Lock className="h-4 w-4 text-background" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-sm px-2 py-1 font-medium ${getBadgeVariant(tool.badge)}`}>
                    {tool.badge}
                  </Badge>
                  <Badge className={`text-xs px-2 py-1 ${getPlanBadgeColor(tool.requiredPlan)}`}>
                    {getPlanDisplayName(tool.requiredPlan)} Required
                  </Badge>
                </div>
                <MobileH3 className="text-muted-foreground leading-tight">
                  {tool.title}
                </MobileH3>
              </div>
              
              <MobileBodySmall className="leading-relaxed">
                {tool.description}
              </MobileBodySmall>
              
              <div className="flex items-center gap-1 text-muted-foreground/70">
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

        <MobileUpgradeBottomSheet
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          tool={tool}
          currentPlan={currentPlan}
        />
      </>
    );
  }

  return (
    <Link to={tool.route} className="block" data-testid={`tool-card-link-${tool.id}`}>
      <MobileCardInteractive 
        data-testid={`tool-card-unlocked-${tool.id}`}
        className="group active:scale-[0.98] transition-all duration-150 cursor-pointer"
        padding="md"
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
                <Badge className={`text-sm px-2 py-1 font-medium shadow-sm ${getBadgeVariant(tool.badge)}`}>
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
                    New
                  </Badge>
                )}
              </div>
              <MobileH3 className="group-active:text-primary transition-colors leading-tight">
                {tool.title}
              </MobileH3>
            </div>
            
            <MobileBody className="leading-relaxed">
              {tool.description}
            </MobileBody>
            
            <div className="flex items-center gap-1 text-muted-foreground/70">
              <ArrowRight className="h-4 w-4" />
              <MobileCaption>Tap to open tool</MobileCaption>
            </div>
          </div>
        </div>
        
        <Button 
          asChild 
          className="w-full mt-4 min-h-[44px] text-base bg-gradient-to-r from-primary to-primary/90 active:from-primary/90 active:to-primary active:scale-95 transition-all duration-150 shadow-sm pointer-events-none"
          data-testid={`button-open-${tool.id}`}
        >
          <div>
            <ArrowRight className="h-4 w-4 mr-2" />
            Open Tool
          </div>
        </Button>
      </MobileCardInteractive>
    </Link>
  );
}

export default function AdvocateToolsHub() {
  const { user } = useAuth();
  const { canUse, currentPlan } = useToolAccess();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMainUpgrade, setShowMainUpgrade] = useState(false);

  const categories = getCategoriesWithCounts();
  const popularTools = getPopularTools();
  const newTools = getNewTools();

  const filteredTools = selectedCategory === 'All' 
    ? allAdvocateTools 
    : getToolsByCategory(selectedCategory);

  const searchedTools = searchTerm 
    ? filteredTools.filter(tool => 
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredTools;

  return (
    <DashboardLayout>
      <SafeAreaFull>
        {/* Sticky Category Filter Bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <ContainerMobile padding="sm">
            <div className="py-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <Button
                  variant={selectedCategory === 'All' ? 'default' : 'outline'}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setSelectedCategory('All')}
                  data-testid="filter-all"
                >
                  All ({allAdvocateTools.length})
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.category}
                    variant={selectedCategory === cat.category ? 'default' : 'outline'}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setSelectedCategory(cat.category)}
                    data-testid={`filter-${cat.category.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {cat.category} ({cat.count})
                  </Button>
                ))}
              </div>
            </div>
          </ContainerMobile>
        </div>

        <ContainerMobile padding="md" className="space-y-6 pb-32">
          {/* Hero Section */}
          <div className="text-center space-y-4 pt-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-primary" />
              </div>
            </div>
            <MobileH1 className="text-center">
              Professional Advocate Tools
            </MobileH1>
            <MobileBody className="text-muted-foreground leading-relaxed">
              Complete professional toolkit for special education advocacy. 
              Access tools based on your subscription tier with seamless upgrade options.
            </MobileBody>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-sm px-3 py-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {allAdvocateTools.length} Tools
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-1">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge className="bg-green-50 text-green-700 border-green-200 text-sm px-3 py-1">
                <Scale className="h-3 w-3 mr-1" />
                Legal
              </Badge>
              <Badge className={`${getPlanBadgeColor(currentPlan)} text-sm px-3 py-1`}>
                Plan: {getPlanDisplayName(currentPlan)}
              </Badge>
            </div>
          </div>

          {/* Popular Tools - Mobile Native */}
          {popularTools.length > 0 && (
            <MobileCard 
              variant="elevated"
              className="bg-gradient-to-r from-primary/5 to-primary/10"
              padding="md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <MobileH3 className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Popular Tools
                  </MobileH3>
                  {newTools.length > 0 && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-sm px-2 py-1">
                      {newTools.length} New
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  {popularTools.map((tool) => {
                    const hasAccess = canUse(tool.requiredFeature);
                    return (
                      <div key={tool.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 dark:bg-gray-800/50">
                        <div className={`flex-shrink-0 p-3 rounded-xl ${hasAccess ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                          <tool.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <MobileBody className="font-medium truncate">{tool.title}</MobileBody>
                          <MobileCaption>
                            {hasAccess ? 'Available' : `Requires ${getPlanDisplayName(tool.requiredPlan)}`}
                          </MobileCaption>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </MobileCard>
          )}

          {/* Tools List - Single Column Mobile Layout */}
          <div className="space-y-4">
            <MobileH2 className="text-center">
              {selectedCategory === 'All' ? 'Complete Professional Toolbox' : selectedCategory}
              {searchTerm && (
                <MobileCaption className="block mt-2 text-muted-foreground">
                  {searchedTools.length} results for "{searchTerm}"
                </MobileCaption>
              )}
            </MobileH2>
            
            <div className="space-y-4">
              {searchedTools.map((tool) => {
                const hasAccess = canUse(tool.requiredFeature);
                return (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    hasAccess={hasAccess}
                    currentPlan={currentPlan}
                  />
                );
              })}
            </div>

            {searchedTools.length === 0 && searchTerm && (
              <MobileCard variant="outline" padding="lg" className="text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <MobileH3>No tools found</MobileH3>
                    <MobileBody className="text-muted-foreground">
                      Try adjusting your search or browse all tools
                    </MobileBody>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                </div>
              </MobileCard>
            )}
          </div>

          {/* Summary Stats - Mobile Optimized */}
          <MobileCard 
            variant="elevated"
            className="bg-gradient-to-r from-primary/5 to-primary/10"
            padding="lg"
          >
            <div className="text-center space-y-6">
              <MobileH2>Professional Special Education Advocacy</MobileH2>
              <MobileBody className="text-muted-foreground leading-relaxed">
                Our professional tools leverage advanced technology and legal expertise to provide 
                comprehensive advocacy support. Each tool is designed to streamline your workflow 
                and improve client outcomes through evidence-based practices.
              </MobileBody>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{allAdvocateTools.length}</div>
                  <MobileCaption>Professional Tools</MobileCaption>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{categories.length}</div>
                  <MobileCaption>Tool Categories</MobileCaption>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {allAdvocateTools.filter(t => canUse(t.requiredFeature)).length}
                  </div>
                  <MobileCaption>Available to You</MobileCaption>
                </div>
              </div>
            </div>
          </MobileCard>
        </ContainerMobile>

        {/* Sticky Action Bar - Mobile Native */}
        <ActionBar variant="elevated" className="bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 min-h-[52px]"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-search"
            >
              <Search className="h-5 w-5 mr-2" />
              Search Tools
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-h-[52px] px-4"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="min-h-[52px] px-6 bg-gradient-to-r from-primary to-primary/90"
              onClick={() => setShowMainUpgrade(true)}
              data-testid="button-upgrade-main"
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade
            </Button>
          </div>
        </ActionBar>

        {/* Search/Filter Bottom Sheet */}
        <BottomSheetControlled
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          title="Search & Filter Tools"
          description="Find the perfect tool for your needs"
        >
          <div className="space-y-6">
            {/* Search Input */}
            <div className="space-y-2">
              <MobileH3>Search Tools</MobileH3>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-h-[52px] px-4 py-3 rounded-lg border border-border bg-background text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-testid="input-search"
              />
            </div>

            {/* Quick Category Filters */}
            <div className="space-y-3">
              <MobileH3>Quick Filters</MobileH3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedCategory === 'All' ? 'default' : 'outline'}
                  className="min-h-[48px] justify-start"
                  onClick={() => setSelectedCategory('All')}
                >
                  All Tools ({allAdvocateTools.length})
                </Button>
                {categories.slice(0, 5).map((cat) => (
                  <Button
                    key={cat.category}
                    variant={selectedCategory === cat.category ? 'default' : 'outline'}
                    className="min-h-[48px] justify-start"
                    onClick={() => setSelectedCategory(cat.category)}
                  >
                    {cat.category} ({cat.count})
                  </Button>
                ))}
              </div>
            </div>

            {/* Plan Access Filter */}
            <div className="space-y-3">
              <MobileH3>Access Level</MobileH3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <MobileBody>Available Now</MobileBody>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {allAdvocateTools.filter(t => canUse(t.requiredFeature)).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-orange-600" />
                    <MobileBody>Requires Upgrade</MobileBody>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    {allAdvocateTools.filter(t => !canUse(t.requiredFeature)).length}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Clear All */}
            <Button
              variant="outline"
              className="w-full min-h-[52px]"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setShowFilters(false);
              }}
              data-testid="button-clear-all"
            >
              Clear All Filters
            </Button>
          </div>
        </BottomSheetControlled>

        {/* Main Upgrade Bottom Sheet */}
        <MobileGeneralUpgradeBottomSheet
          isOpen={showMainUpgrade}
          onClose={() => setShowMainUpgrade(false)}
          currentPlan={currentPlan}
        />
      </SafeAreaFull>
    </DashboardLayout>
  );
}