import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AlertTriangle, Calendar, CreditCard } from 'lucide-react';

interface SubscriptionStatus {
  subscriptionStatus: string;
  subscriptionPlan: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripe: {
    id: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    cancelled_at: number | null;
  } | null;
}

const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using', label: 'Not using the service enough' },
  { value: 'found_alternative', label: 'Found a better alternative' },
  { value: 'technical_issues', label: 'Technical issues' },
  { value: 'poor_support', label: 'Poor customer support' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'temporary', label: 'Temporary cancellation' },
  { value: 'other', label: 'Other' },
];

export function SubscriptionCancellation() {
  const [reason, setReason] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get subscription status
  const { data: subscription, isLoading: isLoadingStatus } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
    staleTime: 30000, // 30 seconds
  });

  // Cancel subscription mutation
  const cancelSubscription = useMutation({
    mutationFn: async ({ reason, feedback }: { reason: string; feedback: string }) => {
      return apiRequest('/api/subscription/cancel', {
        method: 'POST',
        body: JSON.stringify({ reason, feedback }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Subscription Cancelled',
        description: data.message || 'Your subscription has been cancelled successfully.',
      });
      
      // Invalidate and refetch subscription status
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
      
      // Reset form
      setReason('');
      setFeedback('');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Reactivate subscription mutation
  const reactivateSubscription = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/subscription/reactivate', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Subscription Reactivated',
        description: data.message || 'Your subscription has been reactivated successfully.',
      });
      
      // Invalidate and refetch subscription status
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Reactivation Failed',
        description: error.message || 'Failed to reactivate subscription. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleCancelSubmit = () => {
    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a reason for cancellation.',
        variant: 'destructive',
      });
      return;
    }

    cancelSubscription.mutate({ reason, feedback });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoadingStatus) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !subscription.stripe) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            No active subscription found.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isActive = subscription.subscriptionStatus === 'active' && subscription.stripe.status === 'active';
  const isCancelled = subscription.subscriptionStatus === 'cancelled' || subscription.stripe.status === 'canceled';
  const willCancelAtPeriodEnd = subscription.stripe.cancel_at_period_end;

  return (
    <div className="space-y-6 w-full max-w-2xl">
      {/* Current Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your {subscription.subscriptionPlan} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Plan</p>
              <p className="text-lg capitalize font-semibold" data-testid="text-plan-name">
                {subscription.subscriptionPlan}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className={`text-lg font-semibold ${
                isActive ? 'text-green-600' : 
                isCancelled ? 'text-red-600' : 
                'text-yellow-600'
              }`} data-testid="text-subscription-status">
                {subscription.stripe.status}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Period</p>
              <p className="text-sm" data-testid="text-billing-period">
                {formatDate(subscription.stripe.current_period_start)} - {formatDate(subscription.stripe.current_period_end)}
              </p>
            </div>
            {willCancelAtPeriodEnd && (
              <div>
                <p className="text-sm font-medium text-yellow-600">Will cancel at period end</p>
                <p className="text-sm text-yellow-600" data-testid="text-cancellation-date">
                  {formatDate(subscription.stripe.current_period_end)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        {isActive && !willCancelAtPeriodEnd && (
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full" 
                data-testid="button-cancel-subscription"
                disabled={cancelSubscription.isPending}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Your Subscription</AlertDialogTitle>
                <AlertDialogDescription>
                  We're sorry to see you go! Your subscription will remain active until the end of your current billing period.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Why are you cancelling? <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={setReason} value={reason} data-testid="select-cancellation-reason">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANCELLATION_REASONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Additional feedback (optional)
                  </label>
                  <Textarea
                    placeholder="Help us improve by sharing your thoughts..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[80px]"
                    data-testid="textarea-cancellation-feedback"
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-dialog">
                  Keep Subscription
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelSubmit}
                  disabled={!reason || cancelSubscription.isPending}
                  data-testid="button-confirm-cancel"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {cancelSubscription.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isCancelled && (
          <Button 
            onClick={() => reactivateSubscription.mutate()}
            disabled={reactivateSubscription.isPending}
            className="w-full"
            data-testid="button-reactivate-subscription"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {reactivateSubscription.isPending ? 'Reactivating...' : 'Reactivate Subscription'}
          </Button>
        )}
      </div>
    </div>
  );
}