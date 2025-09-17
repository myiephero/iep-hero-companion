import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  PremiumToolCard,
  SafeAreaFull,
  ContainerMobile
} from '@/components/mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Shield, Folder, Search, Filter, Download, Upload, Eye, Edit, Trash2, Check, X, MoreVertical, Share, User, Calendar, Clock, FileText, Brain, Square, CheckSquare, Grid3X3, List, Star, TrendingUp, AlertTriangle, BookOpen, FileBarChart, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { VirtualizedList } from '@/components/VirtualizedList';
import OptimizedDocumentCard from '@/components/OptimizedDocumentCard';
import type { Document, Student } from '@/lib/api';
import DocumentUpload from '@/components/DocumentUpload';
import { cn } from '@/lib/utils';

interface ViewDialogState {
  document: Document | null;
  isOpen: boolean;
}

const DocumentVault: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingDocument, setEditingDocument] = useState<{ id: string; title: string } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [assigningDocument, setAssigningDocument] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [viewDialog, setViewDialog] = useState<ViewDialogState>({ document: null, isOpen: false });
  const [activeSection, setActiveSection] = useState<{[key: string]: string}>({});
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Debounced search for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Queries  
  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/documents');
      return response.json();
    },
  });

  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return response.json();
    },
  });

  // Mutations
  const updateDocumentMutation = useMutation({
    mutationFn: async (data: { id: string; title?: string; student_id?: string }) => {
      const response = await apiRequest('PUT', `/api/documents/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Document updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating document", description: error.message, variant: "destructive" });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/documents/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Document deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting document", description: error.message, variant: "destructive" });
    },
  });

  // Optimized memoized handlers
  const handleEditFileName = useCallback((id: string, currentTitle: string) => {
    setEditingDocument({ id, title: currentTitle });
    setNewFileName(currentTitle);
  }, []);

  const handleUpdateFileName = useCallback(() => {
    if (editingDocument && newFileName.trim()) {
      updateDocumentMutation.mutate({
        id: editingDocument.id,
        title: newFileName.trim(),
      });
      setEditingDocument(null);
      setNewFileName('');
    }
  }, [editingDocument, newFileName, updateDocumentMutation]);

  const handleCancelEdit = () => {
    setEditingDocument(null);
    setNewFileName('');
  };

  const handleAssignToStudent = (documentId: string) => {
    setAssigningDocument(documentId);
    setSelectedStudentId('');
  };

  const handleUpdateStudentAssignment = () => {
    if (assigningDocument && selectedStudentId) {
      updateDocumentMutation.mutate({
        id: assigningDocument,
        student_id: selectedStudentId,
      });
      setAssigningDocument(null);
      setSelectedStudentId('');
    }
  };

  const handleDeleteDocument = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteDocumentMutation.mutate(id);
    }
  };

  // Bulk selection functions
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      return newSet;
    });
  };

  const selectAllDocuments = () => {
    if (!filteredDocuments) return;
    const allIds = filteredDocuments.map(doc => doc.id);
    setSelectedDocuments(new Set(allIds));
  };

  const deselectAllDocuments = () => {
    setSelectedDocuments(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.size} document(s)? This action cannot be undone.`)) {
      try {
        for (const docId of selectedDocuments) {
          deleteDocumentMutation.mutate(docId);
        }
        setSelectedDocuments(new Set());
        setIsSelectMode(false);
        toast({
          title: "Documents deleted",
          description: `${selectedDocuments.size} document(s) have been successfully deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete some documents. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBulkDownload = () => {
    if (selectedDocuments.size === 0) return;
    
    const selectedDocs = filteredDocuments?.filter(doc => selectedDocuments.has(doc.id)) || [];
    selectedDocs.forEach(doc => handleDownloadDocument(doc));
    
    toast({
      title: "Downloads started",
      description: `Started downloading ${selectedDocuments.size} document(s).`,
    });
  };

  const handleBulkShare = () => {
    if (selectedDocuments.size === 0) return;
    
    const selectedDocs = filteredDocuments?.filter(doc => selectedDocuments.has(doc.id)) || [];
    const shareData = selectedDocs.map(doc => ({
      title: doc.title,
      type: doc.category,
      date: doc.created_at
    }));
    
    navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
    toast({
      title: "Copied to clipboard",
      description: `${selectedDocuments.size} document(s) information copied for sharing.`,
    });
  };

  const handleBulkAssignStudent = () => {
    if (selectedDocuments.size === 0) return;
    
    // Set up for bulk assignment - use a special indicator for bulk mode
    setAssigningDocument('BULK_ASSIGN');
    setSelectedStudentId('');
  };

  const handleBulkStudentAssignment = () => {
    if (assigningDocument === 'BULK_ASSIGN' && selectedStudentId) {
      // Update all selected documents with the chosen student
      selectedDocuments.forEach(docId => {
        updateDocumentMutation.mutate({
          id: docId,
          student_id: selectedStudentId,
        });
      });
      
      toast({
        title: "Documents assigned",
        description: `${selectedDocuments.size} document(s) assigned to student successfully.`,
      });
      
      setAssigningDocument(null);
      setSelectedStudentId('');
      setSelectedDocuments(new Set());
      setIsSelectMode(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setViewDialog({ document: doc, isOpen: true });
  };

  const handleDownloadDocument = (doc: Document) => {
    toast({ title: "Download started", description: `Downloading ${doc.title}` });
  };

  const handleShareDocument = (doc: Document) => {
    navigator.clipboard.writeText(`Shared document: ${doc.title}`);
    toast({ title: "Link copied", description: "Document link copied to clipboard" });
  };

  const forceRefresh = () => {
    refetch();
    toast({ title: "Documents refreshed" });
  };

  // Filter documents
  const filteredDocuments = documents?.filter((doc: Document) => {
    const student = students?.find((s: Student) => s.id === doc.student_id);
    const studentName = student ? student.full_name : '';
    
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || 
                       doc.file_type?.includes(filterType) ||
                       doc.category?.toLowerCase().includes(filterType.toLowerCase()) ||
                       (filterType === 'ai review' && doc.category === 'AI Analysis');
    
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'iep' && (doc.category === 'IEP' || doc.tags?.includes('IEP'))) ||
                      (activeTab === 'evaluations' && (doc.category === 'Evaluation' || doc.tags?.includes('Evaluation'))) ||
                      (activeTab === 'ai-analysis' && doc.category === 'AI Analysis') ||
                      (activeTab === 'reports' && (doc.category === 'Report' || doc.tags?.includes('Report'))) ||
                      (activeTab === 'meeting-notes' && (doc.category === 'Meeting Notes' || doc.tags?.includes('Meeting')));
    
    return matchesSearch && matchesType && matchesTab;
  });

  // Get document counts for tabs
  const getDocumentCounts = () => {
    if (!documents) return { all: 0, iep: 0, evaluations: 0, aiAnalysis: 0, reports: 0, meetingNotes: 0 };
    
    return {
      all: documents.length,
      iep: documents.filter(doc => doc.category === 'IEP' || doc.tags?.includes('IEP')).length,
      evaluations: documents.filter(doc => doc.category === 'Evaluation' || doc.tags?.includes('Evaluation')).length,
      aiAnalysis: documents.filter(doc => doc.category === 'AI Analysis').length,
      reports: documents.filter(doc => doc.category === 'Report' || doc.tags?.includes('Report')).length,
      meetingNotes: documents.filter(doc => doc.category === 'Meeting Notes' || doc.tags?.includes('Meeting')).length,
    };
  };

  const documentCounts = getDocumentCounts();

  const getFileTypeIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('doc')) return '📝';
    if (fileType?.includes('txt')) return '📋';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <MobileAppShell>
      <SafeAreaFull>
        {/* Premium Mobile Header */}
        <PremiumLargeHeader
          title="Document Vault"
          subtitle={`${documents?.length || 0} documents securely stored`}
          rightAction={
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-medium">
                <Shield className="h-3 w-3 mr-1 inline" />
                Secure
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={forceRefresh}
                className="h-10 w-10 rounded-full p-0"
                data-testid="refresh-documents"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          }
        />
        
        <ContainerMobile className="space-y-6 pb-6">

          {/* Premium Upload Section */}
          <PremiumCard variant="gradient" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Upload & Analyze</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add documents for AI-powered analysis</p>
                </div>
              </div>
              <DocumentUpload onAnalysisComplete={(analysis) => {
                console.log('Analysis completed:', analysis);
                refetch(); // Refresh documents after upload
              }} />
            </div>
          </PremiumCard>

          {/* Premium Document Categories */}
          <PremiumCard variant="glass" className="p-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Categories</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Organize by document type</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-10 w-10 p-0 rounded-full"
                      data-testid="view-grid"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-10 w-10 p-0 rounded-full"
                      data-testid="view-list"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                  <TabsList className="h-auto bg-transparent p-0 space-x-2">
                    <TabsTrigger 
                      value="all" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                        "px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] whitespace-nowrap",
                        "transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                      data-testid="tab-all"
                    >
                      All ({documentCounts.all})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="iep" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                        "px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] whitespace-nowrap",
                        "transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                      data-testid="tab-iep"
                    >
                      IEPs ({documentCounts.iep})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="evaluations" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                        "px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] whitespace-nowrap",
                        "transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                      data-testid="tab-evaluations"
                    >
                      Evaluations ({documentCounts.evaluations})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="ai-analysis" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                        "px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] whitespace-nowrap",
                        "transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                      data-testid="tab-ai-analysis"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      AI Analysis ({documentCounts.aiAnalysis})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reports" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                        "px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] whitespace-nowrap",
                        "transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                      data-testid="tab-reports"
                    >
                      Reports ({documentCounts.reports})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meeting-notes" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                        "px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] whitespace-nowrap",
                        "transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                      data-testid="tab-meetings"
                    >
                      Meetings ({documentCounts.meetingNotes})
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Enhanced Search and Filter */}
            <PremiumCard variant="elevated" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Search & Filter</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Find your documents quickly</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search documents, students, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500/20"
                      data-testid="search-input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl" data-testid="filter-type">
                        <Filter className="h-4 w-4 mr-2 text-blue-600" />
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All File Types</SelectItem>
                        <SelectItem value="pdf">📄 PDF Files</SelectItem>
                        <SelectItem value="doc">📝 Word Documents</SelectItem>
                        <SelectItem value="txt">📋 Text Files</SelectItem>
                        <SelectItem value="ai review">🧠 AI Analysis</SelectItem>
                        <SelectItem value="upload">📁 Uploaded Files</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={() => setIsSelectMode(!isSelectMode)} 
                      variant={isSelectMode ? "default" : "outline"} 
                      className="h-12 rounded-xl gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0" 
                      data-testid="select-mode-toggle"
                    >
                      {isSelectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      {isSelectMode ? "Exit Select" : "Select Multiple"}
                    </Button>
                  </div>
                </div>
              </div>

                {/* Premium Bulk Actions */}
                {isSelectMode && (
                  <PremiumCard variant="glass" className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                          <CheckSquare className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedDocuments.size > 0 ? `${selectedDocuments.size} documents selected` : 'Select documents for actions'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Choose documents to perform bulk operations</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {filteredDocuments && filteredDocuments.length > 0 && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={selectAllDocuments}
                              disabled={selectedDocuments.size === filteredDocuments.length}
                              className="h-10 px-4 rounded-full bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              data-testid="select-all"
                            >
                              Select All
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={deselectAllDocuments}
                              disabled={selectedDocuments.size === 0}
                              className="h-10 px-4 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                              data-testid="deselect-all"
                            >
                              Deselect All
                            </Button>
                          </>
                        )}
                        
                        {selectedDocuments.size > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="sm" 
                                className="h-10 px-4 rounded-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
                                data-testid="bulk-actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                                Actions ({selectedDocuments.size})
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem onClick={handleBulkDownload} className="gap-2">
                                <Download className="h-4 w-4" />
                                Download Selected
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleBulkShare} className="gap-2">
                                <Share className="h-4 w-4" />
                                Share Selected
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleBulkAssignStudent} className="gap-2">
                                <User className="h-4 w-4" />
                                Assign to Student
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={handleBulkDelete}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Selected
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </PremiumCard>
                )}

                {/* Premium Documents Display */}
                {isLoading ? (
                  <PremiumCard variant="elevated" className="p-12">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto flex items-center justify-center animate-pulse">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Loading Documents</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we fetch your documents...</p>
                      </div>
                    </div>
                  </PremiumCard>
                ) : filteredDocuments?.length === 0 ? (
                  <PremiumCard variant="elevated" className="p-12">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mx-auto flex items-center justify-center">
                        <FileText className="h-10 w-10 text-gray-400" />
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {searchTerm || filterType !== 'all' ? 'No matching documents' : 'No documents yet'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                          {searchTerm || filterType !== 'all' 
                            ? 'No documents match your current search criteria. Try adjusting your filters or search terms.'
                            : 'Get started by uploading your first document using the upload section above.'
                          }
                        </p>
                      </div>
                      
                      {(searchTerm || filterType !== 'all') && (
                        <Button 
                          onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                          }} 
                          className="mt-6 h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
                          data-testid="clear-filters"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </PremiumCard>
                ) : (
                  <div className={cn(
                    "space-y-4",
                    viewMode === 'grid' && "grid grid-cols-1 sm:grid-cols-2 gap-4 space-y-0"
                  )}>
                    {filteredDocuments?.map((doc: Document) => {
                      const student = students?.find((s: Student) => s.id === doc.student_id);
                      return (
                        <PremiumCard 
                          key={doc.id} 
                          variant="interactive" 
                          className={cn(
                            "p-4 relative overflow-hidden group",
                            selectedDocuments.has(doc.id) && "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                          )}
                          onClick={() => !isSelectMode && handleViewDocument(doc)}
                        >
                          {/* Background Pattern for Premium Feel */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50/30 to-transparent dark:from-blue-950/10 rounded-full transform translate-x-12 -translate-y-12" />
                          
                          <div className="relative z-10 space-y-3">
                            {/* Header with Selection */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {isSelectMode && (
                                  <input
                                    type="checkbox"
                                    checked={selectedDocuments.has(doc.id)}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      toggleDocumentSelection(doc.id);
                                    }}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                                    data-testid={`select-document-${doc.id}`}
                                  />
                                )}
                                
                                {/* File Icon */}
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0",
                                  doc.category === 'AI Analysis' 
                                    ? "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 text-purple-600 dark:text-purple-400" 
                                    : "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-600 dark:text-blue-400"
                                )}>
                                  {doc.category === 'AI Analysis' ? <Brain className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">
                                    {doc.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {doc.file_name}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDocument(doc);
                                    }}
                                    data-testid={`menu-view-${doc.id}`}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadDocument(doc);
                                    }}
                                    data-testid={`menu-download-${doc.id}`}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditFileName(doc.id, doc.title);
                                    }}
                                    data-testid={`menu-edit-filename-${doc.id}`}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Name
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignToStudent(doc.id);
                                    }}
                                    data-testid={`menu-assign-student-${doc.id}`}
                                  >
                                    <User className="h-4 w-4 mr-2" />
                                    Assign Student
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShareDocument(doc);
                                    }}
                                    data-testid={`menu-share-${doc.id}`}
                                  >
                                    <Share className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDocument(doc.id, doc.file_name);
                                    }}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    data-testid={`menu-delete-${doc.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {/* Content Details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {doc.category && (
                                  <Badge 
                                    variant={doc.category === 'AI Analysis' ? 'default' : 'secondary'} 
                                    className={cn(
                                      "text-xs",
                                      doc.category === 'AI Analysis' 
                                        ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" 
                                        : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                    )}
                                  >
                                    {doc.category === 'AI Analysis' && <Brain className="h-3 w-3 mr-1" />}
                                    {doc.category}
                                  </Badge>
                                )}
                                {student && (
                                  <Badge variant="outline" className="text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    {student.full_name}
                                  </Badge>
                                )}
                              </div>
                              
                              {doc.created_at && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-3 w-3 mr-1 inline" />
                                  {format(new Date(doc.created_at), 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                          </div>
                        </PremiumCard>
                      );
                    })}
                  </div>
                )}

              </TabsContent>
            </Tabs>
        </ContainerMobile>

        {/* Edit Document Name Dialog */}
        <Dialog open={!!editingDocument} onOpenChange={(open) => !open && setEditingDocument(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Document Name</DialogTitle>
              <DialogDescription>
                Change the display name for this document.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="filename">Document Name</Label>
                <Input
                  id="filename"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter new document name"
                  className="h-12"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="button" onClick={handleUpdateFileName} disabled={!newFileName.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Document Dialog */}
        <Dialog open={viewDialog.isOpen} onOpenChange={(open) => setViewDialog({ ...viewDialog, isOpen: open })}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewDialog.document?.title}</DialogTitle>
              <DialogDescription>
                Document details and content preview
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {viewDialog.document?.category === 'AI Analysis' && (() => {
                let analysisData;
                try {
                  analysisData = (viewDialog.document as any).content ? JSON.parse((viewDialog.document as any).content) : null;
                } catch {
                  analysisData = null;
                }

                if (analysisData) {
                  return (
                    <div className="space-y-6">
                      {analysisData.summary && (
                        <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Summary</h4>
                          <p className="text-blue-700 dark:text-blue-300">{analysisData.summary}</p>
                        </div>
                      )}

                      {analysisData.recommendations && (
                        <div className="border-l-4 border-green-500 pl-4 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Recommendations</h4>
                          <p className="text-green-700 dark:text-green-300">{analysisData.recommendations}</p>
                        </div>
                      )}

                      {analysisData.areasOfConcern && (
                        <div className="border-l-4 border-orange-500 pl-4 bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">Areas of Concern</h4>
                          <p className="text-orange-700 dark:text-orange-300">{analysisData.areasOfConcern}</p>
                        </div>
                      )}

                      {analysisData.strengths && (
                        <div className="border-l-4 border-emerald-500 pl-4 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Strengths</h4>
                          <p className="text-emerald-700 dark:text-emerald-300">{analysisData.strengths}</p>
                        </div>
                      )}

                      {analysisData.actionItems && (
                        <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">Action Items</h4>
                          <p className="text-purple-700 dark:text-purple-300">{analysisData.actionItems}</p>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
              
              {viewDialog.document?.category !== 'AI Analysis' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>File Name</Label>
                      <p className="text-sm text-muted-foreground">{viewDialog.document?.file_name}</p>
                    </div>
                    <div>
                      <Label>File Type</Label>
                      <p className="text-sm text-muted-foreground">{viewDialog.document?.file_type}</p>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <p className="text-sm text-muted-foreground">{viewDialog.document?.category}</p>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <p className="text-sm text-muted-foreground">
                        {viewDialog.document?.file_size ? formatFileSize(viewDialog.document.file_size) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  {viewDialog.document?.description && (
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground">{viewDialog.document.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Student Assignment Dialog */}
        <Dialog open={!!assigningDocument} onOpenChange={(open) => !open && setAssigningDocument(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {assigningDocument === 'BULK_ASSIGN' ? 'Assign Documents to Student' : 'Assign Document to Student'}
              </DialogTitle>
              <DialogDescription>
                {assigningDocument === 'BULK_ASSIGN' 
                  ? `Choose a student to assign ${selectedDocuments.size} selected documents to.`
                  : 'Choose a student to assign this document to.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="student-select">Student</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger id="student-select" className="h-12">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student: Student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssigningDocument(null)}>
                Cancel
              </Button>
              <Button 
                onClick={assigningDocument === 'BULK_ASSIGN' ? handleBulkStudentAssignment : handleUpdateStudentAssignment}
                disabled={!selectedStudentId}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                Assign Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
      </SafeAreaFull>
    </MobileAppShell>
  );
};

export default DocumentVault;
                                    <div className="text-gray-500 dark:text-gray-400 p-4">No action items available</div>
                                  );
                                
