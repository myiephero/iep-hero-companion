import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Get object storage config from environment
const PRIVATE_OBJECT_DIR = process.env.PRIVATE_OBJECT_DIR || '';

// Handle PUBLIC_OBJECT_SEARCH_PATHS - it may be a string path or JSON array
let PUBLIC_OBJECT_SEARCH_PATHS: string[] = [];
try {
  const pathsEnv = process.env.PUBLIC_OBJECT_SEARCH_PATHS || '[]';
  if (pathsEnv.startsWith('[') || pathsEnv.startsWith('{')) {
    // It's JSON
    PUBLIC_OBJECT_SEARCH_PATHS = JSON.parse(pathsEnv);
  } else {
    // It's a single path string, wrap it in an array
    PUBLIC_OBJECT_SEARCH_PATHS = [pathsEnv];
  }
} catch (error) {
  console.warn('Failed to parse PUBLIC_OBJECT_SEARCH_PATHS, using default:', error);
  PUBLIC_OBJECT_SEARCH_PATHS = [];
}

if (!PRIVATE_OBJECT_DIR) {
  throw new Error('PRIVATE_OBJECT_DIR environment variable not set');
}

export interface UploadResult {
  filePath: string;
  downloadUrl: string;
  previewUrl?: string;
}

export interface PresignedUploadData {
  uploadUrl: string;
  filePath: string;
  headers: Record<string, string>;
}

// Upload file to object storage
export async function uploadFileToStorage(
  fileBuffer: Buffer,
  filePath: string,
  contentType: string
): Promise<UploadResult> {
  try {
    // Create full file path in private storage
    const fullPath = path.join(PRIVATE_OBJECT_DIR, filePath);
    
    // Ensure directory exists
    const dirPath = path.dirname(fullPath);
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write file to object storage
    await fs.writeFile(fullPath, fileBuffer);
    
    // Generate download URL (for now using file path, in production this would be a signed URL)
    const downloadUrl = `/api/messaging/download/${encodeURIComponent(filePath)}`;
    
    // Generate preview URL for images and PDFs
    let previewUrl: string | undefined;
    if (contentType.startsWith('image/') || contentType === 'application/pdf') {
      previewUrl = downloadUrl;
    }
    
    return {
      filePath,
      downloadUrl,
      previewUrl
    };
  } catch (error) {
    console.error('Error uploading file to storage:', error);
    throw new Error('Failed to upload file');
  }
}

// Generate presigned upload URL (simulated for now)
export async function generatePresignedUpload(
  filePath: string,
  contentType: string,
  contentLength: number
): Promise<PresignedUploadData> {
  // In a real implementation, this would generate a presigned URL to cloud storage
  // For now, we'll return a direct upload endpoint
  
  const uploadId = crypto.randomBytes(16).toString('hex');
  
  return {
    uploadUrl: `/api/messaging/upload/${uploadId}`,
    filePath,
    headers: {
      'Content-Type': contentType,
      'Content-Length': contentLength.toString(),
      'X-Upload-Path': filePath,
    }
  };
}

// Get download URL for a file
export function getDownloadUrl(filePath: string): string {
  return `/api/messaging/download/${encodeURIComponent(filePath)}`;
}

// Get file from storage
export async function getFileFromStorage(filePath: string): Promise<{
  buffer: Buffer;
  contentType: string;
  fileName: string;
} | null> {
  try {
    const fullPath = path.join(PRIVATE_OBJECT_DIR, filePath);
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return null;
    }
    
    // Read file
    const buffer = await fs.readFile(fullPath);
    
    // Determine content type from file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    const fileName = path.basename(filePath);
    
    return {
      buffer,
      contentType,
      fileName
    };
  } catch (error) {
    console.error('Error getting file from storage:', error);
    return null;
  }
}

// Delete file from storage
export async function deleteFileFromStorage(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(PRIVATE_OBJECT_DIR, filePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting file from storage:', error);
    return false;
  }
}

// Clean up orphaned files (for maintenance)
export async function cleanupOrphanedFiles(activePaths: string[]): Promise<number> {
  // This would be used to clean up files that are no longer referenced in the database
  // Implementation depends on your cleanup strategy
  return 0;
}