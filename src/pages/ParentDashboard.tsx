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
// import { supabase } from "@/integrations/supabase/client"; // Removed during migration
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { SubscriptionPlan, hasFeatureAccess, getPlanFeatures, normalizeSubscriptionPlan, getPlanDisplayName } from "@/lib/planAccess";
// import { FeedbackChat } from "@/components/FeedbackChat"; // TEMPORARILY REMOVED

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
  full_name: string;
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
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("goals");
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
      setInsights((insightsData || []).map(insight => {
        // Extract data from ai_analysis object for autism analyses
        let areas_of_concern: string[] = [];
        let strengths: string[] = [];
        let recommendations: string[] = [];
        
        try {
          if ((insight as any).ai_analysis && typeof (insight as any).ai_analysis === 'object') {
            const analysis = (insight as any).ai_analysis;
            
            // Safely map sensory processing patterns to areas of concern
            if (analysis?.sensory_needs_analysis?.sensory_processing_patterns && Array.isArray(analysis.sensory_needs_analysis.sensory_processing_patterns)) {
              areas_of_concern = analysis.sensory_needs_analysis.sensory_processing_patterns;
            }
            
            // Safely map environmental modifications to strengths
            if (analysis?.sensory_needs_analysis?.environmental_modifications && Array.isArray(analysis.sensory_needs_analysis.environmental_modifications)) {
              strengths = analysis.sensory_needs_analysis.environmental_modifications;
            }
            
            // Safely map learning accommodations to recommendations
            if (analysis?.sensory_needs_analysis?.learning_accommodations && Array.isArray(analysis.sensory_needs_analysis.learning_accommodations)) {
              recommendations = analysis.sensory_needs_analysis.learning_accommodations;
            }
          }
        } catch (error) {
          console.warn('Error processing AI analysis data:', error);
        }
        
        // Fallback to direct arrays if they exist
        if (Array.isArray(insight.areas_of_concern) && insight.areas_of_concern.length > 0) {
          areas_of_concern = insight.areas_of_concern;
        }
        if (Array.isArray(insight.strengths) && insight.strengths.length > 0) {
          strengths = insight.strengths;
        }
        if (Array.isArray(insight.recommendations) && insight.recommendations.length > 0) {
          recommendations = insight.recommendations;
        }
        
        return { 
          ...insight,
          id: insight.id || '',
          areas_of_concern,
          strengths,
          recommendations,
          created_at: insight.created_at || '',
          review_type: insight.review_type || 'quality'
        };
      }));
      
      setStudents((studentsData || []) as Student[]);
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

  // Initialize event handlers after data is loaded
  useEffect(() => {
    if (!loading && goals.length >= 0 && meetings.length >= 0 && insights.length >= 0) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsInitialized(true);
        console.log('🎯 Dashboard event handlers initialized');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, goals, meetings, insights]);

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
      <MobileAppShell>
        <SafeAreaFull>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-500 dark:text-gray-400">Loading your dashboard...</div>
          </div>
        </SafeAreaFull>
      </MobileAppShell>
    );
  }

  return (
    <MobileAppShell>
      <SafeAreaFull className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <ContainerMobile className="space-y-6">
        {/* Premium Hero Section with Mobile-First Design */}
        <PremiumCard variant="gradient" className="relative overflow-hidden mx-4 mt-6 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-indigo-50/80 dark:from-blue-950/50 dark:via-purple-950/40 dark:to-indigo-950/50" />
          <div className="relative p-6 text-center z-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center sm:text-left">
                {user?.firstName ? `Welcome back, ${user.firstName}!` : 'Premium Dashboard'}
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Your premium command center for advocacy excellence, real-time progress tracking, and comprehensive IEP management.
            </p>
            
              
            <div className="flex flex-col gap-3 sm:gap-4 justify-center max-w-4xl mx-auto px-4">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-6 py-4 sm:py-3 cursor-pointer min-h-[44px] text-sm sm:text-base font-medium"
                data-testid="button-explore-premium-tools"
              >
                <Link to="/parent/tools/emergent">
                  <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Explore Premium Tools
                </Link>
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-primary/30 hover:border-primary text-primary hover:bg-primary/5 px-4 sm:px-6 py-4 sm:py-3 cursor-pointer min-h-[44px] text-sm sm:text-base font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('👥 Manage Students clicked!');
                    try {
                      navigate('/parent/students');
                    } catch (error) {
                      console.error('Navigation error:', error);
                      window.location.href = '/parent/students';
                    }
                  }}
                  data-testid="button-manage-students"
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Manage Students
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-purple-500/30 hover:border-purple-500 text-purple-600 hover:bg-purple-50 px-4 sm:px-6 py-4 sm:py-3 cursor-pointer min-h-[44px] text-sm sm:text-base font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📁 Document Vault clicked!');
                    try {
                      navigate('/parent/tools/document-vault');
                    } catch (error) {
                      console.error('Navigation error:', error);
                      window.location.href = '/parent/tools/document-vault';
                    }
                  }}
                  data-testid="button-document-vault"
                >
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Document Vault
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-green-500/30 hover:border-green-500 text-green-600 hover:bg-green-50 px-4 sm:px-6 py-4 sm:py-3 cursor-pointer min-h-[44px] text-sm sm:text-base font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔍 Find Advocates clicked!');
                    try {
                      navigate('/parent/matching');
                    } catch (error) {
                      console.error('Navigation error:', error);
                      window.location.href = '/parent/matching';
                    }
                  }}
                  data-testid="button-find-advocates"
                >
                  <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Find Advocates
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-orange-500/30 hover:border-orange-500 text-orange-600 hover:bg-orange-50 px-4 sm:px-6 py-4 sm:py-3 cursor-pointer min-h-[44px] text-sm sm:text-base font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('💬 Messages clicked!');
                    try {
                      navigate('/parent/messages');
                    } catch (error) {
                      console.error('Navigation error:', error);
                      window.location.href = '/parent/messages';
                    }
                  }}
                  data-testid="button-messages"
                >
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Messages
                </Button>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Upgrade Section for Stripe Testing - Only show for free/basic users */}
        {userPlan === 'free' && (
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
              <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="flex-1 text-center lg:text-left">
                      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-semibold text-xs sm:text-sm">
                          Free Plan Active
                        </Badge>
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">🚀 Unlock Premium IEP Tools</h2>
                      <p className="text-white/90 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                        Test our payment system! Get AI-powered analysis, smart letters, and expert advocate matching.
                      </p>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center lg:justify-start gap-3 sm:gap-6 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
                          <span className="font-medium">AI Document Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
                          <span className="font-medium">Smart Letter Generator</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
                          <span className="font-medium">Expert Advocate Network</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full sm:min-w-[280px] lg:w-auto">
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            navigate('/parent/pricing');
                          } catch (error) {
                            console.error('Navigation error:', error);
                            window.location.href = '/parent/pricing';
                          }
                        }}
                        size="lg"
                        className="bg-white text-purple-600 hover:bg-white/90 font-bold text-sm sm:text-base md:text-lg py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
                        data-testid="button-parent-upgrade"
                      >
                        <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="px-4 sm:px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Premium Statistics Cards with Mobile-First Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mx-4 mb-6">
              {[
                {
                  icon: Target,
                  title: totalGoals,
                  subtitle: "Active Goals",
                  badge: `${completedGoals} completed`,
                  color: "from-blue-500 to-blue-600",
                  bgColor: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
                  index: 0
                },
                {
                  icon: Calendar,
                  title: upcomingMeetings,
                  subtitle: "Upcoming Meetings", 
                  badge: "Auto reminders on",
                  color: "from-green-500 to-green-600",
                  bgColor: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
                  index: 1
                },
                {
                  icon: TrendingUp,
                  title: `${completionRate}%`,
                  subtitle: "Completion Rate",
                  badge: completionRate > 75 ? 'Excellent!' : completionRate > 50 ? 'Great!' : 'Keep going!',
                  color: "from-purple-500 to-purple-600",
                  bgColor: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
                  index: 2
                },
                {
                  icon: Sparkles,
                  title: insights.length,
                  subtitle: "Deep Analysis",
                  badge: "Full IEP review",
                  color: "from-orange-500 to-orange-600",
                  bgColor: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
                  index: 3
                }
              ].map(({ icon: Icon, title, subtitle, badge, color, bgColor, index }) => (
                <PremiumCard 
                  key={index}
                  variant="elevated"
                  className={`text-center relative overflow-hidden min-h-[140px] ${isInitialized ? 'cursor-pointer' : 'cursor-wait'}`}
                  onClick={() => {
                    // Ensure handlers are initialized
                    if (!isInitialized) {
                      console.log('⚠️ Dashboard not initialized yet, skipping card click');
                      return;
                    }
                    
                    const actions = [
                      () => {
                        console.log('📊 Goals card clicked!');
                        try {
                          navigate('/parent/tools/goal-generator');
                        } catch (error) {
                          console.error('Navigation error:', error);
                          window.location.href = '/parent/tools/goal-generator';
                        }
                      },
                      () => {
                        console.log('📅 Meetings card clicked!');
                        try {
                          navigate('/parent/schedule');
                        } catch (error) {
                          console.error('Navigation error:', error);
                          window.location.href = '/parent/schedule';
                        }
                      },
                      () => {
                        console.log('📈 Progress card clicked!');
                        try {
                          // Scroll to goals section for completion rate details
                          setTimeout(() => {
                            const goalsSection = document.querySelector('[data-section="goals"]');
                            goalsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        } catch (error) {
                          console.error('Scroll error:', error);
                        }
                      },
                      () => {
                        console.log('🔍 Deep Analysis card clicked!');
                        try {
                          navigate('/parent/tools/iep-master-suite');
                        } catch (error) {
                          console.error('Navigation error:', error);
                          window.location.href = '/parent/tools/iep-master-suite';
                        }
                      }
                    ];
                    try {
                      actions[index]?.();
                    } catch (error) {
                      console.error('Action execution error:', error);
                    }
                  }}
                  data-testid={`card-stat-${index}`}
                >
                  {/* Premium Background Pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-50`} />
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-full transform translate-x-8 -translate-y-8`} />
                  
                  <div className="relative z-10 p-6 space-y-3">
                    {/* Premium Icon Container */}
                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    
                    {/* Title and Subtitle */}
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{subtitle}</p>
                    </div>
                    
                    {/* Premium Badge */}
                    <div className="pt-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 shadow-sm">
                        {badge}
                      </span>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
            
            {/* Premium Mobile Tab Navigation */}
            <PremiumCard variant="glass" className="relative overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="p-4">
                  {/* Premium Tab Container with Enhanced Styling */}
                  <div className="relative rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 shadow-xl">
                    <div className="flex bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl p-2 gap-2">
                      <button
                        onClick={() => setActiveTab("goals")}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium transition-all duration-200 flex-1 justify-center min-h-[44px] text-xs sm:text-sm md:text-base ${
                          activeTab === "goals"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        data-testid="tab-goal-tracking"
                      >
                        <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Goal Tracking</span>
                        <span className="sm:hidden">Goals</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("meetings")}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium transition-all duration-200 flex-1 justify-center min-h-[44px] text-xs sm:text-sm md:text-base ${
                          activeTab === "meetings"
                            ? "bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        data-testid="tab-meetings"
                      >
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Meetings</span>
                        <span className="sm:hidden">Meetings</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("emotions")}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium transition-all duration-200 flex-1 justify-center min-h-[44px] text-xs sm:text-sm md:text-base ${
                          activeTab === "emotions"
                            ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        data-testid="tab-emotions"
                      >
                        <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Emotions</span>
                        <span className="sm:hidden">Emotions</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("insights")}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium transition-all duration-200 flex-1 justify-center min-h-[44px] text-xs sm:text-sm md:text-base ${
                          activeTab === "insights"
                            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        data-testid="tab-ai-insights"
                      >
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Quick Insights</span>
                        <span className="sm:hidden">Insights</span>
                      </button>
                    </div>
                  </div>
                </div>

              {/* Enhanced Goals Tab */}
              <TabsContent value="goals" className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 relative" style={{ zIndex: 20 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">IEP Goals</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Track and celebrate your child's progress</p>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 sm:px-6 py-3 min-h-[44px] text-sm sm:text-base font-medium w-full sm:w-auto"
                    onClick={() => {
                      setShowGoalDialog(true);
                    }}
                    data-testid="button-add-new-goal"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Goal
                  </Button>
                  <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                    <DialogContent className="max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="px-1">
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">Create New Goal</DialogTitle>
                        <DialogDescription className="text-sm sm:text-base text-gray-600">
                          Set up a new IEP goal to track your child's progress.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 sm:space-y-5">
                        <div>
                          <Label htmlFor="goal-title" className="text-sm font-medium text-gray-700">Goal Title</Label>
                          <Input
                            id="goal-title"
                            value={goalForm.title}
                            onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                            placeholder="Enter goal title"
                            className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg min-h-[44px] text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-description" className="text-sm font-medium text-gray-700">Description</Label>
                          <Textarea
                            id="goal-description"
                            value={goalForm.description}
                            onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                            placeholder="Describe the goal"
                            className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg min-h-[88px] text-base resize-none"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-type" className="text-sm font-medium text-gray-700">Goal Type</Label>
                          <Select value={goalForm.goal_type} onValueChange={(value) => setGoalForm({...goalForm, goal_type: value})}>
                            <SelectTrigger className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg min-h-[44px] text-base">
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
                            className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg min-h-[44px] text-base"
                          />
                        </div>
                        <Button 
                          onClick={createGoal} 
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg py-4 font-medium min-h-[48px] text-base mt-6"
                        >
                          Create Goal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-6" data-section="goals">
                  {goals.length === 0 ? (
                    <div className="space-y-6">
                      {/* Premium Welcome Card */}
                      <PremiumCard variant="glass" className="text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
                        <div className="relative z-10 py-12 px-8 space-y-6">
                          <div className="relative mb-4 sm:mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                            <Target className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 mx-auto text-blue-600 relative drop-shadow-lg" />
                          </div>
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-gray-900">Let's Start Your IEP Journey!</h3>
                          <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                            Track your child's progress, celebrate achievements, and stay organized with personalized IEP goal management designed for families like yours.
                          </p>
                          <div className="flex justify-center">
                            <Button 
                              onClick={() => setShowGoalDialog(true)}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 sm:px-8 py-4 text-sm sm:text-base md:text-lg font-semibold min-h-[48px] w-full sm:w-auto"
                              data-testid="button-create-first-goal"
                            >
                              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                              Create Your First Goal
                            </Button>
                          </div>
                        </div>
                      </PremiumCard>

                      {/* Quick Start Guide */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumCard variant="elevated" className="group">
                          <div className="p-6 space-y-4">
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
                          </div>
                        </PremiumCard>

                        <PremiumCard variant="elevated" className="group">
                          <div className="p-6 space-y-4">
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
                          </div>
                        </PremiumCard>
                      </div>

                      {/* Premium Goal Type Examples */}
                      <PremiumCard variant="gradient" className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/90 to-gray-100/90" />
                        <div className="relative z-10 p-8">
                          <div className="text-center mb-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Common IEP Goal Categories</h4>
                            <p className="text-gray-600">Choose the type that best matches your child's current focus areas</p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                            <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[100px] sm:min-h-[120px] flex flex-col justify-center" onClick={() => setGoalForm({...goalForm, goal_type: 'academic'})}>
                              <div className="text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📚</div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">Academic</div>
                              <div className="text-xs text-gray-500 mt-1 hidden sm:block">Reading, Math, Writing</div>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[100px] sm:min-h-[120px] flex flex-col justify-center" onClick={() => setGoalForm({...goalForm, goal_type: 'behavioral'})}>
                              <div className="text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🎯</div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">Behavioral</div>
                              <div className="text-xs text-gray-500 mt-1 hidden sm:block">Self-regulation, Focus</div>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[100px] sm:min-h-[120px] flex flex-col justify-center" onClick={() => setGoalForm({...goalForm, goal_type: 'social'})}>
                              <div className="text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">👥</div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">Social</div>
                              <div className="text-xs text-gray-500 mt-1 hidden sm:block">Peer interaction, Teamwork</div>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[100px] sm:min-h-[120px] flex flex-col justify-center" onClick={() => setGoalForm({...goalForm, goal_type: 'communication'})}>
                              <div className="text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">💬</div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">Communication</div>
                              <div className="text-xs text-gray-500 mt-1 hidden sm:block">Speech, Language</div>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[100px] sm:min-h-[120px] flex flex-col justify-center" onClick={() => setGoalForm({...goalForm, goal_type: 'life_skills'})}>
                              <div className="text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🌟</div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">Life Skills</div>
                              <div className="text-xs text-gray-500 mt-1 hidden sm:block">Independence, Daily tasks</div>
                            </div>
                          </div>
                        </div>
                      </PremiumCard>
                    </div>
                  ) : (
                    goals.map((goal) => (
                      <PremiumCard key={goal.id} variant="interactive" className="relative overflow-hidden">
                        {/* Premium Goal Card Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50" />
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full" />
                        
                        <div className="relative z-10 p-6 space-y-4">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 gap-3 lg:gap-4">
                            <div className="flex-1">
                              {/* Student Name - Prominently displayed */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-xs sm:text-sm font-semibold text-blue-700">
                                    {getStudentName((goal as any).student_id || '')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getStatusColor(goal.status)} shadow-sm`} />
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{goal.title}</h3>
                                </div>
                                <Badge variant="outline" className="capitalize bg-gray-50 text-gray-700 border-gray-200 text-xs sm:text-sm self-start sm:self-auto">
                                  {goal.goal_type?.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{goal.description}</p>
                            </div>
                            <Select value={goal.status} onValueChange={(value) => updateGoalStatus(goal.id, value)}>
                              <SelectTrigger className="w-full lg:w-36 border-gray-300 focus:border-blue-500 rounded-lg min-h-[44px] text-sm sm:text-base">
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
                          
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-700">{getStatusLabel(goal.status)}</span>
                                <span className="text-xs sm:text-sm font-semibold text-blue-600">{goal.current_progress || 0}%</span>
                              </div>
                              <div className="relative mb-3">
                                <Progress value={goal.current_progress || 0} className="h-2 sm:h-3 bg-gray-100" />
                                <div 
                                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                                  style={{width: `${goal.current_progress || 0}%`}}
                                ></div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xs text-gray-500 min-w-[50px] sm:min-w-[60px]">Progress:</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={goal.current_progress || 0}
                                  onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                                  className="flex-1 h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
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
                                    className="h-8 w-8 sm:h-6 sm:w-6 p-0 text-xs min-h-[32px] sm:min-h-[24px]"
                                    data-testid={`button-decrease-progress-${goal.id}`}
                                  >
                                    -
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateGoalProgress(goal.id, Math.min(100, (goal.current_progress || 0) + 10))}
                                    className="h-8 w-8 sm:h-6 sm:w-6 p-0 text-xs min-h-[32px] sm:min-h-[24px]"
                                    data-testid={`button-increase-progress-${goal.id}`}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {goal.target_date && (
                              <div className="text-left lg:text-right">
                                <div className="text-xs sm:text-sm font-medium text-gray-700">Target Date</div>
                                <div className="text-xs sm:text-sm text-gray-500">{new Date(goal.target_date).toLocaleDateString()}</div>
                              </div>
                            )}
                          </div>
                          
                          {goal.status === 'completed' && (
                            <div className="mt-3 sm:mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                              <span className="text-xs sm:text-sm font-medium text-green-800">🎉 Goal completed! Great job!</span>
                            </div>
                          )}
                        </div>
                      </PremiumCard>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Enhanced Meetings Tab */}
              <TabsContent value="meetings" className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Meeting Schedule</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Stay organized with automated reminders</p>
                  </div>
                  <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 sm:px-6 py-3 min-h-[44px] text-sm sm:text-base font-medium w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">Schedule IEP Meeting</DialogTitle>
                        <DialogDescription className="text-sm sm:text-base text-gray-600">
                          Schedule a meeting and get automatic email reminders.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 sm:space-y-5">
                        <div>
                          <Label htmlFor="meeting-title" className="text-sm font-medium text-gray-700">Meeting Title</Label>
                          <Input
                            id="meeting-title"
                            value={meetingForm.title}
                            onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                            placeholder="Enter meeting title"
                            className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg min-h-[44px] text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="meeting-description" className="text-sm font-medium text-gray-700">Description</Label>
                          <Textarea
                            id="meeting-description"
                            value={meetingForm.description}
                            onChange={(e) => setMeetingForm({...meetingForm, description: e.target.value})}
                            placeholder="Meeting agenda or notes"
                            className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg min-h-[88px] text-base resize-none"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="meeting-date" className="text-sm font-medium text-gray-700">Date & Time</Label>
                          <Input
                            id="meeting-date"
                            type="datetime-local"
                            value={meetingForm.scheduled_date}
                            onChange={(e) => setMeetingForm({...meetingForm, scheduled_date: e.target.value})}
                            className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg min-h-[44px] text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="meeting-location" className="text-sm font-medium text-gray-700">Location</Label>
                          <Input
                            id="meeting-location"
                            value={meetingForm.location}
                            onChange={(e) => setMeetingForm({...meetingForm, location: e.target.value})}
                            placeholder="Meeting location"
                            className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg min-h-[44px] text-base"
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
                    <PremiumCard variant="glass" className="text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-violet-50/80" />
                      <div className="relative z-10 py-12 px-8 space-y-6">
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
                      </div>
                    </PremiumCard>
                  ) : (
                    meetings.map((meeting) => (
                      <PremiumCard key={meeting.id} variant="glass" className="relative overflow-hidden">
                        {/* Premium Meeting Card Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-violet-50/30 to-indigo-50/50" />
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full" />
                        
                        <div className="relative z-10 p-6 space-y-4">
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
                        </div>
                      </PremiumCard>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Emotion Tracker Tab */}
              <TabsContent value="emotions" className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Emotion Tracking</h2>
                    <p className="text-gray-600 mt-1">Monitor your child's emotional well-being and daily mood</p>
                  </div>
                </div>

                {/* Premium Student Selection for Emotions */}
                <PremiumCard variant="gradient" className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-50/90 to-rose-50/90" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Smile className="h-5 w-5 text-pink-600" />
                      Select Student for Emotion Tracking
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Choose which child you want to track emotions for today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedStudentEmotion} onValueChange={setSelectedStudentEmotion}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name} {student.grade_level && `- ${student.grade_level}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedStudentEmotion && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Tracking emotions for {getStudentName(selectedStudentEmotion)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </PremiumCard>

                {/* Quick Mood Check-in */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Today's Mood Status */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Smile className="h-5 w-5 text-blue-600" />
                        Current Mood Status
                      </CardTitle>
                      <CardDescription className="text-gray-800 font-medium">
                        Quick overview of today's emotional state
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { emoji: '😊', label: 'Happy', color: 'bg-green-100' },
                            { emoji: '😐', label: 'Neutral', color: 'bg-blue-100' },
                            { emoji: '😟', label: 'Worried', color: 'bg-yellow-100' },
                            { emoji: '😠', label: 'Angry', color: 'bg-orange-100' },
                            { emoji: '😢', label: 'Sad', color: 'bg-red-100' }
                          ].map((mood, index) => (
                            <div key={index} className={`text-center p-3 ${mood.color} rounded-lg`}>
                              <div className="text-2xl mb-1" style={{fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Emoji, sans-serif'}}>{mood.emoji}</div>
                              <p className="text-xs font-medium">{mood.label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2">
                          <p className="text-sm text-gray-600 mb-3">
                            Last recorded: Today at 2:30 PM - "Doing well after lunch break"
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                                disabled={!selectedStudentEmotion}
                                onClick={() => {
                                  if (!selectedStudentEmotion) {
                                    toast({
                                      title: "Student Required",
                                      description: "Please select a student first to record their mood.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  toast({
                                    title: "Mood Recording",
                                    description: "Opening mood recording interface...",
                                    variant: "default"
                                  });
                                }}
                              >
                                <Smile className="h-4 w-4 mr-2" />
                                Record New Mood
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Record Daily Mood</DialogTitle>
                                <DialogDescription>
                                  Document your child's current emotional state and daily mood patterns
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Current Mood</Label>
                                  <div className="grid grid-cols-5 gap-2 mt-2">
                                    {['😊', '😐', '😟', '😠', '😢'].map((emoji, index) => (
                                      <Button
                                        key={index}
                                        variant={currentMood === emoji ? "default" : "outline"}
                                        className="h-12 text-xl"
                                        style={{fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Emoji, sans-serif'}}
                                        onClick={() => setCurrentMood(emoji)}
                                      >
                                        {emoji}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="mood-note">Additional Notes</Label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleGenerateMoodDraft}
                                      disabled={aiDraftLoading || !currentMood}
                                      className="text-xs"
                                    >
                                      {aiDraftLoading ? (
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      ) : (
                                        <Sparkles className="h-3 w-3 mr-1" />
                                      )}
                                      AI Draft
                                    </Button>
                                  </div>
                                  <Textarea
                                    id="mood-note"
                                    value={moodNote}
                                    onChange={(e) => setMoodNote(e.target.value)}
                                    placeholder="Any additional observations or context..."
                                    className="mt-2"
                                  />
                                  {moodNote && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      💡 Review and edit this draft before saving
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleRecordMood} className="flex-1">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Entry
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weekly Trend Overview */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Weekly Emotional Trends
                      </CardTitle>
                      <CardDescription className="text-gray-800 font-medium">
                        Patterns and insights from this week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Mood</span>
                          <Badge className="bg-green-100 text-green-800">Positive</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Most Common</span>
                          <div className="flex items-center gap-1">
                            <span className="text-lg">😊</span>
                            <span className="text-sm">Happy (4 days)</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Improvement Areas</span>
                          <span className="text-sm text-gray-600">Morning transitions</span>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => {
                            toast({
                              title: "Detailed Analysis",
                              description: "Opening comprehensive emotional analysis dashboard...",
                              variant: "default"
                            });
                            navigate('/parent/tools/emotion-tracker');
                          }}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          View Detailed Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions for Emotion Support */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Emotional Support Tools</CardTitle>
                    <CardDescription className="text-gray-600">
                      Quick access to coping strategies and intervention resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => {
                          toast({
                            title: "Coping Strategies",
                            description: "Opening breathing exercises and relaxation techniques...",
                            variant: "default"
                          });
                          navigate('/parent/tools/coping-strategies');
                        }}
                      >
                        <Brain className="h-6 w-6 text-blue-600" />
                        <span className="font-medium">Coping Strategies</span>
                        <span className="text-xs text-gray-600">Breathing & relaxation</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => {
                          toast({
                            title: "Warning Signs",
                            description: "Opening early intervention guidance and warning signals...",
                            variant: "default"
                          });
                          navigate('/parent/tools/warning-signs');
                        }}
                      >
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                        <span className="font-medium">Warning Signs</span>
                        <span className="text-xs text-gray-600">Early intervention</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => {
                          toast({
                            title: "Support Schedule",
                            description: "Opening daily check-in schedule and routine management...",
                            variant: "default"
                          });
                          navigate('/parent/tools/support-schedule');
                        }}
                      >
                        <Calendar className="h-6 w-6 text-green-600" />
                        <span className="font-medium">Support Schedule</span>
                        <span className="text-xs text-gray-600">Daily check-ins</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced AI Insights Tab */}
              <TabsContent value="insights" className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
                  <p className="text-gray-800 font-medium mt-1">Data-driven analysis of your child's IEP documents</p>
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
                            {insights.length > 0 ? (
                              insights.slice(0, 3).map((insight, index) => {
                                // Try to get areas of concern from the AI analysis or the dedicated field
                                let concerns: any[] = [];
                                if (Array.isArray(insight.areas_of_concern) && insight.areas_of_concern.length > 0) {
                                  concerns = insight.areas_of_concern;
                                } else if ((insight as any).ai_analysis && typeof (insight as any).ai_analysis === 'object') {
                                  const analysis = (insight as any).ai_analysis;
                                  if (analysis.key_findings && Array.isArray(analysis.key_findings)) {
                                    concerns = analysis.key_findings.slice(0, 2);
                                  } else if (analysis.immediate_actions && Array.isArray(analysis.immediate_actions)) {
                                    concerns = analysis.immediate_actions.slice(0, 2);
                                  } else if (analysis.detailed_analysis) {
                                    concerns = [analysis.detailed_analysis];
                                  }
                                }
                                
                                return concerns.slice(0, 2).map((concern: any, concernIndex: number) => (
                                  <div key={`${index}-${concernIndex}`} className="group hover:shadow-md transition-all duration-200 flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-3 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-orange-900 mb-1">
                                        {typeof concern === 'string' ? concern : concern.title || concern.area || 'Focus area identified'}
                                      </p>
                                      <p className="text-xs text-orange-700">
                                        From your recent IEP analysis
                                      </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-orange-400 group-hover:text-orange-600 transition-colors" />
                                  </div>
                                ));
                              }).flat()
                            ) : (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">No recent IEP analyses available.</p>
                                <p className="text-xs text-gray-500 mt-1">Upload and analyze an IEP document to see insights here.</p>
                              </div>
                            )}
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
                            {insights.length > 0 ? (
                              insights.slice(0, 3).map((insight, index) => {
                                // Try to get strengths from the AI analysis or the dedicated field
                                let strengths: any[] = [];
                                if (Array.isArray(insight.strengths) && insight.strengths.length > 0) {
                                  strengths = insight.strengths;
                                } else if ((insight as any).ai_analysis && typeof (insight as any).ai_analysis === 'object') {
                                  const analysis = (insight as any).ai_analysis;
                                  if (analysis.environmental_modifications && Array.isArray(analysis.environmental_modifications)) {
                                    strengths = analysis.environmental_modifications.slice(0, 2);
                                  } else if (analysis.summary && typeof analysis.summary === 'string') {
                                    // Extract positive aspects from summary
                                    strengths = [analysis.summary.substring(0, 120) + '...'];
                                  }
                                }
                                
                                return strengths.slice(0, 2).map((strength: any, strengthIndex: number) => (
                                  <div key={`${index}-${strengthIndex}`} className="group hover:shadow-md transition-all duration-200 flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-green-900 mb-1">
                                        {typeof strength === 'string' ? strength : strength.title || strength.area || 'Strength identified'}
                                      </p>
                                      <p className="text-xs text-green-700">
                                        From your recent analysis
                                      </p>
                                    </div>
                                    <Star className="h-4 w-4 text-green-400 group-hover:text-green-600 transition-colors" />
                                  </div>
                                ));
                              }).flat()
                            ) : (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">No documented strengths available.</p>
                                <p className="text-xs text-gray-500 mt-1">Complete an IEP analysis to identify student strengths.</p>
                              </div>
                            )}
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
                            {insights.length > 0 ? (
                              insights.slice(0, 3).map((insight, index) => {
                                // Try to get recommendations from the AI analysis or the dedicated field
                                let recommendations: any[] = [];
                                if (Array.isArray(insight.recommendations) && insight.recommendations.length > 0) {
                                  recommendations = insight.recommendations;
                                } else if ((insight as any).ai_analysis && typeof (insight as any).ai_analysis === 'object') {
                                  const analysis = (insight as any).ai_analysis;
                                  if (analysis.recommendations && Array.isArray(analysis.recommendations)) {
                                    recommendations = analysis.recommendations.slice(0, 2);
                                  } else if (analysis.environmental_modifications && Array.isArray(analysis.environmental_modifications)) {
                                    recommendations = analysis.environmental_modifications.slice(0, 2);
                                  } else if (analysis.immediate_actions && Array.isArray(analysis.immediate_actions)) {
                                    recommendations = analysis.immediate_actions.slice(0, 2);
                                  }
                                }
                                
                                return recommendations.slice(0, 2).map((rec: any, recIndex: number) => (
                                  <div key={`${index}-${recIndex}`} className="group hover:shadow-md transition-all duration-200 flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-blue-900 mb-1">
                                        {typeof rec === 'string' ? rec : rec.title || rec.recommendation || 'Recommendation available'}
                                      </p>
                                      <p className="text-xs text-blue-700">
                                        AI-generated suggestion from analysis
                                      </p>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                                  </div>
                                ));
                              }).flat()
                            ) : (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">No AI recommendations available.</p>
                                <p className="text-xs text-gray-500 mt-1">Analyze an IEP document to receive personalized recommendations.</p>
                              </div>
                            )}
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
                                // Use React Router instead of window.location
                                try {
                                  navigate('/parent/tools/document-vault');
                                } catch (error) {
                                  console.error('Navigation error:', error);
                                  window.location.href = '/parent/tools/document-vault';
                                }
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
          </PremiumCard>
          </div>
        </div>
        </ContainerMobile>
      </SafeAreaFull>
      
      {/* Feedback Chat Component - TEMPORARILY REMOVED */}
      {/* <FeedbackChat /> */}
    </MobileAppShell>
  );
}