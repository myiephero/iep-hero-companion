import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Palette, 
  Music,
  Lightbulb,
  Zap,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  Save,
  Star,
  Eye,
  CheckCircle,
  Sparkles,
  Brush
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/StudentSelector";

const GiftedCreativeTool = () => {
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

  // Creative assessment categories
  const creativeCategories = [
    {
      id: "divergent-thinking",
      title: "Divergent & Creative Thinking",
      icon: <Lightbulb className="h-5 w-5" />,
      description: "Assess creative problem-solving and innovative thinking abilities",
      items: [
        { 
          id: "creative-problem-solving", 
          title: "Creative Problem-Solving",
          description: "Ability to generate multiple unique solutions to problems",
          recommended: true,
          parentTip: "Child finds unusual and effective solutions to everyday problems",
          category: "Problem-Solving",
          scoreRange: "Multiple unique solutions"
        },
        { 
          id: "divergent-thinking", 
          title: "Divergent Thinking",
          description: "Generating many different ideas and approaches to a single problem",
          recommended: true,
          parentTip: "Comes up with many different ideas quickly and creatively",
          category: "Ideation",
          scoreRange: "High idea fluency"
        },
        { 
          id: "originality", 
          title: "Originality & Innovation",
          description: "Creating truly original and innovative ideas or products",
          recommended: true,
          parentTip: "Ideas are unique and show genuine creativity",
          category: "Innovation",
          scoreRange: "Highly original responses"
        },
        { 
          id: "flexibility", 
          title: "Cognitive Flexibility",
          description: "Ability to switch between different approaches and perspectives",
          recommended: false,
          parentTip: "Adapts thinking easily and sees problems from multiple angles",
          category: "Flexibility",
          scoreRange: "Multiple approaches"
        }
      ]
    },
    {
      id: "artistic-abilities",
      title: "Artistic & Visual Creative Abilities",
      icon: <Palette className="h-5 w-5" />,
      description: "Assess visual arts, design, and aesthetic sensibilities",
      items: [
        { 
          id: "visual-arts", 
          title: "Visual Arts Talent",
          description: "Exceptional ability in drawing, painting, sculpture, or design",
          recommended: false,
          parentTip: "Shows advanced artistic skills beyond their age level",
          category: "Visual Arts",
          scoreRange: "Advanced technique"
        },
        { 
          id: "aesthetic-sensitivity", 
          title: "Aesthetic Sensitivity",
          description: "Strong appreciation for beauty, design, and artistic elements",
          recommended: false,
          parentTip: "Notices and appreciates beautiful things others might miss",
          category: "Aesthetics",
          scoreRange: "High aesthetic awareness"
        },
        { 
          id: "design-thinking", 
          title: "Design & Spatial Creativity",
          description: "Creative use of space, form, and visual elements",
          recommended: false,
          parentTip: "Creates visually appealing and well-designed projects",
          category: "Design",
          scoreRange: "Creative spatial solutions"
        },
        { 
          id: "artistic-expression", 
          title: "Artistic Expression",
          description: "Ability to communicate ideas and emotions through art",
          recommended: false,
          parentTip: "Art conveys deep meaning and personal expression",
          category: "Expression",
          scoreRange: "Meaningful expression"
        }
      ]
    },
    {
      id: "performing-arts", 
      title: "Performing Arts & Creative Expression",
      icon: <Music className="h-5 w-5" />,
      description: "Assess musical, dramatic, and performance creative abilities",
      items: [
        { 
          id: "musical-creativity", 
          title: "Musical Composition & Creativity",
          description: "Creating original music or showing exceptional musical expression",
          recommended: false,
          parentTip: "Composes original songs or shows exceptional musical interpretation",
          category: "Music",
          scoreRange: "Original compositions"
        },
        { 
          id: "dramatic-arts", 
          title: "Dramatic & Theatrical Ability",
          description: "Creative expression through drama, storytelling, or performance",
          recommended: false,
          parentTip: "Natural performer with strong creative dramatic abilities",
          category: "Drama",
          scoreRange: "Creative performance"
        },
        { 
          id: "creative-writing", 
          title: "Creative Writing",
          description: "Original storytelling, poetry, or creative written expression",
          recommended: false,
          parentTip: "Writes creative stories with unique plots and characters",
          category: "Writing",
          scoreRange: "Original creative work"
        },
        { 
          id: "movement-dance", 
          title: "Creative Movement & Dance",
          description: "Innovative movement, dance, or physical creative expression",
          recommended: false,
          parentTip: "Creates original dances or shows exceptional movement creativity",
          category: "Movement",
          scoreRange: "Creative choreography"
        }
      ]
    },
    {
      id: "innovative-thinking",
      title: "Innovation & Future Thinking",
      icon: <Zap className="h-5 w-5" />,
      description: "Advanced innovative thinking and future-oriented creativity",
      items: [
        { 
          id: "invention", 
          title: "Inventive Thinking",
          description: "Creating new devices, systems, or solutions to problems",
          recommended: false,
          parentTip: "Invents new games, gadgets, or solutions to problems",
          category: "Invention",
          scoreRange: "Novel inventions"
        },
        { 
          id: "future-thinking", 
          title: "Future-Oriented Thinking",
          description: "Imagining and planning for future possibilities and scenarios",
          recommended: false,
          parentTip: "Thinks about and plans for future possibilities creatively",
          category: "Future",
          scoreRange: "Creative future scenarios"
        },
        { 
          id: "entrepreneurial", 
          title: "Entrepreneurial Creativity",
          description: "Creating new business ideas, services, or entrepreneurial solutions",
          recommended: false,
          parentTip: "Comes up with business ideas or ways to solve problems for profit",
          category: "Business",
          scoreRange: "Innovative business ideas"
        }
      ]
    }
  ];

  const handleAddAssessment = (assessmentId: string) => {
    if (!addedAssessments.includes(assessmentId)) {
      setAddedAssessments(prev => [...prev, assessmentId]);
      const assessment = creativeCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === assessmentId);
      
      toast({
        title: "Added to Creative Profile! 🎨",
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

  // Save creative profile mutation
  const saveCreativeProfile = useMutation({
    mutationFn: async (data: { student_id: string; assessments: string[] }) => {
      const response = await apiRequest('POST', '/api/gifted_assessments/creative', data);
      return response.json();
    },
    onSuccess: () => {
      setShowSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifted_assessments'] });
      toast({
        title: "Creative Profile Saved! 🎉",
        description: "Your child's creative assessment profile has been saved",
      });
    },
    onError: (error) => {
      console.error('Error saving creative profile:', error);
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
        description: "Choose a student to save their creative profile",
        variant: "destructive",
      });
      return;
    }

    if (addedAssessments.length === 0) {
      toast({
        title: "No assessments selected",
        description: "Please add some creative assessments first",
        variant: "destructive",
      });
      return;
    }

    saveCreativeProfile.mutate({
      student_id: selectedStudent,
      assessments: addedAssessments
    });
  };

  const selectedStudentName = students?.find(s => s.id === selectedStudent)?.full_name || "your child";
  const totalItems = creativeCategories.flatMap(cat => cat.items).length;
  const completionPercentage = Math.round((addedAssessments.length / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full mb-4">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Creative Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore {selectedStudentName}'s creative thinking abilities, artistic talents, and innovative potential. Build a comprehensive creative profile to support artistic and creative development.
          </p>
        </div>

        {/* Student Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-pink-600" />
              Student Selection
            </CardTitle>
            <CardDescription>
              Choose the student to build a creative assessment profile for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student for creative assessment"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {addedAssessments.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-pink-200 dark:border-pink-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Creative Profile Progress</span>
                <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                  {addedAssessments.length} of {totalItems} assessments selected
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Building a comprehensive creative assessment profile
              </p>
            </CardContent>
          </Card>
        )}

        {/* Assessment Categories */}
        <div className="space-y-8">
          {creativeCategories.map((category) => (
            <Card key={category.id} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
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
                                    <Sparkles className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-pink-700 dark:text-pink-400">
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
              disabled={!selectedStudent || addedAssessments.length === 0 || saveCreativeProfile.isPending}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              data-testid="button-save-creative-profile"
            >
              {saveCreativeProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Creative Profile
                </>
              )}
            </Button>
            
            <Button asChild variant="outline" data-testid="button-continue-to-leadership">
              <Link to="/parent/gifted-tools/leadership" className="flex items-center gap-2">
                Continue to Leadership
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
                Creative Profile Saved Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your child's creative assessment profile has been saved. Continue building their complete gifted profile with the Leadership assessment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GiftedCreativeTool;