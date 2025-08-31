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
import { Label } from '@/components/ui/label';
import { Shield, Folder, Search, Filter, Download, Upload, Eye, Edit, Trash2, Check, X, MoreVertical, Share, User, Calendar, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Document, Student } from '@shared/schema';
import DocumentUpload from '@/components/DocumentUpload';

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
  const [editingDocument, setEditingDocument] = useState<{ id: string; title: string } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [assigningDocument, setAssigningDocument] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [viewDialog, setViewDialog] = useState<ViewDialogState>({ document: null, isOpen: false });

  // Queries
  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: () => api.getDocuments(),
  });

  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    queryFn: () => api.getStudents(),
  });

  // Mutations
  const updateDocumentMutation = useMutation({
    mutationFn: (data: { id: string; title?: string; student_id?: string }) => api.updateDocument(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Document updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating document", description: error.message, variant: "destructive" });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => api.deleteDocument(id),
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
                       doc.category?.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesType;
  });

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
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Document Vault
          </h1>
          <p className="text-muted-foreground">
            Secure storage and management for all your IEP documents
          </p>
        </div>

        {/* Upload Section */}
        <DocumentUpload onAnalysisComplete={(analysis) => {
          console.log('Analysis completed:', analysis);
        }} />

        {/* Search and Filter */}
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Document Library
            </CardTitle>
            <CardDescription>
              Search and organize your uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by document name, student name, category, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="pdf">PDF Files</SelectItem>
                  <SelectItem value="doc">Word Documents</SelectItem>
                  <SelectItem value="txt">Text Files</SelectItem>
                  <SelectItem value="ai review">AI Reviews</SelectItem>
                  <SelectItem value="upload">Uploaded Files</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={forceRefresh} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Documents Grid */}
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            ) : filteredDocuments?.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  {searchTerm || filterType !== 'all' ? 'No documents match your search' : 'No documents uploaded yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Upload your first document using the form above
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
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
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Document Review</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  IEP Document Review • {format(new Date(doc.created_at || ''), 'M/d/yyyy')}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-6">
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                              IEP
                            </Badge>
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                              MEDIUM COMPLIANCE
                            </Badge>
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                              GOALS ISSUE
                            </Badge>
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                              TRANSITION ISSUE
                            </Badge>
                            <span className="text-sm text-gray-500">+1 more</span>
                            <div className="ml-auto flex items-center gap-4">
                              <Badge variant="outline" className="text-orange-600 border-orange-300">
                                Medium Priority
                              </Badge>
                              <Badge variant="outline" className="text-orange-600 border-orange-300">
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

                          {analysisData && (
                            <div className="space-y-4 mb-6">
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

                              {analysisData.strengths && (
                                <div className="border-l-4 border-emerald-500 pl-4 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg">
                                  <h4 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Strengths</h4>
                                  <p className="text-emerald-700 dark:text-emerald-300">{analysisData.strengths}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                              size="sm"
                              onClick={() => handleViewDocument(doc)}
                            >
                              <FileText className="h-4 w-4" />
                              Save to Vault
                            </Button>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              size="sm"
                              onClick={() => handleDownloadDocument(doc)}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              size="sm"
                              onClick={() => handleShareDocument(doc)}
                            >
                              <Share className="h-4 w-4" />
                              Share
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex items-center gap-2"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  // Regular document rendering for non-AI Analysis documents
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getFileTypeIcon(doc.file_type || '')}</div>
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
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{doc.file_name}</span>
                            <span>{doc.file_size ? formatFileSize(doc.file_size) : 'Unknown size'}</span>
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(doc.created_at || ''), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
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
                      <div className="flex items-center gap-2">
                        {doc.confidential && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Confidential
                          </Badge>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => handleViewDocument(doc)}
                          data-testid={`button-view-${doc.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => handleDownloadDocument(doc)}
                          data-testid={`button-download-${doc.id}`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
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
              <DialogTitle>Assign Student</DialogTitle>
              <DialogDescription>
                Select a student to assign this document to.
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
              <Button type="button" onClick={handleUpdateStudentAssignment} disabled={!selectedStudentId}>
                Assign Student
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
      </div>
    </DashboardLayout>
  );
};

export default DocumentVault;