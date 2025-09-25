import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key length:', supabaseAnonKey?.length)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Missing Supabase environment variables - URL: ${supabaseUrl}, Key: ${supabaseAnonKey ? 'present' : 'missing'}`)
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Should start with https://`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'iep-hero-web'
    }
  }
})

// Database type definitions based on your schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          role: string | null
          email_verified: boolean | null
          subscription_status: string | null
          subscription_plan: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          role?: string | null
          email_verified?: boolean | null
          subscription_status?: string | null
          subscription_plan?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          role?: string | null
          email_verified?: boolean | null
          subscription_status?: string | null
          subscription_plan?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      students: {
        Row: {
          id: string
          user_id: string
          parent_id: string | null
          full_name: string
          date_of_birth: string | null
          grade_level: string | null
          school_name: string | null
          district: string | null
          case_manager: string | null
          case_manager_email: string | null
          disability_category: string | null
          iep_date: string | null
          iep_status: string | null
          iep_workflow_stage: string | null
          next_review_date: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          medical_info: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          parent_id?: string | null
          full_name: string
          date_of_birth?: string | null
          grade_level?: string | null
          school_name?: string | null
          district?: string | null
          case_manager?: string | null
          case_manager_email?: string | null
          disability_category?: string | null
          iep_date?: string | null
          iep_status?: string | null
          iep_workflow_stage?: string | null
          next_review_date?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          medical_info?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          parent_id?: string | null
          full_name?: string
          date_of_birth?: string | null
          grade_level?: string | null
          school_name?: string | null
          district?: string | null
          case_manager?: string | null
          case_manager_email?: string | null
          disability_category?: string | null
          iep_date?: string | null
          iep_status?: string | null
          iep_workflow_stage?: string | null
          next_review_date?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          medical_info?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          student_id: string | null
          title: string
          description: string | null
          file_name: string
          file_path: string
          file_type: string | null
          file_size: number | null
          category: string | null
          tags: any | null
          content: string | null
          confidential: boolean | null
          uploaded_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          student_id?: string | null
          title: string
          description?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          file_size?: number | null
          category?: string | null
          tags?: any | null
          content?: string | null
          confidential?: boolean | null
          uploaded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          student_id?: string | null
          title?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          file_size?: number | null
          category?: string | null
          tags?: any | null
          content?: string | null
          confidential?: boolean | null
          uploaded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          student_id: string
          title: string
          description: string
          goal_type: string | null
          status: string | null
          target_date: string | null
          current_progress: number | null
          measurable_criteria: string | null
          data_collection: any | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          student_id: string
          title: string
          description: string
          goal_type?: string | null
          status?: string | null
          target_date?: string | null
          current_progress?: number | null
          measurable_criteria?: string | null
          data_collection?: any | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          student_id?: string
          title?: string
          description?: string
          goal_type?: string | null
          status?: string | null
          target_date?: string | null
          current_progress?: number | null
          measurable_criteria?: string | null
          data_collection?: any | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      autism_accommodations: {
        Row: {
          id: string
          user_id: string
          student_id: string | null
          title: string
          description: string
          category: string
          accommodation_type: string
          implementation_notes: string | null
          effectiveness_rating: number | null
          status: string | null
          sensory_profile: any | null
          communication_needs: any | null
          social_supports: any | null
          academic_supports: any | null
          behavioral_triggers: any | null
          environmental_modifications: any | null
          technology_supports: any | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          student_id?: string | null
          title: string
          description: string
          category: string
          accommodation_type: string
          implementation_notes?: string | null
          effectiveness_rating?: number | null
          status?: string | null
          sensory_profile?: any | null
          communication_needs?: any | null
          social_supports?: any | null
          academic_supports?: any | null
          behavioral_triggers?: any | null
          environmental_modifications?: any | null
          technology_supports?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          student_id?: string | null
          title?: string
          description?: string
          category?: string
          accommodation_type?: string
          implementation_notes?: string | null
          effectiveness_rating?: number | null
          status?: string | null
          sensory_profile?: any | null
          communication_needs?: any | null
          social_supports?: any | null
          academic_supports?: any | null
          behavioral_triggers?: any | null
          environmental_modifications?: any | null
          technology_supports?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      advocates: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          phone: string | null
          bio: string | null
          location: string | null
          specializations: any | null
          certifications: any | null
          education: string | null
          years_experience: number | null
          languages: any | null
          case_types: any | null
          rate_per_hour: number | null
          availability: string | null
          rating: number | null
          total_reviews: number | null
          verification_status: string | null
          status: string | null
          profile_image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          phone?: string | null
          bio?: string | null
          location?: string | null
          specializations?: any | null
          certifications?: any | null
          education?: string | null
          years_experience?: number | null
          languages?: any | null
          case_types?: any | null
          rate_per_hour?: number | null
          availability?: string | null
          rating?: number | null
          total_reviews?: number | null
          verification_status?: string | null
          status?: string | null
          profile_image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          bio?: string | null
          location?: string | null
          specializations?: any | null
          certifications?: any | null
          education?: string | null
          years_experience?: number | null
          languages?: any | null
          case_types?: any | null
          rate_per_hour?: number | null
          availability?: string | null
          rating?: number | null
          total_reviews?: number | null
          verification_status?: string | null
          status?: string | null
          profile_image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      ai_reviews: {
        Row: {
          id: string
          user_id: string
          student_id: string | null
          document_id: string | null
          review_type: string
          ai_analysis: any
          strengths: any | null
          areas_of_concern: any | null
          recommendations: any | null
          suggested_improvements: any | null
          action_items: any | null
          compliance_score: number | null
          priority_level: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          student_id?: string | null
          document_id?: string | null
          review_type: string
          ai_analysis: any
          strengths?: any | null
          areas_of_concern?: any | null
          recommendations?: any | null
          suggested_improvements?: any | null
          action_items?: any | null
          compliance_score?: number | null
          priority_level?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          student_id?: string | null
          document_id?: string | null
          review_type?: string
          ai_analysis?: any
          strengths?: any | null
          areas_of_concern?: any | null
          recommendations?: any | null
          suggested_improvements?: any | null
          action_items?: any | null
          compliance_score?: number | null
          priority_level?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      meetings: {
        Row: {
          id: string
          user_id: string
          student_id: string | null
          title: string
          description: string | null
          meeting_type: string | null
          scheduled_date: string
          duration: number | null
          location: string | null
          agenda: any | null
          attendees: any | null
          outcomes: string | null
          follow_up_actions: any | null
          notes: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          student_id?: string | null
          title: string
          description?: string | null
          meeting_type?: string | null
          scheduled_date: string
          duration?: number | null
          location?: string | null
          agenda?: any | null
          attendees?: any | null
          outcomes?: string | null
          follow_up_actions?: any | null
          notes?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          student_id?: string | null
          title?: string
          description?: string | null
          meeting_type?: string | null
          scheduled_date?: string
          duration?: number | null
          location?: string | null
          agenda?: any | null
          attendees?: any | null
          outcomes?: string | null
          follow_up_actions?: any | null
          notes?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']