import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  MessageCircle,
  X,
  Camera,
  Send,
  Paperclip,
  AlertTriangle,
  Bug,
  Lightbulb,
  Minimize2,
  Maximize2,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackData {
  type: 'bug' | 'suggestion' | 'error' | 'general';
  message: string;
  screenshot?: string;
  userEmail?: string;
  userName?: string;
  currentPage: string;
  timestamp: string;
  userAgent: string;
}

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'error', label: 'Error/Redirect', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'general', label: 'General', icon: MessageCircle, color: 'bg-gray-100 text-gray-800 border-gray-200' }
] as const;

export function FeedbackChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState<'bug' | 'suggestion' | 'error' | 'general'>('general');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureScreenshot = async () => {
    try {
      // Request permission to capture screen
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      
      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        // Create canvas and capture frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          setScreenshot(dataUrl);
          
          toast({
            title: "Screenshot Captured",
            description: "Screenshot has been attached to your feedback",
          });
        }
        
        // Stop screen capture
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast({
        title: "Screenshot Failed",
        description: "Unable to capture screenshot. You can upload an image instead.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshot(e.target?.result as string);
        toast({
          title: "Image Uploaded",
          description: "Image has been attached to your feedback",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const submitFeedback = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message describing the issue or suggestion",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const feedbackData: FeedbackData = {
      type: selectedType,
      message: message.trim(),
      screenshot: screenshot || undefined,
      userEmail: user?.email || 'anonymous@example.com',
      userName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Anonymous User',
      currentPage: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        toast({
          title: "Feedback Sent!",
          description: "Thank you for your feedback. We'll review it shortly.",
        });
        
        // Reset form
        setMessage('');
        setScreenshot(null);
        setSelectedType('general');
        setIsOpen(false);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error sending your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white border-0"
          data-testid="button-open-feedback"
        >
          <MessageCircle className="h-6 w-6 mr-2" />
          Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Send Feedback</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-8 w-8 p-0"
                data-testid="button-minimize-feedback"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
                data-testid="button-close-feedback"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-4">
            {/* Feedback Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">What type of feedback is this?</Label>
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_TYPES.map((type) => (
                  <Badge
                    key={type.id}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all duration-200 justify-center p-2 hover:shadow-md",
                      selectedType === type.id ? type.color : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedType(type.id)}
                    data-testid={`badge-feedback-type-${type.id}`}
                  >
                    <type.icon className="h-4 w-4 mr-1" />
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div>
              <Label htmlFor="feedback-message" className="text-sm font-medium mb-2 block">
                Describe the issue or suggestion
              </Label>
              <Textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe what happened, what you expected, or your suggestion..."
                className="min-h-[100px] resize-none"
                data-testid="textarea-feedback-message"
              />
            </div>

            {/* Screenshot Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Attach Screenshot (Optional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={captureScreenshot}
                  className="flex-1"
                  data-testid="button-capture-screenshot"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Screen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  data-testid="button-upload-image"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-file-upload"
              />
              
              {screenshot && (
                <div className="relative">
                  <img
                    src={screenshot}
                    alt="Screenshot preview"
                    className="w-full max-h-32 object-cover rounded border"
                    data-testid="img-screenshot-preview"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setScreenshot(null)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    data-testid="button-remove-screenshot"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={submitFeedback}
              disabled={isSubmitting || !message.trim()}
              className="w-full"
              data-testid="button-submit-feedback"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Your feedback helps us improve the platform. Current page and user info will be included.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}