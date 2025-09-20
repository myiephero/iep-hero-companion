import { Link, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { AccessControlledToolCard } from "@/components/AccessControlledToolCard";
import { getToolRequiredPlan } from "@/lib/toolAccess";
import { PlanFeatures } from "@/lib/planAccess";
import { 
  FileText, 
  Users, 
  Calendar, 
  Crown, 
  Upload,
  MessageSquare,
  Building2,
  FileSearch,
  Shield,
  Folder,
  Star,
  Zap,
  Brain,
  PenTool
} from "lucide-react";

interface Tool {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  category: string;
  badge?: string;
  features: string[];
  requiredFeature: keyof PlanFeatures;
}

const parentTools: Tool[] = [
  {
    title: "IEP Review Tool",
    description: "Upload and analyze your child's IEP documents",
    icon: FileSearch,
    url: "/tools/iep-review",
    category: "Analysis",
    features: ["Document Analysis", "AI Review", "Compliance Check"],
    requiredFeature: "aiIEPReview"
  },
  {
    title: "Smart Letter Generator",
    description: "Create professional advocacy letters with templates and AI assistance",
    icon: PenTool,
    url: "/parent/tools/smart-letter-generator",
    category: "Communication",
    badge: "Popular",
    features: ["Letter Templates", "AI Assistance", "Professional Format"],
    requiredFeature: "smartLetterGenerator"
  },
  {
    title: "Accommodation Builder",
    description: "Generate accommodations for various disabilities",
    icon: Building2,
    url: "/tools/autism-accommodations",
    category: "Planning",
    features: ["Autism Support", "Sensory Accommodations", "Behavioral Strategies"],
    requiredFeature: "autismAccommodationBuilder"
  },
  {
    title: "Meeting Preparation",
    description: "Prepare effectively for IEP meetings with guided wizards",
    icon: Calendar,
    url: "/parent/meeting-prep",
    category: "Meetings",
    features: ["Meeting Prep", "Guided Wizards", "Preparation Tools"],
    requiredFeature: "meetingPrepWizard"
  },
  {
    title: "HERO Plan",
    description: "Get expert IEP review, strategy call, and meeting support",
    icon: Crown,
    url: "/parent-hero-plan",
    badge: "Premium",
    category: "Support",
    features: ["Expert Review", "Strategy Call", "Meeting Support"],
    requiredFeature: "heroPlan"
  }
];

const advocateTools: Tool[] = [
  {
    title: "IEP Review Tool",
    description: "Professional IEP analysis and compliance review for your clients",
    icon: FileSearch,
    url: "/tools/iep-review",
    category: "Analysis",
    features: ["Professional Analysis", "Compliance Review", "Client Reports"],
    requiredFeature: "unifiedIEPReview"
  },
  {
    title: "Smart Letter Generator",
    description: "Create professional advocacy letters with legal templates and client customization",
    icon: PenTool,
    url: "/advocate/tools/smart-letter-generator",
    category: "Communication",
    badge: "Pro",
    features: ["Legal Templates", "Client Customization", "Professional Format"],
    requiredFeature: "smartLetterGenerator"
  },
  {
    title: "Accommodation Builder",
    description: "Generate accommodations for students with various disabilities",
    icon: Building2,
    url: "/tools/autism-accommodations",
    category: "Planning",
    features: ["Disability Support", "Professional Accommodations", "Custom Plans"],
    requiredFeature: "autismAccommodationBuilder"
  },
  {
    title: "Case Management",
    description: "Manage your client caseload and track progress",
    icon: Users,
    url: "#", // Will redirect to plan-specific dashboard
    category: "Management",
    features: ["Client Management", "Progress Tracking", "Case Organization"],
    requiredFeature: "caseManagement"
  },
  {
    title: "Schedule & Meetings",
    description: "Manage your calendar and client meetings",
    icon: Calendar,
    url: "/advocate/schedule",
    category: "Meetings",
    features: ["Calendar Management", "Client Meetings", "Scheduling Tools"],
    requiredFeature: "meetingScheduler"
  },
  {
    title: "Client Messages",
    description: "Communicate securely with your clients",
    icon: MessageSquare,
    url: "/advocate/messages",
    category: "Communication",
    features: ["Secure Messaging", "Client Communication", "Professional Tools"],
    requiredFeature: "advocateMessaging"
  }
];

const ToolsHub = () => {
  const location = useLocation();
  const { profile } = useAuth();
  
  // Determine user type based on route first, then profile role
  const path = location.pathname;
  const routeRole = path.startsWith('/advocate') ? 'advocate' : path.startsWith('/parent') ? 'parent' : undefined;
  const userRole = routeRole ?? (profile?.role || 'parent');
  const isAdvocateUser = userRole === 'advocate';
  
  // Use appropriate tools based on user type
  const tools = isAdvocateUser ? advocateTools : parentTools;
  const userType = isAdvocateUser ? 'Advocate' : 'Parent';
  
  // Get unique categories
  const categories = Array.from(new Set(tools.map(tool => tool.category)));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{userType} Tools Hub</h1>
          <p className="text-muted-foreground">
            {isAdvocateUser 
              ? 'Professional tools for advocacy work and client management'
              : 'Essential tools for IEP advocacy and student support'
            }
          </p>
        </div>

        {/* Quick Access Card - Premium Hero Style */}
        <Card className="card-hero overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              Quick Access
            </CardTitle>
            <CardDescription className="text-base opacity-90">
              Your most used tools for efficient advocacy
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild size="lg" className="h-14 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-button hover:shadow-button-hover transition-all duration-200">
                <Link to="/tools/document-vault" className="flex items-center gap-3">
                  <Folder className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Document Vault</div>
                    <div className="text-xs opacity-90">Manage files</div>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
                <Link to="/tools/iep-review" className="flex items-center gap-3">
                  <Upload className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Upload & Analyze</div>
                    <div className="text-xs opacity-70">AI-powered review</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tools by Category */}
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {category === 'Analysis' && <Brain className="h-5 w-5" />}
              {category === 'Planning' && <Star className="h-5 w-5" />}
              {category === 'Meetings' && <Calendar className="h-5 w-5" />}
              {category === 'Support' && <Crown className="h-5 w-5" />}
              {category === 'Management' && <Users className="h-5 w-5" />}
              {category === 'Communication' && <MessageSquare className="h-5 w-5" />}
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools
                .filter(tool => tool.category === category)
                .map((tool, index) => {
                  const requiredPlan = getToolRequiredPlan(tool.requiredFeature);
                  
                  return (
                    <AccessControlledToolCard
                      key={tool.title}
                      title={tool.title}
                      description={tool.description}
                      icon={tool.icon}
                      path={tool.url}
                      badge={tool.badge || "Core"}
                      features={tool.features}
                      requiredFeature={tool.requiredFeature}
                      requiredPlan={requiredPlan}
                      className="h-full"
                    />
                  );
                })}
            </div>
          </div>
        ))}

        {/* Help Section - Interactive Support Card */}
        <Card className="card-glass border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-success" />
              </div>
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Can't find what you're looking for? Our expert support team is here to help you succeed.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="hover:bg-success/10 hover:border-success/30 hover:text-success transition-all duration-200">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200">
                <FileText className="h-4 w-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ToolsHub;