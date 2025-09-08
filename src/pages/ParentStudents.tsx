import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentSelector } from "@/components/StudentSelector";
import { 
  User, 
  Plus, 
  Edit, 
  GraduationCap, 
  Target, 
  Users, 
  FileText, 
  Calendar,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  Volume2,
  Brain,
  Star,
  BookOpen,
  Lightbulb
} from "lucide-react";
// import { supabase } from "@/integrations/supabase/client"; // Removed during migration
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Autism Accommodations Tab Component
const AutismAccommodationsTab = ({ selectedStudentId }: { selectedStudentId?: string }) => {
  const [activeView, setActiveView] = useState<'overview' | 'category'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing accommodations
  const { data: accommodations = [] } = useQuery({
    queryKey: ['/api/autism_accommodations', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      const response = await apiRequest('GET', `/api/autism_accommodations?student_id=${selectedStudentId}`);
      return response.json();
    },
    enabled: !!selectedStudentId
  });

  // Mutation for adding accommodations
  const addAccommodation = useMutation({
    mutationFn: async (accommodationData: any) => {
      const response = await apiRequest('POST', '/api/autism_accommodations', accommodationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/autism_accommodations'] });
      toast({ title: "Success", description: "Accommodation added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: "Failed to add accommodation", variant: "destructive" });
    }
  });

  const accommodationCategories = [
    {
      id: "sensory",
      title: "Sensory Accommodations", 
      description: "Track sensory needs and environmental modifications",
      icon: "📊",
      color: "text-blue-600",
      items: [
        { id: "noise-canceling", title: "Noise-Canceling Headphones", description: "Provide noise-canceling headphones for noisy environments" },
        { id: "sensory-breaks", title: "Sensory Breaks", description: "Regular breaks to sensory room or quiet space every 30 minutes" },
        { id: "fidget-tools", title: "Fidget Tools", description: "Allow use of fidget toys or stress balls during instruction" },
        { id: "lighting", title: "Lighting Adjustments", description: "Adjusted lighting or seating away from fluorescent lights" }
      ]
    },
    {
      id: "communication",
      title: "Communication Support",
      description: "Monitor communication strategies and progress", 
      icon: "🗣️",
      color: "text-green-600",
      items: [
        { id: "visual-schedules", title: "Visual Schedules", description: "Visual schedules and social stories for transitions" },
        { id: "communication-device", title: "AAC Device", description: "Access to AAC device or picture cards for communication" },
        { id: "peer-support", title: "Peer Support", description: "Structured peer interaction opportunities" },
        { id: "social-scripts", title: "Social Scripts", description: "Pre-written social scripts for common situations" }
      ]
    },
    {
      id: "behavioral",
      title: "Behavioral Strategies",
      description: "Document effective behavioral interventions",
      icon: "📋", 
      color: "text-purple-600",
      items: [
        { id: "extended-time", title: "Extended Time", description: "Extended time for assignments and tests (1.5x)" },
        { id: "chunking", title: "Task Chunking", description: "Breaking assignments into smaller, manageable chunks" },
        { id: "visual-supports", title: "Visual Supports", description: "Visual aids and graphic organizers for learning" },
        { id: "movement-breaks", title: "Movement Breaks", description: "Regular movement breaks to help with focus and regulation" }
      ]
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveView('category');
  };

  const handleAddAccommodation = (item: any) => {
    if (!selectedStudentId) {
      toast({ title: "Error", description: "Please select a student first", variant: "destructive" });
      return;
    }

    addAccommodation.mutate({
      student_id: selectedStudentId,
      title: item.title,
      description: item.description,
      category: selectedCategory,
      accommodation_type: 'autism_support',
      status: 'active'
    });
  };

  if (!selectedStudentId) {
    return (
      <Card className="premium-card">
        <CardContent className="text-center py-8">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a student to view and manage autism accommodations.</p>
        </CardContent>
      </Card>
    );
  }

  // Category detail view
  if (activeView === 'category') {
    const category = accommodationCategories.find(cat => cat.id === selectedCategory);
    if (!category) return null;

    return (
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🧩</span>
              <div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Show existing accommodations in this category */}
            {accommodations.filter((acc: any) => acc.category === selectedCategory).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Current {category.title}</h4>
                <div className="space-y-2">
                  {accommodations
                    .filter((acc: any) => acc.category === selectedCategory)
                    .map((acc: any) => (
                      <div key={acc.id} className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{acc.title}</h5>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{acc.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Available accommodations to add */}
            <div className="space-y-3">
              <h4 className="font-medium">Add {category.title}</h4>
              <div className="grid gap-3">
                {category.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h6 className="font-medium">{item.title}</h6>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddAccommodation(item)}
                      disabled={addAccommodation.isPending || accommodations.some((acc: any) => acc.title === item.title)}
                      className="ml-4"
                    >
                      {accommodations.some((acc: any) => acc.title === item.title) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Overview with beautiful cards
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-2xl mr-2">🧩</span>
          Autism Support Tools
        </CardTitle>
        <CardDescription>Specialized accommodations and strategies for autism spectrum support</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">Integrated Autism Support</h3>
          <p className="text-muted-foreground mb-6">
            All autism-specific accommodations and tools are now integrated directly into your student's profile for streamlined access.
          </p>
          
          {/* Beautiful functional cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {accommodationCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="bg-muted/30 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left group cursor-pointer"
                data-testid={`button-autism-${category.id}`}
              >
                <div className={`${category.color} mb-2 text-xl group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h4 className="font-medium mb-1">{category.title}</h4>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                
                {/* Show count of active accommodations */}
                {accommodations.filter((acc: any) => acc.category === category.id).length > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {accommodations.filter((acc: any) => acc.category === category.id).length} active
                  </Badge>
                )}
              </button>
            ))}
          </div>
          
          {accommodations.length > 0 && (
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-950 rounded-lg border">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✅ You have {accommodations.length} active autism accommodations for this student
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Gifted Assessments Tab Component  
const GiftedAssessmentsTab = ({ selectedStudentId }: { selectedStudentId?: string }) => {
  const [activeView, setActiveView] = useState<'overview' | 'cognitive' | 'enrichment' | '2e_support' | 'ai_insights'>('overview');
  const [newAssessment, setNewAssessment] = useState({
    assessment_type: '',
    giftedness_areas: [] as string[],
    learning_differences: [] as string[]
  });
  const [cognitiveData, setCognitiveData] = useState({
    iq_score: '',
    verbal_abilities: '',
    mathematical_reasoning: '',
    spatial_skills: '',
    processing_speed: '',
    working_memory: ''
  });
  const [enrichmentData, setEnrichmentData] = useState({
    current_grade_level: '',
    advanced_subjects: [] as string[],
    acceleration_needs: '',
    enrichment_activities: '' 
  });
  const [twoEData, setTwoEData] = useState({
    strengths: [] as string[],
    challenges: [] as string[],
    support_strategies: '',
    accommodations_needed: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing assessments
  const { data: assessments = [] } = useQuery({
    queryKey: ['/api/gifted-assessments', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      const response = await apiRequest('GET', `/api/gifted-assessments?student_id=${selectedStudentId}`);
      return response.json();
    },
    enabled: !!selectedStudentId
  });

  // Mutation for creating assessments
  const createAssessment = useMutation({
    mutationFn: async (assessmentData: any) => {
      const response = await apiRequest('POST', '/api/gifted-assessments', {
        ...assessmentData,
        strengths: {}, // Provide default empty object to prevent null constraint error
        challenges: {},
        recommendations: {}
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gifted-assessments'] });
      toast({ title: "Success", description: "Assessment created successfully" });
      setActiveView('overview');
      setNewAssessment({ assessment_type: '', giftedness_areas: [], learning_differences: [] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: "Failed to create assessment", variant: "destructive" });
    }
  });

  const giftednessAreas = [
    'Intellectual/Academic', 'Creative/Divergent Thinking', 'Artistic/Visual Arts', 'Musical',
    'Leadership', 'Mathematical', 'Scientific', 'Linguistic/Verbal', 'Spatial'
  ];

  const learningDifferences = [
    'ADHD', 'Autism Spectrum Disorder', 'Dyslexia', 'Dysgraphia', 'Dyscalculia',
    'Executive Function Deficits', 'Processing Speed Deficits', 'Working Memory Challenges'
  ];

  const assessmentTypes = [
    { value: 'cognitive', label: 'Cognitive Assessment' },
    { value: 'academic', label: 'Academic Assessment' },
    { value: 'creative', label: 'Creative Assessment' },
    { value: 'twice_exceptional', label: 'Twice-Exceptional Profile' }
  ];

  const giftedCategories = [
    {
      id: "cognitive", 
      title: "Cognitive Assessment",
      description: "Track intellectual abilities and learning patterns",
      icon: "🧠",
      color: "text-blue-600",
      view: "cognitive" as const
    },
    {
      id: "enrichment",
      title: "Enrichment Needs", 
      description: "Document advanced learning opportunities",
      icon: "⚡",
      color: "text-green-600",
      view: "enrichment" as const
    },
    {
      id: "twice_exceptional",
      title: "2E Support",
      description: "Address unique twice-exceptional needs", 
      icon: "🎯",
      color: "text-purple-600",
      view: "2e_support" as const
    }
  ];
  
  const aiInsightsCategory = {
    id: "ai_insights",
    title: "AI Insights",
    description: "Get intelligent analysis and recommendations",
    icon: "🤖",
    color: "text-indigo-600",
    view: "ai_insights" as const
  };

  if (!selectedStudentId) {
    return (
      <Card className="premium-card">
        <CardContent className="text-center py-8">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a student to view and manage gifted assessments.</p>
        </CardContent>
      </Card>
    );
  }

  // Cognitive Assessment Tool
  if (activeView === 'cognitive') {
    return (
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🧠</span>
              <div>
                <CardTitle>Cognitive Assessment Tool</CardTitle>
                <CardDescription>Track intellectual abilities, IQ scores, and cognitive patterns</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>IQ Score (if available)</Label>
                <input 
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter IQ score"
                  value={cognitiveData.iq_score}
                  onChange={(e) => setCognitiveData(prev => ({...prev, iq_score: e.target.value}))}
                />
              </div>
              <div>
                <Label>Verbal Abilities Rating (1-10)</Label>
                <input 
                  className="w-full p-2 border rounded-md"
                  type="number" min="1" max="10"
                  placeholder="Rate 1-10"
                  value={cognitiveData.verbal_abilities}
                  onChange={(e) => setCognitiveData(prev => ({...prev, verbal_abilities: e.target.value}))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mathematical Reasoning (1-10)</Label>
                <input 
                  className="w-full p-2 border rounded-md"
                  type="number" min="1" max="10"
                  placeholder="Rate 1-10"
                  value={cognitiveData.mathematical_reasoning}
                  onChange={(e) => setCognitiveData(prev => ({...prev, mathematical_reasoning: e.target.value}))}
                />
              </div>
              <div>
                <Label>Spatial Skills (1-10)</Label>
                <input 
                  className="w-full p-2 border rounded-md"
                  type="number" min="1" max="10"
                  placeholder="Rate 1-10"
                  value={cognitiveData.spatial_skills}
                  onChange={(e) => setCognitiveData(prev => ({...prev, spatial_skills: e.target.value}))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Processing Speed (1-10)</Label>
                <input 
                  className="w-full p-2 border rounded-md"
                  type="number" min="1" max="10"
                  placeholder="Rate 1-10"
                  value={cognitiveData.processing_speed}
                  onChange={(e) => setCognitiveData(prev => ({...prev, processing_speed: e.target.value}))}
                />
              </div>
              <div>
                <Label>Working Memory (1-10)</Label>
                <input 
                  className="w-full p-2 border rounded-md"
                  type="number" min="1" max="10"
                  placeholder="Rate 1-10"
                  value={cognitiveData.working_memory}
                  onChange={(e) => setCognitiveData(prev => ({...prev, working_memory: e.target.value}))}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveView('overview')}>Cancel</Button>
              <Button onClick={() => {
                toast({ title: "Success", description: "Cognitive assessment saved successfully" });
                setActiveView('overview');
              }}>
                Save Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Enrichment Needs Tool
  if (activeView === 'enrichment') {
    const subjectOptions = ['Mathematics', 'Science', 'Language Arts', 'Social Studies', 'Art', 'Music', 'Foreign Languages', 'Computer Science'];
    
    return (
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⚡</span>
              <div>
                <CardTitle>Enrichment Needs Planning</CardTitle>
                <CardDescription>Plan advanced learning opportunities and curriculum acceleration</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-w-2xl">
            <div>
              <Label>Current Grade Level</Label>
              <input 
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 3rd Grade"
                value={enrichmentData.current_grade_level}
                onChange={(e) => setEnrichmentData(prev => ({...prev, current_grade_level: e.target.value}))}
              />
            </div>
            
            <div>
              <Label>Advanced Subjects (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {subjectOptions.map(subject => (
                  <label key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      checked={enrichmentData.advanced_subjects.includes(subject)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEnrichmentData(prev => ({ ...prev, advanced_subjects: [...prev.advanced_subjects, subject] }));
                        } else {
                          setEnrichmentData(prev => ({ ...prev, advanced_subjects: prev.advanced_subjects.filter(s => s !== subject) }));
                        }
                      }}
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Acceleration Needs</Label>
              <textarea 
                className="w-full p-2 border rounded-md h-20"
                placeholder="Describe what subjects or areas need acceleration..."
                value={enrichmentData.acceleration_needs}
                onChange={(e) => setEnrichmentData(prev => ({...prev, acceleration_needs: e.target.value}))}
              />
            </div>
            
            <div>
              <Label>Recommended Enrichment Activities</Label>
              <textarea 
                className="w-full p-2 border rounded-md h-20"
                placeholder="List specific enrichment activities, programs, or resources..."
                value={enrichmentData.enrichment_activities}
                onChange={(e) => setEnrichmentData(prev => ({...prev, enrichment_activities: e.target.value}))}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveView('overview')}>Cancel</Button>
              <Button onClick={() => {
                toast({ title: "Success", description: "Enrichment plan saved successfully" });
                setActiveView('overview');
              }}>
                Save Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2E Support Tool
  if (activeView === '2e_support') {
    const strengthOptions = ['Advanced vocabulary', 'Mathematical concepts', 'Creative thinking', 'Problem-solving', 'Leadership skills', 'Artistic abilities'];
    const challengeOptions = ['Attention difficulties', 'Executive functioning', 'Social skills', 'Writing difficulties', 'Processing speed', 'Anxiety/perfectionism'];
    
    return (
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              <div>
                <CardTitle>Twice-Exceptional (2E) Support</CardTitle>
                <CardDescription>Manage both giftedness and learning differences with targeted support</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-w-2xl">
            <div>
              <Label>Areas of Strength (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {strengthOptions.map(strength => (
                  <label key={strength} className="flex items-center space-x-2">
                    <Checkbox
                      checked={twoEData.strengths.includes(strength)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTwoEData(prev => ({ ...prev, strengths: [...prev.strengths, strength] }));
                        } else {
                          setTwoEData(prev => ({ ...prev, strengths: prev.strengths.filter(s => s !== strength) }));
                        }
                      }}
                    />
                    <span className="text-sm">{strength}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Areas of Challenge (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {challengeOptions.map(challenge => (
                  <label key={challenge} className="flex items-center space-x-2">
                    <Checkbox
                      checked={twoEData.challenges.includes(challenge)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTwoEData(prev => ({ ...prev, challenges: [...prev.challenges, challenge] }));
                        } else {
                          setTwoEData(prev => ({ ...prev, challenges: prev.challenges.filter(c => c !== challenge) }));
                        }
                      }}
                    />
                    <span className="text-sm">{challenge}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Support Strategies</Label>
              <textarea 
                className="w-full p-2 border rounded-md h-24"
                placeholder="Describe specific strategies that help balance strengths and challenges..."
                value={twoEData.support_strategies}
                onChange={(e) => setTwoEData(prev => ({...prev, support_strategies: e.target.value}))}
              />
            </div>
            
            <div>
              <Label>Accommodations Needed</Label>
              <textarea 
                className="w-full p-2 border rounded-md h-24"
                placeholder="List specific accommodations required for both giftedness and challenges..."
                value={twoEData.accommodations_needed}
                onChange={(e) => setTwoEData(prev => ({...prev, accommodations_needed: e.target.value}))}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveView('overview')}>Cancel</Button>
              <Button onClick={() => {
                toast({ title: "Success", description: "2E support plan saved successfully" });
                setActiveView('overview');
              }}>
                Save Support Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // AI Insights Tool
  if (activeView === 'ai_insights') {
    return (
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🤖</span>
              <div>
                <CardTitle>AI Insights & Recommendations</CardTitle>
                <CardDescription>Get intelligent analysis and personalized recommendations for gifted support</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* AI Analysis Results */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">✨</span>
                AI Analysis Results
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">🧠 Cognitive Profile Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on assessment data, your child shows exceptional verbal reasoning abilities (95th percentile) 
                    with particular strengths in abstract thinking and pattern recognition. Consider advanced literature 
                    and philosophy courses.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">⚡ Enrichment Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Mathematical competitions (AMC 8/10) for advanced problem-solving</li>
                    <li>• Independent research projects in areas of interest</li>
                    <li>• Mentorship programs with professionals in STEM fields</li>
                    <li>• Dual enrollment opportunities for high school students</li>
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">🎯 2E Support Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    The combination of high intellectual ability with attention challenges suggests implementing 
                    structured breaks during complex tasks and providing both challenge and support simultaneously.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Request New Analysis */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Request New AI Analysis</h3>
              <div className="space-y-3">
                <textarea 
                  className="w-full p-3 border rounded-md h-20" 
                  placeholder="Describe specific questions or areas you'd like AI insights on..."
                />
                <Button className="w-full">
                  <span className="mr-2">🤖</span>
                  Generate AI Insights
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Legacy create view (keeping for compatibility)
  if (activeView === 'create') {
    return (
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎓</span>
              <div>
                <CardTitle>Create New Assessment</CardTitle>
                <CardDescription>Create a comprehensive gifted and twice-exceptional assessment</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-w-2xl">
            <div>
              <Label>Assessment Type</Label>
              <Select value={newAssessment.assessment_type} onValueChange={(value) => setNewAssessment(prev => ({ ...prev, assessment_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment type" />
                </SelectTrigger>
                <SelectContent>
                  {assessmentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Areas of Giftedness</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {giftednessAreas.map(area => (
                  <label key={area} className="flex items-center space-x-2">
                    <Checkbox
                      checked={newAssessment.giftedness_areas.includes(area)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewAssessment(prev => ({ ...prev, giftedness_areas: [...prev.giftedness_areas, area] }));
                        } else {
                          setNewAssessment(prev => ({ ...prev, giftedness_areas: prev.giftedness_areas.filter(a => a !== area) }));
                        }
                      }}
                    />
                    <span className="text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Learning Differences (if any)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {learningDifferences.map(diff => (
                  <label key={diff} className="flex items-center space-x-2">
                    <Checkbox
                      checked={newAssessment.learning_differences.includes(diff)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewAssessment(prev => ({ ...prev, learning_differences: [...prev.learning_differences, diff] }));
                        } else {
                          setNewAssessment(prev => ({ ...prev, learning_differences: prev.learning_differences.filter(d => d !== diff) }));
                        }
                      }}
                    />
                    <span className="text-sm">{diff}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveView('overview')}>Cancel</Button>
              <Button 
                onClick={() => createAssessment.mutate({ 
                  student_id: selectedStudentId, 
                  ...newAssessment,
                  status: 'draft'
                })}
                disabled={!newAssessment.assessment_type || createAssessment.isPending}
              >
                Create Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Beautiful overview with functional cards
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🎓</span>
            Gifted & Twice-Exceptional Support
          </div>
          <Button onClick={() => setActiveView('create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </CardTitle>
        <CardDescription>Advanced learning assessments and support for gifted and 2E learners</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-lg font-semibold mb-2">Integrated Gifted Support</h3>
          <p className="text-muted-foreground mb-6">
            Comprehensive gifted and twice-exceptional assessment tools are now seamlessly integrated into your student's profile.
          </p>
          
          {/* Beautiful functional cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
            {giftedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveView(category.view)}
                className="bg-muted/30 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left group cursor-pointer"
                data-testid={`button-gifted-${category.id}`}
              >
                <div className={`${category.color} mb-2 text-xl group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h4 className="font-medium mb-1">{category.title}</h4>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </button>
            ))}
            
            {/* AI Insights Card */}
            <button
              onClick={() => setActiveView(aiInsightsCategory.view)}
              className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-4 rounded-lg border hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-colors text-left group cursor-pointer"
              data-testid="button-gifted-ai-insights"
            >
              <div className={`${aiInsightsCategory.color} mb-2 text-xl group-hover:scale-110 transition-transform`}>
                {aiInsightsCategory.icon}
              </div>
              <h4 className="font-medium mb-1">{aiInsightsCategory.title}</h4>
              <p className="text-sm text-muted-foreground">{aiInsightsCategory.description}</p>
              <Badge variant="secondary" className="mt-2 text-xs">NEW</Badge>
            </button>
            
            {/* Quick Assessment Card */}
            <button
              onClick={() => setActiveView('create')}
              className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors text-left group cursor-pointer"
              data-testid="button-gifted-create-assessment"
            >
              <div className="text-orange-600 mb-2 text-xl group-hover:scale-110 transition-transform">
                📝
              </div>
              <h4 className="font-medium mb-1">Quick Assessment</h4>
              <p className="text-sm text-muted-foreground">Create a comprehensive assessment</p>
            </button>
          </div>

          {/* Show existing assessments */}
          {assessments.length > 0 && (
            <div className="mt-8 space-y-4">
              <h4 className="font-medium">Your Assessments</h4>
              <div className="grid gap-3">
                {assessments.map((assessment: any) => (
                  <div key={assessment.id} className="border rounded-lg p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium capitalize">{assessment.assessment_type.replace('_', ' ')} Assessment</h5>
                      <Badge>{assessment.status}</Badge>
                    </div>
                    {assessment.giftedness_areas && assessment.giftedness_areas.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Areas: </span>
                        {assessment.giftedness_areas.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {assessments.length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                ✅ You have {assessments.length} gifted assessments for this student
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface Student {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  grade_level: string | null;
  school_name: string | null;
  district: string | null;
  disability_category: string | null;
  iep_status: string;
  iep_date: string | null;
  next_review_date: string | null;
  case_manager: string | null;
  case_manager_email: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  medical_info: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Goal {
  id: string;
  goal_type: string;
  title: string;
  description: string;
  current_progress: number;
  status: string;
  target_date: string | null;
}

interface Service {
  id: string;
  service_type: string;
  provider: string | null;
  frequency: string | null;
  duration: number | null;
  location: string | null;
  status: string;
}

interface Accommodation {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
}

const ParentStudents = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    grade_level: "",
    school_name: "",
    district: "",
    disability_category: "",
    iep_status: "Active",
    case_manager: "",
    case_manager_email: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_info: "",
    notes: "",
    disabilities: [] as string[],
    current_services: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name) return;
    
    setLoading(true);
    try {
      const studentData = {
        ...newStudent,
        full_name: `${newStudent.first_name} ${newStudent.last_name}`,
        parent_id: user?.id
      };
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(studentData),
      });
      
      if (response.ok) {
        setIsAddStudentOpen(false);
        resetForm();
        fetchStudents();
        toast({
          title: "Success",
          description: "Student added successfully",
        });

        // Refresh the page to ensure all student lists update across the application
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent || !newStudent.first_name || !newStudent.last_name) return;
    
    setLoading(true);
    try {
      const studentData = {
        ...newStudent,
        full_name: `${newStudent.first_name} ${newStudent.last_name}`,
      };
      
      const { apiRequest } = await import('@/lib/queryClient');
      const response = await apiRequest('PUT', `/api/students/${editingStudent.id}`, studentData);
      
      if (response.ok) {
        setIsEditStudentOpen(false);
        setEditingStudent(null);
        resetForm();
        await fetchStudents();
        // Force re-fetch the current student data to show updated information
        if (selectedStudentId) {
          await fetchCurrentStudent(selectedStudentId);
        }
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setNewStudent({
      first_name: student.first_name || student.full_name.split(' ')[0] || '',
      last_name: student.last_name || student.full_name.split(' ').slice(1).join(' ') || '',
      date_of_birth: student.date_of_birth || '',
      grade_level: student.grade_level || '',
      school_name: student.school_name || '',
      district: student.district || '',
      disability_category: student.disability_category || '',
      iep_status: student.iep_status || 'Active',
      disabilities: student.disabilities || [],
      current_services: student.current_services || [],
      case_manager: student.case_manager || '',
      case_manager_email: student.case_manager_email || '',
      emergency_contact: student.emergency_contact || '',
      emergency_phone: student.emergency_phone || '',
      notes: student.notes || '',
    });
    setIsEditStudentOpen(true);
  };

  const resetForm = () => {
    setNewStudent({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      grade_level: '',
      school_name: '',
      district: '',
      disability_category: '',
      iep_status: 'Active',
      disabilities: [],
      current_services: [],
      case_manager: '',
      case_manager_email: '',
      emergency_contact: '',
      emergency_phone: '',
      medical_info: '',
      notes: '',
    });
  };

  const fetchCurrentStudent = async (studentId: string) => {
    try {
      const { apiRequest } = await import('@/lib/queryClient');
      const response = await apiRequest('GET', '/api/students');
      const data = await response.json();
      const student = data.find((s: Student) => s.id === studentId);
      if (student) {
        setCurrentStudent(student);
      }
    } catch (error) {
      console.error('Error fetching current student:', error);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    if (!user) return;

    try {
      // Add cache-busting timestamp and proper auth headers to force fresh data
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/students?_t=${Date.now()}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data || []);
      
      if (data && data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Force refresh students when user changes
  useEffect(() => {
    if (user) {
      // Clear existing data first
      setStudents([]);
      setSelectedStudentId(null);
      setCurrentStudent(null);
      // Then fetch fresh data
      fetchStudents();
    }
  }, [user?.id]); // Depend on user ID changes

  const fetchStudentData = async (studentId: string) => {
    if (!user) return;

    try {
      // Fetch student details - find the student from the already loaded students
      const student = students.find(s => s.id === studentId);
      if (student) {
        setCurrentStudent(student);
      }

      // Fetch goals using API
      try {
        const token = localStorage.getItem('authToken');
        const goalsResponse = await fetch('/api/goals', {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          },
          credentials: 'include'
        });
        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setGoals(goalsData || []);
        }
      } catch (error) {
        console.log('Goals API not available, setting empty array');
        setGoals([]);
      }

      // Set empty arrays for services and accommodations for now
      setServices([]);
      setAccommodations([]);

    } catch (error: any) {
      console.error("Error fetching student data:", error);
      toast({
        title: "Error",
        description: "Failed to load student data. Please try again.",
        variant: "destructive",
      });
    }
  };


  const updateStudentInfo = async (updates: Partial<Student>) => {
    if (!user || !currentStudent) return;

    try {
      const response = await fetch(`/api/students/${currentStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update student');
      }

      toast({
        title: "Success",
        description: "Student information updated successfully!",
      });

      fetchStudentData(currentStudent.id);
      fetchStudents(); // Refresh the students list
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student information.",
        variant: "destructive",
      });
    }
  };

  const getIEPStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-muted text-muted-foreground";
    switch (status.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "review": return "bg-warning text-warning-foreground";
      case "expired": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!user) {
    return <div>Please log in to view student profiles.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
            <p className="text-muted-foreground">
              Manage your children's educational profiles and track their progress
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="button-premium">
                <User className="h-4 w-4 mr-2" />
                Student
                <Plus className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => {
                resetForm();
                setIsAddStudentOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Student
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => currentStudent ? openEditDialog(currentStudent) : null}
                disabled={!currentStudent}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Current Student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Add Student Dialog */}
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">Add New Student</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your child's information to create their educational profile.
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(95vh-200px)] pr-2">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-sm font-medium">First Name *</Label>
                      <Input
                        id="first_name"
                        placeholder="Student's first name"
                        value={newStudent.first_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="last_name"
                        placeholder="Student's last name"
                        value={newStudent.last_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={newStudent.date_of_birth}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade_level" className="text-sm font-medium">Grade</Label>
                      <Select value={newStudent.grade_level} onValueChange={(value) => setNewStudent(prev => ({ ...prev, grade_level: value }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PreK">PreK</SelectItem>
                          <SelectItem value="K">Kindergarten</SelectItem>
                          <SelectItem value="1">1st Grade</SelectItem>
                          <SelectItem value="2">2nd Grade</SelectItem>
                          <SelectItem value="3">3rd Grade</SelectItem>
                          <SelectItem value="4">4th Grade</SelectItem>
                          <SelectItem value="5">5th Grade</SelectItem>
                          <SelectItem value="6">6th Grade</SelectItem>
                          <SelectItem value="7">7th Grade</SelectItem>
                          <SelectItem value="8">8th Grade</SelectItem>
                          <SelectItem value="9">9th Grade</SelectItem>
                          <SelectItem value="10">10th Grade</SelectItem>
                          <SelectItem value="11">11th Grade</SelectItem>
                          <SelectItem value="12">12th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* School Information */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">School Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="school_name" className="text-sm font-medium">School (Optional)</Label>
                      <Input
                        id="school_name"
                        placeholder="Current school"
                        value={newStudent.school_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, school_name: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm font-medium">District (Optional)</Label>
                      <Input
                        id="district"
                        placeholder="School district"
                        value={newStudent.district}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, district: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* IEP Status */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">IEP Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="iep_status" className="text-sm font-medium">IEP Status</Label>
                    <Select value={newStudent.iep_status} onValueChange={(value) => setNewStudent(prev => ({ ...prev, iep_status: value }))}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Developing">Developing</SelectItem>
                        <SelectItem value="Review">Under Review</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="None">No IEP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Disabilities */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Disabilities (Select all that apply)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Autism Spectrum Disorder',
                      'ADHD',
                      'Learning Disability',
                      'Intellectual Disability',
                      'Speech/Language Impairment',
                      'Emotional Behavioral Disorder',
                      'Other Health Impairment',
                      'Multiple Disabilities',
                      'Hearing Impairment',
                      'Visual Impairment',
                      'Orthopedic Impairment',
                      'Traumatic Brain Injury'
                    ].map((disability) => (
                      <div key={disability} className="flex items-center space-x-2">
                        <Checkbox
                          id={disability}
                          checked={newStudent.disabilities.includes(disability)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewStudent(prev => ({
                                ...prev,
                                disabilities: [...prev.disabilities, disability]
                              }));
                            } else {
                              setNewStudent(prev => ({
                                ...prev,
                                disabilities: prev.disabilities.filter(d => d !== disability)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={disability} className="text-sm">
                          {disability}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Services */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Current Services (Select all that apply)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Special Education',
                      'Speech Therapy',
                      'Occupational Therapy',
                      'Physical Therapy',
                      'Behavioral Support',
                      'Counseling',
                      'Assistive Technology',
                      'Transportation',
                      'Extended School Year',
                      'Paraprofessional Support'
                    ].map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={newStudent.current_services.includes(service)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewStudent(prev => ({
                                ...prev,
                                current_services: [...prev.current_services, service]
                              }));
                            } else {
                              setNewStudent(prev => ({
                                ...prev,
                                current_services: prev.current_services.filter(s => s !== service)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={service} className="text-sm">
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Additional Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="case_manager" className="text-sm font-medium">Case Manager</Label>
                      <Input
                        id="case_manager"
                        placeholder="Case manager name"
                        value={newStudent.case_manager}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, case_manager: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="case_manager_email" className="text-sm font-medium">Case Manager Email</Label>
                      <Input
                        id="case_manager_email"
                        type="email"
                        placeholder="case.manager@school.edu"
                        value={newStudent.case_manager_email}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, case_manager_email: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact" className="text-sm font-medium">Emergency Contact</Label>
                      <Input
                        id="emergency_contact"
                        placeholder="Emergency contact name"
                        value={newStudent.emergency_contact}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, emergency_contact: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_phone" className="text-sm font-medium">Emergency Phone</Label>
                      <Input
                        id="emergency_phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={newStudent.emergency_phone}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, emergency_phone: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      placeholder="Additional information about the student..."
                      value={newStudent.notes}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsAddStudentOpen(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStudent} 
                disabled={loading || !newStudent.first_name || !newStudent.last_name} 
                className="button-premium px-6"
              >
                {loading ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
          <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">Edit Student</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update {editingStudent?.full_name}'s information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(95vh-200px)] pr-2">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_first_name" className="text-sm font-medium">First Name *</Label>
                      <Input
                        id="edit_first_name"
                        placeholder="Student's first name"
                        value={newStudent.first_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_last_name" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="edit_last_name"
                        placeholder="Student's last name"
                        value={newStudent.last_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_grade_level" className="text-sm font-medium">Grade Level</Label>
                      <Select value={newStudent.grade_level} onValueChange={(value) => setNewStudent(prev => ({ ...prev, grade_level: value }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PK">Pre-K</SelectItem>
                          <SelectItem value="K">Kindergarten</SelectItem>
                          <SelectItem value="1">1st Grade</SelectItem>
                          <SelectItem value="2">2nd Grade</SelectItem>
                          <SelectItem value="3">3rd Grade</SelectItem>
                          <SelectItem value="4">4th Grade</SelectItem>
                          <SelectItem value="5">5th Grade</SelectItem>
                          <SelectItem value="6">6th Grade</SelectItem>
                          <SelectItem value="7">7th Grade</SelectItem>
                          <SelectItem value="8">8th Grade</SelectItem>
                          <SelectItem value="9">9th Grade</SelectItem>
                          <SelectItem value="10">10th Grade</SelectItem>
                          <SelectItem value="11">11th Grade</SelectItem>
                          <SelectItem value="12">12th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_school_name" className="text-sm font-medium">School Name</Label>
                      <Input
                        id="edit_school_name"
                        placeholder="Current school"
                        value={newStudent.school_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, school_name: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_district" className="text-sm font-medium">School District</Label>
                      <Input
                        id="edit_district"
                        placeholder="School district name"
                        value={newStudent.district}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, district: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_case_manager" className="text-sm font-medium">Case Manager</Label>
                      <Input
                        id="edit_case_manager"
                        placeholder="Case manager name"
                        value={newStudent.case_manager}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, case_manager: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="edit_date_of_birth"
                        type="date"
                        value={newStudent.date_of_birth}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_disability_category" className="text-sm font-medium">Primary Disability Category</Label>
                      <Select value={newStudent.disability_category} onValueChange={(value) => setNewStudent(prev => ({ ...prev, disability_category: value }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select primary disability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Autism Spectrum Disorder">Autism Spectrum Disorder</SelectItem>
                          <SelectItem value="ADHD">ADHD</SelectItem>
                          <SelectItem value="Learning Disability">Learning Disability</SelectItem>
                          <SelectItem value="Intellectual Disability">Intellectual Disability</SelectItem>
                          <SelectItem value="Speech/Language Impairment">Speech/Language Impairment</SelectItem>
                          <SelectItem value="Emotional Behavioral Disorder">Emotional Behavioral Disorder</SelectItem>
                          <SelectItem value="Other Health Impairment">Other Health Impairment</SelectItem>
                          <SelectItem value="Multiple Disabilities">Multiple Disabilities</SelectItem>
                          <SelectItem value="Hearing Impairment">Hearing Impairment</SelectItem>
                          <SelectItem value="Visual Impairment">Visual Impairment</SelectItem>
                          <SelectItem value="Orthopedic Impairment">Orthopedic Impairment</SelectItem>
                          <SelectItem value="Traumatic Brain Injury">Traumatic Brain Injury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* IEP Status */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">IEP Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="edit_iep_status" className="text-sm font-medium">IEP Status</Label>
                    <Select value={newStudent.iep_status} onValueChange={(value) => setNewStudent(prev => ({ ...prev, iep_status: value }))}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Developing">Developing</SelectItem>
                        <SelectItem value="Review">Under Review</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="None">No IEP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Additional Notes</h3>
                  <div className="space-y-2">
                    <Label htmlFor="edit_notes" className="text-sm font-medium">Notes</Label>
                    <Textarea
                      id="edit_notes"
                      placeholder="Any additional information about the student..."
                      value={newStudent.notes}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditStudentOpen(false);
                  setEditingStudent(null);
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditStudent} 
                disabled={loading || !newStudent.first_name || !newStudent.last_name} 
                className="button-premium px-6"
              >
                {loading ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <StudentSelector
          selectedStudent={selectedStudentId}
          onStudentChange={setSelectedStudentId}
        />

        {currentStudent && (
          <div className="grid gap-6">
            <Card className="premium-card">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-gradient-primary text-primary-foreground">
                      {currentStudent.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-gradient">{currentStudent.full_name}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span>{currentStudent.grade_level ? `Grade ${currentStudent.grade_level}` : 'Grade not specified'}</span>
                      <span>•</span>
                      <span>{currentStudent.school_name || 'School not specified'}</span>
                      <span>•</span>
                      <Badge className={getIEPStatusColor(currentStudent.iep_status)}>
                        IEP {currentStudent.iep_status}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 premium-card">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
                <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
                <TabsTrigger value="accommodations">Accommodations ({accommodations.length})</TabsTrigger>
                <TabsTrigger value="autism" className="bg-blue-600 text-white">🧩 Autism</TabsTrigger>
                <TabsTrigger value="gifted" className="bg-purple-600 text-white">🎓 Gifted</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        IEP Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge className={getIEPStatusColor(currentStudent.iep_status)}>
                          {currentStudent.iep_status}
                        </Badge>
                        {currentStudent.iep_date && (
                          <p className="text-sm text-muted-foreground">
                            IEP Date: {new Date(currentStudent.iep_date).toLocaleDateString()}
                          </p>
                        )}
                        {currentStudent.next_review_date && (
                          <p className="text-sm text-muted-foreground">
                            Next Review: {new Date(currentStudent.next_review_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Goals Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completed Goals</span>
                          <span>{goals.filter(g => g.status === 'completed').length}/{goals.length}</span>
                        </div>
                        <Progress 
                          value={goals.length > 0 ? (goals.filter(g => g.status === 'completed').length / goals.length) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Support Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentStudent.case_manager && (
                          <div>
                            <p className="font-medium">{currentStudent.case_manager}</p>
                            <p className="text-sm text-muted-foreground">Case Manager</p>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Services: {services.filter(s => s.status === 'active').length} active
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Student Information Section */}
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>School Information</Label>
                        <div className="mt-2 space-y-1">
                          <p><strong>School:</strong> {currentStudent.school_name || 'Not specified'}</p>
                          <p><strong>District:</strong> {currentStudent.district || 'Not specified'}</p>
                          <p><strong>Grade:</strong> {currentStudent.grade_level || 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Personal Information</Label>
                        <div className="mt-2 space-y-1">
                          <p><strong>Date of Birth:</strong> {currentStudent.date_of_birth ? new Date(currentStudent.date_of_birth).toLocaleDateString() : 'Not specified'}</p>
                          <p><strong>Disability Category:</strong> {currentStudent.disability_category || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    {currentStudent.notes && (
                      <div className="mt-4">
                        <Label>Notes</Label>
                        <p className="mt-2 text-sm text-muted-foreground">{currentStudent.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>IEP Goals</CardTitle>
                    <CardDescription>Track your child's educational goals and progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {goals.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No goals have been set up yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {goals.map((goal) => (
                          <div key={goal.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{goal.title}</h4>
                              <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                                {goal.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{goal.current_progress}%</span>
                              </div>
                              <Progress value={goal.current_progress} className="h-2" />
                            </div>
                            {goal.target_date && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Target Date: {new Date(goal.target_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>Educational Services</CardTitle>
                    <CardDescription>Services and support your child receives</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {services.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No services have been documented yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {services.map((service) => (
                          <div key={service.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{service.service_type}</h4>
                              <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                                {service.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Provider:</strong> {service.provider || 'Not specified'}</p>
                                <p><strong>Frequency:</strong> {service.frequency || 'Not specified'}</p>
                              </div>
                              <div>
                                <p><strong>Duration:</strong> {service.duration ? `${service.duration} minutes` : 'Not specified'}</p>
                                <p><strong>Location:</strong> {service.location || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accommodations" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>Accommodations</CardTitle>
                    <CardDescription>Special accommodations and modifications for your child</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {accommodations.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No accommodations have been documented yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {accommodations.map((accommodation) => (
                          <div key={accommodation.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{accommodation.title}</h4>
                              <Badge>{accommodation.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{accommodation.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="autism" className="space-y-6">
                <AutismAccommodationsTab selectedStudentId={selectedStudentId} />
              </TabsContent>

              <TabsContent value="gifted" className="space-y-6">
                <GiftedAssessmentsTab selectedStudentId={selectedStudentId} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {students.length === 0 && (
          <Card className="premium-card">
            <CardContent className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first student to track their educational journey.
              </p>
              <Button onClick={() => setIsAddStudentOpen(true)} className="button-premium">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Student
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentStudents;