import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
          title: "Success! 🎉",
          description: "Your password has been set up successfully. Welcome to My IEP Hero!",
        });

        // Redirect to appropriate dashboard
        setTimeout(() => {
          navigate(data.redirectTo || '/parent/dashboard-free');
        }, 1000);
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
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Setup Link</h2>
            <p className="text-gray-600">
              The password setup link is invalid or has expired. Please contact your advocate for a new invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Set Up Your Password</CardTitle>
          <CardDescription>
            Create a secure password for your My IEP Hero account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Password Requirements */}
              {password && (
                <div className="text-sm space-y-1">
                  <div className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-300'}`} />
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRequirements.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 ${passwordRequirements.hasUpper ? 'text-green-600' : 'text-gray-300'}`} />
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRequirements.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 ${passwordRequirements.hasLower ? 'text-green-600' : 'text-gray-300'}`} />
                    Lowercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />
                    Number
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pr-10"
                  data-testid="input-confirm-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {confirmPassword && (
                <div className={`text-sm flex items-center gap-2 ${doPasswordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                  <CheckCircle className={`h-3 w-3 ${doPasswordsMatch ? 'text-green-600' : 'text-red-500'}`} />
                  {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isPasswordValid || !doPasswordsMatch || isLoading}
              data-testid="button-setup-password"
            >
              {isLoading ? 'Setting up...' : 'Set Up Password'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>After setting up your password, you'll be automatically logged in and taken to your dashboard.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}