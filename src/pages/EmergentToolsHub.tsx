import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Brain, FileText, Users, Star, Zap, Building, BookOpen, MessageSquare, Target, TrendingUp, Smile } from "lucide-react";

// Get user role from current location
const getUserRole = () => {
  const path = window.location.pathname;
  if (path.startsWith('/parent')) return 'parent';
  if (path.startsWith('/advocate')) return 'advocate';
  return 'parent'; // default to parent
};

const emergentTools = [
  {
    title: "Unified IEP Review",
    description: "Comprehensive AI-powered IEP analysis with quality scoring, compliance checks, bulk operations, and action letter generation.",
    icon: Brain,
    path: "/tools/unified-iep-review",
    category: "IEP Analysis",
    badge: "Enhanced",
    features: ["AI Analysis", "Quality Scoring", "Compliance Check", "Action Letters", "Bulk Operations"]
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
    path: "/parent/tools/smart-letter-generator",
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
  },
  {
    title: "Emotion Tracker",
    description: "Track your child's emotional well-being and behavioral patterns to support their success and communicate with school teams.",
    icon: Smile,
    path: "/parent/tools/emotion-tracker",
    category: "Wellness Support",
    badge: "Wellness",
    features: ["Daily Check-ins", "Mood Tracking", "Pattern Analysis", "Family Support"]
  },
  {
    title: "IEP Goal Helper",
    description: "Learn about IEP goals, create personalized goals for your child, and check if existing goals meet quality standards.",
    icon: Target,
    path: "/parent/tools/goal-generator",
    category: "IEP Planning",
    badge: "Parent-Friendly",
    features: ["Goal Education", "Smart Goal Creation", "Quality Checker", "Parent Guide"]
  },
  {
    title: "Parent IEP Helper Suite",
    description: "Complete IEP toolkit for parents - understand IEPs, analyze documents, check goals, and see examples in simple language.",
    icon: Brain,
    path: "/parent/tools/iep-master-suite",
    category: "IEP Analysis",
    badge: "Pro",
    features: ["IEP Education", "Document Analysis", "Goal Checker", "Parent Examples"]
  }
];

const categories = Array.from(new Set(emergentTools.map(tool => tool.category)));

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
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
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
              <Card key={tool.title} className="hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group border border-gray-200 hover:border-primary/30 bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-primary/50 h-[280px] flex flex-col">
                <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 group-hover:from-primary/20 group-hover:to-primary/10 dark:group-hover:from-primary/30 dark:group-hover:to-primary/20 transition-all duration-200 shadow-sm">
                      <tool.icon className="h-6 w-6 text-primary dark:text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Badge className={`${getBadgeVariant(tool.badge)} text-xs px-2 py-1 shadow-sm`}>
                        {tool.badge}
                      </Badge>
                      <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight dark:text-gray-100">
                        {tool.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 px-4 pb-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                      {tool.description.length > 80 ? `${tool.description.substring(0, 80)}...` : tool.description}
                    </p>
                  </div>
                  
                  <Button asChild size="sm" className="w-full text-xs py-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary dark:from-primary dark:to-primary/90 shadow-sm">
                    <Link to={tool.path}>
                      Open Tool
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