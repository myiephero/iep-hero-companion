import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Image as ImageIcon, 
  File, 
  Download, 
  Eye,
  ExternalLink,
  Loader2
} from "lucide-react";

export interface MessageAttachment {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  created_at: string;
  downloadUrl?: string; // Secure download URL from API
  previewUrl?: string; // Secure preview URL for images/PDFs
}

interface MessageAttachmentDisplayProps {
  attachments: MessageAttachment[];
  compact?: boolean;
}

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

// Helper to get file type display name
const getFileTypeDisplay = (fileType: string) => {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'text/plain': 'TXT',
    'image/jpeg': 'JPG',
    'image/jpg': 'JPG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WEBP'
  };
  return typeMap[fileType] || fileType.split('/')[1]?.toUpperCase() || 'FILE';
};

// Helper to check if file is an image that can be previewed
const isImageFile = (fileType: string) => {
  return fileType.startsWith('image/') && ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(fileType);
};

export function MessageAttachmentDisplay({ attachments, compact = false }: MessageAttachmentDisplayProps) {
  const { toast } = useToast();
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = async (attachment: MessageAttachment) => {
    if (!attachment.downloadUrl) {
      toast({
        title: "Download unavailable",
        description: "Download link not available for this file",
        variant: "destructive",
      });
      return;
    }

    try {
      setDownloadingFiles(prev => new Set(prev).add(attachment.id));

      // Use the secure download URL
      const response = await fetch(attachment.downloadUrl, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = attachment.file_name;
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `${attachment.file_name} is downloading`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(attachment.id);
        return newSet;
      });
    }
  };

  const handlePreview = (attachment: MessageAttachment) => {
    const previewUrl = attachment.previewUrl || attachment.downloadUrl;
    
    if (!previewUrl) {
      toast({
        title: "Preview unavailable",
        description: "Preview not available for this file",
        variant: "destructive",
      });
      return;
    }

    // Navigate in same window to avoid Safari redirect on mobile
    window.location.replace(previewUrl);
  };

  if (compact && attachments.length === 1) {
    // Single attachment compact view
    const attachment = attachments[0];
    const FileIcon = getFileIcon(attachment.file_type);
    const canPreview = attachment.previewUrl && (isImageFile(attachment.file_type) || attachment.file_type === 'application/pdf');
    const isDownloading = downloadingFiles.has(attachment.id);

    return (
      <div 
        className="flex items-center gap-2 p-2 bg-muted/30 rounded border max-w-xs"
        data-testid={`attachment-compact-${attachment.id}`}
      >
        <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{attachment.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {getFileTypeDisplay(attachment.file_type)} • {formatFileSize(attachment.file_size)}
          </p>
        </div>
        <div className="flex gap-1">
          {canPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreview(attachment)}
              className="h-6 w-6 p-0"
              data-testid={`preview-${attachment.id}`}
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(attachment)}
            className="h-6 w-6 p-0"
            disabled={isDownloading}
            data-testid={`download-${attachment.id}`}
          >
            {isDownloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    );
  }

  // Full attachment list view
  return (
    <div className="space-y-2 mt-2" data-testid="attachments-list">
      {attachments.map((attachment) => {
        const FileIcon = getFileIcon(attachment.file_type);
        const canPreview = attachment.previewUrl && (isImageFile(attachment.file_type) || attachment.file_type === 'application/pdf');
    const isDownloading = downloadingFiles.has(attachment.id);

        return (
          <div 
            key={attachment.id}
            className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border"
            data-testid={`attachment-${attachment.id}`}
          >
            {/* File Icon/Thumbnail */}
            <div className="flex-shrink-0">
              {attachment.previewUrl && isImageFile(attachment.file_type) ? (
                <img 
                  src={attachment.previewUrl} 
                  alt={attachment.file_name}
                  className="h-10 w-10 rounded object-cover cursor-pointer"
                  onClick={() => handlePreview(attachment)}
                />
              ) : (
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                <Badge variant="secondary" className="text-xs">
                  {getFileTypeDisplay(attachment.file_type)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1">
              {canPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(attachment)}
                  className="h-8 px-3"
                  data-testid={`preview-${attachment.id}`}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(attachment)}
                className="h-8 px-3"
                disabled={isDownloading}
                data-testid={`download-${attachment.id}`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      })}
      
      {attachments.length > 1 && (
        <p className="text-xs text-muted-foreground">
          {attachments.length} files attached
        </p>
      )}
    </div>
  );
}

export default MessageAttachmentDisplay;