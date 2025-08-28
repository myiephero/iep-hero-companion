import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Zap,
  Target,
  BookOpen,
  Shield,
  Download,
  Eye,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  Scale,
  Award,
  Star,
  ArrowRight,
  FileCheck,
  Users,
  Calendar,
  MessageSquare,
  Crown,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AIIEPReview = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sampleAnalysis = {
    overallScore: 78,
    complianceScore: 85,
    qualityScore: 71,
    completenessScore: 82,
    criticalIssues: 3,
    recommendations: 12,
    strengths: 8,
    totalIssues: 23,
    processingTime: "2.3 seconds",
    lastUpdated: "Oct 10, 2024 3:42 PM"
  };

  const complianceAreas = [
    {
      area: "IDEA Compliance", 
      score: 90,
      status: "good",
      issues: 2,
      description: "Alignment with federal IDEA requirements"
    },
    {
      area: "State Standards",
      score: 75,
      status: "warning", 
      issues: 4,
      description: "Compliance with Illinois state regulations"
    },
    {
      area: "Goal Specificity",
      score: 65,
      status: "critical",
      issues: 6,
      description: "SMART goal criteria and measurability"
    },
    {
      area: "Service Justification",
      score: 88,
      status: "good",
      issues: 1,
      description: "Rationale for recommended services"
    },
    {
      area: "Transition Planning",
      score: 45,
      status: "critical",
      issues: 8,
      description: "Age-appropriate transition services"
    },
    {
      area: "LRE Justification",
      score: 92,
      status: "excellent",
      issues: 0,
      description: "Least restrictive environment documentation"
    }
  ];

  const criticalIssues = [
    {
      type: "critical",
      category: "Goals",
      title: "Unmeasurable IEP Goals",
      description: "3 goals lack specific, measurable criteria making progress tracking impossible.",
      impact: "High - Cannot determine if student is making progress",
      suggestion: "Rewrite goals with specific numerical targets and clear measurement methods",
      section: "Goals and Objectives",
      priority: 1
    },
    {
      type: "critical", 
      category: "Transition",
      title: "Missing Transition Services",
      description: "Student is 16 but has no transition planning or post-secondary goals.",
      impact: "High - Legal compliance violation under IDEA",
      suggestion: "Add comprehensive transition plan with employment, education, and independent living goals",
      section: "Transition Services", 
      priority: 1
    },
    {
      type: "warning",
      category: "Services",
      title: "Service Frequency Mismatch",
      description: "Speech therapy recommended 2x/week but only 1x/week documented in service grid.",
      impact: "Medium - Service delivery inconsistency",
      suggestion: "Align service recommendations with documented frequency",
      section: "Related Services",
      priority: 2
    }
  ];

  const recommendations = [
    {
      category: "Goals Enhancement",
      priority: "high",
      items: [
        "Add baseline data for all academic goals",
        "Include specific progress measurement criteria", 
        "Clarify goal completion timelines"
      ]
    },
    {
      category: "Service Optimization",
      priority: "medium", 
      items: [
        "Increase OT frequency to match needs assessment",
        "Add assistive technology evaluation",
        "Consider social skills group intervention"
      ]
    },
    {
      category: "Legal Compliance",
      priority: "high",
      items: [
        "Add required transition planning components",
        "Document LRE consideration process",
        "Include parent input documentation"
      ]
    }
  ];

  const strengths = [
    "Present Levels clearly describe student's current performance",
    "Accommodations are comprehensive and specific",
    "Assessment data is recent and relevant",
    "Behavioral supports are well-documented",
    "Team member input is clearly documented",
    "Service delivery model is appropriate",
    "Progress monitoring plan is detailed",
    "Parent concerns are addressed"
  ];

  const benchmarkData = [
    { category: "Similar IEPs", score: 82, comparison: "+4 above average" },
    { category: "School District", score: 79, comparison: "+7 above average" },
    { category: "State Average", score: 75, comparison: "+11 above average" },
    { category: "National Data", score: 73, comparison: "+13 above average" }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File Uploaded Successfully",
        description: `${file.name} is ready for analysis.`
      });
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      toast({
        title: "Analysis Complete!",
        description: "Your IEP has been analyzed for compliance and quality."
      });
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              AI IEP Review & Compliance
            </h1>
            <p className="text-muted-foreground">
              Upload your IEP for instant AI-powered compliance analysis and recommendations
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
            <Button asChild>
              <Link to="/upsell/hero-plan">
                <Crown className="h-4 w-4 mr-2" />
                Get Expert Review
              </Link>
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        {!analysisComplete && (
          <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Your IEP Document</h3>
              <p className="text-muted-foreground mb-6">
                Upload a PDF of your child's current IEP for comprehensive AI analysis
              </p>
              
              {!uploadedFile ? (
                <div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="iep-upload"
                  />
                  <label htmlFor="iep-upload">
                    <Button className="cursor-pointer" size="lg">
                      <Upload className="h-4 w-4 mr-2" />
                      Select IEP File
                    </Button>
                  </label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Accepts PDF, DOC, DOCX files up to 10MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
                    <FileCheck className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{uploadedFile.name}</span>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Brain className="h-5 w-5 text-primary animate-pulse" />
                        <span className="font-medium">AI is analyzing your IEP...</span>
                      </div>
                      <Progress value={66} className="w-64 mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Checking compliance, analyzing goals, reviewing services...
                      </p>
                    </div>
                  ) : (
                    <Button onClick={startAnalysis} size="lg">
                      <Zap className="h-4 w-4 mr-2" />
                      Start AI Analysis
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisComplete && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{sampleAnalysis.overallScore}</div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                  <Badge variant="secondary" className="mt-2">Above Average</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{sampleAnalysis.strengths}</div>
                  <div className="text-sm text-muted-foreground">Strengths Found</div>
                  <Badge variant="outline" className="mt-2">Strong Areas</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">{sampleAnalysis.criticalIssues}</div>
                  <div className="text-sm text-muted-foreground">Critical Issues</div>
                  <Badge variant="destructive" className="mt-2">Needs Attention</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{sampleAnalysis.recommendations}</div>
                  <div className="text-sm text-muted-foreground">Recommendations</div>
                  <Badge variant="outline" className="mt-2">Action Items</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Analysis Complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      Processed in {sampleAnalysis.processingTime} • Last updated {sampleAnalysis.lastUpdated}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Share with Advocate
                    </Button>
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Analysis Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Score Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Compliance Score</span>
                          <span className="font-medium">{sampleAnalysis.complianceScore}%</span>
                        </div>
                        <Progress value={sampleAnalysis.complianceScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Quality Score</span>
                          <span className="font-medium">{sampleAnalysis.qualityScore}%</span>
                        </div>
                        <Progress value={sampleAnalysis.qualityScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completeness Score</span>
                          <span className="font-medium">{sampleAnalysis.completenessScore}%</span>
                        </div>
                        <Progress value={sampleAnalysis.completenessScore} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Key Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {strengths.slice(0, 5).map((strength, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Priority Actions Needed</AlertTitle>
                  <AlertDescription>
                    Your IEP has {sampleAnalysis.criticalIssues} critical issues that should be addressed before your next meeting.
                    Focus on transition planning and goal measurability first.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Compliance Tab */}
              <TabsContent value="compliance">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Compliance Analysis
                    </CardTitle>
                    <CardDescription>
                      Review compliance with IDEA, state regulations, and best practices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {complianceAreas.map((area, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{area.area}</h3>
                              <p className="text-sm text-muted-foreground">{area.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{area.score}%</div>
                              <Badge variant={
                                area.status === 'excellent' ? 'default' :
                                area.status === 'good' ? 'secondary' :
                                area.status === 'warning' ? 'destructive' : 'destructive'
                              }>
                                {area.status === 'excellent' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {area.status === 'good' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {area.status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {area.status === 'critical' && <XCircle className="h-3 w-3 mr-1" />}
                                {area.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="mb-2">
                            <Progress value={area.score} className="h-2" />
                          </div>
                          {area.issues > 0 && (
                            <p className="text-sm text-amber-600">
                              {area.issues} issue(s) found - click "Issues" tab for details
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Issues Tab */}
              <TabsContent value="issues">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Issues & Concerns
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown of compliance issues and quality concerns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {criticalIssues.map((issue, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              {issue.type === 'critical' ? (
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                              )}
                              <div>
                                <h3 className="font-semibold">{issue.title}</h3>
                                <Badge variant={issue.type === 'critical' ? 'destructive' : 'secondary'} className="mb-2">
                                  {issue.category} • Priority {issue.priority}
                                </Badge>
                                <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="p-3 bg-red-50 rounded">
                              <h4 className="font-medium text-sm mb-1">Impact</h4>
                              <p className="text-sm">{issue.impact}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded">
                              <h4 className="font-medium text-sm mb-1">Suggested Action</h4>
                              <p className="text-sm">{issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      AI Recommendations
                    </CardTitle>
                    <CardDescription>
                      Actionable suggestions to improve your IEP quality and compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recommendations.map((category, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{category.category}</h3>
                            <Badge variant={category.priority === 'high' ? 'destructive' : 'secondary'}>
                              {category.priority} priority
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {category.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Benchmarks Tab */}
              <TabsContent value="benchmarks">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Benchmark Comparison
                    </CardTitle>
                    <CardDescription>
                      See how your IEP compares to similar cases and averages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {benchmarkData.map((benchmark, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{benchmark.category}</h3>
                            <p className="text-sm text-green-600">{benchmark.comparison}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{benchmark.score}%</div>
                            <div className="text-sm text-muted-foreground">Average Score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Immediate Actions</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Address the 3 critical compliance issues</li>
                      <li>• Rewrite unmeasurable goals with specific criteria</li>
                      <li>• Add required transition planning components</li>
                    </ul>
                    <Button className="mt-3 w-full" asChild>
                      <Link to="/parent/letters">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Request Letters
                      </Link>
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Get Expert Help</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Schedule advocate consultation</li>
                      <li>• Get Hero Plan with meeting support</li>
                      <li>• Join our parent community for tips</li>
                    </ul>
                    <Button variant="outline" className="mt-3 w-full" asChild>
                      <Link to="/parent/advocates">
                        <Users className="h-4 w-4 mr-2" />
                        Find an Advocate
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIIEPReview;