import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Brain, FileText, Users, Star, Zap, Building, BookOpen, MessageSquare, Target, TrendingUp } from "lucide-react";

// Get user role from current location
const getUserRole = () => {
  const path = window.location.pathname;
  if (path.startsWith('/parent')) return 'parent';
  if (path.startsWith('/advocate')) return 'advocate';
  return 'parent'; // default to parent
};

const emergentTools = [
  {
    title: "IEP Review Tool",
    description: "Comprehensive IEP review and analysis with detailed feedback, compliance checking, and improvement recommendations.",
    icon: TrendingUp,
    path: "/tools/iep-review",
    category: "IEP Analysis",
    badge: "Core",
    features: ["Comprehensive Review", "Compliance Check", "Goal Analysis", "Progress Tracking"]
  },
  {
    title: "AI IEP Review",
    description: "Upload and analyze IEP documents with AI-powered insights, compliance checking, and personalized recommendations.",
    icon: Brain,
    path: "/tools/ai-iep-review",
    category: "AI Tools",
    badge: "New",
    features: ["Document Analysis", "Compliance Check", "AI Recommendations", "Goal Analysis"]
  },
  {
    title: "Autism Accommodation Builder",
    description: "Create autism-specific accommodations with sensory, communication, and behavioral support recommendations.",
    icon: Zap,
    path: "/tools/autism-accommodations",
    category: "Accommodations",
    badge: "Specialized",
    features: ["Sensory Support", "Communication Aids", "Behavioral Plans", "Environmental Mods"]
  },
  {
    title: "Advocate Matching Tool",
    description: "Find and connect with qualified special education advocates in your area based on specialization and needs.",
    icon: Users,
    path: "/tools/advocate-matching",
    category: "Professional Support",
    badge: "Connect",
    features: ["Expert Matching", "Direct Messaging", "Reviews & Ratings", "Specialization Filter"]
  },
  {
    title: "Gifted & 2e Learners",
    description: "Comprehensive profiles for gifted and twice-exceptional learners with strength-based planning.",
    icon: Star,
    path: "/tools/gifted-2e-learners",
    category: "Specialized Needs",
    badge: "2e",
    features: ["Giftedness Areas", "Learning Differences", "Acceleration Plans", "Enrichment Activities"]
  },
  {
    title: "Smart Letter Generator",
    description: "Generate professional advocacy letters with templates for various special education situations.",
    icon: FileText,
    path: "/parent/tools/smart-letter",
    category: "Communication",
    badge: "Templates",
    features: ["Letter Templates", "Legal Language", "Customization", "Professional Format"]
  },
  {
    title: "Meeting Prep Wizard",
    description: "Prepare for IEP meetings with guided checklists, goal setting, and question preparation.",
    icon: Target,
    path: "/parent/tools/meeting-prep",
    category: "Meeting Support",
    badge: "Prep",
    features: ["Meeting Agenda", "Goal Tracking", "Question Lists", "Action Items"]
  },
  {
    title: "Document Vault",
    description: "Secure storage and organization for all IEP documents, evaluations, and educational records.",
    icon: Building,
    path: "/tools/document-vault",
    category: "Organization",
    badge: "Secure",
    features: ["Secure Storage", "Easy Organization", "Quick Search", "Share & Export"]
  },
  {
    title: "Student Profiles",
    description: "Comprehensive student profiles with goals, accommodations, services, and progress tracking.",
    icon: BookOpen,
    path: "/tools/student-profiles",
    category: "Student Management",
    badge: "Core",
    features: ["Goal Tracking", "Service Plans", "Progress Notes", "Timeline View"]
  },
  {
    title: "Expert Analysis",
    description: "Professional expert analysis and detailed assessments with comprehensive reporting and recommendations.",
    icon: Target,
    path: "/parent/tools/expert-analysis",
    category: "Professional Support",
    badge: "Pro",
    features: ["Expert Review", "Detailed Reports", "Professional Insights", "Action Plans"]
  }
];

const categories = Array.from(new Set(emergentTools.map(tool => tool.category)));

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case "Core": return "bg-slate-100 text-slate-700 border-slate-200";
    case "New": return "bg-green-100 text-green-700 border-green-200";
    case "Specialized": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Connect": return "bg-purple-100 text-purple-700 border-purple-200";
    case "2e": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Templates": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Prep": return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "Secure": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function EmergentToolsHub() {
  const userRole = getUserRole();
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Emergent Tools Hub</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced AI-powered tools and specialized resources for special education advocacy, 
            designed to streamline IEP processes and improve student outcomes.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              10 Active Tools
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <MessageSquare className="h-3 w-3 mr-1" />
              Expert Support
            </Badge>
          </div>
        </div>

        {/* Compact Tools Grid - All Tools Visible */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Complete Toolbox Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {emergentTools.map((tool) => (
              <Card key={tool.title} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group border border-gray-200 hover:border-primary/30 bg-white h-fit">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-200">
                      <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Badge className={`${getBadgeVariant(tool.badge)} text-xs px-2 py-1`}>
                        {tool.badge}
                      </Badge>
                      <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight">
                        {tool.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                      {tool.description.length > 80 ? `${tool.description.substring(0, 80)}...` : tool.description}
                    </p>
                    
                    <Button asChild size="sm" className="w-full text-xs py-2 bg-primary hover:bg-primary/90">
                      <Link to={tool.path}>
                        Open Tool
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold">Empowering Special Education Advocacy</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our emergent tools leverage advanced AI technology and specialized expertise to provide 
                comprehensive support for parents, advocates, and educators in the special education journey.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">AI</div>
                  <div className="text-sm text-muted-foreground">Powered Analysis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2e</div>
                  <div className="text-sm text-muted-foreground">Specialized Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">360°</div>
                  <div className="text-sm text-muted-foreground">Comprehensive Tools</div>
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