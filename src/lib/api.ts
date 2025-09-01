// API client to replace Supabase calls  
// Use relative path since we're on the same domain
const API_BASE = '/api';

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
      // Get the current user's auth token from local storage or session
      const getCurrentRole = () => {
        const path = window.location.pathname;
        if (path.includes('/advocate/')) return 'advocate';
        if (path.includes('/parent/')) return 'parent';
        const savedRole = localStorage.getItem('miephero_active_role');
        return savedRole || 'parent';
      };

      const currentRole = getCurrentRole();
      const authToken = `mock-token-${currentRole}`;

      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
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

export const api = new ApiClient();