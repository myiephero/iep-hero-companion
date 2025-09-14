import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, Phone, Plus, UserCheck, UserPlus, GraduationCap, Calendar, MapPin, Briefcase, FileText, Target, Building2, Heart, User, ChevronDown, CheckCircle, Clock, XCircle, Pause, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { getIEPStatusColor } from "@/lib/utils";
import { useCreateConversation } from "@/hooks/useMessaging";

interface Parent {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  status: string;
  students_count?: number;
}

interface Student {
  id: string;
  full_name: string;
  grade_level?: string;
  school_name?: string;
  district?: string;
  disability_category?: string;
  iep_status?: string;
  iep_date?: string;
  next_review_date?: string;
  created_at: string;
}

// Component to create a new case for a parent
function CreateCaseButton({ parentId, parentName }: { parentId: string; parentName: string }) {
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [caseDescription, setCaseDescription] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const { toast } = useToast();

  const statusOptions = [
    { 
      value: 'active', 
      label: 'Active', 
      color: 'text-green-700',
      bgColor: 'hover:bg-green-50',
      badgeColor: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      description: 'Case is actively being worked on'
    },
    { 
      value: 'pending', 
      label: 'Pending', 
      color: 'text-amber-700',
      bgColor: 'hover:bg-amber-50', 
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Clock,
      description: 'Case is waiting for action or review'
    },
    { 
      value: 'closed', 
      label: 'Closed', 
      color: 'text-slate-600',
      bgColor: 'hover:bg-slate-50',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: XCircle,
      description: 'Case has been completed or resolved'
    },
    { 
      value: 'inactive', 
      label: 'Inactive', 
      color: 'text-red-700',
      bgColor: 'hover:bg-red-50',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      icon: Pause,
      description: 'Case is on hold or suspended'
    },
  ];

  // Fetch students for this parent when dialog opens
  useEffect(() => {
    if (isCreateCaseOpen && parentId) {
      const fetchStudents = async () => {
        try {
          const response = await apiRequest('GET', '/api/students');
          const allStudents = await response.json();
          const parentStudents = Array.isArray(allStudents) ? 
            allStudents.filter((student: any) => student.user_id === parentId || student.parent_id === parentId) : 
            [];
          setStudents(parentStudents);
        } catch (error) {
          console.error('Error fetching students:', error);
          setStudents([]);
        }
      };
      fetchStudents();
    }
  }, [isCreateCaseOpen, parentId]);

  const handleCreateCase = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Please select a student",
        description: "You must select a student for this case.",
        variant: "destructive",
      });
      return;
    }

    if (!caseDescription.trim()) {
      toast({
        title: "Please provide a description",
        description: "You must provide a case description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedStudent = students.find(s => s.id === selectedStudentId);
      const caseData = {
        student_id: selectedStudentId,
        title: `IEP Support for ${selectedStudent?.full_name || 'Student'}`,
        description: caseDescription.trim(),
        status: selectedStatus
      };

      const response = await apiRequest('POST', '/api/cases', caseData);
      if (response.ok) {
        toast({
          title: "Case created successfully!",
          description: `New advocacy case created for ${selectedStudent?.full_name}`,
        });
        
        // Reset form and close dialog
        setSelectedStudentId("");
        setCaseDescription("");
        setSelectedStatus('active');
        setIsCreateCaseOpen(false);
        
        // Refresh the page data
        window.location.reload();
      } else {
        throw new Error('Failed to create case');
      }
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: "Error creating case",
        description: "There was an issue creating the case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStatusOption = statusOptions.find(option => option.value === selectedStatus);

  return (
    <>
      <Dialog open={isCreateCaseOpen} onOpenChange={setIsCreateCaseOpen}>
        <DialogTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="w-full" data-testid="button-create-case">
                <Briefcase className="h-4 w-4 mr-2" />
                Create Case
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
              <div className="px-2 py-1.5 mb-2">
                <p className="text-sm font-medium text-muted-foreground">Choose case status</p>
              </div>
              {statusOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => {
                      setSelectedStatus(option.value);
                      setIsCreateCaseOpen(true);
                    }}
                    data-testid={`menu-item-${option.value}`}
                    className={`p-3 cursor-pointer rounded-lg transition-all duration-200 ${option.bgColor} border border-transparent hover:border-border`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-3 rounded-full flex items-center justify-center ${
                        option.value === 'active' ? 'bg-green-500' :
                        option.value === 'pending' ? 'bg-amber-500' :
                        option.value === 'closed' ? 'bg-slate-500' :
                        'bg-red-500'
                      }`}>
                        <IconComponent className="h-5 w-5 text-white font-bold" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${option.color}`}>
                            Create {option.label} Case
                          </span>
                          <Badge variant="outline" className={`text-xs ${option.badgeColor}`}>
                            {option.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Advocacy Case</DialogTitle>
            <DialogDescription>
              Create a new <span className={currentStatusOption?.color}>{currentStatusOption?.label.toLowerCase()}</span> advocacy case for {parentName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="student-select">Select Student</Label>
              <select
                id="student-select"
                className="w-full p-2 border rounded-md bg-background"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                data-testid="select-student"
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} {student.grade_level ? `(Grade ${student.grade_level})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="case-status">Case Status</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                <Briefcase className="h-4 w-4" />
                <span className={`font-medium ${currentStatusOption?.color}`}>
                  {currentStatusOption?.label}
                </span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="case-description">Case Description</Label>
              <textarea
                id="case-description"
                placeholder="Describe the advocacy needs and goals for this case..."
                className="w-full p-2 border rounded-md bg-background min-h-[100px]"
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                data-testid="input-case-description"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateCaseOpen(false)}
                data-testid="button-cancel-case"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCase} 
                disabled={loading}
                data-testid="button-submit-case"
              >
                {loading ? 'Creating...' : 'Create Case'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Component to display students for a specific parent
function StudentListForParent({ parentId }: { parentId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [goals, setGoals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentsForParent = async () => {
      try {
        console.log(`🔍 Fetching students for parent: ${parentId}`);
        
        // Get all students for the advocate, then filter by parent
        const response = await apiRequest('GET', '/api/students');
        const allStudents = await response.json();
        
        console.log('🔍 All students:', allStudents);
        
        // Filter students that belong to this parent
        // Filter students for this specific parent
        const parentStudents = Array.isArray(allStudents) ? 
          allStudents.filter((student: any) => student.parent_id === parentId) : 
          [];
        
        setStudents(parentStudents);
        
        // Auto-select the first student if none selected
        if (parentStudents.length > 0 && !selectedStudentId) {
          setSelectedStudentId(parentStudents[0].id);
        }
      } catch (error) {
        console.error('❌ Error fetching students for parent:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (parentId && user) {
      fetchStudentsForParent();
    }
  }, [parentId, user]);

  // Fetch goals, services, and accommodations data when a student is selected
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!selectedStudentId) return;
      try {
        // Fetch goals
        const goalsResponse = await apiRequest('GET', '/api/goals');
        const goalsData = await goalsResponse.json();
        const studentGoals = Array.isArray(goalsData) ? 
          goalsData.filter((goal: any) => goal.student_id === selectedStudentId) : 
          [];
        setGoals(studentGoals);

        // Fetch services
        const servicesResponse = await apiRequest('GET', '/api/services');
        const servicesData = await servicesResponse.json();
        const studentServices = Array.isArray(servicesData) ? 
          servicesData.filter((service: any) => service.student_id === selectedStudentId) : 
          [];
        setServices(studentServices);

        // Fetch accommodations
        const accommodationsResponse = await apiRequest('GET', '/api/accommodations');
        const accommodationsData = await accommodationsResponse.json();
        const studentAccommodations = Array.isArray(accommodationsData) ? 
          accommodationsData.filter((accommodation: any) => accommodation.student_id === selectedStudentId) : 
          [];
        setAccommodations(studentAccommodations);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setGoals([]);
        setServices([]);
        setAccommodations([]);
      }
    };

    fetchStudentData();
  }, [selectedStudentId]);

  // Helper function for IEP status colors - same as Client Students page
  const getStudentIEPStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-muted text-muted-foreground";
    switch (status.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "developing": return "bg-warning text-warning-foreground";
      case "inactive": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading students...</div>;
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-6">
        <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No students found for this parent.</p>
        <p className="text-sm text-muted-foreground mt-1">Students will appear here once they are properly linked.</p>
      </div>
    );
  }

  const selectedStudent = selectedStudentId ? students.find(s => String(s.id) === String(selectedStudentId)) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Student List */}
      <div className="lg:col-span-1">
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                String(selectedStudentId) === String(student.id) ? 'bg-primary/5 border-primary' : 'border-border'
              }`}
              onClick={() => setSelectedStudentId(String(student.id))}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{student.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.grade_level ? `Grade ${student.grade_level}` : 'Grade not specified'} • {student.school_name || 'School not specified'}
                  </p>
                </div>
                <Badge className={`text-xs ${getStudentIEPStatusColor(student.iep_status)}`}>
                  {student.iep_status || 'Not Set'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Full Student Details with Tabs (integrated from Client Students) */}
      <div className="lg:col-span-2">
        {selectedStudent ? (
          <>
            {/* Student Header Card */}
            <Card className="premium-card mb-6">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-gradient-primary text-primary-foreground">
                      {selectedStudent.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-gradient">{selectedStudent.full_name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center space-x-4 mt-2">
                        <span>{selectedStudent.grade_level ? `Grade ${selectedStudent.grade_level}` : 'Grade not specified'}</span>
                        <span>•</span>
                        <span>{selectedStudent.school_name || 'School not specified'}</span>
                        <span>•</span>
                        <Badge className={getStudentIEPStatusColor(selectedStudent.iep_status)}>
                          IEP: {selectedStudent.iep_status || 'Not Set'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm">Student: {selectedStudent.full_name}</span>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/advocate/messages?student=${selectedStudent.id}`}>
                            <Mail className="h-3 w-3 mr-1" />
                            Message Parent
                          </Link>
                        </Button>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Modern Horizontal Tab Navigation */}
            <div className="w-full mb-8">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-lg">
                <div className="flex bg-white dark:bg-gray-900 rounded-xl p-2 gap-1">
                  <button
                    onClick={() => setSelectedTab("overview")}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                      selectedTab === "overview"
                        ? "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden lg:inline">Overview</span>
                  </button>
                  <button
                    onClick={() => setSelectedTab("goals")}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                      selectedTab === "goals"
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Target className="h-4 w-4" />
                    <span className="hidden lg:inline">Goals</span>
                    <span className="lg:hidden">({goals.length})</span>
                    <span className="hidden lg:inline">({goals.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedTab("services")}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                      selectedTab === "services"
                        ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="hidden lg:inline">Services</span>
                    <span className="lg:hidden">({services.length})</span>
                    <span className="hidden lg:inline">({services.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedTab("accommodations")}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                      selectedTab === "accommodations"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden lg:inline">Accommodations</span>
                    <span className="lg:hidden">({accommodations.length})</span>
                    <span className="hidden lg:inline">({accommodations.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedTab("emotions")}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                      selectedTab === "emotions"
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                    <span className="hidden lg:inline">Emotions</span>
                  </button>
                  <button
                    onClick={() => setSelectedTab("gifted")}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                      selectedTab === "gifted"
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-lg">🎓</span>
                    <span className="hidden lg:inline">Gifted</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {selectedTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* IEP Status Card */}
                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        IEP Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge className={getStudentIEPStatusColor(selectedStudent.iep_status)}>
                          {selectedStudent.iep_status || 'Not Set'}
                        </Badge>
                        {selectedStudent.iep_date && (
                          <p className="text-sm text-muted-foreground">
                            IEP Date: {new Date(selectedStudent.iep_date).toLocaleDateString()}
                          </p>
                        )}
                        {selectedStudent.next_review_date && (
                          <p className="text-sm text-muted-foreground">
                            Next Review: {new Date(selectedStudent.next_review_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Goals Progress Card */}
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

                  {/* School Info Card */}
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
                          <p className="font-medium">{selectedStudent.school_name || 'Not specified'}</p>
                          <p className="text-sm text-muted-foreground">School</p>
                        </div>
                        <div>
                          <p className="text-sm">{selectedStudent.district || 'Not specified'}</p>
                          <p className="text-xs text-muted-foreground">District</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {selectedTab === "goals" && (
              <div className="space-y-6">
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
                              <Badge className={getStudentIEPStatusColor(goal.status)}>
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
              </div>
            )}

            {selectedTab === "services" && (
              <div className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>Support Services</CardTitle>
                    <CardDescription>
                      Special education and related services provided to the student
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {services.length === 0 ? (
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Services Documented</h3>
                        <p className="text-sm text-muted-foreground">
                          IEP services and support will appear here once they are documented.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {services.map((service) => (
                          <div key={service.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{service.service_type}</h4>
                              <Badge className={getStudentIEPStatusColor(service.status)}>
                                {service.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Frequency:</span> {service.frequency || 'Not specified'}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> {service.duration ? `${service.duration} minutes` : 'Not specified'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTab === "accommodations" && (
              <div className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>IEP Accommodations</CardTitle>
                    <CardDescription>
                      Documented accommodations and modifications for this student
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {accommodations.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Accommodations Documented</h3>
                        <p className="text-sm text-muted-foreground">
                          IEP accommodations and modifications will appear here once they are documented.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {accommodations.map((accommodation) => (
                          <div key={accommodation.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                    {accommodation.category}
                                  </span>
                                </div>
                                <h4 className="font-semibold mb-1">{accommodation.title}</h4>
                                <p className="text-sm text-muted-foreground">{accommodation.description}</p>
                                {accommodation.implementation_notes && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    <strong>Implementation:</strong> {accommodation.implementation_notes}
                                  </p>
                                )}
                              </div>
                              <Badge 
                                className={accommodation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                              >
                                {accommodation.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTab === "emotions" && (
              <div className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-pink-500" />
                      Emotional Tracking
                    </CardTitle>
                    <CardDescription>
                      Track and record emotional observations for this student
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Current Emotional State</Label>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {[
                            { emoji: '😊', label: 'Happy', color: 'bg-green-100 hover:bg-green-200' },
                            { emoji: '😐', label: 'Neutral', color: 'bg-blue-100 hover:bg-blue-200' },
                            { emoji: '😟', label: 'Anxious', color: 'bg-yellow-100 hover:bg-yellow-200' },
                            { emoji: '😠', label: 'Frustrated', color: 'bg-orange-100 hover:bg-orange-200' },
                            { emoji: '😢', label: 'Distressed', color: 'bg-red-100 hover:bg-red-200' }
                          ].map((mood) => (
                            <Button
                              key={mood.label}
                              variant="outline"
                              className={`h-12 flex-col gap-1 ${mood.color}`}
                              onClick={() => {}}
                            >
                              <span className="text-lg">{mood.emoji}</span>
                              <span className="text-xs">{mood.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full bg-pink-500 hover:bg-pink-600">
                        <Heart className="h-4 w-4 mr-2" />
                        Record Emotional Observation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTab === "gifted" && (
              <div className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🎓</span>
                        Gifted & Twice-Exceptional Support
                      </div>
                    </CardTitle>
                    <CardDescription>Advanced learning assessments and support for gifted and 2E learners</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
                      {[
                        {
                          id: "cognitive", 
                          title: "Cognitive Assessment",
                          description: "Track intellectual abilities and learning patterns",
                          icon: "🧠",
                          color: "text-blue-600"
                        },
                        {
                          id: "enrichment",
                          title: "Enrichment Needs", 
                          description: "Document advanced learning opportunities",
                          icon: "⚡",
                          color: "text-green-600"
                        },
                        {
                          id: "twice_exceptional",
                          title: "2E Support",
                          description: "Address unique twice-exceptional needs", 
                          icon: "🎯",
                          color: "text-purple-600"
                        },
                        {
                          id: "ai_insights",
                          title: "AI Insights",
                          description: "Get intelligent analysis and recommendations",
                          icon: "🤖",
                          color: "text-indigo-600"
                        }
                      ].map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            if (!selectedStudentId) {
                              toast({
                                title: "Student Required",
                                description: "Please select a student first.",
                                variant: "destructive"
                              });
                              return;
                            }
                            toast({
                              title: "Feature Coming Soon",
                              description: `${category.title} tools will be available soon.`,
                            });
                          }}
                          className={`${category.id === 'ai_insights' ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900' : 'bg-muted/30'} p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left group cursor-pointer`}
                        >
                          <div className={`${category.color} mb-2 text-xl group-hover:scale-110 transition-transform`}>
                            {category.icon}
                          </div>
                          <h4 className="font-medium mb-1">{category.title}</h4>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          {category.id === 'ai_insights' && (
                            <Badge variant="secondary" className="mt-2 text-xs">NEW</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Select a Student</p>
              <p className="text-muted-foreground">Choose a student from the list to view their detailed information and tools.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdvocateParents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { create: createConversation, creating } = useCreateConversation();
  
  // Handler for Send Message button
  const handleSendMessage = async (parent: Parent) => {
    try {
      if (!user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages.",
          variant: "destructive"
        });
        return;
      }

      // Create conversation in the main messaging system
      const conversation = await createConversation(
        user.id, // advocateId
        parent.id, // parentId
        undefined // studentId - optional for direct parent conversations
      );

      if (conversation) {
        toast({
          title: "Conversation Created!",
          description: `Ready to message ${parent.full_name}. Redirecting to Messages...`,
        });
        
        // Redirect to messages page with the new conversation
        navigate('/advocate/messages', { 
          state: { 
            conversationId: conversation.id,
            newMessage: { 
              advocateId: user.id,
              parentId: parent.id,
              parentName: parent.full_name
            } 
          } 
        });
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    console.log('🔍 AdvocateParents useEffect triggered with user:', user);
    console.log('🔍 User role:', user?.role, 'Email:', user?.email);
    if (user && user.role === 'advocate') {
      console.log('✅ Advocate user found, calling fetchParents...');
      fetchParents();
    } else if (user && user.role !== 'advocate') {
      console.log('❌ User is not an advocate, role:', user.role);
    } else {
      console.log('❌ No user found, skipping fetchParents');
    }
  }, [user]);

  const fetchParents = async () => {
    console.log('🚀 fetchParents called');
    if (!user) {
      console.log('❌ fetchParents: No user, returning early');
      return;
    }

    if (user.role !== 'advocate') {
      console.log('❌ fetchParents: User is not advocate, role:', user.role);
      return;
    }

    // Enhanced debugging for authentication
    const token = localStorage.getItem('authToken');
    console.log('🔍 fetchParents - Auth token present:', !!token);
    if (token) {
      console.log('🔍 fetchParents - Token preview:', `${token.substring(0,20)}...`);
    }
    console.log('🔍 fetchParents - User object:', JSON.stringify(user, null, 2));

    try {
      console.log('📡 Making authenticated API call to /api/parents with apiRequest...');
      
      // Use apiRequest which properly handles authentication headers
      const response = await apiRequest('GET', '/api/parents');
      
      console.log('✅ fetchParents - API response received successfully');
      console.log('📡 fetchParents - Response status:', response.status);
      
      const data = await response.json();
        console.log('✅ Fetched parent clients raw data:', data);
        
        // Validate API response format and handle different response shapes
        let parentClients: Parent[] = [];
        if (Array.isArray(data)) {
          // Direct array response
          parentClients = data;
          console.log('✅ Using direct array response with', data.length, 'clients');
        } else if (data && Array.isArray(data.clients)) {
          // Wrapped response with clients property
          parentClients = data.clients;
          console.log('✅ Using wrapped response with', data.clients.length, 'clients');
        } else if (data && Array.isArray(data.parents)) {
          // Wrapped response with parents property
          parentClients = data.parents;
          console.log('✅ Using wrapped response with', data.parents.length, 'clients');
        } else {
          // Unknown format, log for debugging
          console.log('⚠️ Unknown API response format:', data);
          parentClients = [];
        }
        
        setParents(parentClients);
    } catch (error: any) {
      console.error('❌ Error fetching parents:', error);
      
      // Authentication errors are already handled by apiRequest
      if (error.message && error.message.includes('401')) {
        console.log('🔄 Authentication failed - apiRequest already handled token cleanup');
      }
      setParents([]);
    } finally {
      console.log('🏁 fetchParents completed, setting loading to false');
      setLoading(false);
    }
  };

  // Case Status Colors: Active=Green, Pending=Yellow, Closed=Red
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "closed": return "bg-destructive text-destructive-foreground";
      case "invited": return "bg-warning text-warning-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };


  // Get IEP status for parent (simplified - using student data or default)
  const getParentIEPStatus = (parent: Parent) => {
    // For now, use a simplified approach - can be enhanced with actual student data
    // This could be improved with server-side joins as recommended by architect
    return "developing"; // Default to developing as shown in screenshot
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      // Create parent via our API
      const inviteRes = await api.inviteParent(
        formData.email,
        formData.firstName,
        formData.lastName
      );

      toast({
        title: "Success!",
        description: "Invitation sent to the parent. They'll set up their account via email.",
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
      });
      setIsCreateDialogOpen(false);
      
      // Refresh parents list
      fetchParents();

    } catch (error: any) {
      console.error('Error creating parent:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create parent account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedParent = selectedParentId ? parents.find(p => p.id === selectedParentId) : null;

  if (!user) {
    return <div>Please log in to view your clients.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Parent Clients</h1>
            <p className="text-muted-foreground">
              Manage your client relationships and view parent accounts you've created
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="button-premium">
                <Plus className="h-4 w-4 mr-2" />
                Create New Parent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create New Parent Account
                </DialogTitle>
                <DialogDescription>
                  Create a new parent account and establish them as your client. They will receive an email to set their password.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateParent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="parent@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="button-premium"
                    disabled={createLoading}
                  >
                    {createLoading ? "Creating..." : "Create Parent Account"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Parent List */}
          <div className="lg:col-span-1">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parent Clients ({parents.length})
                </CardTitle>
                <CardDescription>
                  Select a parent to view details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading parent clients...</p>
                  </div>
                ) : parents.length === 0 ? (
                  <div className="p-6 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Parent Clients Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't created any parent accounts yet. Get started by inviting your first client.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="button-premium">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Create Your First Parent Client
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {parents.map((parent) => (
                      <div
                        key={parent.id}
                        className={`p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors ${selectedParentId === parent.id ? 'bg-muted/50 border-l-4 border-l-primary' : ''}`}
                        onClick={() => setSelectedParentId(parent.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {parent.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NA'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{parent.full_name}</p>
                              <p className="text-sm text-muted-foreground">{parent.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={`text-xs ${getIEPStatusColor(getParentIEPStatus(parent))}`}>
                              IEP: {getParentIEPStatus(parent).charAt(0).toUpperCase() + getParentIEPStatus(parent).slice(1)}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(parent.status)}`}>
                              Case Status: {parent.status || 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {parent.students_count || 0} student{parent.students_count !== 1 ? 's' : ''} • Created {formatDate(parent.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Side - Parent Details */}
          <div className="lg:col-span-2">
            {selectedParent ? (
              <>
                <Card className="premium-card">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg bg-gradient-primary text-primary-foreground">
                          {selectedParent.full_name?.split(' ').map(n => n[0]).join('') || 'NA'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-2xl text-gradient">{selectedParent.full_name}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-2">
                          <span>{selectedParent.email}</span>
                          <span>•</span>
                          <div className="flex gap-2">
                            <Badge className={`text-xs ${getIEPStatusColor(getParentIEPStatus(selectedParent))}`}>
                              IEP: {getParentIEPStatus(selectedParent).charAt(0).toUpperCase() + getParentIEPStatus(selectedParent).slice(1)}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(selectedParent.status)}`}>
                              Case Status: {selectedParent.status || 'Pending'}
                            </Badge>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                
                {/* Parent Details Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 premium-card">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="communication">Communication</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="premium-card">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Mail className="h-5 w-5 mr-2" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <p className="text-muted-foreground">{selectedParent.email}</p>
                            </div>
                            {selectedParent.phone && (
                              <div>
                                <Label className="text-sm font-medium">Phone</Label>
                                <p className="text-muted-foreground">{selectedParent.phone}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-sm font-medium">Client Since</Label>
                              <p className="text-muted-foreground">{formatDate(selectedParent.created_at)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="premium-card">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2" />
                            Student Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Total Students</span>
                              <span className="font-semibold">{selectedParent.students_count || 0}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Button variant="outline" size="sm" asChild className="w-full">
                                <Link to={`/advocate/students?parent=${selectedParent.id}`}>
                                  View All Students
                                </Link>
                              </Button>
                              <CreateCaseButton parentId={selectedParent.id} parentName={selectedParent.full_name} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="students" className="space-y-6">
                    <Card className="premium-card">
                      <CardHeader>
                        <CardTitle>Students</CardTitle>
                        <CardDescription>
                          All students associated with this parent client
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <StudentListForParent parentId={selectedParent.id} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="communication" className="space-y-6">
                    <Card className="premium-card">
                      <CardHeader>
                        <CardTitle>Communication</CardTitle>
                        <CardDescription>
                          Send messages and view communication history with this parent
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Button asChild className="flex-1">
                              <Link to={`/advocate/messages?parent=${selectedParent.id}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Open Messages
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleSendMessage(selectedParent)}
                              disabled={creating}
                              data-testid="button-send-message"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {creating ? "Creating..." : "Send Message"}
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            View all conversations and send secure messages to this parent about their child's IEP needs.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="premium-card">
                <CardContent className="p-8 text-center">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Parent Client</h3>
                  <p className="text-muted-foreground">
                    Choose a parent from the list to view their details, students, and communication history.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}