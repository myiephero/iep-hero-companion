import { Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { ProgressSteps } from "@/components/ProgressSteps";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ArrowRight,
  Upload,
  MessageSquare,
  Crown,
  Star,
  TrendingUp,
  Gift,
  Share2,
  Shield,
  Sparkles,
  Target,
  Heart,
  MessageCircle,
  Award,
  Zap,
  BookOpen,
  DollarSign,
  UserPlus,
  ChevronRight,
  TrendingDown,
  Brain
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

  // New data for Hero Plan conversion funnel
  const testimonials = [
    {
      name: "Sarah M.",
      student: "Emma (Grade 4)",
      text: "The Hero Plan changed everything! Got 5 new accommodations approved.",
      rating: 5,
      avatar: "SM"
    },
    {
      name: "Michael K.",
      student: "Alex (Grade 7)", 
      text: "Having an advocate at our meeting made all the difference.",
      rating: 5,
      avatar: "MK"
    },
    {
      name: "Lisa P.",
      student: "Jordan (Grade 2)",
      text: "Finally understand my child's IEP. Worth every penny!",
      rating: 5,
      avatar: "LP"
    }
  ];

  const usageStats = [
    { label: "Documents Stored", value: "23", change: "+5 this month", trend: "up" },
    { label: "Hours Saved", value: "47", change: "vs manual tracking", trend: "up" },
    { label: "Goals Tracked", value: "12", change: "3 achieved!", trend: "up" },
    { label: "Platform Value", value: "$2,340", change: "accumulated", trend: "up" }
  ];

  const advocates = [
    {
      name: "Dr. Amanda Chen",
      specialty: "Autism & Learning Disabilities",
      rating: 4.9,
      reviews: 147,
      rate: "$125/hr",
      nextAvailable: "Today 3pm"
    },
    {
      name: "Robert Martinez",
      specialty: "IEP Compliance & Advocacy",
      rating: 5.0,
      reviews: 203,
      rate: "$150/hr",
      nextAvailable: "Tomorrow 10am"
    }
  ];

  const communityWins = [
    { text: "Parent in Springfield got 1:1 aide approved", time: "2 hours ago" },
    { text: "Family secured speech therapy increase", time: "1 day ago" },
    { text: "IEP goals updated after Hero Plan review", time: "3 days ago" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Plan CTA Banner - Most Prominent */}
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 animate-fade-in">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Ready for Your Hero Moment?</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  Get expert IEP review + strategy call + meeting support + 30 days premium access
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Expert IEP Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">30min Strategy Call</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Meeting Attendance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">30 Days Premium</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button asChild size="lg" className="hover-scale">
                    <Link to="/upsell/hero-plan">
                      <Crown className="h-4 w-4 mr-2" />
                      Start Hero Plan - $495
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span>4.9/5 from 847 families</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Signals & Social Proof */}
        <Card className="bg-gradient-card border-0 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              What Families Are Saying
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-lg hover-scale">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.student}</p>
                    </div>
                    <div className="flex ml-auto">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm">{testimonial.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid with Platform Value Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Upcoming Meetings"
            value="2"
            description="Next: Annual Review (Oct 14)"
            icon={<Calendar className="h-4 w-4" />}
            badge="Soon"
          />
          <StatCard
            title="Platform Value"
            value="$2,340"
            description="In advocacy costs saved"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: "↗ Growing", isPositive: true }}
          />
          <StatCard
            title="Documents Secure"
            value="23"
            description="Your family's IEP vault"
            icon={<Shield className="h-4 w-4" />}
            badge="Protected"
          />
          <StatCard
            title="Goals Tracked"
            value="12"
            description="8 on track, 3 achieved"
            icon={<Target className="h-4 w-4" />}
            trend={{ value: "85% success", isPositive: true }}
          />
        </div>

        {/* Platform Stickiness & Value Visualization */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Your Growing Platform Value
              </CardTitle>
              <CardDescription>See how much you've gained from using our platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {usageStats.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                    <div className="text-xs text-green-600">{stat.change}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Premium Benefits Active</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <Progress value={85} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  You're saving an average of $195/month in advocacy costs
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Your Progress Dashboard
              </CardTitle>
              <CardDescription>Track your IEP success journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>IEP Goals Progress</span>
                    <span>8/12 on track</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Document Organization</span>
                    <span>23 files secured</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Advocacy Readiness</span>
                    <span>Meeting ready</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <BookOpen className="h-4 w-4 mr-2" />
                View Detailed Progress
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upsell Pathways Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Additional Hero Packs */}
          <Card className="bg-gradient-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Additional Support
              </CardTitle>
              <CardDescription>Extend your success</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg hover-scale">
                <p className="font-medium">Extra Hero Pack</p>
                <p className="text-sm text-muted-foreground">Another IEP meeting this year?</p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  <Crown className="h-4 w-4 mr-2" />
                  Add Hero Pack - $395
                </Button>
              </div>
              <div className="p-3 border rounded-lg hover-scale">
                <p className="font-medium">Annual Premium</p>
                <p className="text-sm text-muted-foreground">Save $189 with yearly plan</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold">$399/year</span>
                  <Badge variant="secondary">Save 33%</Badge>
                </div>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Upgrade to Annual
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advocate Marketplace */}
          <Card className="bg-gradient-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Expert Advocates
              </CardTitle>
              <CardDescription>Connect with certified advocates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {advocates.slice(0, 2).map((advocate, index) => (
                <div key={index} className="p-3 border rounded-lg hover-scale">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{advocate.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{advocate.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{advocate.specialty}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{advocate.rate}</span>
                    <Badge variant="outline" className="text-xs">
                      {advocate.nextAvailable}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-3">
                <Users className="h-4 w-4 mr-2" />
                Browse All Advocates
              </Button>
            </CardContent>
          </Card>

          {/* Referral Program */}
          <Card className="bg-gradient-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                Refer & Earn
              </CardTitle>
              <CardDescription>Share success, earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-bold text-green-800">$100 Credit</p>
                <p className="text-sm text-green-700">For each family you refer</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Families referred: <span className="font-semibold">3</span></p>
                <p>Credits earned: <span className="font-semibold text-green-600">$300</span></p>
              </div>
              <Button className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Community Engagement */}
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              Community Success Stories
            </CardTitle>
            <CardDescription>See what families in your area are achieving</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Recent Wins in Your Area</h4>
                <div className="space-y-3">
                  {communityWins.map((win, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover-scale">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium">{win.text}</p>
                        <p className="text-xs text-muted-foreground">{win.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Share Your Success</h4>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium mb-2">Got a win to share?</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Help inspire other families with your success story
                  </p>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Share Your Story
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <Button asChild variant="default" className="w-full justify-start hover-scale">
                  <Link to="/tools/iep-review">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload & Review IEP
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start hover-scale">
                  <Link to="/tools/autism-accommodations">
                    <Users className="h-4 w-4 mr-2" />
                    Build Accommodations
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start hover-scale">
                  <Link to="/parent/meeting-prep">
                    <Calendar className="h-4 w-4 mr-2" />
                    Prepare for Meeting
                  </Link>
                </Button>
                <Button asChild variant="hero" className="w-full justify-start hover-scale">
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
                  <div key={index} className="space-y-2 p-3 bg-surface rounded-lg hover-scale">
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

        {/* AI Document Upload & Analysis */}
        <DocumentUpload onAnalysisComplete={(analysis) => {
          console.log('Analysis completed:', analysis);
        }} />

        {/* Recent Documents */}
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Document Vault
            </CardTitle>
            <CardDescription>
              Secure storage with $2,340 in accumulated value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg hover-scale">
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
              <Button variant="outline" className="w-full hover-scale">
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