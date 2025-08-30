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
  Building2
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
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [newStudent, setNewStudent] = useState({
    full_name: "",
    date_of_birth: "",
    grade_level: "",
    school_name: "",
    district: "",
    disability_category: "",
    case_manager: "",
    case_manager_email: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_info: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  useEffect(() => {
    if (clients.length > 0) {
      fetchStudents();
    }
  }, [clients]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchClients = async () => {
    if (!user) return;

    try {
      // Use the new API to fetch advocate clients
      const advocatesData = await api.getAdvocates();
      
      // For now, return empty array since we need to implement advocate-client relationships
      setClients([]);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchStudents = async () => {
    if (!user || clients.length === 0) return;

    try {
      // Use the new API to fetch students
      const studentsData = await api.getStudents();
      setStudents(studentsData || []);
      
      if (studentsData && studentsData.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentsData[0].id!);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchStudentData = async (studentId: string) => {
    if (!user) return;

    try {
      // Fetch student details using API
      const studentsData = await api.getStudents();
      const studentData = studentsData.find(s => s.id === studentId);
      if (studentData) {
        setCurrentStudent(studentData as Student);
      }

      // Fetch goals using API
      const goalsData = await api.getGoals();
      setGoals(goalsData || []);

      // Fetch services (placeholder - services not implemented in API yet)
      setServices([]);

      // Fetch cases (placeholder - cases not implemented in API yet)
      setCases([]);

    } catch (error: any) {
      console.error("Error fetching student data:", error);
      toast({
        title: "Error",
        description: "Failed to load student data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddStudent = async () => {
    if (!user || !newStudent.full_name || !selectedClientId) {
      toast({
        title: "Error",
        description: "Student name and client selection are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await api.createStudent({
        full_name: newStudent.full_name,
        date_of_birth: newStudent.date_of_birth || undefined,
        grade_level: newStudent.grade_level || undefined,
        school_name: newStudent.school_name || undefined,
        district: newStudent.district || undefined,
        disability_category: newStudent.disability_category || undefined,
        case_manager: newStudent.case_manager || undefined,
        case_manager_email: newStudent.case_manager_email || undefined,
        emergency_contact: newStudent.emergency_contact || undefined,
        emergency_phone: newStudent.emergency_phone || undefined,
        medical_info: newStudent.medical_info || undefined,
        notes: newStudent.notes || undefined
      });

      toast({
        title: "Success",
        description: "Student added successfully!",
      });

      setIsAddStudentOpen(false);
      setNewStudent({
        full_name: "",
        date_of_birth: "",
        grade_level: "",
        school_name: "",
        district: "",
        disability_category: "",
        case_manager: "",
        case_manager_email: "",
        emergency_contact: "",
        emergency_phone: "",
        medical_info: "",
        notes: ""
      });
      setSelectedClientId("");
      
      fetchStudents();
      if (data.id) {
        setSelectedStudentId(data.id);
      }
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIEPStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "review": return "bg-warning text-warning-foreground";
      case "expired": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCaseStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-primary text-primary-foreground";
      case "completed": return "bg-success text-success-foreground";
      case "on_hold": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getParentName = (studentUserId: string) => {
    const client = clients.find(c => c.client_id === studentUserId);
    return client?.full_name || 'Unknown Parent';
  };

  if (!user) {
    return <div>Please log in to view student profiles.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Students</h1>
            <p className="text-muted-foreground">
              Manage student profiles for all your advocacy clients
            </p>
          </div>
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
              <Button className="button-premium">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Add a student for one of your advocacy clients.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client_select">Select Client Parent *</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.client_id}>
                          {client.full_name} ({client.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={newStudent.full_name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
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
                    <Label htmlFor="grade_level">Grade Level</Label>
                    <Input
                      id="grade_level"
                      value={newStudent.grade_level}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, grade_level: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school_name">School Name</Label>
                    <Input
                      id="school_name"
                      value={newStudent.school_name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, school_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={newStudent.district}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, district: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disability_category">Disability Category</Label>
                    <Input
                      id="disability_category"
                      value={newStudent.disability_category}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, disability_category: e.target.value }))}
                    />
                  </div>
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
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
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

        {students.length > 0 && (
          <Card className="premium-card">
            <CardHeader>
              <CardTitle>Select Student</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedStudentId || ""} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} - {getParentName(student.user_id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {currentStudent && (
          <div className="grid gap-6">
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
                      <span><strong>Parent:</strong> {getParentName(currentStudent.user_id)}</span>
                      <span>•</span>
                      <span>{currentStudent.grade_level ? `Grade ${currentStudent.grade_level}` : 'Grade not specified'}</span>
                      <span>•</span>
                      <span>{currentStudent.school_name || 'School not specified'}</span>
                      <span>•</span>
                      <Badge className={getIEPStatusColor(currentStudent.iep_status)}>
                        IEP {currentStudent.iep_status}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 premium-card">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cases">Cases ({cases.length})</TabsTrigger>
                <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
                <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2" />
                        Active Cases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {cases.filter(c => c.status === 'active').length}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {cases.length} total cases
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        IEP Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={getIEPStatusColor(currentStudent.iep_status)}>
                        {currentStudent.iep_status}
                      </Badge>
                      {currentStudent.next_review_date && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Next Review: {new Date(currentStudent.next_review_date).toLocaleDateString()}
                        </p>
                      )}
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
                          <span>Completed</span>
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
                        <Users className="h-5 w-5 mr-2" />
                        Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {services.filter(s => s.status === 'active').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Active services</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="cases" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>Advocacy Cases</CardTitle>
                    <CardDescription>Cases you're working on for this student</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cases.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No cases have been created yet for this student.</p>
                    ) : (
                      <div className="space-y-4">
                        {cases.map((caseItem) => (
                          <div key={caseItem.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{caseItem.case_title}</h4>
                              <div className="flex gap-2">
                                <Badge className={getCaseStatusColor(caseItem.status)}>
                                  {caseItem.status}
                                </Badge>
                                <Badge variant="outline">
                                  {caseItem.priority}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{caseItem.case_type}</p>
                            {caseItem.next_action && (
                              <div className="mt-3 p-2 bg-muted rounded">
                                <p className="text-sm font-medium">Next Action:</p>
                                <p className="text-sm">{caseItem.next_action}</p>
                                {caseItem.next_action_date && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Due: {new Date(caseItem.next_action_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>IEP Goals</CardTitle>
                    <CardDescription>Educational goals for this student</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {goals.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No goals have been set up yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {goals.map((goal) => (
                          <div key={goal.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{goal.title}</h4>
                              <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
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
                    <CardTitle>Educational Services</CardTitle>
                    <CardDescription>Services this student receives</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {services.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No services have been documented yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {services.map((service) => (
                          <div key={service.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{service.service_type}</h4>
                              <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                                {service.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Provider:</strong> {service.provider || 'Not specified'}</p>
                                <p><strong>Frequency:</strong> {service.frequency || 'Not specified'}</p>
                              </div>
                              <div>
                                <p><strong>Duration:</strong> {service.duration ? `${service.duration} minutes` : 'Not specified'}</p>
                                <p><strong>Location:</strong> {service.location || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>Student Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>School Information</Label>
                        <div className="mt-2 space-y-1">
                          <p><strong>School:</strong> {currentStudent.school_name || 'Not specified'}</p>
                          <p><strong>District:</strong> {currentStudent.district || 'Not specified'}</p>
                          <p><strong>Grade:</strong> {currentStudent.grade_level || 'Not specified'}</p>
                          <p><strong>Case Manager:</strong> {currentStudent.case_manager || 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Personal Information</Label>
                        <div className="mt-2 space-y-1">
                          <p><strong>Date of Birth:</strong> {currentStudent.date_of_birth ? new Date(currentStudent.date_of_birth).toLocaleDateString() : 'Not specified'}</p>
                          <p><strong>Disability Category:</strong> {currentStudent.disability_category || 'Not specified'}</p>
                          <p><strong>Emergency Contact:</strong> {currentStudent.emergency_contact || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    {currentStudent.notes && (
                      <div className="mt-6">
                        <Label>Notes</Label>
                        <p className="mt-2 text-sm text-muted-foreground">{currentStudent.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {students.length === 0 && (
          <Card className="premium-card">
            <CardContent className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
              <p className="text-muted-foreground mb-4">
                {clients.length === 0 
                  ? "You need to add clients before you can add students."
                  : "Add students for your advocacy clients to get started."
                }
              </p>
              {clients.length > 0 && (
                <Button onClick={() => setIsAddStudentOpen(true)} className="button-premium">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Student
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdvocateStudents;