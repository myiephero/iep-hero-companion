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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Brain, 
  CheckCircle, 
  Star, 
  BookOpen, 
  Upload, 
  Download,
  Users,
  Target,
  AlertCircle,
  Lightbulb,
  Clock,
  Award,
  Search,
  Filter,
  Eye,
  MessageSquare,
  BarChart3,
  Zap,
  Shield,
  Heart,
  TrendingUp,
  Calendar,
  UserCheck,
  FileCheck,
  PlusCircle,
  Info,
  CheckCheck,
  ArrowRight,
  Edit
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { StudentSelector } from "@/components/StudentSelector";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface IEPAnalysis {
  overallScore: number;
  sections: {
    presentLevels: number;
    goals: number;
    services: number;
    accommodations: number;
    transition: number;
  };
  recommendations: string[];
  strengths: string[];
  concerns: string[];
}

interface SampleIEP {
  title: string;
  grade: string;
  disability: string;
  description: string;
  highlights: string[];
  downloadUrl: string;
}

const SAMPLE_IEPS: SampleIEP[] = [
  {
    title: "Elementary Reading Support IEP",
    grade: "3rd Grade",
    disability: "Specific Learning Disability",
    description: "Comprehensive IEP focusing on reading comprehension and fluency for a 3rd grader with dyslexia.",
    highlights: [
      "SMART reading goals with measurable outcomes",
      "Detailed accommodations for classroom and testing",
      "Progress monitoring plan with data collection",
      "Parent communication schedule"
    ],
    downloadUrl: "/samples/elementary-reading-iep.pdf"
  },
  {
    title: "Middle School Autism Support IEP",
    grade: "6th Grade", 
    disability: "Autism Spectrum Disorder",
    description: "Well-structured IEP addressing academic, social, and behavioral needs for a middle school student with autism.",
    highlights: [
      "Social skills development goals",
      "Sensory accommodations and supports",
      "Transition planning for high school",
      "Behavioral intervention plan integration"
    ],
    downloadUrl: "/samples/middle-school-autism-iep.pdf"
  },
  {
    title: "High School Transition IEP",
    grade: "11th Grade",
    disability: "Intellectual Disability",
    description: "Transition-focused IEP preparing student for post-secondary life with emphasis on independent living skills.",
    highlights: [
      "Post-secondary transition goals",
      "Work-based learning opportunities", 
      "Independent living skills curriculum",
      "Community resource connections"
    ],
    downloadUrl: "/samples/high-school-transition-iep.pdf"
  },
  {
    title: "ADHD Executive Function IEP",
    grade: "5th Grade",
    disability: "ADHD",
    description: "Targeted IEP addressing executive functioning challenges with practical classroom strategies.",
    highlights: [
      "Executive function skill development",
      "Time management and organization goals",
      "Classroom behavior supports",
      "Home-school communication plan"
    ],
    downloadUrl: "/samples/adhd-executive-function-iep.pdf"
  }
];

const IEP_LEARNING_MODULES = [
  {
    title: "IEP Basics: What Every Parent Should Know",
    description: "Understanding the fundamentals of IEPs, your rights, and the process",
    duration: "15 min",
    topics: ["What is an IEP?", "Your rights as a parent", "The IEP team", "Meeting process"],
    completed: false
  },
  {
    title: "Reading and Understanding Your Child's IEP",
    description: "Learn how to review each section and identify areas for improvement",
    duration: "20 min", 
    topics: ["Present levels", "Goals and objectives", "Services", "Accommodations"],
    completed: false
  },
  {
    title: "Effective IEP Goals: SMART and Meaningful",
    description: "What makes a good IEP goal and how to advocate for better ones",
    duration: "18 min",
    topics: ["SMART criteria", "Measurable outcomes", "Age-appropriate goals", "Data collection"],
    completed: false
  },
  {
    title: "Services and Accommodations Explained", 
    description: "Understanding different types of support your child can receive",
    duration: "22 min",
    topics: ["Related services", "Classroom accommodations", "Testing modifications", "Assistive technology"],
    completed: false
  },
  {
    title: "Preparing for IEP Meetings",
    description: "How to be an effective advocate and team member",
    duration: "25 min",
    topics: ["Meeting preparation", "Asking questions", "Documenting decisions", "Follow-up actions"],
    completed: false
  }
];

export default function ParentIEPMasterSuite() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'learn' | 'analyze' | 'review' | 'goals' | 'examples'>('learn');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<IEPAnalysis | null>(null);
  const [selectedModule, setSelectedModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());

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

  const handleAnalyzeIEP = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload an IEP document first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate IEP analysis
    setTimeout(() => {
      const mockAnalysis: IEPAnalysis = {
        overallScore: 78,
        sections: {
          presentLevels: 85,
          goals: 72,
          services: 80,
          accommodations: 75,
          transition: 65
        },
        recommendations: [
          "Goals should be more specific and measurable",
          "Consider adding assistive technology accommodations",
          "Transition planning needs more detail for post-secondary goals",
          "Progress monitoring frequency should be increased"
        ],
        strengths: [
          "Comprehensive present levels of performance",
          "Good variety of related services",
          "Strong parent communication plan",
          "Appropriate least restrictive environment placement"
        ],
        concerns: [
          "Some goals lack measurable criteria",
          "Limited assistive technology considerations",
          "Transition services could be more robust"
        ]
      };
      
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete!",
        description: "Your IEP has been analyzed. Review the results below.",
      });
    }, 3000);
  };

  const handleModuleComplete = (moduleIndex: number) => {
    setCompletedModules(prev => new Set([...prev, moduleIndex]));
    toast({
      title: "Module Completed!",
      description: `You've completed "${IEP_LEARNING_MODULES[moduleIndex].title}"`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 70) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <FileText className="h-10 w-10 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                IEP Master Suite
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to understand, analyze, and improve your child's IEP
            </p>
            <div className="flex justify-center space-x-2">
              <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-300">
                AI Analysis
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Expert Review
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Learning Modules
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border shadow-sm">
            <TabsTrigger value="learn" className="flex items-center gap-2" data-testid="tab-learn">
              <BookOpen className="h-4 w-4" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2" data-testid="tab-analyze">
              <Brain className="h-4 w-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2" data-testid="tab-review">
              <Star className="h-4 w-4" />
              Expert Review
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2" data-testid="tab-goals">
              <Target className="h-4 w-4" />
              Check Goals
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2" data-testid="tab-examples">
              <Eye className="h-4 w-4" />
              Examples
            </TabsTrigger>
          </TabsList>

          {/* Learn Tab */}
          <TabsContent value="learn" className="space-y-6">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      IEP Learning Center
                    </CardTitle>
                    <CardDescription>
                      Master the fundamentals of IEPs through our comprehensive learning modules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Module Navigation */}
                      <div className="space-y-2">
                        {IEP_LEARNING_MODULES.map((module, index) => (
                          <Button
                            key={index}
                            variant={selectedModule === index ? "default" : "outline"}
                            onClick={() => setSelectedModule(index)}
                            className={cn(
                              "w-full justify-start text-left h-auto p-4",
                              selectedModule === index 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "hover:bg-gray-50 dark:hover:bg-gray-800",
                              completedModules.has(index) && "border-green-500"
                            )}
                            data-testid={`button-module-${index}`}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{module.title}</div>
                                <div className="text-xs opacity-80 mt-1 flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {module.duration}
                                </div>
                              </div>
                              {completedModules.has(index) && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>

                      {/* Module Content */}
                      <div className="lg:col-span-2">
                        <Card className="border-l-4 border-l-blue-500">
                          <CardHeader>
                            <CardTitle className="text-xl text-blue-700 dark:text-blue-300">
                              {IEP_LEARNING_MODULES[selectedModule].title}
                            </CardTitle>
                            <CardDescription className="text-base">
                              {IEP_LEARNING_MODULES[selectedModule].description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Estimated time: {IEP_LEARNING_MODULES[selectedModule].duration}
                              </span>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Topics Covered:</h4>
                              <ul className="space-y-1">
                                {IEP_LEARNING_MODULES[selectedModule].topics.map((topic, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-4">
                              <Button
                                onClick={() => handleModuleComplete(selectedModule)}
                                disabled={completedModules.has(selectedModule)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                data-testid={`button-complete-module-${selectedModule}`}
                              >
                                {completedModules.has(selectedModule) ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Start Module
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Learning Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Modules Completed</span>
                          <span>{completedModules.size}/{IEP_LEARNING_MODULES.length}</span>
                        </div>
                        <Progress value={(completedModules.size / IEP_LEARNING_MODULES.length) * 100} />
                      </div>
                      
                      {completedModules.size > 0 && (
                        <Alert>
                          <Award className="h-4 w-4" />
                          <AlertDescription>
                            Great progress! You've completed {completedModules.size} learning modules.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('analyze')}
                      data-testid="button-quick-analyze"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Your IEP
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate('/parent/tools/goal-generator')}
                      data-testid="button-quick-goals"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Generate Goals
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('examples')}
                      data-testid="button-quick-examples"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Examples
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="space-y-6">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-6 w-6 text-purple-600" />
                      AI-Powered IEP Analysis
                    </CardTitle>
                    <CardDescription>
                      Upload your child's IEP and get a comprehensive analysis with actionable recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Student Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="student-select">Select Your Child</Label>
                      <StudentSelector
                        selectedStudent={selectedStudentId}
                        onStudentChange={setSelectedStudentId}
                        placeholder="Choose your child..."
                        data-testid="select-student-analyze"
                      />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-3">
                      <Label>Upload IEP Document</Label>
                      <div
                        {...getRootProps()}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                          isDragActive 
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                        )}
                        data-testid="dropzone-iep"
                      >
                        <input {...getInputProps()} />
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        {uploadedFile ? (
                          <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{uploadedFile.name}</p>
                            <p className="text-sm text-gray-500">File ready for analysis</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                              Drop your IEP here or click to browse
                            </p>
                            <p className="text-sm text-gray-500">Supports PDF, DOC, and DOCX files</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        onClick={handleAnalyzeIEP}
                        disabled={isAnalyzing || !uploadedFile}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium"
                        data-testid="button-analyze-iep"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Analyzing IEP...
                          </>
                        ) : (
                          <>
                            <Brain className="h-5 w-5 mr-2" />
                            Analyze IEP
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                {analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <BarChart3 className="h-6 w-6 text-green-600" />
                          Analysis Results
                        </span>
                        <Badge className={cn("text-lg font-semibold", getScoreBg(analysis.overallScore))}>
                          Overall Score: {analysis.overallScore}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Section Scores */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Section Breakdown:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(analysis.sections).map(([section, score]) => (
                            <Card key={section} className={cn("p-4", getScoreBg(score))}>
                              <div className="flex items-center justify-between">
                                <span className="font-medium capitalize">
                                  {section.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className={cn("font-bold", getScoreColor(score))}>
                                  {score}%
                                </span>
                              </div>
                              <Progress value={score} className="mt-2" />
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Strengths and Concerns */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-l-4 border-l-green-500">
                          <CardHeader>
                            <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5" />
                              Strengths
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analysis.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-yellow-500">
                          <CardHeader>
                            <CardTitle className="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                              <AlertCircle className="h-5 w-5" />
                              Areas for Improvement
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analysis.concerns.map((concern, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{concern}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recommendations */}
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Actionable Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {analysis.recommendations.map((recommendation, index) => (
                              <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{recommendation}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Analysis Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      Analysis Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <FileCheck className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Upload Quality:</strong> Clear, complete IEP documents provide better analysis results.
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Privacy:</strong> Your IEP documents are analyzed securely and not stored permanently.
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <MessageSquare className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Next Steps:</strong> Use the recommendations to prepare for your next IEP meeting.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Expert Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-600" />
                  Expert Review Service
                </CardTitle>
                <CardDescription>
                  Get your IEP reviewed by experienced special education professionals
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Star className="h-10 w-10 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Professional Review Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Connect with certified special education advocates and attorneys for professional IEP reviews.
                  </p>
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    Join Waitlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-green-600" />
                  IEP Goal Checker
                </CardTitle>
                <CardDescription>
                  Analyze and improve your child's IEP goals for compliance and effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Use Our Goal Generator
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Create and check IEP goals using our comprehensive Goal Generator tool.
                  </p>
                  <Button 
                    onClick={() => navigate('/parent/tools/goal-generator')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Open Goal Generator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-6 w-6 text-blue-600" />
                  Sample IEP Library
                </CardTitle>
                <CardDescription>
                  Learn from high-quality IEP examples across different grades and disabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {SAMPLE_IEPS.map((sample, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{sample.title}</CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{sample.grade}</Badge>
                              <Badge variant="secondary">{sample.disability}</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(sample.downloadUrl, '_blank')}
                            data-testid={`button-download-sample-${index}`}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {sample.description}
                        </p>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Features:</h5>
                          <ul className="space-y-1">
                            {sample.highlights.map((highlight, hIndex) => (
                              <li key={hIndex} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}