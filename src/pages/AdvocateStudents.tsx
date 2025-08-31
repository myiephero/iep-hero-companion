import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
  Mail
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { api, type Student } from "@/lib/api";

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
      const studentGoals = goalsData.filter((goal: Goal) => goal.student_id === studentId);
      setGoals(studentGoals);
      
      // Mock services and cases data for now
      setServices([]);
      setCases([]);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.first_name.trim() || !newStudent.last_name.trim() || !newStudent.assigned_client) {
      toast({
        title: "Error",
        description: "First name, last name, and parent client assignment are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const studentData = {
        ...newStudent,
        full_name: `${newStudent.first_name} ${newStudent.last_name}`,
        disabilities: newStudent.disabilities.join(', '),
        current_services: newStudent.current_services.join(', ')
      };
      await api.createStudent(studentData);
      
      toast({
        title: "Success!",
        description: "Student has been created successfully.",
      });

      setNewStudent({
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
        disabilities: [],
        current_services: []
      });
      setIsAddStudentOpen(false);
      fetchStudents();
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create student.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
              <Button className="button-premium">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add New Client Student</DialogTitle>
                <DialogDescription>
                  Add a student to one of your parent clients' accounts.
                </DialogDescription>
              </DialogHeader>
              
              <div className="overflow-y-auto max-h-[calc(90vh-160px)] pr-2">
                <div className="space-y-6">
                  {/* Parent/Guardian Assignment */}
                  <div className="space-y-2">
                    <Label htmlFor="assigned_client">Assign to Parent Client *</Label>
                    <Select 
                      value={newStudent.assigned_client} 
                      onValueChange={(value) => setNewStudent(prev => ({ ...prev, assigned_client: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length === 0 ? (
                          <div className="p-3 text-center text-muted-foreground">
                            No parent clients found
                          </div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.full_name || client.email}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        placeholder="Student's first name"
                        value={newStudent.first_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        placeholder="Student's last name"
                        value={newStudent.last_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={newStudent.date_of_birth}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade_level">Grade</Label>
                      <Select value={newStudent.grade_level} onValueChange={(value) => setNewStudent(prev => ({ ...prev, grade_level: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PreK">PreK</SelectItem>
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

                  {/* School Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="school_name">School (Optional)</Label>
                      <Input
                        id="school_name"
                        placeholder="Current school"
                        value={newStudent.school_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, school_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District (Optional)</Label>
                      <Input
                        id="district"
                        placeholder="School district"
                        value={newStudent.district}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, district: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* IEP Status */}
                  <div className="space-y-2">
                    <Label htmlFor="iep_status">IEP Status</Label>
                    <Select value={newStudent.iep_status} onValueChange={(value) => setNewStudent(prev => ({ ...prev, iep_status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Developing">Developing</SelectItem>
                        <SelectItem value="Review">Under Review</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="None">No IEP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Disabilities */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Disabilities (Select all that apply)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'Autism Spectrum Disorder',
                        'ADHD',
                        'Learning Disability',
                        'Intellectual Disability',
                        'Speech/Language Impairment',
                        'Emotional Behavioral Disorder',
                        'Other Health Impairment',
                        'Multiple Disabilities',
                        'Hearing Impairment',
                        'Visual Impairment',
                        'Orthopedic Impairment',
                        'Traumatic Brain Injury'
                      ].map((disability) => (
                        <div key={disability} className="flex items-center space-x-2">
                          <Checkbox
                            id={disability}
                            checked={newStudent.disabilities.includes(disability)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewStudent(prev => ({
                                  ...prev,
                                  disabilities: [...prev.disabilities, disability]
                                }));
                              } else {
                                setNewStudent(prev => ({
                                  ...prev,
                                  disabilities: prev.disabilities.filter(d => d !== disability)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={disability} className="text-sm">
                            {disability}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Services */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Current Services (Select all that apply)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'Special Education',
                        'Speech Therapy',
                        'Occupational Therapy',
                        'Physical Therapy',
                        'Behavioral Support',
                        'Counseling',
                        'Assistive Technology',
                        'Transportation',
                        'Extended School Year',
                        'Paraprofessional Support'
                      ].map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={newStudent.current_services.includes(service)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewStudent(prev => ({
                                  ...prev,
                                  current_services: [...prev.current_services, service]
                                }));
                              } else {
                                setNewStudent(prev => ({
                                  ...prev,
                                  current_services: prev.current_services.filter(s => s !== service)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={service} className="text-sm">
                            {service}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="case_manager">Case Manager</Label>
                      <Input
                        id="case_manager"
                        value={newStudent.case_manager}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, case_manager: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="case_manager_email">Case Manager Email</Label>
                      <Input
                        id="case_manager_email"
                        type="email"
                        value={newStudent.case_manager_email}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, case_manager_email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      placeholder="Additional information about the student..."
                      value={newStudent.notes}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStudent} disabled={loading} className="button-premium">
                  {loading ? "Adding..." : "Add Student"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                    <Button onClick={() => setIsAddStudentOpen(true)} className="button-premium">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Student
                    </Button>
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
                        <CardDescription className="flex items-center space-x-4 mt-2">
                          <span>{currentStudent.grade_level ? `Grade ${currentStudent.grade_level}` : 'Grade not specified'}</span>
                          <span>•</span>
                          <span>{currentStudent.school_name || 'School not specified'}</span>
                          <span>•</span>
                          <Badge className={getIEPStatusColor(currentStudent.iep_status)}>
                            IEP {currentStudent.iep_status || 'Not Set'}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 premium-card">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
                    <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
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
    </DashboardLayout>
  );
};

export default AdvocateStudents;