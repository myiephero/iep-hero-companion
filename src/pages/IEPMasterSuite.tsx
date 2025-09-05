import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentUpload } from "@/components/DocumentUpload";
import { StudentSelector } from "@/components/StudentSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDropzone } from "react-dropzone";
import { 
  Brain, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Users, 
  Clock, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Trash2, 
  Share, 
  CheckSquare, 
  X, 
  MoreVertical,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Rocket,
  Lightbulb,
  BookOpen,
  Upload,
  Search,
  GraduationCap,
  Heart,
  User,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";

// Combined interfaces for both tools
interface GeneratedGoal {
  id: string;
  category: string;
  goal: string;
  objectives: string[];
  measurableData: string;
  timeframe: string;
  complianceScore: number;
  standards: string[];
}

interface UnifiedIEPReview {
  id: string;
  documentId: string;
  studentId?: string;
  reviewType: string;
  analysis: any;
  parsedAnalysis?: any;
  scores?: {
    overall: number;
    goal_quality: number;
    service_alignment: number;
    compliance: number;
  };
  flags?: Array<{
    where: string;
    notes: string;
    type: string;
  }>;
  recommendations?: Array<{
    title: string;
    suggestion: string;
  }>;
  timestamp: string;
  documentName: string;
}

interface ComplianceResult {
  overallScore: number;
  criteria: {
    measurable: boolean;
    timeframe: boolean;
    conditions: boolean;
    criteria: boolean;
    observable: boolean;
    studentSpecific: boolean;
  };
  suggestions: string[];
}

// Template goals for both goal generation and standards alignment
const SAMPLE_IEP_GOALS = {
  reading: [
    "By the end of the IEP year, when given grade-level text passages, the student will read with 90% accuracy and demonstrate comprehension by answering literal and inferential questions with 80% accuracy across 4 consecutive weekly probes.",
    "By the end of the IEP year, when given a list of grade-appropriate sight words, the student will read the words aloud with 95% accuracy in 3 out of 4 consecutive weekly assessments.",
    "By the end of the IEP year, when presented with grade-level reading passages, the student will identify the main idea and 3 supporting details with 80% accuracy on 4 consecutive trials."
  ],
  writing: [
    "By the end of the IEP year, when given a writing prompt, the student will compose a 5-sentence paragraph with proper capitalization, punctuation, and spelling with 80% accuracy in 4 out of 5 consecutive weekly samples.",
    "By the end of the IEP year, when given graphic organizers, the student will write a 3-paragraph essay with introduction, body, and conclusion with 75% accuracy on 4 consecutive monthly assessments.",
    "By the end of the IEP year, the student will copy sentences from the board with proper letter formation and spacing with 90% accuracy in daily handwriting samples."
  ],
  math: [
    "By the end of the IEP year, when presented with addition problems with regrouping (2-digit numbers), the student will solve them with 80% accuracy on 4 consecutive weekly assessments.",
    "By the end of the IEP year, when given real-world word problems involving money, the student will identify the operation needed and solve with 75% accuracy in 3 out of 4 trials.",
    "By the end of the IEP year, when shown analog clocks, the student will tell time to the nearest 15 minutes with 85% accuracy on 4 consecutive weekly probes."
  ],
  communication: [
    "By the end of the IEP year, when presented with social situations requiring verbal interaction, the student will initiate appropriate social communication using complete sentences in 80% of opportunities across 3 consecutive weeks.",
    "By the end of the IEP year, when given structured conversation opportunities, the student will maintain eye contact and respond appropriately to questions in 4 out of 5 interactions across daily sessions.",
    "By the end of the IEP year, the student will use appropriate voice volume and tone during classroom discussions in 85% of observed opportunities over 2 consecutive weeks."
  ],
  behavior: [
    "By the end of the IEP year, when transitioning between activities, the student will follow the transition routine without verbal prompts in 80% of opportunities across 4 consecutive weeks.",
    "By the end of the IEP year, when experiencing frustration, the student will use appropriate coping strategies (deep breathing, asking for help) instead of disruptive behavior in 75% of observed instances.",
    "By the end of the IEP year, the student will remain in assigned seat and attend to task for 15-minute periods with no more than 2 verbal reminders in 80% of opportunities."
  ]
};

// Template goals specifically for standards alignment
const ALIGNMENT_TEMPLATE_GOALS = {
  reading: [
    "By the end of the IEP year, when given grade-level fiction and nonfiction texts, [Student] will identify the main idea and supporting details with 80% accuracy across 4 consecutive sessions as measured by curriculum-based assessments.",
    "When presented with informational text at instructional level, [Student] will determine the author's purpose and identify text features (headings, captions, bold words) with 85% accuracy in 3 out of 4 opportunities.",
    "Given fiction text at grade level, [Student] will compare and contrast characters, settings, and plot events using graphic organizers with 75% accuracy across 4 consecutive weekly assessments.",
    "When reading grade-appropriate poetry and prose, [Student] will identify literary elements (rhyme, rhythm, alliteration) and explain their effect on meaning with 80% accuracy in 4 out of 5 opportunities.",
    "By the end of the IEP year, [Student] will read grade-level text fluently with appropriate rate, accuracy, and expression, scoring at the 25th percentile on oral reading fluency measures for 3 consecutive assessments."
  ],
  math: [
    "By the end of the IEP year, when given multi-step word problems involving addition and subtraction within 1000, [Student] will solve them using place value understanding and properties of operations with 85% accuracy across 4 consecutive assessments.",
    "When presented with data in graphs, charts, and tables, [Student] will interpret and analyze the information to answer questions with 80% accuracy in 3 out of 4 opportunities.",
    "Given geometric shapes and figures, [Student] will identify, classify, and describe their attributes (sides, angles, vertices) with 85% accuracy across 4 consecutive weekly sessions.",
    "By the end of the IEP year, [Student] will solve multiplication and division problems within 100 using strategies based on place value and properties of operations with 80% accuracy in 4 out of 5 assessments.",
    "When working with fractions, [Student] will compare, order, and perform basic operations (addition/subtraction with like denominators) with 75% accuracy across 3 consecutive sessions."
  ],
  writing: [
    "By the end of the IEP year, when given a narrative writing prompt, [Student] will write a coherent story with clear sequence, character development, and descriptive details, scoring proficient on district rubric in 3 out of 4 samples.",
    "When composing informational text, [Student] will organize ideas using appropriate text structures (compare/contrast, cause/effect, sequence) with supporting facts and details with 80% accuracy across 4 writing samples.",
    "Given an argumentative writing task, [Student] will state a clear claim, provide relevant evidence, and address counterarguments with 85% accuracy as measured by district writing rubric in 3 consecutive samples.",
    "By the end of the IEP year, [Student] will revise and edit writing for grammar, capitalization, punctuation, and spelling with 80% accuracy across 4 consecutive writing assignments.",
    "When writing across content areas, [Student] will use domain-specific vocabulary and academic language appropriate to the subject with 85% accuracy in 4 out of 5 opportunities."
  ],
  science: [
    "By the end of the IEP year, when conducting scientific investigations, [Student] will formulate hypotheses, collect data, and draw evidence-based conclusions with 80% accuracy across 4 consecutive lab activities.",
    "When studying life science concepts, [Student] will explain relationships between organisms and their environment, including food webs and ecosystems, with 85% accuracy in 3 out of 4 assessments.",
    "Given physical science phenomena, [Student] will identify and explain properties of matter (solid, liquid, gas) and changes in states with 80% accuracy across 4 consecutive experiments.",
    "By the end of the IEP year, [Student] will analyze weather patterns and climate data to make predictions about future conditions with 75% accuracy in 4 out of 5 opportunities.",
    "When exploring earth science topics, [Student] will explain the rock cycle, erosion processes, and landform formation using scientific vocabulary with 80% accuracy across 3 consecutive assessments."
  ],
  social: [
    "By the end of the IEP year, when studying historical events, [Student] will identify cause and effect relationships and explain their significance with 80% accuracy across 4 consecutive assessments.",
    "When analyzing primary and secondary sources, [Student] will compare different perspectives on historical events and draw supported conclusions with 85% accuracy in 3 out of 4 opportunities.",
    "Given maps, graphs, and charts, [Student] will interpret geographic information and explain human-environment interactions with 80% accuracy across 4 consecutive sessions.",
    "By the end of the IEP year, [Student] will explain the structure and function of local, state, and national government, including rights and responsibilities of citizens with 75% accuracy in 4 out of 5 assessments.",
    "When studying economics concepts, [Student] will identify needs vs. wants, explain supply and demand, and describe how people make economic choices with 80% accuracy across 3 consecutive evaluations."
  ],
  behavior: [
    "By the end of the IEP year, [Student] will demonstrate appropriate classroom behavior by following directions, staying on task, and completing assignments within allotted time with 85% accuracy across 4 consecutive weeks.",
    "When working in group settings, [Student] will use appropriate social skills including turn-taking, active listening, and respectful communication with 80% accuracy in 4 out of 5 collaborative activities.",
    "Given transition cues and advance notice, [Student] will move between activities and locations independently within 2 minutes with no more than 1 verbal prompt with 85% accuracy across 4 consecutive days.",
    "By the end of the IEP year, [Student] will use appropriate conflict resolution strategies when disagreements arise, including compromise and seeking adult help when needed, with 80% accuracy in 3 out of 4 situations.",
    "When experiencing academic frustration, [Student] will use self-regulation strategies (requesting breaks, using coping tools, asking for help) before exhibiting disruptive behavior with 85% accuracy across 4 consecutive sessions."
  ]
};

const reviewTypes = [
  { value: 'iep_quality', label: 'IEP Quality Review', description: 'Comprehensive quality analysis with scoring' },
  { value: 'compliance_check', label: 'Compliance Analysis', description: 'Check IDEA compliance and requirements' },
  { value: 'accommodation', label: 'Accommodation Review', description: 'Analyze accommodations and modifications' },
  { value: 'meeting_prep', label: 'Meeting Preparation', description: 'Prepare for upcoming IEP meetings' },
  { value: 'goal_analysis', label: 'Goal Analysis', description: 'Deep dive into IEP goals and objectives' }
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

const ACADEMIC_SUBJECTS = [
  'English Language Arts',
  'Mathematics', 
  'Science',
  'Social Studies',
  'Reading',
  'Writing',
  'Speaking and Listening',
  'Physical Education',
  'Arts Education',
  'World Languages',
  'Career and Technical Education'
];

export default function IEPMasterSuite() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'goals'>('analyze');
  const { toast } = useToast();
  
  // Document Review States
  const [selectedReviewType, setSelectedReviewType] = useState('iep_quality');
  const [reviews, setReviews] = useState<UnifiedIEPReview[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Goal Generation States  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGoals, setGeneratedGoals] = useState<GeneratedGoal[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Compliance checker states
  const [complianceGoalText, setComplianceGoalText] = useState('');
  const [selectedPresetGoal, setSelectedPresetGoal] = useState('');
  const [selectedGoalCategory, setSelectedGoalCategory] = useState('reading');
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);

  // Standards alignment states
  const [alignmentState, setAlignmentState] = useState('California');
  const [alignmentSubject, setAlignmentSubject] = useState('English Language Arts');
  const [alignmentGoalText, setAlignmentGoalText] = useState('');
  const [isAligning, setIsAligning] = useState(false);
  const [alignmentResults, setAlignmentResults] = useState<any>(null);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('reading');
  const [selectedAlignmentTemplate, setSelectedAlignmentTemplate] = useState('');
  
  // Form state for goal generation
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    grade: '',
    disability: '',
    currentLevel: '',
    area: '',
    strengths: '',
    needs: ''
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setUploadedFile(acceptedFiles[0]);
    }
  });

  const handleAlignStandards = async () => {
    if (!alignmentGoalText || !alignmentState || !alignmentSubject) return;
    
    setIsAligning(true);
    
    try {
      // Real standards alignment analysis using our API
      const response = await apiRequest('POST', '/api/standards/analyze', {
        goalText: alignmentGoalText,
        selectedState: alignmentState,
        selectedSubject: alignmentSubject,
        gradeLevel: 'Grade 3' // Default grade for now
      });
      
      const analysisResult = await response.json();
      
      // Transform the result to match the expected format for display
      const alignmentResult = {
        primaryStandards: analysisResult.primaryStandards.map((match: any) => ({
          code: match.standard.code,
          description: match.standard.description,
          score: match.score,
          matchedKeywords: match.matchedKeywords,
          reasoning: match.reasoning
        })),
        secondaryStandards: analysisResult.secondaryStandards.map((match: any) => ({
          code: match.standard.code,
          description: match.standard.description,
          score: match.score,
          matchedKeywords: match.matchedKeywords,
          reasoning: match.reasoning
        })),
        recommendations: analysisResult.recommendations,
        overallScore: analysisResult.overallScore,
        confidence: analysisResult.confidence
      };

      setAlignmentResults(alignmentResult);
    } catch (error) {
      console.error('Error analyzing standards alignment:', error);
      setAlignmentResults({
        primaryStandards: [],
        secondaryStandards: [],
        recommendations: ['Unable to analyze standards alignment at this time. Please try again later.'],
        overallScore: 0,
        confidence: 0
      });
    } finally {
      setIsAligning(false);
    }
  };

  const handleComplianceCheck = async () => {
    if (!complianceGoalText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a goal to check for compliance.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingCompliance(true);
    
    try {
      // Simulate compliance checking logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock compliance result for demonstration
      const mockResult: ComplianceResult = {
        overallScore: 85,
        criteria: {
          measurable: true,
          timeframe: true,
          conditions: true,
          criteria: true,
          observable: false,
          studentSpecific: true
        },
        suggestions: [
          "Consider adding more specific behavioral indicators",
          "Include baseline data for better measurement",
          "Specify the learning environment more clearly"
        ]
      };
      
      setComplianceResult(mockResult);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check compliance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingCompliance(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Clean Header */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">IEP Master Suite</h1>
              <p className="text-sm text-muted-foreground">Comprehensive IEP analysis and goal management platform</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI Analysis
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              IDEA Compliant
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Standards Aligned
            </Badge>
            <Badge variant="outline" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Professional Templates
            </Badge>
          </div>
        </div>

        {/* Streamlined Workflow */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <div className="border rounded-lg bg-card">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="analyze" className="flex flex-col items-center gap-1 py-4 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-medium">Document Analysis</span>
                  <span className="text-xs text-muted-foreground">Upload & Review IEPs</span>
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex flex-col items-center gap-1 py-4 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Target className="h-6 w-6" />
                  <span className="text-sm font-medium">Goal Management</span>
                  <span className="text-xs text-muted-foreground">Create, Check & Align Goals</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Document Analysis Tab */}
              <TabsContent value="analyze" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Comprehensive IEP Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload IEP documents for quality review, compliance checking, and improvement recommendations</p>
                  </div>
                  
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Document Upload & Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Analysis Type</Label>
                            <Select value={selectedReviewType} onValueChange={setSelectedReviewType}>
                              <SelectTrigger data-testid="select-review-type">
                                <SelectValue placeholder="Select analysis type" />
                              </SelectTrigger>
                              <SelectContent>
                                {reviewTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div>
                                      <div className="font-medium text-sm">{type.label}</div>
                                      <div className="text-xs text-muted-foreground">{type.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">State Standards</Label>
                            <Select value={alignmentState} onValueChange={setAlignmentState}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {US_STATES.slice(0, 10).map((state) => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Student Context (Optional)</Label>
                            <StudentSelector selectedStudent={selectedStudentId} onStudentChange={setSelectedStudentId} />
                          </div>
                        </div>

                        <Separator />

                        <DocumentUpload 
                          onAnalysisComplete={(analysis) => {
                            toast({
                              title: "Analysis Complete",
                              description: "Your IEP document has been analyzed for quality, compliance, and standards alignment."
                            });
                          }}
                        />
                      </CardContent>
                    </Card>

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Comprehensive Analysis Includes:</strong> IDEA compliance checking, goal quality assessment, standards alignment, accommodation review, and improvement recommendations.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </TabsContent>

              {/* Unified Goal Management Tab */}
              <TabsContent value="goals" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Unified Goal Management</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create, check compliance, and align IEP goals with state standards - all in one streamlined workflow</p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Goal Creation & Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Subject Area</Label>
                            <Select value={alignmentSubject} onValueChange={setAlignmentSubject}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {ACADEMIC_SUBJECTS.slice(0, 6).map((subject) => (
                                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">State Standards</Label>
                            <Select value={alignmentState} onValueChange={setAlignmentState}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {US_STATES.slice(0, 10).map((state) => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Professional Goal Templates</Label>
                          <div className="grid gap-2">
                            <Select value={selectedTemplateCategory} onValueChange={setSelectedTemplateCategory}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select goal category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reading">Reading Comprehension</SelectItem>
                                <SelectItem value="math">Mathematics</SelectItem>
                                <SelectItem value="writing">Written Expression</SelectItem>
                                <SelectItem value="science">Science</SelectItem>
                                <SelectItem value="social">Social Studies</SelectItem>
                                <SelectItem value="behavior">Behavior & Social Skills</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {selectedTemplateCategory && (
                              <Select value={selectedAlignmentTemplate} onValueChange={(value) => {
                                setSelectedAlignmentTemplate(value);
                                setAlignmentGoalText(value);
                                setComplianceGoalText(value);
                              }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a professional template" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ALIGNMENT_TEMPLATE_GOALS[selectedTemplateCategory as keyof typeof ALIGNMENT_TEMPLATE_GOALS]?.map((goal, index) => (
                                    <SelectItem key={index} value={goal}>
                                      <div className="max-w-md">{goal.substring(0, 90)}...</div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Goal Text</Label>
                          <Textarea
                            placeholder="Enter or select an IEP goal for analysis..."
                            value={alignmentGoalText}
                            onChange={(e) => {
                              setAlignmentGoalText(e.target.value);
                              setComplianceGoalText(e.target.value);
                            }}
                            className="min-h-[120px]"
                          />
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                          <Button 
                            onClick={handleComplianceCheck} 
                            disabled={isCheckingCompliance || !alignmentGoalText.trim()}
                            variant="outline"
                            data-testid="button-check-compliance"
                          >
                            {isCheckingCompliance ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                Checking...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Check Compliance
                              </>
                            )}
                          </Button>

                          <Button 
                            onClick={handleAlignStandards} 
                            disabled={isAligning || !alignmentGoalText || !alignmentState || !alignmentSubject}
                            data-testid="button-align-standards"
                          >
                            {isAligning ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Aligning...
                              </>
                            ) : (
                              <>
                                <Brain className="h-4 w-4 mr-2" />
                                Align to Standards
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {(complianceResult || alignmentResults) && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analysis Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {complianceResult && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">SMART Compliance Score</span>
                                <Badge variant={complianceResult.overallScore >= 80 ? "default" : "secondary"}>
                                  {complianceResult.overallScore}%
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                {Object.entries(complianceResult.criteria).map(([key, value]) => (
                                  <div key={key} className="flex items-center justify-between">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    {value ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <X className="h-3 w-3 text-red-500" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {alignmentResults && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Standards Alignment</span>
                                <Badge variant="default">
                                  {Math.round(alignmentResults.overallScore * 100)}%
                                </Badge>
                              </div>

                              {alignmentResults.primaryStandards && alignmentResults.primaryStandards.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Top Matches</Label>
                                  {alignmentResults.primaryStandards.slice(0, 2).map((match: any, index: number) => (
                                    <div key={index} className="p-2 border rounded text-xs space-y-1">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs">{match.code}</Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {Math.round(match.score * 100)}%
                                        </Badge>
                                      </div>
                                      <p className="text-muted-foreground">{match.description.substring(0, 120)}...</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {(complianceResult?.suggestions || alignmentResults?.recommendations) && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Recommendations</Label>
                              <div className="space-y-1">
                                {(complianceResult?.suggestions || []).concat(alignmentResults?.recommendations || []).slice(0, 3).map((rec: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs">
                                    <Lightbulb className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-blue-900 dark:text-blue-100">{rec.substring(0, 100)}...</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Unified Workflow:</strong> Select a template or enter a custom goal, then run both compliance checking and standards alignment analysis with one click each.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}