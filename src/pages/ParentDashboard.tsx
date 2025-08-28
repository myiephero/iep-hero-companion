import { Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ArrowRight,
  Upload,
  MessageSquare
} from "lucide-react";

const ParentDashboard = () => {
  const upcomingMeetings = [
    {
      title: "Annual IEP Review",
      date: "October 14, 2024",
      time: "10:00 AM",
      type: "Annual Review",
      status: "confirmed"
    },
    {
      title: "Progress Review",
      date: "November 8, 2024", 
      time: "2:30 PM",
      type: "Progress Check",
      status: "pending"
    }
  ];

  const recentDocuments = [
    {
      name: "Current IEP - Emma Thompson",
      type: "IEP Document",
      date: "Sep 15, 2024",
      status: "reviewed"
    },
    {
      name: "Speech Therapy Evaluation",
      type: "Assessment",
      date: "Sep 10, 2024",
      status: "pending"
    },
    {
      name: "Math Accommodation Request",
      type: "Letter",
      date: "Sep 8, 2024",
      status: "sent"
    }
  ];

  const nextSteps = [
    {
      id: "1",
      title: "Upload Current IEP Document",
      description: "Add your child's most recent IEP for AI analysis and compliance review",
      completed: false,
      action: {
        label: "Upload Document",
        url: "/tools/iep-review"
      }
    },
    {
      id: "2", 
      title: "Run AI Compliance Review",
      description: "Get insights on potential gaps and improvement opportunities",
      completed: false,
      action: {
        label: "Start Review",
        url: "/tools/iep-review"
      }
    },
    {
      id: "3",
      title: "Prepare for Upcoming Meeting",
      description: "Use our meeting prep wizard to get ready for your annual review",
      completed: false,
      action: {
        label: "Prep Meeting", 
        url: "/parent/meeting-prep"
      }
    },
    {
      id: "4",
      title: "Connect with Advocate",
      description: "Get matched with a certified advocate for personalized support",
      completed: false,
      action: {
        label: "Find Advocate",
        url: "/upsell/hero-plan"
      }
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your child's IEP progress and upcoming activities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Upcoming Meetings"
            value="2"
            description="Next: Annual Review (Oct 14)"
            icon={<Calendar className="h-4 w-4" />}
            badge="Soon"
          />
          <StatCard
            title="Open Tasks"
            value="4"
            description="3 pending, 1 overdue"
            icon={<CheckCircle className="h-4 w-4" />}
            trend={{ value: "2 this week", isPositive: true }}
          />
          <StatCard
            title="Services Tracked"
            value="6"
            description="Speech, OT, Math, Reading, Counseling, PT"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Documents"
            value="12"
            description="IEPs, evaluations, letters"
            icon={<FileText className="h-4 w-4" />}
            badge="Secure"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Next Steps */}
          <div className="lg:col-span-2">
            <ProgressSteps
              title="Your IEP Success Roadmap"
              description="Complete these steps to maximize your child's educational support"
              steps={nextSteps}
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="default" className="w-full justify-start">
                  <Link to="/tools/iep-review">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload & Review IEP
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/tools/autism-accommodations">
                    <Users className="h-4 w-4 mr-2" />
                    Build Accommodations
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/parent/meeting-prep">
                    <Calendar className="h-4 w-4 mr-2" />
                    Prepare for Meeting
                  </Link>
                </Button>
                <Button asChild variant="hero" className="w-full justify-start">
                  <Link to="/upsell/hero-plan">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Get HERO Plan
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Meetings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingMeetings.map((meeting, index) => (
                  <div key={index} className="space-y-2 p-3 bg-surface rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{meeting.title}</h4>
                      <Badge variant={meeting.status === 'confirmed' ? 'default' : 'secondary'}>
                        {meeting.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.date} at {meeting.time}
                      </div>
                      <div className="mt-1">{meeting.type}</div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View All Meetings
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Documents */}
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
            <CardDescription>
              Your latest IEP documents and communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{doc.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{doc.type}</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                  <Badge variant={
                    doc.status === 'reviewed' ? 'default' : 
                    doc.status === 'sent' ? 'secondary' : 'outline'
                  }>
                    {doc.status}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View Document Vault
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;