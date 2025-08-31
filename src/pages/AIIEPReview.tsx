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
import { Brain, FileText, CheckCircle, AlertCircle, TrendingUp, Target, Users, Clock, Download, ChevronDown, ChevronUp, Save, Trash2, Share, Tag, Square, CheckSquare, X, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

// Temporary AI Review interface for in-memory storage
interface TemporaryAIReview {
  id: string;
  documentId: string;
  studentId?: string;
  reviewType: string;
  analysis: any;
  parsedAnalysis?: any;
  timestamp: string;
  documentName: string;
}

const reviewTypes = [
  { value: 'iep', label: 'IEP Document Review', description: 'Comprehensive analysis of IEP documents' },
  { value: 'accommodation', label: 'Accommodation Analysis', description: 'Review accommodation effectiveness' },
  { value: 'meeting_prep', label: 'Meeting Preparation', description: 'Prepare for IEP meetings' },
  { value: 'goal_analysis', label: 'Goal Analysis', description: 'Analyze IEP goals and progress' },
  { value: 'compliance_check', label: 'Compliance Check', description: 'Check legal compliance requirements' }
];

export default function AIIEPReview() {
  const [temporaryReviews, setTemporaryReviews] = useState<TemporaryAIReview[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedReviewType, setSelectedReviewType] = useState<string>("iep");
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({});
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Helper function to safely get document title
  const getDocumentTitle = (review: TemporaryAIReview): string => {
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
      
      // Update selected student name
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

  // Function to handle completed analysis from DocumentUpload
  const handleAnalysisComplete = (analysisData: any, documentId: string, documentName: string) => {
    const newReview: TemporaryAIReview = {
      id: `temp-${Date.now()}-${Math.random()}`,
      documentId,
      studentId: selectedStudent,
      reviewType: selectedReviewType,
      analysis: analysisData.content,
      parsedAnalysis: analysisData.parsedAnalysis,
      timestamp: new Date().toISOString(),
      documentName: documentName
    };
    
    setTemporaryReviews(prev => [newReview, ...prev]);
    
    toast({
      title: "Analysis Complete",
      description: `${selectedReviewType.toUpperCase()} analysis ready for review.`,
    });
  };

  // Save individual review to vault
  const saveToVault = async (review: TemporaryAIReview) => {
    try {
      setLoading(true);
      await api.createDocument({
        title: `AI Review - ${getDocumentTitle(review)}`,
        description: `AI-powered analysis conducted on ${new Date(review.timestamp).toLocaleDateString()}`,
        file_name: `ai-review-${review.id}.json`,
        file_path: `vault/ai-reviews/${review.id}.json`,
        file_type: 'application/json',
        file_size: JSON.stringify(review).length,
        category: 'AI Review',
        tags: ['ai-analysis', review.reviewType],
        student_id: review.studentId,
      });

      toast({
        title: "Saved to Vault",
        description: `Review saved successfully to document vault.`,
      });

      // Remove from temporary reviews
      setTemporaryReviews(prev => prev.filter(r => r.id !== review.id));
    } catch (error) {
      console.error('Error saving to vault:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save review to vault. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Download review as JSON
  const downloadReview = (review: TemporaryAIReview) => {
    const dataStr = JSON.stringify(review, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai-review-${getDocumentTitle(review)}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Share review (placeholder)
  const shareReview = (review: TemporaryAIReview) => {
    navigator.clipboard.writeText(JSON.stringify(review, null, 2));
    toast({
      title: "Copied to Clipboard",
      description: "Review data copied to clipboard for sharing.",
    });
  };

  // Delete review
  const deleteReview = (reviewId: string) => {
    setTemporaryReviews(prev => prev.filter(r => r.id !== reviewId));
    toast({
      title: "Review Deleted",
      description: "Temporary review removed.",
    });
  };

  // Bulk actions
  const selectAllReviews = () => {
    const allIds = temporaryReviews.map(r => r.id);
    setSelectedReviews(new Set(allIds));
  };

  const deselectAllReviews = () => {
    setSelectedReviews(new Set());
  };

  const bulkSaveToVault = async () => {
    const selectedReviewsArray = temporaryReviews.filter(r => selectedReviews.has(r.id));
    for (const review of selectedReviewsArray) {
      await saveToVault(review);
    }
    setSelectedReviews(new Set());
    setIsSelectMode(false);
  };

  const bulkDownload = () => {
    const selectedReviewsArray = temporaryReviews.filter(r => selectedReviews.has(r.id));
    selectedReviewsArray.forEach(review => downloadReview(review));
  };

  const bulkShare = () => {
    const selectedReviewsArray = temporaryReviews.filter(r => selectedReviews.has(r.id));
    const combinedData = selectedReviewsArray.map(review => ({
      title: getDocumentTitle(review),
      timestamp: review.timestamp,
      analysis: review.analysis
    }));
    
    navigator.clipboard.writeText(JSON.stringify(combinedData, null, 2));
    toast({
      title: "Copied to Clipboard",
      description: `${selectedReviews.size} reviews copied to clipboard.`,
    });
  };

  const bulkDeleteReviews = () => {
    setTemporaryReviews(prev => prev.filter(r => !selectedReviews.has(r.id)));
    setSelectedReviews(new Set());
    setIsSelectMode(false);
    toast({
      title: "Reviews Deleted",
      description: `${selectedReviews.size} temporary reviews removed.`,
    });
  };

  const toggleReviewSelection = (reviewId: string) => {
    setSelectedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  // Render analysis section with proper styling
  const renderAnalysisSection = (review: TemporaryAIReview, title: string, content: any, colorClass: string, icon: any) => {
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
                    <span className="text-sm">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI IEP Review</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and analyze IEP documents with AI-powered insights
          </p>
        </div>

        {/* Analysis Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Document Analysis</CardTitle>
            <CardDescription>
              Configure your analysis settings and upload documents for AI-powered review.
              The analysis results will appear below after processing.
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
                <label className="text-sm font-medium mb-2 block">Review Type</label>
                <Select value={selectedReviewType} onValueChange={setSelectedReviewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select review type" />
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

        {/* Analysis Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Review Results</h2>
                <p className="text-gray-600 dark:text-gray-400">Temporary analysis results - choose what to save</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm font-medium">
                {temporaryReviews.length} Review{temporaryReviews.length !== 1 ? 's' : ''}
              </Badge>
              {temporaryReviews.length > 0 && (
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
                  {selectedReviews.size} of {temporaryReviews.length} selected
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllReviews}
                    className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm" 
                    onClick={deselectAllReviews}
                    className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    Deselect All
                  </Button>
                </div>
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
                <Button
                  onClick={bulkShare}
                  variant="outline"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Share className="h-4 w-4" />
                  Share ({selectedReviews.size})
                </Button>
                <Button
                  onClick={bulkDeleteReviews}
                  variant="destructive"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedReviews.size})
                </Button>
              </div>
            </div>
          )}

          {/* Reviews Display */}
          <div className="space-y-6">
            {temporaryReviews.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Upload and analyze documents above to see AI-powered insights here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {temporaryReviews.map((review) => (
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
                              {new Date(review.timestamp).toLocaleDateString()} • {review.reviewType} Review
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => downloadReview(review)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => shareReview(review)}>
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

                      {/* Analysis Content */}
                      <div className="space-y-4">
                        {review.parsedAnalysis ? (
                          <>
                            {renderAnalysisSection(
                              review,
                              "Summary",
                              review.parsedAnalysis.summary,
                              "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
                              FileText
                            )}
                            {renderAnalysisSection(
                              review,
                              "Recommendations",
                              review.parsedAnalysis.recommendations,
                              "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
                              TrendingUp
                            )}
                            {renderAnalysisSection(
                              review,
                              "Areas of Concern",
                              review.parsedAnalysis.areas_of_concern,
                              "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100",
                              AlertCircle
                            )}
                            {renderAnalysisSection(
                              review,
                              "Strengths",
                              review.parsedAnalysis.strengths,
                              "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100",
                              CheckCircle
                            )}
                            {renderAnalysisSection(
                              review,
                              "Action Items",
                              review.parsedAnalysis.action_items,
                              "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100",
                              Target
                            )}
                          </>
                        ) : (
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {typeof review.analysis === 'string' ? review.analysis : JSON.stringify(review.analysis, null, 2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}