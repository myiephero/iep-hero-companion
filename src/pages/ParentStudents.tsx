import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StudentSelector } from "@/components/StudentSelector";
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
  CheckCircle
} from "lucide-react";
// import { supabase } from "@/integrations/supabase/client"; // Removed during migration
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  grade_level: string | null;
  school_name: string | null;
  district: string | null;
  disability_category: string | null;
  iep_status: string;
  iep_date: string | null;
  next_review_date: string | null;
  case_manager: string | null;
  case_manager_email: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  medical_info: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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

interface Accommodation {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
}

const ParentStudents = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
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
    disabilities: [] as string[],
    current_services: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data || []);
      
      if (data && data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
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
      // Fetch student details - find the student from the already loaded students
      const student = students.find(s => s.id === studentId);
      if (student) {
        setCurrentStudent(student);
      }

      // Fetch goals using API
      try {
        const goalsResponse = await fetch('/api/goals');
        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setGoals(goalsData || []);
        }
      } catch (error) {
        console.log('Goals API not available, setting empty array');
        setGoals([]);
      }

      // Set empty arrays for services and accommodations for now
      setServices([]);
      setAccommodations([]);

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
    if (!user || !newStudent.first_name || !newStudent.last_name) {
      toast({
        title: "Error",
        description: "First and last name are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          full_name: `${newStudent.first_name} ${newStudent.last_name}`,
          date_of_birth: newStudent.date_of_birth || null,
          grade_level: newStudent.grade_level || null,
          school_name: newStudent.school_name || null,
          district: newStudent.district || null,
          iep_status: newStudent.iep_status,
          disabilities: newStudent.disabilities.join(', '),
          current_services: newStudent.current_services.join(', '),
          case_manager: newStudent.case_manager || null,
          case_manager_email: newStudent.case_manager_email || null,
          emergency_contact: newStudent.emergency_contact || null,
          emergency_phone: newStudent.emergency_phone || null,
          medical_info: newStudent.medical_info || null,
          notes: newStudent.notes || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create student');
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "Student added successfully!",
      });

      setIsAddStudentOpen(false);
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
        disabilities: [],
        current_services: []
      });
      
      fetchStudents();
      setSelectedStudentId(data.id);
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

  const updateStudentInfo = async (updates: Partial<Student>) => {
    if (!user || !currentStudent) return;

    try {
      const response = await fetch(`/api/students/${currentStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update student');
      }

      toast({
        title: "Success",
        description: "Student information updated successfully!",
      });

      fetchStudentData(currentStudent.id);
      fetchStudents(); // Refresh the students list
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student information.",
        variant: "destructive",
      });
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

  if (!user) {
    return <div>Please log in to view student profiles.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
            <p className="text-muted-foreground">
              Manage your children's educational profiles and track their progress
            </p>
          </div>
          {/* Add Student feature removed as requested */}
        </div>

        <StudentSelector
          selectedStudent={selectedStudentId}
          onStudentChange={setSelectedStudentId}
        />

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
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 premium-card">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
                <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
                <TabsTrigger value="accommodations">Accommodations ({accommodations.length})</TabsTrigger>
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
                          {currentStudent.iep_status}
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
                        <Users className="h-5 w-5 mr-2" />
                        Support Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentStudent.case_manager && (
                          <div>
                            <p className="font-medium">{currentStudent.case_manager}</p>
                            <p className="text-sm text-muted-foreground">Case Manager</p>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Services: {services.filter(s => s.status === 'active').length} active
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Student Information Section */}
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>School Information</Label>
                        <div className="mt-2 space-y-1">
                          <p><strong>School:</strong> {currentStudent.school_name || 'Not specified'}</p>
                          <p><strong>District:</strong> {currentStudent.district || 'Not specified'}</p>
                          <p><strong>Grade:</strong> {currentStudent.grade_level || 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Personal Information</Label>
                        <div className="mt-2 space-y-1">
                          <p><strong>Date of Birth:</strong> {currentStudent.date_of_birth ? new Date(currentStudent.date_of_birth).toLocaleDateString() : 'Not specified'}</p>
                          <p><strong>Disability Category:</strong> {currentStudent.disability_category || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    {currentStudent.notes && (
                      <div className="mt-4">
                        <Label>Notes</Label>
                        <p className="mt-2 text-sm text-muted-foreground">{currentStudent.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>IEP Goals</CardTitle>
                    <CardDescription>Track your child's educational goals and progress</CardDescription>
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
                            {goal.target_date && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Target Date: {new Date(goal.target_date).toLocaleDateString()}
                              </p>
                            )}
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
                    <CardDescription>Services and support your child receives</CardDescription>
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

              <TabsContent value="accommodations" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>Accommodations</CardTitle>
                    <CardDescription>Special accommodations and modifications for your child</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {accommodations.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No accommodations have been documented yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {accommodations.map((accommodation) => (
                          <div key={accommodation.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{accommodation.title}</h4>
                              <Badge>{accommodation.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{accommodation.description}</p>
                          </div>
                        ))}
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
                Get started by adding your first student to track their educational journey.
              </p>
              <Button onClick={() => setIsAddStudentOpen(true)} className="button-premium">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Student
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentStudents;