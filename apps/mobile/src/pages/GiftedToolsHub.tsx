import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumToolCard,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentSelector } from "@/components/StudentSelector";
import { 
  Brain,
  Lightbulb,
  Palette,
  Users,
  Target,
  Music,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  Sparkles,
  BookOpen,
  Calculator,
  Crown,
  Zap,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/lib/queryClient";

const GiftedToolsHub = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'parent' | 'advocate'>('parent');
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  // Detect user role from URL
  useEffect(() => {
    setUserRole(window.location.pathname.includes('advocate') ? 'advocate' : 'parent');
  }, []);

  // StudentSelector fetches its own students internally

  // Fetch real progress data from API for selected student
  const { data: giftedProfile } = useQuery({
    queryKey: ['/api/gifted-profile', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return null;
      const response = await apiRequest('GET', `/api/gifted_assessments/profile?student_id=${selectedStudent}`);
      return response.json();
    },
    enabled: !!selectedStudent
  });

  // Fetch existing AI analysis for selected student
  const { data: existingAIAnalysis } = useQuery({
    queryKey: ['/api/gifted-ai-analysis', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return null;
      const response = await apiRequest('GET', `/api/gifted_assessments/ai-insights?student_id=${selectedStudent}`);
      return response.json();
    },
    enabled: !!selectedStudent
  });

  const giftedToolCards = [
    {
      id: "cognitive-assessment",
      title: "Cognitive Assessment",
      description: "Evaluate intellectual abilities, IQ, and cognitive processing strengths",
      longDescription: "Comprehensive evaluation of intellectual giftedness, processing speed, working memory, and cognitive abilities. Includes analysis of test scores and cognitive patterns.",
      icon: <Brain className="h-8 w-8" />,
      gradient: "from-purple-500 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950",
      borderColor: "border-purple-200 dark:border-purple-800",
      route: "/parent/gifted-tools/cognitive",
      estimatedTime: "15-20 min",
      category: "Intellectual",
      features: [
        "IQ test score analysis",
        "Processing speed evaluation", 
        "Working memory assessment",
        "Cognitive strengths identification"
      ]
    },
    {
      id: "academic-assessment", 
      title: "Academic Assessment",
      description: "Assess subject-specific academic abilities and achievement levels",
      longDescription: "Evaluation of academic giftedness across subjects including mathematics, reading, science, and other academic areas. Identifies specific academic strengths and acceleration needs.",
      icon: <BookOpen className="h-8 w-8" />,
      gradient: "from-blue-500 to-cyan-600", 
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
      borderColor: "border-blue-200 dark:border-blue-800",
      route: "/parent/gifted-tools/academic",
      estimatedTime: "12-15 min",
      category: "Academic",
      features: [
        "Subject-specific evaluation",
        "Achievement level analysis",
        "Acceleration recommendations",
        "Academic strength mapping"
      ]
    },
    {
      id: "creative-assessment",
      title: "Creative Assessment", 
      description: "Explore creative thinking abilities and artistic talents",
      longDescription: "Assessment of creative and divergent thinking abilities, artistic talents, and innovative problem-solving skills. Identifies creative strengths and enrichment opportunities.",
      icon: <Palette className="h-8 w-8" />,
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950", 
      borderColor: "border-pink-200 dark:border-pink-800",
      route: "/parent/gifted-tools/creative",
      estimatedTime: "10-15 min",
      category: "Creative",
      features: [
        "Creative thinking evaluation",
        "Artistic ability assessment",
        "Innovation potential analysis",
        "Creative project recommendations"
      ]
    },
    {
      id: "leadership-assessment",
      title: "Leadership Assessment",
      description: "Evaluate leadership potential and social-emotional strengths",
      longDescription: "Assessment of leadership abilities, social skills, emotional intelligence, and potential for guiding and inspiring others. Includes twice-exceptional considerations.",
      icon: <Users className="h-8 w-8" />,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
      borderColor: "border-green-200 dark:border-green-800",
      route: "/parent/gifted-tools/leadership", 
      estimatedTime: "8-12 min",
      category: "Social-Emotional",
      features: [
        "Leadership style identification",
        "Social skills evaluation",
        "Emotional intelligence assessment", 
        "Twice-exceptional profile analysis"
      ]
    },
    {
      id: "ai-insights",
      title: "AI Gifted Insights",
      description: "Get comprehensive AI analysis of your child's complete gifted profile", 
      longDescription: "Advanced AI analysis that synthesizes data from all completed assessments to provide personalized recommendations, educational planning guidance, and comprehensive gifted profile insights.",
      icon: <Sparkles className="h-8 w-8" />,
      gradient: "from-orange-500 to-pink-600",
      bgGradient: "from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950",
      borderColor: "border-orange-200 dark:border-orange-800", 
      route: "/parent/gifted-tools/ai-insights",
      estimatedTime: "5 min",
      category: "AI Analysis",
      isNew: true,
      requiresOtherTools: true,
      features: [
        "Comprehensive profile synthesis",
        "Personalized recommendations",
        "Educational planning guidance",
        "Twice-exceptional insights",
        "Evidence-based strategies"
      ]
    }
  ];

  // Get completion status for progress indicators using real data
  const getToolCompletionStatus = (toolId: string) => {
    if (!giftedProfile) return false;
    
    switch (toolId) {
      case "cognitive-assessment":
        return (giftedProfile.cognitive_assessments?.length || 0) > 0;
      case "academic-assessment":
        return (giftedProfile.academic_assessments?.length || 0) > 0;
      case "creative-assessment":
        return (giftedProfile.creative_assessments?.length || 0) > 0;
      case "leadership-assessment":
        return (giftedProfile.leadership_assessments?.length || 0) > 0;
      case "ai-insights":
        return (existingAIAnalysis?.analyses?.length || 0) > 0;
      default:
        return false;
    }
  };

  const completedTools = giftedToolCards.filter(tool => 
    !tool.requiresOtherTools && getToolCompletionStatus(tool.id)
  ).length;

  const totalAssessmentTools = giftedToolCards.filter(tool => !tool.requiresOtherTools).length;

  return (
    <MobileAppShell className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PremiumLargeHeader 
        title="Gifted & 2e Assessment Tools"
        subtitle={`${completedTools}/${totalAssessmentTools} assessments completed`}
        showBack
      />
      
      <SafeAreaFull>
        <ContainerMobile className="space-y-8 pb-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 pt-6">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed px-4">
                Comprehensive assessment tools to identify and support your child's giftedness. 
                Complete assessments to build a complete profile, then get AI-powered insights.
              </p>
              
              {/* Progress Overview */}
              <PremiumCard variant="glass" className="p-4 mx-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {completedTools} of {totalAssessmentTools} completed
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ~45 min total
                    </span>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </div>

          {/* Student Selection */}
          <PremiumCard variant="elevated" className="p-6 mx-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Student Selection</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose a student to view their assessment progress
                  </p>
                </div>
              </div>
              <StudentSelector
                selectedStudent={selectedStudent}
                onStudentChange={setSelectedStudent}
                placeholder="Select student to view progress"
                allowEmpty={true}
              />
            </div>
          </PremiumCard>

          {/* Main Tools Grid */}
          <div className="space-y-4 px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assessment Tools</h2>
              <Badge variant="outline" className="text-xs">
                {giftedToolCards.length} tools
              </Badge>
            </div>
            
            <div className="space-y-4">
              {giftedToolCards.map((tool) => {
                const isCompleted = !tool.requiresOtherTools && getToolCompletionStatus(tool.id);
                const canAccess = !tool.requiresOtherTools || completedTools >= totalAssessmentTools;
                const IconComponent = tool.icon.type;
                
                return (
                  <PremiumToolCard
                    key={tool.id}
                    icon={<IconComponent className="h-6 w-6" />}
                    title={tool.title}
                    description={tool.description}
                    badge={isCompleted ? "Complete" : tool.estimatedTime}
                    isPopular={tool.category === "AI Analysis"}
                    isNew={tool.isNew}
                    isLocked={!canAccess}
                    requiredPlan={!canAccess ? "Complete other assessments first" : undefined}
                    onClick={() => canAccess && navigate(tool.route)}
                    className={tool.isNew ? "ring-2 ring-amber-200 dark:ring-amber-800" : ""}
                  />
                );
              })}
            </div>
          </div>

          {/* Getting Started Guide */}
          <PremiumCard variant="gradient" className="p-6 mx-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  How to Use Assessment Tools
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Follow this step-by-step process to build a comprehensive gifted profile
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Start with Cognitive</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Begin with cognitive assessment to establish baseline abilities</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Add Academic Areas</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Complete academic assessment for subject-specific strengths</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Explore Creative & Leadership</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add creative and leadership assessments as relevant</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Get AI Insights</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generate comprehensive analysis and recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Navigation Footer */}
          <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Part of the <span className="font-semibold text-gray-700 dark:text-gray-300">IEP Hero</span> educational toolkit
              </p>
              <Button
                variant="outline"
                onClick={() => navigate(userRole === 'advocate' ? '/advocate/tools' : '/parent/tools')}
                className="w-full max-w-xs mx-auto"
                data-testid="button-back-to-tools"
              >
                ← Back to All Tools
              </Button>
            </div>
          </div>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
};

export default GiftedToolsHub;