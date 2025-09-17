import { useState } from "react";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  PremiumToolCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
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
  Eye,
  Search,
  Crown,
  Zap,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StudentSelector } from "@/components/StudentSelector"; 
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const AutismToolsHub = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

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
    <MobileAppShell>
      <SafeAreaFull>
        {/* Premium Header */}
        <PremiumLargeHeader
          title="Autism Support Tools"
          subtitle="Build comprehensive support plans for your child"
          rightAction={
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          }
        />

        <ContainerMobile padding="md" className="space-y-8 pb-32">
          {/* Premium Progress Section */}
          <PremiumCard variant="gradient" className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Your Progress
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {completedTools}/3 Tools Complete
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Progress value={totalProgress} className="h-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                  {completedTools === 0 && "Start with any tool to begin building your child's profile"}
                  {completedTools > 0 && completedTools < 3 && `Complete ${3 - completedTools} more tool${3 - completedTools > 1 ? 's' : ''} to unlock AI insights`}
                  {completedTools === 3 && "All tools complete! Click AI Insights for comprehensive analysis"}
                </p>
              </div>
              
              {/* Progress Features */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <Zap className="h-4 w-4" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Shield className="h-4 w-4" />
                  <span>Evidence-Based</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Heart className="h-4 w-4" />
                  <span>Parent-Friendly</span>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Premium Student Selection */}
          <PremiumCard variant="elevated" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    Student Selection
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose a student to view their progress
                  </p>
                </div>
              </div>
              <StudentSelector
                selectedStudent={selectedStudent}
                onStudentChange={setSelectedStudent}
                placeholder="Select student to view autism tools progress"
                data-testid="student-selector"
              />
            </div>
          </PremiumCard>

          {/* Premium Tool Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Autism Support Tools
                </h3>
                {autismTools.filter(t => t.badge).length > 0 && (
                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {autismTools.map((tool) => {
                const handleNavigate = () => {
                  if (!tool.disabled) {
                    navigate(tool.path);
                  }
                };
                
                return (
                  <PremiumCard 
                    key={tool.id}
                    variant={tool.disabled ? "default" : "interactive"} 
                    onClick={tool.disabled ? undefined : handleNavigate}
                    disabled={tool.disabled}
                    className={`p-6 text-left relative overflow-hidden ${
                      tool.disabled ? "opacity-60" : ""
                    }`}
                  >
                    {/* Background Pattern for Premium Tools */}
                    {!tool.disabled && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50/50 to-transparent dark:from-blue-950/20 rounded-full transform translate-x-16 -translate-y-16" />
                    )}
                    
                    <div className="relative z-10 space-y-4">
                      {/* Header with Icon and Badges */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Icon */}
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            tool.disabled 
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-400" 
                              : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-600 dark:text-blue-400"
                          )}>
                            {tool.icon}
                          </div>
                          
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {tool.progress !== undefined && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                {tool.progress}% Complete
                              </span>
                            )}
                            {tool.completed && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                <CheckCircle className="h-3 w-3" />
                                Started
                              </span>
                            )}
                            {tool.badge && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                                <Sparkles className="h-3 w-3" />
                                {tool.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Indicator */}
                        {!tool.disabled && (
                          <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 leading-tight">
                          {tool.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {tool.description}
                        </p>
                        
                        {/* Features List */}
                        <div className="space-y-1">
                          {tool.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <div className="h-1 w-1 rounded-full bg-blue-500 mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        
                        {/* Progress Bar */}
                        {tool.progress !== undefined && (
                          <div className="space-y-2">
                            <Progress value={tool.progress} className="h-2" />
                          </div>
                        )}
                      </div>

                      {/* Locked State */}
                      {tool.disabled && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 border-dashed">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Target className="h-4 w-4" />
                            <span>Complete other tools first</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </PremiumCard>
                );
              })}
            </div>
          </div>

          {/* Premium Help Section */}
          <PremiumCard variant="glass" className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                Building Your Child's Success Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                Work through each tool to build a comprehensive support plan. Our AI analyzes your selections for personalized insights.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <Eye className="h-4 w-4" />
                <span>Evidence-based</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Target className="h-4 w-4" />
                <span>Personalized</span>
              </div>
            </div>
          </PremiumCard>

          {/* Premium Back Navigation */}
          <div className="text-center pt-4">
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => navigate('/parent/tools')}
              className="h-12 px-6 rounded-xl"
              data-testid="button-back-to-hub"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Tools Hub
            </Button>
          </div>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
};

export default AutismToolsHub;