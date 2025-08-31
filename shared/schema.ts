import { pgTable, varchar, text, timestamp, integer, boolean, json, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Profiles table - core user profiles
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  full_name: varchar("full_name"),
  email: varchar("email"),
  phone: varchar("phone"),
  bio: text("bio"),
  avatar_url: varchar("avatar_url"),
  role: varchar("role"),
  organization: varchar("organization"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Students table - core student information
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  parent_id: varchar("parent_id"),
  full_name: varchar("full_name").notNull(),
  date_of_birth: varchar("date_of_birth"),
  grade_level: varchar("grade_level"),
  school_name: varchar("school_name"),
  district: varchar("district"),
  case_manager: varchar("case_manager"),
  case_manager_email: varchar("case_manager_email"),
  disability_category: varchar("disability_category"),
  iep_date: varchar("iep_date"),
  iep_status: varchar("iep_status"),
  next_review_date: varchar("next_review_date"),
  emergency_contact: varchar("emergency_contact"),
  emergency_phone: varchar("emergency_phone"),
  medical_info: text("medical_info"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Accommodations table
export const accommodations = pgTable("accommodations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  student_id: varchar("student_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category"),
  implementation_notes: text("implementation_notes"),
  effectiveness_rating: integer("effectiveness_rating"),
  status: varchar("status"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Autism accommodations table
export const autism_accommodations = pgTable("autism_accommodations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  student_id: varchar("student_id"),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  accommodation_type: varchar("accommodation_type").notNull(),
  implementation_notes: text("implementation_notes"),
  effectiveness_rating: integer("effectiveness_rating"),
  status: varchar("status"),
  sensory_profile: json("sensory_profile"),
  communication_needs: json("communication_needs"),
  social_supports: json("social_supports"),
  academic_supports: json("academic_supports"),
  behavioral_triggers: json("behavioral_triggers"),
  environmental_modifications: json("environmental_modifications"),
  technology_supports: json("technology_supports"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Advocates table
export const advocates = pgTable("advocates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  full_name: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  bio: text("bio"),
  location: varchar("location"),
  specializations: json("specializations"),
  certifications: json("certifications"),
  education: varchar("education"),
  years_experience: integer("years_experience"),
  languages: json("languages"),
  case_types: json("case_types"),
  rate_per_hour: integer("rate_per_hour"),
  availability: varchar("availability"),
  rating: integer("rating"),
  total_reviews: integer("total_reviews"),
  verification_status: varchar("verification_status"),
  status: varchar("status"),
  profile_image_url: varchar("profile_image_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Advocate clients table
export const advocate_clients = pgTable("advocate_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advocate_id: varchar("advocate_id").notNull(),
  client_id: varchar("client_id").notNull(),
  relationship_type: varchar("relationship_type"),
  status: varchar("status"),
  start_date: varchar("start_date"),
  end_date: varchar("end_date"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Advocate requests table
export const advocate_requests = pgTable("advocate_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parent_id: varchar("parent_id").notNull(),
  advocate_id: varchar("advocate_id").notNull(),
  student_id: varchar("student_id"),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  urgency_level: varchar("urgency_level"),
  budget_range: varchar("budget_range"),
  preferred_contact_method: varchar("preferred_contact_method"),
  status: varchar("status"),
  response_message: text("response_message"),
  responded_at: timestamp("responded_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Cases table
export const cases = pgTable("cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advocate_id: varchar("advocate_id").notNull(),
  client_id: varchar("client_id").notNull(),
  student_id: varchar("student_id"),
  case_title: varchar("case_title").notNull(),
  description: text("description"),
  case_type: varchar("case_type"),
  status: varchar("status"),
  priority: varchar("priority"),
  billing_rate: integer("billing_rate"),
  total_hours: integer("total_hours"),
  next_action: varchar("next_action"),
  next_action_date: varchar("next_action_date"),
  timeline: json("timeline"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  student_id: varchar("student_id"),
  title: varchar("title").notNull(),
  description: text("description"),
  file_name: varchar("file_name").notNull(),
  file_path: varchar("file_path").notNull(),
  file_type: varchar("file_type"),
  file_size: integer("file_size"),
  category: varchar("category"),
  tags: json("tags"),
  content: text("content"), // Add content field for AI analysis results
  confidential: boolean("confidential"),
  uploaded_by: varchar("uploaded_by"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Goals table
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  student_id: varchar("student_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  goal_type: varchar("goal_type"),
  status: varchar("status"),
  target_date: varchar("target_date"),
  current_progress: integer("current_progress"),
  measurable_criteria: varchar("measurable_criteria"),
  data_collection: json("data_collection"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Services table
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  student_id: varchar("student_id").notNull(),
  service_type: varchar("service_type").notNull(),
  provider: varchar("provider"),
  frequency: varchar("frequency"),
  duration: integer("duration"),
  location: varchar("location"),
  start_date: varchar("start_date"),
  end_date: varchar("end_date"),
  status: varchar("status"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Meetings table
export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  student_id: varchar("student_id"),
  title: varchar("title").notNull(),
  description: text("description"),
  meeting_type: varchar("meeting_type"),
  scheduled_date: varchar("scheduled_date").notNull(),
  duration: integer("duration"),
  location: varchar("location"),
  agenda: json("agenda"),
  attendees: json("attendees"),
  outcomes: text("outcomes"),
  follow_up_actions: json("follow_up_actions"),
  notes: text("notes"),
  status: varchar("status"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// AI Reviews table
export const ai_reviews = pgTable("ai_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  student_id: varchar("student_id"),
  document_id: varchar("document_id"),
  review_type: varchar("review_type").notNull(),
  ai_analysis: json("ai_analysis").notNull(),
  strengths: json("strengths"),
  areas_of_concern: json("areas_of_concern"),
  recommendations: json("recommendations"),
  suggested_improvements: json("suggested_improvements"),
  action_items: json("action_items"),
  compliance_score: integer("compliance_score"),
  priority_level: varchar("priority_level"),
  status: varchar("status"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Gifted assessments table
export const gifted_assessments = pgTable("gifted_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  student_id: varchar("student_id").notNull(),
  assessment_type: varchar("assessment_type").notNull(),
  giftedness_areas: json("giftedness_areas").notNull(),
  strengths: json("strengths").notNull(),
  challenges: json("challenges"),
  learning_differences: json("learning_differences"),
  assessment_scores: json("assessment_scores"),
  recommendations: json("recommendations"),
  enrichment_activities: json("enrichment_activities"),
  acceleration_needs: json("acceleration_needs"),
  social_emotional_needs: json("social_emotional_needs"),
  twice_exceptional_profile: json("twice_exceptional_profile"),
  evaluator_notes: text("evaluator_notes"),
  next_steps: json("next_steps"),
  status: varchar("status"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// IEP Analysis table
export const iep_analysis = pgTable("iep_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  student_id: varchar("student_id"),
  document_id: varchar("document_id"),
  analysis_type: varchar("analysis_type").notNull(),
  analysis_data: json("analysis_data").notNull(),
  recommendations: json("recommendations"),
  priority_items: json("priority_items"),
  compliance_issues: json("compliance_issues"),
  next_steps: json("next_steps"),
  status: varchar("status"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// IEP Action Drafts table
export const iep_action_drafts = pgTable("iep_action_drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  analysis_id: varchar("analysis_id").notNull(),
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Audit log table
export const audit_log = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id"),
  table_name: varchar("table_name").notNull(),
  record_id: varchar("record_id").notNull(),
  action: varchar("action").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Expert analyses table
export const expert_analyses = pgTable("expert_analyses", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id").notNull(),
  student_name: varchar("student_name").notNull(),
  analysis_type: varchar("analysis_type").notNull(), // 'comprehensive' | 'focused' | 'compliance'
  file_name: varchar("file_name").notNull(),
  file_type: varchar("file_type").notNull(),
  file_content: text("file_content").notNull(), // Store as base64 or text
  status: varchar("status").notNull().default('pending'), // 'pending' | 'in_progress' | 'completed'
  overall_score: integer("overall_score"),
  strengths: json("strengths"),
  areas_for_improvement: json("areas_for_improvement"),
  recommendations: json("recommendations"),
  compliance_issues: json("compliance_issues"),
  expert_notes: text("expert_notes"),
  submitted_at: timestamp("submitted_at").defaultNow(),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type ExpertAnalysis = typeof expert_analyses.$inferSelect;
export type InsertExpertAnalysis = typeof expert_analyses.$inferInsert;