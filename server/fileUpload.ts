import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';

// File validation constants
export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_MESSAGE = 5;

// File validation schema
export const fileValidationSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().refine(
    (type) => Object.keys(ALLOWED_FILE_TYPES).includes(type),
    { message: 'File type not allowed' }
  ),
  size: z.number().max(MAX_FILE_SIZE, 'File too large (max 10MB)'),
});

// Batch file validation schema
export const filesValidationSchema = z.array(fileValidationSchema).max(
  MAX_FILES_PER_MESSAGE,
  `Maximum ${MAX_FILES_PER_MESSAGE} files allowed per message`
);

// Sanitize filename to prevent path traversal and injection
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  const baseName = path.basename(fileName);
  
  // Remove dangerous characters and normalize
  const sanitized = baseName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove dangerous chars
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .slice(0, 200); // Limit length
  
  // Ensure we have a valid filename
  if (!sanitized || sanitized === '') {
    return `file_${Date.now()}`;
  }
  
  return sanitized;
}

// Generate secure file path for object storage
export function generateSecureFilePath(fileName: string, userId: string): string {
  const sanitizedName = sanitizeFileName(fileName);
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const userPrefix = userId.slice(0, 8); // Use part of user ID for organization
  
  return `messages/${userPrefix}/${timestamp}_${randomId}_${sanitizedName}`;
}

// Validate file upload request
export function validateFileUpload(file: {
  name: string;
  type: string;
  size: number;
}): { isValid: boolean; error?: string } {
  try {
    fileValidationSchema.parse(file);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors.map(e => e.message).join(', ')
      };
    }
    return {
      isValid: false,
      error: 'Invalid file'
    };
  }
}

// Validate batch file upload
export function validateFilesUpload(files: Array<{
  name: string;
  type: string;
  size: number;
}>): { isValid: boolean; error?: string } {
  try {
    filesValidationSchema.parse(files);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors.map(e => e.message).join(', ')
      };
    }
    return {
      isValid: false,
      error: 'Invalid files'
    };
  }
}

// Get file type category for display
export function getFileCategory(fileType: string): 'document' | 'image' | 'other' {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('text')) return 'document';
  return 'other';
}

// Check if file can be previewed in browser
export function canPreviewFile(fileType: string): boolean {
  return fileType.startsWith('image/') || fileType === 'application/pdf';
}