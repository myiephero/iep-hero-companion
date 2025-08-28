import { Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Phone,
  MapPin
} from "lucide-react";

const AdvocateDashboard = () => {
  const activeCases = [
    {
      id: "C-1024",
      parentName: "Jordan Peterson",
      studentName: "Ava Peterson",
      grade: "3rd Grade",
      school: "Lincoln Elementary",
      stage: "IEP Review",
      nextAction: "Upload evaluations",
      priority: "high",
      dueDate: "Oct 12, 2024",
      disabilities: ["Autism", "ADHD"]
    },
    {
      id: "C-1025", 
      parentName: "Morgan Kumar",
      studentName: "Liam Kumar",
      grade: "6th Grade",
      school: "Roosevelt Middle",
      stage: "Meeting Prep",
      nextAction: "Draft accommodation letters",
      priority: "medium",
      dueDate: "Oct 18, 2024",
      disabilities: ["Dyslexia"]
    },
    {
      id: "C-1026",
      parentName: "Pat Rodriguez",
      studentName: "Noah Rodriguez", 
      grade: "2nd Grade",
      school: "Washington Elementary",
      stage: "Services Audit",
      nextAction: "Verify service minutes",
      priority: "low",
      dueDate: "Oct 25, 2024",
      disabilities: ["Speech Delay", "Processing Disorder"]
    }
  ];

  const todaySchedule = [
    {
      time: "10:00 AM",
      type: "IEP Meeting",
      client: "Jordan Peterson",
      location: "Lincoln Elementary",
      status: "upcoming"
    },
    {
      time: "2:30 PM", 
      type: "Consultation Call",
      client: "Sarah Williams",
      location: "Phone",
      status: "confirmed"
    },
    {
      time: "4:00 PM",
      type: "Case Review",
      client: "Morgan Kumar", 
      location: "Office",
      status: "pending"
    }
  ];

  const recentActivity = [
    {
      action: "IEP Review completed",
      client: "Ava Peterson",
      time: "2 hours ago",
      type: "review"
    },
    {
      action: "Accommodation letter sent",
      client: "Liam Kumar",
      time: "1 day ago", 
      type: "letter"
    },
    {
      action: "Meeting scheduled",
      client: "Noah Rodriguez",
      time: "2 days ago",
      type: "meeting"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Advocate Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your caseload and support families effectively.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Cases"
            value="18"
            description="3 high priority, 12 ongoing"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: "2 new this week", isPositive: true }}
          />
          <StatCard
            title="Today's Meetings"
            value="3"
            description="1 IEP meeting, 2 consultations"
            icon={<Calendar className="h-4 w-4" />}
            badge="Today"
          />
          <StatCard
            title="Pending Letters"
            value="6"
            description="4 accommodations, 2 appeals"
            icon={<FileText className="h-4 w-4" />}
            trend={{ value: "2 urgent", isPositive: false }}
          />
          <StatCard
            title="Messages"
            value="12"
            description="8 unread, 4 urgent replies"
            icon={<MessageSquare className="h-4 w-4" />}
            badge="Unread"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Cases */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Cases
                </CardTitle>
                <CardDescription>
                  Students and families in your current caseload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeCases.map((case_) => (
                    <div key={case_.id} className="p-4 bg-surface rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {case_.id}
                          </Badge>
                          <Badge variant={
                            case_.priority === 'high' ? 'destructive' :
                            case_.priority === 'medium' ? 'outline' : 'secondary'
                          } className={case_.priority === 'medium' ? 'border-warning text-warning' : ''}>
                            {case_.priority} priority
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {case_.dueDate}
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">{case_.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{case_.grade} • {case_.school}</p>
                          <p className="text-sm text-muted-foreground">Parent: {case_.parentName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Current Stage: {case_.stage}</p>
                          <p className="text-sm text-muted-foreground">Next: {case_.nextAction}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {case_.disabilities.map((disability) => (
                              <Badge key={disability} variant="outline" className="text-xs">
                                {disability}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="default">
                          View Case
                        </Button>
                        <Button size="sm" variant="outline">
                          Send Message
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Cases
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule & Quick Actions */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySchedule.map((appointment, index) => (
                  <div key={index} className="space-y-2 p-3 bg-surface rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{appointment.time}</span>
                      <Badge variant={
                        appointment.status === 'confirmed' ? 'default' : 
                        appointment.status === 'upcoming' ? 'secondary' : 'outline'
                      }>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium">{appointment.type}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.client}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        {appointment.location === "Phone" ? (
                          <Phone className="h-3 w-3" />
                        ) : (
                          <MapPin className="h-3 w-3" />
                        )}
                        {appointment.location}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="default" className="w-full justify-start">
                  <Link to="/tools/iep-review">
                    <FileText className="h-4 w-4 mr-2" />
                    IEP Review Tool
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/tools/autism-accommodations">
                    <Users className="h-4 w-4 mr-2" />
                    Accommodation Builder
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/advocate/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/advocate/schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates across your caseload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-surface rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{activity.client}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdvocateDashboard;