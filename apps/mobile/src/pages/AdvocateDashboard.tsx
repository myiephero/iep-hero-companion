import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  PremiumToolCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FeatureGate } from "@/components/FeatureGate";
import { LockedActionButton } from "@/components/LockedActionButton";
import { useToolAccess } from "@/hooks/useToolAccess";
import { useNavigate } from "react-router-dom";
import { normalizeSubscriptionPlan } from "@/lib/planAccess";
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
  BookOpen,
  FileSearch,
  UserCheck,
  Settings,
  Activity,
  ArrowRight,
  Bell,
  Calendar as CalendarIcon,
  Folder,
  BarChart3,
  Briefcase,
  HeartHandshake,
  Zap,
  Mail,
  ClipboardList,
  Award,
  Shield,
  ChevronDown,
  ChevronUp,
  Crown,
  Rocket
} from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  scheduled_date: string;
  attendees?: number;
}

interface AdvocateDashboardProps {
  plan?: string;
}

const AdvocateDashboard = ({ plan }: AdvocateDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canUse } = useToolAccess();
  const navigate = useNavigate();
  
  // Determine the user's subscription plan for upgrade logic
  const userPlan = normalizeSubscriptionPlan(user?.subscriptionPlan);
  const shouldShowUpgrade = userPlan !== 'agency-plus'; // Show upgrade for all plans except highest tier

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
          planName: subscriptionData.planName,
          amount: subscriptionData.amount || '0'
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

  // Use TanStack Query for reactive data fetching
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/students'],
    enabled: !!user
  });
  
  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ['/api/cases'],
    enabled: !!user
  });
  
  const { data: parents = [], isLoading: parentsLoading } = useQuery({
    queryKey: ['/api/parents'],
    enabled: !!user
  });
  
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/messaging/conversations'],
    enabled: !!user
  });
  
  const { data: goalsData = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/goals'],
    enabled: !!user
  });
  
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/match/pending-assignments'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds as backup
    staleTime: 10000 // Consider data stale after 10 seconds
  });
  
  const pendingAssignments = (pendingData as any)?.assignments || [];
  const loading = studentsLoading || casesLoading || parentsLoading || conversationsLoading || pendingLoading || goalsLoading;

  // Accept proposal mutation with proper cache invalidation
  const acceptProposalMutation = useMutation({
    mutationFn: async ({ proposalId }: { proposalId: string }) => {
      const response = await apiRequest('POST', `/api/match/${proposalId}/accept`);
      if (!response.ok) {
        throw new Error('Failed to accept proposal');
      }
      return response.json();
    },
    onSuccess: (data, { proposalId }) => {
      // Invalidate all related queries immediately
      queryClient.invalidateQueries({ queryKey: ['/api/match/pending-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      
      // Force immediate refresh to update sidebar badge
      queryClient.refetchQueries({ queryKey: ['/api/match/pending-assignments'] });
    },
    onError: (error) => {
      console.error('Error accepting proposal:', error);
      toast({
        title: "Error",
        description: "Failed to accept the case. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Decline proposal mutation with proper cache invalidation
  const declineProposalMutation = useMutation({
    mutationFn: async ({ proposalId }: { proposalId: string }) => {
      const response = await apiRequest('POST', `/api/match/${proposalId}/decline`, {
        reason: 'Declined via dashboard'
      });
      if (!response.ok) {
        throw new Error('Failed to decline proposal');
      }
      return response.json();
    },
    onSuccess: (data, { proposalId }) => {
      // Invalidate and refetch pending assignments immediately
      queryClient.invalidateQueries({ queryKey: ['/api/match/pending-assignments'] });
      queryClient.refetchQueries({ queryKey: ['/api/match/pending-assignments'] });
    },
    onError: (error) => {
      console.error('Error declining proposal:', error);
      toast({
        title: "Error",
        description: "Failed to decline the case. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Calculate dashboard metrics
  const openCases = (cases as any[]).filter(c => c.status === 'active' || c.status === 'open');
  const totalPendingCount = pendingAssignments.length;
  const completedGoals = (goalsData as any[]).filter(g => g.status === 'completed' || g.status === 'achieved' || g.status === 'met');
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const actionLoading = acceptProposalMutation.isPending || declineProposalMutation.isPending;
  const [activeCasesExpanded, setActiveCasesExpanded] = useState(false);
  const urgentCases = openCases.filter(c => c.urgency === 'high' || c.urgency === 'urgent');

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
          const upcoming = meetings.filter((meeting: Meeting) => 
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

  // Handle accepting/declining match proposals with toast notifications
  const handleAcceptProposal = async (proposalId: string, studentName: string) => {
    toast({
      title: "Case Accepted",
      description: `Successfully accepted the case for ${studentName}. A new client relationship and case have been created.`,
    });
    
    acceptProposalMutation.mutate({ proposalId });
  };

  const handleDeclineProposal = async (proposalId: string, studentName: string) => {
    toast({
      title: "Case Declined",
      description: `Declined the case for ${studentName}. The parent will be notified.`,
    });
    
    declineProposalMutation.mutate({ proposalId });
  };

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

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-orange-100 text-orange-700 border-orange-200";
  };

  // Helper function to extract parent name from conversation data with multiple fallback strategies
  const getParentName = (conversationData: any, parentsArray: any[] = []) => {
    // Strategy 1: Direct parent name fields from API response
    if (conversationData?.parentFirstName && conversationData?.parentLastName) {
      const firstName = conversationData.parentFirstName.trim();
      const lastName = conversationData.parentLastName.trim();
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
    }

    // Strategy 2: Full name field if available
    if (conversationData?.parent_full_name && conversationData.parent_full_name.trim()) {
      return conversationData.parent_full_name;
    }
    if (conversationData?.parentFullName && conversationData.parentFullName.trim()) {
      return conversationData.parentFullName;
    }

    // Strategy 3: Direct parent name field
    if (conversationData?.parent_name && conversationData.parent_name.trim()) {
      return conversationData.parent_name;
    }
    if (conversationData?.parentName && conversationData.parentName.trim()) {
      return conversationData.parentName;
    }

    // Strategy 4: Extract from participant_name if available
    if (conversationData?.participant_name && conversationData.participant_name.trim()) {
      return conversationData.participant_name;
    }

    // Strategy 5: Join with parents array using parentId
    if (conversationData?.parentId && Array.isArray(parentsArray) && parentsArray.length > 0) {
      const matchingParent = parentsArray.find(p => p?.id === conversationData.parentId);
      if (matchingParent?.full_name && matchingParent.full_name.trim()) {
        return matchingParent.full_name;
      }
      if (matchingParent?.parent_name && matchingParent.parent_name.trim()) {
        return matchingParent.parent_name;
      }
      if (matchingParent?.firstName && matchingParent?.lastName) {
        const firstName = matchingParent.firstName.trim();
        const lastName = matchingParent.lastName.trim();
        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        }
      }
    }

    // Strategy 6: Use email if available (before giving up)
    if (conversationData?.parentEmail && conversationData.parentEmail.trim()) {
      const email = conversationData.parentEmail.trim();
      // Extract name part from email (everything before @)
      const emailName = email.split('@')[0];
      if (emailName && emailName !== 'undefined' && emailName !== 'null') {
        return emailName.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    // Strategy 7: Extract from conversation title if it contains parent info
    if (conversationData?.title && conversationData.title.includes('with ')) {
      const titleParts = conversationData.title.split('with ');
      if (titleParts.length > 1) {
        const extractedName = titleParts[titleParts.length - 1].trim();
        if (extractedName && extractedName !== 'undefined' && extractedName !== 'null') {
          return extractedName;
        }
      }
    }

    // If all strategies fail, return descriptive fallback
    return 'Parent';
  };

  // Helper function to extract student name from case data with multiple fallback strategies
  const getStudentName = (caseData: any, studentsArray: any[] = []) => {
    // Strategy 1: Direct student field (object or string)
    if (caseData?.student) {
      if (typeof caseData.student === 'object' && caseData.student.full_name) {
        return caseData.student.full_name;
      }
      if (typeof caseData.student === 'string' && caseData.student.trim()) {
        return caseData.student;
      }
    }

    // Strategy 2: Direct student name fields
    if (caseData?.student_full_name && caseData.student_full_name.trim()) {
      return caseData.student_full_name;
    }
    if (caseData?.student_name && caseData.student_name.trim()) {
      return caseData.student_name;
    }
    if (caseData?.studentName && caseData.studentName.trim()) {
      return caseData.studentName;
    }

    // Strategy 3: Combine first and last name
    if (caseData?.student_first_name && caseData?.student_last_name) {
      const firstName = caseData.student_first_name.trim();
      const lastName = caseData.student_last_name.trim();
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
    }

    // Strategy 4: Extract from case title (pattern: "IEP Support for [Student Name]")
    if (caseData?.case_title && caseData.case_title.includes('IEP Support for')) {
      const titleParts = caseData.case_title.split('IEP Support for ');
      if (titleParts.length > 1) {
        const extractedName = titleParts[1].trim();
        if (extractedName && extractedName !== 'undefined' && extractedName !== 'null') {
          return extractedName;
        }
      }
    }
    if (caseData?.case_title && caseData.case_title.includes('for ')) {
      const titleParts = caseData.case_title.split('for ');
      if (titleParts.length > 1) {
        const extractedName = titleParts[titleParts.length - 1].trim();
        if (extractedName && extractedName !== 'undefined' && extractedName !== 'null') {
          return extractedName;
        }
      }
    }

    // Strategy 5: Join with students array using student_id
    if (caseData?.student_id && Array.isArray(studentsArray) && studentsArray.length > 0) {
      const matchingStudent = studentsArray.find(s => s?.id === caseData.student_id);
      if (matchingStudent?.full_name && matchingStudent.full_name.trim()) {
        return matchingStudent.full_name;
      }
      if (matchingStudent?.student_name && matchingStudent.student_name.trim()) {
        return matchingStudent.student_name;
      }
    }

    // Strategy 6: Use any title that looks like it contains a student name
    if (caseData?.case_title && caseData.case_title.trim()) {
      return caseData.case_title.replace(/^(Case|Support|IEP|Help)\s*(for|with)?\s*/i, '').trim();
    }
    if (caseData?.title && caseData.title.trim()) {
      return caseData.title.replace(/^(Case|Support|IEP|Help)\s*(for|with)?\s*/i, '').trim();
    }

    // If all strategies fail, return a descriptive fallback
    return 'Student (Name Pending)';
  };

  // Create unified activity feed from real data
  const generateActivityFeed = () => {
    const activities: Array<{
      id: string;
      type: string;
      title: string;
      description?: string;
      timestamp: Date;
      icon: any;
      color: string;
      link?: string;
    }> = [];

    // Add active cases as activities
    const openCasesArray = Array.isArray(openCases) 
      ? openCases 
      : [];
    
    if (openCasesArray.length > 0) {
      openCasesArray.forEach((case_, index) => {
        const caseDate = case_?.created_at ? new Date(case_.created_at) : new Date();
        const studentName = getStudentName(case_, students as any[]);
        activities.push({
          id: `case-${case_?.id || index}`,
          type: 'case',
          title: `Active case: ${studentName}`,
          description: case_?.case_type ? `${case_.case_type} - ${case_?.next_action || 'Ongoing advocacy'}` : `Parent: ${case_?.parent_first_name && case_?.parent_last_name ? `${case_.parent_first_name} ${case_.parent_last_name}` : case_?.parent_email || 'Unknown'}`,
          timestamp: caseDate,
          icon: Briefcase,
          color: case_?.priority === 'high' || case_?.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
          link: '/advocate/parents'
        });
      });
    }

    // Add pending assignments as activities
    const pendingAssignmentsArray = Array.isArray(pendingAssignments) 
      ? pendingAssignments 
      : pendingAssignments?.assignments && Array.isArray(pendingAssignments.assignments) 
        ? pendingAssignments.assignments 
        : [];
    
    if (pendingAssignmentsArray.length > 0) {
      pendingAssignmentsArray.forEach((assignment: any, index: number) => {
        const assignmentDate = assignment?.created_at ? new Date(assignment.created_at) : new Date();
        activities.push({
          id: `pending-${assignment?.id || index}`,
          type: 'assignment',
          title: `New client match: ${assignment?.student_name || 'Student'}`,
          description: `Match score: ${assignment?.match_score || 'N/A'}% - Awaiting your response`,
          timestamp: assignmentDate,
          icon: Bell,
          color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
          link: '/advocate/matching'
        });
      });
    }

    // Add recent meetings as activities
    const upcomingMeetingsArray = Array.isArray(upcomingMeetings) 
      ? upcomingMeetings 
      : [];
    
    if (upcomingMeetingsArray.length > 0) {
      upcomingMeetingsArray.slice(0, 3).forEach((meeting, index) => {
        const meetingDate = meeting?.scheduled_date ? new Date(meeting.scheduled_date) : new Date();
        activities.push({
          id: `meeting-${meeting?.id || index}`,
          type: 'meeting',
          title: `Upcoming: ${meeting?.title || 'Meeting'}`,
          description: `${meeting?.type || 'Meeting'} scheduled${meeting?.attendees ? ` (${meeting.attendees} attendees)` : ''}`,
          timestamp: meetingDate,
          icon: CalendarIcon,
          color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
          link: '/advocate/schedule'
        });
      });
    }

    // Add conversations as activities
    const conversationsArray = Array.isArray(conversations) 
      ? conversations 
      : [];
    
    if (conversationsArray.length > 0) {
      conversationsArray.slice(0, 2).forEach((conversation, index) => {
        const convDate = conversation?.updated_at ? new Date(conversation.updated_at) : conversation?.created_at ? new Date(conversation.created_at) : new Date();
        activities.push({
          id: `conversation-${conversation?.id || index}`,
          type: 'message',
          title: `Message from ${getParentName(conversation, parents as any[])}`,
          description: conversation?.last_message ? (conversation.last_message.length > 60 ? `${conversation.last_message.substring(0, 60)}...` : conversation.last_message) : 'New conversation started',
          timestamp: convDate,
          icon: MessageSquare,
          color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
          link: '/advocate/messages'
        });
      });
    }

    // Add completed goals as activities
    const completedGoalsArray = Array.isArray(completedGoals) 
      ? completedGoals 
      : [];
    
    if (completedGoalsArray.length > 0) {
      completedGoalsArray.slice(0, 2).forEach((goal, index) => {
        const goalDate = goal?.completed_at ? new Date(goal.completed_at) : goal?.updated_at ? new Date(goal.updated_at) : new Date();
        // Try to get student name from goal data
        let goalStudentName = 'Student';
        if (goal?.student_name) {
          goalStudentName = goal.student_name;
        } else if (goal?.student_id && students) {
          const matchingStudent = (students as any[]).find(s => s?.id === goal.student_id);
          if (matchingStudent?.full_name) {
            goalStudentName = matchingStudent.full_name;
          }
        }
        
        activities.push({
          id: `goal-${goal?.id || index}`,
          type: 'goal',
          title: `Goal achieved: ${goal?.title || goalStudentName + ' goal'}`,
          description: goal?.description || `Successfully completed advocacy goal for ${goalStudentName}`,
          timestamp: goalDate,
          icon: Target,
          color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400',
          link: '/advocate/students'
        });
      });
    }

    // Sort activities by timestamp (newest first) and return top 8
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  };

  // Get formatted time for activity items
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };

  const recentActivities = generateActivityFeed();

  return (
    <MobileAppShell>
      <PremiumLargeHeader 
        title={`Welcome back, ${user?.firstName || 'Advocate'}`}
        subtitle="Your advocacy dashboard"
      />
      <SafeAreaFull className="space-y-6">
        {/* MOBILE TEST BOX - BRIGHT GREEN */}
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg font-bold">
          📱 MOBILE VERSION TEST
        </div>
        {/* Welcome Section */}
        <ContainerMobile>
          <PremiumCard variant="gradient" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Ready to advocate
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Your command center</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                  <Flag className="h-3 w-3" />
                  {plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan` : 'Active Plan'}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                  <Activity className="h-3 w-3" />
                  Active Today
                </span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                <FeatureGate 
                  requiredFeature="advocateMessaging"
                  showUpgradePrompt={false}
                  fallback={
                    <LockedActionButton
                      requiredFeature="advocateMessaging"
                      variant="outline"
                      size="sm"
                      className="bg-white/80 backdrop-blur-sm hover:bg-white min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
                      data-testid="quick-messages-locked"
                      upgradeBenefits={[
                        "Direct messaging with parents and families",
                        "Secure communication tracking",
                        "Message templates and automation",
                        "Professional correspondence tools"
                      ]}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </LockedActionButton>
                  }
                >
                  <Button asChild variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm hover:bg-white min-h-[44px] text-sm sm:text-base w-full sm:w-auto">
                    <Link to="/advocate/messages" data-testid="quick-messages">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                      {(conversations as any[]).length > 0 && <Badge className="ml-2 bg-red-500 text-white">{(conversations as any[]).length}</Badge>}
                    </Link>
                  </Button>
                </FeatureGate>
                
                <FeatureGate 
                  requiredFeature="professionalAnalysis"
                  showUpgradePrompt={false}
                  fallback={
                    <LockedActionButton
                      requiredFeature="professionalAnalysis"
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
                      data-testid="quick-tools-locked"
                      upgradeBenefits={[
                        "Full access to 25+ professional tools",
                        "IEP review and analysis tools",
                        "Smart letter generation",
                        "Meeting preparation wizards",
                        "Professional advocacy reports"
                      ]}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Access Tools
                    </LockedActionButton>
                  }
                >
                  <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 min-h-[44px] text-sm sm:text-base w-full sm:w-auto">
                    <Link to="/advocate/tools" data-testid="quick-tools">
                      <Zap className="h-4 w-4 mr-2" />
                      Access Tools
                    </Link>
                  </Button>
                </FeatureGate>
            </div>
          </PremiumCard>
        </ContainerMobile>

        {/* Dashboard Statistics */}
        <ContainerMobile>
          <div className="grid grid-cols-2 gap-4">
            {/* Pending Assignments */}
            <PremiumCard variant="glass" className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                {totalPendingCount > 0 && (
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                      Urgent
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="stat-pending-assignments">
                  {loading ? '...' : totalPendingCount}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Pending Matches</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting response</p>
              </div>
            </PremiumCard>

            {/* Active Cases */}
            <PremiumCard variant="glass" className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                {openCases.length > 0 && (
                  <div className="ml-auto">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '...' : openCases.length}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Cases</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Currently advocating</p>
              </div>
            </PremiumCard>

            {/* Meetings */}
            <FeatureGate 
              requiredFeature="meetingScheduler"
              upgradeBenefits={[
                "Schedule and manage client meetings",
                "Automated meeting reminders",
                "Calendar integration",
                "Meeting templates and agendas"
              ]}
              data-testid="stat-meetings-gate"
            >
              <PremiumCard variant="glass" className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  {upcomingMeetings.length > 0 && (
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        Scheduled
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="stat-meetings-count">
                    {loading ? '...' : upcomingMeetings.length}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">This Week</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming meetings</p>
                </div>
              </PremiumCard>
            </FeatureGate>

            {/* Goals Achieved */}
            <FeatureGate 
              requiredFeature="goalManagement"
              upgradeBenefits={[
                "Set and track advocacy goals",
                "Goal templates and recommendations",
                "Progress tracking and analytics",
                "Achievement reports and insights"
              ]}
              data-testid="stat-goals-gate"
            >
              <PremiumCard variant="glass" className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  {completedGoals.length > 0 && (
                    <div className="ml-auto">
                      <Award className="h-4 w-4 text-yellow-500" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="stat-goals-count">
                    {loading ? '...' : completedGoals.length}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Goals Achieved</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total completed</p>
                </div>
              </PremiumCard>
            </FeatureGate>
          </div>
        </ContainerMobile>

        {/* Advocate Upgrade Section */}
        {shouldShowUpgrade && (
          <ContainerMobile>
            <PremiumCard variant="gradient" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-semibold text-xs sm:text-sm">
                        {userPlan === 'starter' ? 'Starter Plan' : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan`} Active
                      </Badge>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">🚀 Unlock Advanced Advocacy Tools</h2>
                    <p className="text-white/90 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                      Scale your practice with AI-powered analytics, premium client management, and advanced reporting tools.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center lg:justify-start gap-3 sm:gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
                        <span className="font-medium">Advanced Case Analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
                        <span className="font-medium">Team Collaboration Tools</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
                        <span className="font-medium">Professional Reporting Suite</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 w-full sm:min-w-[280px] lg:w-auto">
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          navigate('/advocate/pricing');
                        } catch (error) {
                          console.error('Navigation error:', error);
                          window.location.href = '/advocate/pricing';
                        }
                      }}
                      size="lg"
                      className="bg-white text-indigo-600 hover:bg-white/90 font-bold text-base sm:text-lg py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[48px] w-full"
                      data-testid="button-advocate-upgrade"
                    >
                      <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
            </PremiumCard>
          </ContainerMobile>
        )}

        {/* Quick Access Grid */}
        <ContainerMobile>
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quick Access</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Access all your advocacy tools</p>
            </div>
          
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <PremiumCard key={i} variant="glass" className="p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                  </PremiumCard>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Parent Clients */}
                <PremiumToolCard
                  icon={<Users className="h-5 w-5" />}
                  title="Parent Clients"
                  description="Manage client relationships"
                  badge={`${(parents as any[]).length} clients`}
                  onClick={() => navigate('/advocate/parents')}
                  data-testid="card-parent-clients"
                />

                {/* Client Students */}
                <PremiumToolCard
                  icon={<GraduationCap className="h-5 w-5" />}
                  title="Client Students"
                  description="View and manage cases"
                  badge={`${(students as any[]).length} students`}
                  onClick={() => navigate('/advocate/students')}
                  data-testid="card-client-students"
                />

                {/* Schedule */}
                <FeatureGate 
                  requiredFeature="meetingScheduler"
                  upgradeBenefits={[
                    "Schedule and manage client meetings",
                    "Automated meeting reminders",
                    "Calendar integration and sync",
                    "Meeting templates and agendas"
                  ]}
                  data-testid="card-schedule-gate"
                >
                  <PremiumToolCard
                    icon={<Calendar className="h-5 w-5" />}
                    title="Schedule"
                    description="Manage appointments"
                    badge={`${upcomingMeetings.length} upcoming`}
                    onClick={() => navigate('/advocate/schedule')}
                    data-testid="card-schedule"
                  />
                </FeatureGate>

              {/* Client Matching */}
              <FeatureGate 
                requiredFeature="caseMatching"
                upgradeBenefits={[
                  "Advanced client matching algorithms",
                  "Case proposal management",
                  "Client compatibility scoring",
                  "Automated match notifications"
                ]}
                data-testid="card-client-matching-gate"
              >
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50 hover:scale-105" data-testid="card-client-matching">
                  <Link to="/advocate/matching" className="block">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-xl flex items-center justify-center group-hover:bg-rose-200 dark:group-hover:bg-rose-800 transition-colors">
                          <HeartHandshake className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Client Matching</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Review matched client requests</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totalPendingCount}</span>
                        <span className="text-sm text-gray-500">pending</span>
                        {totalPendingCount > 0 && <Badge variant="destructive" className="bg-red-500">New</Badge>}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </FeatureGate>

              {/* Tools Hub */}
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 hover:scale-105" data-testid="card-tools-hub">
                <Link to="/advocate/tools" className="block">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                        <FileSearch className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Tools Hub</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Advocacy tools & resources</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-purple-700 border-purple-300">25+ Tools</Badge>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              {/* Document Vault */}
              <FeatureGate 
                requiredFeature="documentVault"
                upgradeBenefits={[
                  "Secure document storage and sharing",
                  "Client file organization",
                  "Version control and history",
                  "Secure parent access sharing"
                ]}
                data-testid="card-document-vault-gate"
              >
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 hover:scale-105" data-testid="card-document-vault">
                  <Link to="/tools/document-vault" className="block">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                          <Folder className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Document Vault</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Secure document storage & sharing</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-orange-700 border-orange-300">Secure</Badge>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </FeatureGate>

              {/* Messages */}
              <FeatureGate 
                requiredFeature="advocateMessaging"
                upgradeBenefits={[
                  "Direct messaging with parents and families",
                  "Secure communication tracking",
                  "Message templates and automation",
                  "Professional correspondence tools"
                ]}
                data-testid="card-messages-gate"
              >
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 hover:scale-105" data-testid="card-messages">
                  <Link to="/advocate/messages" className="block">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                          <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Messages</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Secure client communication</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-indigo-700 border-indigo-300">Secure</Badge>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </FeatureGate>

                {/* Analytics/Reports */}
                <FeatureGate 
                  requiredFeature="advocacyReports"
                  upgradeBenefits={[
                    "Advanced analytics and reporting",
                    "Success metrics tracking",
                    "Client outcome analysis",
                    "Professional report generation"
                  ]}
                  data-testid="card-analytics-gate"
                >
                  <PremiumToolCard
                    icon={<BarChart3 className="h-5 w-5" />}
                    title="Analytics"
                    description="Track success metrics"
                    badge="Pro Features"
                    onClick={() => navigate('/advocate/reports')}
                    data-testid="card-analytics"
                  />
                </FeatureGate>
              </div>
            )}
          </div>
        </ContainerMobile>


        {/* Recent Activity Feed */}
        <ContainerMobile>
          <FeatureGate 
            requiredFeature="caseAnalytics"
            upgradeBenefits={[
              "Advanced activity tracking and analytics",
              "Detailed case progress monitoring",
              "Client interaction insights",
              "Performance metrics and trends"
            ]}
            data-testid="activity-feed-gate"
          >
            <PremiumCard variant="glass" className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your latest advocacy activities</p>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <div 
                        key={activity.id} 
                        className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                        data-testid={`activity-${activity.type}-${activity.id}`}
                        onClick={() => activity.link && (window.location.href = activity.link)}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activity.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid={`activity-title-${activity.id}`}>
                            {activity.title}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1" data-testid={`activity-description-${activity.id}`}>
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1" data-testid={`activity-time-${activity.id}`}>
                            {getTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                        {activity.link && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-muted-foreground mb-4">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg font-medium">No recent activity</p>
                    <p className="text-sm">Your advocacy activities will appear here</p>
                  </div>
                  <Button asChild variant="outline" data-testid="start-activity">
                    <Link to="/advocate/matching">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Your First Case
                    </Link>
                  </Button>
                </div>
              )}
              
                <div className="pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full min-h-[44px] hover:bg-blue-50 dark:hover:bg-blue-900 rounded-xl"
                    asChild
                    data-testid="view-all-activity"
                  >
                    <Link to="/advocate/activity">
                      View All Activity
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </PremiumCard>
          </FeatureGate>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
};

export default AdvocateDashboard;