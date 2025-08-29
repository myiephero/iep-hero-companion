import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { StudentSelector } from "@/components/StudentSelector";
import { Brain, Plus, Settings, Star, BookOpen, Users2, Volume2, Eye, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AutismAccommodation {
  id: string;
  student_id?: string;
  accommodation_type: string;
  category: string;
  title: string;
  description: string;
  implementation_notes?: string;
  effectiveness_rating?: number;
  sensory_profile?: any;
  behavioral_triggers?: any;
  communication_needs?: any;
  academic_supports?: any;
  social_supports?: any;
  environmental_modifications?: any;
  technology_supports?: any;
  status: string;
  created_at: string;
}

const accommodationCategories = [
  { id: 'sensory', name: 'Sensory Support', icon: Volume2, color: 'bg-blue-100 text-blue-700' },
  { id: 'communication', name: 'Communication', icon: Users2, color: 'bg-green-100 text-green-700' },
  { id: 'academic', name: 'Academic Support', icon: BookOpen, color: 'bg-purple-100 text-purple-700' },
  { id: 'social', name: 'Social Skills', icon: Users2, color: 'bg-orange-100 text-orange-700' },
  { id: 'behavioral', name: 'Behavioral Support', icon: Brain, color: 'bg-red-100 text-red-700' },
  { id: 'environmental', name: 'Environment', icon: Eye, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'technology', name: 'Technology', icon: Settings, color: 'bg-indigo-100 text-indigo-700' }
];

const predefinedAccommodations = {
  sensory: [
    { title: 'Noise-Canceling Headphones', description: 'Provide noise-canceling headphones for noisy environments' },
    { title: 'Fidget Tools', description: 'Allow use of fidget toys or stress balls during instruction' },
    { title: 'Sensory Breaks', description: 'Regular breaks to sensory room or quiet space' },
    { title: 'Weighted Lap Pad', description: 'Use of weighted lap pad for calming and focus' }
  ],
  communication: [
    { title: 'Visual Schedule', description: 'Daily visual schedule with pictures and symbols' },
    { title: 'Communication Device', description: 'Access to AAC device or communication app' },
    { title: 'Written Instructions', description: 'Provide written instructions alongside verbal directions' },
    { title: 'Processing Time', description: 'Extended wait time for verbal responses' }
  ],
  academic: [
    { title: 'Extended Time', description: 'Additional time for assignments and tests' },
    { title: 'Chunked Assignments', description: 'Break long assignments into smaller parts' },
    { title: 'Alternative Assessment', description: 'Alternative ways to demonstrate knowledge' },
    { title: 'Visual Supports', description: 'Use of graphic organizers and visual aids' }
  ],
  social: [
    { title: 'Social Stories', description: 'Individualized social stories for specific situations' },
    { title: 'Peer Buddy System', description: 'Structured peer support and friendship opportunities' },
    { title: 'Lunch Bunch', description: 'Small group lunch sessions with facilitated interaction' },
    { title: 'Social Skills Group', description: 'Weekly social skills instruction in small group' }
  ],
  behavioral: [
    { title: 'Behavior Chart', description: 'Visual behavior tracking and reward system' },
    { title: 'Calm Down Space', description: 'Designated area for self-regulation' },
    { title: 'Advance Warning', description: 'Verbal or visual warning before transitions' },
    { title: 'Choice Boards', description: 'Visual choice options to increase compliance' }
  ],
  environmental: [
    { title: 'Preferred Seating', description: 'Seating away from distractions or near teacher' },
    { title: 'Lighting Modification', description: 'Reduced fluorescent lighting or natural light' },
    { title: 'Minimal Distractions', description: 'Reduced visual and auditory distractions in workspace' },
    { title: 'Movement Opportunities', description: 'Opportunities for movement throughout the day' }
  ],
  technology: [
    { title: 'Text-to-Speech', description: 'Text-to-speech software for reading support' },
    { title: 'Typing Instead of Writing', description: 'Use of computer for written assignments' },
    { title: 'Educational Apps', description: 'Specialized apps for learning and communication' },
    { title: 'Timer Apps', description: 'Visual timers for transitions and task completion' }
  ]
};

export default function AutismAccommodationBuilder() {
  const [accommodations, setAccommodations] = useState<AutismAccommodation[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("sensory");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    implementation_notes: "",
    accommodation_type: "individualized",
    effectiveness_rating: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAccommodations();
  }, [selectedStudent]);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const data = await api.getAutismAccommodations();
      
      // Filter by student if selected
      const filteredData = selectedStudent 
        ? data.filter(acc => acc.student_id === selectedStudent)
        : data;
        
      setAccommodations(filteredData || []);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      toast({
        title: "Error",
        description: "Failed to load accommodations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccommodation = async (predefined?: { title: string; description: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const accommodationData = {
        user_id: user.id,
        student_id: selectedStudent || null,
        category: selectedCategory,
        accommodation_type: formData.accommodation_type,
        title: predefined?.title || formData.title,
        description: predefined?.description || formData.description,
        implementation_notes: formData.implementation_notes || null,
        effectiveness_rating: formData.effectiveness_rating || null,
        status: 'active'
      };

      const { error } = await supabase
        .from('autism_accommodations')
        .insert(accommodationData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Accommodation created successfully!",
      });

      fetchAccommodations();
      setShowCreateDialog(false);
      setFormData({
        title: "",
        description: "",
        implementation_notes: "",
        accommodation_type: "individualized",
        effectiveness_rating: 0
      });
    } catch (error) {
      console.error('Error creating accommodation:', error);
      toast({
        title: "Error",
        description: "Failed to create accommodation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateEffectivenessRating = async (id: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('autism_accommodations')
        .update({ effectiveness_rating: rating })
        .eq('id', id);

      if (error) throw error;

      setAccommodations(prev =>
        prev.map(acc => acc.id === id ? { ...acc, effectiveness_rating: rating } : acc)
      );

      toast({
        title: "Success",
        description: "Effectiveness rating updated!",
      });
    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: "Error",
        description: "Failed to update rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredAccommodations = accommodations.filter(acc =>
    selectedCategory === 'all' || acc.category === selectedCategory
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Autism Accommodation Builder</h1>
          <p className="text-muted-foreground">
            Create and manage autism-specific accommodations tailored to individual sensory, communication, and learning needs.
          </p>
        </div>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Student</CardTitle>
            <CardDescription>
              Choose a student to create accommodations for, or leave blank for general accommodations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent || ""}
              onStudentChange={(id) => setSelectedStudent(id || "")}
            />
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            {accommodationCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Accommodations</h2>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Custom Accommodation</DialogTitle>
                    <DialogDescription>
                      Create a personalized accommodation for specific needs.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accommodationCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Accommodation title..."
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the accommodation and how it helps..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="implementation">Implementation Notes</Label>
                      <Textarea
                        id="implementation"
                        placeholder="How to implement this accommodation..."
                        value={formData.implementation_notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, implementation_notes: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      onClick={() => handleCreateAccommodation()}
                      disabled={!formData.title || !formData.description}
                    >
                      Create Accommodation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccommodations.map((accommodation) => (
                <Card key={accommodation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{accommodation.title}</CardTitle>
                      <Badge variant="secondary">{accommodation.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {accommodation.description}
                    </p>
                    
                    {accommodation.implementation_notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Implementation Notes:</h4>
                        <p className="text-sm text-muted-foreground">
                          {accommodation.implementation_notes}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Effectiveness Rating</h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant="ghost"
                            size="sm"
                            onClick={() => updateEffectivenessRating(accommodation.id, rating)}
                            className="p-1"
                          >
                            <Star 
                              className={`h-4 w-4 ${
                                rating <= (accommodation.effectiveness_rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </Button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({accommodation.effectiveness_rating || 0}/5)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {accommodationCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Accommodations for {category.name.toLowerCase()} support
                    </p>
                  </div>
                </div>
              </div>

              {/* Pre-defined accommodations */}
              <div>
                <h3 className="text-lg font-medium mb-4">Suggested Accommodations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predefinedAccommodations[category.id as keyof typeof predefinedAccommodations]?.map((item, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.description}
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => handleCreateAccommodation(item)}
                          className="w-full"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add This Accommodation
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Existing accommodations for this category */}
              {filteredAccommodations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Your {category.name} Accommodations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccommodations.map((accommodation) => (
                      <Card key={accommodation.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{accommodation.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {accommodation.description}
                          </p>
                          
                          {accommodation.implementation_notes && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Implementation:</h4>
                              <p className="text-sm text-muted-foreground">
                                {accommodation.implementation_notes}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Effectiveness</h4>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Button
                                  key={rating}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateEffectivenessRating(accommodation.id, rating)}
                                  className="p-1"
                                >
                                  <Star 
                                    className={`h-4 w-4 ${
                                      rating <= (accommodation.effectiveness_rating || 0)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </Button>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
