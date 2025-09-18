// DashboardLayout removed - provided by ToolsRoute wrapper
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
import { Target, Brain, CheckCircle, Lightbulb, BookOpen, Clock, Upload, FileText, AlertCircle, CheckCheck, Users, UserPlus, User, GraduationCap, Heart, Search, Info, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { StudentSelector } from "@/components/StudentSelector";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

// Parent-friendly goal examples
const PARENT_SAMPLE_GOALS = {
  reading: [
    "By the end of the school year, when given books at their reading level, your child will read out loud with 90% of words correct and answer questions about what they read with 80% accuracy in 4 weekly sessions.",
    "By the end of the school year, when shown sight word cards, your child will read the words correctly 95% of the time in 3 out of 4 weekly practice sessions.",
    "By the end of the school year, when reading stories appropriate for their level, your child will tell you the main idea and 3 important details with 80% accuracy during 4 weekly reading sessions."
  ],
  writing: [
    "By the end of the school year, when given a writing topic, your child will write a 5-sentence paragraph with correct capitals and periods with 80% accuracy in 4 out of 5 weekly writing samples.",
    "By the end of the school year, when using writing organizers, your child will write a 3-paragraph story with a beginning, middle, and end with 75% accuracy during 4 monthly writing activities.",
    "By the end of the school year, your child will copy sentences from the board with neat handwriting and proper spacing with 90% accuracy in daily handwriting practice."
  ],
  math: [
    "By the end of the school year, when given addition problems with carrying over (like 25 + 47), your child will solve them correctly 80% of the time during 4 weekly math tests.",
    "By the end of the school year, when given story problems about money, your child will figure out what math to do and solve it correctly 75% of the time in 3 out of 4 tries.",
    "By the end of the school year, when shown clocks, your child will tell time to the nearest 15 minutes correctly 85% of the time during 4 weekly practice sessions."
  ],
  communication: [
    "By the end of the school year, when in social situations, your child will start conversations using complete sentences 80% of the time across 3 weeks in a row.",
    "By the end of the school year, when talking with others, your child will look at the person and answer questions appropriately in 4 out of 5 conversations each day.",
    "By the end of the school year, your child will use an appropriate voice volume when talking in class 85% of the time over 2 weeks in a row."
  ],
  behavior: [
    "By the end of the school year, when it's time to change activities, your child will follow the routine without reminders 80% of the time across 4 weeks in a row.",
    "By the end of the school year, when feeling frustrated, your child will use coping strategies (like deep breathing or asking for help) instead of acting out 75% of the time.",
    "By the end of the school year, your child will stay in their seat and pay attention for 15 minutes with only 2 gentle reminders 80% of the time."
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

export default function ParentGoalGenerator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'learn' | 'generate' | 'check'>('learn');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGoals, setGeneratedGoals] = useState<GeneratedGoal[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [savingGoals, setSavingGoals] = useState<Set<string>>(new Set());
  
  // Compliance checker states
  const [complianceGoalText, setComplianceGoalText] = useState('');
  const [selectedPresetGoal, setSelectedPresetGoal] = useState('');
  const [selectedGoalCategory, setSelectedGoalCategory] = useState('');
  const [complianceResults, setComplianceResults] = useState<ComplianceResult | null>(null);
  
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

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentId(studentId);
    // Auto-fill basic information when student is selected
    if (studentId && studentId !== 'no-student') {
      setUseExistingStudent(true);
      // You could fetch student details here and populate the form
    } else {
      setUseExistingStudent(false);
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

  const handleGenerateGoals = async () => {
    setIsGenerating(true);
    
    // Simulate AI goal generation
    setTimeout(() => {
      const sampleGoals: GeneratedGoal[] = [
        {
          id: '1',
          category: 'Academic - Reading',
          goal: `By the end of the school year, when given books at ${studentInfo.name || 'your child'}'s reading level, they will read out loud with 90% of words correct and answer questions about what they read with 80% accuracy in 4 weekly sessions.`,
          objectives: [
            'Read grade-level words with 95% accuracy in weekly assessments',
            'Answer comprehension questions with 80% accuracy',
            'Demonstrate fluent reading with appropriate expression'
          ],
          measurableData: 'Weekly reading assessments and progress monitoring',
          timeframe: 'By the end of the IEP year',
          complianceScore: 95,
          standards: ['CCSS.ELA-LITERACY.RF.3.4', 'CCSS.ELA-LITERACY.RL.3.1']
        },
        {
          id: '2',
          category: 'Communication',
          goal: `By the end of the school year, when in social situations at school, ${studentInfo.name || 'your child'} will start conversations using complete sentences 80% of the time across 3 weeks in a row.`,
          objectives: [
            'Initiate conversations with peers during structured activities',
            'Use appropriate greetings and social phrases',
            'Maintain conversations for at least 2 exchanges'
          ],
          measurableData: 'Daily observation and data collection',
          timeframe: 'By the end of the IEP year',
          complianceScore: 88,
          standards: ['Social Communication Standards']
        }
      ];
      
      setGeneratedGoals(sampleGoals);
      setIsGenerating(false);
    }, 2000);
  };

  const checkCompliance = (goalText: string): ComplianceResult => {
    const result: ComplianceResult = {
      overallScore: 0,
      criteria: {
        measurable: false,
        timeframe: false,
        conditions: false,
        criteria: false,
        observable: false,
        studentSpecific: false
      },
      suggestions: []
    };

    // Check for measurable elements
    if (goalText.includes('%') || goalText.includes('out of') || /\d+/.test(goalText)) {
      result.criteria.measurable = true;
    } else {
      result.suggestions.push("Add specific numbers or percentages to make the goal measurable");
    }

    // Check for timeframe
    if (goalText.includes('By the end of') || goalText.includes('within') || goalText.includes('year')) {
      result.criteria.timeframe = true;
    } else {
      result.suggestions.push("Include when the goal should be achieved (like 'by the end of the school year')");
    }

    // Check for conditions
    if (goalText.includes('when given') || goalText.includes('when presented') || goalText.includes('during')) {
      result.criteria.conditions = true;
    } else {
      result.suggestions.push("Describe the situation when your child will demonstrate the skill");
    }

    // Check for criteria
    if (goalText.includes('with') && (goalText.includes('accuracy') || goalText.includes('success'))) {
      result.criteria.criteria = true;
    } else {
      result.suggestions.push("Include how well your child needs to perform (like 'with 80% accuracy')");
    }

    // Check for observable behavior
    if (goalText.includes('will read') || goalText.includes('will write') || goalText.includes('will solve') || 
        goalText.includes('will demonstrate') || goalText.includes('will complete')) {
      result.criteria.observable = true;
    } else {
      result.suggestions.push("Use action words that describe what your child will do");
    }

    // Check for student-specific language
    if (goalText.toLowerCase().includes('student') || goalText.toLowerCase().includes('child') || 
        studentInfo.name && goalText.includes(studentInfo.name)) {
      result.criteria.studentSpecific = true;
    } else {
      result.suggestions.push("Make the goal about your specific child");
    }

    // Calculate overall score
    const passedCriteria = Object.values(result.criteria).filter(Boolean).length;
    result.overallScore = Math.round((passedCriteria / 6) * 100);

    return result;
  };

  const handleComplianceCheck = () => {
    if (complianceGoalText.trim()) {
      const results = checkCompliance(complianceGoalText);
      setComplianceResults(results);
    }
  };

  const handleSaveGoal = async (goal: GeneratedGoal) => {
    if (!selectedStudentId || selectedStudentId === 'no-student') {
      toast({
        title: "Student Required",
        description: "Please select a student before saving goals.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingGoals(prev => new Set([...prev, goal.id]));
      
      // Convert GeneratedGoal to dashboard goal format
      const goalData = {
        title: goal.category,
        description: goal.goal,
        goal_type: goal.category.toLowerCase().replace(/\s+/g, '_'),
        target_date: new Date(new Date().getFullYear() + 1, 5, 30).toISOString().split('T')[0], // End of next school year
        status: 'not_started' as const,
        current_progress: 0,
        notes: `Steps: ${goal.objectives.join('; ')} | Measurement: ${goal.measurableData} | Timeline: ${goal.timeframe}`,
        student_id: selectedStudentId
      };

      const response = await apiRequest('POST', '/api/goals', goalData);
      
      if (response.ok) {
        toast({
          title: "Goal Saved Successfully!",
          description: `"${goal.category}" has been added to your dashboard goal tracking.`,
        });
        
        // Option to navigate to dashboard
        setTimeout(() => {
          if (confirm("Would you like to view this goal in your dashboard now?")) {
            navigate('/parent/dashboard');
          }
        }, 1000);
      } else {
        throw new Error('Failed to save goal');
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingGoals(prev => {
        const newSet = new Set(prev);
        newSet.delete(goal.id);
        return newSet;
      });
    }
  };

  const renderLearnTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Understanding IEP Goals: A Parent's Guide
          </CardTitle>
          <CardDescription>
            Learn what makes a good IEP goal and how to advocate for your child
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What are IEP Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              What Are IEP Goals?
            </h3>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <p className="text-sm">
                IEP goals are like roadmaps for your child's learning. They describe exactly what your child will learn and how much progress they need to make during the school year. Good goals are specific, measurable, and realistic for your child.
              </p>
            </div>
          </div>

          {/* SMART Goals Explanation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              What Makes a Good Goal? (SMART Goals)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-blue-600">S - Specific</h4>
                  <p className="text-sm text-muted-foreground">Clearly describes what your child will do</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-green-600">M - Measurable</h4>
                  <p className="text-sm text-muted-foreground">Uses numbers so you can track progress</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-purple-600">A - Achievable</h4>
                  <p className="text-sm text-muted-foreground">Challenging but realistic for your child</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-orange-600">R - Relevant</h4>
                  <p className="text-sm text-muted-foreground">Important for your child's future success</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-red-600">T - Time-bound</h4>
                  <p className="text-sm text-muted-foreground">Has a clear deadline (usually one school year)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Example Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Example Goals You Can Understand
            </h3>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Good Goal Example:</h4>
                <p className="text-sm">
                  "By the end of the school year, when given books at their reading level, your child will read out loud with 90% of words correct and answer questions about what they read with 80% accuracy in 4 weekly sessions."
                </p>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  ✓ Specific: Reading books ✓ Measurable: 90% accuracy ✓ Time-bound: End of school year
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">❌ Vague Goal Example:</h4>
                <p className="text-sm">
                  "The student will improve reading skills."
                </p>
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  ❌ Not specific ❌ Not measurable ❌ No timeline
                </div>
              </div>
            </div>
          </div>

          {/* Parent Tips */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Tips for Parents
            </h3>
            <div className="grid gap-3">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ask Questions:</strong> If you don't understand a goal, ask the team to explain it in simple terms. You should be able to understand what your child is working on.
                </AlertDescription>
              </Alert>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Think About Daily Life:</strong> Good goals help your child in real situations, not just at school. Consider how the skill will help them at home and in the community.
                </AlertDescription>
              </Alert>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Track Progress:</strong> Ask for regular updates on how your child is doing. Goals should be reviewed and updated if needed.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGenerateTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Create Goals for Your Child
          </CardTitle>
          <CardDescription>
            Use this tool to create personalized IEP goals that you can understand and discuss with your child's team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-4 p-6 border rounded-xl bg-gradient-to-br from-purple-50/50 to-blue-50/30 dark:from-purple-950/20 dark:to-blue-950/10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <Label htmlFor="student-select" className="text-sm font-medium">
                  Choose Your Child
                </Label>
              </div>
              <StudentSelector
                selectedStudent={selectedStudentId}
                onStudentChange={handleStudentSelection}
                placeholder="Select your child from the list..."
                allowEmpty={true}
              />
              {selectedStudentId && selectedStudentId !== 'no-student' && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-md">
                  <CheckCircle className="h-4 w-4" />
                  Child selected - basic information will be filled in automatically
                </div>
              )}
            </div>
          </div>

          {/* Student Information Form */}
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                Tell Us About Your Child
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="student-name">Child's Name</Label>
                  <Input
                    id="student-name"
                    value={studentInfo.name}
                    onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                    placeholder="Enter your child's name"
                    data-testid="input-student-name"
                  />
                </div>
                <div>
                  <Label htmlFor="student-grade">Grade Level</Label>
                  <Select value={studentInfo.grade} onValueChange={(value) => setStudentInfo({...studentInfo, grade: value})}>
                    <SelectTrigger data-testid="select-grade">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="student-disability">Primary Challenge Area</Label>
                  <Select value={studentInfo.disability} onValueChange={(value) => setStudentInfo({...studentInfo, disability: value})}>
                    <SelectTrigger data-testid="select-disability">
                      <SelectValue placeholder="Select primary area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autism">Autism</SelectItem>
                      <SelectItem value="adhd">ADHD</SelectItem>
                      <SelectItem value="learning-disability">Learning Disability</SelectItem>
                      <SelectItem value="intellectual-disability">Intellectual Disability</SelectItem>
                      <SelectItem value="speech-language">Speech/Language</SelectItem>
                      <SelectItem value="emotional-behavioral">Emotional/Behavioral</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="goal-area">Goal Area</Label>
                  <Select value={studentInfo.area} onValueChange={(value) => setStudentInfo({...studentInfo, area: value})}>
                    <SelectTrigger data-testid="select-goal-area">
                      <SelectValue placeholder="What area needs work?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="communication">Communication/Social Skills</SelectItem>
                      <SelectItem value="behavior">Behavior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="current-level">What Can Your Child Do Now?</Label>
                <Textarea
                  id="current-level"
                  value={studentInfo.currentLevel}
                  onChange={(e) => setStudentInfo({...studentInfo, currentLevel: e.target.value})}
                  placeholder="Describe what your child can already do in this area. For example: 'Can read simple sentences but struggles with longer paragraphs'"
                  className="min-h-20"
                  data-testid="textarea-current-level"
                />
              </div>
              <div>
                <Label htmlFor="strengths">Your Child's Strengths</Label>
                <Textarea
                  id="strengths"
                  value={studentInfo.strengths}
                  onChange={(e) => setStudentInfo({...studentInfo, strengths: e.target.value})}
                  placeholder="What is your child good at? What do they enjoy? This helps create goals that build on their strengths."
                  className="min-h-20"
                  data-testid="textarea-strengths"
                />
              </div>
              <div>
                <Label htmlFor="needs">What Does Your Child Need Help With?</Label>
                <Textarea
                  id="needs"
                  value={studentInfo.needs}
                  onChange={(e) => setStudentInfo({...studentInfo, needs: e.target.value})}
                  placeholder="What specific skills or behaviors would you like to see improve? Be as specific as possible."
                  className="min-h-20"
                  data-testid="textarea-needs"
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerateGoals} 
              disabled={isGenerating || !studentInfo.name || !studentInfo.area}
              className="w-full"
              size="lg"
              data-testid="button-generate-goals"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating Goals for Your Child...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Create IEP Goals
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Goals Display */}
      {generatedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Generated Goals for {studentInfo.name}
            </CardTitle>
            <CardDescription>
              Here are personalized IEP goals for your child. You can share these with your child's IEP team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedGoals.map((goal, index) => (
                <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{goal.category}</Badge>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">{goal.complianceScore}% SMART Goal</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium">{goal.goal}</p>
                      
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Steps to achieve this goal:</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {goal.objectives.map((objective, objIndex) => (
                            <li key={objIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>How we'll measure progress:</strong> {goal.measurableData}</p>
                        <p><strong>Timeline:</strong> {goal.timeframe}</p>
                      </div>
                    </div>
                    
                    {/* Save to Dashboard Button */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveGoal(goal)}
                        disabled={savingGoals.has(goal.id) || !selectedStudentId || selectedStudentId === 'no-student'}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid={`button-save-goal-${goal.id}`}
                      >
                        {savingGoals.has(goal.id) ? (
                          <>
                            <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-2" />
                            Save to Dashboard
                          </>
                        )}
                      </Button>
                      {(!selectedStudentId || selectedStudentId === 'no-student') && (
                        <span className="text-xs text-muted-foreground">Select a student first</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCheckTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCheck className="h-5 w-5 text-blue-600" />
            Check if Goals Are Good
          </CardTitle>
          <CardDescription>
            Paste a goal from your child's IEP and we'll help you understand if it's a good goal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Goal Selection Options */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Choose a Goal to Check</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPresetGoal('');
                    setComplianceGoalText('');
                    setComplianceResults(null);
                  }}
                  data-testid="button-clear-goal"
                >
                  Clear
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="goal-category">Example Goal Type</Label>
                  <Select value={selectedGoalCategory} onValueChange={setSelectedGoalCategory}>
                    <SelectTrigger data-testid="select-goal-category">
                      <SelectValue placeholder="Pick a type to see examples" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="behavior">Behavior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedGoalCategory && (
                  <div className="space-y-2">
                    <Label htmlFor="preset-goal">Example Goal</Label>
                    <Select value={selectedPresetGoal} onValueChange={(value) => {
                      setSelectedPresetGoal(value);
                      const categoryGoals = PARENT_SAMPLE_GOALS[selectedGoalCategory as keyof typeof PARENT_SAMPLE_GOALS];
                      const goalIndex = parseInt(value);
                      if (categoryGoals && !isNaN(goalIndex)) {
                        setComplianceGoalText(categoryGoals[goalIndex]);
                        setComplianceResults(null);
                      }
                    }}>
                      <SelectTrigger data-testid="select-preset-goal">
                        <SelectValue placeholder="Choose an example" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARENT_SAMPLE_GOALS[selectedGoalCategory as keyof typeof PARENT_SAMPLE_GOALS]?.map((goal, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {goal.substring(0, 50)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Goal Text Input */}
            <div className="space-y-2">
              <Label htmlFor="goal-text">Copy and Paste a Goal Here</Label>
              <Textarea
                id="goal-text"
                value={complianceGoalText}
                onChange={(e) => {
                  setComplianceGoalText(e.target.value);
                  setComplianceResults(null);
                }}
                placeholder="Paste an IEP goal here or select an example above..."
                className="min-h-32"
                data-testid="textarea-goal-text"
              />
            </div>

            <Button 
              onClick={handleComplianceCheck} 
              disabled={!complianceGoalText.trim()}
              className="w-full"
              data-testid="button-check-compliance"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Check This Goal
            </Button>

            {/* Compliance Results */}
            {complianceResults && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goal Quality Score: {complianceResults.overallScore}%
                    {complianceResults.overallScore >= 80 ? (
                      <Badge variant="default" className="bg-green-600">Excellent Goal</Badge>
                    ) : complianceResults.overallScore >= 60 ? (
                      <Badge variant="secondary" className="bg-yellow-600">Good Goal</Badge>
                    ) : (
                      <Badge variant="destructive">Needs Improvement</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={complianceResults.overallScore} className="w-full" />
                    
                    <div className="grid gap-2 md:grid-cols-2">
                      {Object.entries(complianceResults.criteria).map(([key, passed]) => {
                        const labels = {
                          measurable: "Has Numbers/Percentages",
                          timeframe: "Has a Deadline",
                          conditions: "Describes the Situation",
                          criteria: "Shows How Well",
                          observable: "Uses Action Words", 
                          studentSpecific: "About Your Child"
                        };
                        return (
                          <div key={key} className="flex items-center gap-2">
                            {passed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm ${passed ? 'text-green-600' : 'text-red-600'}`}>
                              {labels[key as keyof typeof labels]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {complianceResults.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">How to Make This Goal Better:</h4>
                        <ul className="space-y-1">
                          {complianceResults.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">IEP Goal Helper for Parents</h1>
          <p className="text-muted-foreground">
            Learn about IEP goals, create goals for your child, and check if existing goals are good
          </p>
        </div>

        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-0">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('learn')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'learn'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                data-testid="tab-learn"
              >
                <Lightbulb className="h-4 w-4 inline mr-2" />
                Learn About Goals
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'generate'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                data-testid="tab-generate"
              >
                <Brain className="h-4 w-4 inline mr-2" />
                Create Goals
              </button>
              <button
                onClick={() => setActiveTab('check')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'check'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                data-testid="tab-check"
              >
                <CheckCheck className="h-4 w-4 inline mr-2" />
                Check Goals
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === 'learn' && renderLearnTab()}
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'check' && renderCheckTab()}
      </div>
  );
}