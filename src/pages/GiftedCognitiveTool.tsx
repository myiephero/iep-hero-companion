import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Zap,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  Save,
  Star,
  Lightbulb,
  Eye,
  CheckCircle,
  Calculator
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/StudentSelector";

const GiftedCognitiveTool = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [addedAssessments, setAddedAssessments] = useState<string[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students from API
  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return response.json();
    },
  });

  // Cognitive assessment categories
  const cognitiveCategories = [
    {
      id: "intellectual-abilities",
      title: "Intellectual Abilities",
      icon: <Brain className="h-5 w-5" />,
      description: "Assess general intellectual functioning and IQ",
      items: [
        { 
          id: "full-scale-iq", 
          title: "Full Scale IQ Assessment",
          description: "Comprehensive intellectual ability assessment (WISC-V, WAIS-IV)",
          recommended: true,
          parentTip: "Most comprehensive measure of intellectual giftedness",
          category: "IQ Testing",
          scoreRange: "130+ indicates giftedness"
        },
        { 
          id: "verbal-comprehension", 
          title: "Verbal Comprehension Index",
          description: "Language-based reasoning and acquired knowledge",
          recommended: true,
          parentTip: "Strong indicator of verbal giftedness and academic potential",
          category: "Verbal",
          scoreRange: "130+ superior range"
        },
        { 
          id: "perceptual-reasoning", 
          title: "Perceptual Reasoning Index",
          description: "Visual-spatial processing and fluid reasoning abilities",
          recommended: true,
          parentTip: "Important for mathematical and spatial giftedness",
          category: "Non-Verbal",
          scoreRange: "130+ superior range"
        },
        { 
          id: "working-memory", 
          title: "Working Memory Index",
          description: "Ability to temporarily hold and manipulate information",
          recommended: false,
          parentTip: "Critical for academic success and learning efficiency",
          category: "Processing",
          scoreRange: "130+ superior range"
        },
        { 
          id: "processing-speed", 
          title: "Processing Speed Index",
          description: "Speed of mental processing and visual-motor coordination",
          recommended: false,
          parentTip: "Can identify twice-exceptional learners if low despite high IQ",
          category: "Processing",
          scoreRange: "Watch for discrepancies"
        }
      ]
    },
    {
      id: "advanced-reasoning",
      title: "Advanced Reasoning Abilities",
      icon: <Zap className="h-5 w-5" />,
      description: "Higher-order thinking and problem-solving skills",
      items: [
        { 
          id: "abstract-reasoning", 
          title: "Abstract Reasoning",
          description: "Ability to think about concepts and relationships without concrete referents",
          recommended: true,
          parentTip: "Key indicator of advanced intellectual development",
          category: "Reasoning",
          scoreRange: "Above grade level"
        },
        { 
          id: "logical-reasoning", 
          title: "Logical Problem-Solving",
          description: "Systematic approach to complex problems and puzzles",
          recommended: true,
          parentTip: "Shows advanced analytical thinking skills",
          category: "Problem-Solving",
          scoreRange: "Complex problem solving"
        },
        { 
          id: "pattern-recognition", 
          title: "Pattern Recognition",
          description: "Identifying complex patterns and sequences",
          recommended: false,
          parentTip: "Important for mathematical and scientific thinking",
          category: "Reasoning",
          scoreRange: "Advanced pattern complexity"
        },
        { 
          id: "analogical-reasoning", 
          title: "Analogical Reasoning",
          description: "Making connections between different concepts and situations",
          recommended: false,
          parentTip: "Shows depth of understanding and transfer ability",
          category: "Reasoning",
          scoreRange: "Complex analogies"
        }
      ]
    },
    {
      id: "processing-abilities", 
      title: "Processing & Memory",
      icon: <Calculator className="h-5 w-5" />,
      description: "Cognitive processing strengths and memory abilities",
      items: [
        { 
          id: "rapid-processing", 
          title: "Rapid Information Processing",
          description: "Speed and efficiency of cognitive processing",
          recommended: false,
          parentTip: "Fast learners often show rapid processing abilities",
          category: "Speed",
          scoreRange: "Above average speed"
        },
        { 
          id: "long-term-memory", 
          title: "Long-term Memory Retrieval",
          description: "Ability to store and retrieve learned information",
          recommended: false,
          parentTip: "Excellent memory often accompanies giftedness",
          category: "Memory",
          scoreRange: "Superior recall"
        },
        { 
          id: "attention-span", 
          title: "Sustained Attention",
          description: "Ability to maintain focus on complex or interesting tasks",
          recommended: false,
          parentTip: "May show intense focus on areas of interest",
          category: "Attention",
          scoreRange: "Extended focus periods"
        }
      ]
    }
  ];

  const handleAddAssessment = (assessmentId: string) => {
    if (!addedAssessments.includes(assessmentId)) {
      setAddedAssessments(prev => [...prev, assessmentId]);
      const assessment = cognitiveCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === assessmentId);
      
      toast({
        title: "Added to Cognitive Profile! 🧠",
        description: `${assessment?.title} has been added`,
      });
    }
  };

  const handleRemoveAssessment = (assessmentId: string) => {
    setAddedAssessments(prev => prev.filter(id => id !== assessmentId));
    toast({
      title: "Removed from profile",
      description: "Assessment has been removed",
    });
  };

  // Save cognitive profile mutation
  const saveCognitiveProfile = useMutation({
    mutationFn: async (data: { student_id: string; assessments: string[] }) => {
      const response = await apiRequest('POST', '/api/gifted_assessments/cognitive', data);
      return response.json();
    },
    onSuccess: () => {
      setShowSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifted_assessments'] });
      toast({
        title: "Cognitive Profile Saved! 🎉",
        description: "Your child's cognitive assessment profile has been saved",
      });
    },
    onError: (error) => {
      console.error('Error saving cognitive profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = () => {
    if (!selectedStudent) {
      toast({
        title: "Please select a student",
        description: "Choose a student to save their cognitive profile",
        variant: "destructive",
      });
      return;
    }

    if (addedAssessments.length === 0) {
      toast({
        title: "No assessments selected",
        description: "Please add some cognitive assessments first",
        variant: "destructive",
      });
      return;
    }

    saveCognitiveProfile.mutate({
      student_id: selectedStudent,
      assessments: addedAssessments
    });
  };

  const selectedStudentName = students?.find(s => s.id === selectedStudent)?.full_name || "your child";
  const totalItems = cognitiveCategories.flatMap(cat => cat.items).length;
  const completionPercentage = Math.round((addedAssessments.length / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cognitive Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Evaluate {selectedStudentName}'s intellectual abilities, processing strengths, and cognitive patterns. Build a comprehensive cognitive profile to identify giftedness and educational needs.
          </p>
        </div>

        {/* Student Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Student Selection
            </CardTitle>
            <CardDescription>
              Choose the student to build a cognitive assessment profile for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student for cognitive assessment"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {addedAssessments.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Cognitive Profile Progress</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {addedAssessments.length} of {totalItems} assessments selected
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Building a comprehensive cognitive assessment profile
              </p>
            </CardContent>
          </Card>
        )}

        {/* Assessment Categories */}
        <div className="space-y-8">
          {cognitiveCategories.map((category) => (
            <Card key={category.id} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {category.title}
                    </h3>
                    <CardDescription className="mt-1">
                      {category.description}
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {category.items.map((item) => {
                    const isAdded = addedAssessments.includes(item.id);
                    return (
                      <Card 
                        key={item.id} 
                        className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                          isAdded 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800' 
                            : 'hover:bg-muted/30'
                        }`}
                        onClick={() => isAdded ? handleRemoveAssessment(item.id) : handleAddAssessment(item.id)}
                        data-testid={`assessment-${item.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 ${isAdded ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                {isAdded ? <CheckCircle className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {item.title}
                                  </h4>
                                  {item.recommended && (
                                    <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs">
                                      <Star className="h-3 w-3 mr-1" />
                                      Recommended
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {item.description}
                                </p>
                                <div className="space-y-1">
                                  <div className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-700 dark:text-amber-400 italic">
                                      <strong>Parent Tip:</strong> {item.parentTip}
                                    </p>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                      <strong>Score Range:</strong> {item.scoreRange}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-6 border-t">
          <Button asChild variant="ghost" data-testid="button-back-to-gifted-hub">
            <Link to="/parent/gifted-tools" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Gifted Tools
            </Link>
          </Button>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleSaveProfile}
              disabled={!selectedStudent || addedAssessments.length === 0 || saveCognitiveProfile.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              data-testid="button-save-cognitive-profile"
            >
              {saveCognitiveProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Cognitive Profile
                </>
              )}
            </Button>
            
            <Button asChild variant="outline" data-testid="button-continue-to-academic">
              <Link to="/parent/gifted-tools/academic" className="flex items-center gap-2">
                Continue to Academic
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {showSaveSuccess && (
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Cognitive Profile Saved Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your child's cognitive assessment profile has been saved. Continue building their complete gifted profile with Academic, Creative, and Leadership assessments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GiftedCognitiveTool;