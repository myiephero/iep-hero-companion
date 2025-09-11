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
  CheckCircle,
  Brain,
  Volume2,
  Lightbulb,
  Zap,
  Star,
  BookOpen,
  TrendingUp,
  Eye,
  Sparkles
} from "lucide-react";
// import { supabase } from "@/integrations/supabase/client"; // Removed during migration
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getIEPStatusColor } from "@/lib/utils";

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

interface AutismAccommodation {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: string;
  accommodation_type: string;
  implementation_notes?: string;
  effectiveness_rating?: number;
  status: string;
  created_at: string;
}

interface GiftedAssessment {
  id: string;
  student_id: string;
  assessment_type: string;
  giftedness_areas: string[];
  learning_differences?: string[];
  strengths: any;
  challenges?: any;
  recommendations?: any;
  acceleration_needs?: any;
  enrichment_activities?: any;
  social_emotional_needs?: any;
  twice_exceptional_profile?: any;
  assessment_scores?: any;
  evaluator_notes?: string;
  next_steps?: any;
  status: string;
  created_at: string;
}

const StudentProfiles = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [autismAccommodations, setAutismAccommodations] = useState<AutismAccommodation[]>([]);
  const [giftedAssessments, setGiftedAssessments] = useState<GiftedAssessment[]>([]);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
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
      const { apiRequest } = await import('@/lib/queryClient');
      const response = await apiRequest('GET', '/api/students');
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
      // Fetch student details using API
      const { apiRequest } = await import('@/lib/queryClient');
      const studentResponse = await apiRequest('GET', `/api/students`);
      const studentsData = await studentResponse.json();
      
      const studentData = studentsData.find((s: Student) => s.id === studentId);
      if (studentData) {
        setCurrentStudent(studentData);
      } else {
        throw new Error('Student not found');
      }

      // Fetch goals using API
      const goalsResponse = await apiRequest('GET', `/api/goals?student_id=${studentId}`);
      const goalsData = await goalsResponse.json();
      setGoals(goalsData || []);

      // Fetch services using API 
      const servicesResponse = await apiRequest('GET', `/api/services?student_id=${studentId}`);
      const servicesData = await servicesResponse.json();
      setServices(servicesData || []);

      // Fetch accommodations using API
      const accommodationsResponse = await apiRequest('GET', `/api/accommodations?student_id=${studentId}`);
      const accommodationsData = await accommodationsResponse.json();
      setAccommodations(accommodationsData || []);

      // Fetch autism accommodations using API
      const autismAccommodationsResponse = await apiRequest('GET', `/api/autism_accommodations?student_id=${studentId}`);
      const autismAccommodationsData = await autismAccommodationsResponse.json();
      setAutismAccommodations(autismAccommodationsData || []);

      // Fetch gifted assessments using API
      const giftedAssessmentsResponse = await apiRequest('GET', `/api/gifted-assessments?student_id=${studentId}`);
      const giftedAssessmentsData = await giftedAssessmentsResponse.json();
      setGiftedAssessments(giftedAssessmentsData || []);

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
    if (!user || !newStudent.full_name) {
      toast({
        title: "Error",
        description: "Student name is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { apiRequest } = await import('@/lib/queryClient');
      const response = await apiRequest('POST', '/api/students', {
        full_name: newStudent.full_name,
        date_of_birth: newStudent.date_of_birth || null,
        grade_level: newStudent.grade_level || null,
        school_name: newStudent.school_name || null,
        district: newStudent.district || null,
        disability_category: newStudent.disability_category || null,
        case_manager: newStudent.case_manager || null,
        case_manager_email: newStudent.case_manager_email || null,
        emergency_contact: newStudent.emergency_contact || null,
        emergency_phone: newStudent.emergency_phone || null,
        medical_info: newStudent.medical_info || null,
        notes: newStudent.notes || null
      });
      const data = await response.json();

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
      const { apiRequest } = await import('@/lib/queryClient');
      await apiRequest('PUT', `/api/students/${currentStudent.id}`, updates);

      toast({
        title: "Success",
        description: "Student information updated successfully!",
      });

      fetchStudentData(currentStudent.id);
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student information.",
        variant: "destructive",
      });
    }
  };


  const getGoalStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "text-primary";
      case "completed": return "text-success";
      case "modified": return "text-warning";
      default: return "text-muted-foreground";
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
            <h1 className="text-3xl font-bold tracking-tight">Student Profiles</h1>
            <p className="text-muted-foreground">
              Manage comprehensive profiles for all your students
            </p>
          </div>
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the student's information to create their profile.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
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
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={newStudent.emergency_contact}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">Emergency Phone</Label>
                  <Input
                    id="emergency_phone"
                    type="tel"
                    value={newStudent.emergency_phone}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, emergency_phone: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="medical_info">Medical Information</Label>
                  <Textarea
                    id="medical_info"
                    value={newStudent.medical_info}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, medical_info: e.target.value }))}
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
        </div>

        <StudentSelector
          selectedStudent={selectedStudentId}
          onStudentChange={setSelectedStudentId}
        />

        {currentStudent && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {currentStudent.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{currentStudent.full_name}</CardTitle>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <span>{currentStudent.grade_level ? `Grade ${currentStudent.grade_level}` : 'Grade not specified'}</span>
                        <span className="hidden sm:inline">•</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span>{currentStudent.school_name || 'School not specified'}</span>
                        <span className="hidden sm:inline">•</span>
                      </div>
                      <Badge className={getIEPStatusColor(currentStudent.iep_status)}>
                        IEP {currentStudent.iep_status}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 gap-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
                <TabsTrigger value="autism" className="bg-blue-600 text-white">🧩 Autism</TabsTrigger>
                <TabsTrigger value="gifted" className="bg-purple-600 text-white">🎓 Gifted</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Student Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Date of Birth</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentStudent.date_of_birth 
                            ? new Date(currentStudent.date_of_birth).toLocaleDateString() 
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Disability Category</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentStudent.disability_category || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">District</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentStudent.district || 'Not specified'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Case Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Case Manager</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentStudent.case_manager || 'Not assigned'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentStudent.case_manager_email || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Next Review</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentStudent.next_review_date 
                            ? new Date(currentStudent.next_review_date).toLocaleDateString()
                            : 'Not scheduled'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Contact Name</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentStudent.emergency_contact || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone Number</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentStudent.emergency_phone || 'Not provided'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {currentStudent.medical_info && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {currentStudent.medical_info}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {currentStudent.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {currentStudent.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                {goals.length > 0 ? (
                  <div className="grid gap-4">
                    {goals.map((goal) => (
                      <Card key={goal.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{goal.title}</CardTitle>
                              <CardDescription>
                                <Badge variant="outline" className="mr-2">
                                  {goal.goal_type}
                                </Badge>
                                <span className={getGoalStatusColor(goal.status)}>
                                  {goal.status}
                                </span>
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                {goal.current_progress}%
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Progress
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              {goal.description}
                            </p>
                            <Progress value={goal.current_progress} className="h-2" />
                            {goal.target_date && (
                              <div className="text-sm text-muted-foreground">
                                Target Date: {new Date(goal.target_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Target className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Goals Yet</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Goals will appear here once they are added to the student's IEP.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                {services.length > 0 ? (
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <Card key={service.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{service.service_type}</CardTitle>
                              <CardDescription>
                                {service.provider && `Provider: ${service.provider}`}
                              </CardDescription>
                            </div>
                            <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                              {service.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">
                                Frequency
                              </Label>
                              <p>{service.frequency || 'Not specified'}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">
                                Duration
                              </Label>
                              <p>{service.duration ? `${service.duration} min` : 'Not specified'}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">
                                Location
                              </Label>
                              <p>{service.location || 'Not specified'}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">
                                Status
                              </Label>
                              <p className="capitalize">{service.status}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Services Yet</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Services will appear here once they are added to the student's IEP.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="accommodations" className="space-y-6">
                {accommodations.length > 0 ? (
                  <div className="grid gap-4">
                    {accommodations.map((accommodation) => (
                      <Card key={accommodation.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{accommodation.title}</CardTitle>
                              <CardDescription>
                                <Badge variant="outline">
                                  {accommodation.category}
                                </Badge>
                              </CardDescription>
                            </div>
                            <Badge variant={accommodation.status === 'active' ? 'default' : 'secondary'}>
                              {accommodation.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {accommodation.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Accommodations Yet</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Accommodations will appear here once they are added to the student's IEP.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="autism" className="space-y-6">
                {autismAccommodations.length > 0 ? (
                  <div className="grid gap-4">
                    {autismAccommodations.map((accommodation) => (
                      <Card key={accommodation.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Volume2 className="h-5 w-5" />
                                {accommodation.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">
                                  {accommodation.category}
                                </Badge>
                                <Badge variant="secondary">
                                  {accommodation.accommodation_type}
                                </Badge>
                              </CardDescription>
                            </div>
                            <Badge variant={accommodation.status === 'active' ? 'default' : 'secondary'}>
                              {accommodation.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {accommodation.description}
                          </p>
                          {accommodation.implementation_notes && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Implementation Notes:</p>
                              <p className="text-sm">{accommodation.implementation_notes}</p>
                            </div>
                          )}
                          {accommodation.effectiveness_rating && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Effectiveness:</span>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(star => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= accommodation.effectiveness_rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Autism Accommodations Yet</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Autism-specific accommodations will appear here once they are created for this student.
                      </p>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Autism Support Plan
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="gifted" className="space-y-6">
                {giftedAssessments.length > 0 ? (
                  <div className="grid gap-6">
                    {giftedAssessments.map((assessment) => (
                      <Card key={assessment.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                {assessment.assessment_type === 'twice_exceptional' ? 'Twice-Exceptional Profile' : 'Gifted Assessment'}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-muted-foreground">
                                  Created {new Date(assessment.created_at).toLocaleDateString()}
                                </span>
                                {assessment.learning_differences && assessment.learning_differences.length > 0 && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    2e Profile
                                  </Badge>
                                )}
                              </CardDescription>
                            </div>
                            <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                              {assessment.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Areas of Giftedness */}
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              Areas of Giftedness
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {assessment.giftedness_areas.map((area, index) => (
                                <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Learning Differences */}
                          {assessment.learning_differences && assessment.learning_differences.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                Learning Differences
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {assessment.learning_differences.map((difference, index) => (
                                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {difference}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Strengths */}
                          {assessment.strengths && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Strengths
                              </h4>
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm">
                                  {typeof assessment.strengths === 'object' ? 
                                    assessment.strengths?.notes || JSON.stringify(assessment.strengths) : 
                                    assessment.strengths}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Evaluator Notes */}
                          {assessment.evaluator_notes && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Evaluator Notes
                              </h4>
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm">{assessment.evaluator_notes}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Gifted Assessments Yet</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Gifted and twice-exceptional assessments will appear here once they are created for this student.
                      </p>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Gifted Assessment
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentProfiles;