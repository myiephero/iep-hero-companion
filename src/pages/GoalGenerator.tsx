import { DashboardLayout } from "@/layouts/DashboardLayout";
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
import { Target, Brain, CheckCircle, Lightbulb, BookOpen, Clock, Upload, FileText, AlertCircle, CheckCheck, Users, UserPlus, User, GraduationCap, Heart, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { StudentSelector } from "@/components/StudentSelector";
import { apiRequest } from "@/lib/queryClient";

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

// Pre-populated IEP goals database
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

export default function GoalGenerator() {
  const [activeTab, setActiveTab] = useState<'generate' | 'check' | 'align'>('generate');
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
  
  // Student selection states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [useExistingStudent, setUseExistingStudent] = useState(false);
  
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

  const handleGenerateGoals = async () => {
    setIsGenerating(true);
    
    // Simulate AI goal generation
    setTimeout(() => {
      const sampleGoals: GeneratedGoal[] = [
        {
          id: '1',
          category: 'Academic - Reading',
          goal: `By the end of the IEP year, when given grade-level text passages, ${studentInfo.name || 'the student'} will read with 90% accuracy and demonstrate comprehension by answering literal and inferential questions with 80% accuracy across 4 consecutive weekly probes.`,
          objectives: [
            'Read grade-level words with 95% accuracy in weekly assessments',
            'Answer 4 out of 5 literal comprehension questions correctly',
            'Answer 3 out of 5 inferential comprehension questions correctly'
          ],
          measurableData: 'Weekly reading assessments, comprehension question accuracy',
          timeframe: 'One IEP year (12 months)',
          complianceScore: 95,
          standards: ['CCSS.ELA-LITERACY.RF.3.4', 'CCSS.ELA-LITERACY.RL.3.1']
        },
        {
          id: '2',
          category: 'Communication',
          goal: `By the end of the IEP year, when presented with social situations requiring verbal interaction, ${studentInfo.name || 'the student'} will initiate appropriate social communication using complete sentences in 80% of opportunities across 3 consecutive weeks.`,
          objectives: [
            'Initiate greetings with peers and adults 4 out of 5 times',
            'Use complete sentences when requesting assistance',
            'Engage in turn-taking conversations for 3+ exchanges'
          ],
          measurableData: 'Direct observation data, communication logs',
          timeframe: 'One IEP year (12 months)',
          complianceScore: 92,
          standards: ['CCSS.ELA-LITERACY.SL.3.1', 'CCSS.ELA-LITERACY.SL.3.6']
        }
      ];
      
      setGeneratedGoals(sampleGoals);
      setIsGenerating(false);
    }, 3000);
  };

  const handleAlignStandards = async () => {
    if (!alignmentGoalText || !alignmentState || !alignmentSubject) return;
    
    setIsAligning(true);
    
    try {
      // Real standards alignment analysis using our new API
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
      // Provide helpful error message to user
      setAlignmentResults({
        primaryStandards: [],
        secondaryStandards: [],
        recommendations: [
          'Unable to analyze standards alignment at this time.',
          'Please check your goal text and try again.',
          'Contact support if the issue persists.'
        ],
        overallScore: 0,
        confidence: 0
      });
    } finally {
      setIsAligning(false);
    }
  };

  // Handle student selection and auto-populate form
  const handleStudentSelection = async (studentId: string) => {
    setSelectedStudentId(studentId);
    
    if (studentId && studentId !== 'no-student') {
      try {
        const response = await apiRequest('GET', `/api/students/${studentId}`);
        const student = await response.json();
        
        // Auto-populate form with student data
        setStudentInfo({
          name: student.full_name?.split(' ')[0] || '', // Use first name only
          grade: student.grade_level || '',
          disability: student.disability_category || '',
          currentLevel: '',
          area: '',
          strengths: '',
          needs: ''
        });
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    } else {
      // Reset form if no student selected
      setStudentInfo({
        name: '',
        grade: '',
        disability: '',
        currentLevel: '',
        area: '',
        strengths: '',
        needs: ''
      });
    }
  };

  const checkCompliance = (goal: GeneratedGoal) => {
    // Simple compliance scoring based on goal structure
    let score = 0;
    if (goal.goal.includes('By the end of')) score += 20;
    if (goal.goal.includes('%')) score += 20;
    if (goal.objectives.length >= 3) score += 20;
    if (goal.timeframe) score += 20;
    if (goal.standards.length > 0) score += 20;
    return score;
  };

  const renderGenerateTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Student Information
          </CardTitle>
          <CardDescription>
            Select an existing student or enter new student information to generate personalized SMART goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-4 p-6 border rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <Label htmlFor="student-select" className="text-sm font-medium">
                  Select Student from Caseload
                </Label>
              </div>
              <StudentSelector
                selectedStudent={selectedStudentId}
                onStudentChange={handleStudentSelection}
                placeholder="Choose a student to auto-fill information..."
                allowEmpty={true}
              />
              {selectedStudentId && selectedStudentId !== 'no-student' && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-md">
                  <CheckCircle className="h-4 w-4" />
                  Student selected - basic information will be auto-filled
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Student Details
              </h4>
              
          
          <div className="space-y-2">
            <Label htmlFor="disability">Primary Disability Category</Label>
            <Select 
              value={studentInfo.disability} 
              onValueChange={(value) => setStudentInfo({...studentInfo, disability: value})}
              disabled={useExistingStudent && selectedStudentId && selectedStudentId !== 'no-student'}
            >
              <SelectTrigger data-testid="select-disability">
                <SelectValue placeholder="Select primary disability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="autism">Autism</SelectItem>
                <SelectItem value="intellectual">Intellectual Disability</SelectItem>
                <SelectItem value="specific-learning">Specific Learning Disability</SelectItem>
                <SelectItem value="speech-language">Speech or Language Impairment</SelectItem>
                <SelectItem value="emotional">Emotional Behavioral Disability</SelectItem>
                <SelectItem value="other-health">Other Health Impairment</SelectItem>
                <SelectItem value="multiple">Multiple Disabilities</SelectItem>
                <SelectItem value="deaf-hard">Deafness/Hard of Hearing</SelectItem>
                <SelectItem value="visual">Visual Impairment</SelectItem>
                <SelectItem value="orthopedic">Orthopedic Impairment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-area">Goal Area Focus</Label>
            <Select value={studentInfo.area} onValueChange={(value) => setStudentInfo({...studentInfo, area: value})}>
              <SelectTrigger data-testid="select-goal-area">
                <SelectValue placeholder="Select goal area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="writing">Written Expression</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="social-emotional">Social/Emotional</SelectItem>
                <SelectItem value="behavior">Behavior</SelectItem>
                <SelectItem value="motor">Fine/Gross Motor</SelectItem>
                <SelectItem value="daily-living">Daily Living Skills</SelectItem>
                <SelectItem value="vocational">Vocational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-level">Current Performance Level</Label>
            <Textarea
              id="current-level"
              value={studentInfo.currentLevel}
              onChange={(e) => setStudentInfo({...studentInfo, currentLevel: e.target.value})}
              placeholder="Describe the student's current performance level in this area..."
              rows={3}
              data-testid="textarea-current-level"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="strengths">Student Strengths</Label>
              <Textarea
                id="strengths"
                value={studentInfo.strengths}
                onChange={(e) => setStudentInfo({...studentInfo, strengths: e.target.value})}
                placeholder="List student's key strengths and interests..."
                rows={2}
                data-testid="textarea-strengths"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="needs">Areas of Need</Label>
              <Textarea
                id="needs"
                value={studentInfo.needs}
                onChange={(e) => setStudentInfo({...studentInfo, needs: e.target.value})}
                placeholder="Describe specific areas needing support..."
                rows={2}
                data-testid="textarea-needs"
              />
            </div>
          </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optional: Upload Existing IEP or Evaluation</CardTitle>
          <CardDescription>
            Upload documents to provide additional context for goal generation (PDF, DOC, DOCX)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            data-testid="dropzone-upload"
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            {uploadedFile ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOC, DOCX files up to 10MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={handleGenerateGoals}
          disabled={!studentInfo.name || !studentInfo.grade || !studentInfo.area || isGenerating}
          size="lg"
          className="px-8"
          data-testid="button-generate-goals"
        >
          {isGenerating ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              Generating SMART Goals...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Generate SMART Goals
            </>
          )}
        </Button>
      </div>

      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                AI is analyzing student information and generating personalized SMART goals...
              </div>
              <Progress value={66} className="w-full" />
              <div className="text-xs text-muted-foreground">
                Processing compliance requirements and standards alignment
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Generated SMART Goals</h3>
          {generatedGoals.map((goal) => (
            <Card key={goal.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{goal.category}</CardTitle>
                  <Badge variant={goal.complianceScore >= 90 ? "default" : "secondary"}>
                    {goal.complianceScore}% Compliant
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Annual Goal</Label>
                  <p className="text-sm p-3 bg-muted rounded-md">{goal.goal}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Short-term Objectives</Label>
                  <ul className="text-sm space-y-1 ml-4">
                    {goal.objectives.map((objective, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Measurement</Label>
                    <p className="text-sm text-muted-foreground">{goal.measurableData}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Timeframe</Label>
                    <p className="text-sm text-muted-foreground">{goal.timeframe}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Standards Alignment</Label>
                  <div className="flex flex-wrap gap-1">
                    {goal.standards.map((standard) => (
                      <Badge key={standard} variant="outline" className="text-xs">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const handleComplianceCheck = async () => {
    if (!complianceGoalText.trim()) return;
    
    setIsCheckingCompliance(true);
    
    // Simulate compliance analysis
    setTimeout(() => {
      const goalText = complianceGoalText.toLowerCase();
      
      const criteria = {
        measurable: goalText.includes('%') || goalText.includes('accuracy') || goalText.includes('out of'),
        timeframe: goalText.includes('by the end of') || goalText.includes('iep year') || goalText.includes('weeks') || goalText.includes('months'),
        conditions: goalText.includes('when given') || goalText.includes('when presented') || goalText.includes('during'),
        criteria: goalText.includes('with') && (goalText.includes('accuracy') || goalText.includes('success')),
        observable: !goalText.includes('understand') && !goalText.includes('know') && !goalText.includes('appreciate'),
        studentSpecific: goalText.includes('student') || goalText.includes('will')
      };
      
      const passedCount = Object.values(criteria).filter(Boolean).length;
      const overallScore = Math.round((passedCount / 6) * 100);
      
      const suggestions = [];
      if (!criteria.measurable) suggestions.push('Add specific measurement criteria (percentages, number correct, etc.)');
      if (!criteria.timeframe) suggestions.push('Include a clear timeframe (by the end of IEP year, within 4 weeks, etc.)');
      if (!criteria.conditions) suggestions.push('Specify conditions or circumstances (when given, when presented with, etc.)');
      if (!criteria.criteria) suggestions.push('Define success criteria (with 80% accuracy, 4 out of 5 trials, etc.)');
      if (!criteria.observable) suggestions.push('Use observable, measurable verbs instead of internal states');
      if (!criteria.studentSpecific) suggestions.push('Make the goal student-specific and clearly state what the student will do');
      
      setComplianceResult({
        overallScore,
        criteria,
        suggestions
      });
      
      setIsCheckingCompliance(false);
    }, 2000);
  };

  const renderComplianceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Checker</CardTitle>
          <CardDescription>
            Verify that IEP goals meet IDEA requirements and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Goal Selection Options */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Choose Goal Source</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedPresetGoal) {
                      setSelectedPresetGoal('');
                      setComplianceGoalText('');
                    }
                  }}
                  data-testid="button-clear-goal"
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="goal-category">Goal Category</Label>
                  <Select value={selectedGoalCategory} onValueChange={setSelectedGoalCategory}>
                    <SelectTrigger data-testid="select-goal-category">
                      <SelectValue placeholder="Select goal category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="writing">Written Expression</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="behavior">Behavior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedGoalCategory && (
                  <div className="space-y-2">
                    <Label htmlFor="preset-goal">Sample Goal</Label>
                    <Select value={selectedPresetGoal} onValueChange={(value) => {
                      setSelectedPresetGoal(value);
                      const categoryGoals = SAMPLE_IEP_GOALS[selectedGoalCategory as keyof typeof SAMPLE_IEP_GOALS];
                      const goalIndex = parseInt(value);
                      if (categoryGoals && !isNaN(goalIndex)) {
                        setComplianceGoalText(categoryGoals[goalIndex]);
                      }
                    }}>
                      <SelectTrigger data-testid="select-preset-goal">
                        <SelectValue placeholder="Choose sample goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {SAMPLE_IEP_GOALS[selectedGoalCategory as keyof typeof SAMPLE_IEP_GOALS]?.map((goal, index) => (
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

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="goal-text">IEP Goal Text</Label>
              <Textarea
                id="goal-text"
                value={complianceGoalText}
                onChange={(e) => setComplianceGoalText(e.target.value)}
                placeholder="Enter the IEP goal you want to check for compliance..."
                rows={6}
                data-testid="textarea-compliance-goal"
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleComplianceCheck}
              disabled={!complianceGoalText.trim() || isCheckingCompliance}
              data-testid="button-check-compliance"
            >
              {isCheckingCompliance ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                  Checking Compliance...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check Compliance
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isCheckingCompliance && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                Analyzing goal for IDEA compliance and best practices...
              </div>
              <Progress value={60} className="w-full" />
              <div className="text-xs text-muted-foreground">
                Checking measurability, timeframes, and criteria
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {complianceResult && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Compliance Analysis Results</CardTitle>
              <Badge variant={complianceResult.overallScore >= 80 ? "default" : complianceResult.overallScore >= 60 ? "secondary" : "destructive"}>
                {complianceResult.overallScore}% Compliant
              </Badge>
            </div>
            <CardDescription>
              Goal meets {Object.values(complianceResult.criteria).filter(Boolean).length} out of 6 key compliance criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {complianceResult.criteria.measurable ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Measurable and observable</span>
                </div>
                <div className="flex items-center gap-2">
                  {complianceResult.criteria.timeframe ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Specific timeframe included</span>
                </div>
                <div className="flex items-center gap-2">
                  {complianceResult.criteria.conditions ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Conditions specified</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {complianceResult.criteria.criteria ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Criteria for success defined</span>
                </div>
                <div className="flex items-center gap-2">
                  {complianceResult.criteria.observable ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Uses observable behaviors</span>
                </div>
                <div className="flex items-center gap-2">
                  {complianceResult.criteria.studentSpecific ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Student-specific language</span>
                </div>
              </div>
            </div>

            {complianceResult.suggestions.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-orange-600">Recommendations for Improvement</Label>
                <ul className="space-y-2">
                  {complianceResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compliance Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Measurable and observable</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Specific timeframe included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Baseline performance referenced</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Conditions specified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Criteria for success defined</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Educationally relevant</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlignmentTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Standards Alignment Tool</CardTitle>
          <CardDescription>
            Connect IEP goals to state standards and curriculum frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={alignmentState} onValueChange={setAlignmentState}>
                  <SelectTrigger data-testid="select-state">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="al">Alabama</SelectItem>
                    <SelectItem value="ak">Alaska</SelectItem>
                    <SelectItem value="az">Arizona</SelectItem>
                    <SelectItem value="ar">Arkansas</SelectItem>
                    <SelectItem value="ca">California</SelectItem>
                    <SelectItem value="co">Colorado</SelectItem>
                    <SelectItem value="ct">Connecticut</SelectItem>
                    <SelectItem value="de">Delaware</SelectItem>
                    <SelectItem value="fl">Florida</SelectItem>
                    <SelectItem value="ga">Georgia</SelectItem>
                    <SelectItem value="hi">Hawaii</SelectItem>
                    <SelectItem value="id">Idaho</SelectItem>
                    <SelectItem value="il">Illinois</SelectItem>
                    <SelectItem value="in">Indiana</SelectItem>
                    <SelectItem value="ia">Iowa</SelectItem>
                    <SelectItem value="ks">Kansas</SelectItem>
                    <SelectItem value="ky">Kentucky</SelectItem>
                    <SelectItem value="la">Louisiana</SelectItem>
                    <SelectItem value="me">Maine</SelectItem>
                    <SelectItem value="md">Maryland</SelectItem>
                    <SelectItem value="ma">Massachusetts</SelectItem>
                    <SelectItem value="mi">Michigan</SelectItem>
                    <SelectItem value="mn">Minnesota</SelectItem>
                    <SelectItem value="ms">Mississippi</SelectItem>
                    <SelectItem value="mo">Missouri</SelectItem>
                    <SelectItem value="mt">Montana</SelectItem>
                    <SelectItem value="ne">Nebraska</SelectItem>
                    <SelectItem value="nv">Nevada</SelectItem>
                    <SelectItem value="nh">New Hampshire</SelectItem>
                    <SelectItem value="nj">New Jersey</SelectItem>
                    <SelectItem value="nm">New Mexico</SelectItem>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="nc">North Carolina</SelectItem>
                    <SelectItem value="nd">North Dakota</SelectItem>
                    <SelectItem value="oh">Ohio</SelectItem>
                    <SelectItem value="ok">Oklahoma</SelectItem>
                    <SelectItem value="or">Oregon</SelectItem>
                    <SelectItem value="pa">Pennsylvania</SelectItem>
                    <SelectItem value="ri">Rhode Island</SelectItem>
                    <SelectItem value="sc">South Carolina</SelectItem>
                    <SelectItem value="sd">South Dakota</SelectItem>
                    <SelectItem value="tn">Tennessee</SelectItem>
                    <SelectItem value="tx">Texas</SelectItem>
                    <SelectItem value="ut">Utah</SelectItem>
                    <SelectItem value="vt">Vermont</SelectItem>
                    <SelectItem value="va">Virginia</SelectItem>
                    <SelectItem value="wa">Washington</SelectItem>
                    <SelectItem value="wv">West Virginia</SelectItem>
                    <SelectItem value="wi">Wisconsin</SelectItem>
                    <SelectItem value="wy">Wyoming</SelectItem>
                    <SelectItem value="dc">District of Columbia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Area</Label>
                <Select value={alignmentSubject} onValueChange={setAlignmentSubject}>
                  <SelectTrigger data-testid="select-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ela">English Language Arts</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="social">Social Studies</SelectItem>
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
                  <BookOpen className="h-4 w-4 mr-2 animate-spin" />
                  Finding Alignment...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Find Standards Alignment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isAligning && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                Analyzing goal alignment with {alignmentSubject.toUpperCase()} standards...
              </div>
              <Progress value={75} className="w-full" />
              <div className="text-xs text-muted-foreground animate-pulse">
                🔍 Analyzing goal text • 📚 Searching standards database • 🎯 Calculating alignment scores
              </div>
              <div className="text-xs text-blue-600 mt-2">
                Using real Common Core, NGSS, and state standards
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {alignmentResults && (
        <div className="space-y-4">
          {/* Overall Alignment Score */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Standards Alignment Analysis</CardTitle>
                  <CardDescription>
                    Found {alignmentResults.primaryStandards.length} primary alignments and {alignmentResults.secondaryStandards.length} secondary alignments
                  </CardDescription>
                </div>
                {alignmentResults.overallScore && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{Math.round(alignmentResults.overallScore)}</div>
                    <div className="text-xs text-muted-foreground">Alignment Score</div>
                  </div>
                )}
              </div>
              {alignmentResults.confidence && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Analysis Confidence</span>
                    <span>{Math.round(alignmentResults.confidence * 100)}%</span>
                  </div>
                  <Progress value={alignmentResults.confidence * 100} className="h-2 mt-1" />
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Primary Standards */}
          {alignmentResults.primaryStandards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Primary Standards Alignment</CardTitle>
                <CardDescription>Strong matches with high confidence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alignmentResults.primaryStandards.map((standard: any, index: number) => (
                  <div key={index} className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{standard.code}</div>
                        <div className="text-xs text-muted-foreground mb-2">{standard.description}</div>
                        {standard.reasoning && (
                          <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            <strong>Analysis:</strong> {standard.reasoning}
                          </div>
                        )}
                        {standard.matchedKeywords && standard.matchedKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {standard.matchedKeywords.slice(0, 5).map((keyword: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {standard.score && (
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-bold text-primary">{Math.round(standard.score * 100)}</div>
                          <div className="text-xs text-muted-foreground">Match %</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Secondary Standards */}
          {alignmentResults.secondaryStandards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📚 Secondary Standards Alignment</CardTitle>
                <CardDescription>Supporting standards with partial alignment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alignmentResults.secondaryStandards.map((standard: any, index: number) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{standard.code}</div>
                        <div className="text-xs text-muted-foreground mb-2">{standard.description}</div>
                        {standard.reasoning && (
                          <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                            <strong>Analysis:</strong> {standard.reasoning}
                          </div>
                        )}
                        {standard.matchedKeywords && standard.matchedKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {standard.matchedKeywords.slice(0, 3).map((keyword: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {standard.score && (
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-bold text-amber-600">{Math.round(standard.score * 100)}</div>
                          <div className="text-xs text-muted-foreground">Match %</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Professional Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve your IEP goal</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {alignmentResults.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Common Core Alignment Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <div className="font-medium text-sm">Reading Comprehension Goal</div>
              <div className="text-xs text-muted-foreground mt-1">
                Aligns with CCSS.ELA-LITERACY.RL.3.1, CCSS.ELA-LITERACY.RL.3.2
              </div>
            </div>
            <div className="p-3 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
              <div className="font-medium text-sm">Mathematics Problem Solving</div>
              <div className="text-xs text-muted-foreground mt-1">
                Aligns with CCSS.MATH.CONTENT.3.OA.A.1, CCSS.MATH.CONTENT.3.OA.A.2
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">IEP Goal Generator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered SMART goal creation with professional standards and compliance verification.
          </p>
          <Badge className="bg-gradient-to-r from-warning to-warning-light text-warning-foreground">
            SMART Goals
          </Badge>
        </div>

        {/* Navigation Tabs */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === 'generate' ? 'default' : 'outline'}
                onClick={() => setActiveTab('generate')}
                className="flex items-center gap-2"
                data-testid="tab-generate"
              >
                <Brain className="h-4 w-4" />
                Generate Goals
              </Button>
              <Button
                variant={activeTab === 'check' ? 'default' : 'outline'}
                onClick={() => setActiveTab('check')}
                className="flex items-center gap-2"
                data-testid="tab-compliance"
              >
                <CheckCircle className="h-4 w-4" />
                Check Compliance
              </Button>
              <Button
                variant={activeTab === 'align' ? 'default' : 'outline'}
                onClick={() => setActiveTab('align')}
                className="flex items-center gap-2"
                data-testid="tab-alignment"
              >
                <BookOpen className="h-4 w-4" />
                Align Standards
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Tab Content */}
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'check' && renderComplianceTab()}
        {activeTab === 'align' && renderAlignmentTab()}

        {/* SMART Framework Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              SMART Goal Framework
            </CardTitle>
            <CardDescription>
              Our AI ensures every goal meets these essential criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">S</span>
                </div>
                <h4 className="font-semibold">Specific</h4>
                <p className="text-xs text-muted-foreground">Clear and well-defined objectives</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <span className="font-bold text-green-600">M</span>
                </div>
                <h4 className="font-semibold">Measurable</h4>
                <p className="text-xs text-muted-foreground">Quantifiable progress indicators</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="font-bold text-orange-600">A</span>
                </div>
                <h4 className="font-semibold">Achievable</h4>
                <p className="text-xs text-muted-foreground">Realistic and attainable</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="font-bold text-purple-600">R</span>
                </div>
                <h4 className="font-semibold">Relevant</h4>
                <p className="text-xs text-muted-foreground">Meaningful and important</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="font-semibold">Time-bound</h4>
                <p className="text-xs text-muted-foreground">Clear deadlines and timeframes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}