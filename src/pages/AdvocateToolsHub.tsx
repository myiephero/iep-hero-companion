import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Brain, 
  FileText, 
  Users, 
  Scale,
  Lightbulb, 
  BarChart3, 
  MessageSquare, 
  Sparkles, 
  Clipboard, 
  Phone, 
  Target,
  Smile,
  Zap,
  PenTool,
  UserPlus,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Building
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
    title: "AI IEP Review & Compliance",
    description: "Upload and analyze IEP documents with AI-powered insights, compliance checking, and professional recommendations.",
    icon: Brain,
    path: "/tools/ai-iep-review",
    category: "AI Tools",
    badge: "Pro",
    features: ["Document Analysis", "Compliance Check", "AI Recommendations", "Legal Review"]
  },
  {
    title: "Smart Letter Generator",
    description: "Generate legally sound advocacy letters with professional templates and customization options.",
    icon: PenTool,
    path: "/tools/smart-letter",
    category: "Communication",
    badge: "Templates",
    features: ["Legal Language", "Professional Format", "Customization", "Client Templates"]
  },
  {
    title: "Rights Explainer",
    description: "Plain-language legal rights guide with comprehensive special education law explanations.",
    icon: Scale,
    path: "/tools/rights-explainer",
    category: "Legal Support",
    badge: "Legal",
    features: ["Legal Rights", "Plain Language", "Case Examples", "Resource Links"]
  },
  {
    title: "Meeting Prep Assistant",
    description: "Generate talking points, meeting agendas, and professional preparation materials for IEP meetings.",
    icon: Lightbulb,
    path: "/tools/meeting-prep",
    category: "Meeting Support",
    badge: "Prep",
    features: ["Meeting Agenda", "Talking Points", "Legal Strategy", "Documentation"]
  },
  {
    title: "Progress Analyzer",
    description: "Data-driven analysis and recommendations for IEP goals with professional reporting capabilities.",
    icon: BarChart3,
    path: "/tools/progress-analyzer",
    category: "Data Analysis",
    badge: "Analytics",
    features: ["Data Analysis", "Progress Reports", "Goal Tracking", "Outcome Metrics"]
  },
  {
    title: "IEP Goal Generator",
    description: "AI-powered SMART goal creation with professional standards and compliance verification.",
    icon: Target,
    path: "/tools/goal-generator",
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
    path: "/tools/ask-ai-docs",
    category: "AI Tools",
    badge: "AI",
    features: ["Document Query", "AI Analysis", "Quick Insights", "Professional Reports"]
  },
  {
    title: "Progress Notes & Service Log",
    description: "Comprehensive tracking of service delivery, client interactions, and professional outcomes.",
    icon: Clipboard,
    path: "/tools/progress-notes",
    category: "Case Management",
    badge: "Tracking",
    features: ["Service Logs", "Progress Notes", "Billing Support", "Compliance Records"]
  },
  {
    title: "Communication Tracker",
    description: "Monitor and document all parent-school communications with professional analysis and recommendations.",
    icon: Phone,
    path: "/tools/communication-tracker",
    category: "Case Management",
    badge: "Monitor",
    features: ["Communication Log", "Analysis Tools", "Follow-up Tracking", "Legal Documentation"]
  },
  {
    title: "Advocacy Reports",
    description: "Generate comprehensive client reports with professional analysis and actionable recommendations.",
    icon: FileText,
    path: "/tools/advocacy-reports",
    category: "Professional Support",
    badge: "Reports",
    features: ["Client Reports", "Progress Analysis", "Legal Summary", "Action Plans"]
  },
  {
    title: "Emotion Tracker",
    description: "Student well-being monitoring tools with professional behavioral analysis and intervention planning.",
    icon: Smile,
    path: "/tools/emotion-tracker",
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
    path: "/tools/autism-accommodations",
    category: "Specialized Needs",
    badge: "Autism",
    features: ["Sensory Support", "Communication Plans", "Behavioral Strategies", "Professional Standards"]
  },
  {
    title: "Gifted & 2e Learners",
    description: "Comprehensive support for gifted and twice-exceptional learners with professional assessment tools.",
    icon: GraduationCap,
    path: "/tools/gifted-2e-learners",
    category: "Specialized Needs",
    badge: "2e",
    features: ["Giftedness Assessment", "Learning Differences", "Acceleration Plans", "Professional Evaluation"]
  },
  {
    title: "504 Plan Builder",
    description: "Section 504 accommodation planning with legal compliance and professional documentation.",
    icon: Building,
    path: "/tools/504-plan-builder",
    category: "Legal Planning",
    badge: "504",
    features: ["504 Compliance", "Accommodation Plans", "Legal Standards", "Documentation Tools"]
  },
  {
    title: "OT Activity Recommender",
    description: "Professional occupational therapy activity suggestions and adaptations for IEP implementation.",
    icon: Zap,
    path: "/tools/ot-recommender",
    category: "Therapeutic Support",
    badge: "OT",
    features: ["OT Activities", "Professional Adaptations", "Progress Tracking", "Therapy Plans"]
  }
];

const categories = Array.from(new Set(advocateTools.map(tool => tool.category)));
const allTools = [...advocateTools, ...specializedTools];

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case "Pro": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Templates": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Legal": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Prep": return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "Analytics": return "bg-green-100 text-green-700 border-green-200";
    case "SMART": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Secure": return "bg-red-100 text-red-700 border-red-200";
    case "AI": return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "Tracking": return "bg-gray-100 text-gray-700 border-gray-200";
    case "Monitor": return "bg-pink-100 text-pink-700 border-pink-200";
    case "Reports": return "bg-violet-100 text-violet-700 border-violet-200";
    case "Wellness": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Autism": return "bg-blue-100 text-blue-700 border-blue-200";
    case "2e": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "504": return "bg-orange-100 text-orange-700 border-orange-200";
    case "OT": return "bg-green-100 text-green-700 border-green-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function AdvocateToolsHub() {
  const userRole = getUserRole();
  
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

        {/* Professional Tools Grid by Category */}
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                {category === "AI Tools" && <Brain className="h-6 w-6" />}
                {category === "Communication" && <MessageSquare className="h-6 w-6" />}
                {category === "Legal Support" && <Scale className="h-6 w-6" />}
                {category === "Meeting Support" && <Lightbulb className="h-6 w-6" />}
                {category === "Data Analysis" && <BarChart3 className="h-6 w-6" />}
                {category === "IEP Planning" && <Target className="h-6 w-6" />}
                {category === "Professional Support" && <Users className="h-6 w-6" />}
                {category === "Case Management" && <Clipboard className="h-6 w-6" />}
                {category === "Behavioral Support" && <Smile className="h-6 w-6" />}
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advocateTools
                  .filter(tool => tool.category === category)
                  .map((tool) => (
                    <Card key={tool.title} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                      <CardHeader className="space-y-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 shadow-sm">
                            <tool.icon className="h-7 w-7 text-primary" />
                          </div>
                          <Badge className={`${getBadgeVariant(tool.badge)} font-medium px-3 py-1 shadow-sm`}>
                            {tool.badge}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                            {tool.title}
                          </CardTitle>
                          <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                            {tool.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-5 pt-0">
                        <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-4 space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            Key Features
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {tool.features.map((feature, index) => (
                              <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 py-1">
                                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full flex-shrink-0"></div>
                                <span className="font-medium">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Button asChild className="w-full group-hover:shadow-lg transition-all duration-300 font-medium py-2.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                          <Link to={`/${userRole}${tool.path}`}>
                            Open Tool
                            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Specialized Tools Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Specialized Assessment Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializedTools.map((tool) => (
              <Card key={tool.title} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group border-0 shadow-md bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="space-y-4 pb-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="p-4 rounded-xl bg-white/80 dark:bg-gray-900/80 group-hover:bg-white group-hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                      <tool.icon className="h-7 w-7 text-primary" />
                    </div>
                    <Badge className={`${getBadgeVariant(tool.badge)} font-medium px-3 py-1 shadow-sm bg-white/90 dark:bg-gray-900/90`}>
                      {tool.badge}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {tool.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5 pt-0 relative z-10">
                  <div className="bg-white/60 dark:bg-gray-900/30 rounded-lg p-4 space-y-3 backdrop-blur-sm">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="text-xs text-gray-700 dark:text-gray-400 flex items-center gap-2 py-1">
                          <div className="w-1.5 h-1.5 bg-primary/70 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button asChild className="w-full group-hover:shadow-lg transition-all duration-300 font-medium py-2.5 bg-primary/90 hover:bg-primary backdrop-blur-sm">
                    <Link to={`/${userRole}${tool.path}`}>
                      Open Tool
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
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