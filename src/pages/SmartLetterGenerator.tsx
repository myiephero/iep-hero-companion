import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  Copy, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Users,
  Calendar,
  Target,
  BookOpen,
  Scale,
  Shield,
  Edit,
  Send,
  Eye,
  History,
  FileType,
  Wand2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const SmartLetterGenerator = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisContext, setAnalysisContext] = useState<{
    analysisType: string;
    fileName: string;
    timestamp: string;
  } | null>(null);

  // Handle URL parameters for analysis context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const context = urlParams.get('context');
    const analysisType = urlParams.get('analysisType');
    const fileName = urlParams.get('fileName');
    const timestamp = urlParams.get('timestamp');

    if (context === 'analysis' && analysisType) {
      setAnalysisContext({
        analysisType,
        fileName: fileName || '',
        timestamp: timestamp || ''
      });

      // Auto-select appropriate template based on analysis type
      let suggestedTemplate = '';
      switch (analysisType.toLowerCase()) {
        case 'iep_quality':
        case 'goal_analysis':
          suggestedTemplate = 'iep-meeting-request';
          break;
        case 'compliance':
          suggestedTemplate = 'prior-written-notice';
          break;
        case 'accommodation':
          suggestedTemplate = 'accommodation-request';
          break;
        case 'meeting_prep':
          suggestedTemplate = 'iep-meeting-request';
          break;
        default:
          suggestedTemplate = 'iep-meeting-request';
      }
      setSelectedTemplate(suggestedTemplate);

      // Show context notification
      toast({
        title: "Analysis Context Loaded",
        description: `Pre-selected template based on your ${analysisType.replace('_', ' ')} analysis.`,
      });
    }
  }, [toast]);

  const letterTemplates = [
    {
      id: "ferpa-request",
      title: "FERPA Records Request",
      description: "Request educational records under FERPA",
      category: "Records Access",
      urgency: "Standard",
      timeframe: "45 days",
      complexity: "Simple"
    },
    {
      id: "iep-meeting-request",
      title: "IEP Meeting Request",
      description: "Request an IEP team meeting",
      category: "Meeting Request",
      urgency: "High",
      timeframe: "30 days",
      complexity: "Medium"
    },
    {
      id: "evaluation-request",
      title: "Special Education Evaluation",
      description: "Request comprehensive evaluation",
      category: "Evaluation",
      urgency: "High",
      timeframe: "60 days",
      complexity: "Complex"
    },
    {
      id: "accommodation-request",
      title: "504 Accommodation Request",
      description: "Request 504 plan accommodations",
      category: "Accommodations",
      urgency: "Medium",
      timeframe: "30 days",
      complexity: "Medium"
    },
    {
      id: "placement-concern",
      title: "Placement Concern Letter",
      description: "Express concerns about current placement",
      category: "Advocacy",
      urgency: "High",
      timeframe: "15 days",
      complexity: "Complex"
    },
    {
      id: "prior-written-notice",
      title: "Prior Written Notice Request",
      description: "Request PWN for school decisions",
      category: "Legal Rights",
      urgency: "Standard",
      timeframe: "10 days",
      complexity: "Simple"
    }
  ];

  const recentLetters = [
    {
      id: 1,
      title: "FERPA Records Request - Emma",
      type: "FERPA Request",
      date: "Oct 8, 2024",
      status: "Sent",
      recipient: "Lincoln Elementary"
    },
    {
      id: 2,
      title: "IEP Meeting Request - Alex",
      type: "Meeting Request", 
      date: "Oct 5, 2024",
      status: "Draft",
      recipient: "Washington Middle"
    },
    {
      id: 3,
      title: "Accommodation Request - Emma",
      type: "504 Request",
      date: "Sep 28, 2024",
      status: "Response Received",
      recipient: "Lincoln Elementary"
    }
  ];

  const formFields = [
    { id: "studentName", label: "Student Name", type: "text", required: true, value: "Emma Thompson" },
    { id: "studentGrade", label: "Grade", type: "text", required: true, value: "4th Grade" },
    { id: "schoolName", label: "School Name", type: "text", required: true, value: "Lincoln Elementary" },
    { id: "schoolDistrict", label: "School District", type: "text", required: true, value: "Springfield District" },
    { id: "principalName", label: "Principal Name", type: "text", required: false, value: "Dr. Jennifer Martinez" },
    { id: "parentName", label: "Parent/Guardian Name", type: "text", required: true, value: "Sarah Thompson" },
    { id: "parentPhone", label: "Phone Number", type: "tel", required: true, value: "(555) 123-4567" },
    { id: "parentEmail", label: "Email Address", type: "email", required: true, value: "sarah.thompson@email.com" }
  ];

  const generateLetter = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const template = letterTemplates.find(t => t.id === selectedTemplate);
      
      // Generate analysis-aware content
      let analysisContextText = '';
      if (analysisContext) {
        switch (analysisContext.analysisType.toLowerCase()) {
          case 'iep_quality':
            analysisContextText = `\n\nBased on my recent analysis of the current IEP document (${analysisContext.fileName}), I have identified several areas that require attention and discussion. This analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
            break;
          case 'compliance':
            analysisContextText = `\n\nMy recent compliance analysis of the current IEP document (${analysisContext.fileName}) has revealed potential compliance concerns that need to be addressed. This analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
            break;
          case 'accommodation':
            analysisContextText = `\n\nFollowing my analysis of current accommodations (${analysisContext.fileName}), I would like to discuss modifications and improvements to better support my child's needs. This analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
            break;
          case 'meeting_prep':
            analysisContextText = `\n\nI have completed a thorough preparation analysis (${analysisContext.fileName}) for our upcoming meeting and would like to schedule time to discuss the findings. This analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
            break;
          default:
            analysisContextText = `\n\nBased on my recent document analysis (${analysisContext.fileName}), I believe it would be beneficial to meet and discuss the findings. This analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
        }
      }
      
      const generatedContent = `Dear Dr. Martinez,

I am writing to formally request ${template?.title.toLowerCase()} for my child, Emma Thompson, who is currently enrolled in 4th Grade at Lincoln Elementary School.${analysisContextText}

${analysisContextText ? 'The analysis has provided valuable insights that I believe warrant discussion and potential action. ' : ''}As Emma's parent/guardian, I am requesting this under the provisions of the Individuals with Disabilities Education Act (IDEA) and Section 504 of the Rehabilitation Act.

Please provide written confirmation of receipt of this request and the anticipated timeline for response.

Thank you for your attention to this matter.

Sincerely,
Sarah Thompson
Parent/Guardian of Emma Thompson
Phone: (555) 123-4567
Email: sarah.thompson@email.com

Date: ${new Date().toLocaleDateString()}`;

      setLetterContent(generatedContent);
      setIsGenerating(false);
      setCurrentStep(3);
      
      toast({
        title: "Letter Generated Successfully",
        description: "Your analysis-informed letter has been generated and is ready for review."
      });
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letterContent);
    toast({
      title: "Copied to Clipboard",
      description: "Letter content has been copied to your clipboard."
    });
  };

  const downloadLetter = () => {
    const blob = new Blob([letterContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Letter Downloaded",
      description: "Your letter has been downloaded as a text file."
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Smart Letter Generator</h1>
            <p className="text-muted-foreground">
              Generate professional FERPA, IEP, and advocacy letters with AI assistance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              Letter History
            </Button>
            <Button variant="outline">
              <FileType className="h-4 w-4 mr-2" />
              My Templates
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">Step {currentStep} of 4</span>
            </div>
            <Progress value={(currentStep / 4) * 100} className="mb-4" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>Select Template</span>
              <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Fill Details</span>
              <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Review & Edit</span>
              <span className={currentStep >= 4 ? "text-primary font-medium" : ""}>Send & Track</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {/* Step 1: Template Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileType className="h-5 w-5" />
                    Choose Letter Template
                  </CardTitle>
                  <CardDescription>
                    Select the type of letter you need to generate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {letterTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{template.title}</h3>
                          <Badge variant={
                            template.urgency === 'High' ? 'destructive' :
                            template.urgency === 'Medium' ? 'secondary' : 'outline'
                          }>
                            {template.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Timeline: {template.timeframe}</span>
                          <span className="text-muted-foreground">Complexity: {template.complexity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      disabled={!selectedTemplate}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Form Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Letter Details
                  </CardTitle>
                  <CardDescription>
                    Fill in the details for your {letterTemplates.find(t => t.id === selectedTemplate)?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {formFields.map((field) => (
                      <div key={field.id}>
                        <Label htmlFor={field.id}>
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                          id={field.id}
                          type={field.type}
                          defaultValue={field.value}
                          required={field.required}
                        />
                      </div>
                    ))}
                  </div>

                  {selectedTemplate === "evaluation-request" && (
                    <div className="space-y-4">
                      <Label>Areas of Concern (check all that apply)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Academic Performance",
                          "Communication Skills", 
                          "Social/Emotional Development",
                          "Behavioral Concerns",
                          "Motor Skills",
                          "Cognitive Development"
                        ].map((area) => (
                          <div key={area} className="flex items-center space-x-2">
                            <Checkbox id={area} />
                            <Label htmlFor={area} className="text-sm">{area}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information or Specific Requests</Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Include any specific details, concerns, or requests you want to mention in the letter..."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button onClick={generateLetter} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Letter
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review & Edit */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Review Your Letter
                  </CardTitle>
                  <CardDescription>
                    Review the generated letter and make any necessary edits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">AI Suggestions</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Consider adding specific examples of your concerns</li>
                      <li>• Include any previous communications or documentation</li>
                      <li>• Verify all contact information is current</li>
                    </ul>
                  </div>

                  <div>
                    <Label htmlFor="letterContent">Letter Content</Label>
                    <Textarea
                      id="letterContent"
                      value={letterContent}
                      onChange={(e) => setLetterContent(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back to Edit Details
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" onClick={downloadLetter}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={() => setCurrentStep(4)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Letter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Send & Track */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send & Track Letter
                  </CardTitle>
                  <CardDescription>
                    Choose how to send your letter and set up tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Email Delivery</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Send directly via email with read receipts
                      </p>
                      <Button className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Send via Email
                      </Button>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Print & Mail</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Download formatted PDF for printing
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </Card>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Tracking & Follow-up</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          We'll automatically track response deadlines and send you reminders. 
                          You'll receive notifications when it's time to follow up.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Back to Review
                    </Button>
                    <Button onClick={() => {
                      toast({
                        title: "Letter Sent Successfully",
                        description: "Your letter has been sent and tracking has been set up."
                      });
                    }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Letters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentLetters.map((letter) => (
                  <div key={letter.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">{letter.title}</h4>
                    <p className="text-xs text-muted-foreground">{letter.type}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{letter.date}</span>
                      <Badge variant={
                        letter.status === 'Sent' ? 'default' :
                        letter.status === 'Draft' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {letter.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Legal Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  IDEA Rights Guide
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  FERPA Overview
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  504 Plan Guide
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline Calculator
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartLetterGenerator;