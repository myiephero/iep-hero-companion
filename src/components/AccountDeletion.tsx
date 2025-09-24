import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Shield, Trash2 } from 'lucide-react';

interface DeletionInfo {
  hasActiveSubscription: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  email: string;
  memberSince: string;
  consequences: string[];
}

const DELETION_REASONS = [
  { value: 'not_using', label: 'Not using the service enough' },
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'found_alternative', label: 'Found a better alternative' },
  { value: 'technical_issues', label: 'Technical issues' },
  { value: 'poor_support', label: 'Poor customer support' },
  { value: 'privacy_concerns', label: 'Privacy concerns' },
  { value: 'temporary', label: 'Temporary break' },
  { value: 'other', label: 'Other' },
];

export function AccountDeletion() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [confirmEmail, setConfirmEmail] = useState<string>('');
  const { toast } = useToast();
  const { logout } = useAuth();

  // Get account deletion info
  const { data: deletionInfo, isLoading: isLoadingInfo } = useQuery<DeletionInfo>({
    queryKey: ['/api/account/deletion-info'],
    enabled: isDialogOpen,
    staleTime: 30000,
  });

  // Delete account mutation
  const deleteAccount = useMutation({
    mutationFn: async ({ reason, feedback, confirmEmail }: { reason: string; feedback: string; confirmEmail: string }) => {
      return apiRequest('/api/account/delete', {
        method: 'POST',
        body: JSON.stringify({ reason, feedback, confirmEmail }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Account Deleted',
        description: 'Your account has been successfully deleted. You will be logged out shortly.',
      });
      
      // Log user out after a brief delay
      setTimeout(() => {
        logout();
        window.location.href = '/';
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete account. Please try again or contact support.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteSubmit = () => {
    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a reason for account deletion.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirmEmail) {
      toast({
        title: 'Email Confirmation Required',
        description: 'Please confirm your email address to proceed with deletion.',
        variant: 'destructive',
      });
      return;
    }

    deleteAccount.mutate({ reason, feedback, confirmEmail });
  };

  const resetForm = () => {
    setReason('');
    setFeedback('');
    setConfirmEmail('');
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) resetForm();
    }}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          data-testid="button-delete-account"
          className="w-full sm:w-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Your Account
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone. Please read the consequences carefully.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoadingInfo ? (
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : deletionInfo ? (
          <div className="space-y-4">
            {/* Account Status Warning */}
            {deletionInfo.hasActiveSubscription && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">
                      Active Subscription Detected
                    </p>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your {deletionInfo.subscriptionPlan} subscription will be immediately cancelled and you will stop being charged.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Consequences */}
            <div>
              <h4 className="text-sm font-medium mb-2">What happens when you delete your account:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {deletionInfo.consequences.map((consequence, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    {consequence}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reason Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Why are you deleting your account? <span className="text-red-500">*</span>
              </label>
              <Select onValueChange={setReason} value={reason} data-testid="select-deletion-reason">
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {DELETION_REASONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional Feedback */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional feedback (optional)
              </label>
              <Textarea
                placeholder="Help us improve by sharing your thoughts..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[60px]"
                data-testid="textarea-deletion-feedback"
              />
            </div>

            {/* Email Confirmation */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Confirm your email address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder={`Enter ${deletionInfo.email} to confirm`}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                data-testid="input-confirm-email"
              />
              <p className="text-xs text-gray-500 mt-1">
                Type your email address exactly as shown to confirm deletion
              </p>
            </div>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-deletion">
            Keep Account
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteSubmit}
            disabled={!reason || !confirmEmail || deleteAccount.isPending || isLoadingInfo}
            data-testid="button-confirm-deletion"
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteAccount.isPending ? 'Deleting...' : 'Delete My Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}