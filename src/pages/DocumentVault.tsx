
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Eye,
  Calendar,
  Shield,
  Folder,
  Upload,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const DocumentVault = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  // Get students for search functionality
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.getStudents()
  });

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.getDocuments()
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
                        <h4 className="font-medium">{doc.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{doc.file_name}</span>
                          <span>{doc.file_size ? formatFileSize(doc.file_size) : 'Unknown size'}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(doc.created_at || ''), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {doc.student_id && (() => {
                          const student = students?.find(s => s.id === doc.student_id);
                          return student ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Student: {student.full_name}
                              </Badge>
                            </div>
                          ) : null;
                        })()}
                        {doc.category && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {doc.category}
                            </Badge>
                          </div>
                        )}
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
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
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
