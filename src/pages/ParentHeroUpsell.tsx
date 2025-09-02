import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Users, Shield, Zap, Heart, Crown, ArrowRight, Sparkles, Award, Clock, ChevronDown, CheckCircle, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { TopNavigation } from "@/components/TopNavigation";

export default function ParentHeroUpsell() {
  const [showComparison, setShowComparison] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 33 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const heroFeatures = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Certified Advocate Partnership",
      description: "Get paired with a certified special education advocate who specializes in your child's unique needs",
      premium: true
    },
    {
      icon: <Crown className="h-6 w-6" />,
      title: "IEP Meeting Representation",
      description: "Your advocate attends IEP meetings with you, providing expert guidance and support in real-time",
      premium: true
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Legal Protection & Guidance",
      description: "Access to legal consultation and protection when school districts don't follow IEP requirements",
      premium: true
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Priority 24/7 Support",
      description: "Emergency support line for urgent situations, with guaranteed response within 2 hours",
      premium: true
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Lifetime Platform Access",
      description: "Never lose access to your tools, documents, and resources - lifetime platform membership included",
      premium: false
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Complete Family Package",
      description: "Covers all children in your family, no additional charges for siblings with special needs",
      premium: false
    }
  ];

  const comparisonPlans = [
    { name: "Free", price: "$0", features: ["Basic IEP review", "Limited templates", "Community support"] },
    { name: "Basic", price: "$19", features: ["AI analysis", "Standard templates", "Email support", "Document storage"] },
    { name: "Plus", price: "$29", features: ["Everything in Basic", "Meeting prep tools", "Priority support", "Advanced analytics"] },
    { name: "Premium", price: "$49", features: ["Everything in Plus", "Expert consultations", "Legal resources", "Custom templates"] },
    { name: "Hero Family Pack", price: "$495", isHero: true, features: ["Everything in Premium", "Certified advocate partner", "IEP meeting attendance", "Legal protection", "24/7 emergency support", "Lifetime access", "Covers whole family"] }
  ];

  const testimonials = [
    {
      name: "Maria Rodriguez",
      role: "Mother of 3 special needs children",
      quote: "The Hero Family Pack saved us over $3,000 in legal fees and got our children the services they deserved. My advocate became our family's guardian angel.",
      rating: 5,
      beforeAfter: "Before: Struggled for 2 years to get proper accommodations. After: All 3 children thriving in 6 months."
    },
    {
      name: "David Chen",
      role: "Father of autistic daughter",
      quote: "Having an advocate in our IEP meeting completely changed the dynamic. The school finally listened and my daughter is excelling.",
      rating: 5,
      beforeAfter: "Before: School denied services. After: Full inclusion with aide support approved."
    },
    {
      name: "Sarah Johnson",
      role: "Single mother, 2 children with ADHD",
      quote: "The lifetime access means I'm covered through high school graduation. Best investment I've ever made for my family.",
      rating: 5,
      beforeAfter: "Before: Felt overwhelmed and alone. After: Confident advocate with expert backing."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <TopNavigation />
      
      {/* Urgent Limited Time Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 text-sm font-medium">
            <Clock className="h-4 w-4" />
            <span>LIMITED TIME: Save $200+ vs monthly plans</span>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 rounded-full mb-6 font-bold text-lg">
            <Sparkles className="h-5 w-5" />
            MOST POPULAR CHOICE
            <Sparkles className="h-5 w-5" />
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Become Your Child's
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent block">
              HERO
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
            The ultimate advocacy toolkit that pairs you with a <strong>certified advocate</strong> and provides 
            <strong> lifetime support</strong> for your entire family's special education journey.
          </p>

          {/* Price Highlight */}
          <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-3xl p-8 max-w-lg mx-auto mb-8 border border-purple-400">
            <div className="text-center">
              <div className="text-gray-300 text-lg mb-2">One-time investment</div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-6xl font-bold text-white">$495</span>
                <div className="text-left">
                  <div className="text-green-400 font-semibold">Save $2,445</div>
                  <div className="text-gray-400 text-sm">vs. 5 years of Premium</div>
                </div>
              </div>
              <Badge className="bg-green-500 text-white px-4 py-2 text-lg">
                <Gift className="h-4 w-4 mr-2" />
                Covers Your Entire Family
              </Badge>
            </div>
          </div>

          {/* Primary CTA */}
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xl px-12 py-6 rounded-2xl shadow-2xl mb-4"
            data-testid="button-purchase-hero-primary"
          >
            <Heart className="h-6 w-6 mr-3" />
            Get Hero Family Pack Now
            <ArrowRight className="h-6 w-6 ml-3" />
          </Button>
          
          <p className="text-blue-200 text-sm">
            ✓ 30-day money-back guarantee ✓ Instant access ✓ No recurring fees
          </p>
        </div>

        {/* What Makes Hero Special */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            What Makes Hero Family Pack 
            <span className="text-yellow-400"> Extraordinary?</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {heroFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className={`bg-gradient-to-br ${
                  feature.premium 
                    ? 'from-purple-900 to-blue-900 border-yellow-400 border-2' 
                    : 'from-blue-800 to-purple-800 border-blue-400'
                } shadow-2xl transition-all duration-300 hover:scale-105`}
              >
                <CardHeader>
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${
                    feature.premium ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  } rounded-2xl mb-4 text-white`}>
                    {feature.icon}
                  </div>
                  {feature.premium && (
                    <Badge className="w-fit bg-yellow-400 text-black mb-2">
                      <Crown className="h-3 w-3 mr-1" />
                      EXCLUSIVE
                    </Badge>
                  )}
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-100 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Real Heroes, Real Results
          </h2>
          <p className="text-blue-200 text-center mb-12 text-lg">
            Join hundreds of families who transformed their special education experience
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-blue-800 to-purple-800 border-blue-400 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-blue-100 text-base italic leading-relaxed">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-t border-blue-600 pt-4">
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-blue-300 text-sm mb-3">{testimonial.role}</p>
                    <div className="bg-green-900/30 border border-green-400 rounded-lg p-3">
                      <p className="text-green-300 text-sm font-medium">{testimonial.beforeAfter}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Button 
              onClick={() => setShowComparison(!showComparison)}
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-black"
            >
              {showComparison ? 'Hide' : 'Show'} Plan Comparison
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {showComparison && (
            <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-blue-400 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">See How Hero Compares</CardTitle>
                <CardDescription className="text-blue-200">
                  Hero Family Pack delivers unmatched value
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="grid grid-cols-5 gap-4 min-w-[800px]">
                  {comparisonPlans.map((plan, index) => (
                    <div 
                      key={index} 
                      className={`text-center p-4 rounded-xl ${
                        plan.isHero 
                          ? 'bg-gradient-to-b from-yellow-400 to-orange-400 text-black border-4 border-yellow-300' 
                          : 'bg-blue-800 text-white'
                      }`}
                    >
                      <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                      <div className="text-2xl font-bold mb-4">{plan.price}</div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className="text-sm flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Final CTA Section */}
        <Card className="bg-gradient-to-r from-purple-800 to-blue-800 border-yellow-400 border-2 shadow-2xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Become Your Child's Hero?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join the families who've transformed their special education journey. 
              Get expert advocacy support, lifetime access, and peace of mind for your entire family.
            </p>
            
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center max-w-2xl mx-auto mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xl px-12 py-6 rounded-2xl shadow-2xl"
                data-testid="button-purchase-hero-final"
              >
                <Heart className="h-6 w-6 mr-3" />
                Get Hero Family Pack - $495
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
              
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">Save $2,445</div>
                <div className="text-blue-200 text-sm">vs. 5 years of Premium plans</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center text-blue-200 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                30-day money-back guarantee
              </div>
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Instant access after purchase
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Covers your entire family
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link to="/parent/subscribe">
            <Button variant="ghost" className="text-blue-200 hover:text-white">
              ← Back to All Plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}