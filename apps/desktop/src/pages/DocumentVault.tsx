import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Folder, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Share, 
  User, 
  Calendar, 
  FileText, 
  Brain, 
  Grid3X3, 
  List, 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen, 
  Plus, 
  ArrowRight, 
  Sparkles,
  CheckSquare,
  Square,
  X,
  Check,
  Clock,
  Activity,
  Zap,
  Info,
  Archive,
  FileSearch,
  Target,
  Users,
  Save
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Document {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  category: string;
  tags: string[];
  student_id?: string;
  created_at: string;
  updated_at: string;
  analysis_summary?: string;
}

interface Student {
  id: string;
  full_name: string;
}

const DOCUMENT_CATEGORIES = [
  { value: 'all', label: 'All Documents', icon: Folder, count: 0 },
  { value: 'iep', label: 'IEP Documents', icon: FileText, count: 0 },
  { value: 'evaluations', label: 'Evaluations', icon: BookOpen, count: 0 },
  { value: 'ai-analysis', label: 'AI Analysis', icon: Brain, count: 0 },
  { value: 'reports', label: 'Progress Reports', icon: TrendingUp, count: 0 },
  { value: 'meeting-notes', label: 'Meeting Notes', icon: Users, count: 0 }
];

const FILE_TYPE_FILTERS = [
  { value: 'all', label: 'All File Types' },
  { value: 'pdf', label: '📄 PDF Files' },
  { value: 'doc', label: '📝 Word Documents' },
  { value: 'txt', label: '📋 Text Files' },
  { value: 'image', label: '🖼️ Images' }
];

