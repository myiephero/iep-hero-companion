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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calendar, 
  CheckCircle, 
  Download, 
  FileText, 
  Users, 
  Target, 
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Clock,
  Star,
  MessageSquare,
  Shield,
  Award,
  ArrowRight,
  ArrowLeft,
  Printer,
  Send,
  Eye,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Save,
  FolderOpen,
  Settings,
  ChevronDown,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Link, useNavigate, useLocation } from "react-router-dom";

const MeetingPrepWizard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState({});
  const [selectedMeetingType, setSelectedMeetingType] = useState("");
  
  // Extract meeting context from location state
  const meetingContext = location.state?.meeting;
  const fromSchedule = location.state?.fromSchedule;
  const [isLoading, setIsLoading] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [saveFormat, setSaveFormat] = useState('pdf');

  const meetingTypes = [
    {
      id: "annual-review",
      title: "Annual IEP Review",
      description: "Yearly review of IEP goals and services",
      duration: "90-120 minutes",
      participants: "Full IEP Team",
      urgency: "Scheduled"
    },
    {
      id: "goal-review",
      title: "IEP Goal Review",
      description: "Progress check on specific goals",
      duration: "45-60 minutes", 
      participants: "Core Team",
      urgency: "Standard"
    },
    {
      id: "placement-meeting",
      title: "Placement Discussion",
      description: "Reviewing educational placement",
      duration: "60-90 minutes",
      participants: "Extended Team",
      urgency: "Important"
    },
    {
      id: "transition-planning",
      title: "Transition Planning",
      description: "Planning for next educational phase",
      duration: "90-120 minutes",
      participants: "Transition Team",
      urgency: "Critical"
    },
    {
      id: "behavior-meeting",
      title: "Behavioral Intervention",
      description: "Addressing behavioral concerns",
      duration: "60-90 minutes",
      participants: "Behavior Team",
      urgency: "Urgent"
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution",
      description: "Resolving disagreements",
      duration: "120+ minutes",
      participants: "Full Team + Facilitator",
      urgency: "Critical"
    }
  ];

  const stepQuestions = {
    2: {
      title: "Meeting Basics",
      questions: [
        {
          id: "student-name",
          type: "text",
          label: "Student Name",
          required: true,
          placeholder: "Enter student's full name"
        },
        {
          id: "meeting-date",
          type: "date",
          label: "Meeting Date",
          required: true
        },
        {
          id: "meeting-time",
          type: "time", 
          label: "Meeting Time",
          required: true
        },
        {
          id: "meeting-location",
          type: "text",
          label: "Meeting Location",
          required: true,
          placeholder: "School name and room number"
        },
        {
          id: "attendees",
          type: "textarea",
          label: "Expected Attendees",
          placeholder: "List who will be attending (teachers, specialists, administrators, etc.)",
          rows: 3
        }
      ]
    },
    3: {
      title: "Current Concerns & Priorities",
      questions: [
        {
          id: "main-concerns",
          type: "textarea",
          label: "What are your main concerns or questions?",
          placeholder: "Describe your primary concerns about your child's education...",
          rows: 4,
          required: true
        },
        {
          id: "priority-areas",
          type: "checkbox-group",
          label: "Priority Areas (select all that apply)",
          options: [
            "Academic Progress",
            "Behavioral Support", 
            "Social Skills Development",
            "Communication Skills",
            "Independent Living Skills",
            "Transition Planning",
            "Related Services (OT, PT, Speech)",
            "Classroom Accommodations",
            "Testing Modifications",
            "Placement Options"
          ]
        },
        {
          id: "specific-goals",
          type: "textarea",
          label: "Specific goals you want to discuss",
          placeholder: "What specific outcomes are you hoping for?",
          rows: 3
        }
      ]
    },
    4: {
      title: "Progress & Observations",
      questions: [
        {
          id: "home-observations",
          type: "textarea",
          label: "What have you observed at home?",
          placeholder: "Describe your child's strengths, challenges, and behaviors at home...",
          rows: 4,
          required: true
        },
        {
          id: "successful-strategies",
          type: "textarea",
          label: "Strategies that work well at home",
          placeholder: "What approaches, tools, or strategies have been successful?",
          rows: 3
        },
        {
          id: "challenging-areas",
          type: "textarea", 
          label: "Areas that remain challenging",
          placeholder: "What continues to be difficult for your child?",
          rows: 3
        },
        {
          id: "outside-services",
          type: "textarea",
          label: "Outside services or evaluations",
          placeholder: "List any private therapy, tutoring, or recent evaluations...",
          rows: 3
        }
      ]
    },
    5: {
      title: "Questions & Requests",
      questions: [
        {
          id: "questions-for-team",
          type: "textarea",
          label: "Questions for the IEP team",
          placeholder: "List specific questions you want to ask...",
          rows: 4,
          required: true
        },
        {
          id: "service-requests",
          type: "checkbox-group",
          label: "Service changes you're considering",
          options: [
            "Increase speech therapy frequency",
            "Add occupational therapy",
            "Modify behavioral plan",
            "Change classroom placement",
            "Add assistive technology",
            "Increase aide support",
            "Modify testing accommodations",
            "Add social skills training",
            "Increase counseling services",
            "Add transition services"
          ]
        },
        {
          id: "documentation-requests",
          type: "checkbox-group",
          label: "Documents you want to request",
          options: [
            "Current progress data",
            "Classroom observation reports",
            "Assessment results",
            "Behavior tracking sheets",
            "Work samples",
            "Teacher input forms",
            "Related service reports",
            "Prior written notice",
            "Meeting recordings permission"
          ]
        }
      ]
    }
  };

  const tips = {
    1: [
      "Choose the meeting type that best matches your situation",
      "Different meeting types have different time allocations",
      "Some meetings require specific team members"
    ],
    2: [
      "Confirm all meeting details in advance",
      "Ask for a list of attendees beforehand",
      "Request agenda items if available"
    ],
    3: [
      "Be specific about your concerns",
      "Prioritize your most important issues",
      "Think about desired outcomes"
    ],
    4: [
      "Concrete examples are most helpful",
      "Include both positive and concerning observations",
      "Mention any successful strategies"
    ],
    5: [
      "Prepare questions in advance",
      "Don't hesitate to ask for clarification",
      "Request documentation of decisions"
    ],
    6: [
      "Review your prep sheet before the meeting",
      "Bring extra copies for the team",
      "Take notes during the meeting"
    ]
  };

  const generatePrepSheet = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate generation
      toast({
        title: "Prep Sheet Generated!",
        description: "Your meeting preparation sheet has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prep sheet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveToVault = async (format: string) => {
    setIsLoading(true);
    try {
      // Create meeting prep content
      const meetingPrepContent = {
        meetingType: selectedMeetingType,
        responses: responses,
        currentStep: currentStep,
        timestamp: new Date().toISOString(),
        preparedBy: "IEP Hero Platform"
      };
      
      const documentData = {
        title: `Meeting Prep - ${meetingTypes.find(t => t.id === selectedMeetingType)?.title || 'IEP Meeting'}`,
        description: `Meeting preparation materials created on ${new Date().toLocaleDateString()}`,
        file_name: `meeting_prep_${selectedMeetingType}_${Date.now()}.${format}`,
        file_path: `/vault/meeting_prep/${selectedMeetingType}/`,
        file_type: format === 'pdf' ? 'application/pdf' : 'application/json',
        file_size: JSON.stringify(meetingPrepContent).length,
        category: 'Meeting Preparation',
        tags: ['meeting-prep', selectedMeetingType, 'iep-planning'],
        content: JSON.stringify(meetingPrepContent),
        confidential: true
      };

      await api.createDocument(documentData);
      
      // Invalidate documents cache to refresh the vault
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      toast({
        title: "Saved to Vault!",
        description: `Meeting prep results saved as ${format.toUpperCase()} to your document vault.`
      });
    } catch (error) {
      console.error('Error saving to vault:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save to vault. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const emailToTeam = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate email
      toast({
        title: "Email Sent!",
        description: "Meeting prep materials have been emailed to your team."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setReminder = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate reminder
      toast({
        title: "Reminder Set!",
        description: "Follow-up reminders have been scheduled."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set reminder. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {meetingContext && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/parent/schedule')}
                  data-testid="button-back-to-schedule"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Schedule
                </Button>
              )}
              <h1 className="text-3xl font-bold">
                {meetingContext ? `Prepare for ${meetingContext.title}` : 'Meeting Prep Wizard'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {meetingContext 
                ? `Meeting scheduled for ${new Date(meetingContext.scheduled_date).toLocaleDateString()} - Guided preparation with printable prep sheet`
                : 'Guided preparation for your IEP meeting with printable prep sheet'
              }
            </p>
            {meetingContext && (
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {meetingContext.meeting_type?.replace('_', ' ') || 'Meeting'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {meetingContext.status}
                </Badge>
              </div>
            )}
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Preparation Progress</span>
              <span className="text-sm text-muted-foreground">Step {currentStep} of 6</span>
            </div>
            <Progress value={(currentStep / 6) * 100} className="mb-4" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>Meeting Type</span>
              <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Details</span>
              <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Concerns</span>
              <span className={currentStep >= 4 ? "text-primary font-medium" : ""}>Observations</span>
              <span className={currentStep >= 5 ? "text-primary font-medium" : ""}>Questions</span>
              <span className={currentStep >= 6 ? "text-primary font-medium" : ""}>Review</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {/* Step 1: Meeting Type Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Select Meeting Type
                  </CardTitle>
                  <CardDescription>
                    Choose the type of IEP meeting you're preparing for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {meetingTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => setSelectedMeetingType(type.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedMeetingType === type.id ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{type.title}</h3>
                          <Badge variant={
                            type.urgency === 'Critical' ? 'destructive' :
                            type.urgency === 'Urgent' ? 'destructive' :
                            type.urgency === 'Important' ? 'secondary' : 'outline'
                          }>
                            {type.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Duration: {type.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Team: {type.participants}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button onClick={nextStep} disabled={!selectedMeetingType}>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dynamic Question Steps */}
            {currentStep >= 2 && currentStep <= 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentStep === 2 && <FileText className="h-5 w-5" />}
                    {currentStep === 3 && <Target className="h-5 w-5" />}
                    {currentStep === 4 && <Eye className="h-5 w-5" />}
                    {currentStep === 5 && <MessageSquare className="h-5 w-5" />}
                    {stepQuestions[currentStep]?.title}
                  </CardTitle>
                  <CardDescription>
                    Complete this section to build your comprehensive prep sheet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {stepQuestions[currentStep]?.questions.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label htmlFor={question.id}>
                        {question.label}
                        {question.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      
                      {question.type === 'text' && (
                        <Input
                          id={question.id}
                          placeholder={question.placeholder}
                          required={question.required}
                        />
                      )}
                      
                      {question.type === 'date' && (
                        <Input
                          id={question.id}
                          type="date"
                          required={question.required}
                        />
                      )}
                      
                      {question.type === 'time' && (
                        <Input
                          id={question.id}
                          type="time"
                          required={question.required}
                        />
                      )}
                      
                      {question.type === 'textarea' && (
                        <Textarea
                          id={question.id}
                          placeholder={question.placeholder}
                          rows={question.rows || 3}
                          required={question.required}
                        />
                      )}
                      
                      {question.type === 'checkbox-group' && (
                        <div className="grid grid-cols-2 gap-2">
                          {question.options?.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox id={`${question.id}-${option}`} />
                              <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={nextStep}>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Review & Generate */}
            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Review & Generate Prep Sheet
                  </CardTitle>
                  <CardDescription>
                    Review your responses and generate your meeting preparation materials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900">Preparation Complete!</h4>
                        <p className="text-sm text-green-700 mt-1">
                          You've completed all preparation steps. Your comprehensive prep sheet includes:
                        </p>
                        <ul className="text-sm text-green-700 mt-2 space-y-1">
                          <li>• Meeting logistics and attendee information</li>
                          <li>• Your priority concerns and questions</li>
                          <li>• Home observations and successful strategies</li>
                          <li>• Specific service requests and documentation needs</li>
                          <li>• Meeting tips and legal reminders</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <TooltipProvider>
                    {/* Auto-save Toggle */}
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Save Settings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="auto-save" className="text-sm text-blue-700">Auto-save to vault</Label>
                          <Switch 
                            id="auto-save" 
                            checked={autoSave} 
                            onCheckedChange={setAutoSave}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-blue-700">Format:</Label>
                        <Select value={saveFormat} onValueChange={setSaveFormat}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="docx">Word</SelectItem>
                            <SelectItem value="txt">Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="p-3 md:p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm md:text-base">
                          <Download className="h-4 w-4" />
                          Download Options
                        </h3>
                        <div className="space-y-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="w-full button-premium" disabled={isLoading}>
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4 mr-2" />
                                )}
                                Download PDF Prep Sheet
                                <ChevronDown className="h-4 w-4 ml-auto" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              <DropdownMenuItem onClick={generatePrepSheet}>
                                <FileText className="h-4 w-4 mr-2" />
                                Standard PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generatePrepSheet()}>
                                <Eye className="h-4 w-4 mr-2" />
                                PDF with Notes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => saveToVault('pdf')}>
                                <Save className="h-4 w-4 mr-2" />
                                Save to Vault
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" className="w-full" disabled={isLoading}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Version
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Print-optimized format</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </Card>
                      
                      <Card className="p-3 md:p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm md:text-base">
                          <Send className="h-4 w-4" />
                          Share & Follow-up
                        </h3>
                        <div className="space-y-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4 mr-2" />
                                )}
                                Email to Team
                                <ChevronDown className="h-4 w-4 ml-auto" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              <DropdownMenuItem onClick={emailToTeam}>
                                <Users className="h-4 w-4 mr-2" />
                                Send to IEP Team
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={emailToTeam}>
                                <Users className="h-4 w-4 mr-2" />
                                Send to Advocate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={emailToTeam}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send with Message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" className="w-full" onClick={setReminder} disabled={isLoading}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Set Follow-up Reminders
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Schedule post-meeting reminders</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </Card>
                    </div>

                    {/* Vault Access */}
                    <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-5 w-5 text-green-600" />
                          <div>
                            <h3 className="font-semibold text-green-900">Meeting Prep Results Vault</h3>
                            <p className="text-sm text-green-700">All your prep materials are automatically saved here</p>
                          </div>
                        </div>
                        <Button variant="ghost" className="text-green-700 hover:bg-green-100">
                          <Eye className="h-4 w-4 mr-2" />
                          View Vault
                        </Button>
                      </div>
                    </Card>
                  </TooltipProvider>

                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={prevStep} disabled={isLoading}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Edit
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => saveToVault(saveFormat)}
                        disabled={isLoading}
                        className="hidden sm:flex"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save to Vault
                      </Button>
                      <Button 
                        onClick={() => {
                          if (autoSave) {
                            saveToVault(saveFormat);
                          }
                          toast({
                            title: "Meeting Prep Complete!",
                            description: "Your preparation materials have been generated successfully."
                          });
                        }}
                        disabled={isLoading}
                        className="button-premium"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Complete Preparation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar with Tips & Resources */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Prep Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tips[currentStep]?.map((tip, index) => (
                    <div key={index} className="text-sm p-2 bg-muted/50 rounded flex items-start gap-2">
                      <Star className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                    <span>Right to meaningful participation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                    <span>Right to bring advocates/support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                    <span>Right to request interpreters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                    <span>Right to record meetings</span>
                  </div>
                </div>
                <Link to="/parent/tools/idea-rights-guide">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 text-blue-900 font-medium shadow-sm transition-all duration-200"
                  >
                    <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                    📖 Full Rights Guide
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MeetingPrepWizard;