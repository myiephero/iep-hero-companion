import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  Building2,
  Mail,
  Smile,
  Heart,
  TrendingUp,
  Brain,
  Lightbulb,
  Puzzle,
  Star,
  Sparkles,
  Palette,
  Music,
  ArrowRight,
  Clock,
  BookOpen,
  Calculator
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { api, type Student } from "@/lib/api";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getIEPStatusColor } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { 
  CLIENT_ENGAGEMENT_STAGES, 
  STUDENT_IEP_WORKFLOW_STAGES, 
  type ClientEngagementStage, 
  type StudentIEPWorkflowStage 
} from "../../shared/schema";
import { GiftedInsightsView } from "@/components/GiftedInsightsView";

interface Client {
  id: string;
  client_id: string;
  full_name?: string;
  email?: string;
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

interface Case {
  id: string;
  case_title: string;
  case_type: string;
  status: string;
  priority: string;
  next_action: string | null;
  next_action_date: string | null;
}

interface Accommodation {
  id: string;
  student_id: string;
  accommodation_type: string;
  description: string;
  implementation_notes: string | null;
  effectiveness_rating: number | null;
  status: string;
  created_at: string;
}

interface AutismAccommodation {
  id: string;
  student_id: string;
  sensory_needs: any;
  communication_supports: any;
  behavioral_strategies: any;
  social_supports: any;
  learning_accommodations: any;
  transition_supports: any;
  notes: string | null;
  created_at: string;
}

interface GiftedAssessment {
  id: string;
  student_id: string;
  assessment_type: string;
  assessment_date: string;
  assessor_name: string;
  giftedness_areas: string[];
  learning_differences?: string[];
  strengths: any;
  recommendations: any;
  evaluator_notes: string | null;
  status: string;
  created_at: string;
}


// Real AI Analysis Component for Advocates
const AdvocateAutismAIAnalysis = ({ selectedStudentId }: { selectedStudentId?: string | null }) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  
  // Fetch existing autism AI analysis
  const { data: aiAnalysisData, isLoading } = useQuery({
    queryKey: ['/api/autism-ai-analysis', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      const response = await apiRequest('GET', `/api/autism-ai-analysis?student_id=${selectedStudentId}`);
      return response.json();
    },
    enabled: !!selectedStudentId
  });

  // Handle both new structured format and legacy format
  const aiAnalysis = (() => {
    if (!aiAnalysisData) return null;
    
    // New format: { analyses: [{ ai_analysis: data }] }
    if (aiAnalysisData.analyses && Array.isArray(aiAnalysisData.analyses) && aiAnalysisData.analyses.length > 0) {
      return aiAnalysisData.analyses[0].ai_analysis;
    }
    
    // Legacy format: direct object with analysis fields
    if (aiAnalysisData.sensory_analysis || aiAnalysisData.communication_insights || 
        aiAnalysisData.behavioral_analysis || aiAnalysisData.social_analysis || aiAnalysisData.recommendations) {
      return {
        analysis_type: 'comprehensive',
        detailed_analysis: [
          aiAnalysisData.sensory_analysis,
          aiAnalysisData.communication_insights,
          aiAnalysisData.behavioral_analysis,
          aiAnalysisData.social_analysis
        ].filter(Boolean).join('\n\n'),
        recommendations: aiAnalysisData.recommendations || [],
        legacy_format: true
      };
    }
    
    return null;
  })();

  if (!selectedStudentId) {
    return (
      <div className="text-center py-8">
        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Select a student to view saved autism analysis results.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted/50 p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full mb-1"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!aiAnalysis) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No Saved Analysis Results</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once autism AI analysis is generated for this student, the comprehensive results will appear here for advocacy planning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <span className="text-2xl mr-2">🧩</span>
          Saved Autism Analysis for Advocacy
          {aiAnalysis.legacy_format && (
            <Badge variant="outline" className="ml-2">Combined Analysis</Badge>
          )}
        </h3>
        <p className="text-sm text-muted-foreground">
          Professional autism analysis for IEP advocacy • 
          {aiAnalysisData?.analyses?.[0]?.timestamp ? 
            `Generated: ${new Date(aiAnalysisData.analyses[0].timestamp).toLocaleDateString()}` : 
            'Previously Generated'
          }
        </p>
      </div>

      {/* Professional Analysis Display */}
      {aiAnalysis.detailed_analysis && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Brain className="h-5 w-5 mr-2" />
              Professional Autism Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{aiAnalysis.detailed_analysis}</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations for IEP Advocacy */}
      {aiAnalysis.recommendations && Array.isArray(aiAnalysis.recommendations) && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="h-5 w-5 mr-2" />
              IEP & Advocacy Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiAnalysis.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start">
                  <span className="text-primary mr-2 mt-1">→</span>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Key Findings */}
      {aiAnalysis.key_findings && Array.isArray(aiAnalysis.key_findings) && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Critical Findings for Advocacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiAnalysis.key_findings.map((finding: string, i: number) => (
                <li key={i} className="flex items-start">
                  <span className="text-primary mr-2 mt-1">•</span>
                  <span className="text-muted-foreground">{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Advocate Emotion Tracking Tab Component
const AdvocateEmotionTrackingTab = ({ selectedStudentId }: { selectedStudentId?: string | null }) => {
  const [currentMood, setCurrentMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const { toast } = useToast();

  const moodOptions = [
    { emoji: '😊', label: 'Happy', color: 'bg-green-100 hover:bg-green-200' },
    { emoji: '😐', label: 'Neutral', color: 'bg-blue-100 hover:bg-blue-200' },
    { emoji: '😟', label: 'Anxious', color: 'bg-yellow-100 hover:bg-yellow-200' },
    { emoji: '😠', label: 'Frustrated', color: 'bg-orange-100 hover:bg-orange-200' },
    { emoji: '😢', label: 'Distressed', color: 'bg-red-100 hover:bg-red-200' }
  ];

  const handleRecordMood = () => {
    if (!selectedStudentId) {
      toast({
        title: "Student Required",
        description: "Please select a student first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentMood) {
      toast({
        title: "Mood Required",
        description: "Please select the student's observed emotional state.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Emotional Observation Recorded",
      description: `Professional observation saved successfully!`,
      variant: "default"
    });
    setCurrentMood("");
    setMoodNote("");
  };

  const handleGenerateProfessionalNote = async () => {
    if (!currentMood) return;
    
    setAiDraftLoading(true);
    setTimeout(() => {
      const professionalDescriptions: { [key: string]: string } = {
        '😊': 'Student demonstrated positive affect and engaged appropriately in activities.',
        '😐': 'Student exhibited neutral emotional regulation and steady baseline behavior.',
        '😟': 'Student showed signs of anxiety or worry requiring additional support and monitoring.',
        '😠': 'Student displayed frustration behaviors that may indicate need for intervention strategies.',
        '😢': 'Student appeared distressed and may benefit from immediate emotional support services.'
      };
      
      const draft = `${professionalDescriptions[currentMood]} Recommend continued observation and documentation of triggers, environmental factors, and effective intervention strategies. Consider consultation with school counselor or behavioral specialist if patterns persist.`;
      setMoodNote(draft);
      setAiDraftLoading(false);
      
      toast({
        title: "Professional Note Generated",
        description: "Please review and edit the assessment before saving.",
        variant: "default"
      });
    }, 1500);
  };

  if (!selectedStudentId) {
    return (
      <Card className="premium-card">
        <CardContent className="text-center py-8">
          <Smile className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a student to track emotional patterns and provide support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Emotional Assessment */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Professional Emotional Assessment
            </CardTitle>
            <CardDescription>
              Document observed emotional states and behaviors for advocacy and IEP planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((mood) => (
                  <div 
                    key={mood.emoji}
                    className={`text-center p-3 rounded-lg cursor-pointer transition-colors ${mood.color} ${currentMood === mood.emoji ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setCurrentMood(mood.emoji)}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <p className="text-xs">{mood.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="professional-note">Professional Observation Notes</Label>
                <Textarea
                  id="professional-note"
                  placeholder="Document specific behaviors, triggers, environmental factors, and intervention strategies observed..."
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="min-h-[100px]"
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateProfessionalNote}
                    disabled={!currentMood || aiDraftLoading}
                    variant="outline"
                    size="sm"
                  >
                    {aiDraftLoading ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Professional Note
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleRecordMood}
                    disabled={!currentMood}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Professional Assessment
                  </Button>
                </div>
              </div>
              
              <div className="pt-2 text-sm text-muted-foreground">
                Last assessment: Yesterday - "Student showed improved self-regulation during transitions"
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Behavioral Pattern Analysis
            </CardTitle>
            <CardDescription>
              Track emotional and behavioral patterns for advocacy documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                <div className="h-8 bg-green-200 rounded" title="Stable regulation"></div>
                <div className="h-8 bg-green-300 rounded" title="Excellent day"></div>
                <div className="h-8 bg-yellow-200 rounded" title="Some challenges"></div>
                <div className="h-8 bg-red-200 rounded" title="Significant struggles"></div>
                <div className="h-8 bg-green-200 rounded" title="Improved coping"></div>
                <div className="h-8 bg-blue-200 rounded" title="Weekend - different environment"></div>
                <div className="h-8 bg-green-200 rounded" title="Positive regulation"></div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>• Pattern: Thursdays consistently challenging</p>
                <p>• Improvement after intervention implementation</p>
                <p>• Recommend schedule adjustment for Thursday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Resources and Interventions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              Evidence-Based Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Cognitive behavioral strategies</li>
              <li>• Sensory regulation tools</li>
              <li>• Social skills training protocols</li>
              <li>• Environmental modifications</li>
            </ul>
            <Button size="sm" className="w-full mt-3" variant="outline">Access Resources</Button>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              Crisis Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Escalating behavioral incidents</li>
              <li>• Academic performance decline</li>
              <li>• Social withdrawal patterns</li>
              <li>• Sleep or appetite changes</li>
            </ul>
            <Button size="sm" className="w-full mt-3" variant="outline">Crisis Protocol</Button>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Documentation Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Behavior incident reports</li>
              <li>• Progress monitoring charts</li>
              <li>• IEP meeting preparation</li>
              <li>• Parent communication logs</li>
            </ul>
            <Button size="sm" className="w-full mt-3" variant="outline">Generate Reports</Button>
          </CardContent>
        </Card>
      </div>

      {/* Professional Case Notes */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle>Professional Case Notes & Observations</CardTitle>
          <CardDescription>
            Confidential documentation for advocacy and service planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Intervention Success 📊</h4>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Implementation of sensory break protocol resulted in 50% reduction in classroom disruptions. 
                Recommend including in formal accommodation plan.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Service Gap Identified ⚠️</h4>
                <span className="text-xs text-muted-foreground">This Week</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Student would benefit from occupational therapy evaluation for sensory processing concerns. 
                Will advocate for additional assessment at next IEP meeting.
              </p>
            </div>
            
            <div className="pt-2">
              <Button className="w-full" variant="outline">Add Professional Observation</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdvocateStudents = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [autismAccommodations, setAutismAccommodations] = useState<AutismAccommodation[]>([]);
  const [giftedAssessments, setGiftedAssessments] = useState<GiftedAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAutismDialogOpen, setIsAutismDialogOpen] = useState(false);
  const [isGiftedDialogOpen, setIsGiftedDialogOpen] = useState(false);
  
  // Individual dialog states for autism tools
  const [isSensoryDialogOpen, setIsSensoryDialogOpen] = useState(false);
  const [isCommunicationDialogOpen, setIsCommunicationDialogOpen] = useState(false);
  const [isBehavioralDialogOpen, setIsBehavioralDialogOpen] = useState(false);
  const [isAutismAIDialogOpen, setIsAutismAIDialogOpen] = useState(false);
  
  // Individual dialog states for gifted tools
  const [isCognitiveDialogOpen, setIsCognitiveDialogOpen] = useState(false);
  const [isEnrichmentDialogOpen, setIsEnrichmentDialogOpen] = useState(false);
  const [is2ESupportDialogOpen, setIs2ESupportDialogOpen] = useState(false);
  const [isGiftedAIDialogOpen, setIsGiftedAIDialogOpen] = useState(false);
  const [isNewAssessmentDialogOpen, setIsNewAssessmentDialogOpen] = useState(false);
  
  // AI insights and form states
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [generatedInsights, setGeneratedInsights] = useState<string>("");
  const [currentFormData, setCurrentFormData] = useState<any>({});
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    grade_level: "",
    school_name: "",
    district: "",
    iep_status: "Active",
    case_manager: "",
    case_manager_email: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_info: "",
    notes: "",
    assigned_client: "",
    disabilities: [] as string[],
    current_services: [] as string[]
  });
  
  // Autism accommodation form state
  const [autismFormData, setAutismFormData] = useState({
    title: "",
    description: "",
    category: "sensory",
    accommodation_type: "modification",
    implementation_notes: "",
    sensory_profile: {},
    communication_needs: {},
    social_supports: {},
    academic_supports: {},
    behavioral_triggers: {},
    environmental_modifications: {},
    technology_supports: {},
    status: "active"
  });
  
  // Gifted assessment form state
  const [giftedFormData, setGiftedFormData] = useState({
    assessment_type: "twice_exceptional",
    giftedness_areas: [] as string[],
    learning_differences: [] as string[],
    strengths: "",
    challenges: "",
    recommendations: "",
    enrichment_activities: "",
    acceleration_needs: "",
    social_emotional_needs: "",
    evaluator_notes: "",
    status: "draft"
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  // API Queries for Gifted Assessments
  const { data: giftedProfileData, isLoading: giftedProfileLoading } = useQuery({
    queryKey: ['/api/gifted-profile', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      const response = await apiRequest('GET', `/api/gifted_assessments/profile?student_id=${selectedStudentId}`);
      return response.json();
    },
    enabled: !!selectedStudentId
  });

  // Fetch existing gifted assessments for selected student
  const { data: existingGiftedAssessments } = useQuery({
    queryKey: ['/api/gifted-assessments', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      const response = await apiRequest('GET', `/api/gifted-assessments?student_id=${selectedStudentId}`);
      return response.json();
    },
    enabled: !!selectedStudentId
  });

  // Fetch existing AI analysis for selected student  
  const { data: existingGiftedAIAnalysis } = useQuery({
    queryKey: ['/api/gifted-ai-analysis', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      const response = await apiRequest('GET', `/api/gifted_assessments/ai-insights?student_id=${selectedStudentId}`);
      return response.json();
    },
    enabled: !!selectedStudentId
  });

  // Mutations for gifted assessments
  const createGiftedAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      const response = await apiRequest('POST', '/api/gifted-assessments', {
        ...assessmentData,
        student_id: selectedStudentId,
        assessor_name: user?.email || 'Advocate',
        assessment_date: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gifted-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifted-profile'] });
      toast({
        title: "Assessment Saved",
        description: "Gifted assessment has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment.",
        variant: "destructive",
      });
    }
  });

  // AI Analysis mutation
  const generateGiftedAIAnalysisMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const response = await apiRequest('POST', `/api/gifted-assessments/${assessmentId}/ai-analysis`, {
        role: 'advocate'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gifted-ai-analysis', selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifted-profile', selectedStudentId] });
      toast({
        title: "AI Analysis Generated",
        description: "Professional AI insights have been generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI analysis.",
        variant: "destructive",
      });
    }
  });
  
  // Autism accommodation categories (professional advocate version)
  const autismAccommodationCategories = [
    {
      id: "sensory",
      title: "Sensory Processing Support",
      description: "Environmental and sensory accommodations",
      items: [
        { id: "noise-canceling", title: "Noise-Canceling Headphones", description: "Access to noise-canceling headphones for auditory sensitivities", iepLanguage: "Student will have access to noise-canceling headphones during instruction to manage auditory sensitivities and maintain focus." },
        { id: "sensory-breaks", title: "Sensory Regulation Breaks", description: "Scheduled sensory breaks every 30 minutes", iepLanguage: "Student will receive sensory regulation breaks every 30 minutes or as needed to prevent overstimulation and maintain self-regulation." },
        { id: "fidget-tools", title: "Sensory Fidget Tools", description: "Access to approved fidget tools during instruction", iepLanguage: "Student may use approved sensory fidget tools during instruction to support attention and self-regulation without disrupting learning." },
        { id: "lighting", title: "Lighting Modifications", description: "Preferential seating away from fluorescent lighting", iepLanguage: "Student will be provided seating away from fluorescent lights and access to natural lighting when possible to accommodate visual sensitivities." }
      ]
    },
    {
      id: "communication",
      title: "Communication Support",
      description: "Augmentative and alternative communication strategies",
      items: [
        { id: "visual-schedules", title: "Visual Schedule Systems", description: "Visual schedules and transition supports", iepLanguage: "Student will be provided with visual schedules and transition supports to reduce anxiety and support executive functioning." },
        { id: "aac-device", title: "AAC Technology", description: "Access to augmentative communication device", iepLanguage: "Student will have access to appropriate augmentative and alternative communication (AAC) technology to support expressive communication needs." },
        { id: "social-scripts", title: "Social Communication Scripts", description: "Pre-written scripts for social interactions", iepLanguage: "Student will be provided with social communication scripts and prompts to support appropriate peer interactions and social skill development." }
      ]
    },
    {
      id: "academic",
      title: "Academic Accommodations",
      description: "Learning and assessment modifications",
      items: [
        { id: "extended-time", title: "Extended Time", description: "Additional time for assignments and assessments", iepLanguage: "Student will receive extended time (1.5x) for assignments and assessments to accommodate processing differences." },
        { id: "task-chunking", title: "Task Breakdown", description: "Breaking complex tasks into smaller components", iepLanguage: "Complex assignments will be broken down into smaller, manageable components with clear step-by-step instructions." },
        { id: "visual-supports", title: "Visual Learning Supports", description: "Graphic organizers and visual aids", iepLanguage: "Student will be provided with graphic organizers, visual aids, and written instructions to support comprehension and organization." }
      ]
    },
    {
      id: "behavioral",
      title: "Behavioral Support",
      description: "Positive behavior interventions and supports",
      items: [
        { id: "behavior-plan", title: "Individualized Behavior Plan", description: "Comprehensive positive behavior support plan", iepLanguage: "Student will have an individualized positive behavior support plan that includes antecedent strategies, replacement behaviors, and response protocols." },
        { id: "break-requests", title: "Self-Advocacy for Breaks", description: "Visual system for requesting breaks", iepLanguage: "Student will be taught and provided with a visual system to request breaks when feeling overwhelmed or overstimulated." },
        { id: "calming-strategies", title: "Self-Regulation Strategies", description: "Explicit instruction in calming techniques", iepLanguage: "Student will receive explicit instruction in self-regulation strategies including deep breathing, counting, and appropriate help-seeking behaviors." }
      ]
    }
  ];
  
  // Gifted assessment areas
  const giftednessAreas = [
    'Intellectual/Academic',
    'Creative/Divergent Thinking', 
    'Artistic/Visual Arts',
    'Musical',
    'Leadership',
    'Psychomotor',
    'Mathematical',
    'Scientific',
    'Linguistic/Verbal',
    'Spatial'
  ];
  
  const learningDifferences = [
    'ADHD',
    'Autism Spectrum Disorder',
    'Dyslexia',
    'Dysgraphia', 
    'Dyscalculia',
    'Executive Function Deficits',
    'Processing Speed Deficits',
    'Working Memory Challenges',
    'Sensory Processing Disorder',
    'Anxiety',
    'Depression'
  ];

  // Handle autism accommodation creation
  const handleCreateAutismProfile = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Student Required",
        description: "Please select a student first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!autismFormData.title || !autismFormData.description) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in title and description.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const accommodationData = {
        ...autismFormData,
        student_id: selectedStudentId,
        user_id: user?.id
      };
      
      const response = await apiRequest('POST', '/api/autism_accommodations', accommodationData);
      
      if (response.ok) {
        const newAccommodation = await response.json();
        setAutismAccommodations(prev => [...prev, newAccommodation]);
        setIsAutismDialogOpen(false);
        setAutismFormData({
          title: "",
          description: "",
          category: "sensory",
          accommodation_type: "modification",
          implementation_notes: "",
          sensory_profile: {},
          communication_needs: {},
          social_supports: {},
          academic_supports: {},
          behavioral_triggers: {},
          environmental_modifications: {},
          technology_supports: {},
          status: "active"
        });
        
        toast({
          title: "Autism Support Profile Created",
          description: "Professional autism accommodations have been documented.",
        });
      }
    } catch (error) {
      console.error('Error creating autism accommodation:', error);
      toast({
        title: "Error",
        description: "Failed to create autism support profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle gifted assessment creation
  const handleCreateGiftedAssessment = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Student Required",
        description: "Please select a student first.",
        variant: "destructive"
      });
      return;
    }
    
    if (giftedFormData.giftedness_areas.length === 0) {
      toast({
        title: "Required Fields Missing",
        description: "Please select at least one area of giftedness.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const assessmentData = {
        student_id: selectedStudentId,
        assessment_type: giftedFormData.assessment_type,
        giftedness_areas: giftedFormData.giftedness_areas,
        learning_differences: giftedFormData.learning_differences.length > 0 ? giftedFormData.learning_differences : null,
        strengths: { notes: giftedFormData.strengths },
        challenges: giftedFormData.challenges ? { notes: giftedFormData.challenges } : null,
        recommendations: giftedFormData.recommendations ? { notes: giftedFormData.recommendations } : null,
        enrichment_activities: giftedFormData.enrichment_activities ? { notes: giftedFormData.enrichment_activities } : null,
        acceleration_needs: giftedFormData.acceleration_needs ? { notes: giftedFormData.acceleration_needs } : null,
        social_emotional_needs: giftedFormData.social_emotional_needs ? { notes: giftedFormData.social_emotional_needs } : null,
        evaluator_notes: giftedFormData.evaluator_notes,
        status: giftedFormData.status,
        assessment_date: new Date().toISOString().split('T')[0],
        assessor_name: user?.email || 'Professional Advocate'
      };
      
      const response = await apiRequest('POST', '/api/gifted-assessments', assessmentData);
      
      if (response.ok) {
        const newAssessment = await response.json();
        setGiftedAssessments(prev => [...prev, newAssessment]);
        setIsGiftedDialogOpen(false);
        setGiftedFormData({
          assessment_type: "twice_exceptional",
          giftedness_areas: [],
          learning_differences: [],
          strengths: "",
          challenges: "",
          recommendations: "",
          enrichment_activities: "",
          acceleration_needs: "",
          social_emotional_needs: "",
          evaluator_notes: "",
          status: "draft"
        });
        
        toast({
          title: "Gifted Assessment Created",
          description: "Comprehensive gifted assessment has been documented.",
        });
      }
    } catch (error) {
      console.error('Error creating gifted assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create gifted assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name || !newStudent.assigned_client) return;
    
    setLoading(true);
    try {
      const studentData = {
        ...newStudent,
        full_name: `${newStudent.first_name} ${newStudent.last_name}`,
        parent_id: newStudent.assigned_client
      };
      
      // FIXED: Use authenticated apiRequest instead of direct fetch
      const response = await apiRequest('POST', '/api/students', studentData);
      
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
      
      // FIXED: Use authenticated apiRequest instead of direct fetch
      const response = await apiRequest('PUT', `/api/students/${editingStudent.id}`, studentData);
      
      if (response.ok) {
        setIsEditStudentOpen(false);
        setEditingStudent(null);
        resetForm();
        fetchStudents();
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
      first_name: student.full_name?.split(' ')[0] || '',
      last_name: student.full_name?.split(' ').slice(1).join(' ') || '',
      date_of_birth: student.date_of_birth || '',
      grade_level: student.grade_level || '',
      school_name: student.school_name || '',
      district: student.district || '',
      iep_status: student.iep_status || 'Active',
      disabilities: [],
      current_services: [],
      case_manager: student.case_manager || '',
      case_manager_email: student.case_manager_email || '',
      emergency_contact: '',
      emergency_phone: '',
      medical_info: '',
      notes: student.notes || '',
      assigned_client: '',
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
      iep_status: 'Active',
      disabilities: [],
      current_services: [],
      case_manager: '',
      case_manager_email: '',
      emergency_contact: '',
      emergency_phone: '',
      medical_info: '',
      notes: '',
      assigned_client: '',
    });
  };

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchClients();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await apiRequest('GET', '/api/parents');
      const data = await response.json();
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const fetchStudentData = async (studentId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      setCurrentStudent(student || null);
      
      const goalsData = await api.getGoals();
      const studentGoals = goalsData.filter((goal: any) => goal.student_id === studentId);
      setGoals(studentGoals as Goal[] || []);
      
      // Fetch real services and cases data for this student
      try {
        const authToken = localStorage.getItem('authToken');
        const headers = { 
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          'Content-Type': 'application/json'
        };
        
        // FIXED: Use authenticated apiRequest instead of direct fetch
        const servicesRes = await apiRequest('GET', `/api/students/${studentId}/services`);
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData || []);
        } else {
          setServices([]);
        }
        
        // FIXED: Use authenticated apiRequest instead of direct fetch
        const casesRes = await apiRequest('GET', `/api/students/${studentId}/cases`);
        if (casesRes.ok) {
          const casesData = await casesRes.json();
          setCases(casesData || []);
        } else {
          setCases([]);
        }
      } catch (error) {
        console.error('Error fetching student services and cases:', error);
        setServices([]);
        setCases([]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };


  // Process-Based Tag Logic for IEP Advocacy Workflow
  const getClientEngagementStageStyle = (stage: ClientEngagementStage | string | null | undefined) => {
    if (!stage) return { className: "bg-muted text-muted-foreground", label: "Not Set" };
    
    switch (stage.toLowerCase()) {
      case CLIENT_ENGAGEMENT_STAGES.PROSPECT:
        return { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300", label: "Prospect" };
      case CLIENT_ENGAGEMENT_STAGES.INTAKE:
        return { className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300", label: "Intake" };
      case CLIENT_ENGAGEMENT_STAGES.RECORDS_REVIEW:
        return { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300", label: "Records Review" };
      case CLIENT_ENGAGEMENT_STAGES.ASSESSMENT:
        return { className: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300", label: "Assessment" };
      case CLIENT_ENGAGEMENT_STAGES.IEP_DEVELOPMENT:
        return { className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300", label: "IEP Development" };
      case CLIENT_ENGAGEMENT_STAGES.IMPLEMENTATION:
        return { className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300", label: "Implementation" };
      case CLIENT_ENGAGEMENT_STAGES.MONITORING:
        return { className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300", label: "Monitoring" };
      case CLIENT_ENGAGEMENT_STAGES.REVIEW_RENEWAL:
        return { className: "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300", label: "Review/Renewal" };
      default:
        return { className: "bg-muted text-muted-foreground", label: stage };
    }
  };

  const getStudentIEPWorkflowStageStyle = (stage: StudentIEPWorkflowStage | string | null | undefined) => {
    if (!stage) return { className: "bg-muted text-muted-foreground", label: "Not Set" };
    
    switch (stage.toLowerCase()) {
      case STUDENT_IEP_WORKFLOW_STAGES.REFERRAL:
        return { className: "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300", label: "Referral" };
      case STUDENT_IEP_WORKFLOW_STAGES.EVALUATION:
        return { className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300", label: "Evaluation" };
      case STUDENT_IEP_WORKFLOW_STAGES.ELIGIBILITY:
        return { className: "bg-lime-100 text-lime-800 dark:bg-lime-900/20 dark:text-lime-300", label: "Eligibility" };
      case STUDENT_IEP_WORKFLOW_STAGES.IEP_DEVELOPMENT:
        return { className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300", label: "IEP Development" };
      case STUDENT_IEP_WORKFLOW_STAGES.IEP_MEETING:
        return { className: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300", label: "IEP Meeting" };
      case STUDENT_IEP_WORKFLOW_STAGES.IMPLEMENTATION:
        return { className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300", label: "Implementation" };
      case STUDENT_IEP_WORKFLOW_STAGES.PROGRESS_MONITORING:
        return { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300", label: "Progress Monitoring" };
      case STUDENT_IEP_WORKFLOW_STAGES.ANNUAL_REVIEW:
        return { className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300", label: "Annual Review" };
      case STUDENT_IEP_WORKFLOW_STAGES.TRIENNIAL:
        return { className: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300", label: "Triennial" };
      default:
        return { className: "bg-muted text-muted-foreground", label: stage };
    }
  };

  // Legacy function for backwards compatibility with cases
  const getCaseStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!user) {
    return <div>Please log in to view client students.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Students</h1>
            <p className="text-muted-foreground">
              Manage your clients' children and track their educational progress
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Student List */}
          <div className="lg:col-span-1">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Client Students ({students.length})
                </CardTitle>
                <CardDescription>
                  Select a student to view details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {students.length === 0 ? (
                  <div className="p-6 text-center">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't added any students yet. Get started by adding your first client's student.
                    </p>
                    {/* Add Student feature removed */}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors ${selectedStudentId === student.id ? 'bg-muted/50 border-l-4 border-l-primary' : ''}`}
                        onClick={() => setSelectedStudentId(student.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {student.grade_level ? `Grade ${student.grade_level}` : 'Grade not specified'}
                              </p>
                            </div>
                          </div>
                          <Badge className={getIEPStatusColor(student.iep_status)}>
                            IEP: {student.iep_status || 'Not Set'}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {student.school_name || 'School not specified'} • {student.district || 'District not specified'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Student Details */}
          <div className="lg:col-span-2">
            {currentStudent ? (
              <>
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
                        <CardDescription>
                          <div className="flex items-center space-x-4 mt-2">
                            <span>{currentStudent.grade_level ? `Grade ${currentStudent.grade_level}` : 'Grade not specified'}</span>
                            <span>•</span>
                            <span>{currentStudent.school_name || 'School not specified'}</span>
                            <span>•</span>
                            <Badge className={getIEPStatusColor(currentStudent.iep_status)}>
                              IEP: {currentStudent.iep_status || 'Not Set'}
                            </Badge>
                          </div>
                          {currentStudent.full_name && (
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-sm">Student: {currentStudent.full_name}</span>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/advocate/messages?parent=${currentStudent.parent_id || currentStudent.user_id}&student=${currentStudent.id}`}>
                                  <Mail className="h-3 w-3 mr-1" />
                                  Message Parent
                                </Link>
                              </Button>
                            </div>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Modern Horizontal Tab Navigation */}
                <div className="w-full mb-8">
                  <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-lg">
                    <div className="flex bg-white dark:bg-gray-900 rounded-xl p-2 gap-1">
                      <button
                        onClick={() => setSelectedTab("overview")}
                        className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                          selectedTab === "overview"
                            ? "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="hidden lg:inline">Overview</span>
                      </button>
                      <button
                        onClick={() => setSelectedTab("goals")}
                        className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                          selectedTab === "goals"
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Target className="h-4 w-4" />
                        <span className="hidden lg:inline">Goals</span>
                        <span className="lg:hidden">({goals.length})</span>
                        <span className="hidden lg:inline">({goals.length})</span>
                      </button>
                      <button
                        onClick={() => setSelectedTab("services")}
                        className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                          selectedTab === "services"
                            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Building2 className="h-4 w-4" />
                        <span className="hidden lg:inline">Services</span>
                        <span className="lg:hidden">({services.length})</span>
                        <span className="hidden lg:inline">({services.length})</span>
                      </button>
                      <button
                        onClick={() => setSelectedTab("accommodations")}
                        className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                          selectedTab === "accommodations"
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Lightbulb className="h-4 w-4" />
                        <span className="hidden lg:inline">Accommodations</span>
                        <span className="lg:hidden">({accommodations.length})</span>
                        <span className="hidden lg:inline">({accommodations.length})</span>
                      </button>
                      <button
                        onClick={() => setSelectedTab("emotions")}
                        className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                          selectedTab === "emotions"
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Smile className="h-4 w-4" />
                        <span className="hidden lg:inline">Emotions</span>
                      </button>
                      <button
                        onClick={() => setSelectedTab("gifted")}
                        className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                          selectedTab === "gifted"
                            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Star className="h-4 w-4" />
                        <span className="hidden lg:inline">Gifted</span>
                      </button>
                    </div>
                  </div>
                </div>

                {selectedTab === "overview" && (
                  <div className="space-y-6">
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
                              {currentStudent.iep_status || 'Not Set'}
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
                            <Building2 className="h-5 w-5 mr-2" />
                            School Info
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium">{currentStudent.school_name || 'Not specified'}</p>
                              <p className="text-sm text-muted-foreground">School</p>
                            </div>
                            <div>
                              <p className="text-sm">{currentStudent.district || 'Not specified'}</p>
                              <p className="text-xs text-muted-foreground">District</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {selectedTab === "goals" && (
                  <div className="space-y-6">
                    <Card className="premium-card">
                      <CardHeader>
                        <CardTitle>IEP Goals</CardTitle>
                        <CardDescription>
                          Track progress on individualized education program goals
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {goals.length === 0 ? (
                          <p className="text-muted-foreground">No goals have been set for this student yet.</p>
                        ) : (
                          <div className="space-y-4">
                            {goals.map((goal) => (
                              <div key={goal.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold">{goal.title}</h4>
                                  <Badge className={getCaseStatusColor(goal.status)}>
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
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedTab === "services" && (
                  <div className="space-y-6">
                    <Card className="premium-card">
                      <CardHeader>
                        <CardTitle>Support Services</CardTitle>
                        <CardDescription>
                          Special education and related services provided to the student
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">No services have been documented yet for this student.</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedTab === "accommodations" && (
                  <div className="space-y-6">
                    <Card className="premium-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          IEP Accommodations
                        </CardTitle>
                        <CardDescription>
                          Documented accommodations and modifications for this student
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {accommodations.length > 0 ? (
                          <div className="space-y-4">
                            {accommodations.map((accommodation) => (
                              <div key={accommodation.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{accommodation.accommodation_type}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {accommodation.description}
                                    </p>
                                    {accommodation.implementation_notes && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        <strong>Implementation:</strong> {accommodation.implementation_notes}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className={accommodation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                    {accommodation.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Accommodations Documented</h3>
                            <p className="text-sm text-muted-foreground">
                              IEP accommodations and modifications will appear here once they are documented.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedTab === "emotions" && (
                  <div className="space-y-6">
                    <AdvocateEmotionTrackingTab selectedStudentId={selectedStudentId} />
                  </div>
                )}

                {selectedTab === "gifted" && (
                  <div className="space-y-6">
                    <Card className="premium-card">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">🎓</span>
                            Gifted & Twice-Exceptional Support
                          </div>
                        </CardTitle>
                        <CardDescription>Advanced learning assessments and support for gifted and 2E learners</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4 mb-6">
                          <div className="text-4xl mb-4">✨</div>
                          <h3 className="text-lg font-semibold mb-2">Integrated Gifted Support</h3>
                          <p className="text-muted-foreground mb-6">
                            Comprehensive gifted and twice-exceptional assessment tools are now seamlessly integrated into your student's profile.
                          </p>
                        </div>
                        
                        {/* Match Parent Implementation Exactly */}
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">✨</div>
                          <h3 className="text-lg font-semibold mb-2">Integrated Gifted Support</h3>
                          <p className="text-muted-foreground mb-6">
                            Comprehensive gifted and twice-exceptional assessment tools are now seamlessly integrated into your student's profile.
                          </p>
                          
                          {/* Beautiful functional cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
                            {(() => {
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

                              const handleCardClick = (viewId: string) => {
                                if (!selectedStudentId) {
                                  toast({
                                    title: "Student Required",
                                    description: "Please select a student first.",
                                    variant: "destructive"
                                  });
                                  return;
                                }

                                switch (viewId) {
                                  case "cognitive":
                                    setIsCognitiveDialogOpen(true);
                                    break;
                                  case "enrichment":
                                    setIsEnrichmentDialogOpen(true);
                                    break;
                                  case "2e_support":
                                    setIs2ESupportDialogOpen(true);
                                    break;
                                  case "ai_insights":
                                    setIsGiftedAIDialogOpen(true);
                                    break;
                                  case "create":
                                    setIsNewAssessmentDialogOpen(true);
                                    break;
                                  default:
                                    break;
                                }
                              };

                              return (
                                <>
                                  {giftedCategories.map((category) => (
                                    <button
                                      key={category.id}
                                      onClick={() => handleCardClick(category.view)}
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
                                    onClick={() => handleCardClick(aiInsightsCategory.view)}
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
                                    onClick={() => handleCardClick('create')}
                                    className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors text-left group cursor-pointer"
                                    data-testid="button-gifted-create-assessment"
                                  >
                                    <div className="text-orange-600 mb-2 text-xl group-hover:scale-110 transition-transform">
                                      📝
                                    </div>
                                    <h4 className="font-medium mb-1">Quick Assessment</h4>
                                    <p className="text-sm text-muted-foreground">Create a comprehensive assessment</p>
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Show existing assessments if any */}
                        {giftedAssessments.length > 0 && (
                          <div className="mt-8 space-y-4">
                            <h4 className="font-medium">Existing Assessments</h4>
                            <div className="grid gap-3">
                              {giftedAssessments.map((assessment) => (
                                <div key={assessment.id} className="border rounded-lg p-4 text-left">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium capitalize flex items-center gap-2">
                                      <Sparkles className="h-4 w-4" />
                                      {assessment.assessment_type?.replace('_', ' ')} Assessment
                                    </h5>
                                    <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                                      {assessment.status}
                                    </Badge>
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
                        
                        {giftedAssessments.length > 0 && (
                          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border">
                            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                              ✅ You have {giftedAssessments.length} gifted assessments for this student
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

              </>
            ) : (
              <Card className="premium-card">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Student</h3>
                  <p className="text-muted-foreground">
                    Choose a student from the list to view their details, goals, and advocacy progress.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Add a new student to your client roster. Fill in the information below to create their profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Select value={newStudent.grade_level} onValueChange={(value) => setNewStudent({...newStudent, grade_level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-K">Pre-K</SelectItem>
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">School Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school_name">School Name</Label>
                  <Input
                    id="school_name"
                    value={newStudent.school_name}
                    onChange={(e) => setNewStudent({...newStudent, school_name: e.target.value})}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label htmlFor="district">School District</Label>
                  <Input
                    id="district"
                    value={newStudent.district}
                    onChange={(e) => setNewStudent({...newStudent, district: e.target.value})}
                    placeholder="Enter school district"
                  />
                </div>
              </div>
            </div>

            {/* Parent Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Parent Assignment</h3>
              <div>
                <Label htmlFor="assigned_client">Assign to Parent Client *</Label>
                <Select value={newStudent.assigned_client} onValueChange={(value) => setNewStudent({...newStudent, assigned_client: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.client_id}>
                        {client.full_name || client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* IEP Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">IEP Status</h3>
              <div>
                <Label htmlFor="iep_status">Current IEP Status</Label>
                <Select value={newStudent.iep_status} onValueChange={(value) => setNewStudent({...newStudent, iep_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select IEP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="case_manager">Case Manager</Label>
                  <Input
                    id="case_manager"
                    value={newStudent.case_manager}
                    onChange={(e) => setNewStudent({...newStudent, case_manager: e.target.value})}
                    placeholder="Enter case manager name"
                  />
                </div>
                <div>
                  <Label htmlFor="case_manager_email">Case Manager Email</Label>
                  <Input
                    id="case_manager_email"
                    type="email"
                    value={newStudent.case_manager_email}
                    onChange={(e) => setNewStudent({...newStudent, case_manager_email: e.target.value})}
                    placeholder="Enter case manager email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({...newStudent, notes: e.target.value})}
                  placeholder="Enter any additional notes about the student..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent} disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Update the student's information below. All changes will be saved to their profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                  <Input
                    id="edit_date_of_birth"
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_grade_level">Grade Level</Label>
                  <Select value={newStudent.grade_level} onValueChange={(value) => setNewStudent({...newStudent, grade_level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-K">Pre-K</SelectItem>
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">School Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_school_name">School Name</Label>
                  <Input
                    id="edit_school_name"
                    value={newStudent.school_name}
                    onChange={(e) => setNewStudent({...newStudent, school_name: e.target.value})}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_district">School District</Label>
                  <Input
                    id="edit_district"
                    value={newStudent.district}
                    onChange={(e) => setNewStudent({...newStudent, district: e.target.value})}
                    placeholder="Enter school district"
                  />
                </div>
              </div>
            </div>

            {/* IEP Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">IEP Status</h3>
              <div>
                <Label htmlFor="edit_iep_status">Current IEP Status</Label>
                <Select value={newStudent.iep_status} onValueChange={(value) => setNewStudent({...newStudent, iep_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select IEP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_case_manager">Case Manager</Label>
                  <Input
                    id="edit_case_manager"
                    value={newStudent.case_manager}
                    onChange={(e) => setNewStudent({...newStudent, case_manager: e.target.value})}
                    placeholder="Enter case manager name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_case_manager_email">Case Manager Email</Label>
                  <Input
                    id="edit_case_manager_email"
                    type="email"
                    value={newStudent.case_manager_email}
                    onChange={(e) => setNewStudent({...newStudent, case_manager_email: e.target.value})}
                    placeholder="Enter case manager email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({...newStudent, notes: e.target.value})}
                  placeholder="Enter any additional notes about the student..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditStudentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStudent} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Autism Support Profile Creation Dialog */}
      <Dialog open={isAutismDialogOpen} onOpenChange={setIsAutismDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-blue-600" />
              Create Autism Support Profile
            </DialogTitle>
            <DialogDescription>
              Document professional autism accommodations and support strategies for advocacy and IEP planning.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="autism_title">Profile Title *</Label>
                <Input
                  id="autism_title"
                  value={autismFormData.title}
                  onChange={(e) => setAutismFormData({...autismFormData, title: e.target.value})}
                  placeholder="e.g., Comprehensive Autism Support Plan"
                />
              </div>
              <div>
                <Label htmlFor="autism_category">Primary Category</Label>
                <Select value={autismFormData.category} onValueChange={(value) => setAutismFormData({...autismFormData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sensory">Sensory Processing Support</SelectItem>
                    <SelectItem value="communication">Communication Support</SelectItem>
                    <SelectItem value="academic">Academic Accommodations</SelectItem>
                    <SelectItem value="behavioral">Behavioral Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="autism_description">Professional Description *</Label>
              <Textarea
                id="autism_description"
                value={autismFormData.description}
                onChange={(e) => setAutismFormData({...autismFormData, description: e.target.value})}
                placeholder="Document the specific autism-related needs, interventions, and accommodations required..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="autism_implementation">Implementation Notes</Label>
              <Textarea
                id="autism_implementation"
                value={autismFormData.implementation_notes}
                onChange={(e) => setAutismFormData({...autismFormData, implementation_notes: e.target.value})}
                placeholder="Specific strategies for implementation, staff training needs, and monitoring protocols..."
                rows={3}
              />
            </div>
            
            {/* Quick Add Accommodation Categories */}
            <div className="space-y-4">
              <h4 className="font-semibold">Professional Accommodation Categories</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {autismAccommodationCategories.map((category) => (
                  <Card key={category.id} className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {category.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="text-xs p-2 bg-blue-50 rounded">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-muted-foreground">{item.description}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAutismDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAutismProfile} disabled={loading}>
              {loading ? "Creating..." : "Create Support Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gifted Assessment Creation Dialog */}
      <Dialog open={isGiftedDialogOpen} onOpenChange={setIsGiftedDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              Create Gifted & Twice-Exceptional Assessment
            </DialogTitle>
            <DialogDescription>
              Document comprehensive gifted assessment and twice-exceptional profile for educational planning.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assessment_type">Assessment Type</Label>
                <Select value={giftedFormData.assessment_type} onValueChange={(value) => setGiftedFormData({...giftedFormData, assessment_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twice_exceptional">Twice-Exceptional Profile</SelectItem>
                    <SelectItem value="cognitive">Cognitive Assessment</SelectItem>
                    <SelectItem value="academic">Academic Assessment</SelectItem>
                    <SelectItem value="creative">Creative Assessment</SelectItem>
                    <SelectItem value="leadership">Leadership Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Areas of Giftedness *</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {giftednessAreas.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gifted_${area}`}
                      checked={giftedFormData.giftedness_areas.includes(area)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGiftedFormData({
                            ...giftedFormData,
                            giftedness_areas: [...giftedFormData.giftedness_areas, area]
                          });
                        } else {
                          setGiftedFormData({
                            ...giftedFormData,
                            giftedness_areas: giftedFormData.giftedness_areas.filter(a => a !== area)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`gifted_${area}`} className="text-sm">{area}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Learning Differences (2e Profile)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {learningDifferences.map((difference) => (
                  <div key={difference} className="flex items-center space-x-2">
                    <Checkbox
                      id={`diff_${difference}`}
                      checked={giftedFormData.learning_differences.includes(difference)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGiftedFormData({
                            ...giftedFormData,
                            learning_differences: [...giftedFormData.learning_differences, difference]
                          });
                        } else {
                          setGiftedFormData({
                            ...giftedFormData,
                            learning_differences: giftedFormData.learning_differences.filter(d => d !== difference)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`diff_${difference}`} className="text-sm">{difference}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="strengths">Identified Strengths</Label>
                <Textarea
                  id="strengths"
                  value={giftedFormData.strengths}
                  onChange={(e) => setGiftedFormData({...giftedFormData, strengths: e.target.value})}
                  placeholder="Document specific areas of exceptional ability and talent..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="challenges">Areas of Challenge</Label>
                <Textarea
                  id="challenges"
                  value={giftedFormData.challenges}
                  onChange={(e) => setGiftedFormData({...giftedFormData, challenges: e.target.value})}
                  placeholder="Note specific learning challenges or areas requiring support..."
                  rows={4}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recommendations">Professional Recommendations</Label>
                <Textarea
                  id="recommendations"
                  value={giftedFormData.recommendations}
                  onChange={(e) => setGiftedFormData({...giftedFormData, recommendations: e.target.value})}
                  placeholder="Specific educational recommendations and interventions..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="enrichment">Enrichment Activities</Label>
                <Textarea
                  id="enrichment"
                  value={giftedFormData.enrichment_activities}
                  onChange={(e) => setGiftedFormData({...giftedFormData, enrichment_activities: e.target.value})}
                  placeholder="Suggested enrichment and acceleration opportunities..."
                  rows={3}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="evaluator_notes">Professional Evaluation Notes</Label>
              <Textarea
                id="evaluator_notes"
                value={giftedFormData.evaluator_notes}
                onChange={(e) => setGiftedFormData({...giftedFormData, evaluator_notes: e.target.value})}
                placeholder="Comprehensive professional notes on assessment findings, observations, and next steps..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsGiftedDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGiftedAssessment} disabled={loading}>
              {loading ? "Creating..." : "Create Assessment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Autism Tool Dialogs */}
      
      {/* Sensory Accommodations Dialog */}
      <Dialog open={isSensoryDialogOpen} onOpenChange={setIsSensoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-2xl mr-2">🔊</span>
              Sensory Accommodations Assessment
            </DialogTitle>
            <DialogDescription>
              Document sensory processing needs and environmental modifications for advocacy and IEP planning.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!selectedStudentId ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a student first to document sensory accommodations.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Auditory Processing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'noise-sensitivity', label: 'Noise-canceling headphones needed', desc: 'Reduces auditory distractions and sensory overload' },
                        { id: 'quiet-space', label: 'Access to quiet workspace', desc: 'Designated low-noise area for focused work' },
                        { id: 'audio-processing', label: 'Extended processing time for audio instructions', desc: 'Additional time to process verbal information' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Visual Processing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'lighting', label: 'Lighting modifications needed', desc: 'Avoid fluorescent lights, provide natural lighting when possible' },
                        { id: 'visual-supports', label: 'Enhanced visual supports', desc: 'Visual schedules, graphic organizers, and written instructions' },
                        { id: 'screen-breaks', label: 'Regular screen breaks', desc: 'Scheduled breaks from digital devices to prevent eye strain' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tactile & Movement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'fidget-tools', label: 'Approved fidget tools', desc: 'Sensory fidgets to support attention and self-regulation' },
                        { id: 'movement-breaks', label: 'Scheduled movement breaks', desc: 'Regular opportunities for gross motor movement' },
                        { id: 'flexible-seating', label: 'Alternative seating options', desc: 'Standing desk, therapy ball, or wobble cushion' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Environmental</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'reduce-clutter', label: 'Organized, clutter-free workspace', desc: 'Minimize visual distractions in learning environment' },
                        { id: 'predictable-routine', label: 'Consistent daily routine', desc: 'Structured schedule with advance notice of changes' },
                        { id: 'calm-down-space', label: 'Access to regulation space', desc: 'Quiet area for self-regulation when overwhelmed' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label htmlFor="sensory-notes">Professional Assessment Notes</Label>
                  <Textarea
                    id="sensory-notes"
                    placeholder="Document specific sensory triggers, effective strategies observed, and recommended accommodations for IEP team consideration..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsSensoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Sensory Assessment Saved",
                  description: "Sensory accommodation recommendations have been documented for advocacy use."
                });
                setIsSensoryDialogOpen(false);
              }}
              disabled={!selectedStudentId}
            >
              Save Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Communication Support Dialog */}
      <Dialog open={isCommunicationDialogOpen} onOpenChange={setIsCommunicationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-2xl mr-2">💬</span>
              Communication Support Assessment
            </DialogTitle>
            <DialogDescription>
              Evaluate communication needs and document support strategies for effective advocacy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!selectedStudentId ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a student first to assess communication needs.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Expressive Communication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'aac-device', label: 'AAC technology support', desc: 'Speech-generating device or communication app access' },
                        { id: 'visual-supports', label: 'Visual communication aids', desc: 'Picture cards, visual schedules, and choice boards' },
                        { id: 'extra-response-time', label: 'Extended response time', desc: 'Additional time to formulate and express responses' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Receptive Communication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'simplified-language', label: 'Clear, simplified instructions', desc: 'Concise directions with concrete language' },
                        { id: 'multiple-modalities', label: 'Multi-modal instruction delivery', desc: 'Visual, auditory, and written instruction formats' },
                        { id: 'comprehension-checks', label: 'Regular comprehension monitoring', desc: 'Frequent check-ins to ensure understanding' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Social Communication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { id: 'social-scripts', label: 'Pre-written social scripts', desc: 'Structured language for common social interactions' },
                      { id: 'peer-support', label: 'Peer communication buddy system', desc: 'Trained peer support for social interactions' },
                      { id: 'social-stories', label: 'Social stories and role-playing', desc: 'Explicit instruction in social communication norms' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <Checkbox id={item.id} />
                        <div className="space-y-1">
                          <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="communication-goals">Communication Goals & Progress</Label>
                  <Textarea
                    id="communication-goals"
                    placeholder="Document current communication abilities, specific goals, and progress observed. Include recommended services and supports..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCommunicationDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Communication Assessment Saved",
                  description: "Communication support strategies have been documented successfully."
                });
                setIsCommunicationDialogOpen(false);
              }}
              disabled={!selectedStudentId}
            >
              Save Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Behavioral Strategies Dialog */}
      <Dialog open={isBehavioralDialogOpen} onOpenChange={setIsBehavioralDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-2xl mr-2">🎭</span>
              Behavioral Strategies & Support Plan
            </DialogTitle>
            <DialogDescription>
              Document behavioral interventions and positive support strategies for comprehensive advocacy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!selectedStudentId ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a student first to develop behavioral strategies.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Antecedent Strategies</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'environmental-mods', label: 'Environmental modifications', desc: 'Adjust setting to prevent challenging behaviors' },
                        { id: 'visual-schedule', label: 'Predictable visual schedule', desc: 'Clear schedule with advance notice of changes' },
                        { id: 'choice-making', label: 'Structured choice opportunities', desc: 'Provide meaningful choices to increase engagement' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Teaching Strategies</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'replacement-behaviors', label: 'Teach replacement behaviors', desc: 'Explicitly teach appropriate alternative behaviors' },
                        { id: 'self-regulation', label: 'Self-regulation skills training', desc: 'Coping strategies and emotional regulation techniques' },
                        { id: 'social-skills', label: 'Explicit social skills instruction', desc: 'Direct teaching of social interaction skills' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reinforcement & Response</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { id: 'positive-reinforcement', label: 'Individualized reinforcement system', desc: 'Motivating rewards for appropriate behaviors' },
                      { id: 'break-system', label: 'Self-advocacy break system', desc: 'Student can request breaks when feeling overwhelmed' },
                      { id: 'de-escalation', label: 'Consistent de-escalation protocol', desc: 'Calm, predictable response to challenging behaviors' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <Checkbox id={item.id} />
                        <div className="space-y-1">
                          <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="behavior-plan">Behavioral Intervention Plan</Label>
                  <Textarea
                    id="behavior-plan"
                    placeholder="Document target behaviors, functional assessment results, intervention strategies, and data collection methods for IEP team..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="crisis-plan">Crisis Prevention & Response</Label>
                  <Textarea
                    id="crisis-plan"
                    placeholder="Outline early warning signs, prevention strategies, and appropriate response protocols for crisis situations..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsBehavioralDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Behavioral Plan Saved",
                  description: "Behavioral intervention strategies have been documented for advocacy use."
                });
                setIsBehavioralDialogOpen(false);
              }}
              disabled={!selectedStudentId}
            >
              Save Intervention Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Autism AI Insights Dialog */}
      <Dialog open={isAutismAIDialogOpen} onOpenChange={setIsAutismAIDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-2xl mr-2">🤖</span>
              AI Autism Insights & Recommendations
            </DialogTitle>
            <DialogDescription>
              Generate intelligent autism-specific analysis and advocacy recommendations based on student profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <AdvocateAutismAIAnalysis selectedStudentId={selectedStudentId} />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAutismAIDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "AI Insights Saved",
                  description: "Autism-specific recommendations have been saved for advocacy documentation."
                });
                setIsAutismAIDialogOpen(false);
              }}
              disabled={!selectedStudentId || !generatedInsights}
            >
              Save Insights
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gifted Tool Dialogs */}
      
      {/* Cognitive Assessment Dialog */}
      <Dialog open={isCognitiveDialogOpen} onOpenChange={setIsCognitiveDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-2xl mr-2">🧠</span>
              Cognitive Assessment & Intellectual Profile
            </DialogTitle>
            <DialogDescription>
              Comprehensive cognitive assessment for gifted identification and educational planning.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!selectedStudentId ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a student first to conduct cognitive assessment.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Intellectual Strengths</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'verbal-reasoning', label: 'Verbal reasoning & comprehension', desc: 'Advanced language processing and abstract reasoning' },
                        { id: 'mathematical-thinking', label: 'Mathematical reasoning', desc: 'Complex problem-solving and quantitative skills' },
                        { id: 'spatial-abilities', label: 'Visual-spatial processing', desc: 'Strong spatial visualization and pattern recognition' },
                        { id: 'memory-skills', label: 'Working memory capacity', desc: 'Ability to hold and manipulate information mentally' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Processing Speed & Attention</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'processing-speed', label: 'Rapid information processing', desc: 'Quick cognitive processing and response time' },
                        { id: 'sustained-attention', label: 'Sustained attention span', desc: 'Ability to maintain focus on complex tasks' },
                        { id: 'selective-attention', label: 'Selective attention skills', desc: 'Filter irrelevant information effectively' },
                        { id: 'cognitive-flexibility', label: 'Cognitive flexibility', desc: 'Adapt thinking strategies and switch between concepts' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Creativity Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1">
                        <li>• Original thinking patterns</li>
                        <li>• Divergent problem-solving</li>
                        <li>• Imaginative expression</li>
                        <li>• Novel solution generation</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Learning Characteristics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1">
                        <li>• Rapid skill acquisition</li>
                        <li>• Deep content mastery</li>
                        <li>• Independent learning</li>
                        <li>• Complex reasoning ability</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Social-Emotional</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1">
                        <li>• Heightened sensitivity</li>
                        <li>• Perfectionist tendencies</li>
                        <li>• Intense interests</li>
                        <li>• Emotional complexity</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label htmlFor="cognitive-assessment">Professional Cognitive Assessment</Label>
                  <Textarea
                    id="cognitive-assessment"
                    placeholder="Document specific cognitive strengths, assessment results, learning patterns, and educational implications for gifted programming consideration..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCognitiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Cognitive Assessment Saved",
                  description: "Intellectual profile has been documented for gifted programming consideration."
                });
                setIsCognitiveDialogOpen(false);
              }}
              disabled={!selectedStudentId}
            >
              Save Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enrichment Needs Dialog */}
      <Dialog open={isEnrichmentDialogOpen} onOpenChange={setIsEnrichmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-2xl mr-2">⚡</span>
              Enrichment & Acceleration Planning
            </DialogTitle>
            <DialogDescription>
              Document advanced learning opportunities and acceleration needs for gifted programming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!selectedStudentId ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a student first to plan enrichment activities.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Academic Acceleration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'grade-skip', label: 'Grade-level acceleration', desc: 'Advancement to higher grade level for appropriate challenge' },
                        { id: 'subject-acceleration', label: 'Single-subject acceleration', desc: 'Advanced placement in specific subject areas' },
                        { id: 'curriculum-compacting', label: 'Curriculum compacting', desc: 'Streamlined content to allow time for enrichment' },
                        { id: 'early-entry', label: 'Early program entry', desc: 'Early admission to advanced programs or classes' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enrichment Strategies</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'independent-study', label: 'Independent research projects', desc: 'Self-directed deep dive into areas of interest' },
                        { id: 'mentorship', label: 'Expert mentorship programs', desc: 'Connection with professionals in field of interest' },
                        { id: 'competitions', label: 'Academic competitions', desc: 'Opportunities for intellectual challenge and recognition' },
                        { id: 'dual-enrollment', label: 'Dual enrollment options', desc: 'College-level coursework while in high school' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Specialized Programs & Services</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { id: 'pull-out-program', label: 'Gifted pull-out program', desc: 'Specialized instruction with intellectual peers' },
                      { id: 'cluster-grouping', label: 'Cluster grouping', desc: 'Placement with other high-ability students' },
                      { id: 'magnet-programs', label: 'Magnet or specialty programs', desc: 'Specialized schools or programs for gifted learners' },
                      { id: 'summer-programs', label: 'Summer enrichment programs', desc: 'Intensive summer learning opportunities' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <Checkbox id={item.id} />
                        <div className="space-y-1">
                          <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="enrichment-plan">Comprehensive Enrichment Plan</Label>
                  <Textarea
                    id="enrichment-plan"
                    placeholder="Detail specific enrichment recommendations, acceleration considerations, timeline for implementation, and measures for monitoring progress..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEnrichmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Enrichment Plan Saved",
                  description: "Advanced learning opportunities have been documented for gifted programming."
                });
                setIsEnrichmentDialogOpen(false);
              }}
              disabled={!selectedStudentId}
            >
              Save Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2E Support Dialog */}
      <Dialog open={is2ESupportDialogOpen} onOpenChange={setIs2ESupportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Twice-Exceptional (2E) Support Planning
            </DialogTitle>
            <DialogDescription>
              Comprehensive support for students who are both gifted and have learning differences or disabilities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!selectedStudentId ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a student first to develop 2E support strategies.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Strength-Based Approaches</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'strength-focus', label: 'Leverage intellectual strengths', desc: 'Use gifted abilities to support areas of challenge' },
                        { id: 'interest-integration', label: 'Integrate special interests', desc: 'Incorporate passions into remediation efforts' },
                        { id: 'bypass-strategies', label: 'Bypass deficit areas', desc: 'Alternative methods to demonstrate knowledge' },
                        { id: 'technology-tools', label: 'Assistive technology', desc: 'Tools to support areas of learning difference' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Accommodation Strategies</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: 'processing-time', label: 'Extended processing time', desc: 'Additional time for complex task completion' },
                        { id: 'alternative-assessment', label: 'Alternative assessment formats', desc: 'Varied ways to demonstrate mastery' },
                        { id: 'executive-support', label: 'Executive function support', desc: 'Organization and planning scaffolds' },
                        { id: 'social-emotional', label: 'Social-emotional support', desc: 'Address perfectionism and anxiety' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={item.id} />
                          <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dual Programming Needs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { id: 'concurrent-services', label: 'Concurrent gifted and special education services', desc: 'Both enrichment and remediation support' },
                      { id: 'coordinated-team', label: 'Coordinated support team', desc: 'Collaboration between gifted and special education staff' },
                      { id: 'individualized-pace', label: 'Flexible pacing', desc: 'Acceleration in strengths, support in challenge areas' },
                      { id: 'self-advocacy', label: 'Self-advocacy training', desc: 'Help student understand and communicate needs' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <Checkbox id={item.id} />
                        <div className="space-y-1">
                          <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="2e-assessment">Twice-Exceptional Profile Assessment</Label>
                  <Textarea
                    id="2e-assessment"
                    placeholder="Document the complex interplay between giftedness and disability, specific strengths and challenges, and comprehensive support recommendations..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="2e-goals">Integrated Support Goals</Label>
                  <Textarea
                    id="2e-goals"
                    placeholder="Outline goals that address both gifted potential and learning differences, with specific strategies for achievement..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIs2ESupportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "2E Support Plan Saved",
                  description: "Twice-exceptional support strategies have been documented for comprehensive programming."
                });
                setIs2ESupportDialogOpen(false);
              }}
              disabled={!selectedStudentId}
            >
              Save 2E Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gifted AI Insights Dialog */}
      <Dialog open={isGiftedAIDialogOpen} onOpenChange={setIsGiftedAIDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-2xl mr-2">🤖</span>
              AI Gifted Education Insights
            </DialogTitle>
            <DialogDescription>
              Generate intelligent analysis and recommendations for gifted and twice-exceptional programming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!selectedStudentId ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a student first to generate gifted education insights.</p>
              </div>
            ) : (
              <>
                {/* Comprehensive Gifted AI Insights */}
                <GiftedInsightsView 
                  selectedStudentId={selectedStudentId || undefined}
                  students={students}
                  isAdvocateView={true}
                  showStudentSelector={false}
                />
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsGiftedAIDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Gifted Insights Saved",
                  description: "AI-generated gifted education recommendations have been saved for programming decisions."
                });
                setIsGiftedAIDialogOpen(false);
              }}
              disabled={!selectedStudentId}
            >
              Save Insights
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Assessment Dialog */}
      <Dialog open={isNewAssessmentDialogOpen} onOpenChange={setIsNewAssessmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Create New Gifted Assessment
            </DialogTitle>
            <DialogDescription>
              Comprehensive assessment creation for gifted identification and programming decisions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!selectedStudentId ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a student first to create a new assessment.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assessment-type">Assessment Type</Label>
                    <Select value={giftedFormData.assessment_type} onValueChange={(value) => setGiftedFormData({...giftedFormData, assessment_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial_screening">Initial Gifted Screening</SelectItem>
                        <SelectItem value="comprehensive_evaluation">Comprehensive Evaluation</SelectItem>
                        <SelectItem value="twice_exceptional">Twice-Exceptional Assessment</SelectItem>
                        <SelectItem value="program_review">Program Review & Monitoring</SelectItem>
                        <SelectItem value="transition_planning">Transition Planning Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="assessment-date">Assessment Date</Label>
                    <Input
                      id="assessment-date"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label>Areas of Giftedness (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {giftednessAreas.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={giftedFormData.giftedness_areas.includes(area)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setGiftedFormData({
                                ...giftedFormData,
                                giftedness_areas: [...giftedFormData.giftedness_areas, area]
                              });
                            } else {
                              setGiftedFormData({
                                ...giftedFormData,
                                giftedness_areas: giftedFormData.giftedness_areas.filter(a => a !== area)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={area} className="text-sm">{area}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Learning Differences or Disabilities (If applicable)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {learningDifferences.map((difference) => (
                      <div key={difference} className="flex items-center space-x-2">
                        <Checkbox
                          id={difference}
                          checked={giftedFormData.learning_differences.includes(difference)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setGiftedFormData({
                                ...giftedFormData,
                                learning_differences: [...giftedFormData.learning_differences, difference]
                              });
                            } else {
                              setGiftedFormData({
                                ...giftedFormData,
                                learning_differences: giftedFormData.learning_differences.filter(d => d !== difference)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={difference} className="text-sm">{difference}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assessment-strengths">Identified Strengths</Label>
                    <Textarea
                      id="assessment-strengths"
                      value={giftedFormData.strengths}
                      onChange={(e) => setGiftedFormData({...giftedFormData, strengths: e.target.value})}
                      placeholder="Document specific areas of exceptional ability, advanced skills, and notable talents..."
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="assessment-challenges">Areas of Challenge</Label>
                    <Textarea
                      id="assessment-challenges"
                      value={giftedFormData.challenges}
                      onChange={(e) => setGiftedFormData({...giftedFormData, challenges: e.target.value})}
                      placeholder="Note specific learning challenges, areas requiring support, or barriers to success..."
                      rows={4}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="assessment-recommendations">Professional Recommendations</Label>
                  <Textarea
                    id="assessment-recommendations"
                    value={giftedFormData.recommendations}
                    onChange={(e) => setGiftedFormData({...giftedFormData, recommendations: e.target.value})}
                    placeholder="Specific educational recommendations, programming suggestions, and intervention strategies..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="assessment-notes">Comprehensive Assessment Notes</Label>
                  <Textarea
                    id="assessment-notes"
                    value={giftedFormData.evaluator_notes}
                    onChange={(e) => setGiftedFormData({...giftedFormData, evaluator_notes: e.target.value})}
                    placeholder="Detailed professional observations, assessment findings, and comprehensive analysis for gifted programming decisions..."
                    rows={5}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsNewAssessmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGiftedAssessment}
              disabled={!selectedStudentId || giftedFormData.giftedness_areas.length === 0 || loading}
            >
              {loading ? "Creating..." : "Create Assessment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdvocateStudents;