import { useState, useEffect } from "react";
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
  Volume2,
  Brain,
  Star,
  BookOpen,
  Lightbulb,
  Building2,
  Eye,
  Sparkles,
  Clock,
  Smile,
  Heart,
  TrendingUp,
  MessageCircle,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

export default function ParentStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Desktop mock data
      setStudents([
        {
          id: '1',
          full_name: 'Student One',
          grade_level: '5',
          disability_category: 'Learning Disability',
          age: 10,
          school: 'Elementary School',
          teacher: 'Ms. Johnson'
        }
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500 dark:text-gray-400">Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">Manage your children's profiles and track their progress</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Students List - Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Children</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {student.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{student.full_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Grade {student.grade_level} • Age {student.age}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No students added yet</p>
                    <Button size="sm" className="mt-2">Add Your First Child</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Student Profile Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="text-lg">
                            {selectedStudent.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-2xl font-bold">{selectedStudent.full_name}</h2>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span>Grade {selectedStudent.grade_level}</span>
                            <span>•</span>
                            <span>Age {selectedStudent.age}</span>
                            <span>•</span>
                            <span>{selectedStudent.school}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact School
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Student Details Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Goals
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">3</div>
                          <p className="text-xs text-muted-foreground">2 in progress</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Meetings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">1</div>
                          <p className="text-xs text-muted-foreground">Next: March 15</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documents
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">12</div>
                          <p className="text-xs text-muted-foreground">3 recent</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">75%</div>
                          <p className="text-xs text-muted-foreground">Overall</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Student Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Student Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Full Name</Label>
                              <p className="text-sm text-muted-foreground">{selectedStudent.full_name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Grade Level</Label>
                              <p className="text-sm text-muted-foreground">Grade {selectedStudent.grade_level}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Age</Label>
                              <p className="text-sm text-muted-foreground">{selectedStudent.age} years old</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">School</Label>
                              <p className="text-sm text-muted-foreground">{selectedStudent.school}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Teacher</Label>
                              <p className="text-sm text-muted-foreground">{selectedStudent.teacher}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Disability Category</Label>
                              <p className="text-sm text-muted-foreground">{selectedStudent.disability_category}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">Reading goal progress updated</span>
                              <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">IEP meeting scheduled</span>
                              <span className="text-xs text-muted-foreground ml-auto">1d ago</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm">Evaluation report uploaded</span>
                              <span className="text-xs text-muted-foreground ml-auto">3d ago</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="academic" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Academic Performance</CardTitle>
                        <CardDescription>Track your child's academic progress and achievements</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2">Reading</h4>
                              <Progress value={80} className="mb-2" />
                              <p className="text-sm text-muted-foreground">Above grade level</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2">Math</h4>
                              <Progress value={65} className="mb-2" />
                              <p className="text-sm text-muted-foreground">On grade level</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2">Writing</h4>
                              <Progress value={70} className="mb-2" />
                              <p className="text-sm text-muted-foreground">On grade level</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="behavioral" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Behavioral Tracking</CardTitle>
                        <CardDescription>Monitor behavioral patterns and emotional well-being</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Today's Mood</h4>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">😊 Happy</Button>
                              <Button variant="outline" size="sm">😐 Okay</Button>
                              <Button variant="outline" size="sm">😟 Worried</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="goals" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>IEP Goals</CardTitle>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Goal
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Reading Comprehension</h4>
                              <Badge>In Progress</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Improve reading comprehension skills to grade level
                            </p>
                            <Progress value={75} />
                            <p className="text-xs text-muted-foreground mt-1">75% complete</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Documents</CardTitle>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Upload Document
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">Current IEP</p>
                                <p className="text-xs text-muted-foreground">Updated March 2024</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">Evaluation Report</p>
                                <p className="text-xs text-muted-foreground">January 2024</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Student</h3>
                    <p className="text-muted-foreground">Choose a student from the sidebar to view their details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}