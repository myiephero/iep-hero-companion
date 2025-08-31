
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Eye,
  Calendar,
  Clock,
  Shield,
  Folder,
  Upload,
  Trash2,
  Edit,
  User,
  Check,
  X
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const DocumentVault = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingDocument, setEditingDocument] = useState<{id: string, currentName: string} | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [assigningDocument, setAssigningDocument] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const { toast } = useToast();

  // Force refresh function
  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    refetch();
  };

  // Get students for search functionality
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.getStudents()
  });

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.getDocuments(),
    staleTime: 0, // Always refetch to ensure we get the latest data
    gcTime: 0 // Don't cache the data
  });

  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    try {
      await api.deleteDocument(documentId);

      toast({
        title: "Document Deleted",
        description: `Successfully deleted ${fileName}`,
      });

      refetch(); // Refresh the document list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditFileName = (id: string, currentName: string) => {
    setEditingDocument({ id, currentName });
    setNewFileName(currentName);
  };

  const handleUpdateFileName = async () => {
    if (!editingDocument || !newFileName.trim()) return;
    
    try {
      await api.updateDocument(editingDocument.id, { title: newFileName.trim() });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "Document Updated",
        description: `Successfully renamed to "${newFileName.trim()}"`,
      });
      setEditingDocument(null);
      setNewFileName('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document name. Please try again.",
        variant: "destructive",
      });
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

  const handleUpdateStudentAssignment = async () => {
    if (!assigningDocument || !selectedStudentId) return;
    
    try {
      await api.updateDocument(assigningDocument, { student_id: selectedStudentId });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      const student = students?.find(s => s.id === selectedStudentId);
      toast({
        title: "Student Assigned",
        description: `Successfully assigned to ${student?.full_name || 'student'}`,
      });
      setAssigningDocument(null);
      setSelectedStudentId('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents?.filter(doc => {
    // Find student name for this document
    const student = students?.find(s => s.id === doc.student_id);
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
          refetch(); // Refresh the document list
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
                {filteredDocuments?.map((doc) => (
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
                            const student = students?.find(s => s.id === doc.student_id);
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
                    <div className="flex items-center gap-2 flex-wrap">
                      {doc.confidential && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Confidential
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Dialog open={assigningDocument === doc.id} onOpenChange={(open) => !open && setAssigningDocument(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAssignToStudent(doc.id)}
                            data-testid={`button-assign-student-${doc.id}`}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Assign Student
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Assign Student</DialogTitle>
                            <DialogDescription>
                              Select a student to assign this document to: {doc.title}
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
                                  {students?.map((student) => (
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteDocument(doc.id, doc.file_name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DocumentVault;
