import { Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { ProgressSteps } from "@/components/ProgressSteps";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  FileText, 
  Users, 
  CheckCircle,
  MessageSquare,
  Target,
  TrendingUp,
  BookOpen,
  Zap,
  BarChart3,
  Mail,
  Calendar as CalendarIcon,
  UserPlus,
  Crown,
  Star,
  Gift,
  Share2,
  Shield,
  DollarSign,
  Heart,
  Award,
  ArrowRight,
  Upload,
  Clock,
  MessageCircle,
  Sparkles
} from "lucide-react";

const ParentDashboard = () => {
  const coreTools = [
    {
      title: "Document Vault",
      description: "Upload & organize IEP documents",
      icon: <FileText className="h-6 w-6" />,
      url: "/tools/document-vault"
    },
    {
      title: "Goal Generator",
      description: "Create SMART IEP goals",
      icon: <Target className="h-6 w-6" />,
      url: "/tools/goal-generator"
    },
    {
      title: "AI Review",
      description: "Analyze IEP documents",
      icon: <Zap className="h-6 w-6" />,
      url: "/tools/ai-iep-review"
    },
    {
      title: "Messages",
      description: "Chat with advocates",
      icon: <MessageSquare className="h-6 w-6" />,
      url: "/advocate/messages"
    }
  ];

  const additionalTools = [
    {
      title: "Meeting Prep",
      description: "Prepare for IEP meetings",
      icon: <Calendar className="h-6 w-6" />,
      url: "/parent/meeting-prep"
    },
    {
      title: "Letter Generator",
      description: "Generate legal letters",
      icon: <Mail className="h-6 w-6" />,
      url: "/tools/smart-letter"
    },
    {
      title: "Progress Logger",
      description: "Track service delivery",
      icon: <BarChart3 className="h-6 w-6" />,
      url: "/tools/progress-logger"
    },
    {
      title: "Communication Plan",
      description: "Track emails & requests",
      icon: <UserPlus className="h-6 w-6" />,
      url: "/tools/communication-plan"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Goals"
            value="4"
            icon={<Target className="h-4 w-4" />}
          />
          <StatCard
            title="Progress Rate"
            value="0%"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            title="Next Meeting"
            value="No upcoming meetings"
            description="No upcoming meetings"
            icon={<CalendarIcon className="h-4 w-4" />}
          />
          <StatCard
            title="Documents"
            value="44"
            icon={<FileText className="h-4 w-4" />}
          />
        </div>

        {/* My Students Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Students</h2>
          <Card className="bg-card hover:shadow-md transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-center space-y-3">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Manage Students</h3>
                  <p className="text-muted-foreground">View and manage your children's IEP information</p>
                </div>
                <Button asChild>
                  <Link to="/students">
                    Manage Students
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Tools Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Core Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreTools.map((tool, index) => (
              <Card key={index} className="bg-card hover:shadow-md transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                    <Button asChild variant="outline" className="w-full">
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

        {/* Additional Tools Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Additional Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalTools.map((tool, index) => (
              <Card key={index} className="bg-card hover:shadow-md transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                    <Button asChild variant="outline" className="w-full">
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

        {/* Your Child's IEP Overview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Child's IEP Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">Active Goals</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-success">0%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
              <div className="text-xs text-muted-foreground">Start making progress</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold text-purple-600">No Meeting</div>
              <div className="text-sm text-muted-foreground">Next IEP Review</div>
              <div className="text-xs text-muted-foreground">Schedule your next meeting</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-warning">44</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;