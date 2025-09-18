import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { 
  Smile, 
  Heart, 
  Brain, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  AlertTriangle,
  Plus,
  Save,
  Eye,
  Download,
  Users,
  Clock,
  Star,
  BarChart3,
  Activity,
  Lightbulb,
  ChevronRight,
  Target,
  CheckCircle2,
  PlusCircle,
  FileText,
  Zap,
  Info,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { useState, useEffect } from "react";
import { StudentSelector } from "@/components/StudentSelector";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

interface EmotionEntry {
  id: string;
  emotion: string;
  intensity: number;
  notes: string;
  triggers: string[];
  timestamp: string;
  student_id: string;
}

interface EmotionPattern {
  emotion: string;
  frequency: number;
  trend: 'up' | 'down' | 'stable';
  avgIntensity: number;
}

const EMOTIONS = [
  { name: 'Happy', emoji: '😊', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300', value: 'happy' },
  { name: 'Excited', emoji: '🤩', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300', value: 'excited' },
  { name: 'Calm', emoji: '😌', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300', value: 'calm' },
  { name: 'Okay', emoji: '😐', color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300', value: 'okay' },
  { name: 'Confused', emoji: '😕', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300', value: 'confused' },
  { name: 'Worried', emoji: '😟', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300', value: 'worried' },
  { name: 'Frustrated', emoji: '😠', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300', value: 'frustrated' },
  { name: 'Sad', emoji: '😢', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300', value: 'sad' },
  { name: 'Overwhelmed', emoji: '😵', color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300', value: 'overwhelmed' },
  { name: 'Anxious', emoji: '😰', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300', value: 'anxious' }
];

const COMMON_TRIGGERS = [
  'School work', 'Tests/Exams', 'Social situations', 'Changes in routine', 'Loud noises',
  'Transitions', 'New environments', 'Homework', 'Peer interactions', 'Teacher feedback',
  'Family time', 'Free time', 'Physical activities', 'Art/Music', 'Technology time'
];

const INTENSITY_LABELS = {
  1: 'Very Low',
  2: 'Low', 
  3: 'Moderate',
  4: 'High',
  5: 'Very High'
};

export default function ParentEmotionTracker() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    emotion: '',
    intensity: 3,
    notes: '',
    triggers: [] as string[]
  });
  const [savingEntry, setSavingEntry] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Mock data for demonstration
  useEffect(() => {
    const mockEntries: EmotionEntry[] = [
      {
        id: '1',
        emotion: 'happy',
        intensity: 4,
        notes: 'Great day at school! Loved art class.',
        triggers: ['Art/Music', 'Free time'],
        timestamp: new Date().toISOString(),
        student_id: selectedStudentId
      },
      {
        id: '2', 
        emotion: 'worried',
        intensity: 3,
        notes: 'Nervous about math test tomorrow.',
        triggers: ['Tests/Exams', 'School work'],
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        student_id: selectedStudentId
      },
      {
        id: '3',
        emotion: 'excited',
        intensity: 5,
        notes: 'Field trip announcement!',
        triggers: ['New environments', 'School work'],
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        student_id: selectedStudentId
      }
    ];
    setEntries(mockEntries);
  }, [selectedStudentId]);

  const handleEmotionSelect = (emotion: string) => {
    setNewEntry(prev => ({ ...prev, emotion }));
  };

  const handleTriggerToggle = (trigger: string) => {
    setNewEntry(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }));
  };

  const handleSaveEntry = async () => {
    if (!selectedStudentId || selectedStudentId === 'no-student') {
      toast({
        title: "Student Required",
        description: "Please select a student before recording emotions.",
        variant: "destructive",
      });
      return;
    }

    if (!newEntry.emotion) {
      toast({
        title: "Emotion Required", 
        description: "Please select an emotion to record.",
        variant: "destructive",
      });
      return;
    }

    setSavingEntry(true);
    
    try {
      const entryData = {
        ...newEntry,
        timestamp: selectedDate.toISOString(),
        student_id: selectedStudentId,
        id: Date.now().toString()
      };

      setEntries(prev => [entryData, ...prev]);
      setNewEntry({ emotion: '', intensity: 3, notes: '', triggers: [] });
      
      toast({
        title: "Emotion Recorded!",
        description: "The emotional check-in has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving emotion entry:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the emotion entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingEntry(false);
    }
  };

  const getEmotionConfig = (emotionValue: string) => {
    return EMOTIONS.find(e => e.value === emotionValue) || EMOTIONS[0];
  };

  const getEmotionPatterns = (): EmotionPattern[] => {
    const emotionCounts = entries.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      frequency: count,
      trend: 'stable' as const, // Simplified for demo
      avgIntensity: entries.filter(e => e.emotion === emotion).reduce((sum, e) => sum + e.intensity, 0) / count
    })).sort((a, b) => b.frequency - a.frequency);
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedWeek);
    const end = endOfWeek(selectedWeek);
    return eachDayOfInterval({ start, end });
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 2) return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
    if (intensity <= 3) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Heart className="h-10 w-10 text-pink-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Emotion Tracker
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Track your child's emotional well-being and behavioral patterns to support their success
            </p>
            <div className="flex justify-center space-x-2">
              <Badge className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 border-pink-300">
                Daily Tracking
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Pattern Analysis
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                Family Wellness
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Select Student
                </CardTitle>
                <CardDescription>
                  Choose the student whose emotions you want to track
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="student-select">Student</Label>
                  <StudentSelector
                    selectedStudent={selectedStudentId}
                    onStudentChange={setSelectedStudentId}
                    placeholder="Choose your child..."
                    data-testid="select-student"
                  />
                  {selectedStudentId && selectedStudentId !== 'no-student' && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Tracking emotions for this student. Ready to record their feelings!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Today's Check-in */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  Today's Emotional Check-in
                </CardTitle>
                <CardDescription>
                  How is your child feeling today?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Emotion Selection */}
                <div>
                  <Label className="text-base font-medium">Select Emotion</Label>
                  <div className="grid grid-cols-5 gap-3 mt-3">
                    {EMOTIONS.map((emotion) => (
                      <Button
                        key={emotion.value}
                        variant={newEntry.emotion === emotion.value ? "default" : "outline"}
                        onClick={() => handleEmotionSelect(emotion.value)}
                        className={cn(
                          "h-20 flex flex-col items-center justify-center space-y-1 transition-all",
                          newEntry.emotion === emotion.value 
                            ? "ring-2 ring-blue-500 shadow-lg" 
                            : "hover:shadow-md"
                        )}
                        data-testid={`emotion-${emotion.value}`}
                      >
                        <span className="text-2xl">{emotion.emoji}</span>
                        <span className="text-xs font-medium">{emotion.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div>
                  <Label className="text-base font-medium">Intensity Level</Label>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Very Low</span>
                      <span className="text-sm font-medium">{INTENSITY_LABELS[newEntry.intensity as keyof typeof INTENSITY_LABELS]}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Very High</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newEntry.intensity}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      data-testid="intensity-slider"
                    />
                    <div className="flex justify-between mt-1">
                      {[1, 2, 3, 4, 5].map(num => (
                        <div key={num} className={cn(
                          "w-2 h-2 rounded-full",
                          num <= newEntry.intensity ? "bg-blue-500" : "bg-gray-300"
                        )} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Triggers */}
                <div>
                  <Label className="text-base font-medium">What might have triggered this feeling?</Label>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {COMMON_TRIGGERS.map((trigger) => (
                      <Button
                        key={trigger}
                        variant={newEntry.triggers.includes(trigger) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTriggerToggle(trigger)}
                        className="text-xs justify-start"
                        data-testid={`trigger-${trigger.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                      >
                        {trigger}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="emotion-notes" className="text-base font-medium">Additional Notes</Label>
                  <Textarea
                    id="emotion-notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional details about how your child is feeling..."
                    rows={3}
                    className="mt-2"
                    data-testid="emotion-notes"
                  />
                </div>

                <Button
                  onClick={handleSaveEntry}
                  disabled={savingEntry || !selectedStudentId || selectedStudentId === 'no-student' || !newEntry.emotion}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-lg"
                  data-testid="save-emotion"
                >
                  {savingEntry ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Record Emotion
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Pattern View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  This Week's Emotional Pattern
                </CardTitle>
                <CardDescription>
                  Emotional trends over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {getWeekDays().map((day, index) => {
                      const dayEntries = entries.filter(entry => 
                        isSameDay(new Date(entry.timestamp), day)
                      );
                      const avgIntensity = dayEntries.length > 0 
                        ? dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length
                        : 0;
                      
                      return (
                        <div key={index} className="text-center">
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            {format(day, 'EEE')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                            {format(day, 'M/d')}
                          </div>
                          <div className={cn(
                            "h-16 rounded-lg flex items-center justify-center",
                            dayEntries.length > 0 
                              ? getIntensityColor(avgIntensity)
                              : "bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600"
                          )}>
                            {dayEntries.length > 0 ? (
                              <div className="text-center">
                                <div className="text-lg">{getEmotionConfig(dayEntries[0].emotion).emoji}</div>
                                <div className="text-xs font-medium">{dayEntries.length}</div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs">No data</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {entries.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• Overall positive emotions this week! 🌟</p>
                      <p>• Some challenges midweek - normal pattern</p>
                      <p>• Good emotional regulation overall</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-green-600" />
                  Recent Emotional Entries
                </CardTitle>
                <CardDescription>
                  Latest recorded emotions and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length > 0 ? (
                  <div className="space-y-4">
                    {entries.slice(0, 5).map((entry) => {
                      const emotionConfig = getEmotionConfig(entry.emotion);
                      return (
                        <Card key={entry.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">{emotionConfig.emoji}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium capitalize">{emotionConfig.name}</h4>
                                    <Badge className={getIntensityColor(entry.intensity)}>
                                      Intensity: {INTENSITY_LABELS[entry.intensity as keyof typeof INTENSITY_LABELS]}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {entry.notes}
                                  </p>
                                  {entry.triggers.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {entry.triggers.map((trigger, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {trigger}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No Entries Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start tracking your child's emotions to see patterns and insights here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Emotion Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Emotion Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length > 0 ? (
                  <div className="space-y-4">
                    {getEmotionPatterns().slice(0, 5).map((pattern) => {
                      const emotionConfig = getEmotionConfig(pattern.emotion);
                      return (
                        <div key={pattern.emotion} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{emotionConfig.emoji}</span>
                            <span className="font-medium capitalize">{emotionConfig.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{pattern.frequency} times</div>
                            <div className="text-xs text-gray-500">
                              Avg: {pattern.avgIntensity.toFixed(1)}/5
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Patterns will appear as you track emotions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Helpful Strategies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Helpful Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <h5 className="font-medium text-green-700 dark:text-green-300 mb-1">Deep Breathing</h5>
                    <p className="text-sm text-green-600 dark:text-green-400">Practice together for 5 minutes</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Calm-Down Corner</h5>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Create a quiet space at home</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                    <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Movement Breaks</h5>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Physical activity helps regulation</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                    <h5 className="font-medium text-orange-700 dark:text-orange-300 mb-1">Gratitude Sharing</h5>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Three good things each day</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/schedule')}
                  data-testid="button-view-schedule"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/autism-accommodations')}
                  data-testid="button-accommodations"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Accommodations
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/goal-generator')}
                  data-testid="button-goals"
                >
                  <Target className="h-4 w-4 mr-2" />
                  IEP Goals
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-generate-report"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  This Week's Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Check in daily:</strong> Record emotions at least once per day for better patterns.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Star className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Celebrate progress:</strong> Notice and acknowledge positive emotional moments.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}