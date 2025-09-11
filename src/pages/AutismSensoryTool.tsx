import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Volume2, 
  Building2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  Save,
  Star,
  Lightbulb,
  Eye,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/StudentSelector";

const AutismSensoryTool = () => {
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

  // Sensory accommodation categories (combining sensory + environmental)
  const sensoryCategories = [
    {
      id: "sensory-processing",
      title: "Sensory Processing Support",
      icon: <Volume2 className="h-5 w-5" />,
      description: "Help manage sensory processing challenges",
      items: [
        { 
          id: "noise-canceling", 
          title: "Noise-Canceling Headphones",
          description: "Provide noise-canceling headphones for noisy environments",
          recommended: true,
          parentTip: "Great for cafeteria, assemblies, and classroom noise",
          category: "Auditory"
        },
        { 
          id: "sensory-breaks", 
          title: "Regular Sensory Breaks",
          description: "Scheduled breaks to sensory room or quiet space every 30 minutes",
          recommended: true,
          parentTip: "Helps prevent sensory overload and meltdowns",
          category: "Regulation"
        },
        { 
          id: "fidget-tools", 
          title: "Fidget Tools & Manipulatives",
          description: "Allow use of fidget toys or stress balls during instruction",
          recommended: false,
          parentTip: "Can help with focus and self-regulation",
          category: "Tactile"
        },
        { 
          id: "weighted-blanket", 
          title: "Weighted Lap Pad",
          description: "Use of weighted lap pad for self-regulation during work time",
          recommended: false,
          parentTip: "Provides calming deep pressure input",
          category: "Proprioceptive"
        },
        { 
          id: "lighting", 
          title: "Lighting Adjustments",
          description: "Adjusted lighting or seating away from fluorescent lights",
          recommended: false,
          parentTip: "Helps children sensitive to harsh lighting",
          category: "Visual"
        },
        { 
          id: "movement-breaks", 
          title: "Movement Breaks",
          description: "Opportunities for movement and vestibular input throughout the day",
          recommended: true,
          parentTip: "Helps with attention and regulation",
          category: "Vestibular"
        }
      ]
    },
    {
      id: "environmental-modifications",
      title: "Environmental Modifications",
      icon: <Building2 className="h-5 w-5" />,
      description: "Classroom and workspace modifications",
      items: [
        { 
          id: "preferential-seating", 
          title: "Preferential Seating",
          description: "Seating near teacher, away from distractions or high-traffic areas",
          recommended: true,
          parentTip: "Helps with attention and reduces distractions",
          category: "Seating"
        },
        { 
          id: "quiet-space", 
          title: "Access to Quiet Space",
          description: "Access to quiet space for work completion and regulation",
          recommended: true,
          parentTip: "Reduces sensory overload during work time",
          category: "Environment"
        },
        { 
          id: "reduced-stimuli", 
          title: "Reduced Environmental Stimuli",
          description: "Minimize visual and auditory distractions in workspace",
          recommended: false,
          parentTip: "Creates a calm learning environment",
          category: "Environment"
        },
        { 
          id: "flexible-seating", 
          title: "Flexible Seating Options",
          description: "Access to alternative seating like standing desk, stability ball, or floor cushion",
          recommended: false,
          parentTip: "Allows for movement and position changes",
          category: "Seating"
        },
        { 
          id: "proximity-control", 
          title: "Proximity to Teacher",
          description: "Seating arrangement that allows for easy teacher support and cueing",
          recommended: true,
          parentTip: "Provides immediate support when needed",
          category: "Support"
        }
      ]
    }
  ];

  const handleAddAccommodation = (accommodationId: string) => {
    if (!addedAccommodations.includes(accommodationId)) {
      setAddedAccommodations(prev => [...prev, accommodationId]);
      const accommodation = sensoryCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === accommodationId);
      
      toast({
        title: "Added to Sensory Profile! ✨",
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

  // Save sensory profile mutation
  const saveSensoryProfile = useMutation({
    mutationFn: async (data: { student_id: string; accommodations: string[] }) => {
      const response = await apiRequest('POST', '/api/autism_accommodations/sensory', data);
      return response.json();
    },
    onSuccess: () => {
      setShowSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Sensory Profile Saved! 🎉",
        description: "Your child's sensory accommodations have been saved to their profile",
      });
    },
    onError: (error) => {
      console.error('Error saving sensory profile:', error);
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
        description: "Choose a student to save their sensory profile",
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

    saveSensoryProfile.mutate({
      student_id: selectedStudent,
      accommodations: addedAccommodations
    });
  };

  const selectedStudentName = students?.find(s => s.id === selectedStudent)?.full_name || "your child";
  const totalItems = sensoryCategories.flatMap(cat => cat.items).length;
  const completionPercentage = Math.round((addedAccommodations.length / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <Volume2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sensory Accommodations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build a comprehensive sensory support plan for {selectedStudentName}. Select accommodations that will help manage sensory processing challenges and create a supportive learning environment.
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
              Choose the student to build a sensory profile for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student for sensory accommodations"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {addedAccommodations.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Sensory Profile Progress</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {addedAccommodations.length} of {totalItems} accommodations selected
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Building a comprehensive sensory support profile
              </p>
            </CardContent>
          </Card>
        )}

        {/* Accommodation Categories */}
        <div className="space-y-8">
          {sensoryCategories.map((category) => (
            <Card key={category.id} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
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
              disabled={!selectedStudent || addedAccommodations.length === 0 || saveSensoryProfile.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              data-testid="button-save-sensory-profile"
            >
              {saveSensoryProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Sensory Profile
                </>
              )}
            </Button>
            
            <Button asChild variant="outline" data-testid="button-continue-to-communication">
              <Link to="/parent/autism-tools/communication" className="flex items-center gap-2">
                Continue to Communication
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
                Sensory Profile Saved Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your child's sensory accommodations have been saved. You can continue building their complete autism support profile with Communication Support and Behavioral Strategies tools.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AutismSensoryTool;