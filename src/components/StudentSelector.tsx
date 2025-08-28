import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  grade_level?: string;
  iep_status?: string;
}

interface StudentSelectorProps {
  selectedStudentId: string | null;
  onStudentChange: (studentId: string | null) => void;
  onAddStudent?: () => void;
  className?: string;
}

export function StudentSelector({
  selectedStudentId,
  onStudentChange,
  onAddStudent,
  className = "",
}: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, grade_level, iep_status")
        .eq("user_id", user.id)
        .order("full_name");

      if (error) throw error;

      setStudents(data || []);
      
      // Auto-select first student if none selected
      if (data && data.length > 0 && !selectedStudentId) {
        onStudentChange(data[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-sm text-muted-foreground">No students yet</div>
        {onAddStudent && (
          <Button onClick={onAddStudent} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Student
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <User className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedStudentId || ""}
        onValueChange={(value) => onStudentChange(value || null)}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a student" />
        </SelectTrigger>
        <SelectContent>
          {students.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              <div className="flex items-center justify-between w-full">
                <span>{student.full_name}</span>
                {student.grade_level && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Grade {student.grade_level}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onAddStudent && (
        <Button onClick={onAddStudent} size="sm" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}