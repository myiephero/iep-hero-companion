import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const securityFeatures = [
  "HIPAA Secure",
  "Certified Advocates", 
  "Bank-Level Security",
  "Supports IDEA/FAPE"
];

const Index = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'create'>('signin');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      const response = await fetch('/api/custom-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      });

      if (response.ok) {
        const { token, user: userData, redirectTo } = await response.json();
        localStorage.setItem('authToken', token);
        
        // Use the redirectTo URL from server response (plan-specific dashboard)
        window.location.replace(redirectTo);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Desktop Version Test Badge */}
      <div className="absolute top-4 right-4 z-50">
        <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 text-sm" data-testid="badge-desktop-test">
          🖥️ DESKTOP VERSION TEST
        </Badge>
      </div>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLoginForm(false)}
                className="text-white hover:bg-slate-700"
                data-testid="button-close-login"
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-email"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={authMode === 'signin' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('signin')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-signin-mode"
                >
                  Sign In
                </Button>
                <Button 
                  type="button" 
                  variant={authMode === 'create' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('create')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-create-mode"
                >
                  Create Account
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                disabled={loginLoading}
                data-testid="button-submit-login"
              >
                {loginLoading ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
                  Empower Your Child's{' '}
                  <span className="text-blue-400">IEP</span>{' '}
                  <span className="text-purple-400">Journey</span>
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                  AI-powered tools, certified advocates, and comprehensive resources to help your child succeed in special education.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full"
                  onClick={() => {
                    if (user) {
                      window.location.href = user.role ? `/${user.role}/dashboard` : "/parent/dashboard";
                    } else {
                      setAuthMode('signin');
                      setShowLoginForm(true);
                    }
                  }}
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-slate-500 text-slate-300 hover:bg-slate-700 font-semibold px-8 py-3 rounded-full"
                  onClick={() => {
                    setAuthMode('create');
                    setShowLoginForm(true);
                  }}
                  data-testid="button-create-account"
                >
                  Create Account
                </Button>
              </div>
              
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full flex items-center gap-2"
                onClick={() => {
                  if (user) {
                    window.location.href = user.role ? `/${user.role}/dashboard` : "/parent/dashboard";
                  } else {
                    setAuthMode('signin');
                    setShowLoginForm(true);
                  }
                }}
                data-testid="button-signin-now"
              >
                Sign In Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Happy family working together on educational planning" 
                  className="w-full h-auto"
                  data-testid="img-hero"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features Footer */}
      <section className="absolute bottom-8 left-8">
        <div className="flex flex-wrap gap-4">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-slate-400">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;