import { useState } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export interface CapturedImage {
  dataUrl: string;
  format: string;
  fileName: string;
  fileSize: number;
}

export interface CameraCaptureOptions {
  quality?: number; // 0-100
  allowEditing?: boolean;
  source?: 'camera' | 'gallery' | 'prompt';
  maxWidth?: number;
  maxHeight?: number;
}

export function useCameraCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  const isNative = Capacitor.isNativePlatform();

  const capturePhoto = async (options: CameraCaptureOptions = {}): Promise<CapturedImage | null> => {
    const {
      quality = 80,
      allowEditing = true,
      source = 'prompt',
      maxWidth = 1920,
      maxHeight = 1920
    } = options;

    setIsCapturing(true);

    try {
      if (isNative) {
        // Native camera functionality
        const cameraSource = source === 'camera' 
          ? CameraSource.Camera 
          : source === 'gallery'
          ? CameraSource.Photos
          : CameraSource.Prompt;

        const image: Photo = await Camera.getPhoto({
          quality,
          allowEditing,
          resultType: CameraResultType.DataUrl,
          source: cameraSource,
          width: maxWidth,
          height: maxHeight,
          correctOrientation: true,
        });

        if (!image.dataUrl) {
          throw new Error('Failed to capture image');
        }

        // Calculate file size from base64 data
        const base64Length = image.dataUrl.split(',')[1]?.length || 0;
        const fileSize = (base64Length * 3) / 4; // Approximate file size

        return {
          dataUrl: image.dataUrl,
          format: image.format || 'jpeg',
          fileName: `captured-image-${Date.now()}.${image.format || 'jpeg'}`,
          fileSize: Math.round(fileSize)
        };

      } else {
        // Web fallback - use file input
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          
          // Add capture attribute for mobile web browsers
          if (source === 'camera') {
            input.setAttribute('capture', 'environment');
          }

          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
              resolve(null);
              return;
            }

            try {
              // Validate file type
              if (!file.type.startsWith('image/')) {
                throw new Error('Please select an image file');
              }

              // Check file size (max 10MB)
              if (file.size > 10 * 1024 * 1024) {
                throw new Error('Image size must be less than 10MB');
              }

              // Convert to data URL
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                const format = file.type.split('/')[1] || 'jpeg';
                
                resolve({
                  dataUrl,
                  format,
                  fileName: file.name,
                  fileSize: file.size
                });
              };
              reader.onerror = () => reject(new Error('Failed to read file'));
              reader.readAsDataURL(file);

            } catch (error) {
              reject(error);
            }
          };

          input.click();
        });
      }

    } catch (error: any) {
      console.error('Camera capture error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User cancelled')) {
        // User cancelled - don't show error toast
        return null;
      } else if (error.message?.includes('Camera not available')) {
        toast({
          title: "Camera Unavailable",
          description: "Camera is not available on this device. Please try selecting a file instead.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Permission denied')) {
        toast({
          title: "Permission Denied", 
          description: "Camera permission is required. Please enable camera access in your device settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Capture Failed",
          description: error.message || "Failed to capture image. Please try again.",
          variant: "destructive",
        });
      }

      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const captureFromCamera = () => capturePhoto({ source: 'camera' });
  const captureFromGallery = () => capturePhoto({ source: 'gallery' });
  const captureWithPrompt = () => capturePhoto({ source: 'prompt' });

  // Convert captured image to File object for compatibility with existing upload logic
  const convertToFile = (capturedImage: CapturedImage): File => {
    // Convert data URL to blob
    const base64Data = capturedImage.dataUrl.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: `image/${capturedImage.format}` });
    
    // Create File object
    return new File([blob], capturedImage.fileName, {
      type: `image/${capturedImage.format}`,
      lastModified: Date.now()
    });
  };

  // Check if camera is available
  const checkCameraAvailability = async (): Promise<boolean> => {
    if (!isNative) {
      // On web, check if getUserMedia is available
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    try {
      // On native, we'll assume camera is available
      // The actual permission check happens when capturing
      return true;
    } catch {
      return false;
    }
  };

  return {
    capturePhoto,
    captureFromCamera,
    captureFromGallery,
    captureWithPrompt,
    convertToFile,
    checkCameraAvailability,
    isCapturing,
    isNative
  };
}