import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ToolTeaser } from "@/components/ToolTeaser";
import { useToolAccess } from "@/hooks/useToolAccess";
import { useAuth } from "@/hooks/useAuth";
import { PlanFeatures, SubscriptionPlan } from "@/lib/planAccess";
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
  TrendingUp
} from "lucide-react";

// Get user role from current location
const getUserRole = () => {
  const path = window.location.pathname;
  if (path.startsWith('/parent')) return 'parent';
  if (path.startsWith('/advocate')) return 'advocate';
  return 'advocate'; // default to advocate
};

const advocateTools = [
  {
    title: "Unified IEP Review",
    description: "Comprehensive AI-powered IEP analysis with quality scoring, compliance checks, and actionable improvement recommendations.",
    icon: Brain,
    path: "/advocate/tools/unified-iep-review",
    category: "AI Analysis",
    badge: "Enhanced",
    features: ["AI-powered analysis", "Quality scoring", "Compliance checks", "Professional insights"]
  },
  {
    title: "IEP Master Suite",
    description: "Complete IEP management toolkit with goal tracking, progress monitoring, and comprehensive reporting for professional advocacy.",
    icon: FileBarChart,
    path: "/advocate/tools/iep-master-suite",
    category: "IEP Planning",
    badge: "Master",
    features: ["Goal tracking", "Progress monitoring", "Comprehensive reporting", "Professional analysis"]
  },
  {
    title: "Smart Letter Generator",
    description: "Generate legally sound advocacy letters with professional templates and customization options.",
    icon: PenTool,
    path: "/smart-letter-generator",
    category: "Communication",
    badge: "Templates",
    features: ["Legal Language", "Professional Format", "Customization", "Client Templates"]
  },
  {
    title: "Rights Explainer",
    description: "Plain-language legal rights guide with comprehensive special education law explanations.",
    icon: Scale,
    path: "/idea-rights-guide",
    category: "Legal Support",
    badge: "Legal",
    features: ["Legal Rights", "Plain Language", "Case Examples", "Resource Links"]
  },
  {
    title: "Meeting Prep Assistant",
    description: "Generate talking points, meeting agendas, and professional preparation materials for IEP meetings.",
    icon: Lightbulb,
    path: "/meeting-prep-wizard",
    category: "Meeting Support",
    badge: "Prep",
    features: ["Meeting Agenda", "Talking Points", "Legal Strategy", "Documentation"]
  },
  {
    title: "Progress Analyzer",
    description: "Data-driven analysis and recommendations for IEP goals with professional reporting capabilities.",
    icon: BarChart3,
    path: "/advocate/tools/progress-analyzer",
    category: "Data Analysis",
    badge: "Analytics",
    features: ["Data Analysis", "Progress Reports", "Goal Tracking", "Outcome Metrics"]
  },
  {
    title: "IEP Goal Generator",
    description: "AI-powered SMART goal creation with professional standards and compliance verification.",
    icon: Target,
    path: "/advocate/tools/goal-generator",
    category: "IEP Planning",
    badge: "SMART",
    features: ["SMART Goals", "Standards Alignment", "Progress Metrics", "Compliance Check"]
  },
  {
    title: "Advocate Messaging",
    description: "Secure communication platform for client interactions with professional documentation features.",
    icon: MessageSquare,
    path: "/messages",
    category: "Professional Support",
    badge: "Secure",
    features: ["Secure Messages", "Client Portal", "Document Sharing", "Communication Log"]
  },
  {
    title: "Ask AI About Docs",
    description: "Query uploaded documents with AI assistance for quick insights and professional analysis.",
    icon: Sparkles,
    path: "/advocate/tools/ask-ai-docs",
    category: "AI Tools",
    badge: "AI",
    features: ["Document Query", "AI Analysis", "Quick Insights", "Professional Reports"]
  },
  {
    title: "Progress Notes & Service Log",
    description: "Comprehensive tracking of service delivery, client interactions, and professional outcomes.",
    icon: Clipboard,
    path: "/advocate/tools/progress-notes",
    category: "Case Management",
    badge: "Tracking",
    features: ["Service Logs", "Progress Notes", "Billing Support", "Compliance Records"]
  },
  {
    title: "Communication Tracker",
    description: "Monitor and document all parent-school communications with professional analysis and recommendations.",
    icon: Phone,
    path: "/advocate/tools/communication-tracker",
    category: "Case Management",
    badge: "Monitor",
    features: ["Communication Log", "Analysis Tools", "Follow-up Tracking", "Legal Documentation"]
  },
  {
    title: "Advocacy Reports",
    description: "Generate comprehensive client reports with professional analysis and actionable recommendations.",
    icon: FileText,
    path: "/advocate/tools/advocacy-reports",
    category: "Professional Support",
    badge: "Reports",
    features: ["Client Reports", "Progress Analysis", "Legal Summary", "Action Plans"]
  },
  {
    title: "Emotion Tracker",
    description: "Student well-being monitoring tools with professional behavioral analysis and intervention planning.",
    icon: Smile,
    path: "/advocate/tools/emotion-tracker",
    category: "Behavioral Support",
    badge: "Wellness",
    features: ["Behavior Tracking", "Intervention Plans", "Progress Monitoring", "Professional Analysis"]
  }
];

const specializedTools = [
  {
    title: "Autism Accommodation Builder",
    description: "Professional autism-specific accommodations with sensory, communication, and behavioral support.",
    icon: Brain,
    path: "/autism-accommodations",
    category: "Specialized Needs",
    badge: "Autism",
    features: ["Sensory Support", "Communication Plans", "Behavioral Strategies", "Professional Standards"]
  },
  {
    title: "Gifted & 2e Learners",
    description: "Comprehensive support for gifted and twice-exceptional learners with professional assessment tools.",
    icon: GraduationCap,
    path: "/gifted-2e-learners",
    category: "Specialized Needs",
    badge: "2e",
    features: ["Giftedness Assessment", "Learning Differences", "Acceleration Plans", "Professional Evaluation"]
  },
  {
    title: "504 Plan Builder",
    description: "Section 504 accommodation planning with legal compliance and professional documentation.",
    icon: Building,
    path: "/advocate/tools/504-plan-builder",
    category: "Legal Planning",
    badge: "504",
    features: ["504 Compliance", "Accommodation Plans", "Legal Standards", "Documentation Tools"]
  },
  {
    title: "OT Activity Recommender",
    description: "Professional occupational therapy activity suggestions and adaptations for IEP implementation.",
    icon: Zap,
    path: "/advocate/tools/ot-recommender",
    category: "Therapeutic Support",
    badge: "OT",
    features: ["OT Activities", "Professional Adaptations", "Progress Tracking", "Therapy Plans"]
  }
];

const categories = Array.from(new Set(advocateTools.map(tool => tool.category)));
const allTools = [...advocateTools, ...specializedTools];

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case "Pro": return "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700";
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
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
  }
};

export default function AdvocateToolsHub() {
  const userRole = getUserRole();
  const { user } = useAuth();
  const { hasAccess, currentPlan } = useToolAccess();

  // Map tool paths to feature keys for access control
  const mapToolPathToFeature = (path: string): keyof PlanFeatures => {
    // Remove leading slash and extract the tool identifier
    const cleanPath = path.replace(/^\/+/, '');
    
    const pathMap: Record<string, keyof PlanFeatures> = {
      'advocate/unified-iep-review': 'unifiedIEPReview',
      'advocate/tools/unified-iep-review': 'unifiedIEPReview',
      'unified-iep-review': 'unifiedIEPReview',
      
      'advocate/smart-letter-generator': 'smartLetterGenerator',
      'advocate/tools/smart-letter-generator': 'smartLetterGenerator', 
      'smart-letter-generator': 'smartLetterGenerator',
      
      'advocate/idea-rights-guide': 'ideaRightsGuide',
      'idea-rights-guide': 'ideaRightsGuide',
      
      'advocate/meeting-prep-wizard': 'meetingPrepWizard',
      'advocate/tools/meeting-prep': 'meetingPrepWizard',
      'meeting-prep-wizard': 'meetingPrepWizard',
      
      'advocate/tools/progress-analyzer': 'caseAnalytics',
      'progress-analyzer': 'caseAnalytics',
      
      'advocate/tools/goal-generator': 'goalGenerator',
      'goal-generator': 'goalGenerator',
      
      'advocate/tools/communication-tracker': 'communicationTracker',
      'communication-tracker': 'communicationTracker',
      
      'advocate/tools/advocacy-reports': 'advocacyReports', 
      'advocacy-reports': 'advocacyReports',
      
      'advocate/tools/emotion-tracker': 'emotionTracker',
      'emotion-tracker': 'emotionTracker',
      
      'advocate/tools/504-plan-builder': 'plan504Builder',
      '504-plan-builder': 'plan504Builder',
      
      'advocate/tools/ot-recommender': 'otActivityRecommender',
      'ot-recommender': 'otActivityRecommender',
      
      'autism-accommodations': 'autismAccommodationBuilder',
      'advocate/tools/autism-accommodations': 'autismAccommodationBuilder',
      
      'gifted-2e-learners': 'giftedTwoeSupport',
      'advocate/tools/gifted-2e-learners': 'giftedTwoeSupport',
      
      'messages': 'advocateMessaging',
      'advocate/messages': 'advocateMessaging',
      
      'advocate/tools/ask-ai-docs': 'askAIAboutDocs',
      'ask-ai-docs': 'askAIAboutDocs',
      
      'advocate/tools/progress-notes': 'progressNotes',
      'progress-notes': 'progressNotes'
    };
    
    return pathMap[cleanPath] || 'professionalAnalysis'; // Default fallback
  };

  const getRequiredPlan = (path: string): SubscriptionPlan => {
    // For now, most advocate tools require 'pro' plan minimum
    const feature = mapToolPathToFeature(path);
    // This is a simplified mapping - in a real app you'd have more sophisticated logic
    return 'pro';
  };
  
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
            Advanced professional tools and specialized resources for special education advocacy, 
            designed to streamline case management and improve client outcomes.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              {allTools.length} Professional Tools
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Scale className="h-3 w-3 mr-1" />
              Legal Compliance
            </Badge>
          </div>
        </div>

        {/* Compact Professional Tools Grid - All Tools Visible */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Complete Professional Toolbox</h2>
          
          {/* Main Professional Tools */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-center text-gray-700">Core Professional Tools</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {advocateTools.map((tool) => {
                const toolPath = tool.path.startsWith('/advocate/') || tool.path.startsWith('/parent/') ? tool.path : `/${userRole}${tool.path}`;
                const featureKey = mapToolPathToFeature(toolPath);
                const hasToolAccess = hasAccess(featureKey);

                if (!hasToolAccess) {
                  return (
                    <ToolTeaser
                      key={tool.title}
                      toolName={tool.title}
                      description={tool.description}
                      icon={<tool.icon className="h-5 w-5" />}
                      benefits={tool.features || []}
                      requiredPlan={getRequiredPlan(toolPath)}
                      className="h-full"
                    />
                  );
                }

                return (
                  <Card key={tool.title} className="card-elevated group cursor-pointer transform hover:scale-[1.05] transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 flex flex-col">
                    <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground transition-all duration-300 shadow-lg group-hover:shadow-xl">
                          <tool.icon className="h-7 w-7" />
                        </div>
                        <div className="space-y-2">
                          <Badge className={`text-xs px-3 py-1 font-medium shadow-sm ${
                            tool.badge === 'Pro' ? 'bg-gradient-to-r from-accent to-accent-light text-accent-foreground' :
                            tool.badge === 'Templates' ? 'bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground' :
                            tool.badge === 'Legal' ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground' :
                            tool.badge === 'Prep' ? 'bg-gradient-to-r from-accent to-accent-light text-accent-foreground' :
                            tool.badge === 'Analytics' ? 'bg-gradient-to-r from-success to-success-light text-success-foreground' :
                            tool.badge === 'SMART' ? 'bg-gradient-to-r from-warning to-warning-light text-warning-foreground' :
                            tool.badge === 'Secure' ? 'bg-gradient-to-r from-destructive to-destructive-light text-destructive-foreground' :
                            tool.badge === 'AI' ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' :
                            'bg-gradient-to-r from-success to-success-light text-success-foreground'
                          }`}>
                            {tool.badge}
                          </Badge>
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
                      
                      <Button asChild size="sm" className="w-full text-xs py-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary dark:from-primary dark:to-primary/90 shadow-sm">
                        <Link to={toolPath}>
                          Open Tool
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Specialized Tools Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-center text-gray-700">Specialized Assessment Tools</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {specializedTools.map((tool) => {
                const toolPath = tool.path.startsWith('/advocate/') || tool.path.startsWith('/parent/') ? tool.path : `/${userRole}${tool.path}`;
                const featureKey = mapToolPathToFeature(toolPath);
                const hasToolAccess = hasAccess(featureKey);

                if (!hasToolAccess) {
                  return (
                    <ToolTeaser
                      key={tool.title}
                      toolName={tool.title}
                      description={tool.description}
                      icon={<tool.icon className="h-5 w-5" />}
                      benefits={tool.features || []}
                      requiredPlan={getRequiredPlan(toolPath)}
                      className="h-full"
                    />
                  );
                }

                return (
                  <Card key={tool.title} className="hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group border border-gray-200 hover:border-primary/30 bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-gray-800 dark:border-gray-700 dark:hover:border-primary/50 flex flex-col">
                    <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-900/80 group-hover:bg-white dark:group-hover:bg-gray-900 group-hover:shadow-md transition-all duration-200 backdrop-blur-sm">
                          <tool.icon className="h-6 w-6 text-primary dark:text-primary" />
                        </div>
                        <div className="space-y-2">
                          <Badge className={`text-xs px-3 py-1 font-medium shadow-sm ${
                            tool.badge === 'Pro' ? 'bg-gradient-to-r from-accent to-accent-light text-accent-foreground' :
                            tool.badge === 'Templates' ? 'bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground' :
                            tool.badge === 'Legal' ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground' :
                            tool.badge === 'Prep' ? 'bg-gradient-to-r from-accent to-accent-light text-accent-foreground' :
                            tool.badge === 'Analytics' ? 'bg-gradient-to-r from-success to-success-light text-success-foreground' :
                            tool.badge === 'SMART' ? 'bg-gradient-to-r from-warning to-warning-light text-warning-foreground' :
                            tool.badge === 'Secure' ? 'bg-gradient-to-r from-destructive to-destructive-light text-destructive-foreground' :
                            tool.badge === 'AI' ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' :
                            'bg-gradient-to-r from-success to-success-light text-success-foreground'
                          }`}>
                            {tool.badge}
                          </Badge>
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
                      
                      <Button asChild size="sm" className="w-full text-xs py-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary dark:from-primary dark:to-primary/90 shadow-sm">
                        <Link to={toolPath}>
                          Open Tool
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold">Professional Special Education Advocacy</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our professional tools leverage advanced technology and legal expertise to provide 
                comprehensive support for advocates and their clients in the special education system.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">AI</div>
                  <div className="text-sm text-muted-foreground">Powered Analysis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">Legal</div>
                  <div className="text-sm text-muted-foreground">Compliance Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">Pro</div>
                  <div className="text-sm text-muted-foreground">Professional Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Available Access</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}