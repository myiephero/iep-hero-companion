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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  Wand2,
  ChevronDown,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const SmartLetterGenerator = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const isAdvocateUser = profile?.role === 'advocate';
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

  const parentTemplates = [
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

  const advocateTemplates = [
    {
      id: "professional-evaluation-request",
      title: "Professional Evaluation Request",
      description: "Formal evaluation request with legal citations and IDEA compliance requirements",
      category: "Evaluation",
      urgency: "High",
      timeframe: "60 days",
      complexity: "Complex"
    },
    {
      id: "comprehensive-service-request",
      title: "Comprehensive Service Request",
      description: "Detailed service request with FAPE justification and LRE analysis",
      category: "Services",
      urgency: "High",
      timeframe: "30 days",
      complexity: "Complex"
    },
    {
      id: "placement-advocacy",
      title: "Placement Advocacy Letter",
      description: "Professional placement recommendation with legal precedent citations",
      category: "Placement",
      urgency: "High",
      timeframe: "immediate",
      complexity: "Complex"
    },
    {
      id: "case-summary",
      title: "Case Summary & Analysis",
      description: "Comprehensive case overview with compliance assessment",
      category: "Professional",
      urgency: "Standard",
      timeframe: "5 days",
      complexity: "Complex"
    },
    {
      id: "legal-notice",
      title: "Legal Notice & Demand",
      description: "Formal legal notice with compliance requirements and deadlines",
      category: "Legal",
      urgency: "Urgent",
      timeframe: "10 days",
      complexity: "Complex"
    },
    {
      id: "due-process-notice",
      title: "Due Process Hearing Notice",
      description: "Formal due process complaint filing with legal requirements",
      category: "Legal",
      urgency: "Urgent",
      timeframe: "2 years",
      complexity: "Complex"
    },
    {
      id: "expert-testimony",
      title: "Expert Opinion Letter",
      description: "Professional opinion for hearings with qualifications and analysis",
      category: "Legal",
      urgency: "High",
      timeframe: "14 days",
      complexity: "Complex"
    },
    {
      id: "compliance-review",
      title: "IEP Compliance Review",
      description: "Systematic review of IEP compliance with regulatory standards",
      category: "Professional",
      urgency: "Standard",
      timeframe: "30 days",
      complexity: "Complex"
    }
  ];

  // Use role-appropriate templates
  const letterTemplates = isAdvocateUser ? advocateTemplates : parentTemplates;

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
      
      // Generate role-specific analysis-aware content
      let analysisContextText = '';
      if (analysisContext) {
        const rolePrefix = isAdvocateUser ? "My professional analysis" : "Based on my recent analysis";
        const roleAction = isAdvocateUser ? "requires immediate attention and formal review" : "I would like to discuss";
        
        switch (analysisContext.analysisType.toLowerCase()) {
          case 'iep_quality':
            analysisContextText = `\n\n${rolePrefix} of the current IEP document (${analysisContext.fileName}) has identified several compliance and quality issues that ${roleAction}. This comprehensive analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
            break;
          case 'compliance':
            analysisContextText = `\n\n${rolePrefix} of the current IEP document (${analysisContext.fileName}) has revealed significant compliance concerns that ${roleAction} ${isAdvocateUser ? "in accordance with IDEA regulations" : "to ensure my child receives appropriate services"}. This analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
            break;
          case 'accommodation':
            analysisContextText = `\n\nFollowing ${rolePrefix.toLowerCase()} of current accommodations (${analysisContext.fileName}), ${isAdvocateUser ? "I recommend immediate modifications to ensure FAPE compliance" : "I would like to discuss modifications and improvements to better support my child's needs"}. This analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
            break;
          case 'meeting_prep':
            analysisContextText = `\n\n${rolePrefix} and preparation review (${analysisContext.fileName}) ${isAdvocateUser ? "indicates the need for formal meeting to address compliance issues" : "has been completed for our upcoming meeting and I would like to schedule time to discuss the findings"}. This analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
            break;
          default:
            analysisContextText = `\n\n${rolePrefix} of relevant documentation (${analysisContext.fileName}) ${isAdvocateUser ? "indicates the need for formal review and potential corrective action" : "suggests it would be beneficial to meet and discuss the findings"}. This analysis was completed on ${new Date(analysisContext.timestamp).toLocaleDateString()}.`;
        }
      }
      
      // Generate role-specific letter content
      const parentContent = `Dear Dr. Martinez,

I am writing to formally request ${template?.title.toLowerCase()} for my child, Emma Thompson, who is currently enrolled in 4th Grade at Lincoln Elementary School.${analysisContextText}

${analysisContextText ? 'The analysis has provided valuable insights that I believe warrant discussion and potential action. ' : ''}As Emma's parent/guardian, I am requesting this under the provisions of the Individuals with Disabilities Education Act (IDEA) and Section 504 of the Rehabilitation Act.

I look forward to working collaboratively with the IEP team to ensure Emma receives the appropriate educational support she needs to succeed.

Please provide written confirmation of receipt of this request and the anticipated timeline for response.

Thank you for your attention to this matter.

Sincerely,
Sarah Thompson
Parent/Guardian of Emma Thompson
Phone: (555) 123-4567
Email: sarah.thompson@email.com

Date: ${new Date().toLocaleDateString()}`;

      const advocateContent = `FORMAL NOTICE AND REQUEST
Re: ${template?.title.toUpperCase()} - Emma Thompson, DOB: [DATE]

Dear Dr. Martinez:

I am writing in my professional capacity as a special education advocate to formally request ${template?.title.toLowerCase()} for Emma Thompson, currently enrolled in 4th Grade at Lincoln Elementary School, Springfield District.${analysisContextText}

${analysisContextText ? 'This professional assessment indicates immediate action is required to ensure compliance with federal mandates. ' : ''}This request is made pursuant to the Individuals with Disabilities Education Act (IDEA), 20 U.S.C. § 1400 et seq., Section 504 of the Rehabilitation Act of 1973, 29 U.S.C. § 794, and applicable state regulations.

LEGAL REQUIREMENTS AND TIMELINE:
Please be advised that this request triggers specific legal obligations and timelines as outlined in 34 CFR § 300.301 and related provisions. Your district is required to provide written notice of action within 10 business days of receipt of this request.

I expect full compliance with all procedural safeguards and look forward to your prompt response confirming receipt and outlining the district's proposed timeline for completion.

Should you have questions regarding this request or require additional documentation, please contact me directly.

Professional regards,

[Professional Advocate Name]
Special Education Advocate
Professional License #: [LICENSE]
Phone: (555) 987-6543
Email: advocate@iephero.com

cc: Parent/Guardian - Sarah Thompson
    Special Education Director
    File

Date: ${new Date().toLocaleDateString()}`;

      const generatedContent = isAdvocateUser ? advocateContent : parentContent;

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

  const handleLetterHistory = () => {
    toast({
      title: "Letter History",
      description: "Viewing your letter history..."
    });
    // TODO: Implement letter history functionality
  };

  const handleMyTemplates = () => {
    toast({
      title: "My Templates",
      description: "Loading your custom templates..."
    });
    // TODO: Implement custom templates functionality
  };

  const handleSettings = () => {
    toast({
      title: "Preferences",
      description: "Opening letter generation preferences..."
    });
    // TODO: Implement preferences/settings functionality
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wand2 className="h-8 w-8 text-primary" />
              Smart Letter Generator
              {isAdvocateUser && <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">Professional</Badge>}
            </h1>
            <p className="text-muted-foreground">
              {isAdvocateUser 
                ? "Generate professional advocacy letters with legal language, compliance features, and expert documentation"
                : "Generate professional FERPA, IEP, and advocacy letters with AI assistance tailored for parents"
              }
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Tools & History
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleLetterHistory()}>
                <History className="h-4 w-4 mr-2" />
                Letter History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMyTemplates()}>
                <FileType className="h-4 w-4 mr-2" />
                My Templates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSettings()}>
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                      <span className="text-sm font-medium">{isAdvocateUser ? 'Professional Guidelines' : 'Helpful Tips'}</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {isAdvocateUser ? (
                        <>
                          <li>• Ensure all regulatory citations are accurate and current</li>
                          <li>• Include specific timeline requirements per federal guidelines</li>
                          <li>• Document all previous communications and responses</li>
                          <li>• Use precise legal terminology for maximum impact</li>
                        </>
                      ) : (
                        <>
                          <li>• Consider adding specific examples of your concerns</li>
                          <li>• Include any previous communications or documentation</li>
                          <li>• Verify all contact information is current</li>
                          <li>• Keep a collaborative and positive tone</li>
                        </>
                      )}
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
                    {isAdvocateUser 
                      ? "Deliver professional correspondence with formal tracking and legal documentation" 
                      : "Choose how to send your letter and set up tracking"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">{isAdvocateUser ? 'Professional Email Delivery' : 'Email Delivery'}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isAdvocateUser 
                          ? 'Send via secure email with delivery confirmation and legal timestamp'
                          : 'Send directly via email with read receipts'}
                      </p>
                      <Button className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        {isAdvocateUser ? 'Send Professional Email' : 'Send via Email'}
                      </Button>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">{isAdvocateUser ? 'Certified Mail Package' : 'Print & Mail'}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isAdvocateUser 
                          ? 'Download with certified mail instructions and legal formatting'
                          : 'Download formatted PDF for printing'}
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        {isAdvocateUser ? 'Prepare Legal Document' : 'Download PDF'}
                      </Button>
                    </Card>
                  </div>

                  <div className={`p-4 rounded-lg ${isAdvocateUser ? 'bg-purple-50' : 'bg-blue-50'}`}>
                    <div className="flex items-start gap-2">
                      <Shield className={`h-5 w-5 mt-0.5 ${isAdvocateUser ? 'text-purple-600' : 'text-blue-600'}`} />
                      <div>
                        <h4 className={`font-semibold ${isAdvocateUser ? 'text-purple-900' : 'text-blue-900'}`}>
                          {isAdvocateUser ? 'Legal Compliance Tracking' : 'Tracking & Follow-up'}
                        </h4>
                        <p className={`text-sm mt-1 ${isAdvocateUser ? 'text-purple-700' : 'text-blue-700'}`}>
                          {isAdvocateUser 
                            ? 'Automatic tracking of legal deadlines per IDEA regulations. System monitors district compliance with 10-day response requirements and escalation protocols.'
                            : 'We\'ll automatically track response deadlines and send you reminders. You\'ll receive notifications when it\'s time to follow up.'}
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
                  {isAdvocateUser ? 'Professional Resources' : 'Legal Resources'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isAdvocateUser ? (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      IDEA Legal Framework
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Scale className="h-4 w-4 mr-2" />
                      Case Law Database
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Compliance Checklist
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Legal Timeline Tracker
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartLetterGenerator;