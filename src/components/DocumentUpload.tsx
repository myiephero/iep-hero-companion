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
  Loader2
} from "lucide-react";

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
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
          title: "Migration in progress",
          description: "Document analysis is temporarily disabled during migration.",
          variant: "destructive",
        });
        
        return;
      }
      
      // For PDF, DOC, DOCX files - use the process-document function
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('analysisType', analysisType);
      
      const data = await api.processDocument(formData);

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
        title: "Migration in progress",
        description: "Document processing is temporarily disabled during migration.",
        variant: "destructive", 
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
                  Supports: TXT, PDF, DOC, DOCX (max 10MB) • For best results, use TXT files
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
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{fileData.file.name}</span>
                    {fileData.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {fileData.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileData.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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

                {fileData.analysis && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {fileData.analysis.type.toUpperCase()} Analysis
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(fileData.analysis.timestamp).toLocaleString()}
                      </Badge>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {typeof fileData.analysis.content === 'string' 
                        ? fileData.analysis.content 
                        : JSON.stringify(fileData.analysis.content, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}