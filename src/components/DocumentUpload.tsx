import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
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
  Tag
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
}

const IEPAnalysisDisplay = ({ analysis }: IEPAnalysisDisplayProps) => {
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
}

export function DocumentUpload({ onAnalysisComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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
        console.error('Upload failed:', error);
        updateFileStatus(fileData.id, 'error');
      }
    }
  }, [user, toast]);

  const uploadFile = async (fileData: UploadedFile) => {
    const filePath = `${user!.id}/${fileData.id}-${fileData.file.name}`;
    
    // Update progress
    const progressInterval = setInterval(() => {
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, progress: Math.min(f.progress + 10, 90) }
          : f
      ));
    }, 100);

    try {
      // Create document record using our API
      const document = await api.createDocument({
        file_name: fileData.file.name,
        file_path: filePath,
        file_type: fileData.file.type,
        file_size: fileData.file.size,
        title: fileData.file.name.split('.')[0]
      });

      clearInterval(progressInterval);

      // For now, create a mock URL since we don't have file storage
      const mockUrl = `http://localhost:3001/files/${filePath}`;

      updateFileStatus(fileData.id, 'completed', mockUrl);
      
      toast({
        title: "Upload successful",
        description: `${fileData.file.name} has been uploaded successfully.`,
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
      await api.createDocument({
        title: fileData.editableName || fileData.file.name,
        description: `Document uploaded on ${new Date().toLocaleDateString()}`,
        file_name: fileData.editableName || fileData.file.name,
        file_path: `vault/uploads/${fileData.id}`,
        file_type: fileData.file.type,
        file_size: fileData.file.size,
        category: 'Upload',
        tags: ['uploaded-document']
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
        reviewId: data.reviewId
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
      console.error('Analysis failed:', error);
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
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium">{fileData.editableName || fileData.file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingFileName(fileData.id)}
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
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
                  <div className="flex items-center gap-1">
                    {fileData.status === 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveToVault(fileData)}
                          className="flex items-center gap-1 h-8"
                          data-testid={`button-save-vault-${fileData.id}`}
                        >
                          <Save className="h-3 w-3" />
                          Save to Vault
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareFile(fileData)}
                          className="flex items-center gap-1 h-8"
                          data-testid={`button-share-${fileData.id}`}
                        >
                          <Share className="h-3 w-3" />
                          Share
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileData.id)}
                      className="h-8 w-8 p-0"
                      data-testid={`button-remove-${fileData.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeDocument(fileData, 'iep')}
                      disabled={analyzing === fileData.id}
                      className="flex items-center gap-1"
                    >
                      {analyzing === fileData.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <FileCheck className="h-3 w-3" />
                      )}
                      IEP Analysis
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeDocument(fileData, 'accommodations')}
                      disabled={analyzing === fileData.id}
                      className="flex items-center gap-1"
                    >
                      {analyzing === fileData.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      Accommodations
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeDocument(fileData, 'meeting_prep')}
                      disabled={analyzing === fileData.id}
                      className="flex items-center gap-1"
                    >
                      {analyzing === fileData.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <MessageSquare className="h-3 w-3" />
                      )}
                      Meeting Prep
                    </Button>
                  </div>
                )}

                {fileData.analysis && <IEPAnalysisDisplay analysis={fileData.analysis} />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}