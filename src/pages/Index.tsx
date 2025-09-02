import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, FileText, MessageSquare, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-image.jpg";
import { useState } from "react";

const Index = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'create'>('signin');
  const [selectedRole, setSelectedRole] = useState<'parent' | 'advocate'>('parent');

  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "AI IEP Review",
      description: "Upload your IEP and get instant insights on gaps, compliance, and opportunities"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Document Vault",
      description: "Safely store and organize all your educational documents in one place"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Advocates",
      description: "Connect with certified advocates who understand your child's needs"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Meeting Prep Wizard",
      description: "Get ready for IEP meetings with customized questions and strategies"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-background to-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-sm font-medium">
                  Empowering Parents • Elevating Advocacy
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Your Child's
                  <span className="text-primary"> IEP Success</span> Starts Here
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Upload IEPs, generate smart letters, collaborate with certified advocates, 
                  and prepare with confidence — all in one secure platform.
                </p>
              </div>
              
              {user ? (
                // Logged in user - show dashboard options
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="hero" 
                    size="lg"
                    onClick={() => window.location.href = "/parent/dashboard"}
                  >
                    Parent Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.location.href = "/advocate/dashboard"}
                  >
                    Advocate Portal
                  </Button>
                </div>
              ) : (
                // Not logged in - show auth toggle
                <div className="space-y-6">
                  {/* Sign In / Create Account Toggle */}
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

                  {authMode === 'signin' ? (
                    // Sign In Mode
                    <div className="text-center">
                      <Button 
                        variant="hero" 
                        size="lg"
                        onClick={() => window.location.href = "/api/login"}
                        data-testid="button-signin"
                      >
                        Sign In to Your Account <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-sm text-muted-foreground mt-3">
                        Access your dashboard, documents, and advocacy tools
                      </p>
                    </div>
                  ) : (
                    // Create Account Mode
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-3">Choose Your Role</h3>
                        <div className="flex items-center justify-center space-x-1 bg-muted rounded-lg p-1 max-w-xs mx-auto">
                          <button
                            onClick={() => setSelectedRole('parent')}
                            className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all ${
                              selectedRole === 'parent'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                            data-testid="role-parent"
                          >
                            Parent
                          </button>
                          <button
                            onClick={() => setSelectedRole('advocate')}
                            className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-all ${
                              selectedRole === 'advocate'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                            data-testid="role-advocate"
                          >
                            Advocate
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Button 
                          variant="hero" 
                          size="lg"
                          onClick={() => window.location.href = `/${selectedRole}/subscribe`}
                          data-testid={`button-create-${selectedRole}`}
                        >
                          View {selectedRole === 'parent' ? 'Parent' : 'Advocate'} Plans <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <p className="text-sm text-muted-foreground mt-3">
                          {selectedRole === 'parent' 
                            ? 'Get AI-powered IEP tools and connect with advocates'
                            : 'Join our network and help families succeed'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  FERPA Compliant
                </div>
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

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero rounded-2xl opacity-20 blur-3xl"></div>
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
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-gradient-card">
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
      <section className="py-16 bg-gradient-hero">
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
                    window.location.href = "/parent/dashboard";
                  } else {
                    window.location.href = "/api/login";
                  }
                }}
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-primary"
                onClick={() => {
                  window.location.href = "/subscribe";
                }}
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
