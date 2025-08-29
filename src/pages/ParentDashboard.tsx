import { useState, useEffect } from "react";
import { Calendar, Target, TrendingUp, Clock, Plus, BookOpen, AlertCircle } from "lucide-react";
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
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Parent Empowerment Dashboard</h1>
            <p className="text-muted-foreground mt-2">Track your child's IEP progress and stay organized</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalGoals}</div>
              <p className="text-xs text-muted-foreground">
                {completedGoals} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{completionRate}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground">
                Auto reminders enabled
              </p>
            </CardContent>
          </Card>

          <Card className="border-muted/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.length}</div>
              <p className="text-xs text-muted-foreground">
                Reviews analyzed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
            <TabsTrigger value="meetings">Meeting Schedule</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">IEP Goals</h2>
              <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                      Track your child's IEP goals and monitor progress.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goal-title">Goal Title</Label>
                      <Input
                        id="goal-title"
                        value={goalForm.title}
                        onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                        placeholder="Enter goal title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal-description">Description</Label>
                      <Textarea
                        id="goal-description"
                        value={goalForm.description}
                        onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                        placeholder="Describe the goal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal-type">Goal Type</Label>
                      <Select value={goalForm.goal_type} onValueChange={(value) => setGoalForm({...goalForm, goal_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="communication">Communication</SelectItem>
                          <SelectItem value="life_skills">Life Skills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="target-date">Target Date</Label>
                      <Input
                        id="target-date"
                        type="date"
                        value={goalForm.target_date}
                        onChange={(e) => setGoalForm({...goalForm, target_date: e.target.value})}
                      />
                    </div>
                    <Button onClick={createGoal} className="w-full">
                      Create Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {goals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
                    <p className="text-muted-foreground mb-4">Start tracking your child's IEP goals to monitor progress.</p>
                    <Button onClick={() => setShowGoalDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                goals.map((goal) => (
                  <Card key={goal.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription>{goal.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {goal.goal_type?.replace('_', ' ')}
                          </Badge>
                          <Select value={goal.status} onValueChange={(value) => updateGoalStatus(goal.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">Not Started</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="on_hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(goal.status)}`} />
                            <span className="text-sm font-medium">{getStatusLabel(goal.status)}</span>
                          </div>
                          <Progress value={goal.current_progress || 0} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Progress: {goal.current_progress || 0}%
                          </p>
                        </div>
                        {goal.target_date && (
                          <div className="text-right">
                            <p className="text-sm font-medium">Target Date</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(goal.target_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Meeting Schedule</h2>
              <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule IEP Meeting</DialogTitle>
                    <DialogDescription>
                      Schedule a meeting and get automatic email reminders.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="meeting-title">Meeting Title</Label>
                      <Input
                        id="meeting-title"
                        value={meetingForm.title}
                        onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                        placeholder="Enter meeting title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting-description">Description</Label>
                      <Textarea
                        id="meeting-description"
                        value={meetingForm.description}
                        onChange={(e) => setMeetingForm({...meetingForm, description: e.target.value})}
                        placeholder="Meeting agenda or notes"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting-date">Date & Time</Label>
                      <Input
                        id="meeting-date"
                        type="datetime-local"
                        value={meetingForm.scheduled_date}
                        onChange={(e) => setMeetingForm({...meetingForm, scheduled_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting-location">Location</Label>
                      <Input
                        id="meeting-location"
                        value={meetingForm.location}
                        onChange={(e) => setMeetingForm({...meetingForm, location: e.target.value})}
                        placeholder="Meeting location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting-type">Meeting Type</Label>
                      <Select value={meetingForm.meeting_type} onValueChange={(value) => setMeetingForm({...meetingForm, meeting_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iep">IEP Meeting</SelectItem>
                          <SelectItem value="504">504 Plan Meeting</SelectItem>
                          <SelectItem value="evaluation">Evaluation Meeting</SelectItem>
                          <SelectItem value="review">Annual Review</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={scheduleMeeting} className="w-full">
                      Schedule Meeting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {meetings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Meetings Scheduled</h3>
                    <p className="text-muted-foreground mb-4">Schedule IEP meetings and get automatic reminders.</p>
                    <Button onClick={() => setShowMeetingDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Your First Meeting
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                meetings.map((meeting) => (
                  <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{meeting.title}</CardTitle>
                          <CardDescription>{meeting.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {meeting.meeting_type?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Date</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(meeting.scheduled_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Time</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(meeting.scheduled_date).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      {meeting.location && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-xs text-muted-foreground">{meeting.location}</p>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Email reminders: 7, 3, and 1 day before</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <h2 className="text-2xl font-semibold">AI Insights</h2>
            
            {insights.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No AI Insights Yet</h3>
                  <p className="text-muted-foreground mb-4">Upload and analyze IEP documents to get data-driven insights.</p>
                  <Button asChild>
                    <a href="/tools/iep-review">Analyze IEP Document</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Analysis Summary</CardTitle>
                    <CardDescription>Key insights from your latest IEP reviews</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Top Areas of Concern */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Top Areas of Concern
                      </h4>
                      <div className="grid gap-2">
                        {insights.slice(0, 3).map((insight, index) => {
                          const concerns = Array.isArray(insight.areas_of_concern) ? insight.areas_of_concern : [];
                          return concerns.slice(0, 2).map((concern: any, concernIndex: number) => (
                            <div key={`${index}-${concernIndex}`} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-orange-900">
                                  {typeof concern === 'string' ? concern : concern.title || concern.area || 'Concern identified'}
                                </p>
                                {typeof concern === 'object' && concern.description && (
                                  <p className="text-xs text-orange-700 mt-1">{concern.description}</p>
                                )}
                              </div>
                            </div>
                          ));
                        })}
                      </div>
                    </div>

                    {/* Key Strengths */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Key Strengths
                      </h4>
                      <div className="grid gap-2">
                        {insights.slice(0, 3).map((insight, index) => {
                          const strengths = Array.isArray(insight.strengths) ? insight.strengths : [];
                          return strengths.slice(0, 2).map((strength: any, strengthIndex: number) => (
                            <div key={`${index}-${strengthIndex}`} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-green-900">
                                  {typeof strength === 'string' ? strength : strength.title || strength.area || 'Strength identified'}
                                </p>
                                {typeof strength === 'object' && strength.description && (
                                  <p className="text-xs text-green-700 mt-1">{strength.description}</p>
                                )}
                              </div>
                            </div>
                          ));
                        })}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        AI Recommendations
                      </h4>
                      <div className="grid gap-2">
                        {insights.slice(0, 3).map((insight, index) => {
                          const recommendations = Array.isArray(insight.recommendations) ? insight.recommendations : [];
                          return recommendations.slice(0, 2).map((rec: any, recIndex: number) => (
                            <div key={`${index}-${recIndex}`} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  {typeof rec === 'string' ? rec : rec.title || rec.recommendation || 'Recommendation available'}
                                </p>
                                {typeof rec === 'object' && rec.description && (
                                  <p className="text-xs text-blue-700 mt-1">{rec.description}</p>
                                )}
                              </div>
                            </div>
                          ));
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis History</CardTitle>
                    <CardDescription>Your recent IEP document reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.map((insight) => (
                        <div key={insight.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{insight.review_type} Analysis</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(insight.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">Analyzed</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}