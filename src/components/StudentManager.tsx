import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
// // import { supabase } from "@/integrations/supabase/client"; // Removed during migration // Removed during migration
import { Plus, Users, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Student {
  id: string;
  full_name: string;
  grade_level: string;
  school_name: string;
  disability_category: string;
  iep_status: string;
  parent_id?: string;
  user_id: string;
}

interface Parent {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface StudentManagerProps {
  onStudentSelect?: (student: Student | null) => void;
  selectedStudentId?: string;
}

export function StudentManager({ onStudentSelect, selectedStudentId }: StudentManagerProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [isCreateParentOpen, setIsCreateParentOpen] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Check if current user is an advocate
  const [isAdvocate, setIsAdvocate] = useState(false);

  useEffect(() => {
    checkUserRole();
    fetchStudents();
    if (isAdvocate) {
      fetchParents();
    }
  }, [user, isAdvocate]);

  const checkUserRole = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    setIsAdvocate(profile?.role === 'advocate');
  };

  const fetchStudents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    if (!user) return;
    
    try {
      // Get clients for advocates
      const { data: clients } = await supabase
        .from('advocate_clients')
        .select('client_id')
        .eq('advocate_id', user.id)
        .eq('status', 'active');

      if (clients && clients.length > 0) {
        const clientIds = clients.map(c => c.client_id);
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, role')
          .in('user_id', clientIds)
          .eq('role', 'parent');

        if (profiles) {
          const parentProfiles = profiles.map(profile => ({
            id: profile.user_id,
            full_name: profile.full_name || 'Unknown',
            email: profile.email || '',
            role: profile.role
          }));
          
          setParents(parentProfiles);
        }
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
    }
  };

  const handleCreateStudent = async (formData: FormData) => {
    if (!user) return;

    const full_name = formData.get('full_name') as string;
    const grade_level = formData.get('grade_level') as string;
    const school_name = formData.get('school_name') as string;
    const disability_category = formData.get('disability_category') as string;
    const parent_id = formData.get('parent_id') as string;

    try {
      const studentData = {
        user_id: isAdvocate && parent_id ? parent_id : user.id,
        parent_id: isAdvocate && parent_id ? parent_id : user.id,
        full_name,
        grade_level,
        school_name,
        disability_category,
        iep_status: 'active'
      };

      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => [...prev, data]);
      setIsCreateStudentOpen(false);
      
      toast({
        title: "Success",
        description: "Student created successfully"
      });
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: "Error",
        description: "Failed to create student",
        variant: "destructive"
      });
    }
  };

  const handleCreateParent = async (formData: FormData) => {
    if (!user || !isAdvocate) return;

    const email = formData.get('email') as string;
    const full_name = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        user_metadata: {
          full_name,
          role: 'parent'
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create advocate-client relationship
        const { error: relationError } = await supabase
          .from('advocate_clients')
          .insert([{
            advocate_id: user.id,
            client_id: authData.user.id,
            relationship_type: 'professional',
            status: 'active'
          }]);

        if (relationError) throw relationError;

        setIsCreateParentOpen(false);
        fetchParents();
        
        toast({
          title: "Success",
          description: "Parent account created and linked successfully"
        });
      }
    } catch (error) {
      console.error('Error creating parent:', error);
      toast({
        title: "Error",
        description: "Failed to create parent account",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading students...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Management
        </h3>
        <div className="flex gap-2">
          {isAdvocate && (
            <Dialog open={isCreateParentOpen} onOpenChange={setIsCreateParentOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Parent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Parent</DialogTitle>
                  <DialogDescription>
                    Create a new parent account and link them to your caseload
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateParent(formData);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" name="full_name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" name="phone" type="tel" />
                  </div>
                  <Button type="submit" className="w-full">Create Parent</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Student</DialogTitle>
                <DialogDescription>
                  Add a new student to manage their IEP and educational services
                </DialogDescription>
              </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateStudent(formData);
                }} className="space-y-4">
                {isAdvocate && (
                  <div>
                    <Label htmlFor="parent_id">Assign to Parent</Label>
                    <Select name="parent_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.full_name} ({parent.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="full_name">Student Name</Label>
                  <Input id="full_name" name="full_name" required />
                </div>
                <div>
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Select name="grade_level">
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade..." />
                    </SelectTrigger>
                    <SelectContent>
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
                <div>
                  <Label htmlFor="school_name">School Name</Label>
                  <Input id="school_name" name="school_name" />
                </div>
                <div>
                  <Label htmlFor="disability_category">Disability Category</Label>
                  <Select name="disability_category">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Autism">Autism</SelectItem>
                      <SelectItem value="ADHD">ADHD</SelectItem>
                      <SelectItem value="Learning Disability">Learning Disability</SelectItem>
                      <SelectItem value="Intellectual Disability">Intellectual Disability</SelectItem>
                      <SelectItem value="Speech/Language">Speech/Language</SelectItem>
                      <SelectItem value="Emotional Disturbance">Emotional Disturbance</SelectItem>
                      <SelectItem value="Other Health Impairment">Other Health Impairment</SelectItem>
                      <SelectItem value="Multiple Disabilities">Multiple Disabilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Create Student</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {students.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
              <p className="text-muted-foreground mb-4">
                {isAdvocate 
                  ? "Create parent accounts first, then add students to manage their IEP information."
                  : "Add your first student to start managing their IEP information."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          students.map((student) => (
            <Card 
              key={student.id} 
              className={`cursor-pointer transition-all ${
                selectedStudentId === student.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onStudentSelect?.(student)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{student.full_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {student.grade_level ? `Grade ${student.grade_level}` : 'Grade not specified'} • {student.school_name || 'School not specified'}
                    </p>
                    {student.disability_category && (
                      <p className="text-sm text-muted-foreground">
                        Category: {student.disability_category}
                      </p>
                    )}
                  </div>
                  <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    {student.iep_status || 'Active'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}