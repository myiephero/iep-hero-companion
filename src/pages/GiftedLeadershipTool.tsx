import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Heart,
  Crown,
  Target,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  Save,
  Star,
  Lightbulb,
  Eye,
  CheckCircle,
  MessageCircle,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/StudentSelector";

const GiftedLeadershipTool = () => {
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

  // Leadership assessment categories
  const leadershipCategories = [
    {
      id: "social-skills",
      title: "Social Skills & Interpersonal Abilities",
      icon: <Users className="h-5 w-5" />,
      description: "Assess social intelligence and interpersonal relationship skills",
      items: [
        { 
          id: "social-intelligence", 
          title: "Social Intelligence",
          description: "Understanding social situations and reading social cues effectively",
          recommended: true,
          parentTip: "Child understands social dynamics and navigates relationships well",
          category: "Social",
          scoreRange: "Advanced social awareness"
        },
        { 
          id: "communication-skills", 
          title: "Advanced Communication",
          description: "Exceptional verbal and non-verbal communication abilities",
          recommended: true,
          parentTip: "Communicates ideas clearly and persuasively for their age",
          category: "Communication",
          scoreRange: "Superior communication"
        },
        { 
          id: "empathy-emotional-intelligence", 
          title: "Empathy & Emotional Intelligence",
          description: "Understanding and responding to others' emotions appropriately",
          recommended: true,
          parentTip: "Shows deep understanding of others' feelings and perspectives",
          category: "Emotional",
          scoreRange: "High emotional awareness"
        },
        { 
          id: "conflict-resolution", 
          title: "Conflict Resolution",
          description: "Ability to mediate disputes and find win-win solutions",
          recommended: false,
          parentTip: "Helps resolve conflicts between friends or siblings",
          category: "Problem-Solving",
          scoreRange: "Effective mediation"
        }
      ]
    },
    {
      id: "leadership-qualities",
      title: "Leadership & Influence",
      icon: <Crown className="h-5 w-5" />,
      description: "Natural leadership abilities and influence on others",
      items: [
        { 
          id: "natural-leadership", 
          title: "Natural Leadership",
          description: "Others naturally look to them for guidance and direction",
          recommended: true,
          parentTip: "Child naturally takes charge in group situations",
          category: "Leadership",
          scoreRange: "Recognized leader"
        },
        { 
          id: "influence-persuasion", 
          title: "Positive Influence",
          description: "Ability to positively influence others and inspire action",
          recommended: false,
          parentTip: "Can motivate others to participate in positive activities",
          category: "Influence",
          scoreRange: "Positive peer influence"
        },
        { 
          id: "decision-making", 
          title: "Decision-Making Skills",
          description: "Makes thoughtful decisions considering multiple perspectives",
          recommended: false,
          parentTip: "Considers consequences and others' needs when making decisions",
          category: "Decision-Making",
          scoreRange: "Thoughtful decisions"
        },
        { 
          id: "responsibility", 
          title: "Responsibility & Reliability",
          description: "Takes initiative and follows through on commitments",
          recommended: false,
          parentTip: "Others trust them with important tasks and responsibilities",
          category: "Responsibility",
          scoreRange: "High reliability"
        }
      ]
    },
    {
      id: "emotional-social-development", 
      title: "Emotional & Social Development",
      icon: <Heart className="h-5 w-5" />,
      description: "Advanced emotional and social development indicators",
      items: [
        { 
          id: "moral-reasoning", 
          title: "Advanced Moral Reasoning",
          description: "Complex understanding of right and wrong, justice, and fairness",
          recommended: false,
          parentTip: "Thinks deeply about ethical issues and fairness",
          category: "Moral",
          scoreRange: "Complex moral thinking"
        },
        { 
          id: "social-justice", 
          title: "Social Justice Awareness",
          description: "Concern for fairness, equality, and helping others",
          recommended: false,
          parentTip: "Shows concern for inequity and wants to help those in need",
          category: "Justice",
          scoreRange: "Strong justice orientation"
        },
        { 
          id: "perfectionism", 
          title: "Perfectionism Management",
          description: "Healthy vs. unhealthy perfectionist tendencies",
          recommended: false,
          parentTip: "May have high standards but needs support managing expectations",
          category: "Perfectionism",
          scoreRange: "Balanced perfectionism"
        },
        { 
          id: "intensity", 
          title: "Emotional Intensity",
          description: "Strong emotions and passionate responses to experiences",
          recommended: false,
          parentTip: "Feels things deeply and may need help managing intense emotions",
          category: "Intensity",
          scoreRange: "Intense emotional responses"
        }
      ]
    },
    {
      id: "twice-exceptional",
      title: "Twice-Exceptional Considerations",
      icon: <Target className="h-5 w-5" />,
      description: "Assessment of potential learning differences alongside giftedness",
      items: [
        { 
          id: "attention-focus", 
          title: "Attention & Focus Patterns",
          description: "Attention strengths and challenges in different contexts",
          recommended: false,
          parentTip: "May hyperfocus on interests but struggle with less preferred tasks",
          category: "Attention",
          scoreRange: "Variable attention patterns"
        },
        { 
          id: "sensory-processing", 
          title: "Sensory Processing",
          description: "Heightened sensitivities to sensory input",
          recommended: false,
          parentTip: "May be more sensitive to sounds, textures, or visual stimuli",
          category: "Sensory",
          scoreRange: "Sensory sensitivities"
        },
        { 
          id: "executive-function", 
          title: "Executive Function Skills",
          description: "Organization, planning, and self-regulation abilities",
          recommended: false,
          parentTip: "High ability but may struggle with organization or time management",
          category: "Executive",
          scoreRange: "Variable executive skills"
        },
        { 
          id: "social-challenges", 
          title: "Social Challenges",
          description: "Potential social difficulties despite high ability",
          recommended: false,
          parentTip: "May struggle socially despite being intellectually advanced",
          category: "Social",
          scoreRange: "Social skill gaps"
        }
      ]
    }
  ];

  const handleAddAssessment = (assessmentId: string) => {
    if (!addedAssessments.includes(assessmentId)) {
      setAddedAssessments(prev => [...prev, assessmentId]);
      const assessment = leadershipCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === assessmentId);
      
      toast({
        title: "Added to Leadership Profile! 👑",
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

  // Save leadership profile mutation
  const saveLeadershipProfile = useMutation({
    mutationFn: async (data: { student_id: string; assessments: string[] }) => {
      const response = await apiRequest('POST', '/api/gifted_assessments/leadership', data);
      return response.json();
    },
    onSuccess: () => {
      setShowSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifted_assessments'] });
      toast({
        title: "Leadership Profile Saved! 🎉",
        description: "Your child's leadership assessment profile has been saved",
      });
    },
    onError: (error) => {
      console.error('Error saving leadership profile:', error);
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
        description: "Choose a student to save their leadership profile",
        variant: "destructive",
      });
      return;
    }

    if (addedAssessments.length === 0) {
      toast({
        title: "No assessments selected",
        description: "Please add some leadership assessments first",
        variant: "destructive",
      });
      return;
    }

    saveLeadershipProfile.mutate({
      student_id: selectedStudent,
      assessments: addedAssessments
    });
  };

  const selectedStudentName = students?.find(s => s.id === selectedStudent)?.full_name || "your child";
  const totalItems = leadershipCategories.flatMap(cat => cat.items).length;
  const completionPercentage = Math.round((addedAssessments.length / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Leadership Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Evaluate {selectedStudentName}'s leadership potential, social-emotional development, and twice-exceptional characteristics. Build a comprehensive profile to support their social and leadership growth.
          </p>
        </div>

        {/* Student Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Student Selection
            </CardTitle>
            <CardDescription>
              Choose the student to build a leadership assessment profile for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student for leadership assessment"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {addedAssessments.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Leadership Profile Progress</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {addedAssessments.length} of {totalItems} assessments selected
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Building a comprehensive leadership assessment profile
              </p>
            </CardContent>
          </Card>
        )}

        {/* Assessment Categories */}
        <div className="space-y-8">
          {leadershipCategories.map((category) => (
            <Card key={category.id} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
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
                                    <Award className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-green-700 dark:text-green-400">
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
              disabled={!selectedStudent || addedAssessments.length === 0 || saveLeadershipProfile.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              data-testid="button-save-leadership-profile"
            >
              {saveLeadershipProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Leadership Profile
                </>
              )}
            </Button>
            
            <Button asChild variant="outline" data-testid="button-continue-to-ai-insights">
              <Link to="/parent/gifted-tools/ai-insights" className="flex items-center gap-2">
                Continue to AI Insights
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
                Leadership Profile Saved Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your child's leadership assessment profile has been saved. You can now generate comprehensive AI insights based on all completed assessments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GiftedLeadershipTool;