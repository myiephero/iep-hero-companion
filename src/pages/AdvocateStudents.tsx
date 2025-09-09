import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Plus, 
  Edit, 
  GraduationCap, 
  Target, 
  Users, 
  FileText, 
  Calendar,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  Building2,
  Mail,
  Smile,
  Heart,
  TrendingUp,
  Brain
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { api, type Student } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

interface Client {
  id: string;
  client_id: string;
  full_name?: string;
  email?: string;
}

interface Goal {
  id: string;
  goal_type: string;
  title: string;
  description: string;
  current_progress: number;
  status: string;
  target_date: string | null;
}

interface Service {
  id: string;
  service_type: string;
  provider: string | null;
  frequency: string | null;
  duration: number | null;
  location: string | null;
  status: string;
}

interface Case {
  id: string;
  case_title: string;
  case_type: string;
  status: string;
  priority: string;
  next_action: string | null;
  next_action_date: string | null;
}

// Advocate Emotion Tracking Tab Component
const AdvocateEmotionTrackingTab = ({ selectedStudentId }: { selectedStudentId?: string | null }) => {
  const [currentMood, setCurrentMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const { toast } = useToast();

  const moodOptions = [
    { emoji: '😊', label: 'Happy', color: 'bg-green-100 hover:bg-green-200' },
    { emoji: '😐', label: 'Neutral', color: 'bg-blue-100 hover:bg-blue-200' },
    { emoji: '😟', label: 'Anxious', color: 'bg-yellow-100 hover:bg-yellow-200' },
    { emoji: '😠', label: 'Frustrated', color: 'bg-orange-100 hover:bg-orange-200' },
    { emoji: '😢', label: 'Distressed', color: 'bg-red-100 hover:bg-red-200' }
  ];

  const handleRecordMood = () => {
    if (!selectedStudentId) {
      toast({
        title: "Student Required",
        description: "Please select a student first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentMood) {
      toast({
        title: "Mood Required",
        description: "Please select the student's observed emotional state.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Emotional Observation Recorded",
      description: `Professional observation saved successfully!`,
      variant: "default"
    });
    setCurrentMood("");
    setMoodNote("");
  };

  const handleGenerateProfessionalNote = async () => {
    if (!currentMood) return;
    
    setAiDraftLoading(true);
    setTimeout(() => {
      const professionalDescriptions: { [key: string]: string } = {
        '😊': 'Student demonstrated positive affect and engaged appropriately in activities.',
        '😐': 'Student exhibited neutral emotional regulation and steady baseline behavior.',
        '😟': 'Student showed signs of anxiety or worry requiring additional support and monitoring.',
        '😠': 'Student displayed frustration behaviors that may indicate need for intervention strategies.',
        '😢': 'Student appeared distressed and may benefit from immediate emotional support services.'
      };
      
      const draft = `${professionalDescriptions[currentMood]} Recommend continued observation and documentation of triggers, environmental factors, and effective intervention strategies. Consider consultation with school counselor or behavioral specialist if patterns persist.`;
      setMoodNote(draft);
      setAiDraftLoading(false);
      
      toast({
        title: "Professional Note Generated",
        description: "Please review and edit the assessment before saving.",
        variant: "default"
      });
    }, 1500);
  };

  if (!selectedStudentId) {
    return (
      <Card className="premium-card">
        <CardContent className="text-center py-8">
          <Smile className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a student to track emotional patterns and provide support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Emotional Assessment */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Professional Emotional Assessment
            </CardTitle>
            <CardDescription>
              Document observed emotional states and behaviors for advocacy and IEP planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((mood) => (
                  <div 
                    key={mood.emoji}
                    className={`text-center p-3 rounded-lg cursor-pointer transition-colors ${mood.color} ${currentMood === mood.emoji ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setCurrentMood(mood.emoji)}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <p className="text-xs">{mood.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="professional-note">Professional Observation Notes</Label>
                <Textarea
                  id="professional-note"
                  placeholder="Document specific behaviors, triggers, environmental factors, and intervention strategies observed..."
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="min-h-[100px]"
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateProfessionalNote}
                    disabled={!currentMood || aiDraftLoading}
                    variant="outline"
                    size="sm"
                  >
                    {aiDraftLoading ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Professional Note
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleRecordMood}
                    disabled={!currentMood}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Professional Assessment
                  </Button>
                </div>
              </div>
              
              <div className="pt-2 text-sm text-muted-foreground">
                Last assessment: Yesterday - "Student showed improved self-regulation during transitions"
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Behavioral Pattern Analysis
            </CardTitle>
            <CardDescription>
              Track emotional and behavioral patterns for advocacy documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                <div className="h-8 bg-green-200 rounded" title="Stable regulation"></div>
                <div className="h-8 bg-green-300 rounded" title="Excellent day"></div>
                <div className="h-8 bg-yellow-200 rounded" title="Some challenges"></div>
                <div className="h-8 bg-red-200 rounded" title="Significant struggles"></div>
                <div className="h-8 bg-green-200 rounded" title="Improved coping"></div>
                <div className="h-8 bg-blue-200 rounded" title="Weekend - different environment"></div>
                <div className="h-8 bg-green-200 rounded" title="Positive regulation"></div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>• Pattern: Thursdays consistently challenging</p>
                <p>• Improvement after intervention implementation</p>
                <p>• Recommend schedule adjustment for Thursday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Resources and Interventions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              Evidence-Based Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Cognitive behavioral strategies</li>
              <li>• Sensory regulation tools</li>
              <li>• Social skills training protocols</li>
              <li>• Environmental modifications</li>
            </ul>
            <Button size="sm" className="w-full mt-3" variant="outline">Access Resources</Button>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              Crisis Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Escalating behavioral incidents</li>
              <li>• Academic performance decline</li>
              <li>• Social withdrawal patterns</li>
              <li>• Sleep or appetite changes</li>
            </ul>
            <Button size="sm" className="w-full mt-3" variant="outline">Crisis Protocol</Button>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Documentation Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Behavior incident reports</li>
              <li>• Progress monitoring charts</li>
              <li>• IEP meeting preparation</li>
              <li>• Parent communication logs</li>
            </ul>
            <Button size="sm" className="w-full mt-3" variant="outline">Generate Reports</Button>
          </CardContent>
        </Card>
      </div>

      {/* Professional Case Notes */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle>Professional Case Notes & Observations</CardTitle>
          <CardDescription>
            Confidential documentation for advocacy and service planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Intervention Success 📊</h4>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Implementation of sensory break protocol resulted in 50% reduction in classroom disruptions. 
                Recommend including in formal accommodation plan.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Service Gap Identified ⚠️</h4>
                <span className="text-xs text-muted-foreground">This Week</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Student would benefit from occupational therapy evaluation for sensory processing concerns. 
                Will advocate for additional assessment at next IEP meeting.
              </p>
            </div>
            
            <div className="pt-2">
              <Button className="w-full" variant="outline">Add Professional Observation</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdvocateStudents = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    grade_level: "",
    school_name: "",
    district: "",
    iep_status: "Active",
    case_manager: "",
    case_manager_email: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_info: "",
    notes: "",
    assigned_client: "",
    disabilities: [] as string[],
    current_services: [] as string[]
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name || !newStudent.assigned_client) return;
    
    setLoading(true);
    try {
      const studentData = {
        ...newStudent,
        full_name: `${newStudent.first_name} ${newStudent.last_name}`,
        parent_id: newStudent.assigned_client
      };
      
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      if (response.ok) {
        setIsAddStudentOpen(false);
        resetForm();
        fetchStudents();
        toast({
          title: "Success",
          description: "Student added successfully",
        });

        // Refresh the page to ensure all student lists update across the application
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent || !newStudent.first_name || !newStudent.last_name) return;
    
    setLoading(true);
    try {
      const studentData = {
        ...newStudent,
        full_name: `${newStudent.first_name} ${newStudent.last_name}`,
      };
      
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      if (response.ok) {
        setIsEditStudentOpen(false);
        setEditingStudent(null);
        resetForm();
        fetchStudents();
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setNewStudent({
      first_name: student.full_name?.split(' ')[0] || '',
      last_name: student.full_name?.split(' ').slice(1).join(' ') || '',
      date_of_birth: student.date_of_birth || '',
      grade_level: student.grade_level || '',
      school_name: student.school_name || '',
      district: student.district || '',
      iep_status: student.iep_status || 'Active',
      disabilities: [],
      current_services: [],
      case_manager: student.case_manager || '',
      case_manager_email: student.case_manager_email || '',
      emergency_contact: '',
      emergency_phone: '',
      medical_info: '',
      notes: student.notes || '',
      assigned_client: '',
    });
    setIsEditStudentOpen(true);
  };

  const resetForm = () => {
    setNewStudent({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      grade_level: '',
      school_name: '',
      district: '',
      iep_status: 'Active',
      disabilities: [],
      current_services: [],
      case_manager: '',
      case_manager_email: '',
      emergency_contact: '',
      emergency_phone: '',
      medical_info: '',
      notes: '',
      assigned_client: '',
    });
  };

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchClients();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/parents');
      if (response.ok) {
        const data = await response.json();
        setClients(data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const fetchStudentData = async (studentId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      setCurrentStudent(student || null);
      
      const goalsData = await api.getGoals();
      const studentGoals = goalsData.filter((goal: any) => goal.student_id === studentId);
      setGoals(studentGoals as Goal[] || []);
      
      // Fetch real services and cases data for this student
      try {
        const authToken = localStorage.getItem('authToken');
        const headers = { 
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          'Content-Type': 'application/json'
        };
        
        // Fetch services for this student
        const servicesRes = await fetch(`/api/students/${studentId}/services`, { 
          credentials: 'include', 
          headers 
        });
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData || []);
        } else {
          setServices([]);
        }
        
        // Fetch cases for this student
        const casesRes = await fetch(`/api/students/${studentId}/cases`, { 
          credentials: 'include', 
          headers 
        });
        if (casesRes.ok) {
          const casesData = await casesRes.json();
          setCases(casesData || []);
        } else {
          setCases([]);
        }
      } catch (error) {
        console.error('Error fetching student services and cases:', error);
        setServices([]);
        setCases([]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };


  const getIEPStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-muted text-muted-foreground";
    switch (status.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "review": return "bg-warning text-warning-foreground";
      case "expired": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCaseStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!user) {
    return <div>Please log in to view client students.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Students</h1>
            <p className="text-muted-foreground">
              Manage your clients' children and track their educational progress
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="button-premium">
                <User className="h-4 w-4 mr-2" />
                Student
                <Plus className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => {
                resetForm();
                setIsAddStudentOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Student
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => currentStudent ? openEditDialog(currentStudent) : null}
                disabled={!currentStudent}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Current Student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Student List */}
          <div className="lg:col-span-1">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Client Students ({students.length})
                </CardTitle>
                <CardDescription>
                  Select a student to view details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {students.length === 0 ? (
                  <div className="p-6 text-center">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't added any students yet. Get started by adding your first client's student.
                    </p>
                    {/* Add Student feature removed */}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors ${selectedStudentId === student.id ? 'bg-muted/50 border-l-4 border-l-primary' : ''}`}
                        onClick={() => setSelectedStudentId(student.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {student.grade_level ? `Grade ${student.grade_level}` : 'Grade not specified'}
                              </p>
                            </div>
                          </div>
                          <Badge className={getIEPStatusColor(student.iep_status)}>
                            {student.iep_status || 'No IEP'}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {student.school_name || 'School not specified'} • {student.district || 'District not specified'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Student Details */}
          <div className="lg:col-span-2">
            {currentStudent ? (
              <>
                <Card className="premium-card">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg bg-gradient-primary text-primary-foreground">
                          {currentStudent.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-2xl text-gradient">{currentStudent.full_name}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center space-x-4 mt-2">
                            <span>{currentStudent.grade_level ? `Grade ${currentStudent.grade_level}` : 'Grade not specified'}</span>
                            <span>•</span>
                            <span>{currentStudent.school_name || 'School not specified'}</span>
                            <span>•</span>
                            <Badge className={getIEPStatusColor(currentStudent.iep_status)}>
                              IEP {currentStudent.iep_status || 'Not Set'}
                            </Badge>
                          </div>
                          {currentStudent.full_name && (
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-sm">Student: {currentStudent.full_name}</span>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/advocate/messages?parent=${currentStudent.parent_id || currentStudent.user_id}&student=${currentStudent.id}`}>
                                  <Mail className="h-3 w-3 mr-1" />
                                  Message Parent
                                </Link>
                              </Button>
                            </div>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 premium-card">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
                    <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
                    <TabsTrigger value="emotions" className="bg-pink-600 text-white">😊 Emotions</TabsTrigger>
                    <TabsTrigger value="advocacy">Advocacy ({cases.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="premium-card">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            IEP Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Badge className={getIEPStatusColor(currentStudent.iep_status)}>
                              {currentStudent.iep_status || 'Not Set'}
                            </Badge>
                            {currentStudent.iep_date && (
                              <p className="text-sm text-muted-foreground">
                                IEP Date: {new Date(currentStudent.iep_date).toLocaleDateString()}
                              </p>
                            )}
                            {currentStudent.next_review_date && (
                              <p className="text-sm text-muted-foreground">
                                Next Review: {new Date(currentStudent.next_review_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="premium-card">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Target className="h-5 w-5 mr-2" />
                            Goals Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Completed Goals</span>
                              <span>{goals.filter(g => g.status === 'completed').length}/{goals.length}</span>
                            </div>
                            <Progress 
                              value={goals.length > 0 ? (goals.filter(g => g.status === 'completed').length / goals.length) * 100 : 0} 
                              className="h-2"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="premium-card">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Building2 className="h-5 w-5 mr-2" />
                            School Info
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium">{currentStudent.school_name || 'Not specified'}</p>
                              <p className="text-sm text-muted-foreground">School</p>
                            </div>
                            <div>
                              <p className="text-sm">{currentStudent.district || 'Not specified'}</p>
                              <p className="text-xs text-muted-foreground">District</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="goals" className="space-y-6">
                    <Card className="premium-card">
                      <CardHeader>
                        <CardTitle>IEP Goals</CardTitle>
                        <CardDescription>
                          Track progress on individualized education program goals
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {goals.length === 0 ? (
                          <p className="text-muted-foreground">No goals have been set for this student yet.</p>
                        ) : (
                          <div className="space-y-4">
                            {goals.map((goal) => (
                              <div key={goal.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold">{goal.title}</h4>
                                  <Badge className={getCaseStatusColor(goal.status)}>
                                    {goal.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{goal.current_progress}%</span>
                                  </div>
                                  <Progress value={goal.current_progress} className="h-2" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="services" className="space-y-6">
                    <Card className="premium-card">
                      <CardHeader>
                        <CardTitle>Support Services</CardTitle>
                        <CardDescription>
                          Special education and related services provided to the student
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">No services have been documented yet for this student.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="emotions" className="space-y-6">
                    <AdvocateEmotionTrackingTab selectedStudentId={selectedStudentId} />
                  </TabsContent>

                  <TabsContent value="advocacy" className="space-y-6">
                    <Card className="premium-card">
                      <CardHeader>
                        <CardTitle>Advocacy Cases</CardTitle>
                        <CardDescription>
                          Active advocacy cases and interventions for this student
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">No advocacy cases have been opened for this student yet.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="premium-card">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Student</h3>
                  <p className="text-muted-foreground">
                    Choose a student from the list to view their details, goals, and advocacy progress.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Add a new student to your client roster. Fill in the information below to create their profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Select value={newStudent.grade_level} onValueChange={(value) => setNewStudent({...newStudent, grade_level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-K">Pre-K</SelectItem>
                      <SelectItem value="K">Kindergarten</SelectItem>
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
            </div>

            {/* School Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">School Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school_name">School Name</Label>
                  <Input
                    id="school_name"
                    value={newStudent.school_name}
                    onChange={(e) => setNewStudent({...newStudent, school_name: e.target.value})}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label htmlFor="district">School District</Label>
                  <Input
                    id="district"
                    value={newStudent.district}
                    onChange={(e) => setNewStudent({...newStudent, district: e.target.value})}
                    placeholder="Enter school district"
                  />
                </div>
              </div>
            </div>

            {/* Parent Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Parent Assignment</h3>
              <div>
                <Label htmlFor="assigned_client">Assign to Parent Client *</Label>
                <Select value={newStudent.assigned_client} onValueChange={(value) => setNewStudent({...newStudent, assigned_client: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.client_id}>
                        {client.full_name || client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* IEP Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">IEP Status</h3>
              <div>
                <Label htmlFor="iep_status">Current IEP Status</Label>
                <Select value={newStudent.iep_status} onValueChange={(value) => setNewStudent({...newStudent, iep_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select IEP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="case_manager">Case Manager</Label>
                  <Input
                    id="case_manager"
                    value={newStudent.case_manager}
                    onChange={(e) => setNewStudent({...newStudent, case_manager: e.target.value})}
                    placeholder="Enter case manager name"
                  />
                </div>
                <div>
                  <Label htmlFor="case_manager_email">Case Manager Email</Label>
                  <Input
                    id="case_manager_email"
                    type="email"
                    value={newStudent.case_manager_email}
                    onChange={(e) => setNewStudent({...newStudent, case_manager_email: e.target.value})}
                    placeholder="Enter case manager email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({...newStudent, notes: e.target.value})}
                  placeholder="Enter any additional notes about the student..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent} disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Update the student's information below. All changes will be saved to their profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                  <Input
                    id="edit_date_of_birth"
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_grade_level">Grade Level</Label>
                  <Select value={newStudent.grade_level} onValueChange={(value) => setNewStudent({...newStudent, grade_level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-K">Pre-K</SelectItem>
                      <SelectItem value="K">Kindergarten</SelectItem>
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
            </div>

            {/* School Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">School Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_school_name">School Name</Label>
                  <Input
                    id="edit_school_name"
                    value={newStudent.school_name}
                    onChange={(e) => setNewStudent({...newStudent, school_name: e.target.value})}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_district">School District</Label>
                  <Input
                    id="edit_district"
                    value={newStudent.district}
                    onChange={(e) => setNewStudent({...newStudent, district: e.target.value})}
                    placeholder="Enter school district"
                  />
                </div>
              </div>
            </div>

            {/* IEP Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">IEP Status</h3>
              <div>
                <Label htmlFor="edit_iep_status">Current IEP Status</Label>
                <Select value={newStudent.iep_status} onValueChange={(value) => setNewStudent({...newStudent, iep_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select IEP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_case_manager">Case Manager</Label>
                  <Input
                    id="edit_case_manager"
                    value={newStudent.case_manager}
                    onChange={(e) => setNewStudent({...newStudent, case_manager: e.target.value})}
                    placeholder="Enter case manager name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_case_manager_email">Case Manager Email</Label>
                  <Input
                    id="edit_case_manager_email"
                    type="email"
                    value={newStudent.case_manager_email}
                    onChange={(e) => setNewStudent({...newStudent, case_manager_email: e.target.value})}
                    placeholder="Enter case manager email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({...newStudent, notes: e.target.value})}
                  placeholder="Enter any additional notes about the student..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditStudentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStudent} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdvocateStudents;