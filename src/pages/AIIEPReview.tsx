import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentUpload } from "@/components/DocumentUpload";
import { StudentSelector } from "@/components/StudentSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText, CheckCircle, AlertCircle, TrendingUp, Target, Users, Clock, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, type AIReview } from "@/lib/api";

const reviewTypes = [
  { value: 'iep', label: 'IEP Document Review', description: 'Comprehensive analysis of IEP documents' },
  { value: 'accommodation', label: 'Accommodation Analysis', description: 'Review accommodation effectiveness' },
  { value: 'meeting_prep', label: 'Meeting Preparation', description: 'Prepare for IEP meetings' },
  { value: 'goal_analysis', label: 'Goal Analysis', description: 'Analyze IEP goals and progress' },
  { value: 'compliance_check', label: 'Compliance Check', description: 'Check legal compliance requirements' }
];

export default function AIIEPReview() {
  const [reviews, setReviews] = useState<AIReview[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedReviewType, setSelectedReviewType] = useState<string>("iep");
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({});
  
  const { toast } = useToast();

  const toggleSection = (reviewId: string, section: string) => {
    const key = `${reviewId}-${section}`;
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSectionCollapsed = (reviewId: string, section: string) => {
    const key = `${reviewId}-${section}`;
    return collapsedSections[key] || false;
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedStudent]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Use new API to fetch reviews
      const reviewsData = await api.getAIReviews();
      
      // Filter by student if selected
      const filteredReviews = selectedStudent 
        ? reviewsData.filter(review => review.student_id === selectedStudent)
        : reviewsData;

      setReviews(filteredReviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load AI reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const getComplianceColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI IEP Review</h1>
          <p className="text-muted-foreground">
            Upload IEP documents and receive AI-powered analysis, recommendations, and compliance insights.
          </p>
        </div>

        {/* Student and Review Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Student</CardTitle>
              <CardDescription>
                Choose a student to associate with this review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentSelector
                selectedStudent={selectedStudent || ""}
                onStudentChange={(id) => setSelectedStudent(id || "")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Type</CardTitle>
              <CardDescription>
                Select the type of analysis to perform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedReviewType} onValueChange={setSelectedReviewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reviewTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Upload Document for AI Analysis
            </CardTitle>
            <CardDescription>
              Upload an IEP document, evaluation report, or related document for AI-powered analysis.
              The analysis results will appear below after processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload
              onAnalysisComplete={(analysis) => {
                toast({
                  title: "Analysis Complete",
                  description: "Your document has been analyzed successfully!",
                });
                fetchReviews();
              }}
            />
          </CardContent>
        </Card>

        {/* Reviews Display */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">AI Review Results</h2>
            <Badge variant="outline">
              {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">
                  Upload a document above to get started with AI-powered IEP analysis.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {review.documents?.title || 'Document Review'}
                        </CardTitle>
                        <CardDescription>
                          {reviewTypes.find(t => t.value === review.review_type)?.label} • 
                          {new Date(review.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(review.priority_level)}>
                          {review.priority_level ? (review.priority_level.charAt(0).toUpperCase() + review.priority_level.slice(1)) : 'Unknown'} Priority
                        </Badge>
                        {review.compliance_score && (
                          <Badge variant="outline" className={getComplianceColor(review.compliance_score)}>
                            {review.compliance_score}% Compliant
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {review.compliance_score && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Compliance Score</span>
                          <span className={getComplianceColor(review.compliance_score)}>
                            {review.compliance_score}%
                          </span>
                        </div>
                        <Progress value={review.compliance_score} className="h-2" />
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs defaultValue="analysis" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="analysis">Executive Summary</TabsTrigger>
                        <TabsTrigger value="recommendations">Key Recommendations</TabsTrigger>
                        <TabsTrigger value="concerns">Areas of Concern</TabsTrigger>
                        <TabsTrigger value="strengths">Identified Strengths</TabsTrigger>
                        <TabsTrigger value="actions">Next Steps & Action Items</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="analysis" className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              Executive Summary
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection(review.id || '', 'analysis')}
                              className="h-8 w-8 p-0"
                            >
                              {isSectionCollapsed(review.id || '', 'analysis') ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {!isSectionCollapsed(review.id || '', 'analysis') && (
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-sm leading-relaxed">
                                {(() => {
                                  try {
                                    console.log('Raw ai_analysis:', review.ai_analysis);
                                    const parsedAnalysis = typeof review.ai_analysis === 'string' 
                                      ? JSON.parse(review.ai_analysis) 
                                      : review.ai_analysis;
                                    console.log('Parsed analysis:', parsedAnalysis);
                                    return parsedAnalysis?.summary || parsedAnalysis?.executive_summary || 'No summary available';
                                  } catch (error) {
                                    console.log('Parse error:', error);
                                    return typeof review.ai_analysis === 'string' 
                                      ? review.ai_analysis 
                                      : 'Analysis not available';
                                  }
                                })()}
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="recommendations" className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Key Recommendations
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection(review.id || '', 'recommendations')}
                              className="h-8 w-8 p-0"
                            >
                              {isSectionCollapsed(review.id || '', 'recommendations') ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {!isSectionCollapsed(review.id || '', 'recommendations') && (
                            <div>
                              {(() => {
                                try {
                                  const parsedAnalysis = typeof review.ai_analysis === 'string' 
                                    ? JSON.parse(review.ai_analysis) 
                                    : review.ai_analysis;
                                  const recommendations = parsedAnalysis?.recommendations || review.recommendations;
                                  
                                  if (recommendations && Array.isArray(recommendations)) {
                                    return (
                                      <ul className="space-y-2">
                                        {recommendations.map((rec: any, index: number) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{typeof rec === 'string' ? rec : rec.text || rec}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  } else {
                                    return <p className="text-sm text-muted-foreground">No specific recommendations provided.</p>;
                                  }
                                } catch {
                                  return <p className="text-sm text-muted-foreground">No specific recommendations provided.</p>;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="concerns" className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Areas of Concern
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection(review.id || '', 'concerns')}
                              className="h-8 w-8 p-0"
                            >
                              {isSectionCollapsed(review.id || '', 'concerns') ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {!isSectionCollapsed(review.id || '', 'concerns') && (
                            <div>
                              {(() => {
                                try {
                                  const parsedAnalysis = typeof review.ai_analysis === 'string' 
                                    ? JSON.parse(review.ai_analysis) 
                                    : review.ai_analysis;
                                  const concerns = parsedAnalysis?.areas_of_concern || review.areas_of_concern;
                                  
                                  if (concerns && Array.isArray(concerns)) {
                                    return (
                                      <ul className="space-y-2">
                                        {concerns.map((concern: any, index: number) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{typeof concern === 'string' ? concern : concern.text || concern}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  } else {
                                    return <p className="text-sm text-muted-foreground">No significant concerns identified.</p>;
                                  }
                                } catch {
                                  return <p className="text-sm text-muted-foreground">No significant concerns identified.</p>;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="strengths" className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Identified Strengths
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection(review.id || '', 'strengths')}
                              className="h-8 w-8 p-0"
                            >
                              {isSectionCollapsed(review.id || '', 'strengths') ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {!isSectionCollapsed(review.id || '', 'strengths') && (
                            <div>
                              {(() => {
                                try {
                                  const parsedAnalysis = typeof review.ai_analysis === 'string' 
                                    ? JSON.parse(review.ai_analysis) 
                                    : review.ai_analysis;
                                  const strengths = parsedAnalysis?.strengths || review.strengths;
                                  
                                  if (strengths && Array.isArray(strengths)) {
                                    return (
                                      <ul className="space-y-2">
                                        {strengths.map((strength: any, index: number) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{typeof strength === 'string' ? strength : strength.text || strength}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  } else {
                                    return <p className="text-sm text-muted-foreground">No specific strengths highlighted.</p>;
                                  }
                                } catch {
                                  return <p className="text-sm text-muted-foreground">No specific strengths highlighted.</p>;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="actions" className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Next Steps & Action Items
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection(review.id || '', 'actions')}
                              className="h-8 w-8 p-0"
                            >
                              {isSectionCollapsed(review.id || '', 'actions') ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {!isSectionCollapsed(review.id || '', 'actions') && (
                            <div>
                              {(() => {
                                try {
                                  const parsedAnalysis = typeof review.ai_analysis === 'string' 
                                    ? JSON.parse(review.ai_analysis) 
                                    : review.ai_analysis;
                                  const actionItems = parsedAnalysis?.action_items || review.action_items;
                                  
                                  if (actionItems && Array.isArray(actionItems)) {
                                    return (
                                      <ul className="space-y-2">
                                        {actionItems.map((action: any, index: number) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{typeof action === 'string' ? action : action.text || action}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  } else {
                                    return <p className="text-sm text-muted-foreground">No specific action items provided.</p>;
                                  }
                                } catch {
                                  return <p className="text-sm text-muted-foreground">No specific action items provided.</p>;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}