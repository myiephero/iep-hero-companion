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
import { cn } from "@/lib/utils";

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
    if (studentId && studentId !== 'no-student') {
      setUseExistingStudent(true);
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

    if (goalText.includes('%') || goalText.includes('out of') || /\d+/.test(goalText)) {
      result.criteria.measurable = true;
    } else {
      result.suggestions.push("Add specific numbers or percentages to make the goal measurable");
    }

    if (goalText.includes('By the end of') || goalText.includes('within') || goalText.includes('year')) {
      result.criteria.timeframe = true;
    } else {
      result.suggestions.push("Include when the goal should be achieved (like 'by the end of the school year')");
    }

    if (goalText.includes('when given') || goalText.includes('when presented') || goalText.includes('during')) {
      result.criteria.conditions = true;
    } else {
      result.suggestions.push("Describe the situation when your child will demonstrate the skill");
    }

    if (goalText.includes('with') && (goalText.includes('accuracy') || goalText.includes('success'))) {
      result.criteria.criteria = true;
    } else {
      result.suggestions.push("Include how well your child needs to perform (like 'with 80% accuracy')");
    }

    if (goalText.includes('will read') || goalText.includes('will write') || goalText.includes('will solve') || 
        goalText.includes('will demonstrate') || goalText.includes('will complete')) {
      result.criteria.observable = true;
    } else {
      result.suggestions.push("Use action words that describe what your child will do");
    }

    if (goalText.toLowerCase().includes('student') || goalText.toLowerCase().includes('child') || 
        studentInfo.name && goalText.includes(studentInfo.name)) {
      result.criteria.studentSpecific = true;
    } else {
      result.suggestions.push("Make the goal about your specific child");
    }

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
      
      const goalData = {
        title: goal.category,
        description: goal.goal,
        goal_type: goal.category.toLowerCase().replace(/\s+/g, '_'),
        target_date: new Date(new Date().getFullYear() + 1, 5, 30).toISOString().split('T')[0],
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Target className="h-10 w-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                IEP Goal Generator
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Create personalized, compliant IEP goals that you can understand and discuss with your child's team
            </p>
            <div className="flex justify-center space-x-2">
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-300">
                AI-Powered
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Parent-Friendly
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                IDEA Compliant
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-lg">
            <div className="flex bg-white dark:bg-gray-900 rounded-xl p-2 gap-2">
              <button
                onClick={() => setActiveTab("learn")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center",
                  activeTab === "learn"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                data-testid="tab-learn"
              >
                <BookOpen className="h-5 w-5" />
                <span>Learn About Goals</span>
              </button>
              <button
                onClick={() => setActiveTab("generate")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center",
                  activeTab === "generate"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                data-testid="tab-generate"
              >
                <Brain className="h-5 w-5" />
                <span>Create Goals</span>
              </button>
              <button
                onClick={() => setActiveTab("check")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center",
                  activeTab === "check"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                data-testid="tab-check"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Check Goals</span>
              </button>
            </div>
          </div>
        </div>

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                  Understanding IEP Goals: A Parent's Guide
                </CardTitle>
                <CardDescription className="text-lg">
                  Learn what makes a good IEP goal and how to advocate for your child
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Target className="h-5 w-5" />
                        What Are IEP Goals?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">
                        IEP goals are specific targets for what your child will learn and accomplish during the school year. 
                        They're like roadmaps that help everyone understand where your child is headed and how to get there.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="h-5 w-5" />
                        SMART Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-blue-600">Specific</div>
                        <div className="text-sm font-medium text-green-600">Measurable</div>
                        <div className="text-sm font-medium text-purple-600">Achievable</div>
                        <div className="text-sm font-medium text-orange-600">Relevant</div>
                        <div className="text-sm font-medium text-red-600">Time-bound</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <Heart className="h-5 w-5" />
                        Your Rights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• You know your child best</li>
                        <li>• You are an equal IEP team member</li>
                        <li>• Your input matters</li>
                        <li>• It's okay to ask questions</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Example Goals You Can Understand</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <CardHeader>
                        <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          ✅ Good Goal Example
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          "By the end of the school year, when given books at their reading level, your child will read out loud with 90% of words correct and answer questions about what they read with 80% accuracy in 4 weekly sessions."
                        </p>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          ✓ Specific: Reading books ✓ Measurable: 90% accuracy ✓ Time-bound: End of school year
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          ❌ Vague Goal Example
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          "The student will improve reading skills."
                        </p>
                        <div className="text-xs text-red-600 dark:text-red-400">
                          ❌ Not specific ❌ Not measurable ❌ No timeline
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    Create Goals for Your Child
                  </CardTitle>
                  <CardDescription>
                    Use this tool to create personalized IEP goals that you can understand and discuss with your child's team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Student Selection */}
                  <div className="p-6 border rounded-xl bg-gradient-to-br from-purple-50/50 to-blue-50/30 dark:from-purple-950/20 dark:to-blue-950/10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        <Label htmlFor="student-select" className="text-base font-medium">
                          Choose Your Child
                        </Label>
                      </div>
                      <StudentSelector
                        selectedStudent={selectedStudentId}
                        onStudentChange={handleStudentSelection}
                        placeholder="Select your child from the list..."
                        allowEmpty={true}
                        data-testid="select-student"
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
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
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
                            <SelectItem value="communication">Communication/Speech</SelectItem>
                            <SelectItem value="behavior">Behavior/Social</SelectItem>
                            <SelectItem value="motor">Fine/Gross Motor</SelectItem>
                            <SelectItem value="life-skills">Life Skills</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="strengths">Your Child's Strengths</Label>
                        <Textarea
                          id="strengths"
                          value={studentInfo.strengths}
                          onChange={(e) => setStudentInfo({...studentInfo, strengths: e.target.value})}
                          placeholder="What is your child good at? What do they enjoy?"
                          rows={3}
                          data-testid="textarea-strengths"
                        />
                      </div>
                      <div>
                        <Label htmlFor="needs">Areas That Need Work</Label>
                        <Textarea
                          id="needs"
                          value={studentInfo.needs}
                          onChange={(e) => setStudentInfo({...studentInfo, needs: e.target.value})}
                          placeholder="What challenges does your child face? What would you like them to work on?"
                          rows={3}
                          data-testid="textarea-needs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={handleGenerateGoals}
                      disabled={isGenerating || !studentInfo.name || !studentInfo.area}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg"
                      data-testid="button-generate-goals"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Generating Goals...
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5 mr-2" />
                          Generate IEP Goals
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Goals */}
              {generatedGoals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6 text-green-600" />
                      Your Generated IEP Goals
                    </CardTitle>
                    <CardDescription>
                      Review these goals and save the ones you'd like to discuss with your child's team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {generatedGoals.map((goal) => (
                      <Card key={goal.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {goal.category}
                                </h4>
                                <Badge variant="outline" className="mt-1">
                                  Compliance Score: {goal.complianceScore}%
                                </Badge>
                              </div>
                              <Button
                                onClick={() => handleSaveGoal(goal)}
                                disabled={savingGoals.has(goal.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                data-testid={`button-save-goal-${goal.id}`}
                              >
                                {savingGoals.has(goal.id) ? (
                                  <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Goal
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                              <p className="text-gray-700 dark:text-gray-300">{goal.goal}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Objectives:</h5>
                                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  {goal.objectives.map((objective, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      {objective}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Measurement:</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{goal.measurableData}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Timeline:</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{goal.timeframe}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Tips for Success
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Be Specific:</strong> The more details you provide about your child, the better the generated goals will be.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Know Your Child:</strong> Think about what your child does well and what they struggle with.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Start Small:</strong> Focus on one or two key areas where your child needs the most support.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    What Happens Next?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">1</span>
                      </div>
                      <p>Review the generated goals carefully</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">2</span>
                      </div>
                      <p>Save goals you want to discuss with the team</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">3</span>
                      </div>
                      <p>Bring these to your IEP meeting</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">4</span>
                      </div>
                      <p>Work with the team to finalize them</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Check Tab */}
        {activeTab === 'check' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Goal Compliance Checker
                  </CardTitle>
                  <CardDescription>
                    Check if your existing IEP goals meet IDEA compliance standards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="goal-text">Paste Your Goal Here</Label>
                    <Textarea
                      id="goal-text"
                      value={complianceGoalText}
                      onChange={(e) => setComplianceGoalText(e.target.value)}
                      placeholder="Paste the IEP goal you want to check..."
                      rows={4}
                      data-testid="textarea-goal-check"
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={handleComplianceCheck}
                      disabled={!complianceGoalText.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium"
                      data-testid="button-check-compliance"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Check This Goal
                    </Button>
                  </div>

                  {complianceResults && (
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Compliance Results</span>
                          <Badge variant={complianceResults.overallScore >= 80 ? "default" : "secondary"}>
                            {complianceResults.overallScore}% Score
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Progress value={complianceResults.overallScore} className="w-full" />
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(complianceResults.criteria).map(([key, passed]) => (
                            <div key={key} className={cn(
                              "flex items-center gap-2 p-2 rounded-lg",
                              passed ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
                            )}>
                              {passed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {complianceResults.suggestions.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Suggestions for Improvement:</h4>
                            <ul className="space-y-1">
                              {complianceResults.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Sample Goals to Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(PARENT_SAMPLE_GOALS).map(([category, goals]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">{category}</h4>
                      {goals.slice(0, 1).map((goal, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setComplianceGoalText(goal);
                            setSelectedGoalCategory(category);
                          }}
                          className="w-full text-left justify-start h-auto p-3 text-wrap"
                          data-testid={`button-sample-${category}-${index}`}
                        >
                          {goal.slice(0, 100)}...
                        </Button>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}