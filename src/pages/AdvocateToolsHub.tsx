import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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
  DollarSign
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
}

function ToolCard({ tool, hasAccess, currentPlan }: ToolCardProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!hasAccess) {
    return (
      <Card 
        data-testid={`tool-card-locked-${tool.id}`}
        className="relative overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/10 to-muted/5 hover:from-muted/20 hover:to-muted/10 transition-all duration-300"
      >
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center text-muted-foreground">
              <tool.icon className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted-foreground/80 rounded-full flex items-center justify-center">
                <Lock className="h-3 w-3 text-background" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Badge className={`text-xs px-2 py-1 font-medium ${getBadgeVariant(tool.badge)}`}>
                  {tool.badge}
                </Badge>
                <Badge className={`text-xs px-2 py-1 font-medium ${getPlanBadgeColor(tool.requiredPlan)}`}>
                  {getPlanDisplayName(tool.requiredPlan)} Required
                </Badge>
              </div>
              <CardTitle className="text-sm font-semibold text-muted-foreground leading-tight">
                {tool.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 px-4 pb-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3 flex-1">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {tool.description}
            </p>
            <div className="text-xs text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground/70">
                <Crown className="h-3 w-3" />
                <span>Unlock with {getPlanDisplayName(tool.requiredPlan)}</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline"
            size="sm" 
            className="w-full text-xs py-2 border-dashed border-muted-foreground/50 bg-muted/10 text-muted-foreground hover:bg-muted/20 hover:text-muted-foreground hover:border-muted-foreground/70"
            onClick={() => setShowUpgrade(true)}
            data-testid={`button-upgrade-${tool.id}`}
          >
            <Lock className="h-3 w-3 mr-1" />
            Upgrade to Access
          </Button>
        </CardContent>

        <UpgradeDialog
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          requiredPlan={tool.requiredPlan}
          toolName={tool.title}
          benefits={tool.features}
        />
      </Card>
    );
  }

  return (
    <Card 
      data-testid={`tool-card-unlocked-${tool.id}`}
      className="card-elevated group cursor-pointer transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 flex flex-col"
    >
      <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground transition-all duration-300 shadow-lg group-hover:shadow-xl">
            <tool.icon className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Badge className={`text-xs px-2 py-1 font-medium shadow-sm ${getBadgeVariant(tool.badge)}`}>
                {tool.badge}
              </Badge>
              {tool.isPopular && (
                <Badge className="text-xs px-2 py-1 font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              {tool.isNew && (
                <Badge className="text-xs px-2 py-1 font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                  New
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight dark:text-gray-100">
              {tool.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 pb-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3 flex-1 flex items-center">
          <p className="text-xs text-gray-600 dark:text-gray-300 text-center leading-relaxed">
            {tool.description}
          </p>
        </div>
        
        <Button 
          asChild 
          size="sm" 
          className="w-full text-xs py-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary dark:from-primary dark:to-primary/90 shadow-sm"
          data-testid={`button-open-${tool.id}`}
        >
          <Link to={tool.route}>
            Open Tool
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdvocateToolsHub() {
  const { user } = useAuth();
  const { canUse, currentPlan } = useToolAccess();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = getCategoriesWithCounts();
  const popularTools = getPopularTools();
  const newTools = getNewTools();

  const filteredTools = selectedCategory === 'All' 
    ? allAdvocateTools 
    : getToolsByCategory(selectedCategory);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Professional Advocate Tools</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete professional toolkit for special education advocacy. 
            Access tools based on your subscription tier with seamless upgrade options.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              {allAdvocateTools.length} Professional Tools
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Scale className="h-3 w-3 mr-1" />
              Legal Compliance
            </Badge>
            <Badge variant="outline" className={`${getPlanBadgeColor(currentPlan)}`}>
              Your Plan: {getPlanDisplayName(currentPlan)}
            </Badge>
          </div>
        </div>

        {/* Quick Stats & Popular Tools */}
        {popularTools.length > 0 && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Popular Tools
                </h3>
                {newTools.length > 0 && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {newTools.length} New Tools
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                {popularTools.map((tool) => {
                  const hasAccess = canUse(tool.requiredFeature);
                  return (
                    <div key={tool.id} className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-gray-800/50">
                      <div className={`p-2 rounded-lg ${hasAccess ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                        <tool.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{tool.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {hasAccess ? 'Available' : `Requires ${getPlanDisplayName(tool.requiredPlan)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('All')}
            data-testid="filter-all"
          >
            All Tools ({allAdvocateTools.length})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.category}
              variant={selectedCategory === cat.category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.category)}
              data-testid={`filter-${cat.category.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {cat.category} ({cat.count})
            </Button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            {selectedCategory === 'All' ? 'Complete Professional Toolbox' : selectedCategory}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredTools.map((tool) => {
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
        </div>

        {/* Summary Stats */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold">Professional Special Education Advocacy</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our professional tools leverage advanced technology and legal expertise to provide 
                comprehensive advocacy support. Each tool is designed to streamline your workflow 
                and improve client outcomes through evidence-based practices.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{allAdvocateTools.length}</div>
                  <div className="text-sm text-muted-foreground">Professional Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{categories.length}</div>
                  <div className="text-sm text-muted-foreground">Tool Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {allAdvocateTools.filter(t => canUse(t.requiredFeature)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Available to You</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}