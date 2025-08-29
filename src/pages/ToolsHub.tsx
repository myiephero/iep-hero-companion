import { Link, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
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
  Brain
} from "lucide-react";

interface Tool {
  title: string;
  description: string;
  icon: React.ReactElement;
  url: string;
  category: string;
  badge?: string;
}

const parentTools: Tool[] = [
  {
    title: "IEP Review Tool",
    description: "Upload and analyze your child's IEP documents",
    icon: <FileSearch className="h-6 w-6" />,
    url: "/tools/iep-review",
    category: "Analysis"
  },
  {
    title: "Accommodation Builder",
    description: "Generate accommodations for various disabilities",
    icon: <Building2 className="h-6 w-6" />,
    url: "/tools/autism-accommodations",
    category: "Planning"
  },
  {
    title: "Meeting Preparation",
    description: "Prepare effectively for IEP meetings with guided wizards",
    icon: <Calendar className="h-6 w-6" />,
    url: "/parent/meeting-prep",
    category: "Meetings"
  },
  {
    title: "HERO Plan",
    description: "Get expert IEP review, strategy call, and meeting support",
    icon: <Crown className="h-6 w-6" />,
    url: "/parent-hero-plan",
    badge: "Premium",
    category: "Support"
  }
];

const advocateTools: Tool[] = [
  {
    title: "IEP Review Tool",
    description: "Professional IEP analysis and compliance review for your clients",
    icon: <FileSearch className="h-6 w-6" />,
    url: "/tools/iep-review",
    category: "Analysis"
  },
  {
    title: "Accommodation Builder",
    description: "Generate accommodations for students with various disabilities",
    icon: <Building2 className="h-6 w-6" />,
    url: "/tools/autism-accommodations",
    category: "Planning"
  },
  {
    title: "Case Management",
    description: "Manage your client caseload and track progress",
    icon: <Users className="h-6 w-6" />,
    url: "/advocate/dashboard",
    category: "Management"
  },
  {
    title: "Schedule & Meetings",
    description: "Manage your calendar and client meetings",
    icon: <Calendar className="h-6 w-6" />,
    url: "/advocate/schedule",
    category: "Meetings"
  },
  {
    title: "Client Messages",
    description: "Communicate securely with your clients",
    icon: <MessageSquare className="h-6 w-6" />,
    url: "/advocate/messages",
    category: "Communication"
  }
];

const ToolsHub = () => {
  const location = useLocation();
  const { profile } = useAuth();
  
  // Determine user type based on profile role
  const userRole = profile?.role || 'parent';
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

        {/* Quick Access Card */}
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Quick Access
            </CardTitle>
            <CardDescription>
              Your most used tools for efficient advocacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/tools/document-vault">
                  <Folder className="h-4 w-4 mr-2" />
                  Open Document Vault
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/tools/iep-review">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Analyze
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
                .map((tool) => (
                  <Card key={tool.title} className="bg-card hover:shadow-md transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {tool.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1 flex items-center gap-2">
                            {tool.title}
                            {tool.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {tool.badge}
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link to={tool.url}>
                            Open Tool
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}

        {/* Help Section */}
        <Card className="bg-surface border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
              <Button variant="outline" size="sm">
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