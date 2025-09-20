// Offline-aware hook for goal management
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineSync, useOfflineAwareAPI } from '@/hooks/useOfflineSync';
import { storeGoalData, getAllGoals, getGoalData } from '@/lib/offlineStorage';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'behavioral' | 'social' | 'communication' | 'motor' | 'adaptive';
  priority: 'high' | 'medium' | 'low';
  targetDate?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  studentId: string;
  createdDate: string;
  lastUpdated: string;
  measurableObjectives?: string[];
  accommodations?: string[];
  progressNotes?: Array<{
    id: string;
    note: string;
    date: string;
    progress: number;
  }>;
}

export const useOfflineGoals = () => {
  const { user } = useAuth();
  const { isOnline, queueOperation } = useOfflineSync();
  const { makeRequest } = useOfflineAwareAPI();
  const { toast } = useToast();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load goals (online + offline)
  const loadGoals = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to fetch from server first
        try {
          const response = await makeRequest('GET', '/api/goals');
          const serverGoals = response.goals || [];
          
          // Store in offline cache
          await Promise.all(
            serverGoals.map((goal: Goal) =>
              storeGoalData(goal.id, goal, user.id)
            )
          );
          
          setGoals(serverGoals);
        } catch (networkError) {
          console.warn('Network request failed, falling back to offline data');
          // Fall back to offline data
          const offlineGoals = await getAllGoals(user.id);
          setGoals(offlineGoals);
        }
      } else {
        // Load from offline storage
        const offlineGoals = await getAllGoals(user.id);
        setGoals(offlineGoals);
        
        if (offlineGoals.length === 0) {
          setError('No goal data available offline. Please connect to load your goals.');
        }
      }
    } catch (err) {
      console.error('Error loading goals:', err);
      setError('Failed to load goal data');
      
      // Try to load any available offline data as fallback
      try {
        const offlineGoals = await getAllGoals(user.id);
        setGoals(offlineGoals);
      } catch (offlineError) {
        console.error('Failed to load offline goals:', offlineError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new goal
  const createGoal = async (goalData: Omit<Goal, 'id' | 'createdDate' | 'lastUpdated'>) => {
    if (!user?.id) throw new Error('User not authenticated');

    const tempId = `temp-goal-${Date.now()}`;
    const now = new Date().toISOString();
    const newGoal: Goal = {
      ...goalData,
      id: tempId,
      createdDate: now,
      lastUpdated: now,
      progress: goalData.progress || 0,
      progressNotes: []
    };

    try {
      if (isOnline) {
        // Try to create on server
        const response = await makeRequest('POST', '/api/goals', newGoal);
        const serverGoal = response.goal;
        
        // Store in offline cache
        await storeGoalData(serverGoal.id, serverGoal, user.id);
        
        // Update local state
        setGoals(prev => [...prev, serverGoal]);
        
        toast({
          title: "Goal Created",
          description: `"${goalData.title}" has been added successfully.`,
          duration: 3000,
        });
        
        return serverGoal;
      } else {
        // Store offline and queue for sync
        await storeGoalData(tempId, newGoal, user.id);
        await queueOperation('create', '/api/goals', newGoal);
        
        // Update local state
        setGoals(prev => [...prev, newGoal]);
        
        toast({
          title: "Goal Created (Offline)",
          description: `"${goalData.title}" will be synced when you're back online.`,
          duration: 3000,
        });
        
        return newGoal;
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  };

  // Update goal
  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!user?.id) throw new Error('User not authenticated');

    const updatedGoal = {
      ...goals.find(g => g.id === goalId),
      ...updates,
      lastUpdated: new Date().toISOString()
    } as Goal;

    try {
      if (isOnline) {
        // Try to update on server
        const response = await makeRequest('PUT', `/api/goals/${goalId}`, updatedGoal);
        const serverGoal = response.goal;
        
        // Store in offline cache
        await storeGoalData(serverGoal.id, serverGoal, user.id);
        
        // Update local state
        setGoals(prev => prev.map(g => g.id === goalId ? serverGoal : g));
        
        toast({
          title: "Goal Updated",
          description: "Changes saved successfully.",
          duration: 3000,
        });
        
        return serverGoal;
      } else {
        // Store offline and queue for sync
        await storeGoalData(goalId, updatedGoal, user.id);
        await queueOperation('update', `/api/goals/${goalId}`, updatedGoal);
        
        // Update local state
        setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
        
        toast({
          title: "Goal Updated (Offline)",
          description: "Changes will sync when you're back online.",
          duration: 3000,
        });
        
        return updatedGoal;
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  // Update goal progress
  const updateGoalProgress = async (goalId: string, progress: number, note?: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !user?.id) return;

    const progressNote = note ? {
      id: `note-${Date.now()}`,
      note,
      date: new Date().toISOString(),
      progress
    } : undefined;

    const updates: Partial<Goal> = {
      progress,
      lastUpdated: new Date().toISOString(),
      ...(progressNote && {
        progressNotes: [...(goal.progressNotes || []), progressNote]
      })
    };

    return updateGoal(goalId, updates);
  };

  // Get goals for specific student
  const getStudentGoals = (studentId: string) => {
    return goals.filter(goal => goal.studentId === studentId);
  };

  // Get goals by category
  const getGoalsByCategory = (category: Goal['category']) => {
    return goals.filter(goal => goal.category === category);
  };

  // Get active goals
  const getActiveGoals = () => {
    return goals.filter(goal => goal.status === 'active');
  };

  // Calculate overall progress for a student
  const getStudentProgress = (studentId: string) => {
    const studentGoals = getStudentGoals(studentId);
    if (studentGoals.length === 0) return 0;
    
    const totalProgress = studentGoals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / studentGoals.length);
  };

  // Load goals on mount and when user/online status changes
  useEffect(() => {
    loadGoals();
  }, [user?.id, isOnline]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    updateGoalProgress,
    getStudentGoals,
    getGoalsByCategory,
    getActiveGoals,
    getStudentProgress,
    refreshGoals: loadGoals,
    isOffline: !isOnline
  };
};