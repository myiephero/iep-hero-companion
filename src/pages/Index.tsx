import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, BookOpen, CheckCircle, FileText, Heart, Shield, Users, Zap, Eye, EyeOff } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

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
        const { token, user: userData, redirectTo } = await response.json();
        localStorage.setItem('authToken', token);
        
        // Redirect to unified dashboard instead of plan-specific URL
        navigate('/dashboard', { replace: true });
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Empower Your Child's{" "}
                  <span className="text-primary">IEP Journey</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  AI-powered tools, certified advocates, and comprehensive resources to help your child succeed in special education.
                </p>
              </div>

              {/* Auth Section */}
              <div className="space-y-6">
                {user ? (
                  // User is logged in
                  <div className="text-center">
                    <Button 
                      variant="default"
                      size="lg"
                      onClick={() => navigate('/dashboard')}
                      data-testid="button-dashboard"
                    >
                      Go to {user.role === 'parent' ? 'Parent' : 'Advocate'} Dashboard 
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  // User not logged in
                  <div className="space-y-6">
                    {!showLoginForm ? (
                      <>
                        {/* Toggle between Sign In / Create Account */}
                        <div className="flex items-center justify-center space-x-1 bg-muted rounded-lg p-1 max-w-xs mx-auto">
                          <button
                            onClick={() => setAuthMode('signin')}
                            className={`flex-1 px-6 py-3 rounded-md text-sm font-medium transition-all ${
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
                            className={`flex-1 px-6 py-3 rounded-md text-sm font-medium transition-all ${
                              authMode === 'create'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                            data-testid="toggle-create"
                          >
                            Create Account
                          </button>
                        </div>

                        {/* Action Buttons or Role Selection */}
                        {authMode === 'signin' ? (
                          <div className="flex justify-center">
                            <Button 
                              size="lg"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4"
                              onClick={() => setShowLoginForm(true)}
                              data-testid="button-signin"
                            >
                              Sign In Now
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                          </div>
                        ) : (
                          /* Role Selection for Create Account */
                          <div className="space-y-4">
                            <p className="text-center text-lg font-medium">Choose your role to get started:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                              {/* Parent Option */}
                              <div 
                                className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors group"
                                onClick={() => navigate("/parent/pricing")}
                                data-testid="card-parent"
                              >
                                <div className="text-center space-y-3">
                                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  </div>
                                  <h3 className="text-xl font-semibold">Parent</h3>
                                  <p className="text-muted-foreground text-sm">
                                    Empower your child's educational journey with AI tools, advocate connections, and comprehensive IEP support.
                                  </p>
                                </div>
                              </div>

                              {/* Advocate Option */}
                              <div 
                                className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-secondary transition-colors group"
                                onClick={() => navigate("/advocate/pricing")}
                                data-testid="card-advocate"
                              >
                                <div className="text-center space-y-3">
                                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-secondary/20 transition-colors">
                                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <h3 className="text-xl font-semibold">Advocate</h3>
                                  <p className="text-muted-foreground text-sm">
                                    Expand your practice with powerful tools to support more families and streamline your advocacy work.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // Inline Login Form
                      <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            required
                            data-testid="input-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                              required
                              data-testid="input-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loginLoading}
                            data-testid="button-login-submit"
                          >
                            {loginLoading ? 'Signing In...' : 'Sign In'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setShowLoginForm(false)}
                            data-testid="button-back"
                          >
                            Back
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>


              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  HIPAA Secure
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Certified Advocates
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Bank-Level Security
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Supports IDEA/FAPE
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl opacity-20 blur-3xl"></div>
              <img
                src={heroImage}
                alt="Children with disabilities thriving in supportive educational environments"
                className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Everything You Need for IEP Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From initial review to meeting preparation, our platform guides you every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Advocate with Confidence?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of parents who have transformed their IEP experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => {
                  if (user) {
                    navigate('/dashboard');
                  } else {
                    setShowLoginForm(true);
                  }
                }}
                data-testid="button-cta-primary"
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white"
                onClick={() => navigate("/pricing")}
                data-testid="button-cta-secondary"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;