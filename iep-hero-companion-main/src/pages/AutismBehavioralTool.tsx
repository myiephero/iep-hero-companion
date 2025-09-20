import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle,
  Brain,
  Target,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  Save,
  Star,
  Lightbulb,
  Eye,
  Heart,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/StudentSelector";

const AutismBehavioralTool = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [addedAccommodations, setAddedAccommodations] = useState<string[]>([]);
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

  // Behavioral accommodation categories (combining behavioral + academic)
  const behavioralCategories = [
    {
      id: "behavioral-supports",
      title: "Behavioral Support Strategies",
      icon: <CheckCircle className="h-5 w-5" />,
      description: "Positive behavior support and self-regulation techniques",
      items: [
        { 
          id: "behavior-plan", 
          title: "Positive Behavior Support Plan",
          description: "Individualized positive behavior support plan with teaching strategies",
          recommended: true,
          parentTip: "Focuses on teaching replacement behaviors rather than just stopping problem behaviors",
          category: "Plan"
        },
        { 
          id: "break-cards", 
          title: "Break Request Cards",
          description: "Visual cards to request breaks when feeling overwhelmed",
          recommended: true,
          parentTip: "Gives your child a way to communicate needs before reaching a breaking point",
          category: "Communication"
        },
        { 
          id: "calm-down-space", 
          title: "Access to Calm Down Space",
          description: "Designated calm down space when needing self-regulation time",
          recommended: false,
          parentTip: "Provides a safe space for self-regulation without punishment",
          category: "Environment"
        },
        { 
          id: "self-monitoring", 
          title: "Self-Monitoring Tools",
          description: "Tools to help student monitor their own behavior and emotions",
          recommended: false,
          parentTip: "Builds self-awareness and independence in behavior management",
          category: "Self-Regulation"
        },
        { 
          id: "routine-supports", 
          title: "Routine and Transition Supports",
          description: "Structured supports for transitions and routine changes",
          recommended: true,
          parentTip: "Helps reduce anxiety around changes in schedule or routine",
          category: "Transitions"
        }
      ]
    },
    {
      id: "academic-supports",
      title: "Academic & Learning Supports",
      icon: <Brain className="h-5 w-5" />,
      description: "Academic accommodations to support learning success",
      items: [
        { 
          id: "extended-time", 
          title: "Extended Time",
          description: "Extended time for assignments and tests (typically 1.5x or double time)",
          recommended: true,
          parentTip: "Accounts for processing differences and reduces anxiety around time pressure",
          category: "Time"
        },
        { 
          id: "chunking", 
          title: "Task Chunking",
          description: "Breaking assignments into smaller, manageable chunks with breaks",
          recommended: true,
          parentTip: "Prevents overwhelm and builds success through manageable steps",
          category: "Task Modification"
        },
        { 
          id: "visual-supports", 
          title: "Visual Learning Supports",
          description: "Visual supports and graphic organizers for learning concepts",
          recommended: true,
          parentTip: "Helps with organization, understanding, and memory of information",
          category: "Visual"
        },
        { 
          id: "repetition", 
          title: "Repeated Instructions",
          description: "Repeated instructions and clarification as needed",
          recommended: false,
          parentTip: "Ensures understanding before starting tasks and reduces anxiety",
          category: "Clarification"
        },
        { 
          id: "reduced-assignments", 
          title: "Modified Assignment Length",
          description: "Reduced length or modified assignments while maintaining learning objectives",
          recommended: false,
          parentTip: "Focuses on quality over quantity while meeting learning goals",
          category: "Modification"
        },
        { 
          id: "alternative-assessments", 
          title: "Alternative Assessment Methods",
          description: "Alternative ways to demonstrate knowledge (oral, project-based, etc.)",
          recommended: false,
          parentTip: "Allows students to show what they know in their strongest modality",
          category: "Assessment"
        }
      ]
    }
  ];

  const handleAddAccommodation = (accommodationId: string) => {
    if (!addedAccommodations.includes(accommodationId)) {
      setAddedAccommodations(prev => [...prev, accommodationId]);
      const accommodation = behavioralCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === accommodationId);
      
      toast({
        title: "Added to Behavioral Profile! 🎯",
        description: `${accommodation?.title} has been added`,
      });
    }
  };

  const handleRemoveAccommodation = (accommodationId: string) => {
    setAddedAccommodations(prev => prev.filter(id => id !== accommodationId));
    toast({
      title: "Removed from profile",
      description: "Accommodation has been removed",
    });
  };

  // Save behavioral profile mutation
  const saveBehavioralProfile = useMutation({
    mutationFn: async (data: { student_id: string; accommodations: string[] }) => {
      const response = await apiRequest('POST', '/api/autism_accommodations/behavioral', data);
      return response.json();
    },
    onSuccess: () => {
      setShowSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Behavioral Profile Saved! 🎉",
        description: "Your child's behavioral strategies have been saved to their profile",
      });
    },
    onError: (error) => {
      console.error('Error saving behavioral profile:', error);
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
        description: "Choose a student to save their behavioral profile",
        variant: "destructive",
      });
      return;
    }

    if (addedAccommodations.length === 0) {
      toast({
        title: "No accommodations selected",
        description: "Please add some accommodations first",
        variant: "destructive",
      });
      return;
    }

    saveBehavioralProfile.mutate({
      student_id: selectedStudent,
      accommodations: addedAccommodations
    });
  };

  const selectedStudentName = students?.find(s => s.id === selectedStudent)?.full_name || "your child";
  const totalItems = behavioralCategories.flatMap(cat => cat.items).length;
  const completionPercentage = Math.round((addedAccommodations.length / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
            <Target className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Behavioral Strategies
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build behavioral support and academic accommodation strategies for {selectedStudentName}. Select evidence-based approaches that promote positive behavior and academic success.
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
              Choose the student to build a behavioral profile for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student for behavioral strategies"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {addedAccommodations.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Behavioral Profile Progress</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {addedAccommodations.length} of {totalItems} strategies selected
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Building a comprehensive behavioral support profile
              </p>
            </CardContent>
          </Card>
        )}

        {/* Accommodation Categories */}
        <div className="space-y-8">
          {behavioralCategories.map((category) => (
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
                    const isAdded = addedAccommodations.includes(item.id);
                    return (
                      <Card 
                        key={item.id} 
                        className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                          isAdded 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800' 
                            : 'hover:bg-muted/30'
                        }`}
                        onClick={() => isAdded ? handleRemoveAccommodation(item.id) : handleAddAccommodation(item.id)}
                        data-testid={`accommodation-${item.id}`}
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
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-amber-700 dark:text-amber-400 italic">
                                    <strong>Parent Tip:</strong> {item.parentTip}
                                  </p>
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
          <Button asChild variant="ghost" data-testid="button-back-to-autism-hub">
            <Link to="/parent/autism-tools" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Autism Tools
            </Link>
          </Button>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleSaveProfile}
              disabled={!selectedStudent || addedAccommodations.length === 0 || saveBehavioralProfile.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              data-testid="button-save-behavioral-profile"
            >
              {saveBehavioralProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Behavioral Profile
                </>
              )}
            </Button>
            
            <Button asChild variant="outline" data-testid="button-continue-to-ai-insights">
              <Link to="/parent/autism-tools/ai-insights" className="flex items-center gap-2">
                Get AI Insights
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
                Behavioral Profile Saved Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your child's behavioral strategies have been saved. Complete your autism support profile by getting AI-powered insights that analyze all three areas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AutismBehavioralTool;