// Offline Form Wrapper - Handles form submissions with offline queueing
import { useState, useEffect } from 'react';
import { useOfflineSync, useOfflineAwareAPI } from '@/hooks/useOfflineSync';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (data: any) => Promise<any>;
  formData: any;
  isValid: boolean;
  submitText?: string;
  offlineText?: string;
  className?: string;
}

export const OfflineFormWrapper = ({
  children,
  onSubmit,
  formData,
  isValid,
  submitText = "Submit",
  offlineText = "Save for Later",
  className
}: OfflineFormWrapperProps) => {
  const { isOnline, queueOperation } = useOfflineSync();
  const { makeRequest } = useOfflineAwareAPI();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'queued' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    setSubmissionStatus('idle');

    try {
      const result = await onSubmit(formData);
      
      if (result.offline) {
        setSubmissionStatus('queued');
        toast({
          title: "Saved for Later",
          description: "Your changes will sync when you're back online.",
          duration: 3000,
        });
      } else {
        setSubmissionStatus('success');
        toast({
          title: "Success",
          description: "Your changes have been saved.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionStatus('error');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) return "Submitting...";
    if (!isOnline) return offlineText;
    return submitText;
  };

  const getStatusIcon = () => {
    switch (submissionStatus) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'queued': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className={className}>
      {/* Offline status alert */}
      {!isOnline && (
        <Alert className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Changes will be saved locally and synced when you reconnect.
          </AlertDescription>
        </Alert>
      )}

      {/* Form content */}
      {children}

      {/* Submit section */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="secondary" data-testid="badge-offline-mode">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline Mode
            </Badge>
          )}
          
          {submissionStatus !== 'idle' && (
            <div className="flex items-center gap-1 text-sm">
              {getStatusIcon()}
              <span>
                {submissionStatus === 'success' && 'Saved successfully'}
                {submissionStatus === 'queued' && 'Queued for sync'}
                {submissionStatus === 'error' && 'Save failed'}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          data-testid="button-form-submit"
        >
          {getSubmitButtonText()}
        </Button>
      </div>
    </div>
  );
};

// Higher-order component for wrapping forms with offline support
export const withOfflineSupport = <T extends object>(
  WrappedComponent: React.ComponentType<T>,
  submitHandler?: (data: any) => Promise<any>
) => {
  return (props: T & { onSubmit?: (data: any) => Promise<any> }) => {
    const { isOnline } = useOfflineSync();
    
    return (
      <div>
        {!isOnline && (
          <Alert className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Offline mode: Some features may be limited.
            </AlertDescription>
          </Alert>
        )}
        <WrappedComponent {...props} />
      </div>
    );
  };
};