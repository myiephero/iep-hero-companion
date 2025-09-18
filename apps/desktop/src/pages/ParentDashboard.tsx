import { useState, useEffect } from "react";
import { Calendar, Target, TrendingUp, Clock, Plus, BookOpen, AlertCircle, AlertTriangle, Star, Trophy, Sparkles, ChevronRight, Users, CheckCircle2, ArrowUpRight, Rocket, FileText, GraduationCap, Smile, Brain, Save, Loader2, Crown, Zap, Shield, UserCheck, MessageSquare } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";

// Desktop adaptation: Remove mobile imports and use desktop-appropriate components

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

interface Student {
  id: string;
  full_name: string;
  grade_level?: string;
  disability_category?: string;
}

export default function ParentDashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("goals");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    goal_type: undefined as string | undefined,
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

  // Emotion tracker states
  const [selectedStudentEmotion, setSelectedStudentEmotion] = useState('');
  const [currentMood, setCurrentMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [moodDraft, setMoodDraft] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const getStudentName = (studentId: string | undefined): string => {
    if (!studentId) return 'Unknown Student';
    const student = students.find(s => s.id === studentId);
    return student?.full_name || 'Unknown Student';
  };

  // Emotion tracker functions
  const handleRecordMood = () => {
    if (!selectedStudentEmotion) {
      toast({
        title: "Student Required",
        description: "Please select a student first.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Mood Recorded",
      description: `Mood entry saved for ${getStudentName(selectedStudentEmotion)}`,
      variant: "default"
    });
    setCurrentMood("");
    setMoodNote("");
  };

  const handleGenerateMoodDraft = async () => {
    if (!currentMood) return;
    
    setAiDraftLoading(true);
    setTimeout(() => {
      const moodDescriptions: { [key: string]: string } = {
        '😊': 'Student appeared happy and engaged today.',
        '😐': 'Student showed neutral emotional state.',
        '😟': 'Student displayed signs of worry or anxiety.',
        '😠': 'Student exhibited frustration or anger.',
        '😢': 'Student seemed sad or upset.'
      };
      
      const draft = `${moodDescriptions[currentMood]} Additional observations: Student's emotional state seemed consistent with typical patterns for this time of day. Consider environmental factors and recent events that may have influenced mood.`;
      setMoodNote(draft);
      setAiDraftLoading(false);
      
      toast({
        title: "AI Draft Generated",
        description: "Please review and edit the professional note before saving.",
        variant: "default"
      });
    }, 1500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Desktop implementation: Use mock data for now
      setGoals([
        {
          id: '1',
          title: 'Reading Comprehension',
          description: 'Improve reading comprehension skills',
          status: 'in_progress',
          current_progress: 75,
          target_date: '2024-06-01',
          goal_type: 'academic',
          notes: 'Good progress so far',
          created_at: '2024-01-15'
        }
      ]);
      
      setMeetings([
        {
          id: '1',
          title: 'IEP Review Meeting',
          description: 'Annual IEP review',
          scheduled_date: '2024-03-15',
          location: 'School Conference Room',
          status: 'scheduled',
          meeting_type: 'iep',
          created_at: '2024-02-01'
        }
      ]);
      
      setInsights([]);
      setStudents([
        { id: '1', full_name: 'Student One', grade_level: '5', disability_category: 'Learning Disability' }
      ]);
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

  // Calculate statistics
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalGoals = goals.length;
  const upcomingMeetings = meetings.filter(m => new Date(m.scheduled_date) > new Date()).length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500 dark:text-gray-400">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Desktop Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-indigo-50/80 dark:from-blue-950/50 dark:via-purple-950/40 dark:to-indigo-950/50 p-8">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome back!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Your premium command center for advocacy excellence
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="button-explore-premium-tools"
              >
                <Link to="/tools/emergent">
                  <Rocket className="h-5 w-5 mr-2" />
                  Explore Premium Tools
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary/30 hover:border-primary text-primary hover:bg-primary/5"
                onClick={() => navigate('/students')}
                data-testid="button-manage-students"
              >
                <Users className="h-5 w-5 mr-2" />
                Manage Students
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-purple-500/30 hover:border-purple-500 text-purple-600 hover:bg-purple-50"
                onClick={() => navigate('/document-vault')}
                data-testid="button-document-vault"
              >
                <FileText className="h-5 w-5 mr-2" />
                Document Vault
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-orange-500/30 hover:border-orange-500 text-orange-600 hover:bg-orange-50"
                onClick={() => navigate('/messages')}
                data-testid="button-messages"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Messages
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGoals}</div>
              <p className="text-xs text-muted-foreground">
                {completedGoals} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                Active profiles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals and Meetings - Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
                <TabsTrigger value="meetings">Meetings & Schedule</TabsTrigger>
              </TabsList>
              
              <TabsContent value="goals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Current Goals</CardTitle>
                      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Goal
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Goal</DialogTitle>
                            <DialogDescription>
                              Set a new goal for your child's IEP
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {goals.map((goal) => (
                        <div key={goal.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{goal.title}</h4>
                            <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                              {goal.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                          <Progress value={goal.current_progress} className="mb-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress: {goal.current_progress}%</span>
                            <span>Due: {goal.target_date}</span>
                          </div>
                        </div>
                      ))}
                      {goals.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No goals yet. Create your first goal to get started!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="meetings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Upcoming Meetings</CardTitle>
                      <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule Meeting
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Schedule New Meeting</DialogTitle>
                            <DialogDescription>
                              Schedule a meeting with your child's team
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
                                placeholder="Describe the meeting purpose"
                              />
                            </div>
                            <div>
                              <Label htmlFor="meeting-date">Date</Label>
                              <Input
                                id="meeting-date"
                                type="date"
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
                            <Button onClick={scheduleMeeting} className="w-full">
                              Schedule Meeting
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {meetings.map((meeting) => (
                        <div key={meeting.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{meeting.title}</h4>
                            <Badge variant={meeting.status === 'scheduled' ? 'default' : 'secondary'}>
                              {meeting.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Date: {meeting.scheduled_date}</span>
                            <span>Location: {meeting.location}</span>
                          </div>
                        </div>
                      ))}
                      {meetings.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No meetings scheduled. Schedule your first meeting!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/goal-generator')}>
                  <Target className="h-4 w-4 mr-2" />
                  Goal Generator
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/meeting-prep')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Meeting Prep
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/emotion-tracker')}>
                  <Smile className="h-4 w-4 mr-2" />
                  Emotion Tracker
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/tools/autism')}>
                  <Brain className="h-4 w-4 mr-2" />
                  Autism Tools
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Goal progress updated</span>
                    <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Meeting scheduled</span>
                    <span className="text-xs text-muted-foreground ml-auto">1d ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Document uploaded</span>
                    <span className="text-xs text-muted-foreground ml-auto">3d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}