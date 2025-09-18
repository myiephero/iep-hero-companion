import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Heart, 
  Brain, 
  Lightbulb, 
  Users, 
  Volume2, 
  Eye, 
  Palette, 
  Clock, 
  CheckCircle2, 
  Plus,
  Star,
  Search,
  Filter,
  Download,
  Save,
  Settings,
  Info,
  AlertCircle,
  Target,
  Zap,
  BookOpen,
  FileText,
  Headphones,
  Smartphone,
  Timer,
  Shield,
  ChevronRight,
  Copy
} from "lucide-react";
import { useState, useEffect } from "react";
import { StudentSelector } from "@/components/StudentSelector";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AccommodationCategory {
  name: string;
  icon: any;
  color: string;
  accommodations: Accommodation[];
}

interface Accommodation {
  id: string;
  title: string;
  description: string;
  examples: string[];
  gradeLevel: string[];
  intensity: 'low' | 'medium' | 'high';
  evidenceBased: boolean;
}

const AUTISM_ACCOMMODATIONS: AccommodationCategory[] = [
  {
    name: "Sensory",
    icon: Eye,
    color: "blue",
    accommodations: [
      {
        id: "sensory-1",
        title: "Noise-Canceling Headphones",
        description: "Provide headphones or ear protection to reduce auditory distractions",
        examples: [
          "Use during fire drills or loud assemblies",
          "Available during independent work time",
          "Keep at desk for immediate access"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "low",
        evidenceBased: true
      },
      {
        id: "sensory-2", 
        title: "Fidget Tools",
        description: "Allow use of quiet fidget tools to help with self-regulation",
        examples: [
          "Stress balls, fidget cubes, or thinking putty",
          "Textured strips attached to desk",
          "Designated fidget basket in classroom"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "low",
        evidenceBased: true
      },
      {
        id: "sensory-3",
        title: "Sensory Breaks",
        description: "Scheduled or requested breaks to prevent sensory overload",
        examples: [
          "5-minute breaks every 20 minutes",
          "Access to quiet sensory space",
          "Movement breaks in hallway"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "medium",
        evidenceBased: true
      }
    ]
  },
  {
    name: "Communication",
    icon: Volume2,
    color: "green",
    accommodations: [
      {
        id: "comm-1",
        title: "Visual Schedules",
        description: "Provide visual representations of daily schedules and routines",
        examples: [
          "Picture schedule on desk",
          "Digital schedule on tablet",
          "Written schedule with times"
        ],
        gradeLevel: ["K-2", "3-5", "6-8"],
        intensity: "low",
        evidenceBased: true
      },
      {
        id: "comm-2",
        title: "Processing Time",
        description: "Allow extra time to process verbal instructions and questions",
        examples: [
          "Wait 10 seconds after asking question",
          "Repeat instructions if needed",
          "Provide written backup of verbal instructions"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "low",
        evidenceBased: true
      },
      {
        id: "comm-3",
        title: "AAC Device",
        description: "Assistive technology for communication support",
        examples: [
          "Speech generating device",
          "Communication apps on tablet",
          "Picture communication boards"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "high",
        evidenceBased: true
      }
    ]
  },
  {
    name: "Social",
    icon: Users,
    color: "purple",
    accommodations: [
      {
        id: "social-1",
        title: "Social Stories",
        description: "Use social stories to teach appropriate social behaviors",
        examples: [
          "Story about lining up quietly",
          "Story about asking for help",
          "Story about playground interactions"
        ],
        gradeLevel: ["K-2", "3-5", "6-8"],
        intensity: "medium",
        evidenceBased: true
      },
      {
        id: "social-2",
        title: "Peer Buddy System",
        description: "Assign trained peer buddies for social support",
        examples: [
          "Lunch buddy program",
          "Recess companion",
          "Project partner assignment"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "medium",
        evidenceBased: true
      },
      {
        id: "social-3",
        title: "Social Scripts",
        description: "Provide scripts for common social interactions",
        examples: [
          "How to ask to join a game",
          "How to ask for help",
          "How to handle disagreements"
        ],
        gradeLevel: ["3-5", "6-8", "9-12"],
        intensity: "medium",
        evidenceBased: true
      }
    ]
  },
  {
    name: "Academic",
    icon: BookOpen,
    color: "orange",
    accommodations: [
      {
        id: "academic-1",
        title: "Chunked Assignments",
        description: "Break large assignments into smaller, manageable parts",
        examples: [
          "Divide 20 problems into 4 sets of 5",
          "Complete one paragraph at a time",
          "Use checklists to track progress"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "low",
        evidenceBased: true
      },
      {
        id: "academic-2",
        title: "Extended Time",
        description: "Provide additional time for assignments and tests",
        examples: [
          "Time and a half on tests",
          "Extended deadlines for projects",
          "Untimed assignments when appropriate"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "low",
        evidenceBased: true
      },
      {
        id: "academic-3",
        title: "Alternative Assessment",
        description: "Offer different ways to demonstrate knowledge",
        examples: [
          "Oral instead of written responses",
          "Project instead of test",
          "Multiple choice instead of essay"
        ],
        gradeLevel: ["3-5", "6-8", "9-12"],
        intensity: "medium",
        evidenceBased: true
      }
    ]
  },
  {
    name: "Behavioral",
    icon: Target,
    color: "red",
    accommodations: [
      {
        id: "behavior-1",
        title: "Token Economy",
        description: "Use token or point system to reinforce positive behaviors",
        examples: [
          "Earn points for following directions",
          "Token board for task completion",
          "Daily behavior chart with rewards"
        ],
        gradeLevel: ["K-2", "3-5", "6-8"],
        intensity: "medium",
        evidenceBased: true
      },
      {
        id: "behavior-2",
        title: "Clear Expectations",
        description: "Provide explicit, concrete behavioral expectations",
        examples: [
          "Posted classroom rules with pictures",
          "Step-by-step procedure charts",
          "Visual reminders at desk"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "low",
        evidenceBased: true
      },
      {
        id: "behavior-3",
        title: "Self-Regulation Tools",
        description: "Teach and provide tools for emotional self-regulation",
        examples: [
          "Feelings thermometer",
          "Calm-down strategies chart",
          "Self-monitoring checklists"
        ],
        gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
        intensity: "medium",
        evidenceBased: true
      }
    ]
  }
];

export default function ParentAutismAccommodations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Sensory');
  const [selectedAccommodations, setSelectedAccommodations] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const [intensityFilter, setIntensityFilter] = useState<string>('');
  const [savingPlan, setSavingPlan] = useState(false);

  const currentCategory = AUTISM_ACCOMMODATIONS.find(cat => cat.name === selectedCategory);
  
  const filteredAccommodations = currentCategory?.accommodations.filter(acc => {
    const matchesSearch = acc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          acc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !gradeFilter || acc.gradeLevel.includes(gradeFilter);
    const matchesIntensity = !intensityFilter || acc.intensity === intensityFilter;
    
    return matchesSearch && matchesGrade && matchesIntensity;
  }) || [];

  const handleAccommodationToggle = (accommodationId: string) => {
    setSelectedAccommodations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accommodationId)) {
        newSet.delete(accommodationId);
      } else {
        newSet.add(accommodationId);
      }
      return newSet;
    });
  };

  const handleSaveAccommodationPlan = async () => {
    if (!selectedStudentId || selectedStudentId === 'no-student') {
      toast({
        title: "Student Required",
        description: "Please select a student before saving accommodations.",
        variant: "destructive",
      });
      return;
    }

    if (selectedAccommodations.size === 0) {
      toast({
        title: "No Accommodations Selected",
        description: "Please select at least one accommodation to save.",
        variant: "destructive",
      });
      return;
    }

    setSavingPlan(true);
    
    try {
      // Create accommodation plan data
      const planData = {
        title: "Autism Accommodation Plan",
        description: `Personalized accommodation plan with ${selectedAccommodations.size} selected accommodations`,
        goal_type: 'accommodations',
        target_date: new Date(new Date().getFullYear() + 1, 5, 30).toISOString().split('T')[0],
        status: 'not_started' as const,
        current_progress: 0,
        notes: `Selected accommodations: ${Array.from(selectedAccommodations).join(', ')}`,
        student_id: selectedStudentId
      };

      const response = await apiRequest('POST', '/api/goals', planData);
      
      if (response.ok) {
        toast({
          title: "Accommodation Plan Saved!",
          description: "Your autism accommodation plan has been saved to your dashboard.",
        });
        
        setTimeout(() => {
          if (confirm("Would you like to view this plan in your dashboard now?")) {
            navigate('/parent/dashboard');
          }
        }, 1000);
      } else {
        throw new Error('Failed to save accommodation plan');
      }
    } catch (error) {
      console.error('Error saving accommodation plan:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the accommodation plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingPlan(false);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'green': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'purple': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'orange': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'red': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Heart className="h-10 w-10 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Autism Accommodations Builder
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Create a personalized accommodation plan for students with autism spectrum disorder
            </p>
            <div className="flex justify-center space-x-2">
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300">
                Evidence-Based
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                Autism-Specific
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Customizable
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Select Student
                </CardTitle>
                <CardDescription>
                  Choose the student for whom you're creating accommodations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="student-select">Student</Label>
                  <StudentSelector
                    selectedStudent={selectedStudentId}
                    onStudentChange={setSelectedStudentId}
                    placeholder="Choose your child..."
                    data-testid="select-student"
                  />
                  {selectedStudentId && selectedStudentId !== 'no-student' && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Student selected. Accommodations will be customized for their profile.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-6 w-6 text-blue-600" />
                  Filter Accommodations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search accommodations..."
                        className="pl-10"
                        data-testid="input-search"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="grade-filter">Grade Level</Label>
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger data-testid="select-grade-filter">
                        <SelectValue placeholder="All grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All grades</SelectItem>
                        <SelectItem value="K-2">K-2</SelectItem>
                        <SelectItem value="3-5">3-5</SelectItem>
                        <SelectItem value="6-8">6-8</SelectItem>
                        <SelectItem value="9-12">9-12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="intensity-filter">Implementation Level</Label>
                    <Select value={intensityFilter} onValueChange={setIntensityFilter}>
                      <SelectTrigger data-testid="select-intensity-filter">
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All levels</SelectItem>
                        <SelectItem value="low">Low intensity</SelectItem>
                        <SelectItem value="medium">Medium intensity</SelectItem>
                        <SelectItem value="high">High intensity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Accommodation Categories</CardTitle>
                <CardDescription>Choose a category to explore specific accommodations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {AUTISM_ACCOMMODATIONS.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Button
                        key={category.name}
                        variant={selectedCategory === category.name ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.name)}
                        className={cn(
                          "h-24 flex flex-col items-center justify-center space-y-2",
                          selectedCategory === category.name 
                            ? `bg-${category.color}-600 hover:bg-${category.color}-700 text-white`
                            : `hover:bg-${category.color}-50 dark:hover:bg-${category.color}-950/20`
                        )}
                        data-testid={`button-category-${category.name.toLowerCase()}`}
                      >
                        <IconComponent className="h-6 w-6" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Accommodations List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {currentCategory && <currentCategory.icon className="h-6 w-6" />}
                    {selectedCategory} Accommodations
                  </span>
                  <Badge variant="outline">
                    {filteredAccommodations.length} available
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredAccommodations.map((accommodation) => (
                    <Card 
                      key={accommodation.id} 
                      className={cn(
                        "border-l-4 transition-all cursor-pointer hover:shadow-md",
                        selectedAccommodations.has(accommodation.id) 
                          ? "border-l-green-500 bg-green-50 dark:bg-green-950/20" 
                          : "border-l-gray-300 dark:border-l-gray-700"
                      )}
                      onClick={() => handleAccommodationToggle(accommodation.id)}
                      data-testid={`card-accommodation-${accommodation.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={selectedAccommodations.has(accommodation.id)}
                              onChange={() => {}}
                              className="mt-1"
                              data-testid={`checkbox-${accommodation.id}`}
                            />
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {accommodation.title}
                                </h3>
                                <div className="flex gap-2 ml-4">
                                  <Badge className={getIntensityColor(accommodation.intensity)}>
                                    {accommodation.intensity} intensity
                                  </Badge>
                                  {accommodation.evidenceBased && (
                                    <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                      <Star className="h-3 w-3 mr-1" />
                                      Evidence-based
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-400">
                                {accommodation.description}
                              </p>
                              
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Examples:</h4>
                                <ul className="space-y-1">
                                  {accommodation.examples.map((example, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">{example}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {accommodation.gradeLevel.map((grade) => (
                                  <Badge key={grade} variant="outline" className="text-xs">
                                    Grade {grade}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredAccommodations.length === 0 && (
                    <div className="text-center py-12">
                      <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No Accommodations Found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Try adjusting your filters or search terms.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Selected Accommodations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Selected Accommodations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAccommodations.size > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedAccommodations.size} accommodations selected
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {Array.from(selectedAccommodations).map((id) => {
                        const accommodation = AUTISM_ACCOMMODATIONS
                          .flatMap(cat => cat.accommodations)
                          .find(acc => acc.id === id);
                        
                        if (!accommodation) return null;
                        
                        return (
                          <div key={id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm font-medium">{accommodation.title}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAccommodationToggle(id)}
                              data-testid={`button-remove-${id}`}
                            >
                              ×
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Button
                      onClick={handleSaveAccommodationPlan}
                      disabled={savingPlan || !selectedStudentId || selectedStudentId === 'no-student'}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      data-testid="button-save-plan"
                    >
                      {savingPlan ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Saving Plan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Accommodation Plan
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select accommodations to build your plan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  About Accommodations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Evidence-Based:</strong> All accommodations are backed by research and proven effective for students with autism.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Individualized:</strong> Choose accommodations that match your child's specific needs and learning style.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Team Approach:</strong> Share your accommodation plan with teachers and the IEP team.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Related Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/goal-generator')}
                  data-testid="button-goal-generator"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Goal Generator
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/iep-master-suite')}
                  data-testid="button-iep-suite"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  IEP Master Suite
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/emotion-tracker')}
                  data-testid="button-emotion-tracker"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Emotion Tracker
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}