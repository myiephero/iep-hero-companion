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
import { Target, Brain, CheckCircle, Lightbulb, BookOpen, Clock, Upload, FileText, AlertCircle, CheckCheck } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

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

export default function GoalGenerator() {
  const [activeTab, setActiveTab] = useState<'generate' | 'check' | 'align'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGoals, setGeneratedGoals] = useState<GeneratedGoal[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
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
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Provide basic information about the student to generate personalized SMART goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student-name">Student Name</Label>
              <Input
                id="student-name"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                placeholder="Enter student's first name"
                data-testid="input-student-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={studentInfo.grade} onValueChange={(value) => setStudentInfo({...studentInfo, grade: value})}>
                <SelectTrigger data-testid="select-grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-k">Pre-K</SelectItem>
                  <SelectItem value="k">Kindergarten</SelectItem>
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
          
          <div className="space-y-2">
            <Label htmlFor="disability">Primary Disability Category</Label>
            <Select value={studentInfo.disability} onValueChange={(value) => setStudentInfo({...studentInfo, disability: value})}>
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
            <div className="space-y-2">
              <Label htmlFor="goal-text">Paste IEP Goal Text</Label>
              <Textarea
                id="goal-text"
                placeholder="Enter the IEP goal you want to check for compliance..."
                rows={6}
                data-testid="textarea-compliance-goal"
              />
            </div>
            <Button className="w-full" data-testid="button-check-compliance">
              <CheckCircle className="h-4 w-4 mr-2" />
              Check Compliance
            </Button>
          </div>
        </CardContent>
      </Card>

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
                <Select>
                  <SelectTrigger data-testid="select-state">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="al">Alabama</SelectItem>
                    <SelectItem value="ca">California</SelectItem>
                    <SelectItem value="fl">Florida</SelectItem>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="tx">Texas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Area</Label>
                <Select>
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
              <Label htmlFor="goal-align">IEP Goal to Align</Label>
              <Textarea
                id="goal-align"
                placeholder="Enter the IEP goal you want to align with standards..."
                rows={4}
                data-testid="textarea-align-goal"
              />
            </div>
            
            <Button className="w-full" data-testid="button-align-standards">
              <BookOpen className="h-4 w-4 mr-2" />
              Find Standards Alignment
            </Button>
          </div>
        </CardContent>
      </Card>

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