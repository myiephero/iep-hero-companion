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

interface Advocate {
  id: string;
  name: string;
  email: string;
  bio: string;
  tags: string[];
  languages: string[];
  timezone: string;
  hourly_rate: number;
  experience_years: number;
  rating: number;
  max_caseload: number;
  current_caseload: number;
  location: string;
  avatar_url?: string;
}

interface Student {
  id: string;
  name: string;
  grade: string;
  needs: string[];
  languages: string[];
  timezone: string;
  budget?: number;
  narrative: string;
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
  const [students, setStudents] = useState<Student[]>([]);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [proposals, setProposals] = useState<MatchProposal[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const { toast } = useToast();

  // Determine if user is an advocate or parent based on URL
  const isAdvocate = window.location.pathname.includes('/advocate/');

  // Mock data
  useEffect(() => {
    if (isAdvocate) {
      // Mock data for advocates - incoming proposals from families
      setProposals([
        {
          id: 'prop1',
          student_id: '1',
          advocate_id: 'adv1',
          score: 85,
          status: 'pending',
          created_at: new Date().toISOString(),
          student: {
            id: '1',
            name: 'Emma Johnson',
            grade: '5th',
            needs: ['autism', 'speech', 'behavioral'],
            languages: ['English'],
            timezone: 'America/New_York',
            narrative: 'Emma is a bright 5th grader with autism who needs support with behavioral interventions.'
          }
        },
        {
          id: 'prop2',
          student_id: '2',
          advocate_id: 'adv1',
          score: 78,
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          student: {
            id: '2',
            name: 'Michael Chen',
            grade: '8th',
            needs: ['adhd', 'executive_function', 'gifted'],
            languages: ['English', 'Mandarin'],
            timezone: 'America/Los_Angeles',
            narrative: 'Michael is twice-exceptional with ADHD and giftedness, needing advanced academic support.'
          }
        }
      ]);
    } else {
      // Mock data for parents
      setStudents([
        {
          id: '1',
          name: 'Emma Johnson',
          grade: '5th',
          needs: ['autism', 'speech', 'behavioral'],
          languages: ['English'],
          timezone: 'America/New_York',
          budget: 150,
          narrative: 'Emma is a bright 5th grader with autism who needs support with behavioral interventions and speech therapy goals.'
        },
        {
          id: '2',
          name: 'Michael Chen',
          grade: '8th',
          needs: ['adhd', 'executive_function', 'gifted'],
          languages: ['English', 'Mandarin'],
          timezone: 'America/Los_Angeles',
          budget: 200,
          narrative: 'Michael is twice-exceptional with ADHD and giftedness, needing advanced academic support with executive function skills.'
        }
      ]);

      setAdvocates([
        {
          id: 'adv1',
          name: 'Dr. Sarah Williams',
          email: 'sarah@example.com',
          bio: 'Certified special education advocate with 15 years of experience specializing in autism spectrum disorders.',
          tags: ['autism', 'behavioral', 'speech', 'sensory'],
          languages: ['English', 'Spanish'],
          timezone: 'America/New_York',
          hourly_rate: 125,
          experience_years: 15,
          rating: 4.9,
          max_caseload: 8,
          current_caseload: 5,
          location: 'New York, NY'
        },
        {
          id: 'adv2',
          name: 'James Rodriguez',
          email: 'james@example.com',
          bio: 'Former special education teacher turned advocate, focusing on twice-exceptional and gifted students.',
          tags: ['gifted', 'twice_exceptional', 'adhd', 'executive_function'],
          languages: ['English', 'Spanish'],
          timezone: 'America/Los_Angeles',
          hourly_rate: 175,
          experience_years: 12,
          rating: 4.8,
          max_caseload: 6,
          current_caseload: 4,
          location: 'Los Angeles, CA'
        },
        {
          id: 'adv3',
          name: 'Maria Santos',
          email: 'maria@example.com',
          bio: 'Bilingual advocate specializing in language development and cultural advocacy for diverse learners.',
          tags: ['language', 'ell', 'cultural', 'communication'],
          languages: ['English', 'Spanish', 'Portuguese'],
          timezone: 'America/Chicago',
          hourly_rate: 140,
          experience_years: 10,
          rating: 4.7,
          max_caseload: 7,
          current_caseload: 3,
          location: 'Chicago, IL'
        }
      ]);

      // Mock some proposals for parents too
      setProposals([
        {
          id: 'prop3',
          student_id: '1',
          advocate_id: 'adv1',
          score: 85,
          status: 'pending',
          created_at: new Date().toISOString(),
          student: students.find(s => s.id === '1'),
          advocate: advocates.find(a => a.id === 'adv1')
        }
      ]);
    }
  }, [isAdvocate]);

  const filteredAdvocates = advocates.filter(advocate => {
    const matchesSearch = advocate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advocate.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advocate.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = filterSpecialty === 'all' || advocate.tags.includes(filterSpecialty);
    
    return matchesSearch && matchesSpecialty;
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

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newProposal = {
        id: `prop_${Date.now()}`,
        student_id: selectedStudent.id,
        advocate_id: advocateId,
        score: Math.floor(Math.random() * 40) + 60,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        student: selectedStudent,
        advocate: advocates.find(a => a.id === advocateId)
      };
      
      setProposals(prev => [...prev, newProposal]);
      setLoading(false);
      
      toast({
        title: "Match Proposal Sent",
        description: "Your proposal has been sent to the advocate for review.",
      });
      
      setActiveTab('proposals');
    }, 1000);
  };

