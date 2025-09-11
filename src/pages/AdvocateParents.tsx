import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, Phone, Plus, UserCheck, UserPlus, GraduationCap, Calendar, MapPin, Briefcase, FileText, Target, Building2, Heart, User } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";

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
  const { toast } = useToast();

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
        status: 'active'
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

  return (
    <>
      <Dialog open={isCreateCaseOpen} onOpenChange={setIsCreateCaseOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="w-full" data-testid="button-create-case">
            <Briefcase className="h-4 w-4 mr-2" />
            Create Case
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Advocacy Case</DialogTitle>
            <DialogDescription>
              Create a new advocacy case for {parentName}. This will begin an active advocacy relationship.
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
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudentsForParent = async () => {
      try {
        console.log(`🔍 Fetching students for parent: ${parentId}`);
        
        // Get all students for the advocate, then filter by parent
        const response = await apiRequest('GET', '/api/students');
        const allStudents = await response.json();
        
        console.log('🔍 All students:', allStudents);
        
        // Filter students that belong to this parent
        const parentStudents = Array.isArray(allStudents) ? 
          allStudents.filter((student: any) => student.user_id === parentId || student.parent_id === parentId) : 
          [];
        
        console.log(`✅ Found ${parentStudents.length} students for parent ${parentId}:`, parentStudents);
        setStudents(parentStudents);
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

  // Fetch goals data when a student is selected
  useEffect(() => {
    const fetchGoalsData = async () => {
      if (!selectedStudentId) return;
      try {
        const response = await apiRequest('GET', '/api/goals');
        const data = await response.json();
        const studentGoals = Array.isArray(data) ? 
          data.filter((goal: any) => goal.student_id === selectedStudentId) : 
          [];
        setGoals(studentGoals);
      } catch (error) {
        console.error('Error fetching goals:', error);
        setGoals([]);
      }
    };

    fetchGoalsData();
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

  const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Student List */}
      <div className="lg:col-span-1">
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                selectedStudentId === student.id ? 'bg-primary/5 border-primary' : 'border-border'
              }`}
              onClick={() => setSelectedStudentId(student.id)}
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

      {/* Right Panel - Student Details (Tools from Client Students page) */}
      <div className="lg:col-span-2">
        {selectedStudent ? (
          <div className="space-y-6">
            {/* Header with student info */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                  {selectedStudent.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold">{selectedStudent.full_name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Grade {selectedStudent.grade_level || 'Not specified'}</span>
                  <span>•</span>
                  <span>{selectedStudent.school_name || 'School not specified'}</span>
                  <Badge className={getStudentIEPStatusColor(selectedStudent.iep_status)}>
                    {selectedStudent.iep_status || 'Not Set'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tool Cards - Copied from Client Students page */}
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

            {/* Emotions Tracking Section */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-pink-500" />
                  Emotions
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

  // IEP Status Colors: Active=Green, Developing=Yellow, Inactive=Red
  const getIEPStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "developing": return "bg-warning text-warning-foreground";
      case "inactive": return "bg-destructive text-destructive-foreground";
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
                              IEP Status: {getParentIEPStatus(parent).charAt(0).toUpperCase() + getParentIEPStatus(parent).slice(1)}
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
                              IEP Status: {getParentIEPStatus(selectedParent).charAt(0).toUpperCase() + getParentIEPStatus(selectedParent).slice(1)}
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
                            <Button variant="outline" asChild>
                              <Link to={`/advocate/messages?parent=${selectedParent.id}&new=true`}>
                                Send Message
                              </Link>
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