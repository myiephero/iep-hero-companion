// API client to replace Supabase calls
// Connect to the Express server running on port 3001
const API_BASE = 'http://localhost:3001/api';

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
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
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

  private getMockResponse(endpoint: string, method: string = 'GET'): any {
    // Students endpoints
    if (endpoint === '/students') {
      if (method === 'GET') {
        return [
          {
            id: "1",
            full_name: "Alex Johnson",
            grade_level: "3rd Grade", 
            school_name: "Roosevelt Elementary",
            iep_status: "Active",
            next_review_date: "2025-03-15",
            case_manager: "Ms. Smith",
            disability_category: "Autism Spectrum Disorder"
          },
          {
            id: "2",
            full_name: "Maria Garcia", 
            grade_level: "5th Grade",
            school_name: "Lincoln Elementary",
            iep_status: "Active",
            next_review_date: "2025-04-20",
            case_manager: "Mr. Johnson",
            disability_category: "Learning Disability"
          }
        ];
      }
      return { id: Date.now().toString(), message: "Student created" };
    }

    // Documents endpoints
    if (endpoint === '/documents') {
      if (method === 'GET') {
        return [
          {
            id: "1",
            title: "IEP Report - Alex Johnson",
            file_name: "alex_iep_2024.pdf",
            category: "IEP Document",
            created_at: "2024-12-01T10:00:00Z",
            file_path: "/documents/alex_iep_2024.pdf"
          },
          {
            id: "2", 
            title: "Progress Report - Maria Garcia",
            file_name: "maria_progress_q2.pdf",
            category: "Progress Report", 
            created_at: "2024-12-15T14:30:00Z",
            file_path: "/documents/maria_progress_q2.pdf"
          }
        ];
      }
      return { id: Date.now().toString(), message: "Document uploaded" };
    }

    // Other endpoints
    if (endpoint === '/autism_accommodations') {
      return [];
    }
    if (endpoint === '/ai_reviews') {
      return [];
    }
    if (endpoint === '/advocates') {
      return [];
    }

    if (endpoint === '/process-document') {
      return {
        analysis: "Document processing is temporarily disabled during migration. This is a mock response to prevent errors.",
        documentId: "mock-doc-id",
        reviewId: "mock-review-id"
      };
    }
    if (endpoint === '/analyze-document') {
      return {
        analysis: "Mock analysis during migration. Document analysis will be restored after migration completion.",
        timestamp: new Date().toISOString()
      };
    }
    if (endpoint === '/iep-ingest') {
      return {
        extractedTextLength: 1500,
        chunksCreated: 5
      };
    }
    if (endpoint === '/iep-analyze') {
      return {
        analysisId: "mock-analysis-id",
        status: "completed"
      };
    }
    if (endpoint === '/iep-action-draft') {
      return {
        draftId: "mock-draft-id",
        title: "Mock Action Draft",
        body: "This is a mock draft generated during migration. Full functionality will be restored after migration completion."
      };
    }
    if (endpoint === '/invite-parent') {
      return {
        userId: `mock-user-${Date.now()}`
      };
    }
    // Default mock response for other endpoints
    return { message: "Mock response during migration" };
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