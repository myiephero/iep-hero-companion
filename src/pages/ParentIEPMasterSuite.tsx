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
import { FileText, Target, CheckCircle, Brain, Upload, Lightbulb, BarChart3, X, BookOpen, Users, Star } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { StudentSelector } from "@/components/StudentSelector";

// Parent-friendly sample IEP goals for understanding
const PARENT_SAMPLE_GOALS = {
  reading: [
    "By the end of the school year, when reading books at your child's level, they will understand the main story and answer questions about it correctly 8 out of 10 times, as checked by their teacher every week.",
    "By the end of the school year, your child will read 100 words per minute clearly and correctly when reading books that match their reading level, measured monthly by the teacher.",
    "By the end of the school year, when given a story to read, your child will be able to tell you what happened in the beginning, middle, and end correctly 4 out of 5 times."
  ],
  math: [
    "By the end of the school year, when solving word problems about adding and subtracting, your child will get the right answer 85% of the time, measured every two weeks.",
    "By the end of the school year, your child will know their multiplication facts (times tables) up to 12 and solve them quickly and correctly 9 out of 10 times.",
    "By the end of the school year, when looking at number patterns (like 2, 4, 6, 8...), your child will figure out what comes next correctly 8 out of 10 times."
  ],
  writing: [
    "By the end of the school year, your child will write a 5-sentence paragraph about a topic with a clear beginning sentence, middle details, and ending sentence, doing this successfully 4 out of 5 times.",
    "By the end of the school year, when writing stories or reports, your child will use correct capital letters and periods in 90% of their sentences.",
    "By the end of the school year, your child will check their own writing for mistakes and fix at least 3 errors in spelling or grammar before turning it in."
  ],
  communication: [
    "By the end of the school year, your child will start conversations with friends by saying hello and asking questions, successfully talking back and forth at least 3 times in a row.",
    "By the end of the school year, when your child needs help, they will ask for it using words or their communication device 9 out of 10 times instead of getting frustrated.",
    "By the end of the school year, your child will follow 2-3 step directions (like 'get your backpack, put away your books, and sit on the carpet') correctly 85% of the time."
  ],
  behavior: [
    "By the end of the school year, your child will stay focused on their work for 15 minutes without needing reminders, successful 4 out of 5 times per day.",
    "By the end of the school year, when your child feels upset or frustrated, they will use calm-down strategies (like deep breathing or asking for a break) instead of having outbursts 8 out of 10 times.",
    "By the end of the school year, your child will move between activities (like from math to reading time) within 2 minutes when given a warning, successful 9 out of 10 times."
  ]
};

// Parent education content about IEP components
const IEP_EDUCATION_CONTENT = {
  goals: {
    title: "Understanding IEP Goals",
    content: `IEP goals are specific targets for what your child will learn and accomplish during the school year. Think of them as roadmaps that help everyone understand where your child is headed and how to get there.

Every good IEP goal should answer these questions:
• WHAT will your child do? (the specific skill)
• HOW WELL will they do it? (like 80% correct)
• WHEN will this happen? (by the end of the year)
• WHERE will this be measured? (in the classroom, during tests, etc.)

Good goals are like recipes - they're specific enough that anyone can follow them and know if your child is making progress.`
  },
  accommodations: {
    title: "Understanding Accommodations",
    content: `Accommodations are changes to HOW your child learns and shows what they know, without changing WHAT they're expected to learn. Think of them like ramps for wheelchairs - they help your child access the same education as everyone else.

Examples include:
• Extra time on tests
• Sitting near the teacher
• Having directions read aloud
• Using a calculator for math problems that aren't about math facts
• Taking breaks when needed

Accommodations level the playing field so your child can show their true abilities.`
  },
  services: {
    title: "Understanding Related Services",
    content: `Related services are extra help your child receives to benefit from their education. These are like specialized coaching to help your child succeed.

Common services include:
• Speech therapy - helps with talking, understanding language, or social communication
• Occupational therapy - helps with fine motor skills, sensory needs, or daily living skills
• Physical therapy - helps with movement, strength, and coordination
• Counseling - helps with emotional and behavioral needs

These services work together with your child's regular classroom learning.`
  }
};

export default function ParentIEPMasterSuite() {
  const [activeTab, setActiveTab] = useState("learn");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [reviewType, setReviewType] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [customGoalText, setCustomGoalText] = useState("");
  const [customGoalDomain, setCustomGoalDomain] = useState("");
  const { toast } = useToast();

  const handleDocumentUpload = (document: any) => {
    setUploadedDocument(document);
    toast({
      title: "Document Uploaded",
      description: "Your IEP document has been uploaded successfully. You can now analyze it.",
    });
  };

  const handleAnalyzeDocument = async () => {
    if (!selectedStudent) {
      toast({
        title: "No Student Selected",
        description: "Please select which child this IEP belongs to first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!uploadedDocument) {
      toast({
        title: "No Document",
        description: "Please upload an IEP document first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate analysis for now - in real implementation this would call the API
      setTimeout(() => {
        setAnalysisResult({
          overallScore: 78,
          qualityChecks: {
            measurable: true,
            timebound: true,
            specific: false,
            achievable: true
          },
          recommendations: [
            "Goals could be more specific about exactly what your child will do",
            "Consider adding more details about how progress will be measured", 
            "Some goals might benefit from breaking into smaller steps"
          ],
          strengths: [
            "Goals have clear timelines",
            "Goals are measurable", 
            "Goals are appropriate for your child's level"
          ]
        });
        setIsAnalyzing(false);
        toast({
          title: "Analysis Complete",
          description: "Your IEP analysis is ready to review.",
        });
      }, 3000);
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestSampleGoal = (goal: string, domain: string) => {
    setCustomGoalText(goal);
    setCustomGoalDomain(domain);
    
    // Simulate goal analysis
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
      setAnalysisResult({
        goalScore: score,
        isSpecific: score > 80,
        isMeasurable: score > 75,
        isAchievable: score > 70,
        isTimebound: score > 85,
        feedback: score > 85 ? "This is an excellent IEP goal!" : 
                  score > 75 ? "This is a good goal with room for improvement." :
                  "This goal needs some work to be more effective.",
        suggestions: score > 85 ? [] : [
          "Consider making the goal more specific about what exactly your child will do",
          "Add clearer measurement criteria", 
          "Make sure the goal is challenging but achievable"
        ]
      });
      toast({
        title: "Goal Analysis Complete",
        description: `Goal scored ${score}% - check the results below.`,
      });
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Parent IEP Helper Suite
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to understand, analyze, and advocate for your child's IEP in simple, parent-friendly language
          </p>
          <div className="flex justify-center space-x-2">
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-300">
              Parent-Friendly
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              Educational
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Comprehensive
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="learn" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Learn About IEPs</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Analyze My Child's IEP</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Check IEP Goals</span>
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>See Good Examples</span>
            </TabsTrigger>
          </TabsList>

          {/* Learn About IEPs Tab */}
          <TabsContent value="learn" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(IEP_EDUCATION_CONTENT).map(([key, content]) => (
                <Card key={key} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {key === 'goals' && <Target className="h-5 w-5 text-primary" />}
                      {key === 'accommodations' && <Lightbulb className="h-5 w-5 text-primary" />}
                      {key === 'services' && <Users className="h-5 w-5 text-primary" />}
                      <span>{content.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">
                      {content.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Your Rights as a Parent</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">You Have the Right To:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Participate in all meetings about your child</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Request changes to your child's IEP at any time</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Get copies of all documents about your child</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Disagree with the school's decisions</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Remember:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>You know your child best</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>You are an equal member of the IEP team</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Your input and concerns are important</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>It's okay to ask questions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analyze My Child's IEP Tab */}
          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <span>Upload Your Child's IEP</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    Upload your child's current IEP document and our AI will analyze it to help you understand its strengths and areas for improvement. All documents are kept secure and private.
                  </AlertDescription>
                </Alert>

                {/* Student Selection */}
                <div className="space-y-2">
                  <Label htmlFor="student-select" className="text-sm font-medium">
                    Select which child's IEP you're uploading:
                  </Label>
                  <StudentSelector
                    selectedStudent={selectedStudent}
                    onStudentChange={setSelectedStudent}
                    placeholder="Choose your child..."
                  />
                </div>
                
                <DocumentUpload onAnalysisComplete={handleDocumentUpload} />
                
                {uploadedDocument && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Document uploaded: {uploadedDocument.name}</span>
                    </div>
                    
                    <Button 
                      onClick={handleAnalyzeDocument} 
                      disabled={isAnalyzing}
                      className="w-full"
                      data-testid="button-analyze-iep"
                    >
                      {isAnalyzing ? (
                        <>
                          <Brain className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing Your Child's IEP...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analyze My Child's IEP
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="space-y-3">
                    <Progress value={33} className="w-full" />
                    <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                      Reading and analyzing your child's IEP document...
                    </p>
                  </div>
                )}

                {analysisResult && !isAnalyzing && (
                  <div className="space-y-4 mt-6">
                    <Separator />
                    <h3 className="text-lg font-semibold">Analysis Results for Your Child's IEP</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4" />
                            <span>Overall Quality Score</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">
                              {analysisResult.overallScore}%
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {analysisResult.overallScore >= 85 ? "Excellent IEP!" :
                               analysisResult.overallScore >= 70 ? "Good IEP with room for improvement" :
                               "IEP needs significant improvement"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Quality Checks</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(analysisResult.qualityChecks).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-sm capitalize">{key}</span>
                                {value ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-green-700 dark:text-green-300">
                            What's Working Well
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResult.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-amber-700 dark:text-amber-300">
                            Areas to Improve
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResult.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check IEP Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Test IEP Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Enter an IEP goal to see if it meets quality standards. Our AI will check if the goal is specific, measurable, achievable, and time-bound.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-domain">Goal Area</Label>
                    <Select value={customGoalDomain} onValueChange={setCustomGoalDomain}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="math">Math</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="behavior">Behavior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="goal-text">IEP Goal Text</Label>
                    <Textarea
                      id="goal-text"
                      value={customGoalText}
                      onChange={(e) => setCustomGoalText(e.target.value)}
                      placeholder="Paste or type an IEP goal here..."
                      className="min-h-24"
                    />
                  </div>

                  <Button
                    onClick={() => handleTestSampleGoal(customGoalText, customGoalDomain)}
                    disabled={!customGoalText || !customGoalDomain}
                    className="w-full"
                    data-testid="button-check-goal"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Check This Goal
                  </Button>
                </div>

                {analysisResult?.goalScore && (
                  <div className="space-y-4 mt-6">
                    <Separator />
                    <h3 className="text-lg font-semibold">Goal Analysis Results</h3>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-primary mb-2">
                            {analysisResult.goalScore}%
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {analysisResult.feedback}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className={`text-sm font-medium ${analysisResult.isSpecific ? 'text-green-600' : 'text-red-600'}`}>
                              Specific
                            </div>
                            {analysisResult.isSpecific ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mt-1" />
                            ) : (
                              <X className="h-5 w-5 text-red-600 mx-auto mt-1" />
                            )}
                          </div>
                          <div className="text-center">
                            <div className={`text-sm font-medium ${analysisResult.isMeasurable ? 'text-green-600' : 'text-red-600'}`}>
                              Measurable
                            </div>
                            {analysisResult.isMeasurable ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mt-1" />
                            ) : (
                              <X className="h-5 w-5 text-red-600 mx-auto mt-1" />
                            )}
                          </div>
                          <div className="text-center">
                            <div className={`text-sm font-medium ${analysisResult.isAchievable ? 'text-green-600' : 'text-red-600'}`}>
                              Achievable
                            </div>
                            {analysisResult.isAchievable ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mt-1" />
                            ) : (
                              <X className="h-5 w-5 text-red-600 mx-auto mt-1" />
                            )}
                          </div>
                          <div className="text-center">
                            <div className={`text-sm font-medium ${analysisResult.isTimebound ? 'text-green-600' : 'text-red-600'}`}>
                              Time-Bound
                            </div>
                            {analysisResult.isTimebound ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mt-1" />
                            ) : (
                              <X className="h-5 w-5 text-red-600 mx-auto mt-1" />
                            )}
                          </div>
                        </div>

                        {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Suggestions for Improvement:</h4>
                            <ul className="space-y-1">
                              {analysisResult.suggestions.map((suggestion: string, index: number) => (
                                <li key={index} className="flex items-start space-x-2 text-sm">
                                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Good Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Examples of Good IEP Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Here are examples of well-written IEP goals in parent-friendly language. Click any goal to test it and see why it's effective.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  {Object.entries(PARENT_SAMPLE_GOALS).map(([domain, goals]) => (
                    <div key={domain} className="space-y-4">
                      <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                        {domain} Goals
                      </h3>
                      <div className="grid gap-4">
                        {goals.map((goal, index) => (
                          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="pt-4">
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                {goal}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestSampleGoal(goal, domain)}
                                data-testid={`button-test-goal-${domain}-${index}`}
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                Test This Goal
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}