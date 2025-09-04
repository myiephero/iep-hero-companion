import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Heart } from "lucide-react";

const PricingSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold">
            Choose Your Path to <span className="text-primary">IEP Success</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a parent seeking support or an advocate ready to help families, 
            we have the perfect plan for your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Parent Pricing Card */}
          <Card className="border-2 border-transparent hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Parent Plans</CardTitle>
              <CardDescription className="text-base">
                Empower your child's educational journey with AI tools, advocate connections, and comprehensive IEP support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  AI-powered IEP analysis and insights
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Connect with certified advocates
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Meeting preparation tools
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Document vault and organization
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => window.location.href = "/parent/pricing"}
                data-testid="button-parent-pricing"
              >
                View Parent Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Advocate Pricing Card */}
          <Card className="border-2 border-transparent hover:border-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Advocate Plans</CardTitle>
              <CardDescription className="text-base">
                Expand your practice with powerful tools to support more families and streamline your advocacy work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  Client management dashboard
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  AI-assisted case analysis
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  Matching with parent clients
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  Professional tools and resources
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full bg-secondary hover:bg-secondary/90"
                onClick={() => window.location.href = "/advocate/pricing"}
                data-testid="button-advocate-pricing"
              >
                View Advocate Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Not sure which role fits you? <a href="/auth" className="text-primary hover:underline">Contact us</a> for guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingSelection;