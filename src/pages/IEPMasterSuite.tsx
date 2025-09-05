import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, Target, CheckCircle, Brain, Upload, Lightbulb, BarChart3, X } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { StudentSelector } from "@/components/StudentSelector";

// Sample goals for compliance testing
const SAMPLE_IEP_GOALS = {
  reading: [
    "By the end of the IEP year, when given a grade-level text, Student will read with 95% accuracy at a rate of 120 words per minute, as measured by weekly progress monitoring and quarterly assessments.",
    "By the end of the IEP year, when presented with a grade-appropriate passage, Student will identify the main idea and two supporting details with 80% accuracy across 4 out of 5 consecutive trials.",
    "By the end of the IEP year, Student will demonstrate reading comprehension by answering literal and inferential questions about grade-level text with 85% accuracy over three consecutive sessions."
  ],
  writing: [
    "By the end of the IEP year, Student will compose a 5-paragraph essay with clear topic sentences, supporting details, and conclusion with 80% accuracy as measured by rubric assessment quarterly.",
    "By the end of the IEP year, when given a writing prompt, Student will produce a coherent paragraph containing at least 5 sentences with proper capitalization and punctuation in 4 out of 5 attempts.",
    "By the end of the IEP year, Student will edit and revise written work for grammar, spelling, and clarity, demonstrating improvement in 3 out of 4 weekly writing samples."
  ],
  math: [
    "By the end of the IEP year, Student will solve multi-step word problems involving addition and subtraction of whole numbers with 85% accuracy across 4 consecutive assessments.",
    "By the end of the IEP year, when presented with grade-level mathematical equations, Student will demonstrate fluency in basic multiplication facts (0-12) with 90% accuracy in 2 minutes or less.",
    "By the end of the IEP year, Student will identify and extend patterns in number sequences with 80% accuracy over 3 consecutive data collection sessions."
  ],
  communication: [
    "By the end of the IEP year, Student will initiate appropriate social greetings and maintain conversational turns for 3-5 exchanges in 8 out of 10 opportunities across various school settings.",
    "By the end of the IEP year, Student will request assistance using appropriate verbal or augmentative communication methods in 90% of observed opportunities during structured activities.",
    "By the end of the IEP year, Student will follow 2-3 step directions containing temporal and spatial concepts with 85% accuracy across multiple classroom environments."
  ],
  behavior: [
    "By the end of the IEP year, Student will remain in designated area during independent work time for 20 consecutive minutes without redirection in 4 out of 5 observed sessions.",
    "By the end of the IEP year, when experiencing frustration, Student will use appropriate coping strategies (deep breathing, requesting a break) instead of disruptive behaviors in 80% of opportunities.",
    "By the end of the IEP year, Student will transition between activities within 2 minutes when given a 5-minute warning and visual schedule in 9 out of 10 consecutive trials."
  ]
};

// Professional template goals for standards alignment
const ALIGNMENT_TEMPLATE_GOALS = {
  reading: [
    "By the end of the IEP year, when given grade-level literary texts, Student will analyze character development and plot progression, demonstrating comprehension through written responses that include textual evidence, with 85% accuracy over 4 consecutive assessments aligned with state reading standards.",
    "By the end of the IEP year, Student will demonstrate phonemic awareness by identifying, blending, and segmenting sounds in multisyllabic words, achieving mastery criteria of 90% accuracy across 3 consecutive sessions as measured by standardized assessments.",
    "By the end of the IEP year, when presented with informational texts at grade level, Student will identify main ideas, supporting details, and text structure, summarizing key information with 80% accuracy on quarterly curriculum-based measurements.",
    "By the end of the IEP year, Student will decode unfamiliar words using phonetic strategies and context clues, reading grade-level passages with 95% accuracy and appropriate fluency as measured by standardized oral reading assessments.",
    "By the end of the IEP year, Student will compare and contrast information from multiple sources on the same topic, demonstrating critical thinking skills through written analysis with 85% proficiency on state-aligned rubrics."
  ],
  math: [
    "By the end of the IEP year, Student will solve multi-step word problems involving fractions, decimals, and percentages, demonstrating problem-solving strategies and mathematical reasoning with 85% accuracy on state-aligned assessments.",
    "By the end of the IEP year, when given algebraic expressions and equations, Student will identify variables, coefficients, and constants, solving for unknown values with 80% accuracy across 4 consecutive evaluations.",
    "By the end of the IEP year, Student will analyze geometric shapes and their properties, calculating area, perimeter, and volume using appropriate formulas with 90% accuracy on standardized measurements.",
    "By the end of the IEP year, Student will collect, organize, and interpret data using charts, graphs, and statistical measures, drawing conclusions supported by evidence with 85% proficiency on curriculum assessments.",
    "By the end of the IEP year, Student will demonstrate number sense through estimation, rounding, and mental math strategies, solving computational problems with 95% accuracy on timed assessments."
  ],
  writing: [
    "By the end of the IEP year, Student will compose argumentative essays with clear thesis statements, supporting evidence, and logical conclusions, meeting state writing standards with proficient scores on quarterly assessments.",
    "By the end of the IEP year, when given narrative writing prompts, Student will develop characters, setting, and plot using descriptive language and proper story structure, achieving 85% on state-aligned rubrics.",
    "By the end of the IEP year, Student will demonstrate command of grammar, usage, and mechanics in written work, editing and revising for clarity and correctness with 90% accuracy on standardized writing samples.",
    "By the end of the IEP year, Student will conduct research using multiple sources, synthesizing information and citing evidence appropriately in informational writing with 80% proficiency on curriculum-based measures.",
    "By the end of the IEP year, Student will adapt writing style and format for different purposes and audiences, demonstrating awareness of conventions across various text types with 85% accuracy on authentic assessments."
  ],
  science: [
    "By the end of the IEP year, Student will design and conduct scientific investigations, forming hypotheses and drawing evidence-based conclusions aligned with Next Generation Science Standards with 85% accuracy on performance assessments.",
    "By the end of the IEP year, when studying life science concepts, Student will explain relationships between organisms and their environment, demonstrating understanding of ecological principles with 80% proficiency on state assessments.",
    "By the end of the IEP year, Student will analyze physical and chemical properties of matter, predicting and explaining changes in state and composition with 90% accuracy on laboratory assessments.",
    "By the end of the IEP year, Student will interpret scientific data from graphs, charts, and diagrams, identifying patterns and trends to support scientific explanations with 85% accuracy on curriculum measures.",
    "By the end of the IEP year, Student will communicate scientific findings through written reports and oral presentations, using appropriate scientific vocabulary and evidence with proficient scores on standardized rubrics."
  ],
  social: [
    "By the end of the IEP year, Student will analyze historical events and their causes and effects, demonstrating understanding of chronological thinking and historical interpretation with 85% accuracy on state social studies assessments.",
    "By the end of the IEP year, when studying geographical concepts, Student will interpret maps, charts, and graphs to understand spatial relationships and human-environment interactions with 80% proficiency on curriculum evaluations.",
    "By the end of the IEP year, Student will explain the structure and functions of government institutions, demonstrating civic knowledge and understanding of democratic principles with 90% accuracy on standardized assessments.",
    "By the end of the IEP year, Student will analyze economic concepts including supply and demand, resources, and trade, applying economic reasoning to real-world scenarios with 85% proficiency on performance tasks.",
    "By the end of the IEP year, Student will evaluate multiple perspectives on historical and contemporary issues, developing arguments supported by evidence and demonstrating critical thinking skills with 80% accuracy on authentic assessments."
  ],
  behavior: [
    "By the end of the IEP year, Student will demonstrate self-regulation skills by implementing learned coping strategies when facing academic or social challenges, reducing disruptive behaviors by 80% as measured by daily behavior tracking data.",
    "By the end of the IEP year, Student will engage in collaborative learning activities, contributing positively to group work and respecting diverse perspectives, achieving social competency benchmarks in 90% of observed interactions.",
    "By the end of the IEP year, when presented with novel or challenging tasks, Student will persist through difficulties using problem-solving strategies and seeking appropriate help, demonstrating growth mindset in 85% of opportunities.",
    "By the end of the IEP year, Student will follow classroom and school-wide behavioral expectations consistently, demonstrating responsibility and respect for learning environment in 95% of observed instances across all settings.",
    "By the end of the IEP year, Student will develop and maintain positive peer relationships through appropriate social communication, conflict resolution, and empathy, achieving social interaction goals in 80% of structured and unstructured activities."
  ]
};

// Review types for document analysis
const reviewTypes = [
  {
    value: 'iep_quality',
    label: 'IEP Quality Review',
    description: 'Comprehensive quality analysis with scoring'
  },
  {
    value: 'compliance_analysis',
    label: 'Compliance Analysis',
    description: 'Check IDEA compliance and requirements'
  },
  {
    value: 'accommodation_review',
    label: 'Accommodation Review',
    description: 'Analyze accommodations and modifications'
  },
  {
    value: 'meeting_preparation',
    label: 'Meeting Preparation',
    description: 'Prepare for upcoming IEP meetings'
  },
  {
    value: 'goal_analysis',
    label: 'Goal Analysis',
    description: 'Deep dive into IEP goals and objectives'
  }
];

// US States for standards alignment
const US_STATES = [
  'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'
];

// Academic subjects
const ACADEMIC_SUBJECTS = [
  'English Language Arts',
  'Mathematics', 
  'Science',
  'Social Studies',
  'Reading',
  'Writing',
  'Health',
  'Physical Education',
  'Fine Arts',
  'World Languages',
  'Career and Technical Education'
];

export default function IEPMasterSuite() {
  const [activeTab, setActiveTab] = useState<'review' | 'generate' | 'check' | 'align'>('review');
  const { toast } = useToast();
  
  // Document Review States
  const [selectedReviewType, setSelectedReviewType] = useState('iep_quality');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Goal Generation States
  const [goalGenerationCategory, setGoalGenerationCategory] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [goalArea, setGoalArea] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const [generatedGoals, setGeneratedGoals] = useState<string[]>([]);

  // Compliance Check States
  const [selectedGoalCategory, setSelectedGoalCategory] = useState('');
  const [selectedPresetGoal, setSelectedPresetGoal] = useState('');
  const [complianceGoalText, setComplianceGoalText] = useState('');
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [complianceResult, setComplianceResult] = useState<any>(null);

  // Standards Alignment States
  const [alignmentState, setAlignmentState] = useState('California');
  const [alignmentSubject, setAlignmentSubject] = useState('English Language Arts');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('reading');
  const [selectedAlignmentTemplate, setSelectedAlignmentTemplate] = useState('');
  const [alignmentGoalText, setAlignmentGoalText] = useState('');
  const [isAligning, setIsAligning] = useState(false);
  const [alignmentResults, setAlignmentResults] = useState<any>(null);

  const handleGenerateGoals = async () => {
    if (!goalGenerationCategory || !studentAge || !goalArea || !currentLevel || !targetLevel) return;
    
    setIsGeneratingGoals(true);
    
    // Simulate AI goal generation
    setTimeout(() => {
      const goalTemplates = {
        reading: [
          `By the end of the IEP year, when given grade-level literary texts, ${studentAge}-year-old Student will improve from ${currentLevel} to ${targetLevel} reading comprehension, demonstrating understanding through written responses with 85% accuracy over 4 consecutive assessments.`,
          `By the end of the IEP year, Student will advance reading fluency from ${currentLevel} to ${targetLevel} words per minute with 95% accuracy when reading grade-appropriate passages, as measured by weekly progress monitoring.`,
          `By the end of the IEP year, Student will improve from ${currentLevel} to ${targetLevel} in identifying main ideas and supporting details in informational texts with 80% accuracy across 3 consecutive sessions.`
        ],
        writing: [
          `By the end of the IEP year, Student will progress from ${currentLevel} to ${targetLevel} in written expression, composing coherent paragraphs with proper structure and mechanics with 85% accuracy on quarterly assessments.`,
          `By the end of the IEP year, Student will improve from ${currentLevel} to ${targetLevel} in narrative writing, developing characters, setting, and plot with appropriate detail and sequence in 4 out of 5 writing samples.`,
          `By the end of the IEP year, Student will advance from ${currentLevel} to ${targetLevel} in editing and revising written work for grammar, spelling, and clarity in 90% of weekly writing assignments.`
        ],
        math: [
          `By the end of the IEP year, Student will improve mathematical problem-solving skills from ${currentLevel} to ${targetLevel}, solving multi-step word problems with 85% accuracy on standardized assessments.`,
          `By the end of the IEP year, Student will advance computational fluency from ${currentLevel} to ${targetLevel} in basic math facts, achieving mastery criteria in 2 minutes or less with 95% accuracy.`,
          `By the end of the IEP year, Student will progress from ${currentLevel} to ${targetLevel} in mathematical reasoning, explaining problem-solving strategies and solutions with 80% proficiency on performance tasks.`
        ],
        communication: [
          `By the end of the IEP year, Student will improve expressive language skills from ${currentLevel} to ${targetLevel}, initiating and maintaining conversations for 5+ exchanges in 85% of opportunities across school settings.`,
          `By the end of the IEP year, Student will advance from ${currentLevel} to ${targetLevel} in following multi-step directions, completing 3-4 step instructions with 90% accuracy in classroom environments.`,
          `By the end of the IEP year, Student will progress from ${currentLevel} to ${targetLevel} in social communication, using appropriate verbal and nonverbal communication in structured activities with 80% success.`
        ],
        behavior: [
          `By the end of the IEP year, Student will improve self-regulation from ${currentLevel} to ${targetLevel}, implementing learned coping strategies when facing challenges with 85% success rate as measured by daily behavior data.`,
          `By the end of the IEP year, Student will advance from ${currentLevel} to ${targetLevel} in following classroom expectations, demonstrating appropriate behavior in structured activities for 90% of observed intervals.`,
          `By the end of the IEP year, Student will progress from ${currentLevel} to ${targetLevel} in transition skills, moving between activities within specified timeframes with minimal prompting in 80% of opportunities.`
        ]
      };

      const categoryGoals = goalTemplates[goalGenerationCategory as keyof typeof goalTemplates] || [];
      setGeneratedGoals(categoryGoals);
      setIsGeneratingGoals(false);
      
      toast({
        title: "Goals Generated Successfully",
        description: `Generated ${categoryGoals.length} personalized IEP goals.`
      });
    }, 2500);
  };

  const handleComplianceCheck = async () => {
    if (!complianceGoalText.trim()) return;
    
    setIsCheckingCompliance(true);
    
    // Simulate compliance analysis
    setTimeout(() => {
      const mockResult = {
        overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
        criteria: {
          specific: Math.random() > 0.3,
          measurable: Math.random() > 0.2,
          achievable: Math.random() > 0.4,
          relevant: Math.random() > 0.1,
          timeBound: Math.random() > 0.3
        },
        suggestions: [
          "Consider adding more specific measurement criteria",
          "Include baseline data for better progress monitoring",
          "Specify the learning environment and conditions"
        ]
      };
      setComplianceResult(mockResult);
      setIsCheckingCompliance(false);
      
      toast({
        title: "Compliance Analysis Complete",
        description: `Goal scored ${mockResult.overallScore}% overall compliance.`
      });
    }, 2000);
  };

  const handleAlignStandards = async () => {
    if (!alignmentGoalText || !alignmentState || !alignmentSubject) return;
    
    setIsAligning(true);
    
    // Simulate standards alignment analysis  
    setTimeout(() => {
      const mockResults = {
        overallScore: 0.85,
        primaryStandards: [
          {
            code: "CCSS.ELA-LITERACY.RL.4.1",
            description: "Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text.",
            score: 0.92,
            reasoning: "Goal aligns well with comprehension and inference skills",
            matchedKeywords: ["comprehension", "details", "text"]
          },
          {
            code: "CCSS.ELA-LITERACY.RL.4.3", 
            description: "Describe in depth a character, setting, or event in a story or drama, drawing on specific details in the text.",
            score: 0.78,
            reasoning: "Partially aligned with character analysis components",
            matchedKeywords: ["character", "details"]
          }
        ],
        recommendations: [
          "Consider adding specific reference to textual evidence",
          "Include vocabulary development component",
          "Align measurement criteria with state assessment format"
        ]
      };
      setAlignmentResults(mockResults);
      setIsAligning(false);
      
      toast({
        title: "Standards Alignment Complete", 
        description: `Found ${mockResults.primaryStandards.length} primary standard matches.`
      });
    }, 2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">IEP Master Suite</h1>
                <p className="text-muted-foreground">Comprehensive IEP analysis and goal management platform</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              <FileText className="h-3 w-3 mr-1" />
              Professional Templates
            </Badge>
          </div>
        </div>

        {/* Organized Workflow Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <div className="border rounded-lg bg-card">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="review" className="flex flex-col items-center gap-1 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs font-medium">Document Review</span>
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex flex-col items-center gap-1 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Target className="h-5 w-5" />
                  <span className="text-xs font-medium">Generate Goals</span>
                </TabsTrigger>
                <TabsTrigger value="check" className="flex flex-col items-center gap-1 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Check Compliance</span>
                </TabsTrigger>
                <TabsTrigger value="align" className="flex flex-col items-center gap-1 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Brain className="h-5 w-5" />
                  <span className="text-xs font-medium">Standards Alignment</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Document Review Tab */}
              <TabsContent value="review" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">IEP Document Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload and analyze complete IEP documents for quality, compliance, and recommendations</p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Analysis Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                          <Label className="text-sm font-medium">Student Context (Optional)</Label>
                          <StudentSelector 
                            selectedStudent={selectedStudentId?.toString() || ''} 
                            onStudentChange={(id) => setSelectedStudentId(id ? parseInt(id) : null)} 
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Document Upload</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DocumentUpload 
                          onAnalysisComplete={(analysis) => {
                            toast({
                              title: "Analysis Complete",
                              description: "Your IEP document has been analyzed successfully."
                            });
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Generate Goals Tab */}
              <TabsContent value="generate" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI-Powered Goal Generation</h3>
                    <p className="text-sm text-muted-foreground mb-4">Generate personalized, SMART IEP goals tailored to student needs and current performance levels</p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Student Information & Goal Parameters</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Student Age</Label>
                            <Input
                              placeholder="e.g., 8"
                              value={studentAge}
                              onChange={(e) => setStudentAge(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Grade Level</Label>
                            <Input
                              placeholder="e.g., 3rd grade"
                              value={studentGrade}
                              onChange={(e) => setStudentGrade(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Goal Category</Label>
                          <Select value={goalGenerationCategory} onValueChange={setGoalGenerationCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select goal area" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reading">Reading Comprehension</SelectItem>
                              <SelectItem value="writing">Written Expression</SelectItem>
                              <SelectItem value="math">Mathematics</SelectItem>
                              <SelectItem value="communication">Communication Skills</SelectItem>
                              <SelectItem value="behavior">Behavior & Social Skills</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Specific Goal Area</Label>
                          <Input
                            placeholder="e.g., Reading fluency, Mathematical problem solving"
                            value={goalArea}
                            onChange={(e) => setGoalArea(e.target.value)}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Current Performance Level</Label>
                            <Input
                              placeholder="e.g., 50 words per minute"
                              value={currentLevel}
                              onChange={(e) => setCurrentLevel(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Target Level</Label>
                            <Input
                              placeholder="e.g., 80 words per minute"
                              value={targetLevel}
                              onChange={(e) => setTargetLevel(e.target.value)}
                            />
                          </div>
                        </div>

                        <Button 
                          onClick={handleGenerateGoals} 
                          disabled={isGeneratingGoals || !goalGenerationCategory || !studentAge || !goalArea || !currentLevel || !targetLevel}
                          className="w-full"
                          data-testid="button-generate-goals"
                        >
                          {isGeneratingGoals ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Generating Goals...
                            </>
                          ) : (
                            <>
                              <Target className="h-4 w-4 mr-2" />
                              Generate IEP Goals
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {generatedGoals.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Generated IEP Goals
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            {generatedGoals.map((goal, index) => (
                              <div key={index} className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-start justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    Goal {index + 1}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      navigator.clipboard.writeText(goal);
                                      toast({
                                        title: "Goal Copied",
                                        description: "Goal text copied to clipboard."
                                      });
                                    }}
                                    className="text-xs h-6 px-2"
                                  >
                                    Copy
                                  </Button>
                                </div>
                                <p className="text-sm leading-relaxed">{goal}</p>
                              </div>
                            ))}
                          </div>

                          <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              These goals are AI-generated templates. Please review and customize them based on your student's specific needs, current IEP, and team input before implementation.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Check Compliance Tab */}
              <TabsContent value="check" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">SMART Goal Compliance Checker</h3>
                    <p className="text-sm text-muted-foreground mb-4">Verify your IEP goals meet SMART criteria and IDEA compliance standards</p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Goal Input</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Select Template Goal</Label>
                          <div className="grid gap-2">
                            <Select value={selectedGoalCategory} onValueChange={setSelectedGoalCategory}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reading">Reading</SelectItem>
                                <SelectItem value="writing">Writing</SelectItem>
                                <SelectItem value="math">Math</SelectItem>
                                <SelectItem value="communication">Communication</SelectItem>
                                <SelectItem value="behavior">Behavior</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {selectedGoalCategory && (
                              <Select value={selectedPresetGoal} onValueChange={(value) => {
                                setSelectedPresetGoal(value);
                                setComplianceGoalText(value);
                              }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a sample goal" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SAMPLE_IEP_GOALS[selectedGoalCategory as keyof typeof SAMPLE_IEP_GOALS]?.map((goal, index) => (
                                    <SelectItem key={index} value={goal}>
                                      <div className="max-w-md truncate">{goal.substring(0, 80)}...</div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Or Enter Custom Goal</Label>
                          <Textarea
                            placeholder="Enter your IEP goal here for compliance analysis..."
                            value={complianceGoalText}
                            onChange={(e) => setComplianceGoalText(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>

                        <Button 
                          onClick={handleComplianceCheck} 
                          disabled={isCheckingCompliance || !complianceGoalText.trim()}
                          className="w-full"
                          data-testid="button-check-compliance"
                        >
                          {isCheckingCompliance ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Check Compliance
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {complianceResult && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Compliance Analysis Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Overall Score</span>
                              <Badge variant={complianceResult.overallScore >= 80 ? "default" : "secondary"}>
                                {complianceResult.overallScore}%
                              </Badge>
                            </div>
                            <Progress value={complianceResult.overallScore} className="h-2" />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">SMART Criteria</Label>
                            <div className="grid gap-2">
                              {Object.entries(complianceResult.criteria).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between py-1">
                                  <span className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  {value ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {complianceResult.suggestions.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Recommendations</Label>
                              <div className="space-y-2">
                                {complianceResult.suggestions.map((suggestion, index) => (
                                  <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                                    <Lightbulb className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs text-blue-900 dark:text-blue-100">{suggestion}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Standards Alignment Tab */}
              <TabsContent value="align" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Standards Alignment Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-4">Align IEP goals with state academic standards using our professional template library</p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Goal & Standards Selection</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">State</Label>
                            <Select value={alignmentState} onValueChange={setAlignmentState}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {US_STATES.map((state) => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Subject</Label>
                            <Select value={alignmentSubject} onValueChange={setAlignmentSubject}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {ACADEMIC_SUBJECTS.map((subject) => (
                                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Professional Template Goals</Label>
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
                            placeholder="Enter or select an IEP goal for standards alignment analysis..."
                            value={alignmentGoalText}
                            onChange={(e) => setAlignmentGoalText(e.target.value)}
                            className="min-h-[120px]"
                          />
                        </div>

                        <Button 
                          onClick={handleAlignStandards} 
                          disabled={isAligning || !alignmentGoalText || !alignmentState || !alignmentSubject}
                          className="w-full"
                          data-testid="button-align-standards"
                        >
                          {isAligning ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Analyzing Alignment...
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Analyze Standards Alignment
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {alignmentResults && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Standards Alignment Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Alignment Score</span>
                            <Badge variant="default">
                              {Math.round(alignmentResults.overallScore * 100)}%
                            </Badge>
                          </div>

                          {alignmentResults.primaryStandards && alignmentResults.primaryStandards.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Primary Standards Matches</Label>
                              <div className="space-y-3">
                                {alignmentResults.primaryStandards.map((match: any, index: number) => (
                                  <div key={index} className="p-3 border rounded-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-xs">{match.code}</Badge>
                                      <Badge variant={match.score > 0.8 ? "default" : "secondary"} className="text-xs">
                                        {Math.round(match.score * 100)}%
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{match.description}</p>
                                    {match.reasoning && (
                                      <p className="text-xs text-blue-600 dark:text-blue-400">{match.reasoning}</p>
                                    )}
                                    {match.matchedKeywords && match.matchedKeywords.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {match.matchedKeywords.map((keyword: string, idx: number) => (
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
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">AI Recommendations</Label>
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
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}