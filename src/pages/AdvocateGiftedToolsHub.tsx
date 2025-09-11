import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Calculator
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "@/lib/queryClient";

const AdvocateGiftedToolsHub = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'parent' | 'advocate'>('advocate');
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  // Detect user role from URL
  useEffect(() => {
    setUserRole(window.location.pathname.includes('advocate') ? 'advocate' : 'parent');
  }, []);

  // Fetch students to show progress
  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return response.json();
    },
  });

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
      route: "/advocate/gifted-tools/cognitive",
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
      route: "/advocate/gifted-tools/academic",
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
      route: "/advocate/gifted-tools/creative",
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
      route: "/advocate/gifted-tools/leadership", 
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
      description: "Get comprehensive AI analysis of your client's complete gifted profile", 
      longDescription: "Advanced AI analysis that synthesizes data from all completed assessments to provide personalized recommendations, educational planning guidance, and comprehensive gifted profile insights.",
      icon: <Sparkles className="h-8 w-8" />,
      gradient: "from-orange-500 to-pink-600",
      bgGradient: "from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950",
      borderColor: "border-orange-200 dark:border-orange-800", 
      route: "/advocate/gifted-tools/ai-insights",
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mb-6">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Gifted & 2e Assessment Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Comprehensive assessment tools to identify and support your client's giftedness. 
            Complete individual assessments to build a complete gifted profile, then get AI-powered insights and recommendations.
          </p>
          
          {/* Progress Overview */}
          <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">
                {completedTools} of {totalAssessmentTools} assessments completed
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                ~45 min total time
              </span>
            </div>
          </div>
        </div>

        {/* Student Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Student Selection
            </CardTitle>
            <CardDescription>
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {giftedToolCards.map((tool, index) => {
            const isCompleted = !tool.requiresOtherTools && getToolCompletionStatus(tool.id);
            const canAccess = !tool.requiresOtherTools || completedTools >= totalAssessmentTools;
            
            return (
              <Card 
                key={tool.id}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  tool.isNew ? 'ring-2 ring-orange-200 dark:ring-orange-800' : ''
                } ${canAccess ? 'cursor-pointer' : 'opacity-75 cursor-not-allowed'}`}
                onClick={() => canAccess && navigate(tool.route)}
                data-testid={`card-${tool.id}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgGradient} opacity-30`} />
                
                <CardHeader className="relative pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.gradient} text-white`}>
                      {tool.icon}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {tool.isNew && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold">
                          <Sparkles className="h-3 w-3 mr-1" />
                          NEW
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                      {!canAccess && (
                        <Badge variant="outline" className="text-xs">
                          Complete other assessments first
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mb-3">
                      {tool.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="relative pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {tool.longDescription}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Estimated time:</span>
                      <span className="font-medium">{tool.estimatedTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Key Features
                    </h4>
                    <ul className="space-y-1">
                      {tool.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1 h-1 bg-current rounded-full opacity-60" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className={`flex items-center justify-between p-3 bg-gradient-to-r ${tool.bgGradient} rounded-lg border ${tool.borderColor}`}>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {isCompleted ? 'Review Assessment' : 
                       tool.requiresOtherTools ? 'Generate Insights' : 
                       'Start Assessment'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Getting Started Guide */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Lightbulb className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                How to Use These Assessment Tools
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Follow this step-by-step process to build a comprehensive gifted profile for your client
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-4 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  1
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Start with Cognitive</h4>
                <p className="text-sm text-muted-foreground">Begin with the cognitive assessment to establish baseline abilities</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  2
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Add Academic Areas</h4>
                <p className="text-sm text-muted-foreground">Complete academic assessment for subject-specific strengths</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  3
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Explore Creative & Leadership</h4>
                <p className="text-sm text-muted-foreground">Add creative and leadership assessments as relevant</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  4
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Get AI Insights</h4>
                <p className="text-sm text-muted-foreground">Generate comprehensive analysis and recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-muted-foreground">
            Part of the <strong>IEP Hero</strong> educational toolkit
          </div>
          <Link 
            to={userRole === 'advocate' ? '/advocate/tools' : '/parent/tools'}
            className="text-sm text-primary hover:underline"
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