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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    disability_category: "",
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
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name) return;
    
    setLoading(true);
    try {
      const studentData = {
        ...newStudent,
        full_name: `${newStudent.first_name} ${newStudent.last_name}`,
        parent_id: user?.id
      };
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        credentials: 'include',
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
      
      const { apiRequest } = await import('@/lib/queryClient');
      const response = await apiRequest('PUT', `/api/students/${editingStudent.id}`, studentData);
      
      if (response.ok) {
        setIsEditStudentOpen(false);
        setEditingStudent(null);
        resetForm();
        await fetchStudents();
        // Force re-fetch the current student data to show updated information
        if (selectedStudentId) {
          await fetchCurrentStudent(selectedStudentId);
        }
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
      first_name: student.first_name || student.full_name.split(' ')[0] || '',
      last_name: student.last_name || student.full_name.split(' ').slice(1).join(' ') || '',
      date_of_birth: student.date_of_birth || '',
      grade_level: student.grade_level || '',
      school_name: student.school_name || '',
      district: student.district || '',
      disability_category: student.disability_category || '',
      iep_status: student.iep_status || 'Active',
      disabilities: student.disabilities || [],
      current_services: student.current_services || [],
      case_manager: student.case_manager || '',
      case_manager_email: student.case_manager_email || '',
      emergency_contact: student.emergency_contact || '',
      emergency_phone: student.emergency_phone || '',
      notes: student.notes || '',
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
      disability_category: '',
      iep_status: 'Active',
      disabilities: [],
      current_services: [],
      case_manager: '',
      case_manager_email: '',
      emergency_contact: '',
      emergency_phone: '',
      medical_info: '',
      notes: '',
    });
  };

  const fetchCurrentStudent = async (studentId: string) => {
    try {
      const { apiRequest } = await import('@/lib/queryClient');
      const response = await apiRequest('GET', '/api/students');
      const data = await response.json();
      const student = data.find((s: Student) => s.id === studentId);
      if (student) {
        setCurrentStudent(student);
      }
    } catch (error) {
      console.error('Error fetching current student:', error);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    if (!user) return;

    try {
      // Add cache-busting timestamp and proper auth headers to force fresh data
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/students?_t=${Date.now()}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
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

  // Force refresh students when user changes
  useEffect(() => {
    if (user) {
      // Clear existing data first
      setStudents([]);
      setSelectedStudentId(null);
      setCurrentStudent(null);
      // Then fetch fresh data
      fetchStudents();
    }
  }, [user?.id]); // Depend on user ID changes

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
        const token = localStorage.getItem('authToken');
        const goalsResponse = await fetch('/api/goals', {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          },
          credentials: 'include'
        });
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

        {/* Add Student Dialog */}
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">Add New Student</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your child's information to create their educational profile.
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(95vh-200px)] pr-2">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-sm font-medium">First Name *</Label>
                      <Input
                        id="first_name"
                        placeholder="Student's first name"
                        value={newStudent.first_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="last_name"
                        placeholder="Student's last name"
                        value={newStudent.last_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={newStudent.date_of_birth}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade_level" className="text-sm font-medium">Grade</Label>
                      <Select value={newStudent.grade_level} onValueChange={(value) => setNewStudent(prev => ({ ...prev, grade_level: value }))}>
                        <SelectTrigger className="h-10">
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
                </div>

                {/* School Information */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">School Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="school_name" className="text-sm font-medium">School (Optional)</Label>
                      <Input
                        id="school_name"
                        placeholder="Current school"
                        value={newStudent.school_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, school_name: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm font-medium">District (Optional)</Label>
                      <Input
                        id="district"
                        placeholder="School district"
                        value={newStudent.district}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, district: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* IEP Status */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">IEP Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="iep_status" className="text-sm font-medium">IEP Status</Label>
                    <Select value={newStudent.iep_status} onValueChange={(value) => setNewStudent(prev => ({ ...prev, iep_status: value }))}>
                      <SelectTrigger className="h-10">
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
                </div>

                {/* Disabilities */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Disabilities (Select all that apply)</h3>
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
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Current Services (Select all that apply)</h3>
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
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Additional Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="case_manager" className="text-sm font-medium">Case Manager</Label>
                      <Input
                        id="case_manager"
                        placeholder="Case manager name"
                        value={newStudent.case_manager}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, case_manager: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="case_manager_email" className="text-sm font-medium">Case Manager Email</Label>
                      <Input
                        id="case_manager_email"
                        type="email"
                        placeholder="case.manager@school.edu"
                        value={newStudent.case_manager_email}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, case_manager_email: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact" className="text-sm font-medium">Emergency Contact</Label>
                      <Input
                        id="emergency_contact"
                        placeholder="Emergency contact name"
                        value={newStudent.emergency_contact}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, emergency_contact: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_phone" className="text-sm font-medium">Emergency Phone</Label>
                      <Input
                        id="emergency_phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={newStudent.emergency_phone}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, emergency_phone: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      placeholder="Additional information about the student..."
                      value={newStudent.notes}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsAddStudentOpen(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStudent} 
                disabled={loading || !newStudent.first_name || !newStudent.last_name} 
                className="button-premium px-6"
              >
                {loading ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
          <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">Edit Student</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update {editingStudent?.full_name}'s information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(95vh-200px)] pr-2">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_first_name" className="text-sm font-medium">First Name *</Label>
                      <Input
                        id="edit_first_name"
                        placeholder="Student's first name"
                        value={newStudent.first_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_last_name" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="edit_last_name"
                        placeholder="Student's last name"
                        value={newStudent.last_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_grade_level" className="text-sm font-medium">Grade Level</Label>
                      <Select value={newStudent.grade_level} onValueChange={(value) => setNewStudent(prev => ({ ...prev, grade_level: value }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PK">Pre-K</SelectItem>
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
                    <div className="space-y-2">
                      <Label htmlFor="edit_school_name" className="text-sm font-medium">School Name</Label>
                      <Input
                        id="edit_school_name"
                        placeholder="Current school"
                        value={newStudent.school_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, school_name: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_district" className="text-sm font-medium">School District</Label>
                      <Input
                        id="edit_district"
                        placeholder="School district name"
                        value={newStudent.district}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, district: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_case_manager" className="text-sm font-medium">Case Manager</Label>
                      <Input
                        id="edit_case_manager"
                        placeholder="Case manager name"
                        value={newStudent.case_manager}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, case_manager: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="edit_date_of_birth"
                        type="date"
                        value={newStudent.date_of_birth}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_disability_category" className="text-sm font-medium">Primary Disability Category</Label>
                      <Select value={newStudent.disability_category} onValueChange={(value) => setNewStudent(prev => ({ ...prev, disability_category: value }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select primary disability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Autism Spectrum Disorder">Autism Spectrum Disorder</SelectItem>
                          <SelectItem value="ADHD">ADHD</SelectItem>
                          <SelectItem value="Learning Disability">Learning Disability</SelectItem>
                          <SelectItem value="Intellectual Disability">Intellectual Disability</SelectItem>
                          <SelectItem value="Speech/Language Impairment">Speech/Language Impairment</SelectItem>
                          <SelectItem value="Emotional Behavioral Disorder">Emotional Behavioral Disorder</SelectItem>
                          <SelectItem value="Other Health Impairment">Other Health Impairment</SelectItem>
                          <SelectItem value="Multiple Disabilities">Multiple Disabilities</SelectItem>
                          <SelectItem value="Hearing Impairment">Hearing Impairment</SelectItem>
                          <SelectItem value="Visual Impairment">Visual Impairment</SelectItem>
                          <SelectItem value="Orthopedic Impairment">Orthopedic Impairment</SelectItem>
                          <SelectItem value="Traumatic Brain Injury">Traumatic Brain Injury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* IEP Status */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">IEP Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="edit_iep_status" className="text-sm font-medium">IEP Status</Label>
                    <Select value={newStudent.iep_status} onValueChange={(value) => setNewStudent(prev => ({ ...prev, iep_status: value }))}>
                      <SelectTrigger className="h-10">
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
                </div>

                {/* Notes */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium text-sm text-primary mb-3">Additional Notes</h3>
                  <div className="space-y-2">
                    <Label htmlFor="edit_notes" className="text-sm font-medium">Notes</Label>
                    <Textarea
                      id="edit_notes"
                      placeholder="Any additional information about the student..."
                      value={newStudent.notes}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditStudentOpen(false);
                  setEditingStudent(null);
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditStudent} 
                disabled={loading || !newStudent.first_name || !newStudent.last_name} 
                className="button-premium px-6"
              >
                {loading ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 premium-card">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
                <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
                <TabsTrigger value="accommodations">Accommodations ({accommodations.length})</TabsTrigger>
                <TabsTrigger value="autism" className="bg-blue-600 text-white">🧩 Autism</TabsTrigger>
                <TabsTrigger value="gifted" className="bg-purple-600 text-white">🎓 Gifted</TabsTrigger>
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

              <TabsContent value="autism" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="text-2xl mr-2">🧩</span>
                      Autism Support Tools
                    </CardTitle>
                    <CardDescription>Specialized accommodations and strategies for autism spectrum support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🎯</div>
                      <h3 className="text-lg font-semibold mb-2">Integrated Autism Support</h3>
                      <p className="text-muted-foreground mb-4">
                        All autism-specific accommodations and tools are now integrated directly into your student's profile for streamlined access.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <div className="text-blue-600 mb-2">📊</div>
                          <h4 className="font-medium mb-1">Sensory Accommodations</h4>
                          <p className="text-sm text-muted-foreground">Track sensory needs and environmental modifications</p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <div className="text-green-600 mb-2">🗣️</div>
                          <h4 className="font-medium mb-1">Communication Support</h4>
                          <p className="text-sm text-muted-foreground">Monitor communication strategies and progress</p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <div className="text-purple-600 mb-2">📋</div>
                          <h4 className="font-medium mb-1">Behavioral Strategies</h4>
                          <p className="text-sm text-muted-foreground">Document effective behavioral interventions</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gifted" className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="text-2xl mr-2">🎓</span>
                      Gifted & Twice-Exceptional Support
                    </CardTitle>
                    <CardDescription>Advanced learning assessments and support for gifted and 2E learners</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">✨</div>
                      <h3 className="text-lg font-semibold mb-2">Integrated Gifted Support</h3>
                      <p className="text-muted-foreground mb-4">
                        Comprehensive gifted and twice-exceptional assessment tools are now seamlessly integrated into your student's profile.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <div className="text-blue-600 mb-2">🧠</div>
                          <h4 className="font-medium mb-1">Cognitive Assessment</h4>
                          <p className="text-sm text-muted-foreground">Track intellectual abilities and learning patterns</p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <div className="text-green-600 mb-2">⚡</div>
                          <h4 className="font-medium mb-1">Enrichment Needs</h4>
                          <p className="text-sm text-muted-foreground">Document advanced learning opportunities</p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <div className="text-purple-600 mb-2">🎯</div>
                          <h4 className="font-medium mb-1">2E Support</h4>
                          <p className="text-sm text-muted-foreground">Address unique twice-exceptional needs</p>
                        </div>
                      </div>
                    </div>
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