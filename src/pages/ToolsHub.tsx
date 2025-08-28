
import { Link, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const ToolsHub = () => {
  const location = useLocation();
  const isAdvocateRoute = location.pathname.startsWith('/advocate');

  const parentTools = [
    {
      title: "IEP Review & Analysis",
      description: "Upload and get AI-powered analysis of your child's IEP documents",
      icon: <FileSearch className="h-6 w-6" />,
      url: "/tools/iep-review",
      badge: "AI Powered",
      category: "Analysis"
    },
    {
      title: "Accommodation Builder",
      description: "Generate personalized accommodations for autism and learning disabilities",
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
      url: "/upsell/hero-plan",
      badge: "Premium",
      category: "Support"
    }
  ];

  const advocateTools = [
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

  const tools = isAdvocateRoute ? advocateTools : parentTools;
  const pageTitle = isAdvocateRoute ? "Advocate Tools Hub" : "Parent Tools Hub";
  const pageDescription = isAdvocateRoute 
    ? "Professional tools for supporting families with IEP advocacy"
    : "Powerful tools to support your child's educational journey";

  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>

        {/* Document Vault Quick Access */}
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Document Vault
            </CardTitle>
            <CardDescription>
              Secure storage for all your IEP documents and files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Folder className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">23 Documents</p>
                  <p className="text-sm text-muted-foreground">Securely stored</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">8 IEP Files</p>
                  <p className="text-sm text-muted-foreground">Ready for review</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Upload className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Quick Upload</p>
                  <p className="text-sm text-muted-foreground">Drag & drop files</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
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
              {category} Tools
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools
                .filter(tool => tool.category === category)
                .map((tool, index) => (
                  <Card key={index} className="bg-gradient-card border-0 hover-scale">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        {tool.icon}
                        <span className="flex-1">{tool.title}</span>
                        {tool.badge && (
                          <Badge variant={tool.badge === 'Premium' ? 'default' : 'secondary'}>
                            {tool.badge}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <Link to={tool.url}>
                          <Zap className="h-4 w-4 mr-2" />
                          Open Tool
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ToolsHub;
