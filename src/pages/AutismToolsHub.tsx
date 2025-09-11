import { useState } from "react";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  Volume2, 
  Users, 
  CheckCircle, 
  Brain,
  ArrowRight,
  Sparkles,
  Heart,
  Target,
  Eye
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StudentSelector } from "@/components/StudentSelector";

const AutismToolsHub = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const { toast } = useToast();

  // Fetch students from API
  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return response.json();
    },
  });

  // Fetch real progress data from API for selected student
  const { data: autismProfile } = useQuery({
    queryKey: ['/api/autism-profile', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return null;
      const response = await apiRequest('GET', `/api/autism_accommodations/profile?student_id=${selectedStudent}`);
      return response.json();
    },
    enabled: !!selectedStudent
  });

  // Fetch existing AI analysis for selected student
  const { data: existingAIAnalysis } = useQuery({
    queryKey: ['/api/autism-ai-analysis', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return null;
      const response = await apiRequest('GET', `/api/autism-ai-analysis?student_id=${selectedStudent}`);
      return response.json();
    },
    enabled: !!selectedStudent
  });

  // Calculate real progress data
  const toolProgress = {
    sensory: autismProfile?.sensory_accommodations?.length > 0 ? 100 : 0,
    communication: autismProfile?.communication_accommodations?.length > 0 ? 100 : 0,
    behavioral: autismProfile?.behavioral_accommodations?.length > 0 ? 100 : 0,
    ai_insights: existingAIAnalysis?.analyses?.length > 0
  };

  const autismTools = [
    {
      id: "sensory",
      title: "Sensory Accommodations",
      description: "Help your child manage sensory processing challenges and environmental needs",
      icon: <Volume2 className="h-8 w-8" />,
      path: "/parent/autism-tools/sensory",
      color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
      features: [
        "Noise-canceling strategies",
        "Environmental modifications", 
        "Sensory break planning",
        "Seating accommodations"
      ],
      completed: toolProgress.sensory > 0,
      progress: toolProgress.sensory
    },
    {
      id: "communication",
      title: "Communication Support",
      description: "Build communication skills and social interaction strategies",
      icon: <Users className="h-8 w-8" />,
      path: "/parent/autism-tools/communication",
      color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
      features: [
        "Visual communication aids",
        "Social skills development",
        "Peer support systems",
        "Communication devices"
      ],
      completed: toolProgress.communication > 0,
      progress: toolProgress.communication
    },
    {
      id: "behavioral",
      title: "Behavioral Strategies",
      description: "Positive behavior support and self-regulation techniques",
      icon: <CheckCircle className="h-8 w-8" />,
      path: "/parent/autism-tools/behavioral",
      color: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800", 
      iconColor: "text-purple-600 dark:text-purple-400",
      features: [
        "Positive behavior plans",
        "Self-regulation strategies",
        "Academic support",
        "Break request systems"
      ],
      completed: toolProgress.behavioral > 0,
      progress: toolProgress.behavioral
    },
    {
      id: "ai-insights",
      title: "AI Autism Insights",
      description: "Comprehensive AI analysis of your child's autism profile and personalized recommendations",
      icon: <Brain className="h-8 w-8" />,
      path: "/parent/autism-tools/ai-insights",
      color: "bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950 border-orange-200 dark:border-orange-800",
      iconColor: "text-orange-600 dark:text-orange-400",
      features: [
        "Evidence-based analysis",
        "Personalized recommendations",
        "Professional-level insights",
        "Comprehensive report"
      ],
      badge: "NEW",
      badgeColor: "bg-gradient-to-r from-orange-500 to-pink-500 text-white",
      completed: toolProgress.ai_insights,
      requiresData: true,
      disabled: toolProgress.sensory === 0 || toolProgress.communication === 0 || toolProgress.behavioral === 0
    }
  ];

  const totalProgress = ((toolProgress.sensory + toolProgress.communication + toolProgress.behavioral) / 3) * 100;
  const completedTools = [toolProgress.sensory, toolProgress.communication, toolProgress.behavioral].filter(p => p > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Autism Support Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Build a comprehensive autism support plan for your child through our step-by-step tools. 
            Complete tools 1-3 to unlock AI-powered insights and recommendations.
          </p>
          
          {/* Progress Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Your Progress</span>
              <span className="text-sm font-bold text-primary">{completedTools}/3 Tools Complete</span>
            </div>
            <Progress value={totalProgress} className="h-3 mb-2" />
            <p className="text-xs text-muted-foreground">
              {completedTools === 0 && "Start with any tool to begin building your child's profile"}
              {completedTools > 0 && completedTools < 3 && `Complete ${3 - completedTools} more tool${3 - completedTools > 1 ? 's' : ''} to unlock AI insights`}
              {completedTools === 3 && "All tools complete! Click AI Insights for comprehensive analysis"}
            </p>
          </div>
        </div>

        {/* Student Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Student Selection
            </CardTitle>
            <CardDescription>
              Choose a student to view their autism support profile progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student to view autism tools progress"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
          {autismTools.map((tool) => (
            <Card 
              key={tool.id} 
              className={`group hover:shadow-xl transition-all duration-300 ${tool.color} relative overflow-hidden`}
            >
              {/* Badge */}
              {tool.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className={`${tool.badgeColor} font-bold text-xs px-3 py-1 shadow-lg`}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    {tool.badge}
                  </Badge>
                </div>
              )}

              {/* Disabled Overlay */}
              {tool.disabled && (
                <div className="absolute inset-0 bg-black/20 z-20 flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center max-w-xs mx-4">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Complete at least one accommodation tool first
                    </p>
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${tool.iconColor} bg-white/50 dark:bg-gray-800/50`}>
                      {tool.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className={`h-1.5 w-1.5 rounded-full ${tool.iconColor} mr-3`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Progress for accommodation tools */}
                {tool.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{tool.progress}% Complete</span>
                    </div>
                    <Progress value={tool.progress} className="h-2" />
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  asChild 
                  className={`w-full ${tool.disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:scale-105'} transition-all duration-200`}
                  disabled={tool.disabled}
                  data-testid={`button-${tool.id}`}
                >
                  <Link to={tool.disabled ? "#" : tool.path} className="flex items-center justify-center">
                    {tool.completed ? "Continue Building" : "Start Tool"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>

                {/* Completion Status */}
                {tool.completed && (
                  <div className="flex items-center justify-center mt-3 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Profile Started
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <Heart className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Building Your Child's Success Plan
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Each tool focuses on a specific area of support. Work through tools 1-3 in any order to build 
              a comprehensive accommodation plan. Our AI will analyze your selections and provide personalized 
              insights and recommendations.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Evidence-based
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Personalized
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Parent-friendly
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Tools Hub */}
        <div className="flex justify-center pt-8">
          <Button asChild variant="ghost" size="sm" data-testid="button-back-to-hub">
            <Link to="/parent/tools" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Tools Hub
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AutismToolsHub;