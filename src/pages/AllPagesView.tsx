import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Brain, 
  Users, 
  Target, 
  Calendar, 
  Upload, 
  MessageSquare,
  GraduationCap,
  Heart,
  Briefcase,
  Search,
  TrendingUp,
  Settings,
  Crown
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AllPagesView() {
  const mainPages = [
    {
      title: "Home Landing Page",
      path: "/",
      icon: <Users className="h-5 w-5" />,
      description: "Main landing page for the IEP Hero platform",
      status: "Active"
    },
    {
      title: "Authentication",
      path: "/auth",
      icon: <Users className="h-5 w-5" />,
      description: "Login and registration page",
      status: "Active"
    }
  ];

  const parentPages = [
    {
      title: "Parent Dashboard",
      path: "/parent/dashboard",
      icon: <Users className="h-5 w-5" />,
      description: "Main dashboard for parents with overview of student progress",
      status: "Active"
    },
    {
      title: "Parent Students", 
      path: "/parent/students",
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Manage student information and profiles",
      status: "Active"
    },
    {
      title: "Parent Pricing",
      path: "/parent/pricing",
      icon: <TrendingUp className="h-5 w-5" />,
      description: "View pricing plans and subscription options",
      status: "Active"
    },
    {
      title: "Parent HERO Plan",
      path: "/parent/hero-plan",
      icon: <Crown className="h-5 w-5" />,
      description: "Premium IEP support and expert consultation",
      status: "Active"
    },
    {
      title: "Parent Meeting Prep",
      path: "/parent/meeting-prep", 
      icon: <Calendar className="h-5 w-5" />,
      description: "Prepare for IEP meetings",
      status: "Active"
    },
    {
      title: "Parent Matching Dashboard",
      path: "/parent/matching",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Connect with advocates",
      status: "Active"
    },
    {
      title: "Emergent Tools Hub",
      path: "/parent/tools/emergent",
      icon: <Brain className="h-5 w-5" />,
      description: "Comprehensive AI-powered educational tools and specialized resources",
      status: "Active"
    },
    {
      title: "Parent Settings",
      path: "/parent/settings",
      icon: <Settings className="h-5 w-5" />,
      description: "Account and preference settings",
      status: "Active"
    }
  ];

  const iepReviewTools = [
    {
      title: "IEP Review Tool",
      path: "/parent/tools/iep-review",
      icon: <Brain className="h-5 w-5" />,
      description: "Comprehensive AI-powered IEP review and compliance analysis",
      status: "Working", 
      notes: "Multi-step process: Upload → Ingest → Analyze → Report"
    },
    {
      title: "Expert Analysis",
      path: "/parent/tools/expert-analysis", 
      icon: <Search className="h-5 w-5" />,
      description: "Request human expert analysis of IEP documents",
      status: "Working",
      notes: "Fixed FormData issues, now uses JSON API calls"
    }
  ];

  const advocatePages = [
    {
      title: "Advocate Dashboard",
      path: "/advocate/dashboard",
      icon: <Briefcase className="h-5 w-5" />,
      description: "Main dashboard for advocates",
      status: "Active"
    },
    {
      title: "Advocate Students",
      path: "/advocate/students",
      icon: <Users className="h-5 w-5" />,
      description: "Manage student profiles for advocacy clients",
      status: "Fixed",
      notes: "Removed Supabase dependencies, using new API"
    },
    {
      title: "Advocate Messages",
      path: "/advocate/messages",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Communication with parent clients",
      status: "Active"
    },
    {
      title: "Advocate Schedule",
      path: "/advocate/schedule",
      icon: <Calendar className="h-5 w-5" />,
      description: "Manage meetings and availability",
      status: "Active"
    },
    {
      title: "Create Parent Account",
      path: "/advocate/create-parent",
      icon: <Users className="h-5 w-5" />,
      description: "Create new parent client accounts",
      status: "Active"
    },
    {
      title: "Advocate Tools Hub",
      path: "/advocate/tools",
      icon: <Settings className="h-5 w-5" />,
      description: "Main tools hub for advocates",
      status: "Active"
    },
    {
      title: "Advocate Matching",
      path: "/advocate/matching",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Connect with parent clients",
      status: "Active"
    },
    {
      title: "Advocate Settings",
      path: "/advocate/settings",
      icon: <Settings className="h-5 w-5" />,
      description: "Account and preference settings",
      status: "Active"
    }
  ];

  const parentTools = [
    {
      title: "AI IEP Review",
      path: "/parent/tools/ai-iep-review",
      icon: <Brain className="h-5 w-5" />,
      description: "Upload and analyze IEP documents with AI-powered insights",
      status: "Active"
    },
    {
      title: "Autism Accommodation Builder",
      path: "/parent/tools/autism-accommodations",
      icon: <Target className="h-5 w-5" />,
      description: "Create autism-specific accommodations and support plans",
      status: "Active"
    },
    {
      title: "Gifted & 2e Learners",
      path: "/parent/tools/gifted-2e-learners",
      icon: <Crown className="h-5 w-5" />,
      description: "Comprehensive profiles for gifted and twice-exceptional learners",
      status: "Active"
    },
    {
      title: "Smart Letter Generator",
      path: "/parent/tools/smart-letter",
      icon: <FileText className="h-5 w-5" />,
      description: "Generate professional advocacy letters",
      status: "Active"
    },
    {
      title: "Meeting Prep Wizard",
      path: "/parent/tools/meeting-prep",
      icon: <Calendar className="h-5 w-5" />,
      description: "Prepare for IEP meetings effectively",
      status: "Active"
    },
    {
      title: "Document Vault",
      path: "/parent/tools/document-vault",
      icon: <Upload className="h-5 w-5" />,
      description: "Secure storage and organization for all IEP documents",
      status: "Active"
    },
    {
      title: "Advocate Matching Tool",
      path: "/parent/tools/advocate-matching",
      icon: <Users className="h-5 w-5" />,
      description: "Find qualified advocates in your area",
      status: "Active"
    }
  ];

  const specializedTools = [
    {
      title: "Autism Accommodations (Parent)",
      path: "/parent/tools/autism-accommodations",
      icon: <Heart className="h-5 w-5" />,
      description: "Specialized tools for autism-specific accommodations",
      status: "Active"
    },
    {
      title: "Autism Accommodations (Advocate)",
      path: "/advocate/tools/autism-accommodations",
      icon: <Heart className="h-5 w-5" />,
      description: "Advocate tools for autism accommodations",
      status: "Active"
    },
    {
      title: "Gifted/2e Learners (Parent)",
      path: "/parent/tools/gifted-2e-learners",
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Resources for gifted and twice-exceptional learners", 
      status: "Active"
    },
    {
      title: "Gifted/2e Learners (Advocate)",
      path: "/advocate/tools/gifted-2e-learners",
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Advocate resources for gifted learners", 
      status: "Active"
    }
  ];

  const advocateTools = [
    {
      title: "Advocate IEP Review",
      path: "/advocate/tools/iep-review",
      icon: <TrendingUp className="h-5 w-5" />,
      description: "IEP review tool for advocates",
      status: "Working"
    },
    {
      title: "Advocate AI IEP Review",
      path: "/advocate/tools/ai-iep-review",
      icon: <Brain className="h-5 w-5" />,
      description: "AI-powered IEP analysis for advocates",
      status: "Working"
    },
    {
      title: "Advocate Expert Analysis",
      path: "/advocate/tools/expert-analysis",
      icon: <Search className="h-5 w-5" />,
      description: "Expert analysis tools for advocates",
      status: "Working"
    },
    {
      title: "Advocate Document Vault",
      path: "/advocate/tools/document-vault",
      icon: <FileText className="h-5 w-5" />,
      description: "Document management for advocates",
      status: "Active"
    },
    {
      title: "Advocate Smart Letter",
      path: "/advocate/tools/smart-letter",
      icon: <FileText className="h-5 w-5" />,
      description: "Letter generation for advocates",
      status: "Active"
    },
    {
      title: "Advocate Meeting Prep",
      path: "/advocate/tools/meeting-prep",
      icon: <Calendar className="h-5 w-5" />,
      description: "Meeting preparation for advocates",
      status: "Active"
    },
    {
      title: "Parent Matching Dashboard",
      path: "/advocate/matching",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Manage parent-advocate matching workflow",
      status: "Active"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "working": return "bg-green-100 text-green-700";
      case "fixed": return "bg-blue-100 text-blue-700";
      case "active": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const PageCard = ({ page, index }: { page: any; index: number }) => (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {page.icon}
            <CardTitle className="text-lg">{page.title}</CardTitle>
          </div>
          <Badge className={getStatusColor(page.status)}>
            {page.status}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {page.description}
        </CardDescription>
        {page.notes && (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
            {page.notes}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <Link to={page.path}>
          <Button variant="outline" size="sm" className="w-full">
            Visit Page
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Pages Overview</h1>
          <p className="text-muted-foreground">
            Quick access to all pages and tools in the IEP Hero platform for testing and navigation.
          </p>
        </div>

        <Tabs defaultValue="main" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger value="parent-pages">Parent Pages</TabsTrigger>
            <TabsTrigger value="parent-tools">Parent Tools</TabsTrigger>
            <TabsTrigger value="iep-tools">IEP Tools</TabsTrigger>
            <TabsTrigger value="advocate-pages">Advocate Pages</TabsTrigger>
            <TabsTrigger value="advocate-tools">Advocate Tools</TabsTrigger>
            <TabsTrigger value="specialized">Specialized</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <h2 className="text-xl font-semibold">Core Platform Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mainPages.map((page, index) => (
                <PageCard key={`main-${index}-${page.path}`} page={page} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="parent-pages" className="space-y-4">
            <h2 className="text-xl font-semibold">Parent Dashboard & Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parentPages.map((page, index) => (
                <PageCard key={`parent-pages-${index}-${page.path}`} page={page} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="iep-tools" className="space-y-4">
            <h2 className="text-xl font-semibold">IEP Review & Analysis Tools</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All three IEP review tools have been fixed and should be working properly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {iepReviewTools.map((page, index) => (
                <PageCard key={`iep-${index}-${page.path}`} page={page} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="parent-tools" className="space-y-4">
            <h2 className="text-xl font-semibold">Parent Tools & Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parentTools.map((page, index) => (
                <PageCard key={`parent-tools-${index}-${page.path}`} page={page} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advocate-pages" className="space-y-4">
            <h2 className="text-xl font-semibold">Advocate Dashboard & Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advocatePages.map((page, index) => (
                <PageCard key={`advocate-pages-${index}-${page.path}`} page={page} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advocate-tools" className="space-y-4">
            <h2 className="text-xl font-semibold">Advocate Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advocateTools.map((page, index) => (
                <PageCard key={`advocate-tools-${index}-${page.path}`} page={page} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="specialized" className="space-y-4">
            <h2 className="text-xl font-semibold">Specialized Learning Tools</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tools available for both parents and advocates with role-specific access.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specializedTools.map((page, index) => (
                <PageCard key={`specialized-${index}-${page.path}`} page={page} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Recent Fixes & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">Fixed</Badge>
                <span>All three IEP review tools now working properly</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">Fixed</Badge>
                <span>Authentication system with mock login for testing</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">Fixed</Badge>
                <span>Removed all Supabase dependencies from advocate pages</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">Migration</Badge>
                <span>Hybrid approach: Supabase for auth, PostgreSQL for AI features</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}