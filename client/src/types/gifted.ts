// Shared types for Gifted Snapshot module

export interface Strength {
  label: string;
  evidence?: string;
  level?: string;
}

export interface GiftedProfile {
  id: string;
  student_id: string;
  owner_id: string;
  domain: string;
  strengths: Strength[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GiftedGoal {
  id: string;
  student_id: string;
  owner_id: string;
  title: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  target_date?: string;
  resources_hint?: string;
  progress_note?: string;
  created_at: string;
  updated_at: string;
}

export interface GiftedResource {
  id: string;
  student_id: string;
  owner_id: string;
  kind: 'link' | 'file';
  title: string;
  url?: string;
  storage_path?: string;
  created_at: string;
}

export interface GiftedComment {
  id: string;
  goal_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface Student {
  id: string;
  name: string;
  parent_id: string;
  created_at: string;
}

// Input types for API calls
export interface ProfileInput {
  student_id: string;
  domain: string;
  strengths: Strength[];
  notes?: string;
}

export interface GoalInput {
  student_id: string;
  title: string;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  target_date?: string;
  resources_hint?: string;
  progress_note?: string;
}

export interface ResourceInput {
  student_id: string;
  kind: 'link' | 'file';
  title: string;
  url?: string;
  storage_path?: string;
}

export interface CommentInput {
  goal_id: string;
  text: string;
}