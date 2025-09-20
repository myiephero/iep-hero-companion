import { useState, useEffect } from "react";
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
  Settings,
  CalendarCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Student } from "@/lib/api";

const SmartLetterGeneratorNew = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isAdvocateUser = profile?.role === 'advocate';
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const [formData, setFormData] = useState({
    studentName: "",
    studentGrade: "",
    schoolName: "",
    schoolDistrict: "",
    principalName: "",
    parentName: "",
    parentPhone: "",
    parentEmail: ""
  });
  const [analysisContext, setAnalysisContext] = useState<{
    analysisType: string;
    fileName: string;
    timestamp: string;
  } | null>(null);

  // Handle URL parameters for analysis context and templates
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const context = urlParams.get('context');
    const analysisType = urlParams.get('analysisType');
    const fileName = urlParams.get('fileName');
    const timestamp = urlParams.get('timestamp');
    const template = urlParams.get('template');

    // Handle direct template parameter (from FERPA Overview links)
    if (template) {
      setSelectedTemplate(template);
      toast({
        title: "Template Pre-selected",
        description: "Template loaded from your previous page.",
      });
      return;
    }

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
    },
    {
      id: "correction-request",
      title: "Educational Record Correction",
      description: "Request correction of inaccurate records",
      category: "Records Correction",
      urgency: "Standard",
      timeframe: "45 days",
      complexity: "Medium"
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

  // Fetch students from API
  const apiClient = new ApiClient();
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/students'],
    queryFn: () => apiClient.getStudents()
  });

  // ✅ ALL 50 US STATES - NEW FILE WITH ALL STATES
  const stateOptions = [
    { value: "AL", name: "Alabama" },
    { value: "AK", name: "Alaska" },
    { value: "AZ", name: "Arizona" },
    { value: "AR", name: "Arkansas" },
    { value: "CA", name: "California" },
    { value: "CO", name: "Colorado" },
    { value: "CT", name: "Connecticut" },
    { value: "DE", name: "Delaware" },
    { value: "DC", name: "District of Columbia" },
    { value: "FL", name: "Florida" },
    { value: "GA", name: "Georgia" },
    { value: "HI", name: "Hawaii" },
    { value: "ID", name: "Idaho" },
    { value: "IL", name: "Illinois" },
    { value: "IN", name: "Indiana" },
    { value: "IA", name: "Iowa" },
    { value: "KS", name: "Kansas" },
    { value: "KY", name: "Kentucky" },
    { value: "LA", name: "Louisiana" },
    { value: "ME", name: "Maine" },
    { value: "MD", name: "Maryland" },
    { value: "MA", name: "Massachusetts" },
    { value: "MI", name: "Michigan" },
    { value: "MN", name: "Minnesota" },
    { value: "MS", name: "Mississippi" },
    { value: "MO", name: "Missouri" },
    { value: "MT", name: "Montana" },
    { value: "NE", name: "Nebraska" },
    { value: "NV", name: "Nevada" },
    { value: "NH", name: "New Hampshire" },
    { value: "NJ", name: "New Jersey" },
    { value: "NM", name: "New Mexico" },
    { value: "NY", name: "New York" },
    { value: "NC", name: "North Carolina" },
    { value: "ND", name: "North Dakota" },
    { value: "OH", name: "Ohio" },
    { value: "OK", name: "Oklahoma" },
    { value: "OR", name: "Oregon" },
    { value: "PA", name: "Pennsylvania" },
    { value: "RI", name: "Rhode Island" },
    { value: "SC", name: "South Carolina" },
    { value: "SD", name: "South Dakota" },
    { value: "TN", name: "Tennessee" },
    { value: "TX", name: "Texas" },
    { value: "UT", name: "Utah" },
    { value: "VT", name: "Vermont" },
    { value: "VA", name: "Virginia" },
    { value: "WA", name: "Washington" },
    { value: "WV", name: "West Virginia" },
    { value: "WI", name: "Wisconsin" },
    { value: "WY", name: "Wyoming" }
  ];

  console.log('🏛️ NEW FILE: All 50 states loaded:', stateOptions.length);

  // Pre-populate parent information when profile loads
  useEffect(() => {
    if (profile && !isAdvocateUser) {
      setFormData(prev => ({
        ...prev,
        parentName: profile?.firstName && profile?.lastName 
          ? `${profile.firstName} ${profile.lastName}` 
          : profile?.username || "",
        parentPhone: profile?.phone || "",
        parentEmail: profile?.email || ""
      }));
    }
  }, [profile, isAdvocateUser]);

  // Update form data when student is selected
  useEffect(() => {
    if (selectedStudent) {
      setFormData(prev => ({
        ...prev,
        studentName: selectedStudent.full_name || "",
        studentGrade: selectedStudent.grade_level || "",
        schoolName: selectedStudent.school_name || "",
        schoolDistrict: selectedStudent.district || "",
        principalName: "",
        // Keep existing parent data if already populated
        parentName: prev.parentName || (profile?.firstName && profile?.lastName 
          ? `${profile.firstName} ${profile.lastName}` 
          : profile?.username || ""),
        parentPhone: prev.parentPhone || profile?.phone || "",
        parentEmail: prev.parentEmail || profile?.email || ""
      }));
    }
  }, [selectedStudent, profile]);

  const formFields = [
    { id: "studentName", label: "Student Name", type: "text", required: true },
    { id: "studentGrade", label: "Grade", type: "text", required: true },
    { id: "schoolName", label: "School Name", type: "text", required: true },
    { id: "schoolDistrict", label: "School District", type: "text", required: true },
    { id: "principalName", label: "Principal Name", type: "text", required: false },
    { id: "parentName", label: "Parent/Guardian Name", type: "text", required: true },
    { id: "parentPhone", label: "Phone Number", type: "tel", required: true },
    { id: "parentEmail", label: "Email Address", type: "email", required: true }
  ];

  const generateLetter = async () => {
    setIsGenerating(true);
    
    try {
      if (!selectedStudent || !selectedTemplate || !selectedState) {
        toast({
          title: "Missing Information",
          description: "Please select a student, template, and state before generating.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      // Prepare data for AI generation
      const userInputs = {
        student: selectedStudent,
        state: selectedState,
        formData: formData,
        template: selectedTemplate,
        role: profile?.role || 'parent',
        analysisContext: analysisContext
      };

      // Call the real AI endpoint
      const result = await apiClient.createActionDraft(
        analysisContext?.timestamp || `letter-${Date.now()}`,
        selectedTemplate,
        userInputs
      );

      if (result && result.content) {
        setLetterContent(result.content);
        setCurrentStep(3);
        
        toast({
          title: "Letter Generated Successfully",
          description: "Your AI-generated letter is ready for review."
        });
      } else {
        throw new Error('No content received from AI service');
      }
    } catch (error) {
      console.error('Error generating letter:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate letter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
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
              🏛️ Smart Letter Generator - ALL 50 STATES
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
                  {/* Student Selection */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="student-select">Select Student <span className="text-destructive">*</span></Label>
                      <Select value={selectedStudent?.id || ""} onValueChange={(value) => {
                        const student = students.find(s => s.id === value);
                        setSelectedStudent(student || null);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder={studentsLoading ? "Loading students..." : "Choose a student"} />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id || ""}>
                              {student.full_name} - {student.grade_level} ({student.school_name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* State Selection - ALL 50 STATES */}
                    <div>
                      <Label htmlFor="state-select">State ({stateOptions.length} options) <span className="text-destructive">*</span></Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state for specific regulations" />
                        </SelectTrigger>
                        <SelectContent>
                          {stateOptions.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {formFields.map((field) => (
                      <div key={field.id}>
                        <Label htmlFor={field.id}>
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                          id={field.id}
                          type={field.type}
                          value={formData[field.id as keyof typeof formData] || ""}
                          onChange={(e) => setFormData(prev => ({...prev, [field.id]: e.target.value}))}
                          required={field.required}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button 
                      onClick={() => generateLetter()}
                      disabled={!selectedStudent || !selectedState || isGenerating}
                    >
                      {isGenerating ? "Generating..." : "Generate Letter"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review & Edit */}
            {currentStep === 3 && letterContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Review & Edit Letter
                  </CardTitle>
                  <CardDescription>
                    Review your generated letter and make any necessary edits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Your generated letter will appear here..."
                  />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadLetter}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCurrentStep(2)}>
                        Back to Edit
                      </Button>
                      <Button onClick={() => setCurrentStep(4)}>
                        Finalize Letter
                        <Send className="h-4 w-4 ml-2" />
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
                    Send & Track
                  </CardTitle>
                  <CardDescription>
                    Send your letter and track communication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Letter Ready!</h3>
                    <p className="text-green-700 mb-4">
                      Your {letterTemplates.find(t => t.id === selectedTemplate)?.title} has been generated successfully.
                    </p>
                    
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Letter
                      </Button>
                      <Button variant="outline" onClick={downloadLetter}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Back to Review
                    </Button>
                    <Button onClick={() => {
                      setCurrentStep(1);
                      setSelectedTemplate("");
                      setLetterContent("");
                      setSelectedStudent(null);
                      setSelectedState("");
                      setFormData({
                        studentName: "",
                        studentGrade: "",
                        schoolName: "",
                        schoolDistrict: "",
                        principalName: "",
                        parentName: "",
                        parentPhone: "",
                        parentEmail: ""
                      });
                    }}>
                      Create New Letter
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
                  <Scale className="h-5 w-5" />
                  Legal Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/parent/tools/idea-rights-guide" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <BookOpen className="h-4 w-4" />
                  IDEA Rights Guide
                </Link>
                <Link to="/ferpa-overview" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <Shield className="h-4 w-4" />
                  FERPA Overview
                </Link>
                <Link to="/parent/tools/plan-504-guide" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <FileText className="h-4 w-4" />
                  504 Plan Guide
                </Link>
                <Link to="/timeline-calculator" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <CalendarCheck className="h-4 w-4" />
                  Timeline Calculator
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartLetterGeneratorNew;