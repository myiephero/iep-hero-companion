import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  Star,
  Rocket,
  Heart,
  Target,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Phone,
  Video,
  ArrowRight
} from "lucide-react";

const ParentHeroPlan = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const heroFeatures = [
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "ALL 50+ Specialized Tools",
      description: "Complete access to every single tool in our platform - no restrictions",
      highlight: "Complete"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Professional Advocate Services",
      description: "Certified advocates work directly with your family - not just tools",
      highlight: "Professional"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Unlimited AI Analysis",
      description: "No limits on AI-powered insights, reviews, and document analysis",
      highlight: "Unlimited"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Monthly Expert Consultations", 
      description: "1-on-1 sessions with specialized advocacy professionals",
      highlight: "Expert"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Crisis Support Hotline",
      description: "24/7 emergency support for urgent IEP situations",
      highlight: "24/7"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Specialized Tools Access",
      description: "Autism, Gifted/2E, behavioral support, crisis intervention tools",
      highlight: "Specialized"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "White-Glove Onboarding",
      description: "Personal setup and training to maximize your family's success",
      highlight: "Premium"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Dedicated Family Success Manager",
      description: "Your personal advocate coordinator and strategic partner",
      highlight: "Dedicated"
    }
  ];

  const comparisonPlans = [
    {
      name: "Essential",
      price: "$59/mo",
      toolCount: "25+ Tools + AI",
      features: ["AI-powered insights", "5GB storage", "Advocate matching", "Priority support"],
      highlight: false
    },
    {
      name: "Premium",
      price: "$199/mo", 
      toolCount: "35+ Professional Tools",
      features: ["Expert analysis tools", "25GB storage", "Specialized autism/2E tools", "Phone support"],
      highlight: false
    },
    {
      name: "Hero Plan",
      price: "$249/mo",
      toolCount: "ALL 50+ Tools + Services",
      features: ["Professional advocate services", "Unlimited AI & storage", "Crisis hotline", "Dedicated success manager"],
      highlight: true
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
          <div className="relative px-6 py-20 text-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-8 py-4 glass-card text-lg font-bold text-primary-glow mb-8 animate-float">
                <Crown className="h-6 w-6 mr-3" />
                HERO PLAN
                <Badge className="ml-3 bg-gradient-primary text-primary-foreground">
                  ULTIMATE
                </Badge>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="text-gradient text-glow block">
                  Become Your Child's
                </span>
                <span className="text-gradient text-glow block mt-2">
                  Ultimate Hero
                </span>
              </h1>
              
              <p className="text-2xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed">
                The most comprehensive advocacy solution with direct expert access, 
                AI-powered insights, and 24/7 support for unstoppable parents
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Button 
                  size="lg" 
                  className="button-premium text-xl px-12 py-6 h-auto font-bold text-white"
                  onClick={handleUpgrade}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Upgrading...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-6 w-6 mr-3" />
                      Upgrade to Hero Plan
                      <ArrowRight className="h-6 w-6 ml-3" />
                    </>
                  )}
                </Button>
              </div>

              {/* Price Display */}
              <div className="glass-card p-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-6xl font-bold text-gradient mb-2">$149</div>
                  <div className="text-xl text-muted-foreground mb-4">/month</div>
                  <div className="text-sm text-muted-foreground">
                    Billed monthly • Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="px-6 py-20 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Everything You Need to 
                <span className="text-gradient"> Succeed</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Hero Plan includes all our premium features plus exclusive tools and direct access to advocacy experts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {heroFeatures.map((feature, index) => (
                <Card key={index} className="premium-card card-hover group relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-primary text-primary-foreground text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="px-6 py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Why Choose the 
                <span className="text-gradient"> Hero Plan?</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Compare all our plans and see why Hero Plan offers unmatched value
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {comparisonPlans.map((plan, index) => (
                <Card 
                  key={index}
                  className={`${
                    plan.highlight 
                      ? 'premium-card ring-2 ring-primary scale-105 z-10 relative' 
                      : 'bg-background border'
                  } transition-all duration-300`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1">
                        RECOMMENDED
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    {plan.toolCount && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400">
                          {plan.toolCount}
                        </Badge>
                      </div>
                    )}
                    <div className="text-3xl font-bold text-gradient mt-4">{plan.price}</div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.highlight ? (
                      <Button 
                        className="w-full button-premium"
                        onClick={handleUpgrade}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Upgrading...' : 'Upgrade Now'}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="px-6 py-20 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Parents Love the 
                <span className="text-gradient"> Hero Plan</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="premium-card">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Sarah M.</div>
                      <div className="text-sm text-muted-foreground">Parent of 7-year-old with autism</div>
                    </div>
                  </div>
                  <blockquote className="text-lg italic mb-4">
                    "The Hero Plan transformed how I advocate for my daughter. Having direct access to experts 
                    and the AI recommendations gave me confidence I never had before."
                  </blockquote>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Michael R.</div>
                      <div className="text-sm text-muted-foreground">Parent of 12-year-old with dyslexia</div>
                    </div>
                  </div>
                  <blockquote className="text-lg italic mb-4">
                    "The monthly strategy sessions and emergency hotline were game-changers. 
                    We finally got the services my son needed after years of struggling."
                  </blockquote>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-8">
              Ready to Become Your Child's 
              <span className="text-gradient"> Hero?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Join thousands of parents who have transformed their advocacy journey with the Hero Plan. 
              Your child's success story starts here.
            </p>
            
            <Button 
              size="lg" 
              className="button-premium text-xl px-12 py-6 h-auto font-bold"
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-6 w-6 mr-3" />
                  Start Your Hero Journey Today
                </>
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground mt-6">
              30-day money-back guarantee • Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentHeroPlan;