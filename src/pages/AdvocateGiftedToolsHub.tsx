import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentSelector } from "@/components/StudentSelector";
import { 
  Brain,
  Lightbulb,
  Target,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "@/lib/queryClient";

const AdvocateGiftedToolsHub = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  // Fetch students to show progress
  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return response.json();
    },
  });

  const giftedToolCards = [
    {
      id: "cognitive-assessment",
      title: "Cognitive Assessment",
      description: "Track intellectual abilities and learning patterns",
      icon: <Brain className="h-6 w-6" />,
      iconColor: "text-pink-500",
      bgColor: "bg-slate-700",
      route: "/advocate/gifted-tools/cognitive"
    },
    {
      id: "enrichment-needs",
      title: "Enrichment Needs", 
      description: "Document advanced learning opportunities",
      icon: <Lightbulb className="h-6 w-6" />,
      iconColor: "text-yellow-500",
      bgColor: "bg-slate-700",
      route: "/advocate/gifted-tools/enrichment"
    },
    {
      id: "2e-support",
      title: "2E Support",
      description: "Address unique twice-exceptional needs", 
      icon: <Target className="h-6 w-6" />,
      iconColor: "text-red-500",
      bgColor: "bg-slate-700",
      route: "/advocate/gifted-tools/2e-support"
    },
    {
      id: "ai-insights",
      title: "AI Insights",
      description: "Get intelligent analysis and recommendations",
      icon: <Sparkles className="h-6 w-6" />,
      iconColor: "text-white",
      bgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
      route: "/advocate/gifted-tools/ai-insights",
      isNew: true
    },
    {
      id: "quick-assessment",
      title: "Quick Assessment", 
      description: "Create a comprehensive assessment",
      icon: <BookOpen className="h-6 w-6" />,
      iconColor: "text-orange-400",
      bgColor: "bg-orange-800",
      route: "/advocate/gifted-tools/quick-assessment"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">
                Gifted & Twice-Exceptional Support
              </h1>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl">
            Advanced learning assessments and support for gifted and 2E learners
          </p>
        </div>

        {/* Integrated Gifted Support Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Integrated Gifted Support
          </h2>
          <p className="text-gray-300 max-w-4xl mx-auto">
            Comprehensive gifted and twice-exceptional assessment tools are now seamlessly integrated into your client's profile.
          </p>
        </div>

        {/* Student Selection */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5 text-yellow-400" />
              Student Selection
            </CardTitle>
            <CardDescription className="text-gray-300">
              Choose a student to view their gifted assessment profile progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student to view gifted tools progress"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Main Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {giftedToolCards.map((tool, index) => {
            // Create special layout for AI Insights (spans 2 columns on lg screens)
            const isAIInsights = tool.id === "ai-insights";
            const isQuickAssessment = tool.id === "quick-assessment";
            
            return (
              <Card 
                key={tool.id}
                className={`${tool.bgColor} border-gray-600 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer text-white ${
                  isAIInsights ? 'lg:col-span-2' : ''
                } ${
                  isQuickAssessment ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
                onClick={() => navigate(tool.route)}
                data-testid={`card-${tool.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${tool.iconColor}`}>
                      {tool.icon}
                    </div>
                    {tool.isNew && (
                      <Badge className="bg-orange-500 text-white font-bold text-xs">
                        NEW
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {tool.description}
                  </p>
                  
                  {/* Add button for Quick Assessment */}
                  {isQuickAssessment && (
                    <div className="mt-4">
                      <Button 
                        variant="secondary" 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white border-none"
                      >
                        Start Assessment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Add button for AI Insights */}
                  {isAIInsights && (
                    <div className="mt-4">
                      <Button 
                        variant="secondary" 
                        className="bg-purple-700 hover:bg-purple-800 text-white border-none"
                      >
                        Generate Insights
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-400">
            Part of the <strong>IEP Hero</strong> educational toolkit
          </div>
          <Link 
            to="/advocate/tools"
            className="text-sm text-blue-400 hover:underline"
            data-testid="link-back-to-tools"
          >
            ← Back to All Tools
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdvocateGiftedToolsHub;