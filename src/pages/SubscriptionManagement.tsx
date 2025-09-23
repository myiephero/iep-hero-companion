import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionCancellation } from '@/components/SubscriptionCancellation';
import { RefundProcessing } from '@/components/RefundProcessing';
import { CreditCard, DollarSign, Settings } from 'lucide-react';

export default function SubscriptionManagement() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-gray-600">
          Manage your subscription, request cancellations, and process refunds
        </p>
      </div>

      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscription" data-testid="tab-subscription">
            <Settings className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="refunds" data-testid="tab-refunds">
            <DollarSign className="h-4 w-4 mr-2" />
            Refunds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="mt-6">
          <div className="flex justify-center">
            <SubscriptionCancellation />
          </div>
        </TabsContent>

        <TabsContent value="refunds" className="mt-6">
          <div className="flex justify-center">
            <RefundProcessing />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}