import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Clock, CheckCircle, Plus, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";

const defaultScheduleItems = [
  {
    id: 1,
    time: "Morning (7:00-9:00 AM)",
    activity: "Morning Check-in",
    description: "Quick emotional state check and prep for the day",
    frequency: "Daily",
    completed: false
  },
  {
    id: 2,
    time: "After School (3:30-4:00 PM)",
    activity: "School Day Debrief",
    description: "Discuss highlights, challenges, and emotions from school",
    frequency: "Daily",
    completed: false
  },
  {
    id: 3,
    time: "Before Bed (8:00-8:30 PM)",
    activity: "Evening Reflection",
    description: "Process the day and prepare emotionally for tomorrow",
    frequency: "Daily",
    completed: false
  },
  {
    id: 4,
    time: "Weekly (Sunday evening)",
    activity: "Week Review",
    description: "Comprehensive review of patterns, wins, and areas for growth",
    frequency: "Weekly",
    completed: false
  }
];

const checkInQuestions = [
  "How are you feeling right now? (1-10 scale)",
  "What's one thing you're excited about today?",
  "Is there anything worrying you?",
  "What support do you need from me today?",
  "How did you sleep last night?",
  "What would make today great for you?"
];

export default function SupportSchedule() {
  const [scheduleItems, setScheduleItems] = useState(defaultScheduleItems);
  const [newNote, setNewNote] = useState("");

  const toggleCompleted = (id: number) => {
    setScheduleItems(items => 
      items.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = scheduleItems.filter(item => item.completed).length;
  const completionRate = Math.round((completedCount / scheduleItems.length) * 100);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" data-testid="button-back-dashboard" asChild>
              <Link to="/parent/dashboard-free">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Calendar className="h-8 w-8 text-green-600" />
                Support Schedule
              </h1>
              <p className="text-muted-foreground">
                Daily check-ins and routine management for emotional support
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-600" />
                  Today's Progress
                </CardTitle>
                <CardDescription>
                  {completedCount} of {scheduleItems.length} check-ins completed ({completionRate}%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {completionRate}% Complete
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Items */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Daily Support Schedule</h2>
              {scheduleItems.map((item) => (
                <Card key={item.id} className={`border-0 shadow-lg transition-all duration-200 ${
                  item.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-xl'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox 
                        checked={item.completed}
                        onCheckedChange={() => toggleCompleted(item.id)}
                        className="mt-1"
                        data-testid={`checkbox-item-${item.id}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm text-green-800">{item.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.frequency}
                          </Badge>
                        </div>
                        <h3 className={`font-semibold mb-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.activity}
                        </h3>
                        <p className={`text-sm ${item.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.description}
                        </p>
                        {item.completed && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Check-in Questions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  Check-in Questions
                </CardTitle>
                <CardDescription>
                  Helpful prompts for daily conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {checkInQuestions.map((question, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">{question}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Notes */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  Quick Notes
                </CardTitle>
                <CardDescription>
                  Jot down observations or insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add a note about today's check-ins, patterns you noticed, or reminders for tomorrow..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="textarea-notes"
                />
                <Button 
                  className="w-full mt-3" 
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would save to the database
                    console.log("Note saved:", newNote);
                    setNewNote("");
                  }}
                  data-testid="button-save-note"
                >
                  Save Note
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900">Daily Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-orange-800">
                    <strong>Consistency is key:</strong> Try to do check-ins at the same times each day to build routine.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-orange-800">
                    <strong>Listen actively:</strong> Give your child full attention during check-ins.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-orange-800">
                    <strong>Stay flexible:</strong> Adjust the schedule based on your child's needs and moods.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}