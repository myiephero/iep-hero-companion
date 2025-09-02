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
      title: "Advocate Pairing",
      description: "Get matched with a certified advocate who specializes in your child's needs and educational challenges",
      premium: true,
      step: "1"
    },
    {
      icon: <Crown className="h-6 w-6" />,
      title: "30-Minute Strategy Call",
      description: "Personalized consultation to review your child's current IEP and develop an action plan",
      premium: true,
      step: "2"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Document Review Service",
      description: "Expert analysis of your IEP documents with detailed recommendations for improvements",
      premium: true,
      step: "3"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "IEP Meeting Support",
      description: "Your advocate attends your IEP meeting to provide expert guidance and ensure your voice is heard",
      premium: true,
      step: "4"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "30-Day Complete Toolbox Access",
      description: "Full access to all premium tools, templates, and resources for continued advocacy support",
      premium: false,
      step: "5"
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "One-Time Investment",
      description: "Complete advocacy package with no recurring fees - everything you need in one purchase",
      premium: false,
      step: "6"
    }
  ];

  const comparisonPlans = [
    { name: "Free", price: "$0", features: ["Template Library", "Education Hub"] },
    { name: "Basic", price: "$19", features: ["Intake Vault", "Pre-built Letters"] },
    { name: "Plus", price: "$29", features: ["Progress Tracker", "Self-IEP Tools"] },
    { name: "Premium", price: "$49", features: ["Live Chat", "IEP Review", "Discounts"] },
    { name: "Hero Family Pack", price: "$495", isHero: true, features: ["Advocate Pairing", "Strategy Call", "Doc Review", "IEP Meeting", "30-Day Toolbox Access"] }
  ];

  const testimonials = [
    {
      name: "Maria Rodriguez",
      role: "Mother of child with autism",
      quote: "The advocate helped me understand what questions to ask and what to expect. Having someone there who knew the process made all the difference.",
      rating: 5,
      beforeAfter: "Before: Intimidated by IEP meetings. After: Confident in advocating for my son."
    },
    {
      name: "David Chen",
      role: "Father of daughter with learning disabilities",
      quote: "The strategy call alone was worth it. My advocate reviewed our IEP and pointed out gaps I never would have noticed.",
      rating: 5,
      beforeAfter: "Before: Accepting whatever school offered. After: Got the reading support she needed."
    },
    {
      name: "Sarah Johnson",
      role: "Single mother, child with ADHD",
      quote: "Having professional support during our IEP meeting gave me the confidence to speak up. The school took us seriously.",
      rating: 5,
      beforeAfter: "Before: Felt dismissed by school. After: Son got behavior plan and classroom accommodations."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <TopNavigation />
      
      {/* Limited Launch Offer Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-bold">LAUNCH SPECIAL</span>
            </div>
            <span>Limited to First 50 Parents Only</span>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <div className="text-xs mt-1 opacity-90">
            After launch period: Hero Package will be $995 with 30-day access only
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
            Complete advocacy package with <strong>certified advocate support</strong>, strategy call, 
            document review, IEP meeting attendance, and <strong>30-day premium access</strong> - all in one purchase.
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
                Complete Advocacy Package
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
                    ? 'from-purple-900 to-blue-900 border-cyan-400 border-2' 
                    : 'from-blue-800 to-purple-800 border-blue-400'
                } shadow-2xl transition-all duration-300 hover:scale-105 relative`}
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg">
                  {feature.step}
                </div>
                
                <CardHeader className="pt-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${
                    feature.premium ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  } rounded-2xl mb-4 text-white`}>
                    {feature.icon}
                  </div>
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