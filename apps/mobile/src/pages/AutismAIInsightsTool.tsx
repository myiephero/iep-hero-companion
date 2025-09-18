import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Lightbulb,
  Target,
  Users,
  Volume2,
  Download,
  Zap,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/StudentSelector";

const AutismAIInsightsTool = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students from API
  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return response.json();
    },
  });

  // Fetch existing AI analysis for selected student
  const { data: existingAnalysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['/api/autism-ai-analysis', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return null;
      const response = await apiRequest('GET', `/api/autism-ai-analysis?student_id=${selectedStudent}`);
      return response.json();
    },
    enabled: !!selectedStudent
  });

  // Check if student has completed other tools
  const { data: studentProfile } = useQuery({
    queryKey: ['/api/autism-profile', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return null;
      const response = await apiRequest('GET', `/api/autism_accommodations/profile?student_id=${selectedStudent}`);
      return response.json();
    },
    enabled: !!selectedStudent
  });

  // Generate AI insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async (studentId: string) => {
      setIsGenerating(true);
      const response = await apiRequest('POST', '/api/autism_accommodations/ai-insights', {
        student_id: studentId,
        analysis_type: 'comprehensive'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      setAnalysisComplete(true);
      queryClient.invalidateQueries({ queryKey: ['/api/autism-ai-analysis'] });
      toast({
        title: "AI Insights Generated! 🧠✨",
        description: "Comprehensive autism insights have been generated for your child",
      });
    },
    onError: (error) => {
      console.error('Error generating AI insights:', error);
      toast({
        title: "Error generating insights",
        description: "Please try again or ensure the student has completed other autism tools first",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const handleGenerateInsights = () => {
    if (!selectedStudent) {
      toast({
        title: "Please select a student",
        description: "Choose a student to generate AI insights for",
        variant: "destructive",
      });
      return;
    }

    if (!hasRequiredData()) {
      toast({
        title: "Complete other tools first",
        description: "Please complete at least one accommodation tool (Sensory, Communication, or Behavioral) before generating AI insights",
        variant: "destructive",
      });
      return;
    }

    generateInsightsMutation.mutate(selectedStudent);
  };

  const hasRequiredData = () => {
    return studentProfile?.sensory_accommodations?.length > 0 || 
           studentProfile?.communication_accommodations?.length > 0 || 
           studentProfile?.behavioral_accommodations?.length > 0;
  };

  const getCompletionStatus = () => {
    if (!studentProfile) return { completed: 0, total: 3, tools: [] };
    
    const tools = [
      { name: "Sensory", completed: (studentProfile.sensory_accommodations?.length || 0) > 0, icon: Volume2 },
      { name: "Communication", completed: (studentProfile.communication_accommodations?.length || 0) > 0, icon: Users },
      { name: "Behavioral", completed: (studentProfile.behavioral_accommodations?.length || 0) > 0, icon: Target }
    ];
    
    const completed = tools.filter(t => t.completed).length;
    return { completed, total: 3, tools };
  };

  const selectedStudentName = students?.find(s => s.id === selectedStudent)?.full_name || "your child";
  const { completed, total, tools } = getCompletionStatus();
  const completionPercentage = Math.round((completed / total) * 100);

  // Check if there's existing analysis
  const currentAnalysis = aiAnalysis || existingAnalysis?.analyses?.[0]?.ai_analysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full mb-4">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Autism Insights
            </h1>
            <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold">
              <Sparkles className="h-3 w-3 mr-1" />
              NEW
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive AI-powered insights and recommendations based on {selectedStudentName}'s autism profile. Our advanced analysis provides evidence-based strategies and personalized recommendations.
          </p>
        </div>

        {/* Student Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600" />
              Student Selection
            </CardTitle>
            <CardDescription>
              Choose the student to generate AI insights for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student for AI insights"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Profile Completion Status */}
        {selectedStudent && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Profile Completion Status
              </CardTitle>
              <CardDescription>
                Complete other autism tools to unlock comprehensive AI insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Tools Completed</span>
                  <span className="text-sm font-bold text-primary">{completed} of {total}</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
                
                <div className="grid gap-3 md:grid-cols-3">
                  {tools.map((tool) => (
                    <Card key={tool.name} className={`p-3 ${tool.completed ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-muted/30'}`}>
                      <div className="flex items-center gap-2">
                        <tool.icon className={`h-4 w-4 ${tool.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{tool.name}</span>
                        {tool.completed ? (
                          <CheckCircle className="h-3 w-3 text-green-600 ml-auto" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground ml-auto" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {!hasRequiredData() && (
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                          Complete Other Tools First
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          To generate AI insights, please complete at least one of the autism accommodation tools: Sensory, Communication, or Behavioral.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button asChild size="sm" variant="outline">
                            <Link to="/parent/autism-tools/sensory">Complete Sensory Tool</Link>
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <Link to="/parent/autism-tools/communication">Complete Communication Tool</Link>
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <Link to="/parent/autism-tools/behavioral">Complete Behavioral Tool</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Insights Section */}
        {hasRequiredData() && !currentAnalysis && (
          <Card className="mb-6 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950 border-orange-200 dark:border-orange-800">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready for AI Analysis
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Generate comprehensive AI insights based on {selectedStudentName}'s completed autism profile tools.
              </p>
              <Button 
                onClick={handleGenerateInsights}
                disabled={isGenerating || !selectedStudent}
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                data-testid="button-generate-insights"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Generating Insights...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate AI Insights
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AI Analysis Results */}
        {currentAnalysis && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Analysis Complete!
                  </h3>
                  <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    Generated {existingAnalysis?.analyses?.[0]?.timestamp ? new Date(existingAnalysis.analyses[0].timestamp).toLocaleDateString() : 'Recently'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Comprehensive autism insights have been generated for {selectedStudentName}. Review the detailed analysis and recommendations below.
                </p>
              </CardContent>
            </Card>

            {/* Key Findings */}
            {currentAnalysis.key_findings && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Key Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentAnalysis.key_findings.map((finding: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analysis */}
            {currentAnalysis.detailed_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Detailed Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {currentAnalysis.detailed_analysis}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Environmental Modifications */}
              {currentAnalysis.environmental_modifications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Volume2 className="h-4 w-4 text-blue-600" />
                      Environmental Modifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {currentAnalysis.environmental_modifications.map((mod: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Visual Supports */}
              {currentAnalysis.visual_supports && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Eye className="h-4 w-4 text-green-600" />
                      Visual Supports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {currentAnalysis.visual_supports.map((support: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{support}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Self-Regulation Strategies */}
              {currentAnalysis.self_regulation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="h-4 w-4 text-purple-600" />
                      Self-Regulation Strategies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {currentAnalysis.self_regulation.map((strategy: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-600 mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Social Strengths */}
              {currentAnalysis.social_strengths && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4 text-pink-600" />
                      Social Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {currentAnalysis.social_strengths.map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 text-pink-600 mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Evidence Base */}
            {currentAnalysis.evidence_base && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Evidence-Based Foundation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {currentAnalysis.evidence_base}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-6 border-t">
          <Button asChild variant="ghost" data-testid="button-back-to-autism-hub">
            <Link to="/parent/autism-tools" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Autism Tools
            </Link>
          </Button>
          
          {currentAnalysis && (
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => {
                  // Generate downloadable report
                  const reportContent = `Autism AI Insights Report for ${selectedStudentName}\n\n` +
                    `Generated: ${new Date().toLocaleDateString()}\n\n` +
                    `${currentAnalysis.detailed_analysis || ''}\n\n` +
                    `Key Findings:\n${(currentAnalysis.key_findings || []).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}`;
                  
                  const blob = new Blob([reportContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedStudentName}-autism-ai-insights-${new Date().toISOString().split('T')[0]}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                data-testid="button-download-report"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              
              <Button asChild data-testid="button-view-accommodations">
                <Link to="/parent/students" className="flex items-center gap-2">
                  View in Student Profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutismAIInsightsTool;