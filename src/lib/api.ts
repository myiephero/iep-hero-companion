// API client to replace Supabase calls
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
  async getAIReviews(): Promise<AIReview[]> {
    return this.request('/ai_reviews');
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
}

export const api = new ApiClient();