// API client to replace Supabase calls  
// Dynamic API base URL that works for both web and mobile environments
import { getApiBaseUrl } from './apiConfig';

const getApiBase = () => getApiBaseUrl();

export interface Student {
  id?: string;
  user_id?: string;
  parent_id?: string;
  full_name: string;
  date_of_birth?: string;
  grade_level?: string;
  school_name?: string;
  district?: string;
  case_manager?: string;
  case_manager_email?: string;
  disability_category?: string;
  iep_date?: string;
  iep_status?: string;
  iep_workflow_stage?: string;
  next_review_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_info?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AutismAccommodation {
  id?: string;
  user_id?: string;
  student_id?: string;
  title: string;
  description: string;
  category: string;
  accommodation_type: string;
  implementation_notes?: string;
  effectiveness_rating?: number;
  status?: string;
  sensory_profile?: any;
  communication_needs?: any;
  social_supports?: any;
  academic_supports?: any;
  behavioral_triggers?: any;
  environmental_modifications?: any;
  technology_supports?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id?: string;
  user_id?: string;
  student_id?: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  category?: string;
  tags?: string[];
  confidential?: boolean;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Goal {
  id?: string;
  user_id?: string;
  student_id?: string;
  title: string;
  description: string;
  goal_type?: string;
  status?: string;
  target_date?: string;
  current_progress?: number;
  measurable_criteria?: string;
  data_collection?: any;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Meeting {
  id?: string;
  user_id?: string;
  student_id?: string;
  title: string;
  description?: string;
  meeting_type?: string;
  scheduled_date: string;
  duration?: number;
  location?: string;
  agenda?: any;
  attendees?: any;
  outcomes?: string;
  follow_up_actions?: any;
  notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AIReview {
  id?: string;
  user_id?: string;
  student_id?: string;
  document_id?: string;
  review_type: string;
  ai_analysis: any;
  strengths?: any;
  areas_of_concern?: any;
  recommendations?: any;
  suggested_improvements?: any;
  action_items?: any;
  compliance_score?: number;
  priority_level?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Advocate {
  id?: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  specializations?: string[];
  certifications?: string[];
  education?: string;
  years_experience?: number;
  languages?: string[];
  case_types?: string[];
  rate_per_hour?: number;
  availability?: string;
  rating?: number;
  total_reviews?: number;
  verification_status?: string;
  status?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      // Get real authentication token from localStorage
      const authToken = localStorage.getItem('authToken');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };
      
      // Add Authorization header only if we have a token
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const apiBase = getApiBase();
      const fullUrl = `${apiBase}${endpoint}`;
      
      console.log('🔗 API Client - Making request to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        credentials: 'include', // Include cookies for session-based auth
        headers,
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is expired or invalid - clear it and redirect to login
          console.log('🚫 API call failed with 401 - clearing expired token');
          localStorage.removeItem('authToken');
          
          // Only redirect if we're not already on a public page
          const currentPath = window.location.pathname;
          const publicPaths = ['/parent/pricing', '/advocate/pricing', '/', '/auth', '/login'];
          const isPublicPage = publicPaths.some(path => currentPath === path || currentPath.includes(path));
          
          if (!isPublicPage) {
            window.location.replace('/m/auth');
          }
        }
        
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }


  // Students
  async getStudents(): Promise<Student[]> {
    return this.request('/students');
  }

  async createStudent(student: Omit<Student, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Student> {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  }

  // Autism Accommodations
  async getAutismAccommodations(): Promise<AutismAccommodation[]> {
    return this.request('/autism_accommodations');
  }

  async createAutismAccommodation(accommodation: Omit<AutismAccommodation, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AutismAccommodation> {
    return this.request('/autism_accommodations', {
      method: 'POST',
      body: JSON.stringify(accommodation),
    });
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    return this.request('/documents');
  }

  async createDocument(document: Omit<Document, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Document> {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<Document> {
    return this.request(`/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteDocument(documentId: string): Promise<void> {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // AI Reviews
  async getAIReviews(documentId?: string): Promise<AIReview[]> {
    const endpoint = documentId ? `/ai_reviews?document_id=${documentId}` : '/ai_reviews';
    return this.request(endpoint);
  }

  async createAIReview(review: Omit<AIReview, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AIReview> {
    return this.request('/ai_reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // Matching
  async getMatchProposals(): Promise<any[]> {
    const response = await this.request('/match');
    return response.proposals || [];
  }

  async getAdvocateProposals(): Promise<any[]> {
    const response = await this.request('/match/advocate');
    return response.proposals || [];
  }

  async createMatchProposal(studentId: string, advocateIds: string[], reason?: any): Promise<any> {
    return this.request('/match/propose', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        advocate_ids: advocateIds,
        reason
      }),
    });
  }

  async requestIntroCall(proposalId: string, scheduledAt?: Date, notes?: string): Promise<any> {
    return this.request(`/match/${proposalId}/intro`, {
      method: 'POST',
      body: JSON.stringify({
        when_ts: scheduledAt?.toISOString(),
        notes
      }),
    });
  }

  async acceptProposal(proposalId: string): Promise<any> {
    return this.request(`/match/${proposalId}/accept`, {
      method: 'POST',
    });
  }

  async declineProposal(proposalId: string, reason?: string): Promise<any> {
    return this.request(`/match/${proposalId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async deleteAIReview(reviewId: string): Promise<void> {
    return this.request(`/ai_reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return this.request('/goals');
  }

  async createGoal(goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    return this.request(`/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Meetings
  async getMeetings(): Promise<Meeting[]> {
    return this.request('/meetings');
  }

  async createMeeting(meeting: Omit<Meeting, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Meeting> {
    return this.request('/meetings', {
      method: 'POST',
      body: JSON.stringify(meeting),
    });
  }

  // Advocates
  async getAdvocates(): Promise<Advocate[]> {
    return this.request('/advocates');
  }

  async createAdvocate(advocate: Omit<Advocate, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Advocate> {
    return this.request('/advocates', {
      method: 'POST',
      body: JSON.stringify(advocate),
    });
  }

  // Document processing methods (replacing Supabase Edge Functions)
  async processDocument(data: { fileName: string; fileContent: string; analysisType: string }): Promise<any> {
    return this.request('/process-document', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async analyzeDocument(documentText: string, analysisType: string): Promise<any> {
    return this.request('/analyze-document', {
      method: 'POST',
      body: JSON.stringify({ documentText, analysisType })
    });
  }

  async ingestIEP(docId: string): Promise<any> {
    return this.request('/iep-ingest', {
      method: 'POST',
      body: JSON.stringify({ docId })
    });
  }

  async analyzeIEP(docId: string, kind: string, studentContext?: string): Promise<any> {
    return this.request('/iep-analyze', {
      method: 'POST',
      body: JSON.stringify({ docId, kind, studentContext })
    });
  }

  async createActionDraft(analysisId: string, templateType: string, userInputs?: any): Promise<any> {
    return this.request('/iep-action-draft', {
      method: 'POST',
      body: JSON.stringify({ analysisId, templateType, userInputs })
    });
  }

  async inviteParent(email: string, firstName: string, lastName: string): Promise<any> {
    return this.request('/invite-parent', {
      method: 'POST',
      body: JSON.stringify({ email, firstName, lastName })
    });
  }

}

export { ApiClient };
export const api = new ApiClient();