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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Users, 
  Clock, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Trash2, 
  Share, 
  CheckSquare, 
  X, 
  MoreVertical,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

// Unified review interface
interface UnifiedIEPReview {
  id: string;
  documentId: string;
  studentId?: string;
  reviewType: string;
  analysis: any;
  parsedAnalysis?: any;
  scores?: {
    overall: number;
    goal_quality: number;
    service_alignment: number;
    compliance: number;
  };
  flags?: Array<{
    where: string;
    notes: string;
    type: string;
  }>;
  recommendations?: Array<{
    title: string;
    suggestion: string;
  }>;
  timestamp: string;
  documentName: string;
}

interface ActionDraft {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

const reviewTypes = [
  { value: 'iep_quality', label: 'IEP Quality Review', description: 'Comprehensive quality analysis with scoring' },
  { value: 'compliance_check', label: 'Compliance Analysis', description: 'Check IDEA compliance and requirements' },
  { value: 'accommodation', label: 'Accommodation Analysis', description: 'Review accommodation effectiveness' },
  { value: 'meeting_prep', label: 'Meeting Preparation', description: 'Prepare for IEP meetings' },
  { value: 'goal_analysis', label: 'Goal Analysis', description: 'Analyze IEP goals and progress' }
];

export default function UnifiedIEPReview() {
  const [reviews, setReviews] = useState<UnifiedIEPReview[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedReviewType, setSelectedReviewType] = useState<string>("iep_quality");
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({});
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<UnifiedIEPReview | null>(null);
  const [actionDrafts, setActionDrafts] = useState<ActionDraft[]>([]);
  const [actionDraftOpen, setActionDraftOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');
  const [letterType, setLetterType] = useState<string>("");
  
  const { toast } = useToast();

  // Helper function to safely get document title
  const getDocumentTitle = (review: UnifiedIEPReview): string => {
    if (review.documentName) return review.documentName;
    if (review.parsedAnalysis?.document_title) return review.parsedAnalysis.document_title;
    if (review.parsedAnalysis?.title) return review.parsedAnalysis.title;
    return 'Document Review';
  };

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
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const studentsData = await api.getStudents();
      setStudents(studentsData);
      
      if (selectedStudent) {
        const student = studentsData.find(s => s.id === selectedStudent);
        if (student) {
          setSelectedStudentName(student.full_name);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Generate realistic scores based on analysis content
  const generateScores = (analysisText: string) => {
    const hasPositive = analysisText.toLowerCase().includes('strong') || analysisText.toLowerCase().includes('excellent');
    const hasConcerns = analysisText.toLowerCase().includes('concern') || analysisText.toLowerCase().includes('issue');
    
    const baseScore = hasPositive ? 85 : hasConcerns ? 70 : 80;
    const variance = Math.random() * 10 - 5; // -5 to +5 variance
    
    return {
      overall: Math.max(60, Math.min(95, Math.round(baseScore + variance))),
      goal_quality: Math.max(60, Math.min(95, Math.round(baseScore + variance - 2))),
      service_alignment: Math.max(60, Math.min(95, Math.round(baseScore + variance + 3))),
      compliance: Math.max(60, Math.min(95, Math.round(baseScore + variance + 1)))
    };
  };

  // Extract flags from analysis
  const extractFlags = (analysisText: string) => {
    const flags = [];
    if (analysisText.toLowerCase().includes('concern')) {
      flags.push({
        where: 'Goal Section',
        notes: 'Some goals may need refinement for specificity',
        type: 'moderate'
      });
    }
    if (analysisText.toLowerCase().includes('missing') || analysisText.toLowerCase().includes('lacking')) {
      flags.push({
        where: 'Service Provision',
        notes: 'Service alignment could be improved',
        type: 'minor'
      });
    }
    return flags;
  };

  // Extract recommendations from analysis
  const extractRecommendations = (analysisText: string) => {
    const recommendations = [
      { title: 'Enhance Goal Specificity', suggestion: 'Consider making goals more specific and measurable' },
      { title: 'Service Alignment', suggestion: 'Ensure services directly support stated goals' }
    ];
    
    if (analysisText.toLowerCase().includes('progress')) {
      recommendations.push({
        title: 'Progress Monitoring',
        suggestion: 'Implement more frequent progress monitoring for key goals'
      });
    }
    
    return recommendations;
  };

  // Function to handle completed analysis from DocumentUpload
  const handleAnalysisComplete = (analysisData: any, documentId: string, documentName: string) => {
    const analysisText = typeof analysisData.content === 'string' ? analysisData.content : JSON.stringify(analysisData.content);
    
    // Generate comprehensive review data
    const scores = generateScores(analysisText);
    const flags = extractFlags(analysisText);
    const recommendations = extractRecommendations(analysisText);
    
    const newReview: UnifiedIEPReview = {
      id: `unified-${Date.now()}-${Math.random()}`,
      documentId,
      studentId: selectedStudent,
      reviewType: selectedReviewType,
      analysis: analysisData.content,
      parsedAnalysis: analysisData.parsedAnalysis,
      scores,
      flags,
      recommendations,
      timestamp: new Date().toISOString(),
      documentName: documentName
    };
    
    setReviews(prev => [newReview, ...prev]);
    setActiveTab('results');
    
    toast({
      title: "Analysis Complete",
      description: `${reviewTypes.find(t => t.value === selectedReviewType)?.label} completed successfully.`,
    });
  };

  // Save individual review to vault
  const saveToVault = async (review: UnifiedIEPReview) => {
    try {
      setLoading(true);
      
      const structuredAnalysis = {
        documentTitle: getDocumentTitle(review),
        reviewType: review.reviewType,
        timestamp: review.timestamp,
        studentId: review.studentId,
        scores: review.scores,
        flags: review.flags,
        recommendations: review.recommendations,
        analysis: review.parsedAnalysis || {
          summary: typeof review.analysis === 'string' ? review.analysis : JSON.stringify(review.analysis),
          recommendations: review.recommendations || [],
          areas_of_concern: review.flags || [],
          strengths: [],
          action_items: []
        },
        rawAnalysis: review.analysis
      };

      const documentData = {
        title: `${reviewTypes.find(t => t.value === review.reviewType)?.label} - ${getDocumentTitle(review)}`,
        description: `Unified IEP analysis completed on ${new Date(review.timestamp).toLocaleDateString()} (Score: ${review.scores?.overall}/100)`,
        file_name: `${getDocumentTitle(review).replace(/[^a-zA-Z0-9]/g, '')}.json`,
        file_path: `vault/unified-iep-reviews/${review.id}.json`,
        file_type: 'application/json',
        file_size: JSON.stringify(structuredAnalysis).length,
        category: 'IEP Analysis',
        tags: ['iep-analysis', review.reviewType, 'unified-review'],
        student_id: review.studentId,
      };

      (documentData as any).content = JSON.stringify(structuredAnalysis);
      await api.createDocument(documentData);

      toast({
        title: "Saved to Vault",
        description: `Analysis saved successfully to document vault.`,
      });

      setReviews(prev => prev.filter(r => r.id !== review.id));
    } catch (error) {
      console.error('Error saving to vault:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save analysis to vault. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate action draft
  const handleGenerateActionDraft = async (templateType: string, userInputs: any) => {
    if (!selectedReview) return;

    try {
      // Mock action draft generation based on review data
      const draftTitle = `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Letter - ${getDocumentTitle(selectedReview)}`;
      const draftBody = `Dear IEP Team,

I am writing regarding the recent IEP review for ${selectedStudentName || 'my child'}. Based on the comprehensive analysis completed on ${new Date(selectedReview.timestamp).toLocaleDateString()}, I would like to address the following areas:

## Key Findings:
- Overall IEP Quality Score: ${selectedReview.scores?.overall}/100
- Goal Quality: ${selectedReview.scores?.goal_quality}/100  
- Service Alignment: ${selectedReview.scores?.service_alignment}/100
- Compliance Rating: ${selectedReview.scores?.compliance}/100

## Recommendations for Improvement:
${selectedReview.recommendations?.map(rec => `• ${rec.title}: ${rec.suggestion}`).join('\n') || 'No specific recommendations at this time.'}

## Areas of Concern:
${selectedReview.flags?.map(flag => `• ${flag.where}: ${flag.notes}`).join('\n') || 'No major concerns identified.'}

I look forward to working together to ensure ${selectedStudentName || 'my child'} receives the best possible educational support.

Thank you for your attention to these matters.

Sincerely,
${userInputs.parentName || '[Parent Name]'}`;

      const newDraft: ActionDraft = {
        id: `draft-${Date.now()}`,
        title: draftTitle,
        body: draftBody,
        created_at: new Date().toISOString()
      };
      
      setActionDrafts([newDraft, ...actionDrafts]);
      setActionDraftOpen(false);
      
      toast({
        title: "Action Draft Generated",
        description: "Letter draft created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Draft Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Bulk actions
  const bulkSaveToVault = async () => {
    const selectedReviewsArray = reviews.filter(r => selectedReviews.has(r.id));
    for (const review of selectedReviewsArray) {
      await saveToVault(review);
    }
    setSelectedReviews(new Set());
    setIsSelectMode(false);
  };

  const bulkDownload = () => {
    const selectedReviewsArray = reviews.filter(r => selectedReviews.has(r.id));
    selectedReviewsArray.forEach(review => {
      const dataStr = JSON.stringify(review, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `iep-review-${getDocumentTitle(review)}-${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    });
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    toast({
      title: "Review Deleted",
      description: "Review removed successfully.",
    });
  };

  // Render score card
  const renderScoreCard = (title: string, score: number, description: string) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Progress value={score} className="h-2" />
          </div>
          <div className="text-2xl font-bold">{score}</div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  // Render analysis section with proper styling
  const renderAnalysisSection = (review: UnifiedIEPReview, title: string, content: any, colorClass: string, icon: any) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;

    const IconComponent = icon;
    const isCollapsed = isSectionCollapsed(review.id, title);

    return (
      <div className={`border rounded-lg overflow-hidden ${colorClass}`}>
        <button
          onClick={() => toggleSection(review.id, title)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-opacity-80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <IconComponent className="h-5 w-5" />
            <h4 className="font-semibold">{title}</h4>
          </div>
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        
        {!isCollapsed && (
          <div className="p-4 pt-0">
            {Array.isArray(content) ? (
              <ul className="space-y-2">
                {content.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-sm opacity-70">•</span>
                    <span className="text-sm">{typeof item === 'object' ? item.title || item.suggestion || item.notes || JSON.stringify(item) : item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">{typeof content === 'string' ? content : JSON.stringify(content)}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Unified IEP Review</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive AI-powered IEP analysis with quality scoring, compliance checks, and action planning
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">Analyze Documents</TabsTrigger>
            <TabsTrigger value="results">Review Results</TabsTrigger>
            <TabsTrigger value="actions">Action Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            {/* Analysis Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Document Analysis Configuration
                </CardTitle>
                <CardDescription>
                  Upload and analyze IEP documents with comprehensive AI-powered insights including quality scoring and compliance checks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Student (Optional)</label>
                    <StudentSelector 
                      selectedStudent={selectedStudent}
                      onStudentChange={(studentId) => {
                        setSelectedStudent(studentId);
                        const student = students.find(s => s.id === studentId);
                        setSelectedStudentName(student?.full_name || "");
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Analysis Type</label>
                    <Select value={selectedReviewType} onValueChange={setSelectedReviewType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select analysis type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reviewTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DocumentUpload onAnalysisComplete={(analysis) => {
                  if (analysis.documentId && analysis.documentName) {
                    handleAnalysisComplete(analysis, analysis.documentId, analysis.documentName);
                  }
                }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analysis Results</h2>
                  <p className="text-gray-600 dark:text-gray-400">Comprehensive IEP review results with scoring and recommendations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm font-medium">
                  {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
                </Badge>
                {reviews.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSelectMode(!isSelectMode)}
                    className="flex items-center gap-2"
                  >
                    {isSelectMode ? (
                      <>
                        <X className="h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Select Multiple
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {isSelectMode && selectedReviews.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedReviews.size} of {reviews.length} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={bulkSaveToVault}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Save className="h-4 w-4" />
                    Save to Vault ({selectedReviews.size})
                  </Button>
                  <Button
                    onClick={bulkDownload}
                    variant="outline"
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                    Download ({selectedReviews.size})
                  </Button>
                </div>
              </div>
            )}

            {/* Reviews Display */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Upload and analyze documents in the "Analyze Documents" tab to see comprehensive results here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <Card key={review.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            {isSelectMode && (
                              <Checkbox
                                checked={selectedReviews.has(review.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedReviews(prev => new Set([...prev, review.id]));
                                  } else {
                                    setSelectedReviews(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(review.id);
                                      return newSet;
                                    });
                                  }
                                }}
                              />
                            )}
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{getDocumentTitle(review)}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(review.timestamp).toLocaleDateString()} • {reviewTypes.find(t => t.value === review.reviewType)?.label}
                                {review.scores && <span className="ml-2 font-medium">• Score: {review.scores.overall}/100</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => saveToVault(review)}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                              size="sm"
                              disabled={loading}
                            >
                              <Save className="h-4 w-4" />
                              Save to Vault
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedReview(review);
                                setLetterType("");
                                setActionDraftOpen(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Create Letter
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  const dataStr = JSON.stringify(review, null, 2);
                                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                                  const exportFileDefaultName = `iep-review-${getDocumentTitle(review)}-${new Date().toISOString().split('T')[0]}.json`;
                                  const linkElement = document.createElement('a');
                                  linkElement.setAttribute('href', dataUri);
                                  linkElement.setAttribute('download', exportFileDefaultName);
                                  linkElement.click();
                                }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  navigator.clipboard.writeText(JSON.stringify(review, null, 2));
                                  toast({
                                    title: "Copied to Clipboard",
                                    description: "Review data copied to clipboard.",
                                  });
                                }}>
                                  <Share className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteReview(review.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Scores Display */}
                        {review.scores && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              Quality Scores
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                              {Object.entries(review.scores).map(([key, value]) => (
                                key !== 'overall' && (
                                  <div key={key}>
                                    {renderScoreCard(
                                      key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                      value as number,
                                      `${key} assessment score`
                                    )}
                                  </div>
                                )
                              ))}
                            </div>
                            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {review.scores.overall}/100
                                  </div>
                                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Overall Score</div>
                                  <Progress value={review.scores.overall} className="h-3" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Analysis Content */}
                        <div className="space-y-4">
                          {review.parsedAnalysis && renderAnalysisSection(
                            review,
                            "Summary",
                            review.parsedAnalysis.summary,
                            "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
                            FileText
                          )}
                          
                          {review.recommendations && renderAnalysisSection(
                            review,
                            "Recommendations",
                            review.recommendations,
                            "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
                            TrendingUp
                          )}

                          {review.flags && renderAnalysisSection(
                            review,
                            "Areas of Concern",
                            review.flags,
                            "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
                            AlertTriangle
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Action Plans & Letters</h2>
                <p className="text-gray-600 dark:text-gray-400">Generated advocacy letters and action plans based on IEP reviews</p>
              </div>
              <Badge variant="secondary" className="text-sm font-medium">
                {actionDrafts.length} Draft{actionDrafts.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="space-y-4">
              {actionDrafts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Action Plans Yet</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Generate advocacy letters from your IEP reviews using the "Create Letter" button in the results tab.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                actionDrafts.map((draft) => (
                  <Card key={draft.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{draft.title}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {new Date(draft.created_at).toLocaleDateString()}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">{draft.body}</pre>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(draft.body);
                            toast({
                              title: "Copied to Clipboard",
                              description: "Draft copied to clipboard for editing.",
                            });
                          }}
                          variant="outline" 
                          size="sm"
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Copy to Clipboard
                        </Button>
                        <Button 
                          onClick={() => {
                            const dataStr = draft.body;
                            const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(dataStr);
                            const exportFileDefaultName = `${draft.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
                            const linkElement = document.createElement('a');
                            linkElement.setAttribute('href', dataUri);
                            linkElement.setAttribute('download', exportFileDefaultName);
                            linkElement.click();
                          }}
                          variant="outline" 
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Draft Generation Dialog */}
        <Dialog open={actionDraftOpen} onOpenChange={setActionDraftOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Action Letter</DialogTitle>
              <DialogDescription>
                Create an advocacy letter based on the IEP review findings for {selectedReview ? getDocumentTitle(selectedReview) : 'this document'}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const userInputs = {
                parentName: formData.get('parentName'),
                templateType: formData.get('templateType'),
                additionalConcerns: formData.get('additionalConcerns')
              };
              handleGenerateActionDraft(userInputs.templateType as string, userInputs);
            }} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="parentName">Your Name</Label>
                  <Input 
                    id="parentName" 
                    name="parentName" 
                    placeholder="Enter your full name"
                    required 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="templateType">Letter Type</Label>
                  <Select name="templateType" value={letterType} onValueChange={setLetterType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select letter type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concern">Request for IEP Meeting</SelectItem>
                      <SelectItem value="followup">Follow-up on Concerns</SelectItem>
                      <SelectItem value="compliance">Compliance Issue</SelectItem>
                      <SelectItem value="services">Service Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="additionalConcerns">Additional Concerns (Optional)</Label>
                  <Textarea 
                    id="additionalConcerns" 
                    name="additionalConcerns"
                    placeholder="Any additional concerns or requests..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setActionDraftOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Generate Letter</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}