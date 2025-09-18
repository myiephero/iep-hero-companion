import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, BookOpen, CheckCircle, FileText, Heart, Shield, Users, Zap, Eye, EyeOff } from "lucide-react";

// Desktop independent auth system (simplified for now)
const useAuth = () => ({ user: null, loading: false });

const features = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "AI IEP Analysis",
    description: "Upload IEPs and get instant, expert-level insights on compliance and recommendations."
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Advocate Matching",
    description: "Connect with certified special education advocates in your area for personalized support."
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Meeting Preparation",
    description: "Comprehensive tools to prepare for IEP meetings with confidence and documentation."
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Special Needs Resources",
    description: "Specialized tools for autism, ADHD, gifted/2e, and other special education needs."
  }
];

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
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
        const { token, user: userData } = await response.json();
        localStorage.setItem('authToken', token);
        
        // Navigate to desktop dashboard (independent of mobile routes)
        navigate('/');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground text-center">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-primary">IEP Hero - Desktop</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button 
                  variant="default"
                  onClick={() => navigate('/')}
                  data-testid="button-dashboard"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => setShowLoginForm(!showLoginForm)}
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section - Desktop Optimized */}
        <section className="relative py-24 lg:py-32">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 max-w-2xl">
                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                    Empower Your Child's{" "}
                    <span className="text-primary">IEP</span>{" "}
                    <span className="text-accent">Journey</span>
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                    AI-powered tools, certified advocates, and comprehensive resources to help your child succeed in special education.
                  </p>
                </div>

                {/* Auth Section - Desktop Layout */}
                <div className="space-y-6">
                  {user ? (
                    // User is logged in
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="default"
                        size="lg"
                        onClick={() => navigate('/')}
                        data-testid="button-dashboard"
                        className="px-8"
                      >
                        Go to Dashboard 
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    // User not logged in - Desktop Auth Form
                    <div className="space-y-6">
                      {!showLoginForm ? (
                        <div className="flex items-center gap-4">
                          {/* Toggle between Sign In / Create Account */}
                          <div className="flex items-center bg-muted rounded-lg p-1">
                            <button
                              onClick={() => setAuthMode('signin')}
                              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                                authMode === 'signin'
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              data-testid="toggle-signin"
                            >
                              Sign In
                            </button>
                            <button
                              onClick={() => setAuthMode('create')}
                              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                                authMode === 'create'
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              data-testid="toggle-create"
                            >
                              Create Account
                            </button>
                          </div>

                          <Button
                            onClick={() => setShowLoginForm(true)}
                            size="lg"
                            className="px-8"
                            data-testid="button-get-started"
                          >
                            {authMode === 'signin' ? 'Sign In' : 'Get Started Free'}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </div>
                      ) : (
                        // Quick Login Form - Desktop Layout
                        <Card className="max-w-md">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-xl">{authMode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
                            <CardDescription>
                              {authMode === 'signin' ? 'Welcome back to IEP Hero' : 'Join thousands of families getting results'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <form onSubmit={handleLogin} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={loginForm.email}
                                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                                  placeholder="Enter your email"
                                  required
                                  disabled={loginLoading}
                                  data-testid="input-email"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                  <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loginLoading}
                                    className="pr-12"
                                    data-testid="input-password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                    onClick={() => setShowPassword(!showPassword)}
                                    data-testid="button-toggle-password"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button 
                                  type="submit" 
                                  disabled={loginLoading}
                                  className="flex-1"
                                  data-testid="button-submit"
                                >
                                  {loginLoading ? 'Signing in...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowLoginForm(false)}
                                  data-testid="button-cancel"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Hero Image - Desktop Layout */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="w-full h-[600px] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-center space-y-4 text-primary/60">
                      <FileText className="w-24 h-24 mx-auto" />
                      <p className="text-lg font-medium">IEP Hero Desktop Platform</p>
                      <p className="text-sm">Comprehensive Educational Advocacy</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                {/* Floating Feature Cards */}
                <div className="absolute -bottom-8 -left-8 bg-background rounded-xl shadow-lg p-4 border max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">98% Success Rate</p>
                      <p className="text-xs text-muted-foreground">Families see improvements</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-8 -right-8 bg-background rounded-xl shadow-lg p-4 border max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">FERPA Compliant</p>
                      <p className="text-xs text-muted-foreground">Your data is secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Desktop Grid Layout */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-6">Comprehensive IEP Support Platform</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Everything you need to advocate effectively for your child's education, powered by AI and backed by certified experts.
              </p>
            </div>

            {/* Features Grid - 2x2 Desktop Layout */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <div className="text-primary">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Desktop Layout */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold">Ready to Transform Your Child's IEP Experience?</h3>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Join thousands of families who have successfully navigated the IEP process with our comprehensive platform.
                    </p>
                  </div>
                  {!user && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                      <Button size="lg" className="px-8" onClick={() => setShowLoginForm(true)}>
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="lg" className="px-8">
                        Learn More
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;