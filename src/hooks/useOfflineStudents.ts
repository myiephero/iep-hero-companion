// Offline-aware hook for student data management
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineSync, useOfflineAwareAPI } from '@/hooks/useOfflineSync';
import { storeStudentData, getAllStudents, getStudentData } from '@/lib/offlineStorage';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  grade?: string;
  disabilities?: string[];
  iepDate?: string;
  lastUpdated?: string;
  // Add other student fields as needed
}

export const useOfflineStudents = () => {
  const { user } = useAuth();
  const { isOnline, queueOperation } = useOfflineSync();
  const { makeRequest } = useOfflineAwareAPI();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load students (online + offline)
  const loadStudents = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to fetch from server first
        try {
          const response = await makeRequest('GET', '/api/students');
          const serverStudents = response.students || [];
          
          // Store in offline cache
          await Promise.all(
            serverStudents.map((student: Student) =>
              storeStudentData(student.id, student, user.id)
            )
          );
          
          setStudents(serverStudents);
        } catch (networkError) {
          console.warn('Network request failed, falling back to offline data');
          // Fall back to offline data
          const offlineStudents = await getAllStudents(user.id);
          setStudents(offlineStudents);
        }
      } else {
        // Load from offline storage
        const offlineStudents = await getAllStudents(user.id);
        setStudents(offlineStudents);
        
        if (offlineStudents.length === 0) {
          setError('No student data available offline. Please connect to load your students.');
        }
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load student data');
      
      // Try to load any available offline data as fallback
      try {
        const offlineStudents = await getAllStudents(user.id);
        setStudents(offlineStudents);
      } catch (offlineError) {
        console.error('Failed to load offline students:', offlineError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new student
  const createStudent = async (studentData: Omit<Student, 'id'>) => {
    if (!user?.id) throw new Error('User not authenticated');

    const tempId = `temp-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id: tempId,
      lastUpdated: new Date().toISOString()
    };

    try {
      if (isOnline) {
        // Try to create on server
        const response = await makeRequest('POST', '/api/students', newStudent);
        const serverStudent = response.student;
        
        // Store in offline cache
        await storeStudentData(serverStudent.id, serverStudent, user.id);
        
        // Update local state
        setStudents(prev => [...prev, serverStudent]);
        
        toast({
          title: "Student Added",
          description: `${studentData.name} has been added successfully.`,
          duration: 3000,
        });
        
        return serverStudent;
      } else {
        // Store offline and queue for sync
        await storeStudentData(tempId, newStudent, user.id);
        await queueOperation('create', '/api/students', newStudent);
        
        // Update local state
        setStudents(prev => [...prev, newStudent]);
        
        toast({
          title: "Student Added (Offline)",
          description: `${studentData.name} will be synced when you're back online.`,
          duration: 3000,
        });
        
        return newStudent;
      }
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  };

  // Update student
  const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    if (!user?.id) throw new Error('User not authenticated');

    const updatedStudent = {
      ...students.find(s => s.id === studentId),
      ...updates,
      lastUpdated: new Date().toISOString()
    } as Student;

    try {
      if (isOnline) {
        // Try to update on server
        const response = await makeRequest('PUT', `/api/students/${studentId}`, updatedStudent);
        const serverStudent = response.student;
        
        // Store in offline cache
        await storeStudentData(serverStudent.id, serverStudent, user.id);
        
        // Update local state
        setStudents(prev => prev.map(s => s.id === studentId ? serverStudent : s));
        
        toast({
          title: "Student Updated",
          description: "Changes saved successfully.",
          duration: 3000,
        });
        
        return serverStudent;
      } else {
        // Store offline and queue for sync
        await storeStudentData(studentId, updatedStudent, user.id);
        await queueOperation('update', `/api/students/${studentId}`, updatedStudent);
        
        // Update local state
        setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
        
        toast({
          title: "Student Updated (Offline)",
          description: "Changes will sync when you're back online.",
          duration: 3000,
        });
        
        return updatedStudent;
      }
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  };

  // Delete student
  const deleteStudent = async (studentId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      if (isOnline) {
        // Try to delete on server
        await makeRequest('DELETE', `/api/students/${studentId}`);
        
        // Remove from offline cache
        // Note: We'll implement removeStudentData in offlineStorage if needed
        
        // Update local state
        setStudents(prev => prev.filter(s => s.id !== studentId));
        
        toast({
          title: "Student Removed",
          description: "Student has been deleted successfully.",
          duration: 3000,
        });
      } else {
        // Queue for sync and remove locally
        await queueOperation('delete', `/api/students/${studentId}`, { id: studentId });
        
        // Update local state
        setStudents(prev => prev.filter(s => s.id !== studentId));
        
        toast({
          title: "Student Removed (Offline)",
          description: "Deletion will sync when you're back online.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  };

  // Get single student
  const getStudent = async (studentId: string): Promise<Student | null> => {
    try {
      // First check local state
      const localStudent = students.find(s => s.id === studentId);
      if (localStudent) return localStudent;

      if (isOnline) {
        // Try to fetch from server
        try {
          const response = await makeRequest('GET', `/api/students/${studentId}`);
          const serverStudent = response.student;
          
          // Store in offline cache
          if (user?.id) {
            await storeStudentData(serverStudent.id, serverStudent, user.id);
          }
          
          return serverStudent;
        } catch (networkError) {
          console.warn('Network request failed, checking offline storage');
        }
      }

      // Check offline storage
      const offlineStudent = await getStudentData(studentId);
      return offlineStudent;
    } catch (error) {
      console.error('Error getting student:', error);
      return null;
    }
  };

  // Load students on mount and when user/online status changes
  useEffect(() => {
    loadStudents();
  }, [user?.id, isOnline]);

  return {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    refreshStudents: loadStudents,
    isOffline: !isOnline
  };
};