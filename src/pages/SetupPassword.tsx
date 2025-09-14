import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import iepHeroIcon from '@/assets/iep-hero-icon.png';

export default function SetupPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        title: "Invalid Link",
        description: "The password setup link is invalid or missing.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [navigate, toast]);

  const validatePassword = (pwd: string) => {
    const requirements = {
      length: pwd.length >= 8,
      hasNumber: /\d/.test(pwd),
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(password);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid setup token.",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Password Requirements",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    if (!doPasswordsMatch) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth token
        localStorage.setItem('authToken', data.token);
        
        toast({
          title: "Welcome to My IEP Hero! 🎉",
          description: "Your account is ready! Taking you to your dashboard...",
        });

        // Redirect to appropriate dashboard
        setTimeout(() => {
          navigate(data.redirectTo || '/parent/dashboard-free');
        }, 1500);
      } else {
        toast({
          title: "Setup Failed",
          description: data.error || "Failed to set up password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Password setup error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
        <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={iepHeroIcon} 
                alt="My IEP Hero" 
                className="h-16 w-auto"
              />
            </div>
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid Setup Link</h2>
            <p className="text-gray-600 leading-relaxed">
              The password setup link is invalid or has expired. Please contact your advocate for a new invitation.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={iepHeroIcon} 
              alt="My IEP Hero" 
              className="h-20 w-auto transition-transform hover:scale-105"
            />
          </div>

          {/* Hero Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>

          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Set Up Your Password
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Create a secure password to access your My IEP Hero account
          </CardDescription>
          
          {/* Tagline */}
          <div className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full">
            <p className="text-sm font-medium text-blue-700">LOYAL • HONEST • HEROIC</p>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="pr-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-4 hover:bg-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
              </div>
              
              {/* Enhanced Password Requirements */}
              {password && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'} transition-colors`}>
                      <CheckCircle className={`h-4 w-4 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className="text-sm">8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.hasUpper ? 'text-green-600' : 'text-gray-500'} transition-colors`}>
                      <CheckCircle className={`h-4 w-4 ${passwordRequirements.hasUpper ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className="text-sm">Uppercase</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.hasLower ? 'text-green-600' : 'text-gray-500'} transition-colors`}>
                      <CheckCircle className={`h-4 w-4 ${passwordRequirements.hasLower ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className="text-sm">Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'} transition-colors`}>
                      <CheckCircle className={`h-4 w-4 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className="text-sm">Number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pr-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  data-testid="input-confirm-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-4 hover:bg-gray-100"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
              </div>
              
              {confirmPassword && (
                <div className={`text-sm font-medium flex items-center gap-2 ${doPasswordsMatch ? 'text-green-600' : 'text-red-500'} transition-colors`}>
                  <CheckCircle className={`h-4 w-4 ${doPasswordsMatch ? 'text-green-600' : 'text-red-500'}`} />
                  {doPasswordsMatch ? 'Passwords match perfectly!' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className={`w-full h-14 text-lg font-semibold transition-all duration-200 ${
                !isPasswordValid || !doPasswordsMatch || isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
              disabled={!isPasswordValid || !doPasswordsMatch || isLoading}
              data-testid="button-setup-password"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Setting up your account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Create My Account
                </div>
              )}
            </Button>
          </form>

          {/* Enhanced footer */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>🔒 Secure & Private:</strong> Your information is encrypted and protected. 
                After setup, you'll be automatically signed in to your personalized dashboard.
              </p>
            </div>
          </div>

          {/* Support link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact your advocate or email{' '}
              <a href="mailto:support@myiephero.com" className="text-blue-600 hover:text-blue-700 font-medium">
                support@myiephero.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}