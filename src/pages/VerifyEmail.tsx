import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [redirectInfo, setRedirectInfo] = useState<{requiresPasswordSetup?: boolean; hasPassword?: boolean; redirectTo?: string}>({});
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    // Verify the email with new secure flow
    fetch(`/api/verify-email?token=${token}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          setRedirectInfo({
            requiresPasswordSetup: data.requiresPasswordSetup,
            hasPassword: data.hasPassword,
            redirectTo: data.redirectTo
          });
          
          // 🔒 SECURITY FIX: Handle new secure response format
          if (data.requiresPasswordSetup) {
            // New user needs to set up password - redirect to password setup
            console.log('🔒 New user verified - redirecting to password setup');
            setTimeout(() => {
              navigate(data.redirectTo);
            }, 2000);
          } else if (data.hasPassword) {
            // Existing user with password - redirect to login
            console.log('🔒 Existing user verified - redirecting to login');
            setTimeout(() => {
              navigate(data.redirectTo);
            }, 2000);
          } else {
            // Fallback - should not happen with new security fixes
            console.log('🔒 Fallback redirect - this should not happen');
            setTimeout(() => {
              navigate('/auth');
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      })
      .catch(error => {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification');
      });
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-xl">Verifying Your Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Email Verified Successfully! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              {redirectInfo.requiresPasswordSetup 
                ? 'Now let\'s set up your password to secure your account.' 
                : redirectInfo.hasPassword 
                  ? 'Please sign in with your existing password.' 
                  : 'Welcome to My IEP Hero! Your account is now active.'}
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {redirectInfo.requiresPasswordSetup 
                  ? 'Password Setup Required' 
                  : redirectInfo.hasPassword 
                    ? 'Ready to Sign In' 
                    : 'You\'re All Set!'}
              </CardTitle>
              <CardDescription>
                {redirectInfo.requiresPasswordSetup 
                  ? 'Your email is verified. Please create a secure password to complete your account setup.' 
                  : redirectInfo.hasPassword 
                    ? 'Your email is verified. You can now sign in with your existing password.' 
                    : 'Your email has been verified and your account is ready to use.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground">
                {redirectInfo.requiresPasswordSetup 
                  ? 'You\'ll be automatically redirected to password setup in a few seconds, or click below to continue.' 
                  : redirectInfo.hasPassword 
                    ? 'You\'ll be automatically redirected to sign in in a few seconds, or click below to continue.' 
                    : 'You\'ll be automatically redirected in a few seconds, or click below to continue.'}
              </p>
              
              <Button 
                size="lg"
                onClick={() => navigate(redirectInfo.redirectTo || '/auth')}
                data-testid="button-continue"
              >
                {redirectInfo.requiresPasswordSetup 
                  ? 'Set Up Password' 
                  : redirectInfo.hasPassword 
                    ? 'Sign In' 
                    : 'Continue'}
              </Button>

              <div className="border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  {redirectInfo.requiresPasswordSetup 
                    ? 'After setting up your password, you\'ll have full access to your My IEP Hero features.' 
                    : 'You now have access to all your subscription features including AI-powered IEP analysis, meeting preparation tools, and advocate matching services.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verification Failed
          </h1>
          <p className="text-lg text-gray-600">
            {message}
          </p>
        </div>

        <Card>
          <CardContent className="text-center space-y-6 pt-6">
            <p className="text-muted-foreground">
              The verification link may have expired or been used already. 
              Please contact support if you continue to have issues.
            </p>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/')}
                data-testid="button-home"
              >
                Return Home
              </Button>
              <Button 
                className="flex-1"
                onClick={() => window.location.href = 'mailto:support@myiephero.com'}
                data-testid="button-contact-support"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}