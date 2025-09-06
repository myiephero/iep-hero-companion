import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Users, Star, Clock, MapPin, DollarSign, Search, Filter, Calendar, Phone, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Use API types
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

export default function MatchingDashboard() {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Determine if user is an advocate or parent based on URL
  const isAdvocate = window.location.pathname.includes('/advocate/');
  const userRole = user?.user_metadata?.role || 'parent';

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

  // Different API calls based on user role
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

  // Mutations for match proposals
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
        title: "Match Proposal Sent",
        description: "Your proposal has been sent to the advocate for review.",
      });
      setActiveTab('proposals');
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
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student first",
        variant: "destructive",
      });
      return;
    }

    createProposalMutation.mutate({
      studentId: selectedStudent.id,
      advocateIds: [advocateId]
    });
  };

  const introCallMutation = useMutation({
    mutationFn: async ({ proposalId, notes }: { proposalId: string; notes?: string }) => {
      const response = await apiRequest('POST', `/api/match/${proposalId}/intro`, { notes });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-proposals'] });
      toast({
        title: "Intro Call Requested",
        description: "The advocate has been notified of your intro call request.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to request intro call.",
        variant: "destructive",
      });
    }
  });

  // Mutations for advocate actions
  const acceptProposalMutation = useMutation({
    mutationFn: (proposalId: string) => apiClient.acceptProposal(proposalId),
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
    mutationFn: ({ proposalId, reason }: { proposalId: string; reason?: string }) => 
      apiClient.declineProposal(proposalId, reason),
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

  const handleIntroRequest = async (proposalId: string) => {
    introCallMutation.mutate({
      proposalId,
      notes: 'Looking forward to discussing this match opportunity'
    });
  };

  const handleAcceptProposal = (proposalId: string) => {
    acceptProposalMutation.mutate(proposalId);
  };

  const handleDeclineProposal = (proposalId: string) => {
    declineProposalMutation.mutate({ proposalId, reason: 'Not a good fit at this time' });
  };

  const handleSendMessage = (proposal: MatchProposal) => {
    // Navigate to messages page with parent information pre-populated
    const parentInfo = {
      parentId: proposal.parent_id,
      studentName: proposal.student?.full_name,
      proposalId: proposal.id
    };
    navigate('/advocate/messages', { state: { newMessage: parentInfo } });
  };

  // Render different layouts based on user role
  if (isAdvocate) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Matching</h1>
            <p className="text-muted-foreground">
              Review incoming match proposals and connect with new families
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="incoming">Incoming Proposals</TabsTrigger>
              <TabsTrigger value="active">Active Matches</TabsTrigger>
              <TabsTrigger value="history">Match History</TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">New Match Proposals</h2>
                <Button onClick={() => {}} variant="outline">
                  Refresh
                </Button>
              </div>

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
                <div className="grid gap-4">
                  {proposals.filter(p => p.status === 'pending').map(proposal => (
                    <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Match Request from {proposal.student?.full_name}'s Family
                            </CardTitle>
                            <CardDescription>
                              {proposal.student?.grade_level} • {proposal.student?.disability_category || 'Special Education Support'}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">
                            {proposal.score}% Match
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="font-medium">Student Background</Label>
                          <p className="text-sm text-gray-600 mt-1">{proposal.student?.notes || 'No additional notes provided'}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {proposal.student?.disability_category && (
                            <Badge variant="outline">
                              {proposal.student.disability_category}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {proposal.student?.grade_level}
                          </Badge>
                          <Badge variant="outline">
                            {proposal.student?.school_name}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-gray-500">
                            Received {new Date(proposal.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline"
                              onClick={() => handleDeclineProposal(proposal.id)}
                            >
                              Decline
                            </Button>
                            <Button 
                              variant="secondary"
                              onClick={() => handleSendMessage(proposal)}
                            >
                              Send Message
                            </Button>
                            <Button onClick={() => handleAcceptProposal(proposal.id)}>
                              Accept Match
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Active Matches Coming Soon</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Your accepted matches and ongoing cases will appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Match History</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Your previous matches and completed cases will be shown here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // Parent interface
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Advocates</h1>
          <p className="text-muted-foreground">
            Connect with certified advocates who specialize in your child's needs
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Advocates</TabsTrigger>
            <TabsTrigger value="proposals">My Proposals</TabsTrigger>
            <TabsTrigger value="matches">Active Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search advocates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                    data-testid="input-search-advocates"
                  />
                </div>
              </div>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger className="w-[200px]" data-testid="select-specialty-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="autism">Autism</SelectItem>
                  <SelectItem value="adhd">ADHD</SelectItem>
                  <SelectItem value="gifted">Gifted</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="speech">Speech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="student-select" className="text-sm font-medium">
                Select Student for Matching
              </Label>
              <Select 
                value={selectedStudent?.id || ''} 
                onValueChange={(value) => {
                  const student = students.find(s => s.id === value);
                  setSelectedStudent(student || null);
                }}
              >
                <SelectTrigger className="w-full mt-1" data-testid="select-student">
                  <SelectValue placeholder="Choose a student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} (Grade {student.grade_level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAdvocates.map(advocate => (
                <Card key={advocate.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {advocate.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{advocate.full_name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">{advocate.rating || 5.0}</span>
                          </div>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{advocate.years_experience || 0} years</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{advocate.bio || 'Experienced special education advocate.'}</p>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {advocate.location || 'Location not specified'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${advocate.rate_per_hour || 150}/hour
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Available for new cases
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(advocate.specializations || []).slice(0, 4).map(spec => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec.replace('_', ' ')}
                        </Badge>
                      ))}
                      {(advocate.specializations || []).length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{(advocate.specializations || []).length - 4} more
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Availability</Label>
                      <Progress value={80} className="h-2" />
                      <span className="text-xs text-gray-500">
                        Available for new cases
                      </span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" data-testid={`button-request-match-${advocate.id}`}>
                          Request Match
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Request Match with {advocate.full_name}</DialogTitle>
                          <DialogDescription>
                            Review the match details and send your request.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedStudent ? (
                          <div className="space-y-4">
                            <div>
                              <Label className="font-medium">Student</Label>
                              <p className="text-sm">{selectedStudent.full_name} (Grade {selectedStudent.grade_level})</p>
                            </div>
                            <div>
                              <Label className="font-medium">Advocate</Label>
                              <p className="text-sm">{advocate.full_name}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Student Needs</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(selectedStudent.special_needs || []).map(need => (
                                  <Badge key={need} variant="outline" className="text-xs">
                                    {need.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="font-medium">Advocate Specializations</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(advocate.specializations || []).map(spec => (
                                  <Badge 
                                    key={spec} 
                                    variant={(selectedStudent.special_needs || []).includes(spec) ? "default" : "secondary"} 
                                    className="text-xs"
                                  >
                                    {spec.replace('_', ' ')}
                                    {(selectedStudent.special_needs || []).includes(spec) && ' ✓'}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleCreateProposal(advocate.id)}
                              disabled={createProposalMutation.isPending}
                              data-testid="button-send-match-request"
                            >
                              {createProposalMutation.isPending ? 'Sending...' : 'Send Match Request'}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Please select a student first to request a match.</p>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Match Proposals</h2>
              <Button onClick={() => {}} variant="outline">
                Refresh
              </Button>
            </div>

            {proposals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Your match proposals will appear here. Start by browsing advocates and sending match requests.
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
                            {proposal.student?.name} × {proposal.advocate?.name}
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
                      {proposal.status === 'pending' && (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleIntroRequest(proposal.id)}
                            variant="outline"
                            size="sm"
                            data-testid={`button-request-intro-${proposal.id}`}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Request Intro Call
                          </Button>
                        </div>
                      )}
                      {proposal.status === 'accepted' && (
                        <div className="text-center py-4">
                          <p className="text-green-600 font-medium">Match Accepted!</p>
                          <p className="text-sm text-gray-600">The advocate will contact you to schedule an initial consultation.</p>
                        </div>
                      )}
                      {proposal.status === 'declined' && (
                        <div className="text-center py-4">
                          <p className="text-red-600 font-medium">Match Declined</p>
                          <p className="text-sm text-gray-600">This advocate is not available for new matches at this time.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Active Matches</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Your active advocate matches will appear here once proposals are accepted.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}