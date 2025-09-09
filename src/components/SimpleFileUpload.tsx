import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface SimpleFileUploadProps {
  onFileUpload: (file: { name: string; size: number; type: string }) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function SimpleFileUpload({ 
  onFileUpload, 
  maxSize = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt']
}: SimpleFileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Create file object
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type
      };
      
      setUploadedFile(fileData);
      onFileUpload(fileData);
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [maxSize, onFileUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    maxSize: maxSize * 1024 * 1024
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError(null);
  };

  if (uploadedFile) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">{uploadedFile.name}</p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for expert review
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed cursor-pointer transition-colors p-6 ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
        } ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading your IEP document...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs" />
                <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
              </div>
            </>
          ) : (
            <>
              <Upload className={`h-8 w-8 ${error ? 'text-red-500' : 'text-gray-400'}`} />
              <div className="space-y-1">
                <p className={`text-sm font-medium ${error ? 'text-red-700' : ''}`}>
                  {isDragActive ? 'Drop your IEP document here' : 'Drag & drop your IEP document here, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: PDF, DOC, DOCX, TXT (max {maxSize}MB)
                </p>
                {error && (
                  <div className="flex items-center justify-center space-x-1 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-xs">{error}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}