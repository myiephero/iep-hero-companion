import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import { apiRequest } from "@/lib/queryClient";
import { Camera, Image as ImageIcon, Upload, Loader2, X, Check } from "lucide-react";

interface AvatarUploadProps {
  currentImageUrl?: string;
  fallbackText: string;
  onImageUpdate?: (imageUrl: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  className?: string;
}

export function AvatarUpload({ 
  currentImageUrl, 
  fallbackText, 
  onImageUpdate, 
  size = "lg",
  editable = true,
  className = ""
}: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const {
    captureFromCamera,
    captureFromGallery,
    convertToFile,
    isCapturing,
    isNative
  } = useCameraCapture();

  // Size configurations
  const sizeConfigs = {
    sm: { avatar: "h-12 w-12", text: "text-sm" },
    md: { avatar: "h-16 w-16", text: "text-base" }, 
    lg: { avatar: "h-24 w-24", text: "text-lg" },
    xl: { avatar: "h-32 w-32", text: "text-xl" }
  };

  const displayImage = uploadedImage || currentImageUrl;

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        // In a real app, this would upload to your storage service
        // For now, we'll simulate the upload and use the base64 data directly
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const imageUrl = base64Data; // In reality, this would be the uploaded URL
        setUploadedImage(imageUrl);
        onImageUpdate?.(imageUrl);
        
        toast({
          title: "Photo Updated",
          description: "Your profile photo has been updated successfully.",
        });
        
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = async () => {
    const capturedImage = await captureFromCamera();
    if (capturedImage) {
      const file = convertToFile(capturedImage);
      await uploadImage(file);
    }
  };

  const handleGallerySelect = async () => {
    const selectedImage = await captureFromGallery();
    if (selectedImage) {
      const file = convertToFile(selectedImage);
      await uploadImage(file);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large", 
        description: "Image size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    uploadImage(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    onImageUpdate?.("");
    toast({
      title: "Photo Removed",
      description: "Your profile photo has been removed.",
    });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Avatar className={`${sizeConfigs[size].avatar} ${editable ? 'cursor-pointer' : ''}`}>
        <AvatarImage src={displayImage} alt="Profile" />
        <AvatarFallback className={`${sizeConfigs[size].text} bg-blue-500 text-white`}>
          {fallbackText}
        </AvatarFallback>
      </Avatar>
      
      {editable && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white p-0"
              data-testid="button-edit-avatar"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile Photo</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Current Photo Preview */}
              <div className="flex justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={displayImage} alt="Profile preview" />
                  <AvatarFallback className="text-2xl bg-blue-500 text-white">
                    {fallbackText}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Upload Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-center">Choose a photo</h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {/* Camera Button */}
                  <Button
                    variant="outline"
                    onClick={handleCameraCapture}
                    disabled={isCapturing || isUploading}
                    className="flex items-center gap-2 justify-center"
                    data-testid="button-camera-photo"
                  >
                    {isCapturing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    {isNative ? 'Take Photo' : 'Camera*'}
                  </Button>

                  {/* Gallery Button */}
                  <Button
                    variant="outline"
                    onClick={handleGallerySelect}
                    disabled={isCapturing || isUploading}
                    className="flex items-center gap-2 justify-center"
                    data-testid="button-gallery-photo"
                  >
                    {isCapturing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {isNative ? 'Choose from Gallery' : 'Browse Files*'}
                  </Button>

                  {/* File Input Button */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      data-testid="input-file-photo"
                    />
                    <Button
                      variant="outline"
                      disabled={isUploading}
                      className="w-full flex items-center gap-2 justify-center"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {isUploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </div>
                </div>

                {!isNative && (
                  <p className="text-xs text-muted-foreground text-center">
                    * Full camera support available in mobile app
                  </p>
                )}

                {/* Remove Photo Button */}
                {displayImage && (
                  <div className="pt-3 border-t">
                    <Button
                      variant="outline"
                      onClick={removeImage}
                      disabled={isUploading}
                      className="w-full flex items-center gap-2 justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid="button-remove-photo"
                    >
                      <X className="h-4 w-4" />
                      Remove Photo
                    </Button>
                  </div>
                )}
              </div>

              {/* Upload Status */}
              {isUploading && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Uploading photo...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}