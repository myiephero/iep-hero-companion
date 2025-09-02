import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Smile, Heart, Brain, TrendingUp, Calendar, AlertTriangle, User, Save, FileText, Plus } from "lucide-react";

export default function EmotionTracker() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [currentMood, setCurrentMood] = useState("");
  const [moodNote, setMoodNote] = useState("");
  const [behaviorEntry, setBehaviorEntry] = useState("");
  const [interventionPlan, setInterventionPlan] = useState("");
  const { toast } = useToast();

  const students = [
    { id: "sarah-m", name: "Sarah M.", grade: "Grade 3" },
    { id: "alex-t", name: "Alex T.", grade: "Grade 5" },
    { id: "jordan-l", name: "Jordan L.", grade: "Grade 2" },
    { id: "taylor-w", name: "Taylor W.", grade: "Grade 4" }
  ];

  const handleRecordMood = () => {
    if (!selectedStudent) {
      toast({
        title: "Student Required",
        description: "Please select a student first.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Mood Recorded",
      description: `Mood entry saved for ${students.find(s => s.id === selectedStudent)?.name}`,
      variant: "default"
    });
    setCurrentMood("");
    setMoodNote("");
  };

  const handleBehaviorEntry = () => {
    if (!selectedStudent) {
      toast({
        title: "Student Required",
        description: "Please select a student first.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Behavior Entry Added",
      description: "Behavior observation has been recorded.",
      variant: "default"
    });
    setBehaviorEntry("");
  };

  const handleAnalyzeTrends = () => {
    if (!selectedStudent) {
      toast({
        title: "Student Required",
        description: "Please select a student first.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Analysis Generated",
      description: "Emotional trends analysis has been created and saved to document vault.",
      variant: "default"
    });
  };

  const handleCreateIntervention = () => {
    if (!selectedStudent) {
      toast({
        title: "Student Required",
        description: "Please select a student first.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Intervention Plan Created",
      description: "Professional intervention plan has been saved to student records.",
      variant: "default"
    });
    setInterventionPlan("");
  };

  const saveToVault = async (reportType: string, content: string) => {
    if (!selectedStudent) return;
    
    const studentName = students.find(s => s.id === selectedStudent)?.name;
    const timestamp = new Date().toLocaleDateString();
    
    toast({
      title: "Saved to Vault",
      description: `${reportType} for ${studentName} saved to document vault (${timestamp})`,
      variant: "default"
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Smile className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Emotion Tracker</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Student well-being monitoring tools with professional behavioral analysis and intervention planning.
          </p>
          <Badge className="bg-gradient-to-r from-success to-success-light text-success-foreground">
            Wellness Monitoring
          </Badge>
        </div>

        {/* Student Selector */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Select Student
            </CardTitle>
            <CardDescription>
              Choose the student to track emotional well-being
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} - {student.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStudent && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                ✓ Tracking: {students.find(s => s.id === selectedStudent)?.name}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Smile className="h-4 w-4 text-primary" />
                Daily Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={!selectedStudent}>
                    Record Mood
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Daily Mood</DialogTitle>
                    <DialogDescription>
                      Document the student's current emotional state
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Current Mood</Label>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {['😊', '😐', '😟', '😠', '😢'].map((emoji, index) => (
                          <Button
                            key={index}
                            variant={currentMood === emoji ? "default" : "outline"}
                            className="h-12 text-xl"
                            onClick={() => setCurrentMood(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="mood-note">Additional Notes</Label>
                      <Textarea
                        id="mood-note"
                        value={moodNote}
                        onChange={(e) => setMoodNote(e.target.value)}
                        placeholder="Any additional observations or context..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleRecordMood} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save Entry
                      </Button>
                      <Button
                        onClick={() => saveToVault('Mood Report', `Mood: ${currentMood} - ${moodNote}`)}
                        variant="outline"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Save to Vault
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-primary" />
                Behavior Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline" disabled={!selectedStudent}>
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Behavior Log Entry</DialogTitle>
                    <DialogDescription>
                      Record behavioral observations and incidents
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="behavior-entry">Behavior Observation</Label>
                      <Textarea
                        id="behavior-entry"
                        value={behaviorEntry}
                        onChange={(e) => setBehaviorEntry(e.target.value)}
                        placeholder="Describe the observed behavior, context, triggers, and interventions used..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleBehaviorEntry} className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                      <Button
                        onClick={() => saveToVault('Behavior Report', behaviorEntry)}
                        variant="outline"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Save to Vault
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                View Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={handleAnalyzeTrends}
                disabled={!selectedStudent}
              >
                Analyze Trends
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Intervention Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline" disabled={!selectedStudent}>
                    Create Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Intervention Plan</DialogTitle>
                    <DialogDescription>
                      Develop a professional intervention strategy
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="intervention-plan">Intervention Strategy</Label>
                      <Textarea
                        id="intervention-plan"
                        value={interventionPlan}
                        onChange={(e) => setInterventionPlan(e.target.value)}
                        placeholder="Outline specific interventions, goals, timeline, and success metrics..."
                        rows={5}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateIntervention} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Create Plan
                      </Button>
                      <Button
                        onClick={() => saveToVault('Intervention Plan', interventionPlan)}
                        variant="outline"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Save to Vault
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Emotion Dashboard */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Today's Emotional Status
              </CardTitle>
              <CardDescription>
                Current emotional well-being assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  <div className="text-center p-3 bg-green-100 rounded-lg">
                    <div className="text-2xl mb-1">😊</div>
                    <p className="text-xs">Happy</p>
                  </div>
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <div className="text-2xl mb-1">😐</div>
                    <p className="text-xs">Neutral</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-100 rounded-lg">
                    <div className="text-2xl mb-1">😟</div>
                    <p className="text-xs">Worried</p>
                  </div>
                  <div className="text-center p-3 bg-orange-100 rounded-lg">
                    <div className="text-2xl mb-1">😠</div>
                    <p className="text-xs">Angry</p>
                  </div>
                  <div className="text-center p-3 bg-red-100 rounded-lg">
                    <div className="text-2xl mb-1">😢</div>
                    <p className="text-xs">Sad</p>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Last recorded: 2 hours ago - "Feeling good after math success"
                  </p>
                  <Button className="w-full">Update Status</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Weekly Patterns
              </CardTitle>
              <CardDescription>
                Emotional trends and behavioral patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  <div className="h-8 bg-green-200 rounded"></div>
                  <div className="h-8 bg-green-300 rounded"></div>
                  <div className="h-8 bg-yellow-200 rounded"></div>
                  <div className="h-8 bg-green-200 rounded"></div>
                  <div className="h-8 bg-green-400 rounded"></div>
                  <div className="h-8 bg-blue-200 rounded"></div>
                  <div className="h-8 bg-green-200 rounded"></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Green: Positive emotions (5 days)</p>
                  <p>• Yellow: Neutral/Mixed (1 day)</p>
                  <p>• Blue: Calm/Relaxed (1 day)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intervention Tools */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4" />
                Coping Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Deep breathing exercises</li>
                <li>• Mindfulness techniques</li>
                <li>• Physical movement breaks</li>
                <li>• Positive self-talk</li>
              </ul>
              <Button size="sm" className="w-full mt-3">View All</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Warning Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Increased irritability</li>
                <li>• Social withdrawal</li>
                <li>• Academic regression</li>
                <li>• Sleep disruption</li>
              </ul>
              <Button size="sm" className="w-full mt-3" variant="outline">Monitor</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Support Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Morning check-in (9:00 AM)</li>
                <li>• Mid-day assessment (12:00 PM)</li>
                <li>• Afternoon support (3:00 PM)</li>
                <li>• Evening reflection (6:00 PM)</li>
              </ul>
              <Button size="sm" className="w-full mt-3" variant="outline">Adjust</Button>
            </CardContent>
          </Card>
        </div>

        {/* Professional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Analysis & Notes</CardTitle>
            <CardDescription>
              Behavioral observations and intervention recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Positive Progress Note</h4>
                  <span className="text-xs text-muted-foreground">Jan 15, 2024</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Student showed significant improvement in emotional regulation during math activities. 
                  Recommend continuing current coping strategies and increasing positive reinforcement.
                </p>
              </div>
              
              <div className="p-3 border rounded-lg bg-yellow-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Intervention Adjustment</h4>
                  <span className="text-xs text-muted-foreground">Jan 14, 2024</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Increased anxiety noted during transitions. Implementing visual schedule and 
                  advance warnings. Monitor for 2 weeks before next adjustment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}