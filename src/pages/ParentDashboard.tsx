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
  id?: string;
  full_name?: string;
  grade_level?: string;
  disability_category?: string;
}

export default function ParentDashboard({ plan }: ParentDashboardProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
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

  const getStudentName = (studentId: string | undefined): string => {
    if (!studentId) return 'Unknown Student';
    const student = students.find(s => s.id === studentId);
    return student?.full_name || 'Unknown Student';
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
          description: "Redirecting you to complete your subscription setup..."
        });
        
        setTimeout(() => {
          navigate(`/subscription-setup?${params.toString()}`);
        }, 2000);
      } catch (error) {
        console.error('Error parsing pending subscription:', error);
        localStorage.removeItem('pendingSubscription');
      }
    }
  }, [user, navigate, toast]);

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
      console.log('✅ PRODUCTION: Found students for parent:', studentsData.map(s => s.full_name));
      
      // Transform the data to match our interface
      setGoals((goalsData || []).map(goal => ({ 
        ...goal, 
        id: goal.id || '', 
        status: (goal.status || 'not_started') as 'not_started' | 'in_progress' | 'completed' | 'on_hold',
        current_progress: goal.current_progress || 0,
        target_date: goal.target_date || '',
        goal_type: goal.goal_type || '',
        notes: goal.notes || '',
        created_at: goal.created_at || ''
      })));
      setMeetings((meetingsData || []).map(meeting => ({ 
        ...meeting, 
        id: meeting.id || '', 
        status: (meeting.status || 'scheduled') as 'scheduled' | 'completed' | 'cancelled',
        description: meeting.description || '',
        location: meeting.location || '',
        meeting_type: meeting.meeting_type || 'iep',
        created_at: meeting.created_at || ''
      })));
      setInsights((insightsData || []).map(insight => ({
        ...insight,
        id: insight.id || '',
        areas_of_concern: insight.areas_of_concern || [],
        strengths: insight.strengths || [],
        recommendations: insight.recommendations || [],
        created_at: insight.created_at || '',
        review_type: insight.review_type || ''
      })));
      setStudents(studentsData || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: "Some data may not be up to date. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      if (!goalForm.title.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide a goal title.",
          variant: "destructive"
        });
        return;
      }

      const newGoal = await api.createGoal({
        title: goalForm.title,
        description: goalForm.description,
        goal_type: goalForm.goal_type,
        target_date: goalForm.target_date,
        status: goalForm.status,
        current_progress: 0
      });

      if (newGoal) {
        setGoals(prev => [{
          ...newGoal,
          id: newGoal.id || '',
          status: (newGoal.status || 'not_started') as 'not_started' | 'in_progress' | 'completed' | 'on_hold',
          current_progress: newGoal.current_progress || 0,
          target_date: newGoal.target_date || '',
          goal_type: newGoal.goal_type || '',
          notes: newGoal.notes || '',
          created_at: newGoal.created_at || ''
        }, ...prev]);
      }
      setShowGoalDialog(false);
      setGoalForm({
        title: '',
        description: '',
        goal_type: '',
        target_date: '',
        status: 'not_started'
      });
      
      toast({
        title: "Goal Created",
        description: "Your new IEP goal has been added successfully."
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error Creating Goal",
        description: "Please try again later.",
        variant: "destructive"
      });
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 border-b border-gray-100">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="text-center lg:text-left mb-6 lg:mb-0">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-lg">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Welcome Back, {user?.firstName || 'Parent'}!
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                          {planName}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Your comprehensive IEP management hub with AI-powered insights, goal tracking, and comprehensive IEP management.
                  </p>
                </div>

                {hasFeatureAccess(userPlan, 'smartLetterGenerator') ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => navigate('/parent/tools/smart-letter-generator')}
                      className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Explore Premium Tools
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/parent/students')}
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Students
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/parent/document-vault')}
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Document Vault
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => navigate('/subscription')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-4 text-lg"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Premium Plan
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  badge: completionRate >= 75 ? "Excellent!" : completionRate >= 50 ? "Good progress" : "Keep going!",
                  color: "from-purple-500 to-pink-600",
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
                <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-gray-900">{title}</p>
                            <p className="text-sm font-medium text-gray-600">{subtitle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="w-full mt-4 bg-white/60 hover:bg-white/80 text-gray-700 border border-gray-200/50"
                      onClick={() => {
                        const actions = [
                          () => {
                            console.log('📊 Goals card clicked!');
                            toast({
                              title: "Goal Tracking",
                              description: `You have ${totalGoals} active goals with ${completedGoals} completed. Keep up the great work!`,
                            });
                          },
                          () => {
                            console.log('📅 Meetings card clicked!');
                            toast({
                              title: "Meetings Overview",
                              description: `You have ${upcomingMeetings} upcoming meetings scheduled. Auto-reminders are enabled.`,
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
                      data-testid="button-goal-tracking"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <span>Goal Tracking</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meetings"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg p-4 font-medium transition-all duration-300 hover:bg-white/50"
                      data-testid="button-meetings"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>Meetings</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="insights"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg p-4 font-medium transition-all duration-300 hover:bg-white/50"
                      data-testid="button-ai-insights"
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
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3"
                                data-testid="button-add-new-goal">
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
                              <SelectContent>
                                <SelectItem value="academic">Academic</SelectItem>
                                <SelectItem value="behavioral">Behavioral</SelectItem>
                                <SelectItem value="communication">Communication</SelectItem>
                                <SelectItem value="social">Social</SelectItem>
                                <SelectItem value="life-skills">Life Skills</SelectItem>
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
                          <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateGoal} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                              Create Goal
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid gap-6">
                    {goals.length > 0 ? (
                      goals.map((goal) => (
                        <Card key={goal.id} className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                              <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                            </div>
                            <Badge 
                              variant={goal.status === 'completed' ? 'default' : goal.status === 'in_progress' ? 'secondary' : 'outline'}
                              className="capitalize"
                            >
                              {goal.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium text-gray-900">{goal.current_progress}%</span>
                            </div>
                            <Progress value={goal.current_progress} className="h-2" />
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>Type: {goal.goal_type}</span>
                              <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
                        <p className="text-gray-600 mb-4">Create your first IEP goal to get started.</p>
                      </div>
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
                    <Button 
                      onClick={() => navigate('/parent/schedule')}
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Hub
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {meetings.length > 0 ? (
                      meetings.slice(0, 3).map((meeting) => (
                        <Card key={meeting.id} className="p-4 border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Calendar className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span>{new Date(meeting.scheduled_date).toLocaleDateString()}</span>
                                  <span>{meeting.location}</span>
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant={meeting.status === 'completed' ? 'default' : meeting.status === 'scheduled' ? 'secondary' : 'outline'}
                              className="capitalize"
                            >
                              {meeting.status}
                            </Badge>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Meetings Scheduled</h3>
                        <p className="text-gray-600 mb-4">Schedule your first meeting to get started.</p>
                        <Button 
                          onClick={() => navigate('/parent/schedule')}
                          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                        >
                          Schedule Meeting
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Enhanced AI Insights Tab */}
                <TabsContent value="insights" className="p-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
                    <p className="text-gray-600 mt-1">Data-driven analysis of your child's IEP documents</p>
                  </div>

                  <div className="grid gap-4">
                    {insights.length > 0 ? (
                      insights.slice(0, 3).map((insight) => (
                        <Card key={insight.id} className="p-4 border-0 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                              onClick={() => navigate('/parent/ai-insights')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Sparkles className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 capitalize">{insight.review_type} Analysis</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  Generated on {new Date(insight.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Analyzed
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Insights Yet</h3>
                        <p className="text-gray-600 mb-4">Upload an IEP document to get AI-powered analysis.</p>
                        <Button 
                          onClick={() => navigate('/parent/document-vault')}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        >
                          Upload Document
                        </Button>
                      </div>
                    )}
                  </div>
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