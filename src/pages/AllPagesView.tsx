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
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AllPagesView() {
  const mainPages = [
    {
      title: "Parent Dashboard",
      path: "/",
      icon: <Users className="h-5 w-5" />,
      description: "Main dashboard for parents with overview of student progress",
      status: "Active"
    },
    {
      title: "Student Profiles", 
      path: "/students",
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Manage student information and profiles",
      status: "Active"
    },
    {
      title: "Document Vault",
      path: "/documents", 
      icon: <FileText className="h-5 w-5" />,
      description: "Store and manage IEP documents securely",
      status: "Active"
    },
    {
      title: "Goals & Progress",
      path: "/goals",
      icon: <Target className="h-5 w-5" />,
      description: "Track IEP goals and student progress",
      status: "Active"
    },
    {
      title: "Meetings",
      path: "/meetings",
      icon: <Calendar className="h-5 w-5" />,
      description: "Schedule and manage IEP meetings",
      status: "Active"
    }
  ];

  const iepReviewTools = [
    {
      title: "AI IEP Review & Compliance",
      path: "/ai-iep-review",
      icon: <Brain className="h-5 w-5" />,
      description: "AI-powered IEP document analysis and compliance checking",
      status: "Working",
      notes: "Uses DocumentUpload component, API integration working"
    },
    {
      title: "Expert Analysis",
      path: "/expert-analysis", 
      icon: <Search className="h-5 w-5" />,
      description: "Request human expert analysis of IEP documents",
      status: "Working",
      notes: "Fixed FormData issues, now uses JSON API calls"
    },
    {
      title: "IEP Review Tool",
      path: "/iep-review",
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Comprehensive IEP review and analysis workflow",
      status: "Working", 
      notes: "Multi-step process: Upload → Ingest → Analyze → Report"
    }
  ];

  const advocatePages = [
    {
      title: "Advocate Students",
      path: "/advocate/students",
      icon: <Users className="h-5 w-5" />,
      description: "Manage student profiles for advocacy clients",
      status: "Fixed",
      notes: "Removed Supabase dependencies, using new API"
    },
    {
      title: "Matching Dashboard", 
      path: "/matching",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Connect parents with qualified advocates",
      status: "Active"
    }
  ];

  const specializedTools = [
    {
      title: "Autism Accommodation Builder",
      path: "/autism-accommodations",
      icon: <Heart className="h-5 w-5" />,
      description: "Specialized tools for autism-specific accommodations",
      status: "Active"
    },
    {
      title: "Gifted/2e Learners",
      path: "/gifted-2e",
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Resources for gifted and twice-exceptional learners", 
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

  const PageCard = ({ page }: { page: any }) => (
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="main">Main Pages</TabsTrigger>
            <TabsTrigger value="iep-tools">IEP Review Tools</TabsTrigger>
            <TabsTrigger value="advocate">Advocate Tools</TabsTrigger>
            <TabsTrigger value="specialized">Specialized Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <h2 className="text-xl font-semibold">Core Platform Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mainPages.map((page) => (
                <PageCard key={page.path} page={page} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="iep-tools" className="space-y-4">
            <h2 className="text-xl font-semibold">IEP Review & Analysis Tools</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All three IEP review tools have been fixed and should be working properly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {iepReviewTools.map((page) => (
                <PageCard key={page.path} page={page} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advocate" className="space-y-4">
            <h2 className="text-xl font-semibold">Advocate-Specific Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advocatePages.map((page) => (
                <PageCard key={page.path} page={page} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="specialized" className="space-y-4">
            <h2 className="text-xl font-semibold">Specialized Learning Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specializedTools.map((page) => (
                <PageCard key={page.path} page={page} />
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