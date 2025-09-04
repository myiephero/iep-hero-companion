import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Brain,
  FileCheck,
  Users,
  MessageSquare,
  Loader2,
  Target,
  TrendingUp,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  Share,
  Tag,
  MoreVertical,
  Eye,
  Download,
  UserPlus
} from "lucide-react";

// Helper function to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || '');
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Helper function to read file as base64 (for PDFs)
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result || '');
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// IEP Analysis Display Component
interface IEPAnalysisDisplayProps {
  analysis: {
    type: string;
    content: string;
    timestamp: string;
  };
  onSaveToVault?: () => void;
  onCreateLetter?: () => void;
  onMeetingPrep?: () => void;
}

const IEPAnalysisDisplay = ({ analysis, onSaveToVault, onCreateLetter, onMeetingPrep }: IEPAnalysisDisplayProps) => {
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({});
  let parsedAnalysis;

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isSectionCollapsed = (section: string) => {
    return collapsedSections[section] || false;
  };
  
  try {
    parsedAnalysis = typeof analysis.content === 'string' 
      ? JSON.parse(analysis.content) 
      : analysis.content;
  } catch (error) {
    // Fallback for non-JSON content
    return (
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-medium">{analysis.type.toUpperCase()} Analysis</span>
          <Badge variant="secondary" className="text-xs">
            {new Date(analysis.timestamp).toLocaleString()}
          </Badge>
        </div>
        <div className="text-sm whitespace-pre-wrap">{analysis.content}</div>
      </div>
    );
  }

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-700';
      case 'good': return 'bg-blue-100 text-blue-700';
      case 'needs improvement': return 'bg-yellow-100 text-yellow-700';
      case 'poor': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">{analysis.type.toUpperCase()} Analysis Results</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(analysis.timestamp).toLocaleString()}
          </Badge>
          {parsedAnalysis.compliance_score && (
            <Badge className={`${getComplianceColor(parsedAnalysis.compliance_score)} font-medium`}>
              <Shield className="h-3 w-3 mr-1" />
              {parsedAnalysis.compliance_score}/100
            </Badge>
          )}
          {parsedAnalysis.status && (
            <Badge className={getStatusColor(parsedAnalysis.status)}>
              {parsedAnalysis.status}
            </Badge>
          )}
          {(onSaveToVault || onCreateLetter || onMeetingPrep) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-analysis-actions"
                >
                  <Save className="h-3 w-3" />
                  Actions
                  <ChevronDown className="h-2 w-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onSaveToVault && (
                  <DropdownMenuItem 
                    onClick={onSaveToVault}
                    className="flex items-center gap-2"
                    data-testid="menu-save-vault"
                  >
                    <Save className="h-4 w-4" />
                    Save to Vault
                  </DropdownMenuItem>
                )}
                {onCreateLetter && (
                  <DropdownMenuItem 
                    onClick={onCreateLetter}
                    className="flex items-center gap-2"
                    data-testid="menu-create-letter"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Create Letter
                  </DropdownMenuItem>
                )}
                {onMeetingPrep && (
                  <DropdownMenuItem 
                    onClick={onMeetingPrep}
                    className="flex items-center gap-2"
                    data-testid="menu-meeting-prep"
                  >
                    <Users className="h-4 w-4" />
                    Meeting Prep
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    const dataStr = JSON.stringify(analysis, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = `${analysis.type}-analysis-${new Date().toISOString().split('T')[0]}.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                  className="flex items-center gap-2"
                  data-testid="menu-export-analysis"
                >
                  <Download className="h-4 w-4" />
                  Export Analysis
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
                  }}
                  className="flex items-center gap-2"
                  data-testid="menu-copy-clipboard"
                >
                  <Share className="h-4 w-4" />
                  Copy to Clipboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Summary */}
      {parsedAnalysis.summary && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Executive Summary
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('summary')}
                className="h-8 w-8 p-0"
              >
                {isSectionCollapsed('summary') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!isSectionCollapsed('summary') && (
            <CardContent>
              <p className="text-sm leading-relaxed">{parsedAnalysis.summary}</p>
            </CardContent>
          )}
        </Card>
      )}

      {/* Recommendations */}
      {parsedAnalysis.recommendations && parsedAnalysis.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Key Recommendations
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('recommendations')}
                className="h-8 w-8 p-0"
              >
                {isSectionCollapsed('recommendations') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!isSectionCollapsed('recommendations') && (
            <CardContent>
              <ul className="space-y-2">
                {parsedAnalysis.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="text-xs font-medium mt-0.5 shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {/* Areas of Concern */}
      {parsedAnalysis.areas_of_concern && parsedAnalysis.areas_of_concern.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Areas of Concern
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('concerns')}
                className="h-8 w-8 p-0"
              >
                {isSectionCollapsed('concerns') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!isSectionCollapsed('concerns') && (
            <CardContent>
              <ul className="space-y-2">
                {parsedAnalysis.areas_of_concern.map((concern: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs mt-0.5 shrink-0 bg-amber-100 text-amber-700">
                      ⚠
                    </Badge>
                    <span className="leading-relaxed">{concern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {/* Strengths */}
      {parsedAnalysis.strengths && parsedAnalysis.strengths.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Identified Strengths
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('strengths')}
                className="h-8 w-8 p-0"
              >
                {isSectionCollapsed('strengths') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!isSectionCollapsed('strengths') && (
            <CardContent>
              <ul className="space-y-2">
                {parsedAnalysis.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs mt-0.5 shrink-0 bg-green-100 text-green-700">
                      ✓
                    </Badge>
                    <span className="leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {/* Action Items */}
      {parsedAnalysis.action_items && parsedAnalysis.action_items.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-purple-600" />
                Next Steps & Action Items
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('actions')}
                className="h-8 w-8 p-0"
              >
                {isSectionCollapsed('actions') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!isSectionCollapsed('actions') && (
            <CardContent>
              <ul className="space-y-2">
                {parsedAnalysis.action_items.map((action: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="text-xs font-medium mt-0.5 shrink-0 bg-purple-50 text-purple-700 border-purple-200">
                      {index + 1}
                    </Badge>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  editableName?: string;
  isEditing?: boolean;
  analysis?: {
    type: string;
    content: string;
    timestamp: string;
  };
}

interface DocumentUploadProps {
  onAnalysisComplete?: (analysis: any) => void;
  selectedAnalysisType?: string;
}

interface Student {
  id: string;
  full_name: string;
  grade_level?: string;
}

export function DocumentUpload({ onAnalysisComplete, selectedAnalysisType = 'iep_quality' }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [assignStudentFileId, setAssignStudentFileId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Use authenticated request with Bearer token
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/students', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data || []);
        }
      } catch (error) {
        // Error fetching students - continuing with empty list
        console.error('Error fetching students:', error);
      }
    };
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload documents.",
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Upload each file
    for (const fileData of newFiles) {
      try {
        await uploadFile(fileData);
      } catch (error) {
        // Upload failed - error handled by toast notification
        updateFileStatus(fileData.id, 'error');
      }
    }
  }, [user, toast]);

  const uploadFile = async (fileData: UploadedFile) => {
    // Update progress
    const progressInterval = setInterval(() => {
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, progress: Math.min(f.progress + 10, 90) }
          : f
      ));
    }, 100);

    try {
      // Simulate file upload processing (in a real app, this would upload to storage)
      await new Promise(resolve => setTimeout(resolve, 1000));

      clearInterval(progressInterval);

      updateFileStatus(fileData.id, 'completed');
      
      toast({
        title: "Upload successful",
        description: `${fileData.file.name} has been uploaded and is ready for analysis.`,
      });

    } catch (error: any) {
      clearInterval(progressInterval);
      updateFileStatus(fileData.id, 'error');
      
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const updateFileStatus = (
    id: string, 
    status: UploadedFile['status'], 
    url?: string
  ) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, status, progress: status === 'completed' ? 100 : f.progress, url }
        : f
    ));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startEditingFileName = (id: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, isEditing: true, editableName: f.editableName || f.file.name }
        : f
    ));
  };

  const saveFileName = (id: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, isEditing: false }
        : f
    ));
  };

  const updateFileName = (id: string, newName: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, editableName: newName }
        : f
    ));
  };

  // Save to vault functionality
  const saveToVault = async (fileData: UploadedFile) => {
    try {
      const response = await apiRequest('POST', '/api/documents', {
        title: fileData.editableName || fileData.file.name,
        description: `Document uploaded on ${new Date().toLocaleDateString()}`,
        file_name: fileData.editableName || fileData.file.name,
        file_path: `vault/uploads/${fileData.id}`,
        file_type: fileData.file.type,
        file_size: fileData.file.size,
        category: 'Upload',
        tags: ['uploaded-document']
      });
      
      // Invalidate documents cache to refresh the vault
      await import('@/lib/queryClient').then(({ queryClient }) => {
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      });
      
      toast({
        title: "Saved to Vault",
        description: "File has been saved to your document vault.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save to vault. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveAnalysisToVault = async (fileData: UploadedFile) => {
    if (!fileData.analysis) return;
    
    try {
      const analysisTitle = `${fileData.analysis.type.toUpperCase()} Analysis - ${fileData.editableName || fileData.file.name}`;
      const analysisDescription = `${fileData.analysis.type} analysis completed on ${new Date(fileData.analysis.timestamp).toLocaleDateString()}`;
      
      // Store the structured parsed analysis data
      const structuredContent = JSON.stringify((fileData.analysis as any).parsedAnalysis || JSON.parse(fileData.analysis.content));
      
      const response = await apiRequest('POST', '/api/documents', {
        title: analysisTitle,
        description: analysisDescription,
        file_name: `${analysisTitle}.json`,
        file_path: `vault/analysis/${fileData.id}-${fileData.analysis.type}`,
        file_type: 'application/json',
        file_size: new Blob([structuredContent]).size,
        category: 'AI Analysis',
        tags: [fileData.analysis.type, 'analysis-result', 'ai-generated']
      });
      
      // Invalidate documents cache to refresh the vault
      await import('@/lib/queryClient').then(({ queryClient }) => {
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      });
      
      toast({
        title: "Analysis Saved to Vault",
        description: `${fileData.analysis.type.toUpperCase()} analysis has been saved to your document vault.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save analysis to vault. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Share functionality
  const shareFile = async (fileData: UploadedFile) => {
    const shareText = `Check out this document: ${fileData.editableName || fileData.file.name}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Document Share',
          text: shareText,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard",
          description: "Share text copied to clipboard.",
        });
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard",
        description: "Share text copied to clipboard.",
      });
    }
  };

  // Assign student functionality
  const handleAssignStudent = () => {
    if (!selectedStudentId || !assignStudentFileId) return;
    
    const selectedStudent = students.find(s => s.id === selectedStudentId);
    if (!selectedStudent) return;

    // Update the file with assigned student
    setFiles(prev => prev.map(file => 
      file.id === assignStudentFileId 
        ? { ...file, assignedStudentId: selectedStudentId, assignedStudentName: selectedStudent.full_name }
        : file
    ));

    toast({
      title: "Student Assigned",
      description: `File assigned to ${selectedStudent.full_name}`,
    });

    // Reset dialog state
    setAssignStudentFileId(null);
    setSelectedStudentId("");
  };

  const analyzeDocument = async (fileData: UploadedFile, analysisType: string) => {
    setAnalyzing(fileData.id);

    try {
      // Check if it's a simple text file - handle it directly
      if (fileData.file.type === 'text/plain') {
        const text = await fileData.file.text();
        
        const data = await api.analyzeDocument(text, analysisType);

        const analysis = {
          type: analysisType,
          content: data.analysis,
          timestamp: data.timestamp || new Date().toISOString()
        };

        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, analysis } : f
        ));

        onAnalysisComplete?.(analysis);

        toast({
          title: "Analysis complete",
          description: "Document analysis has been completed successfully.",
        });
      }
      
      // For PDF files - read as base64, for others read as text
      let fileContent: string;
      if (fileData.file.type === 'application/pdf') {
        fileContent = await readFileAsBase64(fileData.file);
      } else {
        fileContent = await readFileAsText(fileData.file);
      }
      
      const data = await api.processDocument({
        fileName: fileData.file.name,
        fileContent: fileContent,
        analysisType: analysisType
      });

      const analysis = {
        type: analysisType,
        content: data.analysis,
        timestamp: new Date().toISOString(),
        documentId: data.documentId,
        parsedAnalysis: data.parsedAnalysis
      };

      setFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, analysis } : f
      ));

      onAnalysisComplete?.(analysis);

      toast({
        title: "Analysis complete",
        description: "Document processing has been completed successfully.",
      });

    } catch (error: any) {
      // Analysis failed - error handled by UI state
      toast({
        title: "Analysis failed", 
        description: error.message || "Failed to analyze document. Please try uploading a text (.txt) file for best results.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Upload & AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: TXT, PDF, DOC, DOCX (max 10MB) • PDF extraction fully supported!
                </p>
              </div>
            )}
          </div>

          <Alert className="mt-4">
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Upload IEP documents, evaluation reports, or other educational documents 
              for AI-powered analysis and insights.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((fileData) => (
              <div key={fileData.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="h-4 w-4" />
                    {fileData.isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={fileData.editableName || fileData.file.name}
                          onChange={(e) => updateFileName(fileData.id, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveFileName(fileData.id);
                            if (e.key === 'Escape') {
                              setFiles(prev => prev.map(f => 
                                f.id === fileData.id 
                                  ? { ...f, isEditing: false, editableName: f.file.name }
                                  : f
                              ));
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveFileName(fileData.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1 group">
                        <span className="font-medium">{fileData.editableName || fileData.file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingFileName(fileData.id)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-edit-name-${fileData.id}`}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {fileData.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {fileData.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {fileData.status === 'completed' && (
                      <>

                        {/* Secondary Actions - Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" data-testid={`button-menu-${fileData.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => window.open(URL.createObjectURL(fileData.file), '_blank')}
                              data-testid={`menu-view-${fileData.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = URL.createObjectURL(fileData.file);
                                a.download = fileData.file.name;
                                a.click();
                              }}
                              data-testid={`menu-download-${fileData.id}`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setAssignStudentFileId(fileData.id)}
                              data-testid={`menu-assign-student-${fileData.id}`}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign to Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => saveToVault(fileData)}
                              data-testid={`menu-save-vault-${fileData.id}`}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save to Vault
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => shareFile(fileData)}
                              data-testid={`menu-share-${fileData.id}`}
                            >
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => startEditingFileName(fileData.id)}
                              data-testid={`menu-edit-name-${fileData.id}`}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Name
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => removeFile(fileData.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              data-testid={`menu-remove-${fileData.id}`}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                    {fileData.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileData.id)}
                        className="h-8 w-8 p-0"
                        data-testid={`button-remove-${fileData.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {fileData.status === 'uploading' && (
                  <Progress value={fileData.progress} className="mb-2" />
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span>{(fileData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <Badge variant="outline">{fileData.file.type}</Badge>
                  <Badge variant={
                    fileData.status === 'completed' ? 'default' :
                    fileData.status === 'error' ? 'destructive' : 'secondary'
                  }>
                    {fileData.status}
                  </Badge>
                </div>

                {fileData.status === 'completed' && (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={analyzing === fileData.id}
                          className="flex items-center gap-2"
                        >
                          {analyzing === fileData.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4" />
                          )}
                          AI Analysis
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem 
                          onClick={() => analyzeDocument(fileData, 'iep_quality')}
                          disabled={analyzing === fileData.id}
                          className="flex items-center gap-2"
                        >
                          <FileCheck className="h-4 w-4" />
                          <div>
                            <div className="font-medium">IEP Quality Review</div>
                            <div className="text-xs text-muted-foreground">Comprehensive quality analysis with scoring</div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => analyzeDocument(fileData, 'compliance_check')}
                          disabled={analyzing === fileData.id}
                          className="flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Compliance Analysis</div>
                            <div className="text-xs text-muted-foreground">Check IDEA compliance and requirements</div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => analyzeDocument(fileData, 'accommodation')}
                          disabled={analyzing === fileData.id}
                          className="flex items-center gap-2"
                        >
                          <Users className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Accommodation Analysis</div>
                            <div className="text-xs text-muted-foreground">Review accommodation effectiveness</div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => analyzeDocument(fileData, 'meeting_prep')}
                          disabled={analyzing === fileData.id}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Meeting Preparation</div>
                            <div className="text-xs text-muted-foreground">Prepare for IEP meetings</div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => analyzeDocument(fileData, 'goal_analysis')}
                          disabled={analyzing === fileData.id}
                          className="flex items-center gap-2"
                        >
                          <Target className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Goal Analysis</div>
                            <div className="text-xs text-muted-foreground">Analyze IEP goals and progress</div>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {fileData.analysis && (
                  <IEPAnalysisDisplay 
                    analysis={fileData.analysis} 
                    onSaveToVault={() => saveAnalysisToVault(fileData)}
                    onCreateLetter={() => {
                      // Create letter based on analysis results
                      const analysisType = fileData.analysis?.type;
                      let letterRoute = '/tools/smart-letter-generator';
                      
                      // Pass analysis context via URL parameters
                      const params = new URLSearchParams({
                        context: 'analysis',
                        analysisType: analysisType || '',
                        fileName: fileData.editableName || fileData.file.name,
                        timestamp: fileData.analysis?.timestamp || new Date().toISOString()
                      });
                      
                      window.location.href = `${letterRoute}?${params.toString()}`;
                    }}
                    onMeetingPrep={() => {
                      // Route based on user role
                      if (user?.user_metadata?.role === 'advocate') {
                        window.location.href = '/advocate/schedule';
                      } else {
                        window.location.href = '/parent/meeting-prep';
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Assign Student Dialog */}
      <Dialog open={!!assignStudentFileId} onOpenChange={(open) => {
        if (!open) {
          setAssignStudentFileId(null);
          setSelectedStudentId("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign to Student</DialogTitle>
            <DialogDescription>
              Select a student to assign this document to for tracking and organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Student</label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student..." />
                </SelectTrigger>
                <SelectContent>
                  {(students || []).map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div>
                        <div className="font-medium">{student.full_name}</div>
                        {student.grade_level && (
                          <div className="text-sm text-muted-foreground">Grade {student.grade_level}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAssignStudentFileId(null);
                  setSelectedStudentId("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignStudent}
                disabled={!selectedStudentId}
              >
                Assign Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default DocumentUpload;
