import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DollarSign, History, RefreshCw } from 'lucide-react';

interface EligiblePayment {
  id: string;
  amount: number;
  currency: string;
  created: number;
  description: string;
  metadata: Record<string, string>;
}

interface RefundHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  description: string;
  created_at: string;
  processed_at: string | null;
}

const REFUND_REASONS = [
  { value: 'duplicate', label: 'Duplicate charge' },
  { value: 'fraudulent', label: 'Fraudulent charge' },
  { value: 'requested_by_customer', label: 'Customer requested' },
];

export function RefundProcessing() {
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('requested_by_customer');
  const [description, setDescription] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get eligible payments for refund
  const { data: eligiblePayments, isLoading: isLoadingPayments } = useQuery<{ eligiblePayments: EligiblePayment[] }>({
    queryKey: ['/api/refund/eligible-payments'],
    staleTime: 60000, // 1 minute
  });

  // Get refund history
  const { data: refundHistory, isLoading: isLoadingHistory } = useQuery<{ refunds: RefundHistoryItem[] }>({
    queryKey: ['/api/refund/history'],
    staleTime: 30000, // 30 seconds
  });

  // Request refund mutation
  const requestRefund = useMutation({
    mutationFn: async ({ paymentIntentId, amount, reason, description }: { 
      paymentIntentId: string; 
      amount?: number; 
      reason: string; 
      description: string;
    }) => {
      return apiRequest('/api/refund/request', {
        method: 'POST',
        body: JSON.stringify({ 
          paymentIntentId, 
          amount, 
          reason, 
          description 
        }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Refund Requested',
        description: data.message || 'Your refund has been processed successfully.',
      });
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['/api/refund/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/refund/eligible-payments'] });
      
      // Reset form
      setSelectedPayment('');
      setRefundAmount('');
      setDescription('');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Refund Failed',
        description: error.message || 'Failed to process refund. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleRefundSubmit = () => {
    if (!selectedPayment) {
      toast({
        title: 'Payment Required',
        description: 'Please select a payment to refund.',
        variant: 'destructive',
      });
      return;
    }

    const selectedPaymentData = eligiblePayments?.eligiblePayments.find(p => p.id === selectedPayment);
    const amount = refundAmount ? parseFloat(refundAmount) : undefined;

    // Validate partial refund amount
    if (amount && selectedPaymentData && amount > selectedPaymentData.amount) {
      toast({
        title: 'Invalid Amount',
        description: 'Refund amount cannot exceed the original payment amount.',
        variant: 'destructive',
      });
      return;
    }

    requestRefund.mutate({ 
      paymentIntentId: selectedPayment, 
      amount, 
      reason, 
      description 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Request Refund Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Request Refund
          </CardTitle>
          <CardDescription>
            Request a refund for a recent payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPayments ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Payment to Refund
                </label>
                <Select onValueChange={setSelectedPayment} value={selectedPayment} data-testid="select-payment-refund">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a payment to refund" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligiblePayments?.eligiblePayments.map((payment) => (
                      <SelectItem key={payment.id} value={payment.id}>
                        {formatAmount(payment.amount)} - {payment.description || 'Payment'} ({new Date(payment.created * 1000).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPayment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Refund Amount (optional)
                    </label>
                    <Input
                      type="number"
                      placeholder="Leave empty for full refund"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      max={eligiblePayments?.eligiblePayments.find(p => p.id === selectedPayment)?.amount}
                      data-testid="input-refund-amount"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Reason
                    </label>
                    <Select onValueChange={setReason} value={reason} data-testid="select-refund-reason">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REFUND_REASONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description (optional)
                </label>
                <Textarea
                  placeholder="Provide additional details about this refund request..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="textarea-refund-description"
                />
              </div>

              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={!selectedPayment || requestRefund.isPending}
                    data-testid="button-request-refund"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Request Refund
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Refund Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will process a refund for the selected payment. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  <div className="space-y-2">
                    <p><strong>Payment:</strong> {selectedPayment}</p>
                    <p><strong>Amount:</strong> {refundAmount ? formatAmount(parseFloat(refundAmount)) : 'Full refund'}</p>
                    <p><strong>Reason:</strong> {REFUND_REASONS.find(r => r.value === reason)?.label}</p>
                    {description && <p><strong>Description:</strong> {description}</p>}
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-refund">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRefundSubmit}
                      disabled={requestRefund.isPending}
                      data-testid="button-confirm-refund"
                    >
                      {requestRefund.isPending ? 'Processing...' : 'Process Refund'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </CardContent>
      </Card>

      {/* Refund History Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Refund History
            </CardTitle>
            <CardDescription>
              View your previous refund requests and their status
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/refund/history'] });
            }}
            disabled={isLoadingHistory}
            data-testid="button-refresh-history"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : refundHistory?.refunds.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No refunds found</p>
              <p className="text-sm">Your refund requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {refundHistory?.refunds.map((refund) => (
                <div
                  key={refund.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`refund-item-${refund.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {formatAmount(refund.amount, refund.currency)}
                      </span>
                      <Badge className={getStatusBadgeColor(refund.status)}>
                        {refund.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Reason: {refund.reason}
                    </p>
                    {refund.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {refund.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Requested: {formatDate(refund.created_at)}</p>
                    {refund.processed_at && (
                      <p>Processed: {formatDate(refund.processed_at)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}