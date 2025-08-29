import { Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare,
  Brain,
  Scale,
  Lightbulb,
  PenTool,
  BarChart3,
  Phone,
  Zap,
  Smile,
  Clipboard,
  Flag,
  Sparkles,
  Target
} from "lucide-react";

const AdvocateDashboard = () => {
  const professionalTools = [
    {
      title: "Smart Letter Generator",
      description: "Generate legally sound advocacy letters",
      icon: <PenTool className="h-6 w-6" />,
      url: "/tools/smart-letter",
      category: "Professional Advocate Tools"
    },
    {
      title: "AI IEP Review & Compliance",
      description: "AI-powered IEP analysis and compliance checks",
      icon: <Brain className="h-6 w-6" />,
      url: "/tools/ai-iep-review",
      category: "Professional Advocate Tools"
    },
    {
      title: "Rights Explainer",
      description: "Plain-language legal rights guide",
      icon: <Scale className="h-6 w-6" />,
      url: "/tools/rights-explainer",
      category: "Professional Advocate Tools"
    },
    {
      title: "Meeting Prep Assistant",
      description: "Generate talking points and meeting notes",
      icon: <Lightbulb className="h-6 w-6" />,
      url: "/parent/meeting-prep",
      category: "Professional Advocate Tools"
    },
    {
      title: "Progress Analyzer",
      description: "Data-driven recommendations for IEP goals",
      icon: <BarChart3 className="h-6 w-6" />,
      url: "/tools/progress-analyzer",
      category: "Professional Advocate Tools"
    },
    {
      title: "Advocate Messaging",
      description: "Secure communication with clients",
      icon: <MessageSquare className="h-6 w-6" />,
      url: "/advocate/messages",
      category: "Professional Advocate Tools"
    },
    {
      title: "Ask AI About Docs",
      description: "Query documents with AI assistance",
      icon: <Sparkles className="h-6 w-6" />,
      url: "/tools/ask-ai-docs",
      category: "Professional Advocate Tools"
    },
    {
      title: "Progress Notes & Service Log",
      description: "Track service delivery and outcomes",
      icon: <Clipboard className="h-6 w-6" />,
      url: "/tools/progress-notes",
      category: "Professional Advocate Tools"
    },
    {
      title: "Communication Tracker",
      description: "Monitor parent-school communications",
      icon: <Phone className="h-6 w-6" />,
      url: "/tools/communication-tracker",
      category: "Professional Advocate Tools"
    },
    {
      title: "Advocacy Reports",
      description: "Generate comprehensive client reports",
      icon: <FileText className="h-6 w-6" />,
      url: "/tools/advocacy-reports",
      category: "Professional Advocate Tools"
    },
    {
      title: "IEP Goal Generator",
      description: "AI-powered SMART goal creation",
      icon: <Target className="h-6 w-6" />,
      url: "/tools/goal-generator",
      category: "Professional Advocate Tools"
    },
    {
      title: "Emotion Tracker",
      description: "Student well-being monitoring tools",
      icon: <Smile className="h-6 w-6" />,
      url: "/tools/emotion-tracker",
      category: "Professional Advocate Tools"
    }
  ];

  const specializedTools = [
    {
      title: "Autism Accommodation Builder",
      description: "Professional autism IEP accommodations",
      icon: <Brain className="h-6 w-6" />,
      url: "/tools/autism-accommodations",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "504 Plan Builder", 
      description: "Section 504 accommodation planning",
      icon: <FileText className="h-6 w-6" />,
      url: "/tools/504-plan-builder",
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Occupational Therapy Activity & Adaptation Recommender",
      description: "Professional OT activity suggestions and adaptations",
      icon: <Zap className="h-6 w-6" />,
      url: "/tools/ot-recommender",
      gradient: "from-green-500 to-teal-600"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Professional Advocate Tools</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Flag className="h-4 w-4" />
            Hero Plan Active
          </div>
        </div>

        {/* Professional Advocate Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {professionalTools.map((tool, index) => (
            <Card key={index} className="bg-card hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={tool.url}>
                      Open Tool
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Specialized Assessment Tools */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Specialized Assessment Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specializedTools.map((tool, index) => (
              <Card 
                key={index} 
                className={`bg-gradient-to-br ${tool.gradient} text-white hover:shadow-lg transition-all duration-300 border-0`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{tool.title}</h3>
                      <p className="text-sm text-white/90">{tool.description}</p>
                    </div>
                    <Button asChild variant="secondary" className="w-full">
                      <Link to={tool.url}>
                        Open Tool
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdvocateDashboard;