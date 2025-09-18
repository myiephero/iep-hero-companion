import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle,
  Image as ImageIcon,
  File,
  Paperclip,
  Loader2
} from "lucide-react";

export interface MessageFile {
  file: File;
  id: string;
  documentId?: string; // ID from database after successful upload
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  downloadUrl?: string;
  previewUrl?: string;
  errorMessage?: string;
}

interface MessageFileUploadProps {
  onFilesChange: (files: MessageFile[]) => void;
  files: MessageFile[];
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  disabled?: boolean;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default
const LARGE_FILE_WARNING_SIZE = 5 * 1024 * 1024; // 5MB warning threshold

// Helper to get file icon based on type
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType.includes('pdf')) return FileText;
  return File;
};

// Helper to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to create preview for images
const createImagePreview = (file: File): Promise<string> => {
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

export function MessageFileUpload({ 
  onFilesChange, 
  files, 
  maxFiles = 5, 
  maxFileSize = MAX_FILE_SIZE,
  disabled = false 
}: MessageFileUploadProps) {
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const reasons = rejectedFiles.map(({ errors }) => 
        errors.map((error: any) => error.message).join(', ')
      ).join('; ');
      
      toast({
        title: "Some files were rejected",
        description: reasons,
        variant: "destructive",
      });
    }

    // Check for large files that may cause performance issues
    const largeFiles = acceptedFiles.filter(file => file.size > LARGE_FILE_WARNING_SIZE);
    if (largeFiles.length > 0) {
      toast({
        title: "Large file detected",
        description: `Files over ${formatFileSize(LARGE_FILE_WARNING_SIZE)} may take longer to upload and process.`,
        variant: "default",
      });
    }

    // Check total file limit
    if (files.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed. Remove some files first.`,
        variant: "destructive",
      });
      return;
    }

    // Process accepted files
    const newFiles: MessageFile[] = acceptedFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: 'uploading' as const,
    }));

    // Update files immediately
    const updatedFiles = [...files, ...newFiles];
    onFilesChange(updatedFiles);

    // Process each file (simulate upload progress and create preview)
    for (const fileData of newFiles) {
      try {
        await processFile(fileData, updatedFiles, onFilesChange);
      } catch (error) {
        console.error('Error processing file:', error);
        updateFileStatus(fileData.id, 'error', updatedFiles, onFilesChange);
      }
    }
  }, [files, maxFiles, toast, onFilesChange]);

  const processFile = async (
    fileData: MessageFile, 
    allFiles: MessageFile[], 
    updateCallback: (files: MessageFile[]) => void
  ) => {
    try {
      // Create preview for images first
      let previewUrl: string | undefined;
      if (fileData.file.type.startsWith('image/')) {
        try {
          previewUrl = await createImagePreview(fileData.file);
        } catch (error) {
          console.warn('Failed to create image preview:', error);
        }
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('files', fileData.file);

      // Upload file using direct upload endpoint
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateCallback(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, progress: Math.min(progress, 95) } // Cap at 95% until complete
              : f
          ));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            const uploadedFile = response.files?.[0];
            
            if (uploadedFile) {
              updateCallback(prev => prev.map(f => 
                f.id === fileData.id 
                  ? { 
                      ...f, 
                      progress: 100, 
                      status: 'completed' as const,
                      documentId: uploadedFile.documentId,
                      downloadUrl: uploadedFile.downloadUrl,
                      previewUrl: uploadedFile.previewUrl || previewUrl
                    }
                  : f
              ));
            } else {
              throw new Error('Invalid response format');
            }
          } catch (error) {
            console.error('Error parsing upload response:', error);
            updateFileStatus(fileData.id, 'error', allFiles, updateCallback, 'Invalid response from server');
          }
        } else {
          let errorMessage = `Upload failed (${xhr.status})`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorMessage;
          } catch (e) {
            // Use default error message
          }
          updateFileStatus(fileData.id, 'error', allFiles, updateCallback, errorMessage);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        updateFileStatus(fileData.id, 'error', allFiles, updateCallback, 'Network error during upload');
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        updateFileStatus(fileData.id, 'error', allFiles, updateCallback, 'Upload cancelled');
      });

      // Get auth token for request
      const authToken = localStorage.getItem('authToken');
      
      // Start upload
      xhr.open('POST', `/api/messaging/upload/${crypto.randomUUID()}`);
      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }
      xhr.send(formData);

    } catch (error) {
      console.error('Error starting file upload:', error);
      updateFileStatus(fileData.id, 'error', allFiles, updateCallback, 'Failed to start upload');
    }
  };

  const updateFileStatus = (
    id: string, 
    status: MessageFile['status'],
    allFiles: MessageFile[],
    updateCallback: (files: MessageFile[]) => void,
    errorMessage?: string
  ) => {
    updateCallback(allFiles.map(f => 
      f.id === id 
        ? { 
            ...f, 
            status, 
            progress: status === 'completed' ? 100 : f.progress,
            errorMessage: status === 'error' ? errorMessage : undefined
          } 
        : f
    ));
    
    // Show toast for errors
    if (status === 'error' && errorMessage) {
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    onFilesChange(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles,
    maxSize: maxFileSize,
    disabled,
  });

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        data-testid="file-drop-zone"
      >
        <input {...getInputProps()} data-testid="file-input" />
        <div className="flex flex-col items-center gap-2">
          <Paperclip className="h-6 w-6 text-muted-foreground" />
          <div className="text-sm">
            {isDragActive ? (
              <p className="text-primary font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="font-medium">Drag & drop files or click to browse</p>
                <p className="text-muted-foreground">
                  PDF, DOC, images up to {formatFileSize(maxFileSize)} each
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {files.map((fileData) => {
            const FileIcon = getFileIcon(fileData.file.type);
            
            return (
              <div 
                key={fileData.id} 
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
                data-testid={`file-item-${fileData.id}`}
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {fileData.previewUrl || fileData.downloadUrl ? (
                    <img 
                      src={fileData.previewUrl || fileData.downloadUrl} 
                      alt={fileData.file.name}
                      className="h-8 w-8 rounded object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <FileIcon className={`h-8 w-8 text-muted-foreground ${fileData.previewUrl || fileData.downloadUrl ? 'hidden' : ''}`} />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">
                      {fileData.file.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileData.id)}
                      className="h-6 w-6 p-0 hover:bg-destructive/10"
                      data-testid={`remove-file-${fileData.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(fileData.file.size)}
                    </p>
                    
                    {fileData.status === 'uploading' && (
                      <>
                        <div className="flex-1">
                          <Progress value={fileData.progress} className="h-1" />
                        </div>
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </>
                    )}
                    
                    {fileData.status === 'completed' && (
                      <Badge variant="secondary" className="text-xs">
                        Ready
                      </Badge>
                    )}
                    
                    {fileData.status === 'error' && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fileData.errorMessage ? 'Error' : 'Failed'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* File Limits Info */}
      {files.length > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{files.length} of {maxFiles} files</span>
          <span>
            {files.filter(f => f.status === 'completed').length} ready to send
          </span>
        </div>
      )}

      {/* Error Messages */}
      {files.some(f => f.status === 'error') && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some files failed to upload. Please try again or remove the failed files.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default MessageFileUpload;