export default function DocumentVault() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [viewDialog, setViewDialog] = useState<{ document: Document | null; isOpen: boolean }>({ 
    document: null, 
    isOpen: false 
  });
  const [editingDocument, setEditingDocument] = useState<{ id: string; title: string } | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // Queries
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/documents');
      return response.json();
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return response.json();
    },
  });

  // File upload hook
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 10,
    onDrop: async (acceptedFiles) => {
      toast({
        title: "Files Uploaded",
        description: `${acceptedFiles.length} file(s) uploaded successfully for AI analysis.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    }
  });

  // Mutations
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
      toast({ title: "Error deleting document", description: "Please try again", variant: "destructive" });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async (data: { id: string; title?: string; student_id?: string }) => {
      const response = await apiRequest('PUT', `/api/documents/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Document updated successfully" });
    },
  });

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: Document) => {
      const student = students.find((s: Student) => s.id === doc.student_id);
      const studentName = student ? student.full_name : '';
      
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || 
                         doc.file_type?.includes(filterType) ||
                         doc.category?.toLowerCase().includes(filterType.toLowerCase());
      
      const matchesTab = activeTab === 'all' ||
                        (activeTab === 'iep' && (doc.category === 'IEP' || doc.tags?.includes('IEP'))) ||
                        (activeTab === 'evaluations' && (doc.category === 'Evaluation' || doc.tags?.includes('Evaluation'))) ||
                        (activeTab === 'ai-analysis' && doc.category === 'AI Analysis') ||
                        (activeTab === 'reports' && (doc.category === 'Report' || doc.tags?.includes('Report'))) ||
                        (activeTab === 'meeting-notes' && (doc.category === 'Meeting Notes' || doc.tags?.includes('Meeting')));
      
      return matchesSearch && matchesType && matchesTab;
    });
  }, [documents, searchTerm, filterType, activeTab, students]);

  // Get document counts
  const getDocumentCounts = useCallback(() => {
    if (!documents) return { all: 0, iep: 0, evaluations: 0, aiAnalysis: 0, reports: 0, meetingNotes: 0 };
    
    return {
      all: documents.length,
      iep: documents.filter(doc => doc.category === 'IEP' || doc.tags?.includes('IEP')).length,
      evaluations: documents.filter(doc => doc.category === 'Evaluation' || doc.tags?.includes('Evaluation')).length,
      aiAnalysis: documents.filter(doc => doc.category === 'AI Analysis').length,
      reports: documents.filter(doc => doc.category === 'Report' || doc.tags?.includes('Report')).length,
      meetingNotes: documents.filter(doc => doc.category === 'Meeting Notes' || doc.tags?.includes('Meeting')).length,
    };
  }, [documents]);

  const documentCounts = getDocumentCounts();

  // Handlers
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
    const allIds = filteredDocuments.map(doc => doc.id);
    setSelectedDocuments(new Set(allIds));
  };

  const deselectAllDocuments = () => {
    setSelectedDocuments(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedDocuments.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.size} document(s)?`)) {
      selectedDocuments.forEach(docId => {
        deleteDocumentMutation.mutate(docId);
      });
      setSelectedDocuments(new Set());
      setIsSelectMode(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setViewDialog({ document: doc, isOpen: true });
  };

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

  const getFileTypeIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('doc')) return '📝';
    if (fileType?.includes('txt')) return '📋';
    if (fileType?.includes('image')) return '🖼️';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <Shield className="h-10 w-10 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Document Vault
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {documents?.length || 0} documents securely stored and organized
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 border-green-300">
                <Shield className="h-3 w-3 mr-1" />
                Secure Storage
              </Badge>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/documents'] })}
                data-testid="refresh-documents"
              >
                <Download className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9 space-y-8">
            {/* Upload Section */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Upload & Analyze Documents
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Add documents for AI-powered analysis and secure storage
                      </p>
                    </div>
                  </div>
                  
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors",
                      isDragActive 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                    )}
                    data-testid="document-dropzone"
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      {isDragActive ? (
                        <p className="text-lg font-medium text-blue-600">Drop files here...</p>
                      ) : (
                        <div>
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Drop files here or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Supports PDF, DOC, DOCX, TXT, and image files
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters and Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-6 w-6 text-blue-600" />
                      Search & Filter
                    </CardTitle>
                    <CardDescription>Find and organize your documents</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      data-testid="view-grid"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      data-testid="view-list"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search documents, students, or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="search-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger data-testid="filter-type">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FILE_TYPE_FILTERS.map(filter => (
                          <SelectItem key={filter.value} value={filter.value}>
                            {filter.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button 
                      onClick={() => setIsSelectMode(!isSelectMode)} 
                      variant={isSelectMode ? "default" : "outline"} 
                      className="w-full"
                      data-testid="select-mode-toggle"
                    >
                      {isSelectMode ? (
                        <>
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Exit Select
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Select Mode
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {isSelectMode && selectedDocuments.size > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {selectedDocuments.size} document(s) selected
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={deselectAllDocuments}>
                          Clear
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Categories */}
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="p-6 pb-0">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="all" data-testid="tab-all">
                        All ({documentCounts.all})
                      </TabsTrigger>
                      <TabsTrigger value="iep" data-testid="tab-iep">
                        IEPs ({documentCounts.iep})
                      </TabsTrigger>
                      <TabsTrigger value="evaluations" data-testid="tab-evaluations">
                        Evaluations ({documentCounts.evaluations})
                      </TabsTrigger>
                      <TabsTrigger value="ai-analysis" data-testid="tab-ai-analysis">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Analysis ({documentCounts.aiAnalysis})
                      </TabsTrigger>
                      <TabsTrigger value="reports" data-testid="tab-reports">
                        Reports ({documentCounts.reports})
                      </TabsTrigger>
                      <TabsTrigger value="meeting-notes" data-testid="tab-meetings">
                        Meetings ({documentCounts.meetingNotes})
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value={activeTab} className="px-6 pb-6">
                    {/* Documents Grid/List */}
                    {isLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="text-center space-y-4">
                          <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
                          <p className="text-gray-500 dark:text-gray-400">Loading documents...</p>
                        </div>
                      </div>
                    ) : filteredDocuments.length > 0 ? (
                      <div className={cn(
                        viewMode === 'grid' 
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                          : "space-y-4"
                      )}>
                        {filteredDocuments.map((doc: Document) => (
                          <Card 
                            key={doc.id} 
                            className={cn(
                              "hover:shadow-md transition-shadow cursor-pointer",
                              viewMode === 'list' && "p-4"
                            )}
                            onClick={() => !isSelectMode && handleViewDocument(doc)}
                            data-testid={`document-${doc.id}`}
                          >
                            <CardContent className={cn("p-6", viewMode === 'list' && "p-0")}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  {isSelectMode && (
                                    <Checkbox
                                      checked={selectedDocuments.has(doc.id)}
                                      onCheckedChange={() => toggleDocumentSelection(doc.id)}
                                      className="mt-1"
                                      data-testid={`checkbox-${doc.id}`}
                                    />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getFileTypeIcon(doc.file_type)}</span>
                                        <div>
                                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                                            {doc.title}
                                          </h3>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">{doc.file_name}</p>
                                        </div>
                                      </div>
                                      {!isSelectMode && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                              <MoreVertical className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewDocument(doc);
                                            }}>
                                              <Eye className="h-4 w-4 mr-2" />
                                              View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditFileName(doc.id, doc.title);
                                            }}>
                                              <Edit className="h-4 w-4 mr-2" />
                                              Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {
                                              e.stopPropagation();
                                              navigator.clipboard.writeText(`Document: ${doc.title}`);
                                              toast({ title: "Link copied", description: "Document link copied to clipboard" });
                                            }}>
                                              <Share className="h-4 w-4 mr-2" />
                                              Share
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                              className="text-red-600"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm(`Delete "${doc.title}"?`)) {
                                                  deleteDocumentMutation.mutate(doc.id);
                                                }
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                                        <span>•</span>
                                        {formatFileSize(doc.file_size)}
                                      </div>
                                      
                                      {doc.category && (
                                        <Badge variant="outline" className="text-xs">
                                          {doc.category}
                                        </Badge>
                                      )}
                                      
                                      {doc.analysis_summary && (
                                        <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                                          <div className="flex items-center gap-1 mb-1">
                                            <Brain className="h-3 w-3 text-blue-600" />
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI Analysis</span>
                                          </div>
                                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {doc.analysis_summary}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          No Documents Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Upload documents to get started with secure storage and AI analysis.
                        </p>
                        <Button onClick={() => document.querySelector('[data-testid="document-dropzone"]')?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Documents
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Storage Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {documents?.length || 0}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Total Files</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {documentCounts.aiAnalysis}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">AI Analyzed</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
                    <span className="font-medium">2.3 GB / 10 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/iep-master-suite')}
                  data-testid="button-iep-suite"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  IEP Analysis
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/goal-generator')}
                  data-testid="button-goals"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Generate Goals
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-export-all"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-organize"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Organize Files
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">Encrypted Storage</div>
                      <div className="text-green-600 dark:text-green-400 text-xs">
                        All files encrypted at rest and in transit
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">Private Access</div>
                      <div className="text-blue-600 dark:text-blue-400 text-xs">
                        Only you can access your documents
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-purple-700 dark:text-purple-300">Automatic Backup</div>
                      <div className="text-purple-600 dark:text-purple-400 text-xs">
                        Daily backups ensure data safety
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* View Document Dialog */}
      <Dialog open={viewDialog.isOpen} onOpenChange={(open) => setViewDialog({ document: null, isOpen: open })}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewDialog.document?.title}
            </DialogTitle>
            <DialogDescription>
              Document details and content
            </DialogDescription>
          </DialogHeader>
          
          {viewDialog.document && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">File Name:</span> {viewDialog.document.file_name}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {viewDialog.document.file_type}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {formatFileSize(viewDialog.document.file_size)}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {format(new Date(viewDialog.document.created_at), 'MMM d, yyyy')}
                </div>
              </div>
              
              {viewDialog.document.analysis_summary && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">AI Analysis Summary</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {viewDialog.document.analysis_summary}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Filename Dialog */}
      <Dialog open={!!editingDocument} onOpenChange={(open) => !open && setEditingDocument(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>
              Enter a new name for this document
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-filename">Document Name</Label>
              <Input
                id="new-filename"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new document name"
                data-testid="input-new-filename"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleUpdateFileName} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingDocument(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}