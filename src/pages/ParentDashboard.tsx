import { useState, useEffect } from "react";
import { Calendar, Target, TrendingUp, Clock, Plus, BookOpen, AlertCircle, Star, Trophy, Sparkles, ChevronRight, Users, CheckCircle2, ArrowUpRight, Rocket, FileText, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { supabase } from "@/integrations/supabase/client"; // Removed during migration
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { SubscriptionPlan, hasFeatureAccess, getPlanFeatures, normalizeSubscriptionPlan, getPlanDisplayName } from "@/lib/planAccess";
import { FeedbackChat } from "@/components/FeedbackChat";

interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  current_progress: number;
  target_date: string;
  goal_type: string;
  notes: string;
  created_at: string;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduled_date: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meeting_type: string;
  created_at: string;
}

interface AIInsight {
  id: string;
  areas_of_concern: any[];
  strengths: any[];
  recommendations: any[];
  created_at: string;
  review_type: string;
}

interface ParentDashboardProps {
  plan?: SubscriptionPlan;
}

interface Student {
  id: string;
  name: string;
  grade?: string;
  disability?: string;
}

export default function ParentDashboard({ plan }: ParentDashboardProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Determine the user's subscription plan
  const userPlan = plan || normalizeSubscriptionPlan(user?.subscriptionPlan);
  const planFeatures = getPlanFeatures(userPlan);
  const planName = getPlanDisplayName(userPlan);

  // Form states
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    goal_type: '',
    target_date: '',
    status: 'not_started' as const
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    location: '',
    meeting_type: 'iep'
  });

  const getStudentName = (studentId: string | undefined): string => {
    if (!studentId) return 'Unknown Student';
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  useEffect(() => {
    fetchData();
    
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
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch goals using new API
      const goalsData = await api.getGoals();
      
      // Fetch meetings using new API  
      const meetingsData = await api.getMeetings();
      
      // Fetch AI insights using new API
      const insightsData = await api.getAIReviews();
      
      // Fetch students using new API
      const studentsData = await api.getStudents();

      setGoals((goalsData || []).map(goal => ({ 
        ...goal, 
        id: goal.id || '', 
        status: goal.status as any,
        current_progress: goal.current_progress || 0,
        target_date: goal.target_date || '',
        goal_type: goal.goal_type || '',
        notes: goal.notes || '',
        created_at: goal.created_at || ''
      })));
      setMeetings((meetingsData || []).map(meeting => ({ 
        ...meeting, 
        id: meeting.id || '', 
        status: meeting.status as any,
        description: meeting.description || '',
        location: meeting.location || '',
        meeting_type: meeting.meeting_type || '',
        created_at: meeting.created_at || ''
      })));
      setInsights((insightsData || []).map(insight => ({ 
        ...insight,
        id: insight.id || '',
        areas_of_concern: Array.isArray(insight.areas_of_concern) ? insight.areas_of_concern : [],
        strengths: Array.isArray(insight.strengths) ? insight.strengths : [],
        recommendations: Array.isArray(insight.recommendations) ? insight.recommendations : [],
        created_at: insight.created_at || '',
        review_type: insight.review_type || 'quality'
      })));
      
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    try {
      await api.createGoal({
        ...goalForm,
        student_id: user?.id || 'placeholder' // Using user.id as placeholder
      });

      toast({
        title: "Success",
        description: "Goal created successfully!",
      });

      setShowGoalDialog(false);
      setGoalForm({
        title: '',
        description: '',
        goal_type: '',
        target_date: '',
        status: 'not_started'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scheduleMeeting = async () => {
    try {
      await api.createMeeting({
        ...meetingForm,
        student_id: user?.id || 'placeholder' // Using user.id as placeholder
      });

      toast({
        title: "Success",
        description: "Meeting scheduled successfully! Reminders will be sent automatically.",
      });

      setShowMeetingDialog(false);
      setMeetingForm({
        title: '',
        description: '',
        scheduled_date: '',
        location: '',
        meeting_type: 'iep'
      });
      fetchData();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateGoalStatus = async (goalId: string, status: string) => {
    try {
      await api.updateGoal(goalId, { status });

      toast({
        title: "Success",
        description: "Goal status updated!",
      });

      fetchData();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal status.",
        variant: "destructive",
      });
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      await api.updateGoal(goalId, { current_progress: progress });
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, current_progress: progress } : goal
      ));
      toast({
        title: "Progress Updated",
        description: `Goal progress set to ${progress}%`,
      });
      fetchData();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast({
        title: "Error",
        description: "Failed to update goal progress.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'on_hold': return 'On Hold';
      default: return status;
    }
  };

  // Calculate statistics
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalGoals = goals.length;
  const upcomingMeetings = meetings.filter(m => new Date(m.scheduled_date) > new Date()).length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading your dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Enhanced Hero Section with Unified Design */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl pointer-events-none" />
          <div className="relative p-8 text-center z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {user?.firstName ? `Welcome back, ${user.firstName}!` : 'Premium Dashboard'}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Your premium command center for advocacy excellence, real-time progress tracking, and comprehensive IEP management.
            </p>
            
            {/* Plan Status Badge */}
            <div className="flex justify-center mb-6">
              <Badge 
                variant={userPlan === 'hero' ? "default" : "secondary"}
                className={userPlan === 'hero' 
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 text-lg font-bold"
                  : "px-6 py-2 text-lg"
                }
              >
                {planName} Plan
              </Badge>
            </div>
              
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 cursor-pointer"
                onClick={() => {
                  console.log('🚀 Explore Premium Tools clicked!');
                  navigate('/parent/tools/emergent');
                }}
                data-testid="button-explore-premium-tools"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Explore Premium Tools
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary/30 hover:border-primary text-primary hover:bg-primary/5 px-6 py-3 cursor-pointer"
                onClick={() => {
                  console.log('👥 Manage Students clicked!');
                  navigate('/parent/students');
                }}
                data-testid="button-manage-students"
              >
                <Users className="h-5 w-5 mr-2" />
                Manage Students
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-purple-500/30 hover:border-purple-500 text-purple-600 hover:bg-purple-50 px-6 py-3 cursor-pointer"
                onClick={() => {
                  console.log('📁 Document Vault clicked!');
                  navigate('/parent/tools/document-vault');
                }}
                data-testid="button-document-vault"
              >
                <FileText className="h-5 w-5 mr-2" />
                Document Vault
              </Button>
            </div>
          </div>
        </div>

        {/* Upgrade Section for Stripe Testing - Only show for free/basic users */}
        {userPlan === 'free' && (
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Rocket className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-semibold">
                          Free Plan Active
                        </Badge>
                      </div>
                      <h2 className="text-3xl font-bold mb-3">🚀 Unlock Premium IEP Tools</h2>
                      <p className="text-white/90 mb-6 text-lg">
                        Test our payment system! Get AI-powered analysis, smart letters, and expert advocate matching.
                      </p>
                      <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-300" />
                          <span className="font-medium">AI Document Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-300" />
                          <span className="font-medium">Smart Letter Generator</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-300" />
                          <span className="font-medium">Expert Advocate Network</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 min-w-[280px]">
                      <Button 
                        onClick={() => navigate('/parent/subscribe')}
                        size="lg"
                        className="bg-white text-purple-600 hover:bg-white/90 font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        data-testid="button-view-all-plans"
                      >
                        <Star className="h-5 w-5 mr-2" />
                        View All Plans & Test Payments
                      </Button>
                      <Button 
                        onClick={() => navigate('/upsell/hero-plan')}
                        variant="outline" 
                        size="lg"
                        className="border-2 border-white/30 text-white hover:bg-white/10 font-bold text-lg py-4 px-8 rounded-xl backdrop-blur-sm"
                        data-testid="button-hero-plan-test"
                      >
                        <Trophy className="h-5 w-5 mr-2" />
                        Test Hero Plan ($495)
                      </Button>
                      <Button 
                        onClick={() => navigate('/subscribe')}
                        variant="ghost"
                        size="lg"
                        className="text-white/80 hover:text-white hover:bg-white/5 font-medium"
                        data-testid="button-quick-subscribe"
                      >
                        Quick Subscribe Test →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Quick Stats with Unified Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  icon: Target,
                  title: totalGoals,
                  subtitle: "Active Goals",
                  badge: `${completedGoals} completed`,
                  color: "from-primary to-secondary",
                  index: 0
                },
                {
                  icon: Calendar,
                  title: upcomingMeetings,
                  subtitle: "Upcoming Meetings", 
                  badge: "Auto reminders on",
                  color: "from-green-500 to-teal-600",
                  index: 1
                },
                {
                  icon: TrendingUp,
                  title: `${completionRate}%`,
                  subtitle: "Completion Rate",
                  badge: completionRate > 75 ? 'Excellent!' : completionRate > 50 ? 'Great!' : 'Keep going!',
                  color: "from-purple-500 to-indigo-600",
                  index: 2
                },
                {
                  icon: Sparkles,
                  title: insights.length,
                  subtitle: "AI Insights",
                  badge: "Data analyzed",
                  color: "from-orange-500 to-red-600",
                  index: 3
                }
              ].map(({ icon: Icon, title, subtitle, badge, color, index }) => (
                <Card 
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden cursor-pointer"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                  onClick={() => {
                    const actions = [
                      () => {
                        console.log('📊 Goals card clicked!');
                        // Focus on goals tab
                        const goalsTab = document.querySelector('[value="goals"]') as HTMLElement;
                        goalsTab?.click();
                      },
                      () => {
                        console.log('📅 Meetings card clicked!');
                        // Focus on meetings tab  
                        const meetingsTab = document.querySelector('[value="meetings"]') as HTMLElement;
                        meetingsTab?.click();
                      },
                      () => {
                        console.log('📈 Progress card clicked!');
                        // Show progress details
                        toast({
                          title: "Progress Details",
                          description: `You have completed ${completedGoals} out of ${totalGoals} goals. ${badge}`,
                        });
                      },
                      () => {
                        console.log('🔮 AI Insights card clicked!');
                        // Focus on AI insights tab
                        const insightsTab = document.querySelector('[value="insights"]') as HTMLElement;
                        insightsTab?.click();
                      }
                    ];
                    actions[index]?.();
                  }}
                  data-testid={`card-stat-${index}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-muted-foreground mb-3 font-medium">{subtitle}</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        const actions = [
                          () => {
                            toast({
                              title: "Goal Completion",
                              description: `${completedGoals} goals completed out of ${totalGoals} total goals.`,
                            });
                          },
                          () => {
                            toast({
                              title: "Auto Reminders",
                              description: "Email reminders are automatically sent 7, 3, and 1 day before each meeting.",
                            });
                          },
                          () => {
                            toast({
                              title: "Completion Rate",
                              description: `Your completion rate is ${completionRate}%. ${badge}`,
                            });
                          },
                          () => {
                            toast({
                              title: "AI Analysis",
                              description: `${insights.length} AI insights have been generated from your data.`,
                            });
                          }
                        ];
                        actions[index]?.();
                      }}
                      data-testid={`button-badge-${index}`}
                    >
                      {badge}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Enhanced Tabs with Unified Design System */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <Tabs defaultValue="goals" className="w-full">
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-transparent p-1 h-auto">
                    <TabsTrigger 
                      value="goals" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg p-4 font-medium transition-all duration-300 hover:bg-white/50"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <span>Goal Tracking</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meetings"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg p-4 font-medium transition-all duration-300 hover:bg-white/50"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>Meetings</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="insights"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg p-4 font-medium transition-all duration-300 hover:bg-white/50"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        <span>AI Insights</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>

              {/* Enhanced Goals Tab */}
              <TabsContent value="goals" className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">IEP Goals</h2>
                    <p className="text-gray-600 mt-1">Track and celebrate your child's progress</p>
                  </div>
                  <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900">Create New Goal</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Set up a new IEP goal to track your child's progress.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="goal-title" className="text-sm font-medium text-gray-700">Goal Title</Label>
                          <Input
                            id="goal-title"
                            value={goalForm.title}
                            onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                            placeholder="Enter goal title"
                            className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-description" className="text-sm font-medium text-gray-700">Description</Label>
                          <Textarea
                            id="goal-description"
                            value={goalForm.description}
                            onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                            placeholder="Describe the goal"
                            className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-type" className="text-sm font-medium text-gray-700">Goal Type</Label>
                          <Select value={goalForm.goal_type} onValueChange={(value) => setGoalForm({...goalForm, goal_type: value})}>
                            <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                              <SelectValue placeholder="Select goal type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200 shadow-xl rounded-lg">
                              <SelectItem value="academic">📚 Academic</SelectItem>
                              <SelectItem value="behavioral">🎯 Behavioral</SelectItem>
                              <SelectItem value="social">👥 Social</SelectItem>
                              <SelectItem value="communication">💬 Communication</SelectItem>
                              <SelectItem value="life_skills">🌟 Life Skills</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="target-date" className="text-sm font-medium text-gray-700">Target Date</Label>
                          <Input
                            id="target-date"
                            type="date"
                            value={goalForm.target_date}
                            onChange={(e) => setGoalForm({...goalForm, target_date: e.target.value})}
                            className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                        <Button 
                          onClick={createGoal} 
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg py-3 font-medium"
                        >
                          Create Goal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-6">
                  {goals.length === 0 ? (
                    <div className="space-y-6">
                      {/* Main Welcome Card */}
                      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
                        <CardContent className="relative text-center py-12 px-8">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                            <Target className="h-20 w-20 mx-auto text-blue-600 relative drop-shadow-lg" />
                          </div>
                          <h3 className="text-3xl font-bold mb-3 text-gray-900">Let's Start Your IEP Journey!</h3>
                          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Track your child's progress, celebrate achievements, and stay organized with personalized IEP goal management designed for families like yours.
                          </p>
                          <div className="flex justify-center">
                            <Button 
                              onClick={() => setShowGoalDialog(true)}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-4 text-lg font-semibold"
                              data-testid="button-create-first-goal"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              Create Your First Goal
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Start Guide */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Start Simple</h4>
                                <p className="text-gray-600 mb-4">Begin with one meaningful goal from your child's current IEP. Focus on something you can track daily or weekly.</p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">📚 Reading fluency</Badge>
                                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">🎯 Focus time</Badge>
                                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">💬 Communication</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h4>
                                <p className="text-gray-600 mb-4">Update goal progress regularly and celebrate small wins. Visual progress tracking helps motivate both you and your child.</p>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Weekly check-ins</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Milestone celebrations</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Goal Type Examples */}
                      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden">
                        <CardContent className="p-8">
                          <div className="text-center mb-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Common IEP Goal Categories</h4>
                            <p className="text-gray-600">Choose the type that best matches your child's current focus areas</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setGoalForm({...goalForm, goal_type: 'academic'})}>
                              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📚</div>
                              <div className="text-sm font-medium text-gray-900">Academic</div>
                              <div className="text-xs text-gray-500 mt-1">Reading, Math, Writing</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setGoalForm({...goalForm, goal_type: 'behavioral'})}>
                              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🎯</div>
                              <div className="text-sm font-medium text-gray-900">Behavioral</div>
                              <div className="text-xs text-gray-500 mt-1">Self-regulation, Focus</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setGoalForm({...goalForm, goal_type: 'social'})}>
                              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">👥</div>
                              <div className="text-sm font-medium text-gray-900">Social</div>
                              <div className="text-xs text-gray-500 mt-1">Peer interaction, Teamwork</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setGoalForm({...goalForm, goal_type: 'communication'})}>
                              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">💬</div>
                              <div className="text-sm font-medium text-gray-900">Communication</div>
                              <div className="text-xs text-gray-500 mt-1">Speech, Language</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setGoalForm({...goalForm, goal_type: 'life_skills'})}>
                              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🌟</div>
                              <div className="text-sm font-medium text-gray-900">Life Skills</div>
                              <div className="text-xs text-gray-500 mt-1">Independence, Daily tasks</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    goals.map((goal) => (
                      <Card key={goal.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardContent className="p-6 relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              {/* Student Name - Prominently displayed */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm font-semibold text-blue-700">
                                    {getStudentName(goal.student_id)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-4 h-4 rounded-full ${getStatusColor(goal.status)} shadow-sm`} />
                                <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                                <Badge variant="outline" className="capitalize bg-gray-50 text-gray-700 border-gray-200">
                                  {goal.goal_type?.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-4">{goal.description}</p>
                            </div>
                            <Select value={goal.status} onValueChange={(value) => updateGoalStatus(goal.id, value)}>
                              <SelectTrigger className="w-36 border-gray-300 focus:border-blue-500 rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-200 shadow-xl rounded-lg">
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">✅ Completed</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">{getStatusLabel(goal.status)}</span>
                                <span className="text-sm font-semibold text-blue-600">{goal.current_progress || 0}%</span>
                              </div>
                              <div className="relative mb-3">
                                <Progress value={goal.current_progress || 0} className="h-3 bg-gray-100" />
                                <div 
                                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                                  style={{width: `${goal.current_progress || 0}%`}}
                                ></div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 min-w-[60px]">Progress:</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={goal.current_progress || 0}
                                  onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                  style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${goal.current_progress || 0}%, #e5e7eb ${goal.current_progress || 0}%, #e5e7eb 100%)`
                                  }}
                                  data-testid={`slider-progress-${goal.id}`}
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateGoalProgress(goal.id, Math.max(0, (goal.current_progress || 0) - 10))}
                                    className="h-6 w-6 p-0 text-xs"
                                    data-testid={`button-decrease-progress-${goal.id}`}
                                  >
                                    -
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateGoalProgress(goal.id, Math.min(100, (goal.current_progress || 0) + 10))}
                                    className="h-6 w-6 p-0 text-xs"
                                    data-testid={`button-increase-progress-${goal.id}`}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {goal.target_date && (
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-700">Target Date</div>
                                <div className="text-sm text-gray-500">{new Date(goal.target_date).toLocaleDateString()}</div>
                              </div>
                            )}
                          </div>
                          
                          {goal.status === 'completed' && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                              <Trophy className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-800">🎉 Goal completed! Great job!</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Enhanced Meetings Tab */}
              <TabsContent value="meetings" className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Meeting Schedule</h2>
                    <p className="text-gray-600 mt-1">Stay organized with automated reminders</p>
                  </div>
                  <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900">Schedule IEP Meeting</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Schedule a meeting and get automatic email reminders.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="meeting-title" className="text-sm font-medium text-gray-700">Meeting Title</Label>
                          <Input
                            id="meeting-title"
                            value={meetingForm.title}
                            onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                            placeholder="Enter meeting title"
                            className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="meeting-description" className="text-sm font-medium text-gray-700">Description</Label>
                          <Textarea
                            id="meeting-description"
                            value={meetingForm.description}
                            onChange={(e) => setMeetingForm({...meetingForm, description: e.target.value})}
                            placeholder="Meeting agenda or notes"
                            className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="meeting-date" className="text-sm font-medium text-gray-700">Date & Time</Label>
                          <Input
                            id="meeting-date"
                            type="datetime-local"
                            value={meetingForm.scheduled_date}
                            onChange={(e) => setMeetingForm({...meetingForm, scheduled_date: e.target.value})}
                            className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="meeting-location" className="text-sm font-medium text-gray-700">Location</Label>
                          <Input
                            id="meeting-location"
                            value={meetingForm.location}
                            onChange={(e) => setMeetingForm({...meetingForm, location: e.target.value})}
                            placeholder="Meeting location"
                            className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="meeting-type" className="text-sm font-medium text-gray-700">Meeting Type</Label>
                          <Select value={meetingForm.meeting_type} onValueChange={(value) => setMeetingForm({...meetingForm, meeting_type: value})}>
                            <SelectTrigger className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200 shadow-xl rounded-lg">
                              <SelectItem value="iep">🎯 IEP Meeting</SelectItem>
                              <SelectItem value="504">📋 504 Plan Meeting</SelectItem>
                              <SelectItem value="evaluation">📊 Evaluation Meeting</SelectItem>
                              <SelectItem value="review">📅 Annual Review</SelectItem>
                              <SelectItem value="other">📝 Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={scheduleMeeting} 
                          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg py-3 font-medium"
                        >
                          Schedule Meeting
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {meetings.length === 0 ? (
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 overflow-hidden">
                      <CardContent className="text-center py-12">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                          <Calendar className="h-16 w-16 mx-auto text-purple-500 mb-4 relative" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">Schedule your first meeting</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">Never miss an important IEP meeting with automated email reminders.</p>
                        <Button 
                          onClick={() => setShowMeetingDialog(true)}
                          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8 py-3"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Schedule Your First Meeting
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    meetings.map((meeting) => (
                      <Card key={meeting.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardContent className="p-6 relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                  <Calendar className="h-4 w-4 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                                <Badge variant="outline" className="capitalize bg-purple-50 text-purple-700 border-purple-200">
                                  {meeting.meeting_type?.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-gray-600">{meeting.description}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <Calendar className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {new Date(meeting.scheduled_date).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500">Date</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <Clock className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {new Date(meeting.scheduled_date).toLocaleTimeString()}
                                </div>
                                <div className="text-xs text-gray-500">Time</div>
                              </div>
                            </div>
                          </div>
                          
                          {meeting.location && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                              <div className="text-sm font-medium text-gray-700">Location</div>
                              <div className="text-sm text-gray-600">{meeting.location}</div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Email reminders: 7, 3, and 1 day before</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Enhanced AI Insights Tab */}
              <TabsContent value="insights" className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
                  <p className="text-gray-600 mt-1">Data-driven analysis of your child's IEP documents</p>
                </div>
                
                {insights.length === 0 ? (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                    <CardContent className="text-center py-12">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                        <Sparkles className="h-16 w-16 mx-auto text-amber-500 mb-4 relative" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">Discover AI insights</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">Upload and analyze IEP documents to get data-driven insights and recommendations.</p>
                      <Button asChild className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8 py-3">
                        <a href="/parent/tools/unified-iep-review">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analyze IEP Document
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    <Card className="border-0 shadow-xl bg-white overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                        <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-amber-600" />
                          Recent Analysis Summary
                        </CardTitle>
                        <CardDescription className="text-gray-600">Key insights from your latest IEP reviews</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        {/* Enhanced Areas of Concern */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <AlertCircle className="h-5 w-5 text-orange-600" />
                            </div>
                            <span className="text-gray-900">Areas of Focus</span>
                          </h4>
                          <div className="grid gap-3">
                            {insights.slice(0, 3).map((insight, index) => {
                              const concerns = Array.isArray(insight.areas_of_concern) ? insight.areas_of_concern : [];
                              return concerns.slice(0, 2).map((concern: any, concernIndex: number) => (
                                <div key={`${index}-${concernIndex}`} className="group hover:shadow-md transition-all duration-200 flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-3 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-orange-900 mb-1">
                                      {typeof concern === 'string' ? concern : concern.title || concern.area || 'Concern identified'}
                                    </p>
                                    {typeof concern === 'object' && concern.description && (
                                      <p className="text-xs text-orange-700">{concern.description}</p>
                                    )}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-orange-400 group-hover:text-orange-600 transition-colors" />
                                </div>
                              ));
                            })}
                          </div>
                        </div>

                        {/* Enhanced Strengths */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-gray-900">Key Strengths</span>
                          </h4>
                          <div className="grid gap-3">
                            {insights.slice(0, 3).map((insight, index) => {
                              const strengths = Array.isArray(insight.strengths) ? insight.strengths : [];
                              return strengths.slice(0, 2).map((strength: any, strengthIndex: number) => (
                                <div key={`${index}-${strengthIndex}`} className="group hover:shadow-md transition-all duration-200 flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-green-900 mb-1">
                                      {typeof strength === 'string' ? strength : strength.title || strength.area || 'Strength identified'}
                                    </p>
                                    {typeof strength === 'object' && strength.description && (
                                      <p className="text-xs text-green-700">{strength.description}</p>
                                    )}
                                  </div>
                                  <Star className="h-4 w-4 text-green-400 group-hover:text-green-600 transition-colors" />
                                </div>
                              ));
                            })}
                          </div>
                        </div>

                        {/* Enhanced Recommendations */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-gray-900">AI Recommendations</span>
                          </h4>
                          <div className="grid gap-3">
                            {insights.slice(0, 3).map((insight, index) => {
                              const recommendations = Array.isArray(insight.recommendations) ? insight.recommendations : [];
                              return recommendations.slice(0, 2).map((rec: any, recIndex: number) => (
                                <div key={`${index}-${recIndex}`} className="group hover:shadow-md transition-all duration-200 flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900 mb-1">
                                      {typeof rec === 'string' ? rec : rec.title || rec.recommendation || 'Recommendation available'}
                                    </p>
                                    {typeof rec === 'object' && rec.description && (
                                      <p className="text-xs text-blue-700">{rec.description}</p>
                                    )}
                                  </div>
                                  <ArrowUpRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                              ));
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Enhanced Analysis History */}
                    <Card className="border-0 shadow-lg bg-white">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-900">Analysis History</CardTitle>
                        <CardDescription className="text-gray-600">Your recent IEP document reviews</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {insights.map((insight) => (
                            <button
                              key={insight.id} 
                              className="group hover:shadow-md transition-all duration-200 flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 w-full text-left cursor-pointer hover:bg-gray-50"
                              onClick={() => {
                                // Navigate to the Document Vault to show the most recent IEP review
                                window.location.href = '/tools/document-vault';
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                  <BookOpen className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="font-medium capitalize text-gray-900">{insight.review_type} Analysis</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(insight.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Analyzed
                                </Badge>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
          </div>
        </div>
      </div>
      
      {/* Feedback Chat Component */}
      <FeedbackChat />
    </DashboardLayout>
  );
}