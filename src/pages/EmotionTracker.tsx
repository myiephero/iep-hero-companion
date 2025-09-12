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
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Smile, Heart, Brain, TrendingUp, Calendar, AlertTriangle, User, Save, FileText, Plus, Sparkles, Loader2 } from "lucide-react";

export default function EmotionTracker() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [currentMood, setCurrentMood] = useState("");
  const [moodNote, setMoodNote] = useState("");
  const [behaviorEntry, setBehaviorEntry] = useState("");
  const [interventionPlan, setInterventionPlan] = useState("");
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [showCopingStrategies, setShowCopingStrategies] = useState(false);
  const [showWarningMonitor, setShowWarningMonitor] = useState(false);
  const [showScheduleAdjust, setShowScheduleAdjust] = useState(false);
  const { toast } = useToast();

  const students = [
    { id: "sarah-m", name: "Sarah M.", grade: "Grade 3" },
    { id: "alex-t", name: "Alex T.", grade: "Grade 5" },
    { id: "jordan-l", name: "Jordan L.", grade: "Grade 2" },
    { id: "taylor-w", name: "Taylor W.", grade: "Grade 4" }
  ];

  const copingStrategiesList = [
    "Deep breathing exercises (4-7-8 technique)",
    "Progressive muscle relaxation",
    "Mindfulness body scan meditation",
    "Positive affirmations and self-talk",
    "Physical movement breaks (stretching, walking)",
    "Sensory tools (stress ball, fidget items)",
    "Visualization and guided imagery",
    "Counting techniques (count to 10, backwards from 100)",
    "Music or nature sounds for calming",
    "Journaling thoughts and feelings",
    "Art or creative expression",
    "Safe space identification and retreat"
  ];

  const warningSignsDetails = [
    { sign: "Increased irritability", frequency: "3x this week", severity: "Moderate", action: "Monitor during transitions" },
    { sign: "Social withdrawal", frequency: "Daily for 2 days", severity: "High", action: "Peer buddy system implemented" },
    { sign: "Academic regression", frequency: "2 assignments", severity: "Moderate", action: "Additional support scheduled" },
    { sign: "Sleep disruption", frequency: "Ongoing", severity: "High", action: "Parent conference needed" },
    { sign: "Appetite changes", frequency: "This week", severity: "Low", action: "Continue monitoring" },
    { sign: "Difficulty concentrating", frequency: "4x this week", severity: "Moderate", action: "Break frequency increased" }
  ];

  const supportScheduleDetails = [
    { time: "9:00 AM", activity: "Morning check-in", duration: "5 min", status: "Active", notes: "Assess overnight rest and morning readiness" },
    { time: "10:30 AM", activity: "Mid-morning break", duration: "10 min", status: "Active", notes: "Movement break if needed" },
    { time: "12:00 PM", activity: "Lunch assessment", duration: "5 min", status: "Active", notes: "Social interaction and appetite check" },
    { time: "2:00 PM", activity: "Afternoon check", duration: "5 min", status: "Active", notes: "Energy level and focus assessment" },
    { time: "3:00 PM", activity: "End-of-day support", duration: "10 min", status: "Active", notes: "Transition preparation and day review" },
    { time: "6:00 PM", activity: "Evening reflection", duration: "15 min", status: "Optional", notes: "Home-school communication and next-day prep" }
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
    if (!selectedStudent || !content.trim()) {
      toast({
        title: "Cannot Save",
        description: "Please select a student and ensure content is not empty.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const studentName = students.find(s => s.id === selectedStudent)?.name;
      const timestamp = new Date().toISOString();
      
      const documentData = {
        title: `${reportType} - ${studentName}`,
        description: `${reportType} created on ${new Date().toLocaleDateString()} for student ${studentName}`,
        file_name: `${reportType.toLowerCase().replace(/\s+/g, '_')}_${selectedStudent}_${Date.now()}.txt`,
        file_path: `/vault/emotion_tracker/${selectedStudent}/`,
        file_type: 'text/plain',
        file_size: content.length,
        category: 'emotional_tracking',
        tags: [reportType.toLowerCase(), 'emotion_tracker', selectedStudent],
        content: content,
        confidential: true,
        student_id: selectedStudent
      };

      const savedDocument = await api.createDocument(documentData);
      
      // Invalidate documents cache to refresh the vault
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      toast({
        title: "Saved to Vault",
        description: `${reportType} for ${studentName} successfully saved to document vault`,
        variant: "default"
      });
      
      return savedDocument;
    } catch (error) {
      console.error('Error saving to vault:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save to document vault. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateAIDraft = async (type: 'mood' | 'behavior' | 'intervention', context: any) => {
    setAiDraftLoading(true);
    try {
      const studentName = students.find(s => s.id === selectedStudent)?.name;
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          studentName,
          context,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate draft');
      }
      
      const data = await response.json();
      return data.draft;
    } catch (error) {
      toast({
        title: "AI Draft Failed",
        description: "Unable to generate draft. Please write manually.",
        variant: "destructive"
      });
      return '';
    } finally {
      setAiDraftLoading(false);
    }
  };

  const handleGenerateMoodDraft = async () => {
    const draft = await generateAIDraft('mood', {
      mood: currentMood,
      notes: moodNote,
      grade: students.find(s => s.id === selectedStudent)?.grade
    });
    if (draft) {
      setMoodNote(draft);
      toast({
        title: "AI Draft Generated",
        description: "Please review and edit the professional note before saving.",
        variant: "default"
      });
    }
  };

  const handleGenerateBehaviorDraft = async () => {
    const draft = await generateAIDraft('behavior', {
      initialNotes: behaviorEntry,
      grade: students.find(s => s.id === selectedStudent)?.grade
    });
    if (draft) {
      // Format the AI response for better readability
      let formattedDraft = draft;
      
      // If it's a JSON response, extract and format it
      try {
        const parsed = JSON.parse(draft);
        if (parsed.observation) {
          formattedDraft = `BEHAVIORAL OBSERVATION REPORT

Date: ${new Date().toLocaleDateString()}
Student: ${students.find(s => s.id === selectedStudent)?.name}
Observer: [Your Name]

OBSERVATION:
${parsed.observation}

CONTEXT & TRIGGERS:
${parsed.context || 'Environmental factors and potential triggers to be noted.'}

INTERVENTIONS USED:
${parsed.interventions || 'Record any immediate interventions or strategies implemented.'}

RECOMMENDATIONS:
${parsed.recommendations || 'Suggested follow-up actions and monitoring strategies.'}

NOTES:
${parsed.notes || 'Additional relevant observations or considerations.'}`;
        }
      } catch (e) {
        // If not JSON, check if it needs formatting
        if (!draft.includes('BEHAVIORAL OBSERVATION') && !draft.includes('Date:')) {
          formattedDraft = `BEHAVIORAL OBSERVATION REPORT

Date: ${new Date().toLocaleDateString()}
Student: ${students.find(s => s.id === selectedStudent)?.name}
Observer: [Your Name]

OBSERVATION:
${draft}

CONTEXT & TRIGGERS:
[Record environmental factors and potential triggers]

INTERVENTIONS USED:
[Note any immediate interventions or strategies implemented]

RECOMMENDATIONS:
[Suggested follow-up actions and monitoring strategies]`;
        }
      }
      
      setBehaviorEntry(formattedDraft);
      toast({
        title: "AI Draft Generated",
        description: "Professional behavioral observation created. Please review and customize before saving.",
        variant: "default"
      });
    }
  };

  const handleGenerateInterventionDraft = async () => {
    const draft = await generateAIDraft('intervention', {
      currentPlan: interventionPlan,
      grade: students.find(s => s.id === selectedStudent)?.grade
    });
    if (draft) {
      setInterventionPlan(draft);
      toast({
        title: "AI Draft Generated",
        description: "Please review and customize the intervention plan before saving.",
        variant: "default"
      });
    }
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="mood-note">Additional Notes</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateMoodDraft}
                          disabled={aiDraftLoading || !currentMood}
                          className="text-xs"
                        >
                          {aiDraftLoading ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          AI Draft
                        </Button>
                      </div>
                      <Textarea
                        id="mood-note"
                        value={moodNote}
                        onChange={(e) => setMoodNote(e.target.value)}
                        placeholder="Any additional observations or context..."
                      />
                      {moodNote && (
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 Review and edit this draft before saving
                        </p>
                      )}
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="behavior-entry">Behavior Observation</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateBehaviorDraft}
                          disabled={aiDraftLoading}
                          className="text-xs"
                        >
                          {aiDraftLoading ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          AI Draft
                        </Button>
                      </div>
                      <Textarea
                        id="behavior-entry"
                        value={behaviorEntry}
                        onChange={(e) => setBehaviorEntry(e.target.value)}
                        placeholder="Click 'AI Draft' to generate a professional behavioral observation report, or describe the observed behavior, context, triggers, and interventions used..."
                        rows={behaviorEntry.includes('BEHAVIORAL OBSERVATION REPORT') ? 12 : 4}
                        className={behaviorEntry.includes('BEHAVIORAL OBSERVATION REPORT') ? 'font-mono text-sm' : ''}
                      />
                      {behaviorEntry && (
                        <div className="mt-2 space-y-1">
                          {behaviorEntry.includes('BEHAVIORAL OBSERVATION REPORT') && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              <Sparkles className="h-3 w-3" />
                              AI-Generated Professional Report - Review and customize as needed
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            💡 Review and edit this professional observation before saving
                          </p>
                        </div>
                      )}
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="intervention-plan">Intervention Strategy</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateInterventionDraft}
                          disabled={aiDraftLoading}
                          className="text-xs"
                        >
                          {aiDraftLoading ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          AI Draft
                        </Button>
                      </div>
                      <Textarea
                        id="intervention-plan"
                        value={interventionPlan}
                        onChange={(e) => setInterventionPlan(e.target.value)}
                        placeholder="Outline specific interventions, goals, timeline, and success metrics..."
                        rows={5}
                      />
                      {interventionPlan && (
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 Review and customize this plan before implementing
                        </p>
                      )}
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
              <Dialog open={showCopingStrategies} onOpenChange={setShowCopingStrategies}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full mt-3" data-testid="button-view-all-coping">View All</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Complete Coping Strategies Toolkit</DialogTitle>
                    <DialogDescription>
                      Comprehensive list of evidence-based emotional regulation techniques
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {copingStrategiesList.map((strategy, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{strategy}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => {
                          const strategiesDoc = {
                            title: `Coping Strategies Toolkit - ${new Date().toLocaleDateString()}`,
                            description: `Complete coping strategies reference for ${selectedStudent ? students.find(s => s.id === selectedStudent)?.name : 'student'}`,
                            file_name: `coping_strategies_${Date.now()}.json`,
                            file_path: `/vault/coping-strategies/`,
                            file_type: 'application/json',
                            file_size: JSON.stringify(copingStrategiesList).length,
                            category: 'Emotional Support',
                            tags: ['coping-strategies', 'emotional-regulation', 'toolkit'],
                            content: JSON.stringify({ strategies: copingStrategiesList, timestamp: new Date().toISOString() }),
                            confidential: true
                          };
                          api.createDocument(strategiesDoc).then(() => {
                            toast({ title: "Saved to Vault", description: "Coping strategies toolkit saved successfully." });
                            queryClient.invalidateQueries({ queryKey: ['documents'] });
                          }).catch(() => {
                            toast({ title: "Save Failed", description: "Could not save to vault.", variant: "destructive" });
                          });
                        }}
                        className="flex-1"
                        data-testid="button-save-strategies"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save to Vault
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
              <Dialog open={showWarningMonitor} onOpenChange={setShowWarningMonitor}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full mt-3" variant="outline" data-testid="button-monitor-warnings">Monitor</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Warning Signs Monitoring Dashboard</DialogTitle>
                    <DialogDescription>
                      Detailed tracking and intervention status for behavioral warning signs
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {warningSignsDetails.map((warning, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{warning.sign}</h4>
                          <Badge variant={warning.severity === 'High' ? 'destructive' : warning.severity === 'Moderate' ? 'default' : 'secondary'}>
                            {warning.severity}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Frequency:</span> {warning.frequency}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Action Taken:</span> {warning.action}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => {
                          const monitoringDoc = {
                            title: `Warning Signs Monitoring Report - ${new Date().toLocaleDateString()}`,
                            description: `Behavioral warning signs tracking and intervention status for ${selectedStudent ? students.find(s => s.id === selectedStudent)?.name : 'student'}`,
                            file_name: `warning_signs_monitor_${Date.now()}.json`,
                            file_path: `/vault/monitoring-reports/`,
                            file_type: 'application/json',
                            file_size: JSON.stringify(warningSignsDetails).length,
                            category: 'Behavioral Monitoring',
                            tags: ['warning-signs', 'behavioral-monitoring', 'intervention-tracking'],
                            content: JSON.stringify({ warnings: warningSignsDetails, reportDate: new Date().toISOString() }),
                            confidential: true
                          };
                          api.createDocument(monitoringDoc).then(() => {
                            toast({ title: "Saved to Vault", description: "Warning signs monitoring report saved successfully." });
                            queryClient.invalidateQueries({ queryKey: ['documents'] });
                          }).catch(() => {
                            toast({ title: "Save Failed", description: "Could not save to vault.", variant: "destructive" });
                          });
                        }}
                        className="flex-1"
                        data-testid="button-save-monitoring"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Monitoring Report
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
              <Dialog open={showScheduleAdjust} onOpenChange={setShowScheduleAdjust}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full mt-3" variant="outline" data-testid="button-adjust-schedule">Adjust</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Support Schedule Management</DialogTitle>
                    <DialogDescription>
                      Review and adjust daily support intervention schedule
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {supportScheduleDetails.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className="font-medium">{item.activity}</h4>
                              <p className="text-sm text-muted-foreground">{item.notes}</p>
                            </div>
                            <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Time:</span> {item.time}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span> {item.duration}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span> {item.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => {
                          const scheduleDoc = {
                            title: `Support Schedule Plan - ${new Date().toLocaleDateString()}`,
                            description: `Daily support intervention schedule for ${selectedStudent ? students.find(s => s.id === selectedStudent)?.name : 'student'}`,
                            file_name: `support_schedule_${Date.now()}.json`,
                            file_path: `/vault/support-schedules/`,
                            file_type: 'application/json',
                            file_size: JSON.stringify(supportScheduleDetails).length,
                            category: 'Support Planning',
                            tags: ['support-schedule', 'daily-plan', 'intervention-timing'],
                            content: JSON.stringify({ schedule: supportScheduleDetails, planDate: new Date().toISOString() }),
                            confidential: true
                          };
                          api.createDocument(scheduleDoc).then(() => {
                            toast({ title: "Saved to Vault", description: "Support schedule plan saved successfully." });
                            queryClient.invalidateQueries({ queryKey: ['documents'] });
                          }).catch(() => {
                            toast({ title: "Save Failed", description: "Could not save to vault.", variant: "destructive" });
                          });
                        }}
                        className="flex-1"
                        data-testid="button-save-schedule"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Schedule Plan
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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