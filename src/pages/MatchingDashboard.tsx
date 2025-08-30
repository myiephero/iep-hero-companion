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
  status: 'pending' | 'scheduled' | 'accepted' | 'declined';
  created_at: string;
  reason?: any;
  student?: Student;
  advocate?: Advocate;
}

export default function MatchingDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [proposals, setProposals] = useState<MatchProposal[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const { toast } = useToast();

  // Mock data - replace with API calls
  useEffect(() => {
    // Mock students
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

    // Mock advocates
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
      }
    ]);
  }, []);

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

    try {
      const response = await fetch('/api/match/propose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          advocate_ids: [advocateId],
          reason: { manual_match: true }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create proposal');
      }

      const result = await response.json();

      toast({
        title: "Match Proposal Sent",
        description: "Your proposal has been sent to the advocate for review.",
      });

      // Refresh proposals
      fetchProposals();
      setActiveTab('proposals');

    } catch (error) {
      console.error('Proposal error:', error);
      toast({
        title: "Error",
        description: "Failed to create match proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/match');
      if (response.ok) {
        const data = await response.json();
        setProposals(data.proposals || []);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const handleIntroRequest = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/match/${proposalId}/intro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'zoom',
          notes: 'Looking forward to discussing this match opportunity'
        }),
      });

      if (response.ok) {
        toast({
          title: "Intro Call Requested",
          description: "The advocate has been notified of your intro call request.",
        });
        fetchProposals();
      }
    } catch (error) {
      console.error('Intro request error:', error);
      toast({
        title: "Error",
        description: "Failed to request intro call.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const specialties = ['autism', 'adhd', 'gifted', 'speech', 'behavioral', 'executive_function', 'twice_exceptional'];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advocate Matching</h1>
        <p className="text-lg text-gray-600">
          Find and connect with the perfect advocate for your child's needs
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Advocates</TabsTrigger>
          <TabsTrigger value="proposals">My Proposals</TabsTrigger>
          <TabsTrigger value="matches">Active Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Advocates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, specialties, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-[200px]">
              <Label htmlFor="specialty-filter">Filter by Specialty</Label>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger id="specialty-filter">
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[200px]">
              <Label htmlFor="student-select">Select Student</Label>
              <Select value={selectedStudent?.id || ''} onValueChange={(value) => {
                const student = students.find(s => s.id === value);
                setSelectedStudent(student || null);
              }}>
                <SelectTrigger id="student-select">
                  <SelectValue placeholder="Choose student" />
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAdvocates.map((advocate) => (
              <Card key={advocate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={advocate.avatar_url} />
                        <AvatarFallback>{advocate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
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
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">{advocate.bio}</p>
                  
                  <div className="space-y-2">
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
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Specialties</Label>
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
                      <Button className="w-full" disabled={!selectedStudent}>
                        Request Match
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Request Match with {advocate.name}</DialogTitle>
                        <DialogDescription>
                          Review the match details before sending your proposal
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedStudent && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-medium">Student</Label>
                              <p className="text-sm">{selectedStudent.name} (Grade {selectedStudent.grade})</p>
                            </div>
                            <div>
                              <Label className="font-medium">Advocate</Label>
                              <p className="text-sm">{advocate.name}</p>
                            </div>
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
                            <Label className="font-medium">Advocate Specialties</Label>
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

                          <div className="flex justify-end space-x-2">
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogTrigger>
                            <Button 
                              onClick={() => handleCreateProposal(advocate.id)}
                              disabled={loading}
                            >
                              {loading ? 'Sending...' : 'Send Match Request'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Match Proposals</h2>
            <Button onClick={fetchProposals} variant="outline">
              Refresh
            </Button>
          </div>

          {proposals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals yet</h3>
                <p className="text-gray-600 mb-4">
                  Browse advocates and send match requests to get started
                </p>
                <Button onClick={() => setActiveTab('browse')}>
                  Browse Advocates
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {proposal.student?.name} × {proposal.advocate?.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-xl font-bold ${getScoreColor(proposal.score)}`}>
                            {proposal.score}% match
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          proposal.status === 'accepted' ? 'default' :
                          proposal.status === 'scheduled' ? 'secondary' : 'outline'
                        }
                      >
                        {proposal.status}
                      </Badge>
                    </div>

                    <div className="flex justify-end space-x-2">
                      {proposal.status === 'pending' && (
                        <Button 
                          onClick={() => handleIntroRequest(proposal.id)}
                          variant="outline"
                          size="sm"
                        >
                          Request Intro Call
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active matches</h3>
              <p className="text-gray-600">
                Once your proposals are accepted, they'll appear here as active matches
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}