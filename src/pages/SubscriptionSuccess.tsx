import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowRight, Gift, Crown, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);
  const [countDown, setCountDown] = useState(10);
  const [accountCreated, setAccountCreated] = useState(false);
  const [subscriptionRefreshed, setSubscriptionRefreshed] = useState(false);

  // Extract session info from URL params
  const urlParams = new URLSearchParams(location.search);
  const sessionId = urlParams.get('session_id');
  const planId = urlParams.get('plan');
  const role = urlParams.get('role');

  // Handle account creation after successful payment
  useEffect(() => {
    const createAccount = async () => {
      if (!sessionId || accountCreated) return;
      
      try {
        // Call backend to process successful checkout and create account
        const response = await fetch('/api/process-checkout-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, planId, role })
        });
        
        if (response.ok) {
          setAccountCreated(true);
        }
      } catch (error) {
        console.error('Error processing checkout success:', error);
      }
    };
    
    createAccount();
  }, [sessionId, planId, role, accountCreated]);

  // Refresh subscription data after successful upgrade
  useEffect(() => {
    const refreshSubscriptionData = async () => {
      if (!user || subscriptionRefreshed) return;
      
      console.log('🔄 Subscription Success: Refreshing user session to show new plan...');
      
      // Wait a moment for the webhook to process
      setTimeout(async () => {
        try {
          await refreshUser();
          setSubscriptionRefreshed(true);
          
          toast({
            title: "🎉 Subscription Updated!",
            description: "Your new plan is now active. Welcome to premium features!",
            duration: 5000,
          });
          
          console.log('✅ Subscription Success: User session refreshed');
        } catch (error) {
          console.error('❌ Error refreshing subscription data:', error);
        }
      }, 2000); // 2 second delay to allow webhook processing
    };
    
    refreshSubscriptionData();
  }, [user, refreshUser, subscriptionRefreshed, toast]);

  // Confetti effect
  useEffect(() => {
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  // Auto-redirect countdown (only if account verification not needed)
  useEffect(() => {
    if (!accountCreated) return; // Don't start countdown until account is created
    
    const timer = setInterval(() => {
      setCountDown(prev => {
        if (prev <= 1) {
          // Redirect to homepage after successful payment and account setup
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, accountCreated]);

  // Confetti Component
  const ConfettiEffect = () => {
    if (!showConfetti) return null;
    
    const confettiPieces = Array.from({ length: 100 }, (_, i) => (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'][Math.floor(Math.random() * 6)],
          animationDelay: `${Math.random() * 3}s`,
          width: `${Math.random() * 10 + 5}px`,
          height: `${Math.random() * 10 + 5}px`,
        }}
      />
    ));
    
    return <div className="fixed inset-0 pointer-events-none z-50">{confettiPieces}</div>;
  };

  const isParent = location.pathname.includes('parent') || location.search.includes('parent');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <ConfettiEffect />
      
      <div className="max-w-2xl w-full space-y-8 animate-bounce-in">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
            <Check className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 gradient-text-primary">
              🎉 Payment Successful!
            </h1>
            <p className="text-xl text-gray-600">
              {accountCreated ? 'Check email to authenticate account.' : 'Setting up your account...'}
            </p>
          </div>
        </div>

        {/* Success Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8 space-y-6">
            {/* Payment Confirmation */}
            {sessionId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Payment Confirmed</span>
                </div>
                <p className="text-sm text-green-700">
                  Session ID: {sessionId.slice(-12)}
                </p>
              </div>
            )}

            {/* What's Next */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                What's Next?
              </h2>
              
              <div className="grid gap-4">
                {isParent ? (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h3 className="font-medium text-blue-900">Upload Your IEP Documents</h3>
                        <p className="text-sm text-blue-700">Get AI-powered analysis and insights within minutes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h3 className="font-medium text-purple-900">Connect with Advocates</h3>
                        <p className="text-sm text-purple-700">Find certified advocates in your area</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h3 className="font-medium text-green-900">Prepare for Success</h3>
                        <p className="text-sm text-green-700">Use AI tools to prepare for IEP meetings</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h3 className="font-medium text-blue-900">Set Up Your Practice</h3>
                        <p className="text-sm text-blue-700">Complete your advocate profile and service areas</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h3 className="font-medium text-purple-900">Connect with Families</h3>
                        <p className="text-sm text-purple-700">Start receiving client referrals in your area</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h3 className="font-medium text-green-900">Grow Your Practice</h3>
                        <p className="text-sm text-green-700">Use AI tools to scale your advocacy work</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Special Welcome Bonus */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-900">Welcome Bonus!</span>
              </div>
              <p className="text-sm text-amber-800 mb-3">
                {isParent 
                  ? "Get your first IEP analysis free! Upload a document to see our AI in action."
                  : "Your first month includes premium client management tools at no extra charge."
                }
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <Crown className="h-3 w-3" />
                <span>Premium subscriber exclusive</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white"
                onClick={() => {
                  if (isParent) {
                    const planSlug = user?.subscriptionPlan?.toLowerCase().replace(/\s+/g, '') || 'free';
                    navigate(`/parent/dashboard-${planSlug}`);
                  } else {
                    const advocatePlanMapping = {
                      'starter': 'starter', 'pro': 'pro', 'agency': 'agency', 
                      'agency plus': 'agency-plus', 'agencyplus': 'agency-plus'
                    };
                    const planSlug = advocatePlanMapping[user?.subscriptionPlan?.toLowerCase()] || 'starter';
                    navigate(`/advocate/dashboard-${planSlug}`);
                  }
                }}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1"
                onClick={() => navigate(isParent ? '/parent/tools' : '/advocate/tools')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Tools
              </Button>
            </div>

            {/* Auto-redirect notice */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Redirecting to your dashboard in {countDown} seconds...
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCountDown(0)}
                className="mt-2"
              >
                Go now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>10,000+ families served</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>FERPA compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="h-4 w-4" />
              <span>Award-winning platform</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Your data is secure and your privacy is protected
          </p>
        </div>
      </div>
    </div>
  );
}