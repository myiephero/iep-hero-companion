import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Shield, Folder, Search, Filter, Download, Upload, Eye, Edit, Trash2, Check, X, MoreVertical, Share, User, Calendar, Clock, FileText, Brain, Square, CheckSquare, Grid3X3, List, Star, TrendingUp, AlertTriangle, BookOpen, FileBarChart } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/lib/supabase';
import DocumentUpload from '@/components/DocumentUpload';

interface ViewDialogState {
  document: Tables<'documents'> | null;
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

  // Handlers
  const handleEditFileName = (id: string, currentTitle: string) => {
    setEditingDocument({ id, title: currentTitle });
    setNewFileName(currentTitle);
  };

  const handleUpdateFileName = () => {
    if (editingDocument && newFileName.trim()) {
      updateDocumentMutation.mutate({
        id: editingDocument.id,
        title: newFileName.trim(),
      });
      setEditingDocument(null);
      setNewFileName('');
    }
  };

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
                         (Array.isArray(doc.tags) ? doc.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) : false);
    
    const matchesType = filterType === 'all' || 
                       doc.file_type?.includes(filterType) ||
                       doc.category?.toLowerCase().includes(filterType.toLowerCase()) ||
                       (filterType === 'ai review' && doc.category === 'AI Analysis');
    
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'iep' && (doc.category === 'IEP' || (Array.isArray(doc.tags) && doc.tags.includes('IEP')))) ||
                      (activeTab === 'evaluations' && (doc.category === 'Evaluation' || (Array.isArray(doc.tags) && doc.tags.includes('Evaluation')))) ||
                      (activeTab === 'ai-analysis' && doc.category === 'AI Analysis') ||
                      (activeTab === 'reports' && (doc.category === 'Report' || (Array.isArray(doc.tags) && doc.tags.includes('Report')))) ||
                      (activeTab === 'meeting-notes' && (doc.category === 'Meeting Notes' || (Array.isArray(doc.tags) && doc.tags.includes('Meeting'))));
    
    return matchesSearch && matchesType && matchesTab;
  });

  // Get document counts for tabs
  const getDocumentCounts = () => {
    if (!documents) return { all: 0, iep: 0, evaluations: 0, aiAnalysis: 0, reports: 0, meetingNotes: 0 };
    
    return {
      all: documents.length,
      iep: documents.filter(doc => doc.category === 'IEP' || (Array.isArray(doc.tags) && doc.tags.includes('IEP'))).length,
      evaluations: documents.filter(doc => doc.category === 'Evaluation' || (Array.isArray(doc.tags) && doc.tags.includes('Evaluation'))).length,
      aiAnalysis: documents.filter(doc => doc.category === 'AI Analysis').length,
      reports: documents.filter(doc => doc.category === 'Report' || (Array.isArray(doc.tags) && doc.tags.includes('Report'))).length,
      meetingNotes: documents.filter(doc => doc.category === 'Meeting Notes' || (Array.isArray(doc.tags) && doc.tags.includes('Meeting'))).length,
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
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                Document Vault
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                Secure, organized storage for all your IEP documents with AI-powered analysis and smart categorization
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div className="text-sm">
                <div className="font-semibold text-green-900 dark:text-green-100">{documents?.length || 0} Documents</div>
                <div className="text-green-600 dark:text-green-400">Securely Stored</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Upload Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <DocumentUpload onAnalysisComplete={(analysis) => {
            console.log('Analysis completed:', analysis);
            refetch(); // Refresh documents after upload
          }} />
        </div>

        {/* Document Categories Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-6 h-auto bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-1 rounded-xl">
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2">
                All ({documentCounts.all})
              </TabsTrigger>
              <TabsTrigger value="iep" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2">
                IEPs ({documentCounts.iep})
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2">
                Evaluations ({documentCounts.evaluations})
              </TabsTrigger>
              <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2">
                AI Analysis ({documentCounts.aiAnalysis})
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2">
                Reports ({documentCounts.reports})
              </TabsTrigger>
              <TabsTrigger value="meeting-notes" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2">
                Meetings ({documentCounts.meetingNotes})
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Enhanced Search and Filter */}
            <Card className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-blue-600" />
                  Search & Filter
                </CardTitle>
                <CardDescription>
                  Find and organize your documents with advanced filtering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, filename, student, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
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
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <Button onClick={forceRefresh} variant="outline" className="gap-2 flex-1 bg-white hover:bg-gray-50 border-gray-300">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button 
                      onClick={() => setIsSelectMode(!isSelectMode)} 
                      variant={isSelectMode ? "default" : "outline"} 
                      className="gap-2 flex-1"
                    >
                      {isSelectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      <span className="hidden sm:inline">
                        {isSelectMode ? "Exit Select" : "Select"}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Enhanced Bulk Actions Toolbar */}
                {isSelectMode && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            {selectedDocuments.size > 0 ? `${selectedDocuments.size} document(s) selected` : 'Select documents for bulk actions'}
                          </span>
                        </div>
                        {filteredDocuments && filteredDocuments.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={selectAllDocuments}
                              disabled={selectedDocuments.size === filteredDocuments.length}
                              className="bg-white hover:bg-blue-50 border-blue-200"
                            >
                              Select All
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={deselectAllDocuments}
                              disabled={selectedDocuments.size === 0}
                              className="bg-white hover:bg-gray-50 border-gray-200"
                            >
                              Deselect All
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {selectedDocuments.size > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
                              <MoreVertical className="h-4 w-4" />
                              Bulk Actions ({selectedDocuments.size})
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
                )}

                {/* Enhanced Documents Display */}
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-lg">Loading your documents...</p>
                  </div>
                ) : filteredDocuments?.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 max-w-md mx-auto">
                      <Upload className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {searchTerm || filterType !== 'all' ? 'No matching documents' : 'No documents yet'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchTerm || filterType !== 'all' 
                          ? 'Try adjusting your search or filter settings' 
                          : 'Upload your first IEP document to get started with AI-powered analysis'}
                      </p>
                      {!searchTerm && filterType === 'all' && (
                        <Button onClick={() => {
                          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                          fileInput?.click();
                        }} className="gap-2">
                          <Upload className="h-4 w-4" />
                          Upload Document
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                {filteredDocuments?.map((doc: Document) => {
                  // Special rendering for AI Analysis documents
                  if (doc.category === 'AI Analysis') {
                    let analysisData;
                    try {
                      analysisData = (doc as any).content ? JSON.parse((doc as any).content) : null;
                    } catch {
                      analysisData = null;
                    }

                    return (
                      <Card key={doc.id} className="overflow-hidden transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 md:gap-4">
                              {isSelectMode && (
                                <button
                                  onClick={() => toggleDocumentSelection(doc.id)}
                                  className="flex-shrink-0"
                                >
                                  {selectedDocuments.has(doc.id) ? (
                                    <CheckSquare className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              )}
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <FileText className="h-4 md:h-5 w-4 md:w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">Document Review</h3>
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                  IEP Document Review • {format(new Date(doc.created_at || ''), 'M/d/yyyy')}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs">
                                IEP
                              </Badge>
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs">
                                MEDIUM COMPLIANCE
                              </Badge>
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs hidden sm:inline-flex">
                                GOALS ISSUE
                              </Badge>
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs hidden md:inline-flex">
                                TRANSITION ISSUE
                              </Badge>
                              <span className="text-xs sm:text-sm text-gray-500 sm:hidden">+2 more</span>
                              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline md:hidden">+1 more</span>
                            </div>
                            <div className="flex items-center gap-2 sm:ml-auto">
                              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                Medium Priority
                              </Badge>
                              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                75% Compliant
                              </Badge>
                            </div>
                          </div>

                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compliance Score</span>
                              <span className="text-sm font-bold text-orange-600">75%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>

                          {analysisData && (() => {
                            const currentSection = activeSection[doc.id] || 'Analysis';
                            
                            const renderSection = () => {
                              switch(currentSection) {
                                case 'Analysis':
                                  return analysisData.summary ? (
                                    <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                                      <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Summary</h4>
                                      <p className="text-blue-700 dark:text-blue-300">{analysisData.summary}</p>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 dark:text-gray-400 p-4">No analysis summary available</div>
                                  );
                                
                                case 'Recommendations':
                                  return (analysisData.recommendations && analysisData.recommendations.length > 0) ? (
                                    <div className="border-l-4 border-green-500 pl-4 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                                      <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Recommendations</h4>
                                      <div className="text-green-700 dark:text-green-300">
                                        {Array.isArray(analysisData.recommendations) ? (
                                          <ul className="list-disc list-inside space-y-1">
                                            {analysisData.recommendations.map((rec: string, index: number) => (
                                              <li key={index}>{rec}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <p>{analysisData.recommendations}</p>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 dark:text-gray-400 p-4">No recommendations available</div>
                                  );
                                
                                case 'Concerns':
                                  return (analysisData.areas_of_concern && analysisData.areas_of_concern.length > 0) ? (
                                    <div className="border-l-4 border-orange-500 pl-4 bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg">
                                      <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">Areas of Concern</h4>
                                      <div className="text-orange-700 dark:text-orange-300">
                                        {Array.isArray(analysisData.areas_of_concern) ? (
                                          <ul className="list-disc list-inside space-y-1">
                                            {analysisData.areas_of_concern.map((concern: string, index: number) => (
                                              <li key={index}>{concern}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <p>{analysisData.areas_of_concern}</p>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 dark:text-gray-400 p-4">No concerns identified</div>
                                  );
                                
                                case 'Strengths':
                                  return (analysisData.strengths && analysisData.strengths.length > 0) ? (
                                    <div className="border-l-4 border-emerald-500 pl-4 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg">
                                      <h4 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Strengths</h4>
                                      <div className="text-emerald-700 dark:text-emerald-300">
                                        {Array.isArray(analysisData.strengths) ? (
                                          <ul className="list-disc list-inside space-y-1">
                                            {analysisData.strengths.map((strength: string, index: number) => (
                                              <li key={index}>{strength}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <p>{analysisData.strengths}</p>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 dark:text-gray-400 p-4">No strengths identified</div>
                                  );
                                
                                case 'Action Items':
                                  return (analysisData.action_items && analysisData.action_items.length > 0) ? (
                                    <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                                      <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">Action Items</h4>
                                      <div className="text-purple-700 dark:text-purple-300">
                                        {Array.isArray(analysisData.action_items) ? (
                                          <ul className="list-disc list-inside space-y-1">
                                            {analysisData.action_items.map((item: string, index: number) => (
                                              <li key={index}>{item}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <p>{analysisData.action_items}</p>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 dark:text-gray-400 p-4">No action items available</div>
                                  );
                                
                                default:
                                  return null;
                              }
                            };

                            return (
                              <div className="mb-6">
                                {renderSection()}
                              </div>
                            );
                          })()}

                          {/* Navigation Toolbar for Sections */}
                          <div className="mb-6">
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
                              {['Analysis', 'Recommendations', 'Concerns', 'Strengths', 'Action Items'].map((section) => {
                                const currentSection = activeSection[doc.id] || 'Analysis';
                                const isActive = currentSection === section;
                                return (
                                  <button
                                    key={section}
                                    onClick={() => setActiveSection(prev => ({ ...prev, [doc.id]: section }))}
                                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                                      isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {section}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* AI Analysis Summary Header */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-5 w-5 text-blue-600" />
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Analysis Summary</h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {editingDocument?.id === doc.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={newFileName}
                                  onChange={(e) => setNewFileName(e.target.value)}
                                  className="h-8 text-sm font-medium"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateFileName();
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  autoFocus
                                  data-testid={`input-edit-filename-${doc.id}`}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={handleUpdateFileName}
                                  data-testid={`button-save-filename-${doc.id}`}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={handleCancelEdit}
                                  data-testid={`button-cancel-filename-${doc.id}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <MoreVertical className="h-4 w-4" />
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    onClick={() => handleViewDocument(doc)}
                                    data-testid={`menu-view-${doc.id}`}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDownloadDocument(doc)}
                                    data-testid={`menu-download-${doc.id}`}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleEditFileName(doc.id, doc.title)}
                                    data-testid={`menu-edit-filename-${doc.id}`}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Name
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleAssignToStudent(doc.id)}
                                    data-testid={`menu-assign-student-${doc.id}`}
                                  >
                                    <User className="h-4 w-4 mr-2" />
                                    Assign Student
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleShareDocument(doc)}
                                    data-testid={`menu-share-${doc.id}`}
                                  >
                                    <Share className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteDocument(doc.id, doc.title)}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    data-testid={`menu-delete-${doc.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  // Regular document rendering for non-AI Analysis documents
                  return (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                        {isSelectMode && (
                          <button
                            onClick={() => toggleDocumentSelection(doc.id)}
                            className="flex-shrink-0"
                          >
                            {selectedDocuments.has(doc.id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        )}
                        <div className="text-xl md:text-2xl flex-shrink-0">{getFileTypeIcon(doc.file_type || '')}</div>
                        <div>
                          {editingDocument?.id === doc.id ? (
                            <div className="flex items-center gap-2 mb-2">
                              <Input
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                className="h-8 text-sm font-medium"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateFileName();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                                autoFocus
                                data-testid={`input-edit-filename-${doc.id}`}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={handleUpdateFileName}
                                data-testid={`button-save-filename-${doc.id}`}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleCancelEdit}
                                data-testid={`button-cancel-filename-${doc.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <h4 className="font-medium">{doc.title}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleEditFileName(doc.id, doc.title)}
                                data-testid={`button-edit-filename-${doc.id}`}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <span className="truncate">{doc.file_name}</span>
                            <span className="text-xs sm:text-sm">{doc.file_size ? formatFileSize(doc.file_size) : 'Unknown size'}</span>
                            <div className="flex items-center gap-4 text-xs sm:text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(doc.created_at || ''), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(doc.created_at || ''), 'h:mm a')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {doc.student_id && (() => {
                              const student = students?.find((s: Student) => s.id === doc.student_id);
                              return student ? (
                                <Badge variant="outline" className="text-xs">
                                  Student: {student.full_name}
                                </Badge>
                              ) : null;
                            })()}
                            {doc.category && (
                              <Badge variant="secondary" className="text-xs">
                                {doc.category}
                              </Badge>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {doc.confidential && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Confidential
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleViewDocument(doc)}
                              data-testid={`menu-view-${doc.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDownloadDocument(doc)}
                              data-testid={`menu-download-${doc.id}`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleEditFileName(doc.id, doc.title)}
                              data-testid={`menu-edit-filename-${doc.id}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Name
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAssignToStudent(doc.id)}
                              data-testid={`menu-assign-student-${doc.id}`}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Assign Student
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleShareDocument(doc)}
                              data-testid={`menu-share-${doc.id}`}
                            >
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDocument(doc.id, doc.file_name)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              data-testid={`menu-delete-${doc.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Assignment Dialog */}
        <Dialog open={assigningDocument !== null} onOpenChange={(open) => !open && setAssigningDocument(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {assigningDocument === 'BULK_ASSIGN' 
                  ? `Assign ${selectedDocuments.size} Documents to Student`
                  : 'Assign Student'
                }
              </DialogTitle>
              <DialogDescription>
                {assigningDocument === 'BULK_ASSIGN'
                  ? `Select a student to assign all ${selectedDocuments.size} selected documents to.`
                  : 'Select a student to assign this document to.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student-select">Student</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student..." />
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
              <Button type="button" variant="outline" onClick={() => setAssigningDocument(null)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={assigningDocument === 'BULK_ASSIGN' ? handleBulkStudentAssignment : handleUpdateStudentAssignment} 
                disabled={!selectedStudentId}
              >
                {assigningDocument === 'BULK_ASSIGN' ? 'Assign All Documents' : 'Assign Student'}
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
                  <SelectTrigger id="student-select">
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
              >
                Assign Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DocumentVault;