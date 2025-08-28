import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Plus, 
  Edit, 
  GraduationCap, 
  Heart, 
  Target, 
  Brain, 
  Users, 
  FileText, 
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Star,
  BookOpen,
  Palette,
  Music,
  Gamepad2,
  Calculator,
  Globe,
  Lightbulb
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentProfiles = () => {
  const [selectedStudent, setSelectedStudent] = useState(0);
  
  const students = [
    {
      id: 1,
      name: "Emma Thompson",
      age: 9,
      grade: "4th Grade",
      school: "Lincoln Elementary",
      primaryDisability: "Autism Spectrum Disorder",
      iepStatus: "Active",
      lastUpdated: "Oct 5, 2024",
      photo: "/placeholder-student.jpg",
      initials: "ET"
    },
    {
      id: 2,
      name: "Alex Thompson", 
      age: 12,
      grade: "7th Grade",
      school: "Washington Middle School",
      primaryDisability: "ADHD",
      iepStatus: "Under Review",
      lastUpdated: "Sep 28, 2024",
      photo: "/placeholder-student2.jpg",
      initials: "AT"
    }
  ];

  const currentStudent = students[selectedStudent];

  const strengthsData = [
    { category: "Academic", items: ["Visual Learning", "Math Computation", "Reading Comprehension"] },
    { category: "Social", items: ["Peer Interaction", "Following Rules", "Turn-Taking"] },
    { category: "Communication", items: ["Expressive Language", "Following Directions"] },
    { category: "Motor Skills", items: ["Fine Motor Control", "Gross Motor Coordination"] }
  ];

  const needsData = [
    { category: "Academic Support", items: ["Extended Time", "Quiet Environment", "Visual Supports"] },
    { category: "Behavioral", items: ["Break Cards", "Movement Breaks", "Clear Expectations"] },
    { category: "Social Skills", items: ["Social Stories", "Peer Mediation", "Group Work Support"] },
    { category: "Communication", items: ["AAC Device", "Visual Schedule", "Processing Time"] }
  ];

  const preferences = [
    { category: "Learning Style", value: "Visual Learner" },
    { category: "Environment", value: "Quiet, Structured" },
    { category: "Motivation", value: "Praise, Stickers" },
    { category: "Interests", value: "Animals, Art, Music" }
  ];

  const goals = [
    { 
      area: "Reading", 
      goal: "Increase reading fluency to grade level", 
      progress: 65, 
      status: "In Progress",
      dueDate: "Dec 2024"
    },
    { 
      area: "Social Skills", 
      goal: "Initiate conversations with peers", 
      progress: 40, 
      status: "Needs Support",
      dueDate: "Nov 2024" 
    },
    { 
      area: "Self-Regulation", 
      goal: "Use coping strategies when frustrated", 
      progress: 80, 
      status: "Nearly Met",
      dueDate: "Oct 2024"
    }
  ];

  const services = [
    { service: "Speech Therapy", frequency: "2x/week", provider: "Ms. Johnson", status: "Active" },
    { service: "Occupational Therapy", frequency: "1x/week", provider: "Mr. Davis", status: "Active" },
    { service: "Counseling", frequency: "1x/month", provider: "Dr. Smith", status: "Active" },
    { service: "Resource Room", frequency: "Daily", provider: "Mrs. Wilson", status: "Active" }
  ];

  const accommodations = [
    { type: "Testing", description: "Extended time (1.5x)", status: "Approved" },
    { type: "Environment", description: "Preferential seating", status: "Approved" },
    { type: "Instruction", description: "Visual supports", status: "Approved" },
    { type: "Behavioral", description: "Break cards", status: "Pending" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Student Profiles</h1>
            <p className="text-muted-foreground">Manage your children's educational profiles and progress</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Student Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student, index) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(index)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedStudent === index ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.photo} />
                      <AvatarFallback>{student.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.grade} • {student.school}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={student.iepStatus === 'Active' ? 'default' : 'secondary'}>
                          {student.iepStatus}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Updated {student.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Profile Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="needs">Needs</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                  <CardDescription>Basic profile information for {currentStudent.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={currentStudent.name} readOnly />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input value={currentStudent.age} readOnly />
                    </div>
                    <div>
                      <Label>Grade</Label>
                      <Input value={currentStudent.grade} readOnly />
                    </div>
                    <div>
                      <Label>School</Label>
                      <Input value={currentStudent.school} readOnly />
                    </div>
                    <div>
                      <Label>Primary Disability</Label>
                      <Input value={currentStudent.primaryDisability} readOnly />
                    </div>
                    <div>
                      <Label>IEP Status</Label>
                      <div className="pt-2">
                        <Badge variant={currentStudent.iepStatus === 'Active' ? 'default' : 'secondary'}>
                          {currentStudent.iepStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile Information
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Learning Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {preferences.map((pref, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm font-medium">{pref.category}:</span>
                        <span className="text-sm text-muted-foreground">{pref.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/tools/iep-review">
                        <FileText className="h-4 w-4 mr-2" />
                        Review IEP
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/parent/meeting-prep">
                        <Calendar className="h-4 w-4 mr-2" />
                        Prep Meeting
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/tools/autism-accommodations">
                        <Target className="h-4 w-4 mr-2" />
                        Build Accommodations
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Strengths Tab */}
          <TabsContent value="strengths">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Student Strengths
                </CardTitle>
                <CardDescription>
                  Identify and track {currentStudent.name}'s strengths across different areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {strengthsData.map((category, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        {category.category === 'Academic' && <BookOpen className="h-4 w-4" />}
                        {category.category === 'Social' && <Users className="h-4 w-4" />}
                        {category.category === 'Communication' && <Globe className="h-4 w-4" />}
                        {category.category === 'Motor Skills' && <Gamepad2 className="h-4 w-4" />}
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Strength
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Needs Tab */}
          <TabsContent value="needs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Student Needs
                </CardTitle>
                <CardDescription>
                  Document support needs and accommodations for {currentStudent.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {needsData.map((category, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        {category.category === 'Academic Support' && <Calculator className="h-4 w-4" />}
                        {category.category === 'Behavioral' && <Brain className="h-4 w-4" />}
                        {category.category === 'Social Skills' && <Users className="h-4 w-4" />}
                        {category.category === 'Communication' && <Globe className="h-4 w-4" />}
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Need
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  IEP Goals Progress
                </CardTitle>
                <CardDescription>
                  Track progress on {currentStudent.name}'s IEP goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goals.map((goal, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{goal.area}</h3>
                        <Badge variant={
                          goal.status === 'Nearly Met' ? 'default' :
                          goal.status === 'In Progress' ? 'secondary' : 'destructive'
                        }>
                          {goal.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{goal.goal}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Due: {goal.dueDate}</span>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-500" />
                  Special Education Services
                </CardTitle>
                <CardDescription>
                  Current services and supports for {currentStudent.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{service.service}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.frequency} • Provider: {service.provider}
                        </p>
                      </div>
                      <Badge variant="default">{service.status}</Badge>
                    </div>
                  ))}
                </div>
                <Button className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Request New Service
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accommodations Tab */}
          <TabsContent value="accommodations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Accommodations & Modifications
                </CardTitle>
                <CardDescription>
                  Approved and pending accommodations for {currentStudent.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accommodations.map((accommodation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{accommodation.type}</h3>
                        <p className="text-sm text-muted-foreground">{accommodation.description}</p>
                      </div>
                      <Badge variant={accommodation.status === 'Approved' ? 'default' : 'secondary'}>
                        {accommodation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-6">
                  <Link to="/tools/autism-accommodations">
                    <Plus className="h-4 w-4 mr-2" />
                    Build New Accommodation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfiles;