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

export default function IEPMasterSuite() {
  const [activeTab, setActiveTab] = useState<'review' | 'generate' | 'check' | 'align'>('review');
  const { toast } = useToast();
  
  // Document Review States
  const [selectedReviewType, setSelectedReviewType] = useState('');
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
  const [selectedGoalCategory, setSelectedGoalCategory] = useState('');
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);

  // Standards alignment states
  const [alignmentState, setAlignmentState] = useState('');
  const [alignmentSubject, setAlignmentSubject] = useState('');
  const [alignmentGoalText, setAlignmentGoalText] = useState('');
  const [isAligning, setIsAligning] = useState(false);
  const [alignmentResults, setAlignmentResults] = useState<any>(null);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">IEP Master Suite</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive IEP document analysis, goal generation, compliance checking, and standards alignment in one powerful platform
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered Analysis
            </Badge>
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              IDEA Compliant
            </Badge>
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
              <Target className="h-3 w-3 mr-1" />
              Standards Aligned
            </Badge>
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
              <BookOpen className="h-3 w-3 mr-1" />
              Professional Templates
            </Badge>
          </div>
        </div>

        {/* Main Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="review" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Document Review
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Generate Goals
                </TabsTrigger>
                <TabsTrigger value="check" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Check Compliance
                </TabsTrigger>
                <TabsTrigger value="align" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Standards Alignment
                </TabsTrigger>
              </TabsList>

              {/* Document Review Tab */}
              <TabsContent value="review" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      IEP Document Analysis
                    </CardTitle>
                    <CardDescription>
                      Upload and analyze complete IEP documents for quality, compliance, and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Analysis Type</Label>
                        <Select value={selectedReviewType} onValueChange={setSelectedReviewType}>
                          <SelectTrigger data-testid="select-review-type">
                            <SelectValue placeholder="Select analysis type" />
                          </SelectTrigger>
                          <SelectContent>
                            {reviewTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div>
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-sm text-muted-foreground">{type.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Student Context (Optional)</Label>
                        <StudentSelector selectedStudent={selectedStudentId} onStudentChange={setSelectedStudentId} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Upload IEP Document</Label>
                      <DocumentUpload 
                        onAnalysisComplete={(analysis) => {
                          // Handle analysis completion
                          toast({
                            title: "Analysis Complete",
                            description: "Your IEP document has been analyzed successfully."
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Generate Goals Tab */}
              <TabsContent value="generate" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      AI-Powered Goal Generation
                    </CardTitle>
                    <CardDescription>
                      Generate SMART, compliant IEP goals using AI and professional templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        This feature generates professional IEP goals based on student information and needs assessment.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="text-center py-8">
                      <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Goal Generation Coming Soon</h3>
                      <p className="text-muted-foreground">
                        Advanced AI goal generation with student context integration
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Check Compliance Tab */}
              <TabsContent value="check" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      SMART Goal Compliance Checker
                    </CardTitle>
                    <CardDescription>
                      Verify your IEP goals meet SMART criteria and IDEA compliance standards
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        This tool analyzes goals for SMART criteria: Specific, Measurable, Achievable, Relevant, Time-bound
                      </AlertDescription>
                    </Alert>
                    
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Compliance Checking Available</h3>
                      <p className="text-muted-foreground">
                        Real-time SMART goal validation and compliance scoring
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Standards Alignment Tab */}
              <TabsContent value="align" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Standards Alignment Analysis
                    </CardTitle>
                    <CardDescription>
                      Align IEP goals with state-specific educational standards using AI analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="state-select">State</Label>
                        <Select value={alignmentState} onValueChange={setAlignmentState}>
                          <SelectTrigger data-testid="select-alignment-state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alabama">Alabama</SelectItem>
                            <SelectItem value="alaska">Alaska</SelectItem>
                            <SelectItem value="arizona">Arizona</SelectItem>
                            <SelectItem value="arkansas">Arkansas</SelectItem>
                            <SelectItem value="california">California</SelectItem>
                            <SelectItem value="colorado">Colorado</SelectItem>
                            <SelectItem value="connecticut">Connecticut</SelectItem>
                            <SelectItem value="delaware">Delaware</SelectItem>
                            <SelectItem value="district-of-columbia">District of Columbia</SelectItem>
                            <SelectItem value="florida">Florida</SelectItem>
                            <SelectItem value="georgia">Georgia</SelectItem>
                            <SelectItem value="hawaii">Hawaii</SelectItem>
                            <SelectItem value="idaho">Idaho</SelectItem>
                            <SelectItem value="illinois">Illinois</SelectItem>
                            <SelectItem value="indiana">Indiana</SelectItem>
                            <SelectItem value="iowa">Iowa</SelectItem>
                            <SelectItem value="kansas">Kansas</SelectItem>
                            <SelectItem value="kentucky">Kentucky</SelectItem>
                            <SelectItem value="louisiana">Louisiana</SelectItem>
                            <SelectItem value="maine">Maine</SelectItem>
                            <SelectItem value="maryland">Maryland</SelectItem>
                            <SelectItem value="massachusetts">Massachusetts</SelectItem>
                            <SelectItem value="michigan">Michigan</SelectItem>
                            <SelectItem value="minnesota">Minnesota</SelectItem>
                            <SelectItem value="mississippi">Mississippi</SelectItem>
                            <SelectItem value="missouri">Missouri</SelectItem>
                            <SelectItem value="montana">Montana</SelectItem>
                            <SelectItem value="nebraska">Nebraska</SelectItem>
                            <SelectItem value="nevada">Nevada</SelectItem>
                            <SelectItem value="new-hampshire">New Hampshire</SelectItem>
                            <SelectItem value="new-jersey">New Jersey</SelectItem>
                            <SelectItem value="new-mexico">New Mexico</SelectItem>
                            <SelectItem value="new-york">New York</SelectItem>
                            <SelectItem value="north-carolina">North Carolina</SelectItem>
                            <SelectItem value="north-dakota">North Dakota</SelectItem>
                            <SelectItem value="ohio">Ohio</SelectItem>
                            <SelectItem value="oklahoma">Oklahoma</SelectItem>
                            <SelectItem value="oregon">Oregon</SelectItem>
                            <SelectItem value="pennsylvania">Pennsylvania</SelectItem>
                            <SelectItem value="rhode-island">Rhode Island</SelectItem>
                            <SelectItem value="south-carolina">South Carolina</SelectItem>
                            <SelectItem value="south-dakota">South Dakota</SelectItem>
                            <SelectItem value="tennessee">Tennessee</SelectItem>
                            <SelectItem value="texas">Texas</SelectItem>
                            <SelectItem value="utah">Utah</SelectItem>
                            <SelectItem value="vermont">Vermont</SelectItem>
                            <SelectItem value="virginia">Virginia</SelectItem>
                            <SelectItem value="washington">Washington</SelectItem>
                            <SelectItem value="west-virginia">West Virginia</SelectItem>
                            <SelectItem value="wisconsin">Wisconsin</SelectItem>
                            <SelectItem value="wyoming">Wyoming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject-select">Subject Area</Label>
                        <Select value={alignmentSubject} onValueChange={setAlignmentSubject}>
                          <SelectTrigger data-testid="select-alignment-subject">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english-language-arts">English Language Arts</SelectItem>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="social-studies">Social Studies</SelectItem>
                            <SelectItem value="career-technical-education">Career & Technical Education</SelectItem>
                            <SelectItem value="health-education">Health Education</SelectItem>
                            <SelectItem value="physical-education">Physical Education</SelectItem>
                            <SelectItem value="arts-education">Arts Education</SelectItem>
                            <SelectItem value="world-languages">World Languages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="goal-align">IEP Goal to Align</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAlignmentGoalText('');
                            setSelectedAlignmentTemplate('');
                          }}
                          data-testid="button-clear-alignment-goal"
                        >
                          Clear Goal
                        </Button>
                      </div>
                      
                      {/* Template Goal Selection */}
                      <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                        <Label className="text-sm font-semibold">Choose from Template Goals</Label>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="template-category">Template Category</Label>
                            <Select value={selectedTemplateCategory} onValueChange={setSelectedTemplateCategory}>
                              <SelectTrigger data-testid="select-template-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reading">Reading Comprehension</SelectItem>
                                <SelectItem value="math">Mathematics</SelectItem>
                                <SelectItem value="writing">Written Expression</SelectItem>
                                <SelectItem value="science">Science</SelectItem>
                                <SelectItem value="social">Social Studies</SelectItem>
                                <SelectItem value="behavior">Behavior/Social Skills</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {selectedTemplateCategory && (
                            <div className="space-y-2">
                              <Label htmlFor="template-goal">Template Goal</Label>
                              <Select value={selectedAlignmentTemplate} onValueChange={(value) => {
                                setSelectedAlignmentTemplate(value);
                                const categoryTemplates = ALIGNMENT_TEMPLATE_GOALS[selectedTemplateCategory as keyof typeof ALIGNMENT_TEMPLATE_GOALS];
                                const goalIndex = parseInt(value);
                                if (categoryTemplates && !isNaN(goalIndex)) {
                                  setAlignmentGoalText(categoryTemplates[goalIndex]);
                                }
                              }}>
                                <SelectTrigger data-testid="select-template-goal">
                                  <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ALIGNMENT_TEMPLATE_GOALS[selectedTemplateCategory as keyof typeof ALIGNMENT_TEMPLATE_GOALS]?.map((goal, index) => (
                                    <SelectItem key={index} value={index.toString()}>
                                      {goal.substring(0, 60)}...
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>

                      <Textarea
                        id="goal-align"
                        value={alignmentGoalText}
                        onChange={(e) => setAlignmentGoalText(e.target.value)}
                        placeholder="Enter the IEP goal you want to align with standards, or select a template above..."
                        rows={4}
                        data-testid="textarea-align-goal"
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleAlignStandards}
                      disabled={!alignmentGoalText || !alignmentState || !alignmentSubject || isAligning}
                      data-testid="button-align-standards"
                    >
                      {isAligning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing Standards Alignment...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analyze Standards Alignment
                        </>
                      )}
                    </Button>

                    {/* Results Display */}
                    {alignmentResults && (
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Standards Alignment Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label className="text-sm font-medium">Overall Alignment Score</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={alignmentResults.overallScore} className="flex-1" />
                                <span className="text-sm font-medium">{alignmentResults.overallScore}%</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Analysis Confidence</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={alignmentResults.confidence} className="flex-1" />
                                <span className="text-sm font-medium">{alignmentResults.confidence}%</span>
                              </div>
                            </div>
                          </div>

                          {alignmentResults.primaryStandards && alignmentResults.primaryStandards.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Primary Standards Matches</Label>
                              <div className="space-y-2">
                                {alignmentResults.primaryStandards.map((standard: any, index: number) => (
                                  <div key={index} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                        {standard.code}
                                      </code>
                                      <Badge variant="secondary">{standard.score}% match</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {standard.description}
                                    </p>
                                    {standard.matchedKeywords && standard.matchedKeywords.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {standard.matchedKeywords.map((keyword: string, idx: number) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {keyword}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {alignmentResults.recommendations && alignmentResults.recommendations.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">AI Recommendations</Label>
                              <div className="space-y-2">
                                {alignmentResults.recommendations.map((rec: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-900 dark:text-blue-100">{rec}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}