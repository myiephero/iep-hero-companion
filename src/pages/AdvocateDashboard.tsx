import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  Target,
  TrendingUp,
  UserPlus,
  GraduationCap,
  Flag,
  Plus,
  Eye,
  Star,
  BookOpen
} from "lucide-react";

interface AdvocateDashboardProps {
  plan?: string;
}

const AdvocateDashboard = ({ plan }: AdvocateDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check for pending subscription after login
    const pendingSubscription = localStorage.getItem('pendingSubscription');
    if (pendingSubscription && user) {
      try {
        const subscriptionData = JSON.parse(pendingSubscription);
        // Clear the pending subscription
        localStorage.removeItem('pendingSubscription');
        
        // Build the subscription setup URL
        const params = new URLSearchParams({
          plan: subscriptionData.planId,
          role: subscriptionData.role,
          priceId: subscriptionData.priceId,
          planName: subscriptionData.planName
        });
        
        toast({
          title: "Resuming Subscription",
          description: `Continuing with ${subscriptionData.planName} plan setup...`,
        });
        
        // Redirect back to subscription setup
        setTimeout(() => {
          window.location.href = `/subscription-setup?${params.toString()}`;
        }, 1500);
      } catch (error) {
        console.error('Error parsing pending subscription:', error);
        localStorage.removeItem('pendingSubscription');
      }
    }
  }, [user, toast]);

  // State for real data
  const [students, setStudents] = useState([]);
  const [cases, setCases] = useState([]);
  const [parents, setParents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch students, cases, parents, and conversations in parallel
        const [studentsRes, casesRes, parentsRes, conversationsRes] = await Promise.all([
          fetch('/api/students').then(r => r.ok ? r.json() : []),
          fetch('/api/cases').then(r => r.ok ? r.json() : []),
          fetch('/api/parents').then(r => r.ok ? r.json() : []),
          fetch('/api/messaging/conversations').then(r => r.ok ? r.json() : [])
        ]);
        
        setStudents(studentsRes || []);
        setCases(casesRes || []);
        setParents(parentsRes || []);
        setConversations(conversationsRes || []);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Calculate dashboard metrics
  const openCases = cases.filter(c => c.status === 'active' || c.status === 'open');
  const pendingStudents = students.filter(s => s.source === 'conversation' || s.source === 'client_relationship');
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  // Fetch upcoming meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/meetings', {
          credentials: 'include',
          headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          },
        });
        
        if (response.ok) {
          const meetings = await response.json();
          // Filter for upcoming meetings (today and future)
          const today = new Date().toISOString().split('T')[0];
          const upcoming = meetings.filter(meeting => 
            meeting.scheduled_date >= today && 
            (meeting.status === 'scheduled' || meeting.status === 'confirmed')
          );
          setUpcomingMeetings(upcoming);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
      }
    };

    fetchMeetings();
  }, [user]);

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "urgent": return "bg-red-100 text-red-700 border-red-200";
      case "active": return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Advocate Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your cases, students, and upcoming meetings</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
              <Link to="/advocate/parents">
                <UserPlus className="h-4 w-4" />
                Manage Parent Clients
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
              <Link to="/advocate/students">
                <GraduationCap className="h-4 w-4" />
                Create New Student
              </Link>
            </Button>
            
            <Button asChild size="sm" className="flex items-center gap-2">
              <Link to="/advocate/tools">
                <BookOpen className="h-4 w-4" />
                Access Tools
              </Link>
            </Button>
            
            {/* Plan-specific badge for advocates */}
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Flag className="h-4 w-4" />
              {plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Active` : 'Plan Active'}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Pending Students"
            value={pendingStudents.length.toString()}
            description="Awaiting assignment"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Open Cases"
            value={openCases.length.toString()}
            description="Active advocacy cases"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="This Week's Meetings"
            value={upcomingMeetings.length.toString()}
            description="Scheduled meetings"
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            title="Goals Achieved"
            value="24"
            description="This month"
            icon={<Target className="h-4 w-4" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Students from Matching */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pending Student Assignments
              </CardTitle>
              <CardDescription>
                Students matched to you through the advocate matching system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingStudents.map((student) => (
                <div key={student.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{student.name}</h4>
                    <Badge className={getUrgencyColor(student.urgency)}>
                      {student.urgency} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Parent: {student.parent} • {student.grade}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {student.needs.map((need, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {need}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Matched {student.matchDate}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                      <Button size="sm">Accept Case</Button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingStudents.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg font-medium">No pending assignments yet</p>
                    <p className="text-sm">Start by creating parent clients who will refer students to you</p>
                  </div>
                  <Button asChild>
                    <Link to="/advocate/parents">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create First Parent Client
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Open Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Active Cases
              </CardTitle>
              <CardDescription>
                Cases currently under your advocacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {openCases.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg font-medium">No active cases yet</p>
                    <p className="text-sm">Your advocacy cases will appear here once you start working with students</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/advocate/students">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Create First Student Case
                    </Link>
                  </Button>
                </div>
              ) : openCases.map((case_) => (
                <div key={case_.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{case_.student}</h4>
                    <Badge className={getUrgencyColor(case_.status)}>
                      {case_.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Parent: {case_.parent}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">{case_.caseType}:</span> {case_.nextAction}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Due: {case_.dueDate}
                    </span>
                    <Button size="sm" variant="outline">
                      View Case
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Meetings
            </CardTitle>
            <CardDescription>
              Your scheduled meetings and consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">No meetings scheduled</p>
                  <p className="text-sm">Schedule meetings with your parent clients as you take on cases</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/advocate/schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">{meeting.title}</h4>
                  <p className="text-sm text-muted-foreground">{meeting.date}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{meeting.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {meeting.attendees} attendees
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Join Meeting
                  </Button>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Quick Actions</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="outline">
                  <Link to="/advocate/schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/advocate/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/advocate/tools/document-vault">
                    <FileText className="h-4 w-4 mr-2" />
                    Document Vault
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/advocate/tools">
                    <Star className="h-4 w-4 mr-2" />
                    All Tools
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdvocateDashboard;