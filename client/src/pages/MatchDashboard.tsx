import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MessageSquare,
  User,
  Award
} from 'lucide-react';
import { useAuth, supabase } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

interface MatchProposal {
  id: string;
  student_id: string;
  advocate_id: string;
  status: 'proposed' | 'intro_requested' | 'scheduled' | 'accepted' | 'declined';
  score: number;
  reason: any;
  created_at: string;
  updated_at: string;
  students: {
    id: string;
    name: string;
    grade: number;
    needs: string[];
    languages: string[];
    timezone: string;
    budget?: number;
    narrative?: string;
  };
  advocates: {
    id: string;
    tags: string[];
    languages: string[];
    timezone: string;
    hourly_rate?: number;
    bio?: string;
    experience_years?: number;
  };
  profiles: {
    id: string;
    name: string;
    email: string;
  };
}

interface Student {
  id: string;
  name: string;
  grade: number;
  needs: string[];
  languages: string[];
  timezone: string;
  budget?: number;
  narrative?: string;
}

interface Advocate {
  id: string;
  tags: string[];
  languages: string[];
  timezone: string;
  hourly_rate?: number;
  bio?: string;
  experience_years?: number;
}

interface SuggestedMatch {
  advocate: Advocate;
  score: number;
  breakdown: any;
}

export default function MatchDashboard() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedStudentId = searchParams.get('student');
  
  const [proposals, setProposals] = useState<MatchProposal[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Intro dialog state
  const [introDialog, setIntroDialog] = useState<{ open: boolean; proposalId: string }>({
    open: false,
    proposalId: ''
  });
  const [introData, setIntroData] = useState({
    when_ts: '',
    channel: 'zoom',
    link: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      setSelectedStudent(selectedStudentId);
      loadSuggestions(selectedStudentId);
    }
  }, [selectedStudentId, students]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('match_proposals')
        .select(`
          *,
          students:student_id (
            id, name, grade, needs, languages, timezone, budget, narrative
          ),
          advocates:advocate_id (
            id, tags, languages, timezone, hourly_rate, bio, experience_years
          ),
          profiles:created_by (
            id, name, email
          )
        `)
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;
      setProposals(proposalsData || []);

      // Load students if parent
      if (profile?.role === 'parent') {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false });

        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async (studentId: string) => {
    if (!studentId) return;
    
    try {
      setLoadingSuggestions(true);
      
      // Get student details
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      // Get advocates and calculate scores
      const { data: advocates, error } = await supabase
        .from('advocate_profiles')
        .select('*');

      if (error) throw error;

      // Calculate scores for each advocate
      const scored: SuggestedMatch[] = [];
      
      for (const advocate of advocates || []) {
        const score = calculateMatchScore(student, advocate);
        scored.push({
          advocate,
          score: score.total,
          breakdown: score.breakdown
        });
      }

      // Sort by score and take top matches
      scored.sort((a, b) => b.score - a.score);
      setSuggestions(scored.slice(0, 8));
      
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Failed to load advocate suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const calculateMatchScore = (student: Student, advocate: Advocate) => {
    const weights = {
      tag_overlap: 0.45,
      grade_area_fit: 0.15,
      capacity_available: 0.15,
      language_match: 0.10,
      price_fit: 0.10,
      timezone_compatibility: 0.05
    };

    const breakdown: any = {};
    
    // Tag overlap (Jaccard similarity)
    const studentTags = new Set(student.needs || []);
    const advocateTags = new Set(advocate.tags || []);
    const intersection = new Set([...studentTags].filter(x => advocateTags.has(x)));
    const union = new Set([...studentTags, ...advocateTags]);
    const tagSimilarity = union.size > 0 ? intersection.size / union.size : 0;
    breakdown.tag_overlap = tagSimilarity * weights.tag_overlap;

    // Language match
    const studentLangs = new Set(student.languages || []);
    const advocateLangs = new Set(advocate.languages || []);
    const langIntersection = new Set([...studentLangs].filter(x => advocateLangs.has(x)));
    const langSimilarity = studentLangs.size > 0 ? langIntersection.size / studentLangs.size : 0;
    breakdown.language_match = langSimilarity * weights.language_match;

    // Grade/area fit (simplified)
    breakdown.grade_area_fit = 1.0 * weights.grade_area_fit;

    // Capacity (simplified - assume available)
    breakdown.capacity_available = 1.0 * weights.capacity_available;

    // Price fit
    let priceScore = 1.0;
    if (student.budget && advocate.hourly_rate) {
      if (advocate.hourly_rate <= student.budget) {
        priceScore = 1.0;
      } else if (advocate.hourly_rate <= student.budget * 1.2) {
        priceScore = 0.7;
      } else {
        priceScore = 0.3;
      }
    }
    breakdown.price_fit = priceScore * weights.price_fit;

    // Timezone compatibility
    const timezoneScore = student.timezone === advocate.timezone ? 1.0 : 0.5;
    breakdown.timezone_compatibility = timezoneScore * weights.timezone_compatibility;

    const total = Object.values(breakdown).reduce((sum: number, score: any) => sum + score, 0) * 100;

    return {
      total: Math.min(100, Math.max(0, total)),
      breakdown
    };
  };

  const createProposal = async (studentId: string, advocateId: string) => {
    try {
      setActionLoading(advocateId);
      
      const response = await axios.post('/api/match/propose', {
        student_id: studentId,
        advocate_ids: [advocateId],
        reason: {
          source: 'dashboard_selection',
          timestamp: new Date().toISOString()
        }
      }, {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.data.extracted_tags?.length > 0) {
        toast.success(`Match request sent! AI extracted additional tags: ${response.data.extracted_tags.join(', ')}`);
      } else {
        toast.success('Match request sent successfully!');
      }
      
      loadData(); // Refresh proposals
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Failed to send match request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProposalAction = async (proposalId: string, action: string, data?: any) => {
    try {
      setActionLoading(proposalId);
      
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      let response;
      switch (action) {
        case 'accept':
          response = await axios.post(`/api/match/${proposalId}/accept`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'decline':
          response = await axios.post(`/api/match/${proposalId}/decline`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'intro':
          response = await axios.post(`/api/match/${proposalId}/intro`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
      }
      
      toast.success(`Action ${action} completed successfully!`);
      loadData(); // Refresh data
    } catch (error) {
      console.error(`Error ${action} proposal:`, error);
      toast.error(`Failed to ${action} proposal`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleIntroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProposalAction(introDialog.proposalId, 'intro', introData);
    setIntroDialog({ open: false, proposalId: '' });
    setIntroData({ when_ts: '', channel: 'zoom', link: '', notes: '' });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      proposed: "bg-yellow-100 text-yellow-800 border-yellow-200",
      intro_requested: "bg-blue-100 text-blue-800 border-blue-200",
      scheduled: "bg-purple-100 text-purple-800 border-purple-200",
      accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
      declined: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status as keyof typeof colors] || "bg-slate-100 text-slate-800 border-slate-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Advocate Matching</h1>
        <p className="text-xl text-slate-600">
          Connect with the right advocates for your students
        </p>
      </div>

      <Tabs defaultValue={profile?.role === 'parent' ? 'matches' : 'opportunities'} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matches" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>My Matches</span>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Opportunities</span>
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Discover</span>
          </TabsTrigger>
        </TabsList>

        {/* My Matches Tab - Shows proposals from parent perspective */}
        <TabsContent value="matches" className="space-y-6">
          <div className="space-y-4">
            {proposals.filter(p => 
              profile?.role === 'parent' ? p.students?.id : p.advocate_id === user?.id
            ).length === 0 ? (
              <Card className="text-center p-8">
                <CardContent className="space-y-4">
                  <Users className="w-16 h-16 text-slate-400 mx-auto" />
                  <div>
                    <CardTitle className="text-xl text-slate-700 mb-2">No matches yet</CardTitle>
                    <p className="text-slate-600">
                      {profile?.role === 'parent' 
                        ? "Start by discovering advocates for your students"
                        : "New matching opportunities will appear here"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {proposals.filter(p => 
                  profile?.role === 'parent' ? p.students?.id : p.advocate_id === user?.id
                ).map((proposal) => (
                  <Card key={proposal.id} className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center space-x-3">
                            <span className="text-lg text-slate-900">
                              {proposal.students?.name}
                            </span>
                            <Badge className={getStatusColor(proposal.status)}>
                              {proposal.status.replace('_', ' ')}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Grade {proposal.students?.grade} • Score: {proposal.score.toFixed(0)}% • 
                            Created {new Date(proposal.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="text-lg font-bold text-slate-900">{proposal.score.toFixed(0)}%</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {proposal.students?.needs?.map((need) => (
                          <Badge key={need} variant="secondary" className="bg-emerald-50 text-emerald-700">
                            {need}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions based on role and status */}
                      {profile?.role === 'advocate' && proposal.status === 'proposed' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIntroDialog({ open: true, proposalId: proposal.id });
                            }}
                            disabled={actionLoading === proposal.id}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Request Intro
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleProposalAction(proposal.id, 'accept')}
                            disabled={actionLoading === proposal.id}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProposalAction(proposal.id, 'decline')}
                            disabled={actionLoading === proposal.id}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {proposal.status === 'accepted' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                          <p className="text-sm text-emerald-800 font-medium">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Match accepted! You can now start working together.
                          </p>
                        </div>
                      )}

                      {proposal.status === 'scheduled' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-sm text-purple-800 font-medium">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Intro call scheduled
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Opportunities Tab - Same as My Matches but different filtering */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="space-y-4">
            {proposals.filter(p => 
              profile?.role === 'advocate' ? p.advocate_id === user?.id : p.students?.id
            ).length === 0 ? (
              <Card className="text-center p-8">
                <CardContent className="space-y-4">
                  <Award className="w-16 h-16 text-slate-400 mx-auto" />
                  <div>
                    <CardTitle className="text-xl text-slate-700 mb-2">No opportunities yet</CardTitle>
                    <p className="text-slate-600">
                      New matching opportunities will appear here when parents request matches
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {proposals.filter(p => 
                  profile?.role === 'advocate' ? p.advocate_id === user?.id : p.students?.id
                ).map((proposal) => (
                  <Card key={proposal.id} className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center space-x-3">
                            <span className="text-lg text-slate-900">
                              New Opportunity: {proposal.students?.name}
                            </span>
                            <Badge className={getStatusColor(proposal.status)}>
                              {proposal.status.replace('_', ' ')}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Grade {proposal.students?.grade} • Score: {proposal.score.toFixed(0)}% • 
                            Received {new Date(proposal.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="text-lg font-bold text-slate-900">{proposal.score.toFixed(0)}%</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {proposal.students?.needs?.map((need) => (
                          <Badge key={need} variant="secondary" className="bg-blue-50 text-blue-700">
                            {need}
                          </Badge>
                        ))}
                      </div>

                      {proposal.students?.budget && (
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Budget:</span> ${proposal.students.budget}/hour
                        </p>
                      )}

                      {/* Action buttons for advocates */}
                      {profile?.role === 'advocate' && proposal.status === 'proposed' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIntroDialog({ open: true, proposalId: proposal.id });
                            }}
                            disabled={actionLoading === proposal.id}
                            className="flex-1"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Request Intro Call
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleProposalAction(proposal.id, 'accept')}
                            disabled={actionLoading === proposal.id}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept Match
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProposalAction(proposal.id, 'decline')}
                            disabled={actionLoading === proposal.id}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Discover Tab - Find new advocates */}
        <TabsContent value="discover" className="space-y-6">
          {profile?.role === 'parent' && (
            <>
              {/* Student Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Find Advocates</CardTitle>
                  <CardDescription>
                    Select a student to see matching advocate suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedStudent} onValueChange={(value) => {
                    setSelectedStudent(value);
                    loadSuggestions(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} (Grade {student.grade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Suggestions */}
              {selectedStudent && (
                <>
                  {loadingSuggestions ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                        <p className="mt-2 text-slate-600">Finding the best advocates...</p>
                      </div>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <Card className="text-center p-8">
                      <CardContent>
                        <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <CardTitle className="text-xl text-slate-700 mb-2">No advocates found</CardTitle>
                        <p className="text-slate-600">
                          We couldn't find any advocates matching your criteria right now.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {suggestions.map(({ advocate, score, breakdown }) => (
                        <Card key={advocate.id} className="hover:shadow-lg transition-all duration-200">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-blue-500">
                                  <AvatarFallback className="text-white font-semibold">
                                    {advocate.id.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg text-slate-900">
                                    Advocate {advocate.id.slice(-4)}
                                  </CardTitle>
                                  <CardDescription>
                                    {advocate.experience_years} years • {advocate.timezone}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                                  <span className="text-lg font-bold text-slate-900">{score.toFixed(0)}%</span>
                                </div>
                                <p className="text-sm text-slate-600">Match Score</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {advocate.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="bg-emerald-50 text-emerald-700">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {advocate.hourly_rate && (
                              <p className="text-sm text-slate-700">
                                <span className="font-medium">${advocate.hourly_rate}/hour</span>
                              </p>
                            )}

                            {advocate.bio && (
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {advocate.bio}
                              </p>
                            )}

                            <Button
                              onClick={() => createProposal(selectedStudent, advocate.id)}
                              disabled={actionLoading === advocate.id}
                              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
                            >
                              {actionLoading === advocate.id ? 'Requesting...' : 'Request Match'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {profile?.role === 'advocate' && (
            <Card className="text-center p-8">
              <CardContent>
                <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-slate-700 mb-2">Advocate Dashboard</CardTitle>
                <p className="text-slate-600">
                  Check the "Opportunities" tab for new match requests from parents.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Intro Call Dialog */}
      <Dialog open={introDialog.open} onOpenChange={(open) => setIntroDialog({ ...introDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Intro Call</DialogTitle>
            <DialogDescription>
              Schedule or request an introductory call with the parent
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIntroSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="when_ts">Proposed Date & Time (optional)</Label>
              <Input
                id="when_ts"
                type="datetime-local"
                value={introData.when_ts}
                onChange={(e) => setIntroData({ ...introData, when_ts: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Meeting Platform</Label>
              <Select value={introData.channel} onValueChange={(value) => setIntroData({ ...introData, channel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Meeting Link (optional)</Label>
              <Input
                id="link"
                placeholder="https://zoom.us/j/..."
                value={introData.link}
                onChange={(e) => setIntroData({ ...introData, link: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or questions..."
                value={introData.notes}
                onChange={(e) => setIntroData({ ...introData, notes: e.target.value })}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                {introData.when_ts ? 'Schedule Call' : 'Request Call'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIntroDialog({ open: false, proposalId: '' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}