import { ToolTeaser, ToolGrid } from "@/components/ToolTeaser";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useToolAccess } from "@/hooks/useToolAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  FileText, 
  Users, 
  Calendar, 
  Target, 
  MessageSquare,
  Crown,
  Sparkles
} from "lucide-react";

export default function PremiumToolsDemo() {
  const { currentPlan, hasAccess } = useToolAccess();

  const premiumTools = [
    {
      toolName: "AI IEP Analysis",
      description: "Advanced AI review of your child's IEP with personalized recommendations",
      icon: <Brain className="h-5 w-5 text-blue-500" />,
      benefits: [
        "Complete IEP document analysis in under 5 minutes",
        "Identifies missing accommodations and services", 
        "Personalized recommendations based on your child's needs",
        "Tracks progress against state standards",
        "Generates parent-friendly summary reports"
      ],
      requiredPlan: "essential" as const,
      currentValue: "Save 10+ hours of manual review per IEP"
    },
    {
      toolName: "Expert Analysis Portal",
      description: "Connect with certified special education experts for professional review",
      icon: <Users className="h-5 w-5 text-purple-500" />,
      benefits: [
        "Professional review by certified advocates",
        "Written analysis report with recommendations",
        "Direct consultation scheduling available",
        "Access to expert community forum",
        "Priority response within 24 hours"
      ],
      requiredPlan: "premium" as const,
      currentValue: "Professional consultation worth $200+ per analysis"
    },
    {
      toolName: "Advocate Matching Tool",
      description: "Get matched with certified advocates in your area",
      icon: <Crown className="h-5 w-5 text-orange-500" />,
      benefits: [
        "Personalized advocate matching based on your child's needs",
        "Direct communication with certified professionals", 
        "Ongoing case management and support",
        "Meeting preparation and attendance assistance",
        "Unlimited consultant access and guidance"
      ],
      requiredPlan: "hero" as const,
      currentValue: "Professional advocacy services worth $150-300/hour"
    },
    {
      toolName: "Meeting Prep Wizard",
      description: "Advanced preparation tools for IEP meetings with AI assistance",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      benefits: [
        "AI-generated talking points and questions",
        "Customized agenda based on your goals",
        "Practice scenarios and role-playing guides",
        "Document organization and checklist creation",
        "Post-meeting follow-up templates"
      ],
      requiredPlan: "essential" as const,
      currentValue: "Professional meeting prep worth $100+ per session"
    },
    {
      toolName: "Goal Generator Pro",
      description: "Create SMART IEP goals with AI assistance and expert validation",
      icon: <Target className="h-5 w-5 text-red-500" />,
      benefits: [
        "AI-powered SMART goal generation",
        "Aligned with state standards and benchmarks",
        "Progress tracking and measurement tools",
        "Expert validation and refinement suggestions",
        "Custom goal templates for different disabilities"
      ],
      requiredPlan: "premium" as const,
      currentValue: "Professional goal writing worth $50+ per goal"
    },
    {
      toolName: "Smart Letter Generator",
      description: "Professional advocacy letters with legal language and expert review",
      icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
      benefits: [
        "Legal-compliant letter templates",
        "Personalized content based on your situation", 
        "Expert review and editing suggestions",
        "Follow-up sequence automation",
        "Success tracking and response management"
      ],
      requiredPlan: "essential" as const,
      currentValue: "Professional letter writing worth $75+ per letter"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Premium IEP Tools
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
          Unlock powerful tools and expert support to advocate effectively for your child's educational needs
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-sm">
            Current Plan: <strong className="ml-1">{currentPlan.toUpperCase()}</strong>
          </Badge>
        </div>
      </div>

      {/* Current Plan Benefits */}
      {currentPlan !== 'free' && (
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Sparkles className="h-5 w-5" />
              Your Active Benefits
            </CardTitle>
            <CardDescription className="text-green-600">
              Tools you currently have access to with your {currentPlan} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumTools
                .filter(tool => hasAccess(tool.toolName.toLowerCase().replace(/\s+/g, '') as any))
                .map((tool, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  {tool.icon}
                  <div>
                    <h4 className="font-medium text-green-700">{tool.toolName}</h4>
                    <p className="text-sm text-green-600">{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Tools Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Discover Premium Tools
        </h2>
        <ToolGrid>
          {premiumTools.map((tool, index) => (
            <ToolTeaser
              key={index}
              toolName={tool.toolName}
              description={tool.description}
              icon={tool.icon}
              benefits={tool.benefits}
              requiredPlan={tool.requiredPlan}
              currentValue={tool.currentValue}
            />
          ))}
        </ToolGrid>
      </div>

      {/* Example Upgrade Prompt */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-bold mb-4 text-center">
          Example: Direct Upgrade Prompt
        </h3>
        <UpgradePrompt
          requiredPlan="hero"
          toolName="Complete IEP Hero Package"
          benefits={[
            "All premium tools and AI analysis",
            "Direct advocate matching and support",
            "Unlimited expert consultations",
            "Priority customer success manager",
            "30-day money-back guarantee",
            "Lifetime rate lock guarantee"
          ]}
          currentValue="Professional advocacy worth $2000+ per year"
        />
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl">
        <h3 className="text-2xl font-bold mb-4">
          Ready to Unlock Your Child's Full Potential?
        </h3>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of parents who have successfully advocated for their children with our premium tools and expert support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Badge className="bg-green-100 text-green-700 px-4 py-2">
            ✓ 60-Day Money-Back Guarantee
          </Badge>
          <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
            ✓ Expert Support Included
          </Badge>
          <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
            ✓ Instant Access
          </Badge>
        </div>
      </div>
    </div>
  );
}