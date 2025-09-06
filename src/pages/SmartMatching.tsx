import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StudentSelector } from "@/components/StudentSelector";
import { Brain, Target, Zap, MessageSquare, Star, MapPin, Users, Search, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

// Interface definitions from MatchingDashboard
interface Student {
  id: string;
  full_name: string;
  grade_level: string;
  special_needs: string[];
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

interface Advocate {
  id: string;
  full_name: string;
  email?: string;
  bio?: string;
  specializations: string[];
  years_experience?: number;
  rate_per_hour?: number;
  rating?: number;
  location?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

interface MatchProposal {
  id: string;
  student_id: string;
  advocate_id: string;
  score: number;
  status: 'pending' | 'scheduled' | 'accepted' | 'declined' | 'intro_requested';
  created_at: string;
  reason?: any;
  student?: Student;
  advocate?: Advocate;
}

export default function SmartMatching() {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("medium");
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('smart-match');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [selectedStudentObj, setSelectedStudentObj] = useState<Student | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Determine if user is an advocate based on role
  const isAdvocate = user?.role === 'advocate';
  const userRole = user?.role || 'parent';

  // Fetch real data from API using proper authentication
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return await response.json();
    },
    enabled: !isAdvocate // Only load for parents
  });

  const { data: advocates = [], isLoading: advocatesLoading } = useQuery({
    queryKey: ['advocates'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/advocates');
      return await response.json();
    },
    enabled: !isAdvocate // Only load for parents
  });

  // Different API calls based on user role for proposals
  const { data: proposalsData, isLoading: proposalsLoading } = useQuery({
    queryKey: ['match-proposals', userRole],
    queryFn: async () => {
      const endpoint = isAdvocate ? '/api/match/advocate-proposals' : '/api/match';
      const response = await apiRequest('GET', endpoint);
      return await response.json();
    }
  });

  const proposals = Array.isArray(proposalsData?.proposals) ? proposalsData.proposals : [];

  const filteredAdvocates = advocates.filter(advocate => {
    const matchesSearch = advocate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (advocate.bio || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (advocate.specializations || []).some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = filterSpecialty === 'all' || (advocate.specializations || []).includes(filterSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  // AI Auto-matching mutation
  const autoMatchMutation = useMutation({
    mutationFn: async ({ student_id, urgency_level }: { student_id: string; urgency_level: string }) => {
      const response = await apiRequest('POST', '/api/match/auto-match', {
        student_id,
        max_matches: 3,
        urgency_level
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Match results:', data);
      setAiMatches(data.proposals || []);
      setMatchingStatus('success');
      toast({
        title: "Smart Matches Found!",
        description: `Found ${data.matches_created || 0} excellent advocates for your student.`,
      });
    },
    onError: (error) => {
      console.error('Auto-matching error:', error);
      setMatchingStatus('error');
      toast({
        title: "Matching Error",
        description: "Unable to find matches right now. Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  // Mutations for match proposals from MatchingDashboard
  const createProposalMutation = useMutation({
    mutationFn: async ({ studentId, advocateIds }: { studentId: string; advocateIds: string[] }) => {
      const response = await apiRequest('POST', '/api/match/propose', {
        student_id: studentId,
        advocate_ids: advocateIds,
        manual_match: true
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-proposals'] });
      toast({
        title: "Match Request Sent!",
        description: "Your request has been sent to the advocate. They will review and respond soon.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create match proposal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateProposal = async (advocateId: string) => {
    if (!selectedStudentObj) {
      toast({
        title: "Error",
        description: "Please select a student first",
        variant: "destructive",
      });
      return;
    }

    createProposalMutation.mutate({
      studentId: selectedStudentObj.id,
      advocateIds: [advocateId]
    });
  };

  // Accept/decline mutations for advocates
  const acceptProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await apiRequest('POST', `/api/match/${proposalId}/accept`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-proposals', userRole] });
      toast({
        title: "Proposal Accepted",
        description: "You've accepted this match proposal. The family will be notified.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept proposal.",
        variant: "destructive",
      });
    }
  });

  const declineProposalMutation = useMutation({
    mutationFn: async ({ proposalId, reason }: { proposalId: string; reason?: string }) => {
      const response = await apiRequest('POST', `/api/match/${proposalId}/decline`, { reason });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-proposals', userRole] });
      toast({
        title: "Proposal Declined",
        description: "You've declined this match proposal.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to decline proposal.",
        variant: "destructive",
      });
    }
  });

  const handleSmartMatch = () => {
    if (!selectedStudent) {
      toast({
        title: "Select a Student",
        description: "Please choose a student before finding advocate matches.",
        variant: "destructive",
      });
      return;
    }

    setMatchingStatus('loading');
    autoMatchMutation.mutate({
      student_id: selectedStudent,
      urgency_level: urgencyLevel
    });
  };

  // Show different views for advocates vs parents
  if (isAdvocate) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          {/* Advocate Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-2xl" />
            <div className="relative p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Advocate Match Management
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Review incoming match proposals and connect with new families
              </p>
            </div>
          </div>

          {/* Advocate Proposals */}
          <div className="grid gap-4">
            {proposals.filter(p => p.status === 'pending').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No New Proposals</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    You don't have any new match proposals at the moment. New families will appear here when they're interested in working with you.
                  </p>
                </CardContent>
              </Card>
            ) : (
              proposals.filter(p => p.status === 'pending').map(proposal => (
                <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Match Request from {proposal.student?.full_name}'s Family
                        </CardTitle>
                        <CardDescription>
                          {proposal.student?.grade_level} • {proposal.student?.special_needs?.join(', ') || 'Special Education Support'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {proposal.score}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {proposal.student?.special_needs?.map(need => (
                        <Badge key={need} variant="outline">
                          {need}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => acceptProposalMutation.mutate(proposal.id)}
                        disabled={acceptProposalMutation.isPending}
                        className="flex-1"
                      >
                        Accept Match
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => declineProposalMutation.mutate({ proposalId: proposal.id })}
                        disabled={declineProposalMutation.isPending}
                        className="flex-1"
                      >
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-2xl" />
          <div className="relative p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Find Your Perfect Advocate
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Smart AI matching and comprehensive advocate browsing - all in one powerful interface
            </p>
          </div>
        </div>

        {/* Student Selection */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle>Select Your Student</CardTitle>
            <CardDescription>Choose which student needs advocacy support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <StudentSelector
                selectedStudent={selectedStudent}
                onStudentChange={(value) => {
                  setSelectedStudent(value);
                  const student = students.find(s => s.id === value);
                  setSelectedStudentObj(student || null);
                }}
                placeholder="Choose a student for advocacy support..."
                allowEmpty={false}
                data-testid="student-selector"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="smart-match">🤖 AI Smart Match</TabsTrigger>
            <TabsTrigger value="browse">🔍 Browse All</TabsTrigger>
            <TabsTrigger value="proposals">📋 My Proposals</TabsTrigger>
          </TabsList>

          {/* Smart Match Tab */}
          <TabsContent value="smart-match">
            <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
              Smart Matching Options
            </CardTitle>
            <CardDescription>
              Configure your matching preferences for the best results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6">
              <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <Label>How urgent is your need?</Label>
                  <Select 
                    value={urgencyLevel} 
                    onValueChange={setUrgencyLevel}
                  >
                    <SelectTrigger data-testid="urgency-selector">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Within a month</SelectItem>
                      <SelectItem value="medium">Medium - Within 2 weeks</SelectItem>
                      <SelectItem value="high">High - Urgent, ASAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleSmartMatch}
                  disabled={!selectedStudent || autoMatchMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  size="lg"
                  data-testid="find-matches-button"
                >
                  {autoMatchMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Finding Perfect Matches...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Find My Matches
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* AI Match Results */}
            {matchingStatus === 'success' && aiMatches.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">🎯 Your Top Matches</h4>
                  <p className="text-sm text-muted-foreground">Ranked by compatibility with your student's needs</p>
                </div>
                
                <div className="grid gap-4" data-testid="match-results">
                  {aiMatches.map((match, index) => {
                    const advocate = match.advocate;
                    const matchDetails = match.match_details || { total_score: 85, reasons: ['Compatible specialization'] };
                    return (
                      <Card key={match.proposal?.id || index} className="border-2 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                  {advocate.full_name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h5 className="font-semibold">{advocate.full_name || 'Expert Advocate'}</h5>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {advocate.location || 'Available nationwide'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {matchDetails.total_score}% Match
                              </div>
                              <div className="text-xs text-muted-foreground">Compatibility</div>
                            </div>
                          </div>

                          <Progress value={matchDetails.total_score} className="mb-3" />
                          
                          <div className="space-y-2 mb-4">
                            {matchDetails.reasons?.map((reason: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {advocate.specializations?.slice(0, 3).map((spec: string) => (
                              <Badge key={spec} variant="secondary">{spec}</Badge>
                            )) || <Badge variant="secondary">IEP Expertise</Badge>}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {advocate.rating || 4.8}
                              </div>
                              <span>${advocate.rate_per_hour || 125}/hour</span>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-purple-600 hover:bg-purple-700"
                              data-testid={`contact-advocate-${index}`}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Start Conversation
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {matchingStatus === 'success' && aiMatches.length === 0 && (
              <div className="mt-8 text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <Target className="h-12 w-12 mx-auto mb-2" />
                  <p>No matches found for your current criteria.</p>
                  <p className="text-sm">Try adjusting your preferences or contact us for help.</p>
                </div>
                <Button variant="outline">
                  Contact Support
                </Button>
              </div>
            )}

            {matchingStatus === 'error' && (
              <div className="mt-8 text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <Brain className="h-12 w-12 mx-auto mb-2" />
                  <p>Unable to connect to matching service.</p>
                  <p className="text-sm">Please try again or browse advocates manually.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSmartMatch}
                  disabled={!selectedStudent}
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          {/* Browse All Tab */}
          <TabsContent value="browse">
            <div className="space-y-6">
              {/* Search and Filter */}
              <Card>
                <CardHeader>
                  <CardTitle>Search & Filter Advocates</CardTitle>
                  <CardDescription>Find advocates based on your specific requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Name, specialization, or keywords..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="specialty">Specialty</Label>
                      <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                        <SelectTrigger>
                          <SelectValue placeholder="All specialties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Specialties</SelectItem>
                          <SelectItem value="Autism Spectrum">Autism Spectrum</SelectItem>
                          <SelectItem value="ADHD">ADHD</SelectItem>
                          <SelectItem value="Learning Disabilities">Learning Disabilities</SelectItem>
                          <SelectItem value="Behavioral Support">Behavioral Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {filteredAdvocates.length} advocate{filteredAdvocates.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {/* Advocates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdvocates.map((advocate) => (
                  <Card key={advocate.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                              {advocate.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h5 className="font-semibold">{advocate.full_name}</h5>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {advocate.location || 'Available nationwide'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {advocate.specializations?.slice(0, 3).map(spec => (
                          <Badge key={spec} variant="secondary">{spec}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {advocate.rating || 4.8}
                          </div>
                          <span>${advocate.rate_per_hour || 125}/hour</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleCreateProposal(advocate.id)}
                          disabled={!selectedStudentObj || createProposalMutation.isPending}
                        >
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredAdvocates.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Advocates Found</h3>
                    <p className="text-gray-500 text-center max-w-md">
                      Try adjusting your search criteria or check back later for new advocates.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">My Match Proposals</h2>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['match-proposals'] })} variant="outline">
                  Refresh
                </Button>
              </div>

              {proposals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
                    <p className="text-gray-500 text-center max-w-md">
                      Your match proposals will appear here. Start by using AI matching or browsing advocates to send match requests.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {proposals.map(proposal => (
                    <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {proposal.student?.full_name} × {proposal.advocate?.full_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Sent {new Date(proposal.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              proposal.status === 'accepted' ? 'default' :
                              proposal.status === 'declined' ? 'destructive' :
                              proposal.status === 'intro_requested' ? 'secondary' :
                              'outline'
                            }
                          >
                            {proposal.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{proposal.score}% Match</Badge>
                            <span className="text-sm text-muted-foreground">Compatibility Score</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}