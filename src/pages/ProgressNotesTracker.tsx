import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentSelector } from "@/components/StudentSelector";
import { useState } from "react";
import { TrendingUp, Plus, Calendar, Target, CheckCircle, Clock, BarChart3, FileText } from "lucide-react";

interface ProgressNote {
  id: string;
  studentId: string;
  date: string;
  category: string;
  goalArea: string;
  observation: string;
  progress: 'improving' | 'maintaining' | 'declining' | 'goal-met';
  nextSteps: string;
}

const progressCategories = [
  "Academic - Reading",
  "Academic - Math", 
  "Academic - Writing",
  "Communication",
  "Social Skills",
  "Behavior",
  "Fine Motor",
  "Gross Motor",
  "Independent Living",
  "Transition Skills"
];

export default function ProgressNotesTracker() {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    category: "",
    goalArea: "",
    observation: "",
    progress: "",
    nextSteps: ""
  });

  const handleAddNote = () => {
    if (!selectedStudent || !newNote.category || !newNote.observation) return;
    
    const note: ProgressNote = {
      id: `note-${Date.now()}`,
      studentId: selectedStudent,
      date: new Date().toISOString().split('T')[0],
      category: newNote.category,
      goalArea: newNote.goalArea,
      observation: newNote.observation,
      progress: newNote.progress as any,
      nextSteps: newNote.nextSteps
    };
    
    setNotes([note, ...notes]);
    setNewNote({
      category: "",
      goalArea: "",
      observation: "",
      progress: "",
      nextSteps: ""
    });
    setIsAddingNote(false);
  };

  const getProgressColor = (progress: string) => {
    switch(progress) {
      case 'improving': return 'text-green-600 bg-green-100';
      case 'maintaining': return 'text-blue-600 bg-blue-100';
      case 'declining': return 'text-red-600 bg-red-100';
      case 'goal-met': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressIcon = (progress: string) => {
    switch(progress) {
      case 'improving': return <TrendingUp className="h-4 w-4" />;
      case 'maintaining': return <Target className="h-4 w-4" />;
      case 'declining': return <TrendingUp className="h-4 w-4 rotate-180" />;
      case 'goal-met': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900">
            <TrendingUp className="h-8 w-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Progress Notes Tracker</h1>
            <p className="text-muted-foreground">Track your child's academic and behavioral progress</p>
          </div>
        </div>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Select Student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StudentSelector 
              selectedStudent={selectedStudent} 
              onStudentSelect={setSelectedStudent}
            />
          </CardContent>
        </Card>

        {selectedStudent && (
          <>
            {/* Add New Note */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Progress Notes</CardTitle>
                  <Button onClick={() => setIsAddingNote(!isAddingNote)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              
              {isAddingNote && (
                <CardContent className="space-y-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newNote.category} onValueChange={(value) => setNewNote({...newNote, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {progressCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Goal Area</Label>
                      <Input 
                        placeholder="Specific goal or skill area"
                        value={newNote.goalArea}
                        onChange={(e) => setNewNote({...newNote, goalArea: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Observation</Label>
                    <Textarea 
                      placeholder="Describe what you observed..."
                      value={newNote.observation}
                      onChange={(e) => setNewNote({...newNote, observation: e.target.value})}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Progress Status</Label>
                      <Select value={newNote.progress} onValueChange={(value) => setNewNote({...newNote, progress: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select progress" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="improving">Improving</SelectItem>
                          <SelectItem value="maintaining">Maintaining</SelectItem>
                          <SelectItem value="declining">Declining</SelectItem>
                          <SelectItem value="goal-met">Goal Met</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Next Steps</Label>
                      <Input 
                        placeholder="What to focus on next..."
                        value={newNote.nextSteps}
                        onChange={(e) => setNewNote({...newNote, nextSteps: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleAddNote}>Save Note</Button>
                    <Button variant="outline" onClick={() => setIsAddingNote(false)}>Cancel</Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600">No Progress Notes Yet</h3>
                    <p className="text-gray-500">Start tracking your child's progress by adding your first note</p>
                  </CardContent>
                </Card>
              ) : (
                notes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{note.date}</span>
                          </div>
                          <Badge variant="outline">{note.category}</Badge>
                          {note.goalArea && (
                            <Badge variant="secondary">{note.goalArea}</Badge>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${getProgressColor(note.progress)}`}>
                          {getProgressIcon(note.progress)}
                          <span className="text-sm font-medium capitalize">{note.progress.replace('-', ' ')}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Observation</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{note.observation}</p>
                        </div>
                        
                        {note.nextSteps && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Next Steps</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{note.nextSteps}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Summary Stats */}
            {notes.length > 0 && (
              <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Progress Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {notes.filter(n => n.progress === 'improving').length}
                      </div>
                      <div className="text-sm text-gray-600">Improving</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {notes.filter(n => n.progress === 'maintaining').length}
                      </div>
                      <div className="text-sm text-gray-600">Maintaining</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {notes.filter(n => n.progress === 'goal-met').length}
                      </div>
                      <div className="text-sm text-gray-600">Goals Met</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {notes.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Notes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}