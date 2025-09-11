import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  BookOpen
} from "lucide-react";

interface AdvocateDashboardProps {
  plan?: string;
}

const AdvocateDashboard = ({ plan }: AdvocateDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

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
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const actionLoading = acceptProposalMutation.isPending || declineProposalMutation.isPending;

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
          const upcoming = meetings.filter(meeting => 
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Advocate Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your cases, students, and upcoming meetings</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
              <Link to="/advocate/parents">
                <UserPlus className="h-4 w-4" />
                Manage Parent Clients
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
              <Link to="/advocate/students">
                <GraduationCap className="h-4 w-4" />
                Create New Student
              </Link>
            </Button>
            
            <Button asChild size="sm" className="flex items-center gap-2">
              <Link to="/advocate/tools">
                <BookOpen className="h-4 w-4" />
                Access Tools
              </Link>
            </Button>
            
            {/* Plan-specific badge for advocates */}
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Flag className="h-4 w-4" />
              {plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Active` : 'Plan Active'}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Pending Assignments"
            value={totalPendingCount.toString()}
            description="Awaiting your response"
            icon={<Users className="h-4 w-4" />}
            data-testid="stat-pending-assignments"
          />
          <StatCard
            title="Open Cases"
            value={openCases.length.toString()}
            description="Active advocacy cases"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="This Week's Meetings"
            value={upcomingMeetings.length.toString()}
            description="Scheduled meetings"
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            title="Goals Achieved"
            value={completedGoals.length.toString()}
            description="Total completed"
            icon={<Target className="h-4 w-4" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Students from Matching */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pending Student Assignments
              </CardTitle>
              <CardDescription>
                Students matched to you through the advocate matching system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Loading pending assignments...</p>
                  </div>
                </div>
              ) : pendingAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 border rounded-lg space-y-3" data-testid={`assignment-${assignment.id}`}>
                  {/* Header with student name and match score */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-lg" data-testid={`student-name-${assignment.student.name}`}>
                        {assignment.student.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {assignment.student.grade && `Grade ${assignment.student.grade} • `}
                        {assignment.student.school || 'School not specified'}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getMatchScoreColor(assignment.match.score)}>
                        {assignment.match.score}% Match
                      </Badge>
                      <Badge className={getUrgencyColor(assignment.match.urgency)}>
                        {assignment.match.urgency} priority
                      </Badge>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h5 className="font-medium text-sm mb-1">Parent Contact</h5>
                    <p className="text-sm font-medium" data-testid={`parent-name-${assignment.parent.name}`}>
                      {assignment.parent.name}
                    </p>
                    <p className="text-sm text-gray-700 font-medium" data-testid={`parent-email-${assignment.parent.email}`}>
                      {assignment.parent.email}
                    </p>
                  </div>

                  {/* Student Details */}
                  <div>
                    <h5 className="font-medium text-sm mb-2">Student Details</h5>
                    <div className="space-y-2">
                      {assignment.student.disability_category && (
                        <p className="text-sm">
                          <span className="font-medium">Disability Category:</span> {assignment.student.disability_category}
                        </p>
                      )}
                      {assignment.student.iep_status && (
                        <p className="text-sm">
                          <span className="font-medium">IEP Status:</span> {assignment.student.iep_status}
                        </p>
                      )}
                      {assignment.student.next_review_date && (
                        <p className="text-sm">
                          <span className="font-medium">Next Review:</span> {assignment.student.next_review_date}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Student Needs */}
                  {assignment.student.needs.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Student Needs</h5>
                      <div className="flex flex-wrap gap-1">
                        {assignment.student.needs.map((need, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {need}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match Reasons */}
                  <div>
                    <h5 className="font-medium text-sm mb-2">Why You're a Good Match</h5>
                    <ul className="text-sm space-y-1">
                      {assignment.match.reasons.map((reason, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                    {assignment.match.specialization_overlap > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {assignment.match.specialization_overlap}% specialization overlap
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      Matched {new Date(assignment.match.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeclineProposal(assignment.proposal_id, assignment.student.name)}
                        disabled={actionLoading}
                        data-testid={`button-decline-${assignment.id}`}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptProposal(assignment.proposal_id, assignment.student.name)}
                        disabled={actionLoading}
                        data-testid={`button-accept-${assignment.id}`}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accept Case
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && pendingAssignments.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg font-medium">No pending assignments yet</p>
                    <p className="text-sm">New match proposals will appear here when parents submit requests</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/advocate/parents">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Parent Clients
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Open Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Active Cases
              </CardTitle>
              <CardDescription>
                Cases currently under your advocacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {openCases.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg font-medium">No active cases yet</p>
                    <p className="text-sm">Your advocacy cases will appear here once you start working with students</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/advocate/students">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Create First Student Case
                    </Link>
                  </Button>
                </div>
              ) : openCases.map((case_) => (
                <div key={case_.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{case_.student}</h4>
                    <Badge className={getUrgencyColor(case_.status)}>
                      {case_.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Parent: {case_.parent}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">{case_.caseType}:</span> {case_.nextAction}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Due: {case_.dueDate}
                    </span>
                    <Button size="sm" variant="outline">
                      View Case
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Meetings
            </CardTitle>
            <CardDescription>
              Your scheduled meetings and consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">No meetings scheduled</p>
                  <p className="text-sm">Schedule meetings with your parent clients as you take on cases</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/advocate/schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">{meeting.title}</h4>
                  <p className="text-sm text-muted-foreground">{meeting.date}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{meeting.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {meeting.attendees} attendees
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Join Meeting
                  </Button>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Quick Actions</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="outline">
                  <Link to="/advocate/schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/advocate/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/advocate/tools/document-vault">
                    <FileText className="h-4 w-4 mr-2" />
                    Document Vault
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/advocate/tools">
                    <Star className="h-4 w-4 mr-2" />
                    All Tools
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdvocateDashboard;