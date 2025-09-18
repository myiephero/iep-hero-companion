import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  Save,
  Star,
  Lightbulb,
  Eye,
  CheckCircle,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/StudentSelector";

const AutismCommunicationTool = () => {
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

  // Communication accommodation categories (combining communication + social)
  const communicationCategories = [
    {
      id: "communication-supports",
      title: "Communication Supports",
      icon: <MessageCircle className="h-5 w-5" />,
      description: "Tools and strategies to support communication",
      items: [
        { 
          id: "visual-schedules", 
          title: "Visual Schedules & Social Stories",
          description: "Visual schedules and social stories for transitions and daily routines",
          recommended: true,
          parentTip: "Reduces anxiety about schedule changes and new situations",
          category: "Visual Support"
        },
        { 
          id: "communication-device", 
          title: "AAC Device or Picture Cards",
          description: "Access to Augmentative and Alternative Communication device or picture cards",
          recommended: false,
          parentTip: "Essential for non-speaking children or those with limited verbal communication",
          category: "AAC"
        },
        { 
          id: "social-scripts", 
          title: "Social Scripts",
          description: "Pre-written social scripts for common situations and interactions",
          recommended: false,
          parentTip: "Helps with greetings, requesting help, and social interactions",
          category: "Scripts"
        },
        { 
          id: "choice-boards", 
          title: "Choice Boards",
          description: "Visual choice boards to support decision-making and expressing preferences",
          recommended: true,
          parentTip: "Gives students a way to communicate choices when overwhelmed",
          category: "Visual Support"
        },
        { 
          id: "communication-breaks", 
          title: "Communication Processing Time",
          description: "Extended wait time for processing and responding to questions",
          recommended: true,
          parentTip: "Allows time to process language and formulate responses",
          category: "Processing"
        }
      ]
    },
    {
      id: "social-supports",
      title: "Social Interaction Supports",
      icon: <Users className="h-5 w-5" />,
      description: "Building meaningful social connections and skills",
      items: [
        { 
          id: "social-skills-group", 
          title: "Social Skills Group",
          description: "Participation in structured social skills group sessions",
          recommended: true,
          parentTip: "Teaches social skills in small, safe groups with explicit instruction",
          category: "Group Support"
        },
        { 
          id: "peer-buddy", 
          title: "Peer Buddy System",
          description: "Assignment of trained peer buddy for social support and modeling",
          recommended: true,
          parentTip: "Provides natural social modeling and friendship opportunities",
          category: "Peer Support"
        },
        { 
          id: "lunch-club", 
          title: "Structured Lunch Club",
          description: "Structured lunch club for social interaction practice",
          recommended: false,
          parentTip: "Makes lunchtime less overwhelming and more socially engaging",
          category: "Group Support"
        },
        { 
          id: "peer-support", 
          title: "Structured Peer Interactions",
          description: "Organized opportunities for peer interaction with support",
          recommended: true,
          parentTip: "Builds social skills in supported, structured settings",
          category: "Peer Support"
        },
        { 
          id: "social-prompting", 
          title: "Social Cuing and Prompting",
          description: "Discrete prompts and cues to support social interactions",
          recommended: false,
          parentTip: "Helps initiate and maintain appropriate social behaviors",
          category: "Support"
        },
        { 
          id: "friendship-facilitation", 
          title: "Friendship Facilitation",
          description: "Adult support in developing and maintaining friendships",
          recommended: false,
          parentTip: "Helps navigate complex social relationships",
          category: "Relationship Support"
        }
      ]
    }
  ];

  const handleAddAccommodation = (accommodationId: string) => {
    if (!addedAccommodations.includes(accommodationId)) {
      setAddedAccommodations(prev => [...prev, accommodationId]);
      const accommodation = communicationCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === accommodationId);
      
      toast({
        title: "Added to Communication Profile! 💬",
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

  // Save communication profile mutation
  const saveCommunicationProfile = useMutation({
    mutationFn: async (data: { student_id: string; accommodations: string[] }) => {
      const response = await apiRequest('POST', '/api/autism_accommodations/communication', data);
      return response.json();
    },
    onSuccess: () => {
      setShowSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Communication Profile Saved! 🎉",
        description: "Your child's communication accommodations have been saved to their profile",
      });
    },
    onError: (error) => {
      console.error('Error saving communication profile:', error);
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
        description: "Choose a student to save their communication profile",
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

    saveCommunicationProfile.mutate({
      student_id: selectedStudent,
      accommodations: addedAccommodations
    });
  };

  const selectedStudentName = students?.find(s => s.id === selectedStudent)?.full_name || "your child";
  const totalItems = communicationCategories.flatMap(cat => cat.items).length;
  const completionPercentage = Math.round((addedAccommodations.length / totalItems) * 100);

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
            Communication Support
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build communication and social interaction supports for {selectedStudentName}. Select accommodations that will enhance communication skills and support meaningful social connections.
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
              Choose the student to build a communication profile for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student for communication supports"
              className="max-w-md"
              data-testid="select-student"
            />
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {addedAccommodations.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Communication Profile Progress</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {addedAccommodations.length} of {totalItems} accommodations selected
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Building a comprehensive communication support profile
              </p>
            </CardContent>
          </Card>
        )}

        {/* Accommodation Categories */}
        <div className="space-y-8">
          {communicationCategories.map((category) => (
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
              disabled={!selectedStudent || addedAccommodations.length === 0 || saveCommunicationProfile.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              data-testid="button-save-communication-profile"
            >
              {saveCommunicationProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Communication Profile
                </>
              )}
            </Button>
            
            <Button asChild variant="outline" data-testid="button-continue-to-behavioral">
              <Link to="/parent/autism-tools/behavioral" className="flex items-center gap-2">
                Continue to Behavioral
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
                Communication Profile Saved Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your child's communication accommodations have been saved. Continue building their complete autism support profile with the Behavioral Strategies tool.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AutismCommunicationTool;