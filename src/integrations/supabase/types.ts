export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          category: string | null
          created_at: string
          description: string
          effectiveness_rating: number | null
          id: string
          implementation_notes: string | null
          status: string | null
          student_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          effectiveness_rating?: number | null
          id?: string
          implementation_notes?: string | null
          status?: string | null
          student_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          effectiveness_rating?: number | null
          id?: string
          implementation_notes?: string | null
          status?: string | null
          student_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      advocate_requests: {
        Row: {
          advocate_id: string
          budget_range: string | null
          created_at: string
          id: string
          message: string
          parent_id: string
          preferred_contact_method: string | null
          responded_at: string | null
          response_message: string | null
          status: string | null
          student_id: string | null
          subject: string
          updated_at: string
          urgency_level: string | null
        }
        Insert: {
          advocate_id: string
          budget_range?: string | null
          created_at?: string
          id?: string
          message: string
          parent_id: string
          preferred_contact_method?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          student_id?: string | null
          subject: string
          updated_at?: string
          urgency_level?: string | null
        }
        Update: {
          advocate_id?: string
          budget_range?: string | null
          created_at?: string
          id?: string
          message?: string
          parent_id?: string
          preferred_contact_method?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          student_id?: string | null
          subject?: string
          updated_at?: string
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advocate_requests_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "advocate_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      advocates: {
        Row: {
          availability: string | null
          bio: string | null
          case_types: string[] | null
          certifications: string[] | null
          created_at: string
          education: string | null
          email: string
          full_name: string
          id: string
          languages: string[] | null
          location: string | null
          phone: string | null
          profile_image_url: string | null
          rate_per_hour: number | null
          rating: number | null
          specializations: string[] | null
          status: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          case_types?: string[] | null
          certifications?: string[] | null
          created_at?: string
          education?: string | null
          email: string
          full_name: string
          id?: string
          languages?: string[] | null
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          rate_per_hour?: number | null
          rating?: number | null
          specializations?: string[] | null
          status?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          bio?: string | null
          case_types?: string[] | null
          certifications?: string[] | null
          created_at?: string
          education?: string | null
          email?: string
          full_name?: string
          id?: string
          languages?: string[] | null
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          rate_per_hour?: number | null
          rating?: number | null
          specializations?: string[] | null
          status?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      ai_reviews: {
        Row: {
          action_items: Json | null
          ai_analysis: Json
          areas_of_concern: Json | null
          compliance_score: number | null
          created_at: string
          document_id: string | null
          id: string
          priority_level: string | null
          recommendations: Json | null
          review_type: string
          status: string | null
          strengths: Json | null
          student_id: string | null
          suggested_improvements: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          ai_analysis: Json
          areas_of_concern?: Json | null
          compliance_score?: number | null
          created_at?: string
          document_id?: string | null
          id?: string
          priority_level?: string | null
          recommendations?: Json | null
          review_type: string
          status?: string | null
          strengths?: Json | null
          student_id?: string | null
          suggested_improvements?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_items?: Json | null
          ai_analysis?: Json
          areas_of_concern?: Json | null
          compliance_score?: number | null
          created_at?: string
          document_id?: string | null
          id?: string
          priority_level?: string | null
          recommendations?: Json | null
          review_type?: string
          status?: string | null
          strengths?: Json | null
          student_id?: string | null
          suggested_improvements?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_reviews_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          id: string
          record_id: string
          table_name: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          record_id: string
          table_name: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          record_id?: string
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      autism_accommodations: {
        Row: {
          academic_supports: Json | null
          accommodation_type: string
          behavioral_triggers: Json | null
          category: string
          communication_needs: Json | null
          created_at: string
          description: string
          effectiveness_rating: number | null
          environmental_modifications: Json | null
          id: string
          implementation_notes: string | null
          sensory_profile: Json | null
          social_supports: Json | null
          status: string | null
          student_id: string | null
          technology_supports: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_supports?: Json | null
          accommodation_type: string
          behavioral_triggers?: Json | null
          category: string
          communication_needs?: Json | null
          created_at?: string
          description: string
          effectiveness_rating?: number | null
          environmental_modifications?: Json | null
          id?: string
          implementation_notes?: string | null
          sensory_profile?: Json | null
          social_supports?: Json | null
          status?: string | null
          student_id?: string | null
          technology_supports?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_supports?: Json | null
          accommodation_type?: string
          behavioral_triggers?: Json | null
          category?: string
          communication_needs?: Json | null
          created_at?: string
          description?: string
          effectiveness_rating?: number | null
          environmental_modifications?: Json | null
          id?: string
          implementation_notes?: string | null
          sensory_profile?: Json | null
          social_supports?: Json | null
          status?: string | null
          student_id?: string | null
          technology_supports?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autism_accommodations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          advocate_id: string
          billing_rate: number | null
          case_title: string
          case_type: string | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          next_action: string | null
          next_action_date: string | null
          priority: string | null
          status: string | null
          student_id: string | null
          timeline: Json | null
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          advocate_id: string
          billing_rate?: number | null
          case_title: string
          case_type?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          next_action?: string | null
          next_action_date?: string | null
          priority?: string | null
          status?: string | null
          student_id?: string | null
          timeline?: Json | null
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          advocate_id?: string
          billing_rate?: number | null
          case_title?: string
          case_type?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          next_action?: string | null
          next_action_date?: string | null
          priority?: string | null
          status?: string | null
          student_id?: string | null
          timeline?: Json | null
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          confidential: boolean | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          student_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          confidential?: boolean | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          student_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          confidential?: boolean | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          student_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      gifted_assessments: {
        Row: {
          acceleration_needs: Json | null
          assessment_scores: Json | null
          assessment_type: string
          challenges: Json | null
          created_at: string
          enrichment_activities: Json | null
          evaluator_notes: string | null
          giftedness_areas: string[]
          id: string
          learning_differences: string[] | null
          next_steps: Json | null
          recommendations: Json | null
          social_emotional_needs: Json | null
          status: string | null
          strengths: Json
          student_id: string
          twice_exceptional_profile: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acceleration_needs?: Json | null
          assessment_scores?: Json | null
          assessment_type: string
          challenges?: Json | null
          created_at?: string
          enrichment_activities?: Json | null
          evaluator_notes?: string | null
          giftedness_areas: string[]
          id?: string
          learning_differences?: string[] | null
          next_steps?: Json | null
          recommendations?: Json | null
          social_emotional_needs?: Json | null
          status?: string | null
          strengths: Json
          student_id: string
          twice_exceptional_profile?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acceleration_needs?: Json | null
          assessment_scores?: Json | null
          assessment_type?: string
          challenges?: Json | null
          created_at?: string
          enrichment_activities?: Json | null
          evaluator_notes?: string | null
          giftedness_areas?: string[]
          id?: string
          learning_differences?: string[] | null
          next_steps?: Json | null
          recommendations?: Json | null
          social_emotional_needs?: Json | null
          status?: string | null
          strengths?: Json
          student_id?: string
          twice_exceptional_profile?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifted_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          current_progress: number | null
          data_collection: Json | null
          description: string
          goal_type: string | null
          id: string
          measurable_criteria: string | null
          notes: string | null
          status: string | null
          student_id: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_progress?: number | null
          data_collection?: Json | null
          description: string
          goal_type?: string | null
          id?: string
          measurable_criteria?: string | null
          notes?: string | null
          status?: string | null
          student_id: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_progress?: number | null
          data_collection?: Json | null
          description?: string
          goal_type?: string | null
          id?: string
          measurable_criteria?: string | null
          notes?: string | null
          status?: string | null
          student_id?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      letters: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          recipient: string
          recipient_email: string | null
          response_content: string | null
          response_date: string | null
          sent_date: string | null
          status: string | null
          student_id: string | null
          subject: string
          template_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          recipient: string
          recipient_email?: string | null
          response_content?: string | null
          response_date?: string | null
          sent_date?: string | null
          status?: string | null
          student_id?: string | null
          subject: string
          template_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          recipient?: string
          recipient_email?: string | null
          response_content?: string | null
          response_date?: string | null
          sent_date?: string | null
          status?: string | null
          student_id?: string | null
          subject?: string
          template_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "letters_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: Json | null
          attendees: Json | null
          created_at: string
          description: string | null
          duration: number | null
          follow_up_actions: Json | null
          id: string
          location: string | null
          meeting_type: string | null
          notes: string | null
          outcomes: string | null
          scheduled_date: string
          status: string | null
          student_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agenda?: Json | null
          attendees?: Json | null
          created_at?: string
          description?: string | null
          duration?: number | null
          follow_up_actions?: Json | null
          id?: string
          location?: string | null
          meeting_type?: string | null
          notes?: string | null
          outcomes?: string | null
          scheduled_date: string
          status?: string | null
          student_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agenda?: Json | null
          attendees?: Json | null
          created_at?: string
          description?: string | null
          duration?: number | null
          follow_up_actions?: Json | null
          id?: string
          location?: string | null
          meeting_type?: string | null
          notes?: string | null
          outcomes?: string | null
          scheduled_date?: string
          status?: string | null
          student_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          duration: number | null
          end_date: string | null
          frequency: string | null
          id: string
          location: string | null
          notes: string | null
          provider: string | null
          service_type: string
          start_date: string | null
          status: string | null
          student_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          provider?: string | null
          service_type: string
          start_date?: string | null
          status?: string | null
          student_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          provider?: string | null
          service_type?: string
          start_date?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          case_manager: string | null
          case_manager_email: string | null
          created_at: string
          date_of_birth: string | null
          disability_category: string | null
          district: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          grade_level: string | null
          id: string
          iep_date: string | null
          iep_status: string | null
          medical_info: string | null
          next_review_date: string | null
          notes: string | null
          school_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          case_manager?: string | null
          case_manager_email?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability_category?: string | null
          district?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          grade_level?: string | null
          id?: string
          iep_date?: string | null
          iep_status?: string | null
          medical_info?: string | null
          next_review_date?: string | null
          notes?: string | null
          school_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          case_manager?: string | null
          case_manager_email?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability_category?: string | null
          district?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          grade_level?: string | null
          id?: string
          iep_date?: string | null
          iep_status?: string | null
          medical_info?: string | null
          next_review_date?: string | null
          notes?: string | null
          school_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_student_access: {
        Args: { student_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
