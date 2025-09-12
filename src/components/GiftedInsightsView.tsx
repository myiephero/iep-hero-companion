import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain,
  Sparkles,
  ArrowRight,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Lightbulb,
  Target,
  Users,
  Palette,
  Download,
  Zap,
  Star,
  Calculator,
  Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/StudentSelector";

interface GiftedInsightsViewProps {
  selectedStudentId?: string;
  onStudentSelect?: (studentId: string) => void;
  students?: any[];
  isAdvocateView?: boolean;
  showStudentSelector?: boolean;
}

export const GiftedInsightsView = ({ 
  selectedStudentId, 
  onStudentSelect, 
  students,
  isAdvocateView = false,
  showStudentSelector = true 
}: GiftedInsightsViewProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing AI analysis for selected student
  const { data: existingAnalysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['/api/gifted-ai-analysis', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      const response = await apiRequest('GET', `/api/gifted_assessments/ai-insights?student_id=${selectedStudentId}`);
      return response.json();
    },
    enabled: !!selectedStudentId
  });

  // Check if student has completed other assessment tools
  const { data: studentProfile } = useQuery({
    queryKey: ['/api/gifted-profile', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      const response = await apiRequest('GET', `/api/gifted_assessments/profile?student_id=${selectedStudentId}`);
      return response.json();
    },
    enabled: !!selectedStudentId
  });

  // Generate AI insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async (studentId: string) => {
      setIsGenerating(true);
      const response = await apiRequest('POST', '/api/gifted_assessments/ai-insights', {
        student_id: studentId,
        analysis_type: 'comprehensive'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      queryClient.invalidateQueries({ queryKey: ['/api/gifted-ai-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifted-profile'] });
      toast({
        title: isAdvocateView ? "AI Insights Generated! 🧠✨" : "AI Insights Generated! 🧠✨",
        description: isAdvocateView 
          ? "Comprehensive gifted insights have been generated for advocacy planning" 
          : "Comprehensive gifted insights have been generated for your child",
      });
    },
    onError: (error) => {
      console.error('Error generating AI insights:', error);
      toast({
        title: "Error generating insights",
        description: "Please try again or ensure the student has completed other assessment tools first",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });


  const handleGenerateInsights = () => {
    if (!selectedStudentId) {
      toast({
        title: "Please select a student",
        description: "Choose a student to generate AI insights for",
        variant: "destructive",
      });
      return;
    }

    if (!hasRequiredData()) {
      toast({
        title: "Complete assessment tools first",
        description: "Please complete at least one assessment tool (Cognitive, Academic, Creative, or Leadership) before generating AI insights",
        variant: "destructive",
      });
      return;
    }

    generateInsightsMutation.mutate(selectedStudentId);
  };

  const hasRequiredData = () => {
    if (!studentProfile?.assessments) return false;
    return studentProfile.assessments.length > 0;
  };

  const getCompletionStatus = () => {
    if (!studentProfile?.assessments) return { completed: 0, total: 4, tools: [] };
    
    const assessmentTypes = studentProfile.assessments.map(a => a.assessment_type);
    const tools = [
      { name: "Cognitive", completed: assessmentTypes.includes('cognitive'), icon: Brain, color: "text-purple-600" },
      { name: "Academic", completed: assessmentTypes.includes('academic'), icon: BookOpen, color: "text-blue-600" },
      { name: "Creative", completed: assessmentTypes.includes('creative'), icon: Palette, color: "text-pink-600" },
      { name: "Leadership", completed: assessmentTypes.includes('leadership'), icon: Users, color: "text-green-600" }
    ];
    
    const completed = tools.filter(t => t.completed).length;
    return { completed, total: 4, tools };
  };

  const selectedStudentName = students?.find(s => s.id === selectedStudentId)?.full_name || "the student";
  const { completed, total, tools } = getCompletionStatus();
  const completionPercentage = Math.round((completed / total) * 100);

  // Check if there's existing analysis
  const currentAnalysis = aiAnalysis || existingAnalysis?.analyses?.[0]?.ai_analysis;

  if (!selectedStudentId && showStudentSelector) {
    return (
      <div className="text-center py-8">
        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Select a student to view AI analysis results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      {showStudentSelector && onStudentSelect && (
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
              selectedStudent={selectedStudentId || ""}
              onStudentChange={onStudentSelect || (() => {})}
              placeholder="Select student for AI insights"
            />
          </CardContent>
        </Card>
      )}

      {selectedStudentId && (
        <>
          {/* Profile Completion Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Assessment Completion Status
              </CardTitle>
              <CardDescription>
                Complete assessment tools to unlock comprehensive AI insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Assessments Completed</span>
                  <span className="text-sm font-bold text-primary">{completed} of {total}</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
                
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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
                          Complete Assessment Tools First
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                          To generate AI insights, please complete at least one of the gifted assessment tools: Cognitive, Academic, Creative, or Leadership.
                        </p>
                        {!isAdvocateView && (
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline">
                              Complete Cognitive
                            </Button>
                            <Button size="sm" variant="outline">
                              Complete Academic
                            </Button>
                            <Button size="sm" variant="outline">
                              Complete Creative
                            </Button>
                            <Button size="sm" variant="outline">
                              Complete Leadership
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generate Insights Section */}
          {hasRequiredData() && !currentAnalysis && (
            <Card className="mb-6 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950 border-orange-200 dark:border-orange-800">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ready for AI Analysis
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Generate comprehensive AI insights based on {selectedStudentName}'s completed gifted assessment tools.
                </p>
                <Button 
                  onClick={handleGenerateInsights}
                  disabled={isGenerating || !selectedStudentId}
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
                      {isAdvocateView ? 'Professional AI Analysis Complete!' : 'AI Analysis Complete!'}
                    </h3>
                    <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      Generated {existingAnalysis?.analyses?.[0]?.timestamp ? new Date(existingAnalysis.analyses[0].timestamp).toLocaleDateString() : 'Recently'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Comprehensive gifted insights have been generated for {selectedStudentName}. Review the detailed analysis and recommendations below.
                  </p>
                </CardContent>
              </Card>

              {/* Dynamic AI Analysis Sections */}
              {typeof currentAnalysis === 'object' && currentAnalysis !== null && 
                Object.entries(currentAnalysis).map(([sectionKey, sectionValue], index) => {
                  // Skip empty or null values
                  if (!sectionValue) return null;

                  // Get appropriate icon and color based on section name/content
                  const getSectionIcon = (key: string) => {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey.includes('progress') || lowerKey.includes('monitoring')) return { icon: Target, color: 'text-purple-600' };
                    if (lowerKey.includes('assessment') || lowerKey.includes('data')) return { icon: Brain, color: 'text-blue-600' };
                    if (lowerKey.includes('accommodation') || lowerKey.includes('strategy')) return { icon: Lightbulb, color: 'text-yellow-600' };
                    if (lowerKey.includes('goal') || lowerKey.includes('recommendation')) return { icon: BookOpen, color: 'text-green-600' };
                    if (lowerKey.includes('need') || lowerKey.includes('additional')) return { icon: AlertCircle, color: 'text-orange-600' };
                    if (lowerKey.includes('intervention') || lowerKey.includes('evidence')) return { icon: Star, color: 'text-indigo-600' };
                    if (lowerKey.includes('social') || lowerKey.includes('emotional')) return { icon: Users, color: 'text-pink-600' };
                    return { icon: CheckCircle, color: 'text-gray-600' };
                  };

                  const { icon: IconComponent, color } = getSectionIcon(sectionKey);

                  // Format section title
                  const formatSectionTitle = (key: string) => {
                    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  };

                  // Render different content types
                  const renderSectionContent = (value: any) => {
                    if (typeof value === 'string') {
                      return (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <p className="text-muted-foreground whitespace-pre-wrap">{value}</p>
                        </div>
                      );
                    }

                    if (Array.isArray(value)) {
                      return (
                        <ul className="space-y-2 text-sm">
                          {value.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <ArrowRight className={`h-3 w-3 ${color} mt-1 flex-shrink-0`} />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    if (typeof value === 'object' && value !== null) {
                      return (
                        <div className="space-y-3">
                          {Object.entries(value).map(([subKey, subValue], subIndex) => (
                            <div key={subIndex}>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                {formatSectionTitle(subKey)}
                              </h4>
                              {Array.isArray(subValue) ? (
                                <ul className="space-y-1 text-sm ml-4">
                                  {subValue.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <ArrowRight className={`h-3 w-3 ${color} mt-1 flex-shrink-0`} />
                                      <span className="text-muted-foreground">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground text-sm ml-4 whitespace-pre-wrap">
                                  {String(subValue)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <p className="text-muted-foreground text-sm">
                        {String(value)}
                      </p>
                    );
                  };

                  return (
                    <Card key={sectionKey} data-testid={`analysis-section-${sectionKey.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className={`h-5 w-5 ${color}`} />
                          {formatSectionTitle(sectionKey)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderSectionContent(sectionValue)}
                      </CardContent>
                    </Card>
                  );
                })}
              
              {/* Fallback message if no analysis content */}
              {(!currentAnalysis || (typeof currentAnalysis === 'object' && Object.keys(currentAnalysis).length === 0)) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No analysis content available. Please try generating the AI insights again.
                    </p>
                  </CardContent>
                </Card>
              )}

            </div>
          )}
        </>
      )}
    </div>
  );
};