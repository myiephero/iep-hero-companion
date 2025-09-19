import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Shield, 
  Sparkles,
  Crown,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveApiUrl } from '@/lib/apiConfig';
import {
  MobileAppShell,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile,
  PremiumTransparentHeader
} from '@/components/mobile';

export default function CustomLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🔧 MOBILE DEBUG: Simple approach for mobile API calls
      const isMobile = typeof window !== 'undefined' && 
        (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:');
      
      const apiUrl = isMobile 
        ? 'https://afd4ab41-fa60-4e78-9742-69bb4e3004d6-00-6i79wn87wfhu.janeway.replit.dev/api/custom-login'
        : '/api/custom-login';
      
      console.log('🔍 Login attempt - Mobile:', isMobile, 'URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 📱 MOBILE FIX: Store auth token for mobile environments
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          console.log('✅ Mobile Login: Auth token stored successfully');
        }
        
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        
        // Add a delay and use location.replace to stay within WebView on mobile
        setTimeout(() => {
          // 🔒 CRITICAL iOS FIX: Normalize to relative path to prevent Safari redirect
          const raw = data.redirectTo || '/parent/dashboard';
          let dest = raw;
          try { 
            const u = new URL(raw, window.location.origin); 
            if (u.origin !== window.location.origin) dest = u.pathname + u.search + u.hash; 
          } catch (_) { dest = raw; }
          console.log('🔍 Login redirect normalized:', raw, '→', dest);
          window.location.replace(dest);
        }, 1500);
      } else {
        toast({
          title: "Sign In Failed",
          description: data.message || "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppShell showBottomNav={false}>
      {/* Premium Background with Gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <SafeAreaFull>
        {/* Premium Transparent Header */}
        <PremiumTransparentHeader
          showBack={true}
          onBack={() => window.location.replace('/')}
          rightAction={
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm">
              <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Premium</span>
            </div>
          }
        />

        <ContainerMobile padding="lg" className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.20))] relative z-10">
          <div className="w-full max-w-md space-y-8">
            {/* Premium Welcome Section */}
            <div className="text-center space-y-6">
              {/* Logo/Brand Section */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/25 dark:shadow-purple-500/25">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight">
                  Welcome Back
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Sign in to your My IEP Hero account
                </p>
              </div>

              {/* Premium Features Preview */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Legal Ready</span>
                </div>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Secure</span>
                </div>
              </div>
            </div>

            {/* Premium Login Card */}
            <PremiumCard variant="glass" className="p-8 shadow-2xl shadow-gray-900/10 dark:shadow-black/30 border border-white/20 dark:border-gray-800/20">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Sign In
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your credentials to access your account
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Premium Email Field */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        data-testid="input-email"
                        className="h-14 rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 pl-6"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-50" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium Password Field */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        data-testid="input-password"
                        className="h-14 rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 pl-6 pr-14"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full opacity-50" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 active:scale-95 transition-all duration-150"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Premium Sign In Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 dark:shadow-purple-500/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    data-testid="button-signin"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Shield className="h-5 w-5" />
                        <span>Sign In</span>
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            </PremiumCard>

            {/* Premium Footer Links */}
            <PremiumCard variant="glass" className="p-6 text-center space-y-4 border-white/10 dark:border-gray-800/10">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link 
                  to="/parent/pricing" 
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Choose a plan to get started
                </Link>
              </p>
              
              <div className="pt-4 border-t border-gray-200/20 dark:border-gray-800/20">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Having trouble? Contact{' '}
                  <a 
                    href="mailto:support@myiephero.com" 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    support@myiephero.com
                  </a>
                </p>
              </div>
            </PremiumCard>
          </div>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}