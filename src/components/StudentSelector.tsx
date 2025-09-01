import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import { supabase } from "@/integrations/supabase/client"; // Removed during migration // Removed during migration
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  // Convert empty string to "no-student" for the Select component
  const selectValue = selectedStudent === "" ? "no-student" : selectedStudent;

  useEffect(() => {
    if (user) {
      setLoading(true);
      setStudents([]); // Clear existing students first
      fetchStudents();
    }
  }, [user?.id]); // Depend on user ID changes

  const fetchStudents = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/students?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer mock-token-${user.id}`,
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      console.log('StudentSelector: Fetched students for user', user.id, ':', data);
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
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
  );
}