  const handleIntroRequest = async (proposalId: string) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId 
        ? { ...p, status: 'intro_requested' as const }
        : p
    ));
    
    toast({
      title: "Intro Call Requested",
      description: "The advocate has been notified of your intro call request.",
    });
  };

  const handleAcceptProposal = (proposalId: string) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId 
        ? { ...p, status: 'accepted' as const }
        : p
    ));
    
    toast({
      title: "Proposal Accepted",
      description: "You've accepted this match proposal. The family will be notified.",
    });
  };

  const handleDeclineProposal = (proposalId: string) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId 
        ? { ...p, status: 'declined' as const }
        : p
    ));
    
    toast({
      title: "Proposal Declined",
      description: "You've declined this match proposal.",
    });
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
                              Match Request from {proposal.student?.name}'s Family
                            </CardTitle>
                            <CardDescription>
                              {proposal.student?.grade} Grade • {proposal.student?.needs.join(', ')}
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
                          <p className="text-sm text-gray-600 mt-1">{proposal.student?.narrative}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {proposal.student?.needs.map(need => (
                            <Badge key={need} variant="outline">
                              {need.replace('_', ' ')}
                            </Badge>
                          ))}
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
                      {student.name} (Grade {student.grade})
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
                        <AvatarImage src={advocate.avatar_url} />
                        <AvatarFallback>
                          {advocate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{advocate.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">{advocate.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{advocate.experience_years} years</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{advocate.bio}</p>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {advocate.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${advocate.hourly_rate}/hour
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {advocate.current_caseload}/{advocate.max_caseload} cases
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {advocate.tags.slice(0, 4).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag.replace('_', ' ')}
                        </Badge>
                      ))}
                      {advocate.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{advocate.tags.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Availability</Label>
                      <Progress value={(1 - advocate.current_caseload / advocate.max_caseload) * 100} className="h-2" />
                      <span className="text-xs text-gray-500">
                        {advocate.max_caseload - advocate.current_caseload} slots available
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
                          <DialogTitle>Request Match with {advocate.name}</DialogTitle>
                          <DialogDescription>
                            Review the match details and send your request.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedStudent ? (
                          <div className="space-y-4">
                            <div>
                              <Label className="font-medium">Student</Label>
                              <p className="text-sm">{selectedStudent.name} (Grade {selectedStudent.grade})</p>
                            </div>
                            <div>
                              <Label className="font-medium">Advocate</Label>
                              <p className="text-sm">{advocate.name}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Student Needs</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedStudent.needs.map(need => (
                                  <Badge key={need} variant="outline" className="text-xs">
                                    {need.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="font-medium">Advocate Specializations</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {advocate.tags.map(tag => (
                                  <Badge 
                                    key={tag} 
                                    variant={selectedStudent.needs.includes(tag) ? "default" : "secondary"} 
                                    className="text-xs"
                                  >
                                    {tag.replace('_', ' ')}
                                    {selectedStudent.needs.includes(tag) && ' ✓'}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleCreateProposal(advocate.id)}
                              disabled={loading}
                              data-testid="button-send-match-request"
                            >
                              {loading ? 'Sending...' : 'Send Match Request'}
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