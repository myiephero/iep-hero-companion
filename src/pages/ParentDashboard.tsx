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
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900">{totalGoals}</div>
                <div className="text-gray-600 font-medium">Active Goals</div>
                <div className="mt-2">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                    {goals.filter(g => g.status === 'completed').length} completed
                  </Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900">{upcomingMeetings}</div>
                <div className="text-gray-600 font-medium">Upcoming Meetings</div>
                <div className="mt-2">
                  <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                    Auto reminders on
                  </Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900">{completionRate}%</div>
                <div className="text-gray-600 font-medium">Completion Rate</div>
                <div className="mt-2">
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
                    Keep going!
                  </Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900">{insights.length}</div>
                <div className="text-gray-600 font-medium">AI Insights</div>
                <div className="mt-2">
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
                    Data analyzed
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6">
                <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => navigate('/parent/goals')}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl rounded-lg p-6 h-auto font-medium transition-all duration-300 flex items-center justify-center gap-3"
                    data-testid="button-goal-tracking"
                  >
                    <Target className="h-6 w-6" />
                    <span>Goal Tracking</span>
                  </Button>
                  <Button 
                    onClick={() => navigate('/parent/schedule')}
                    className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl rounded-lg p-6 h-auto font-medium transition-all duration-300 flex items-center justify-center gap-3"
                    data-testid="button-meetings"
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Meetings</span>
                  </Button>
                  <Button 
                    onClick={() => navigate('/parent/ai-insights')}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl rounded-lg p-6 h-auto font-medium transition-all duration-300 flex items-center justify-center gap-3"
                    data-testid="button-ai-insights"
                  >
                    <Sparkles className="h-6 w-6" />
                    <span>AI Insights</span>
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Add New Goal Section */}
            <Card className="border-0 shadow-lg overflow-hidden mt-6">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Track and celebrate your child's progress</h3>
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
            </Card>
          </div>
        </div>
      </div>
      
      {/* Feedback Chat Component */}
      <FeedbackChat />
    </DashboardLayout>
  );
}