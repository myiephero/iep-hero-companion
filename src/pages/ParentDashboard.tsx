import { useState, useEffect } from "react";
import { Calendar, Target, TrendingUp, Clock, Plus, BookOpen, AlertCircle, Star, Trophy, Sparkles, ChevronRight, Users, CheckCircle2, ArrowUpRight } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";

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

export default function ParentDashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (meetingsError) throw meetingsError;

      // Fetch AI insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('ai_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (insightsError) throw insightsError;

      setGoals((goalsData || []).map(goal => ({ ...goal, status: goal.status as any })));
      setMeetings((meetingsData || []).map(meeting => ({ ...meeting, status: meeting.status as any })));
      setInsights((insightsData || []).map(insight => ({ 
        ...insight, 
        areas_of_concern: Array.isArray(insight.areas_of_concern) ? insight.areas_of_concern : [],
        strengths: Array.isArray(insight.strengths) ? insight.strengths : [],
        recommendations: Array.isArray(insight.recommendations) ? insight.recommendations : []
      })));
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('goals')
        .insert({
          ...goalForm,
          user_id: user.id,
          student_id: user.id // Using user.id as placeholder
        });

      if (error) throw error;

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('meetings')
        .insert({
          ...meetingForm,
          user_id: user.id,
          student_id: user.id // Using user.id as placeholder
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('goals')
        .update({ status })
        .eq('id', goalId);

      if (error) throw error;

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        {/* Hero Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\&quot;60\&quot; height=\&quot;60\&quot; viewBox=\&quot;0 0 60 60\&quot; xmlns=\&quot;http://www.w3.org/2000/svg\&quot;%3E%3Cg fill=\&quot;none\&quot; fill-rule=\&quot;evenodd\&quot;%3E%3Cg fill=\&quot;%23ffffff\&quot; fill-opacity=\&quot;0.1\&quot;%3E%3Cpath d=\&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          <div className="container mx-auto px-6 py-12 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <Sparkles className="h-8 w-8 text-yellow-300" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Parent Empowerment Hub
                    </h1>
                    <p className="text-blue-100 text-lg font-medium">Guiding your child's IEP journey with confidence</p>
                  </div>
                </div>
                
                {completedGoals > 0 && (
                  <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg px-4 py-2 w-fit">
                    <Trophy className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm font-medium">🎉 {completedGoals} goals completed this year!</span>
                  </div>
                )}
              </div>
              
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-white">{totalGoals}</div>
                    <div className="text-sm text-blue-100">Active Goals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Enhanced Statistics Dashboard */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 -mt-12 relative z-10">
            {/* Goals Card with Progress Ring */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{totalGoals}</div>
                    <div className="text-sm text-gray-500">Total Goals</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-blue-600">{completedGoals}/{totalGoals}</span>
                  </div>
                  <div className="relative">
                    <Progress value={completionRate} className="h-2 bg-blue-100" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-80" style={{width: `${completionRate}%`}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completion Rate with Animated Progress */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors duration-300">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
                    <div className="text-sm text-gray-500">Completion Rate</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {completionRate > 75 && <Star className="h-4 w-4 text-yellow-500" />}
                  <span className="text-sm font-medium text-green-600">
                    {completionRate > 75 ? 'Excellent progress!' : completionRate > 50 ? 'Great momentum!' : 'Keep going!'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Meetings with Countdown */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-300">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{upcomingMeetings}</div>
                    <div className="text-sm text-gray-500">Upcoming</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Auto reminders enabled</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights with Sparkle Effect */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors duration-300">
                    <Sparkles className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{insights.length}</div>
                    <div className="text-sm text-gray-500">AI Insights</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-600">Documents analyzed</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tabs with Better Design */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <Tabs defaultValue="goals" className="w-full">
              <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm rounded-t-xl">
                <TabsList className="grid w-full grid-cols-3 bg-transparent p-1 h-auto">
                  <TabsTrigger 
                    value="goals" 
                    className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg p-4 font-medium transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Goal Tracking</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="meetings"
                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-lg p-4 font-medium transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Meetings</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights"
                    className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm rounded-lg p-4 font-medium transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
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

                <div className="grid gap-4">
                  {goals.length === 0 ? (
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                      <CardContent className="text-center py-12">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                          <Target className="h-16 w-16 mx-auto text-blue-500 mb-4 relative" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">Ready to set your first goal?</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">Start tracking your child's IEP goals and celebrate every milestone along the way.</p>
                        <Button 
                          onClick={() => setShowGoalDialog(true)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8 py-3"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Goal
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    goals.map((goal) => (
                      <Card key={goal.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardContent className="p-6 relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
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
                              <div className="relative">
                                <Progress value={goal.current_progress || 0} className="h-3 bg-gray-100" />
                                <div 
                                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                                  style={{width: `${goal.current_progress || 0}%`}}
                                ></div>
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
                        <a href="/tools/iep-review">
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
                            <div key={insight.id} className="group hover:shadow-md transition-all duration-200 flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300">
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
                            </div>
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
    </DashboardLayout>
  );
}