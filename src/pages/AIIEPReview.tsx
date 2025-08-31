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
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Helper function to safely get document title
  const getDocumentTitle = (review: AIReview): string => {
    // Try to extract title from ai_analysis if it contains parsed data
    if (review.ai_analysis) {
      try {
        const parsed = typeof review.ai_analysis === 'string' 
          ? JSON.parse(review.ai_analysis) 
          : review.ai_analysis;
        if (parsed?.document_title) return parsed.document_title;
        if (parsed?.title) return parsed.title;
      } catch (error) {
        // Continue with fallback
      }
    }
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
    fetchReviews();
    fetchStudents();
  }, [selectedStudent]);

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

  // Save to vault functionality
  const saveToVault = async (review: AIReview) => {
    try {
      await api.createDocument({
        title: `AI Review - ${getDocumentTitle(review)}`,
        description: `AI-powered analysis conducted on ${new Date(review.created_at || '').toLocaleDateString()}`,
        file_name: `ai-review-${review.id}.json`,
        file_path: `vault/ai-reviews/${review.id}.json`,
        file_type: 'application/json',
        file_size: JSON.stringify(review).length,
        category: 'AI Review',
        tags: generateSmartTags(review),
        student_id: review.student_id
      });
      
      // Invalidate documents cache to refresh the vault
      await import('@/lib/queryClient').then(({ queryClient }) => {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      });
      
      toast({
        title: "Saved to Vault",
        description: "Review has been saved to your document vault.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save to vault. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete review functionality
  const deleteReview = async (reviewId: string) => {
    try {
      await api.deleteAIReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      
      toast({
        title: "Review Deleted",
        description: "The review has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Multi-select functionality
  const toggleReviewSelection = (reviewId: string) => {
    setSelectedReviews(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(reviewId)) {
        newSelection.delete(reviewId);
      } else {
        newSelection.add(reviewId);
      }
      return newSelection;
    });
  };

  const selectAllReviews = () => {
    setSelectedReviews(new Set(reviews.map(r => r.id || '')));
  };

  const deselectAllReviews = () => {
    setSelectedReviews(new Set());
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      deselectAllReviews();
    }
  };

  // Bulk operations functionality
  const bulkSaveToVault = async () => {
    if (selectedReviews.size === 0) return;
    
    try {
      const selectedReviewsArray = reviews.filter(r => selectedReviews.has(r.id || ''));
      const savePromises = selectedReviewsArray.map(review => 
        api.createDocument({
          title: `AI Review - ${getDocumentTitle(review)}`,
          description: `AI-powered analysis conducted on ${new Date(review.created_at || '').toLocaleDateString()}`,
          file_name: `ai-review-${review.id}.json`,
          file_path: `vault/ai-reviews/${review.id}.json`,
          file_type: 'application/json',
          file_size: JSON.stringify(review).length,
          category: 'AI Review',
          tags: generateSmartTags(review),
          student_id: review.student_id
        })
      );
      
      await Promise.all(savePromises);
      
      // Invalidate documents cache
      await import('@/lib/queryClient').then(({ queryClient }) => {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      });
      
      toast({
        title: "Saved to Vault",
        description: `${selectedReviews.size} review${selectedReviews.size > 1 ? 's have' : ' has'} been saved to your document vault.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save some reviews to vault. Please try again.",
        variant: "destructive",
      });
    }
  };

  const bulkDownload = () => {
    if (selectedReviews.size === 0) return;
    
    const selectedReviewsArray = reviews.filter(r => selectedReviews.has(r.id || ''));
    
    selectedReviewsArray.forEach(review => {
      const analysisData = {
        title: getDocumentTitle(review) || 'AI Review',
        date: new Date(review.created_at || '').toLocaleDateString(),
        student_id: review.student_id,
        review_type: review.review_type,
        analysis: review.ai_analysis,
        recommendations: review.recommendations,
        areas_of_concern: review.areas_of_concern,
        strengths: review.strengths,
        action_items: review.action_items,
        compliance_score: review.compliance_score,
        smart_tags: generateSmartTags(review)
      };

      const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-review-${review.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Downloads Started",
      description: `${selectedReviews.size} analysis file${selectedReviews.size > 1 ? 's have' : ' has'} been downloaded.`,
    });
  };

  const bulkShare = async () => {
    if (selectedReviews.size === 0) return;
    
    const selectedReviewsArray = reviews.filter(r => selectedReviews.has(r.id || ''));
    const shareUrls = selectedReviewsArray.map(review => 
      `${window.location.origin}/shared-review/${review.id}`
    );
    
    const shareText = shareUrls.join('\n');
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Links Copied",
        description: `${selectedReviews.size} share link${selectedReviews.size > 1 ? 's have' : ' has'} been copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy share links. Please try again.",
        variant: "destructive",
      });
    }
  };

  const bulkDeleteReviews = async () => {
    if (selectedReviews.size === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedReviews.size} review${selectedReviews.size > 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      // Delete all selected reviews concurrently
      const deletePromises = Array.from(selectedReviews).map(reviewId => 
        api.deleteAIReview(reviewId)
      );
      
      await Promise.all(deletePromises);
      
      // Update state to remove deleted reviews
      setReviews(prev => prev.filter(r => !selectedReviews.has(r.id || '')));
      
      // Clear selections and exit select mode
      setSelectedReviews(new Set());
      setIsSelectMode(false);
      
      toast({
        title: "Reviews Deleted",
        description: `${selectedReviews.size} review${selectedReviews.size > 1 ? 's have' : ' has'} been permanently deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some reviews. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Download analysis functionality
  const downloadAnalysis = (review: AIReview) => {
    const analysisData = {
      title: getDocumentTitle(review) || 'AI Review',
      date: new Date(review.created_at || '').toLocaleDateString(),
      student_id: review.student_id,
      review_type: review.review_type,
      analysis: review.ai_analysis,
      recommendations: review.recommendations,
      areas_of_concern: review.areas_of_concern,
      strengths: review.strengths,
      action_items: review.action_items,
      compliance_score: review.compliance_score,
      smart_tags: generateSmartTags(review)
    };

    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-review-${review.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Analysis file has been downloaded.",
    });
  };

  // Share functionality
  const shareReview = async (review: AIReview) => {
    const shareUrl = `${window.location.origin}/shared-review/${review.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI IEP Review',
          text: 'Check out this AI-powered IEP analysis',
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard.",
        });
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard.",
      });
    }
  };

  // Generate smart tags from review content
  const generateSmartTags = (review: AIReview): string[] => {
    const tags: string[] = [];
    
    // Add review type tag
    if (review.review_type) {
      tags.push(review.review_type.toUpperCase());
    }
    
    // Add compliance score tags
    if (review.compliance_score !== null && review.compliance_score !== undefined) {
      if (review.compliance_score >= 80) tags.push('HIGH_COMPLIANCE');
      else if (review.compliance_score >= 60) tags.push('MEDIUM_COMPLIANCE');
      else tags.push('LOW_COMPLIANCE');
    }
    
    // Analyze areas of concern for tags
    if (review.areas_of_concern && review.areas_of_concern.length > 0) {
      const concernText = review.areas_of_concern.join(' ').toLowerCase();
      if (concernText.includes('goal')) tags.push('GOALS_ISSUE');
      if (concernText.includes('service')) tags.push('SERVICES_ISSUE');
      if (concernText.includes('accommodation')) tags.push('ACCOMMODATIONS_ISSUE');
      if (concernText.includes('transition')) tags.push('TRANSITION_ISSUE');
      if (concernText.includes('behavior')) tags.push('BEHAVIOR_ISSUE');
      if (concernText.includes('autism')) tags.push('AUTISM_RELATED');
      if (concernText.includes('communication')) tags.push('COMMUNICATION_ISSUE');
    }
    
    // Analyze recommendations for tags
    if (review.recommendations && review.recommendations.length > 0) {
      const recText = review.recommendations.join(' ').toLowerCase();
      if (recText.includes('smart')) tags.push('SMART_GOALS_NEEDED');
      if (recText.includes('training')) tags.push('STAFF_TRAINING_NEEDED');
      if (recText.includes('meeting')) tags.push('MEETING_CHANGES_NEEDED');
    }
    
    return [...new Set(tags)]; // Remove duplicates
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
                onStudentChange={(id) => {
                  setSelectedStudent(id || "");
                  // Update student name when selection changes
                  if (id) {
                    const student = students.find(s => s.id === id);
                    setSelectedStudentName(student?.full_name || '');
                  } else {
                    setSelectedStudentName('');
                  }
                }}
              />
              {selectedStudentName && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Selected: {selectedStudentName}
                    </span>
                  </div>
                </div>
              )}
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
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
              </Badge>
              {reviews.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleSelectMode}
                  className="flex items-center gap-2"
                  data-testid="button-toggle-select-mode"
                >
                  {isSelectMode ? (
                    <><X className="h-4 w-4" />Cancel</>
                  ) : (
                    <><Square className="h-4 w-4" />Select Multiple</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          {isSelectMode && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedReviews.size} of {reviews.length} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={selectAllReviews}
                        className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                        data-testid="button-select-all"
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={deselectAllReviews}
                        className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                        data-testid="button-deselect-all"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={bulkSaveToVault}
                      disabled={selectedReviews.size === 0}
                      className="flex items-center gap-2"
                      data-testid="button-bulk-save-vault"
                    >
                      <Save className="h-4 w-4" />
                      Save to Vault ({selectedReviews.size})
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={bulkDownload}
                      disabled={selectedReviews.size === 0}
                      className="flex items-center gap-2"
                      data-testid="button-bulk-download"
                    >
                      <Download className="h-4 w-4" />
                      Download ({selectedReviews.size})
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={bulkShare}
                      disabled={selectedReviews.size === 0}
                      className="flex items-center gap-2"
                      data-testid="button-bulk-share"
                    >
                      <Share className="h-4 w-4" />
                      Share ({selectedReviews.size})
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={bulkDeleteReviews}
                      disabled={selectedReviews.size === 0}
                      className="flex items-center gap-2"
                      data-testid="button-bulk-delete"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete ({selectedReviews.size})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                <Card key={review.id} className={`overflow-hidden transition-all duration-200 ${
                  isSelectMode && selectedReviews.has(review.id || '') 
                    ? 'ring-2 ring-blue-500 bg-blue-50/30 dark:bg-blue-950/30' 
                    : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      {/* Checkbox for multi-select */}
                      {isSelectMode && (
                        <div className="flex items-center mr-4">
                          <Checkbox
                            checked={selectedReviews.has(review.id || '')}
                            onCheckedChange={() => toggleReviewSelection(review.id || '')}
                            className="h-5 w-5"
                            data-testid={`checkbox-select-${review.id}`}
                          />
                        </div>
                      )}
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {getDocumentTitle(review)}
                          {selectedStudentName && (
                            <span className="text-sm font-normal text-muted-foreground">
                              • {selectedStudentName}
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {reviewTypes.find(t => t.value === review.review_type)?.label} • 
                          {new Date(review.created_at || '').toLocaleDateString()}
                        </CardDescription>
                        
                        {/* Smart Tags Display */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {generateSmartTags(review).slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {tag.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {generateSmartTags(review).length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{generateSmartTags(review).length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        {/* Badges */}
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(review.priority_level || 'medium')}>
                            {review.priority_level ? (review.priority_level.charAt(0).toUpperCase() + review.priority_level.slice(1)) : 'Medium'} Priority
                          </Badge>
                          {review.compliance_score && (
                            <Badge variant="outline" className={getComplianceColor(review.compliance_score)}>
                              {review.compliance_score}% Compliant
                            </Badge>
                          )}
                        </div>
                        
                        {/* Actions Dropdown - Hidden in select mode */}
                        {!isSelectMode && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                data-testid={`button-actions-menu-${review.id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                onClick={() => saveToVault(review)}
                                className="flex items-center gap-2 cursor-pointer"
                                data-testid={`menu-save-vault-${review.id}`}
                              >
                                <Save className="h-4 w-4" />
                                Save to Vault
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => downloadAnalysis(review)}
                                className="flex items-center gap-2 cursor-pointer"
                                data-testid={`menu-download-${review.id}`}
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => shareReview(review)}
                                className="flex items-center gap-2 cursor-pointer"
                                data-testid={`menu-share-${review.id}`}
                              >
                                <Share className="h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
                                    deleteReview(review.id || '');
                                  }
                                }}
                                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                data-testid={`menu-delete-${review.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                                    const parsedAnalysis = typeof review.ai_analysis === 'string' 
                                      ? JSON.parse(review.ai_analysis) 
                                      : review.ai_analysis;
                                    
                                    // Check multiple possible locations for summary
                                    const summary = parsedAnalysis?.summary || 
                                                  parsedAnalysis?.executive_summary || 
                                                  'No summary available';
                                                  
                                    return summary;
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