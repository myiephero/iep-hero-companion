import { useState } from 'react';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { LockedActionButton } from '@/components/LockedActionButton';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UpgradeFlowTest() {
  const [testScenario, setTestScenario] = useState<'parent' | 'advocate'>('parent');

  // Mock user context for testing
  const mockUser = { role: testScenario, id: 'test-user' };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8" data-testid="upgrade-flow-test-page">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Upgrade Flow Test Page</CardTitle>
            <CardDescription>
              Testing the Netflix-style upgrade buttons that open external browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => setTestScenario('parent')}
                variant={testScenario === 'parent' ? 'default' : 'outline'}
                data-testid="button-test-parent"
              >
                Test as Parent
              </Button>
              <Button
                onClick={() => setTestScenario('advocate')}
                variant={testScenario === 'advocate' ? 'default' : 'outline'}
                data-testid="button-test-advocate"
              >
                Test as Advocate
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Current test role:</strong> {testScenario} | 
              <strong> Expected behavior:</strong> {' '}
              {testScenario === 'parent' ? 'Should redirect to /parent/pricing' : 'Should redirect to /advocate/pricing'}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>1. UpgradePrompt Component</CardTitle>
              <CardDescription>Standard upgrade prompt card</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ 
                // Mock the useToolAccess hook context
                '--mock-user': JSON.stringify(mockUser),
                '--mock-plan': 'free'
              } as any}>
                <UpgradePrompt
                  requiredPlan={testScenario === 'parent' ? 'premium' : 'pro'}
                  toolName="Test Premium Feature"
                  benefits={[
                    'Access to premium tools',
                    'Priority support',
                    'Advanced analytics',
                    'Enhanced security'
                  ]}
                  data-testid="test-upgrade-prompt"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. LockedActionButton Component</CardTitle>
              <CardDescription>Button that shows upgrade when locked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <LockedActionButton
                  requiredFeature="aiInsights"
                  requiredPlan={testScenario === 'parent' ? 'hero' : 'agency'}
                  lockedText="Upgrade Required"
                  unlockedText="Access AI Insights"
                  upgradeBenefits={[
                    'Unlock AI-powered insights',
                    'Priority customer support',
                    'Advanced reporting features'
                  ]}
                  data-testid="test-locked-button"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>3. FeatureGate Component</CardTitle>
              <CardDescription>Feature gating with upgrade prompt</CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureGate
                requiredFeature="progressAnalytics"
                requiredPlan={testScenario === 'parent' ? 'premium' : 'pro'}
                upgradeBenefits={[
                  'Advanced analytics dashboard',
                  'Custom reporting',
                  'Data export capabilities',
                  'Real-time insights'
                ]}
                data-testid="test-feature-gate"
              >
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800">🎉 Premium Feature Unlocked!</h4>
                  <p className="text-green-700">This content would only show if user has required plan.</p>
                </div>
              </FeatureGate>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>📱 Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <strong>🌐 On Web Browser:</strong>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Buttons should open new tab with pricing page</li>
                  <li>URL: {window.location.origin}/parent/pricing or /advocate/pricing</li>
                  <li>Button text: "Upgrade to [Plan Name]"</li>
                </ul>
              </div>
              <div>
                <strong>📱 On Mobile App:</strong>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Buttons should open external Safari/Chrome browser</li>
                  <li>URL: https://afd4ab41-fa60-4e78-9742-69bb4e3004d6-00-6i79wn87wfhu.janeway.replit.dev/pricing</li>
                  <li>Button text: "Visit Website to Upgrade"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}