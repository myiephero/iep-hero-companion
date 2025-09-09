import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { FileText, Target, CheckCircle, Brain, Upload, Lightbulb, BarChart3, X, BookOpen, Users, Star, Gavel, Clock, Shield, Award, DollarSign, Calendar } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { SimpleFileUpload } from "@/components/SimpleFileUpload";
import { StudentSelector } from "@/components/StudentSelector";
import { EXPERT_REVIEW_PRODUCTS, getExpertReviewCheckoutUrl } from "@/lib/expertReviewPricing";

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

// Expert Analysis Types - now using the official Stripe product configuration
const EXPERT_ANALYSIS_TYPES = [
  {
    id: "comprehensive",
    title: EXPERT_REVIEW_PRODUCTS.comprehensive.name.replace('IEP ', ''),
    price: EXPERT_REVIEW_PRODUCTS.comprehensive.amount,
    icon: Award,
    description: EXPERT_REVIEW_PRODUCTS.comprehensive.description,
    includes: EXPERT_REVIEW_PRODUCTS.comprehensive.features,
    timeframe: EXPERT_REVIEW_PRODUCTS.comprehensive.timeframe
  },
  {
    id: "focused",
    title: EXPERT_REVIEW_PRODUCTS.focused.name.replace('IEP ', ''),
    price: EXPERT_REVIEW_PRODUCTS.focused.amount,
    icon: Target,
    description: EXPERT_REVIEW_PRODUCTS.focused.description,
    includes: EXPERT_REVIEW_PRODUCTS.focused.features,
    timeframe: EXPERT_REVIEW_PRODUCTS.focused.timeframe
  },
  {
    id: "compliance",
    title: EXPERT_REVIEW_PRODUCTS.compliance.name.replace('IEP ', ''),
    price: EXPERT_REVIEW_PRODUCTS.compliance.amount,
    icon: Shield,
    description: EXPERT_REVIEW_PRODUCTS.compliance.description,
    includes: EXPERT_REVIEW_PRODUCTS.compliance.features,
    timeframe: EXPERT_REVIEW_PRODUCTS.compliance.timeframe
  }
];

export default function ParentIEPMasterSuite() {
  const [activeTab, setActiveTab] = useState("learn");
  const [selectedStudent, setSelectedStudent] = useState(undefined as string | undefined);
  const [reviewType, setReviewType] = useState(undefined as string | undefined);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const navigate = useNavigate();
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [customGoalText, setCustomGoalText] = useState("");
  const [customGoalDomain, setCustomGoalDomain] = useState(undefined as string | undefined);
  const [analysisType, setAnalysisType] = useState<"ai" | "expert">("ai");
  const [selectedExpertType, setSelectedExpertType] = useState<string | undefined>(undefined);
  const [expertAnalyses, setExpertAnalyses] = useState<any[]>([]);
  const { toast } = useToast();

  const handleDocumentUpload = (document: any) => {
    setUploadedDocument(document);
    toast({
      title: "Document Uploaded",
      description: "Your IEP document has been uploaded successfully. You can now analyze it.",
    });
  };

  // New function to handle expert review checkout
  const handleExpertReviewCheckout = () => {
    if (!selectedStudent) {
      toast({
        title: "No Student Selected",
        description: "Please select which child this IEP belongs to first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedExpertType) {
      toast({
        title: "No Review Type Selected",
        description: "Please select a review type first.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedDocument) {
      toast({
        title: "No Document Uploaded",
        description: "Please upload an IEP document for expert review.",
        variant: "destructive",
      });
      return;
    }

    // Create checkout URL with student and document metadata
    const checkoutUrl = getExpertReviewCheckoutUrl(selectedExpertType, {
      studentName: selectedStudent,
      fileName: uploadedDocument.name || 'IEP Document'
    });

    // Navigate to checkout page
    navigate(checkoutUrl);
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

        {/* Student Selection - Global for all tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Select Your Child</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="student-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Choose which child you want to work with:
              </Label>
              <StudentSelector
                selectedStudent={selectedStudent}
                onStudentChange={setSelectedStudent}
                placeholder="Select your child..."
                data-testid="select-student"
              />
              {selectedStudent && (
                <div className="flex items-center space-x-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Ready to work with your selected child's IEP
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="learn" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Learn About IEPs</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Analyze My Child's IEP</span>
            </TabsTrigger>
            <TabsTrigger value="expert" className="flex items-center space-x-2">
              <Gavel className="h-4 w-4" />
              <span>Expert Professional Review</span>
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

          {/* Analyze My Child's IEP Tab - Enhanced with Two-Tier System */}
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
                    Upload your child's current IEP document and choose your analysis type. Start with free AI analysis or upgrade to professional expert review.
                  </AlertDescription>
                </Alert>

                {!selectedStudent && (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      Please select your child from the dropdown above before uploading an IEP document.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Analysis Type Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Choose Analysis Type:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={`cursor-pointer transition-all ${analysisType === 'ai' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => setAnalysisType('ai')}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <Brain className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">Free AI Analysis</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Instant insights & parent-friendly guidance</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">FREE</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={`cursor-pointer transition-all ${analysisType === 'expert' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => setAnalysisType('expert')}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                            <Gavel className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">Professional Expert Review</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Certified expert analysis in 24-48 hours</p>
                          </div>
                          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">PREMIUM</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Expert Analysis Type Selection */}
                {analysisType === 'expert' && (
                  <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                    <Label className="text-base font-medium">Select Expert Analysis Type:</Label>
                    <div className="grid grid-cols-1 gap-4">
                      {EXPERT_ANALYSIS_TYPES.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <Card 
                            key={type.id} 
                            className={`cursor-pointer transition-all ${selectedExpertType === type.id ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            onClick={() => setSelectedExpertType(type.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                                  <IconComponent className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold">{type.title}</h3>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="bg-green-100 text-green-700">${type.price}</Badge>
                                      <Badge variant="outline" className="bg-blue-100 text-blue-700">{type.timeframe}</Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{type.description}</p>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Includes:</p>
                                    <ul className="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-1">
                                      {type.includes.map((item, index) => (
                                        <li key={index} className="flex items-center space-x-1">
                                          <CheckCircle className="h-3 w-3 text-green-600" />
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <DocumentUpload onAnalysisComplete={handleDocumentUpload} />
                
                {uploadedDocument && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Document uploaded: {uploadedDocument.name}</span>
                    </div>
                    
                    <Button 
                      onClick={handleAnalyzeDocument} 
                      disabled={isAnalyzing || (analysisType === 'expert' && !selectedExpertType)}
                      className="w-full"
                      data-testid="button-analyze-iep"
                    >
                      {isAnalyzing ? (
                        <>
                          <Brain className="h-4 w-4 mr-2 animate-spin" />
                          {analysisType === 'ai' ? 'Analyzing Your Child\'s IEP...' : 'Submitting for Expert Review...'}
                        </>
                      ) : (
                        <>
                          {analysisType === 'ai' ? (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Get Free AI Analysis
                            </>
                          ) : (
                            <>
                              <Gavel className="h-4 w-4 mr-2" />
                              Submit for Expert Review {selectedExpertType && `($${EXPERT_ANALYSIS_TYPES.find(t => t.id === selectedExpertType)?.price})`}
                            </>
                          )}
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

          {/* Expert Professional Review Tab */}
          <TabsContent value="expert" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request Professional Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gavel className="h-5 w-5 text-primary" />
                    <span>Request Professional Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Award className="h-4 w-4" />
                    <AlertDescription>
                      Get comprehensive IEP analysis from certified educational advocates and special education experts.
                    </AlertDescription>
                  </Alert>

                  {!selectedStudent && (
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        Please select your child from the dropdown above to request expert analysis.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Expert Analysis Options */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Choose Expert Analysis Type:</Label>
                    {EXPERT_ANALYSIS_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <Card 
                          key={type.id} 
                          className={`cursor-pointer transition-all ${selectedExpertType === type.id ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                          onClick={() => setSelectedExpertType(type.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                                <IconComponent className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold">{type.title}</h3>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="bg-green-100 text-green-700">${type.price}</Badge>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-700">{type.timeframe}</Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{type.description}</p>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Includes:</p>
                                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    {type.includes.map((item, index) => (
                                      <li key={index} className="flex items-center space-x-1">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Document Upload for Expert Analysis */}
                  {selectedExpertType && (
                    <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                      <Label className="text-base font-medium">Upload IEP Document for Expert Review:</Label>
                      {/* Using SimpleFileUpload for expert reviews - no AI features */}
                      <SimpleFileUpload onFileUpload={handleDocumentUpload} />
                      
                      {uploadedDocument && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium">Document ready: {uploadedDocument.name}</span>
                          </div>
                          
                          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-medium mb-2">Review Summary:</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Analysis Type:</span>
                                <span className="font-medium">{EXPERT_ANALYSIS_TYPES.find(t => t.id === selectedExpertType)?.title}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cost:</span>
                                <span className="font-medium">${EXPERT_ANALYSIS_TYPES.find(t => t.id === selectedExpertType)?.price}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Timeframe:</span>
                                <span className="font-medium">{EXPERT_ANALYSIS_TYPES.find(t => t.id === selectedExpertType)?.timeframe}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Student:</span>
                                <span className="font-medium">{selectedStudent ? 'Selected' : 'Please select student'}</span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            className="w-full"
                            disabled={!selectedStudent || !selectedExpertType}
                            onClick={handleExpertReviewCheckout}
                            data-testid="button-submit-expert-analysis"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Submit for Expert Review - ${EXPERT_ANALYSIS_TYPES.find(t => t.id === selectedExpertType)?.price}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Professional Analyses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>My Professional Analyses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Track your submitted expert analyses and view completed professional reports.
                    </AlertDescription>
                  </Alert>

                  {/* Mock expert analyses for demonstration */}
                  <div className="space-y-4">
                    {expertAnalyses.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Expert Analyses Yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Submit your first IEP for expert review to see analyses here.
                        </p>
                      </div>
                    ) : (
                      expertAnalyses.map((analysis, index) => (
                        <Card key={index} className="border border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="p-1 rounded bg-purple-100 dark:bg-purple-900">
                                  <Gavel className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{analysis.type} Review</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{analysis.studentName}</p>
                                </div>
                              </div>
                              <Badge variant={analysis.status === 'completed' ? 'default' : analysis.status === 'in_progress' ? 'secondary' : 'outline'}>
                                {analysis.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Submitted:</span>
                                <span>{analysis.submittedDate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Expected:</span>
                                <span>{analysis.expectedDate}</span>
                              </div>
                              {analysis.status === 'completed' && (
                                <div className="flex justify-between">
                                  <span>Completed:</span>
                                  <span>{analysis.completedDate}</span>
                                </div>
                              )}
                            </div>

                            {analysis.status === 'completed' && (
                              <div className="mt-4 space-y-2">
                                <Button variant="outline" size="sm" className="w-full">
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Expert Report
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Download PDF Report
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* Demo Sample Analyses for Display */}
                  <div className="space-y-4">
                    <Card className="border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 rounded bg-green-100 dark:bg-green-900">
                              <Award className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Comprehensive Review</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Student-1 Student-1</p>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-700 border-green-300">completed</Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Submitted:</span>
                            <span>Dec 8, 2024</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Completed:</span>
                            <span>Dec 10, 2024</span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Button variant="outline" size="sm" className="w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            View Expert Report
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Download PDF Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 rounded bg-blue-100 dark:bg-blue-900">
                              <Target className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Focused Review</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Student-2 Student-2</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">in_progress</Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Submitted:</span>
                            <span>Dec 9, 2024</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected:</span>
                            <span>Dec 10, 2024</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Progress value={75} className="w-full" />
                          <p className="text-xs text-center mt-2 text-blue-600">Expert review in progress - 75% complete</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
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

                {!selectedStudent && (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      Please select your child from the dropdown above to check their IEP goals.
                    </AlertDescription>
                  </Alert>
                )}

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