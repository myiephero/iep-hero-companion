import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
// // import { supabase } from "@/integrations/supabase/client"; // Removed during migration // Removed during migration
import { useAuth } from "@/hooks/useAuth";
import { StudentManager } from "./StudentManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Student {
  id: string;
  full_name: string;
  grade_level: string;
  school_name: string;
  disability_category: string;
  iep_status: string;
}

interface StudentSelectorProps {
  selectedStudent: string;
  onStudentChange: (studentId: string) => void;
  placeholder?: string;
  allowEmpty?: boolean;
}

export function StudentSelector({ 
  selectedStudent, 
  onStudentChange, 
  placeholder = "Select a student...",
  allowEmpty = false 
}: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const { user } = useAuth();

  // Convert empty string to "no-student" for the Select component
  const selectValue = selectedStudent === "" ? "no-student" : selectedStudent;

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentCreate = () => {
    fetchStudents();
    setIsManageOpen(false);
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading students..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select value={selectValue} onValueChange={(value) => {
          // Handle the special "no-student" value by converting it to empty string
          onStudentChange(value === "no-student" ? "" : value);
        }}>
          <SelectTrigger className="bg-background border-border">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            {allowEmpty && (
              <SelectItem value="no-student">No student selected</SelectItem>
            )}
            {students.length === 0 ? (
              <SelectItem value="no-students-available" disabled>
                No students available
              </SelectItem>
            ) : (
              students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{student.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {student.grade_level ? `Grade ${student.grade_level}` : 'Grade not specified'} • {student.school_name || 'School not specified'}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manage Students
            </DialogTitle>
          </DialogHeader>
          <StudentManager 
            onStudentSelect={(student) => {
              if (student) {
                onStudentChange(student.id);
                handleStudentCreate();
              }
            }}
            selectedStudentId={selectedStudent}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}