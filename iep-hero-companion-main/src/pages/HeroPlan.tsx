import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown,
  CheckCircle,
  Users,
  Calendar,
  Phone,
  FileText,
  Star,
  Shield,
  Clock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const HeroPlan = () => {
  const planFeatures = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Certified Advocate Pairing",
      description: "Get matched with a certified advocate who specializes in your child's needs"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "30-Minute Strategy Call",
      description: "One-on-one consultation to review your child's current IEP and plan next steps"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "IEP Meeting Attendance",
      description: "Your advocate will attend your IEP meeting to provide expert support and guidance"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Customized Templates",
      description: "Personalized letters, forms, and documentation templates for your situation"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "30-Day Portal Access",
      description: "Full access to all premium tools and resources for continued support"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Priority Support",
      description: "Fast-track support with 24-hour response guarantee on all communications"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Parent of 8-year-old with Autism",
      quote: "The HERO Plan changed everything. My advocate helped us get the services my daughter needed, and I felt confident for the first time in years.",
      rating: 5
    },
    {
      name: "Michael R.",
      role: "Parent of 12-year-old with ADHD",
      quote: "Having an expert by my side during the IEP meeting made all the difference. We finally got the accommodations that actually work.",
      rating: 5
    },
    {
      name: "Jennifer L.",
      role: "Parent of 6-year-old with Dyslexia",
      quote: "The personalized templates and ongoing support helped me become a better advocate for my child. Worth every penny.",
      rating: 5
    }
  ];

  const pricingComparison = [
    { feature: "AI IEP Analysis", free: true, hero: true },
    { feature: "Basic Document Templates", free: true, hero: true },
    { feature: "Accommodation Builder", free: true, hero: true },
    { feature: "Certified Advocate Support", free: false, hero: true },
    { feature: "IEP Meeting Attendance", free: false, hero: true },
    { feature: "Personalized Strategy Call", free: false, hero: true },
    { feature: "Custom Templates", free: false, hero: true },
    { feature: "Priority Support", free: false, hero: true },
    { feature: "30-Day Premium Access", free: false, hero: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4" />
                Most Popular Plan
              </Badge>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold">
                The <span className="text-primary">HERO</span> Plan
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Complete advocacy support with expert guidance, meeting attendance, 
                and personalized strategies for your child's success.
              </p>
            </div>

            <div className="bg-gradient-hero text-white rounded-2xl p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-8 w-8" />
                <span className="text-2xl font-bold">$495</span>
              </div>
              <p className="text-sm opacity-90">One-time investment in your child's future</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planFeatures.map((feature, index) => (
              <Card key={index} className="bg-gradient-card border-0 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
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

          {/* Pricing Comparison */}
          <Card className="bg-gradient-card border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">What's Included</CardTitle>
              <CardDescription>
                Compare free tools with the comprehensive HERO Plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-semibold">Feature</th>
                      <th className="text-center py-3 font-semibold">Free Tools</th>
                      <th className="text-center py-3 font-semibold">
                        <Badge variant="secondary" className="gap-1">
                          <Crown className="h-3 w-3" />
                          HERO Plan
                        </Badge>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingComparison.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{item.feature}</td>
                        <td className="text-center py-3">
                          {item.free ? (
                            <CheckCircle className="h-5 w-5 text-success mx-auto" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted mx-auto"></div>
                          )}
                        </td>
                        <td className="text-center py-3">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">What Parents Say</h2>
              <p className="text-muted-foreground">
                Real results from families who chose the HERO Plan
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-gradient-card border-0">
                  <CardHeader>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <CardDescription className="text-base italic">
                      "{testimonial.quote}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-hero text-white border-0">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    Ready to Become Your Child's HERO?
                  </h2>
                  <p className="text-xl opacity-90 max-w-2xl mx-auto">
                    Join hundreds of families who have transformed their IEP experience 
                    with expert advocacy support.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="flex-1"
                    onClick={() => window.location.href = '/subscribe?plan=hero'}
                    data-testid="button-start-hero-plan"
                  >
                    Start HERO Plan ($495)
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-white hover:text-primary"
                    onClick={() => window.location.href = '/parent/subscribe'}
                    data-testid="button-view-all-plans-hero"
                  >
                    View All Plans
                  </Button>
                </div>
                
                <div className="text-sm opacity-75">
                  💡 30-day money-back guarantee • No recurring charges
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Preview */}
          <Card className="bg-surface border-0">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">How quickly can I get matched with an advocate?</h4>
                <p className="text-sm text-muted-foreground">
                  Most families are matched within 24-48 hours based on your child's specific needs and location.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">What if I'm not satisfied with the service?</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 30-day money-back guarantee. If you're not completely satisfied, we'll refund your investment.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Can the advocate attend virtual IEP meetings?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! Our advocates can attend both in-person and virtual meetings, whatever works best for your situation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back Navigation */}
          <div className="flex justify-center pt-4">
            <Button asChild variant="ghost">
              <Link to="/">
                ← Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroPlan;