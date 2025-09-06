import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { StudentSelector } from "@/components/StudentSelector";
import { Brain, Target, Zap, MessageSquare, Star, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function SmartMatching() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("medium");
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

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
                AI-Powered Smart Matching
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our intelligent system analyzes your student's unique needs and finds the most compatible advocates. 
              Get personalized recommendations in seconds.
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
                onStudentChange={setSelectedStudent}
                placeholder="Choose a student for advocacy support..."
                allowEmpty={false}
                data-testid="student-selector"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Matching Interface */}
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
      </div>
    </DashboardLayout>
  );
}