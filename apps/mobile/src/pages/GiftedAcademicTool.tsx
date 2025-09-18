import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Calculator,
  Atom,
  Globe,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  Save,
  Star,
  Lightbulb,
  Eye,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/StudentSelector";

const GiftedAcademicTool = () => {
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

  // Academic assessment categories
  const academicCategories = [
    {
      id: "mathematics",
      title: "Mathematical Abilities",
      icon: <Calculator className="h-5 w-5" />,
      description: "Assess mathematical reasoning and computational skills",
      items: [
        { 
          id: "mathematical-reasoning", 
          title: "Mathematical Reasoning",
          description: "Advanced problem-solving and mathematical thinking abilities",
          recommended: true,
          parentTip: "Look for ability to understand complex mathematical concepts quickly",
          category: "Reasoning",
          scoreRange: "2+ grade levels above"
        },
        { 
          id: "numerical-operations", 
          title: "Numerical Operations",
          description: "Computational fluency and accuracy in mathematical operations",
          recommended: true,
          parentTip: "Fast, accurate computation often indicates mathematical giftedness",
          category: "Computation",
          scoreRange: "Superior accuracy & speed"
        },
        { 
          id: "algebra-readiness", 
          title: "Algebraic Thinking",
          description: "Early understanding of algebraic concepts and patterns",
          recommended: false,
          parentTip: "Can handle abstract mathematical thinking before peers",
          category: "Advanced Math",
          scoreRange: "Above grade expectations"
        },
        { 
          id: "geometry-spatial", 
          title: "Geometric & Spatial Reasoning",
          description: "Visualization and spatial mathematical concepts",
          recommended: false,
          parentTip: "Strong spatial skills often predict STEM success",
          category: "Spatial",
          scoreRange: "Advanced spatial concepts"
        }
      ]
    },
    {
      id: "language-arts",
      title: "Language Arts & Reading",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Advanced reading, writing, and language abilities",
      items: [
        { 
          id: "reading-comprehension", 
          title: "Advanced Reading Comprehension",
          description: "Understanding of complex texts and advanced vocabulary",
          recommended: true,
          parentTip: "Reads significantly above grade level with deep understanding",
          category: "Reading",
          scoreRange: "2+ grade levels above"
        },
        { 
          id: "vocabulary", 
          title: "Advanced Vocabulary",
          description: "Exceptional vocabulary knowledge and word usage",
          recommended: true,
          parentTip: "Uses sophisticated vocabulary in speech and writing",
          category: "Language",
          scoreRange: "Superior vocabulary range"
        },
        { 
          id: "writing-ability", 
          title: "Advanced Writing Skills",
          description: "Sophisticated writing with complex ideas and structure",
          recommended: false,
          parentTip: "Writes with depth, creativity, and advanced organization",
          category: "Writing",
          scoreRange: "Above grade level complexity"
        },
        { 
          id: "literary-analysis", 
          title: "Literary Analysis",
          description: "Deep analysis and interpretation of literature",
          recommended: false,
          parentTip: "Makes connections and insights beyond typical for age",
          category: "Analysis",
          scoreRange: "Advanced interpretation"
        }
      ]
    },
    {
      id: "sciences", 
      title: "Scientific Reasoning",
      icon: <Atom className="h-5 w-5" />,
      description: "Scientific thinking and inquiry abilities",
      items: [
        { 
          id: "scientific-inquiry", 
          title: "Scientific Inquiry Skills",
          description: "Ability to form hypotheses, design experiments, analyze data",
          recommended: true,
          parentTip: "Shows natural curiosity and systematic thinking about science",
          category: "Inquiry",
          scoreRange: "Advanced questioning"
        },
        { 
          id: "logical-reasoning-science", 
          title: "Scientific Reasoning",
          description: "Logical thinking applied to scientific problems",
          recommended: false,
          parentTip: "Can understand cause and effect relationships in science",
          category: "Reasoning",
          scoreRange: "Complex reasoning"
        },
        { 
          id: "stem-concepts", 
          title: "STEM Concept Mastery",
          description: "Advanced understanding of science, technology, engineering concepts",
          recommended: false,
          parentTip: "Grasps advanced STEM concepts before formal instruction",
          category: "STEM",
          scoreRange: "Above grade expectations"
        }
      ]
    },
    {
      id: "social-studies",
      title: "Social Studies & Critical Thinking",
      icon: <Globe className="h-5 w-5" />,
      description: "Advanced understanding of social concepts and critical analysis",
      items: [
        { 
          id: "historical-thinking", 
          title: "Historical Analysis",
          description: "Understanding of historical patterns, cause and effect",
          recommended: false,
          parentTip: "Can analyze historical events and make connections",
          category: "History",
          scoreRange: "Advanced analysis"
        },
        { 
          id: "critical-thinking", 
          title: "Critical Thinking",
          description: "Ability to analyze arguments, evaluate evidence, make judgments",
          recommended: true,
          parentTip: "Questions assumptions and thinks deeply about issues",
          category: "Reasoning",
          scoreRange: "Superior analysis"
        },
        { 
          id: "research-skills", 
          title: "Advanced Research Skills",
          description: "Ability to conduct independent research and synthesize information",
          recommended: false,
          parentTip: "Can independently explore topics in depth",
          category: "Research",
          scoreRange: "Independent research"
        }
      ]
    }
  ];

  const handleAddAssessment = (assessmentId: string) => {
    if (!addedAssessments.includes(assessmentId)) {
      setAddedAssessments(prev => [...prev, assessmentId]);
      const assessment = academicCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === assessmentId);
      
      toast({
        title: "Added to Academic Profile! 📚",
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

  // Save academic profile mutation
  const saveAcademicProfile = useMutation({
    mutationFn: async (data: { student_id: string; assessments: string[] }) => {
      const response = await apiRequest('POST', '/api/gifted_assessments/academic', data);
      return response.json();
    },
    onSuccess: () => {
      setShowSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifted_assessments'] });
      toast({
        title: "Academic Profile Saved! 🎉",
        description: "Your child's academic assessment profile has been saved",
      });
    },
    onError: (error) => {
      console.error('Error saving academic profile:', error);
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
        description: "Choose a student to save their academic profile",
        variant: "destructive",
      });
      return;
    }

    if (addedAssessments.length === 0) {
      toast({
        title: "No assessments selected",
        description: "Please add some academic assessments first",
        variant: "destructive",
      });
      return;
    }

    saveAcademicProfile.mutate({
      student_id: selectedStudent,
      assessments: addedAssessments
    });
  };

  const selectedStudentName = students?.find(s => s.id === selectedStudent)?.full_name || "your child";
  const totalItems = academicCategories.flatMap(cat => cat.items).length;
  const completionPercentage = Math.round((addedAssessments.length / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mb-4">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Academic Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Evaluate {selectedStudentName}'s academic abilities across core subject areas. Identify strengths, acceleration needs, and areas of exceptional academic talent.
          </p>
        </div>

        {/* Student Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Student Selection
            </CardTitle>
            <CardDescription>
              Choose the student to build an academic assessment profile for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student for academic assessment"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {addedAssessments.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Academic Profile Progress</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {addedAssessments.length} of {totalItems} assessments selected
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Building a comprehensive academic assessment profile
              </p>
            </CardContent>
          </Card>
        )}

        {/* Assessment Categories */}
        <div className="space-y-8">
          {academicCategories.map((category) => (
            <Card key={category.id} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
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
                                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                      <strong>Expected Level:</strong> {item.scoreRange}
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
              disabled={!selectedStudent || addedAssessments.length === 0 || saveAcademicProfile.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              data-testid="button-save-academic-profile"
            >
              {saveAcademicProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Academic Profile
                </>
              )}
            </Button>
            
            <Button asChild variant="outline" data-testid="button-continue-to-creative">
              <Link to="/parent/gifted-tools/creative" className="flex items-center gap-2">
                Continue to Creative
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
                Academic Profile Saved Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your child's academic assessment profile has been saved. Continue building their complete gifted profile with Creative and Leadership assessments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GiftedAcademicTool;