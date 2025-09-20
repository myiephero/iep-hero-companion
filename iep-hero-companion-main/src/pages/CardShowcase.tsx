import { Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  FileText, 
  Users, 
  Calendar,
  Star,
  Crown,
  MessageSquare,
  Zap,
  TrendingUp,
  Target,
  Shield,
  ChevronRight,
  Play,
  Sparkles,
  Award,
  Heart,
  Lightbulb
} from "lucide-react";

const CardShowcase = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Card UI/UX Examples
          </h1>
          <p className="text-muted-foreground text-lg">
            Enhanced card designs with improved visual hierarchy, micro-interactions, and accessibility
          </p>
        </div>

        {/* Example 1: Hero Feature Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Hero Feature Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-hero group cursor-pointer transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
              <CardContent className="p-6 relative">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <Brain className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      AI-Powered Analysis
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Revolutionary document analysis with instant insights and recommendations
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-gradient-to-r from-success to-success-light text-success-foreground">
                      Advanced
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass group cursor-pointer transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center backdrop-blur-sm border border-accent/20 group-hover:border-accent/40 transition-all duration-300">
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                      Expert Network
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Connect with certified advocates and education specialists
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-accent/30 text-accent">
                      Network
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium group cursor-pointer transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:border-secondary/40 transition-all duration-300">
                    <Crown className="h-8 w-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors">
                      Premium Support
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Priority access to expert advocacy and premium tools
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-gradient-to-r from-warning to-warning-light text-warning-foreground">
                      Premium
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Example 2: Interactive Tool Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-6 w-6 text-accent" />
            Interactive Tool Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "IEP Analyzer", icon: FileText, color: "primary", progress: 87 },
              { title: "Goal Tracker", icon: Target, color: "success", progress: 94 },
              { title: "Meeting Prep", icon: Calendar, color: "accent", progress: 76 },
              { title: "Progress Report", icon: TrendingUp, color: "secondary", progress: 82 }
            ].map((tool, index) => (
              <Card key={tool.title} className="card-elevated group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-lg bg-${tool.color}/10 flex items-center justify-center group-hover:bg-${tool.color} group-hover:text-${tool.color}-foreground transition-all duration-200`}>
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{tool.title}</h3>
                      <div className="space-y-2">
                        <Progress value={tool.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">{tool.progress}% complete</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Example 3: Stats & Metrics Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Award className="h-6 w-6 text-success" />
            Stats & Metrics Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Documents Analyzed", value: "2,847", change: "+12%", icon: FileText, trend: "up" },
              { title: "Success Rate", value: "94.2%", change: "+3.2%", icon: Star, trend: "up" },
              { title: "Active Users", value: "15,429", change: "+24%", icon: Users, trend: "up" },
              { title: "Satisfaction", value: "4.9/5", change: "+0.3", icon: Heart, trend: "up" }
            ].map((stat) => (
              <Card key={stat.title} className="card-glass hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="outline" className={stat.trend === 'up' ? 'text-success border-success/30' : 'text-destructive border-destructive/30'}>
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Example 4: Action Cards with CTAs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-warning" />
            Action Cards with CTAs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-hero overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Start Your First Analysis</CardTitle>
                    <CardDescription>Upload an IEP document and get instant AI insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      • Compliance checking • Goal quality assessment • Personalized recommendations
                    </p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-button hover:shadow-button-hover transition-all duration-200">
                    Upload Document
                    <Zap className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass border-accent/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center backdrop-blur-sm border border-accent/20">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Connect with an Advocate</CardTitle>
                    <CardDescription>Get matched with certified special education advocates</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      • Free consultation • Expert guidance • Local specialists available
                    </p>
                  </div>
                  <Button variant="outline" className="w-full border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-200">
                    Find an Advocate
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Back to Tools Hub */}
        <div className="pt-8 border-t">
          <Button asChild variant="outline" size="lg">
            <Link to="/tools" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Back to Tools Hub
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CardShowcase;