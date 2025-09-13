import { pgTable, varchar, text, timestamp, integer, boolean, json, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// IEP Advocacy Process Workflow Enums
export const CLIENT_ENGAGEMENT_STAGES = {
  PROSPECT: 'prospect',
  INTAKE: 'intake', 
  RECORDS_REVIEW: 'records_review',
  ASSESSMENT: 'assessment',
  IEP_DEVELOPMENT: 'iep_development',
  IMPLEMENTATION: 'implementation',
  MONITORING: 'monitoring',
  REVIEW_RENEWAL: 'review_renewal'
} as const;

export const STUDENT_IEP_WORKFLOW_STAGES = {
  REFERRAL: 'referral',
  EVALUATION: 'evaluation', 
  ELIGIBILITY: 'eligibility',
  IEP_DEVELOPMENT: 'iep_development',
  IEP_MEETING: 'iep_meeting',
  IMPLEMENTATION: 'implementation',
  PROGRESS_MONITORING: 'progress_monitoring',
  ANNUAL_REVIEW: 'annual_review',
  TRIENNIAL: 'triennial'
} as const;

export type ClientEngagementStage = typeof CLIENT_ENGAGEMENT_STAGES[keyof typeof CLIENT_ENGAGEMENT_STAGES];
export type StudentIEPWorkflowStage = typeof STUDENT_IEP_WORKFLOW_STAGES[keyof typeof STUDENT_IEP_WORKFLOW_STAGES];

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Users table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default('parent'), // Default role
  password: varchar("password"), // For email/password auth
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"), // Email verification token
  passwordResetToken: varchar("password_reset_token"), // Password reset token
  passwordResetExpires: timestamp("password_reset_expires"), // Password reset expiry
  subscriptionStatus: varchar("subscription_status"),
  subscriptionPlan: varchar("subscription_plan"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Auth tokens table - for persistent token storage instead of memory
export const auth_tokens = pgTable("auth_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: varchar("token").notNull().unique(),
  user_id: varchar("user_id").notNull(),
  user_role: varchar("user_role"),
  created_at: timestamp("created_at").defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});

export type AuthToken = typeof auth_tokens.$inferSelect;
export type InsertAuthToken = typeof auth_tokens.$inferInsert;

// Profiles table - extended user information
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().unique(),
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
  iep_status: varchar("iep_status"), // Keep for backwards compatibility
  iep_workflow_stage: varchar("iep_workflow_stage").$type<StudentIEPWorkflowStage>().default('referral'),
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
  client_first_name: varchar("client_first_name"),
  client_last_name: varchar("client_last_name"),
  client_email: varchar("client_email"),
  relationship_type: varchar("relationship_type"),
  status: varchar("status"), // Keep for backwards compatibility
  engagement_stage: varchar("engagement_stage").$type<ClientEngagementStage>().default('prospect'),
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

// Match proposals table
export const match_proposals = pgTable("match_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  student_id: varchar("student_id").notNull(),
  advocate_id: varchar("advocate_id").notNull(),
  parent_id: varchar("parent_id").notNull(),
  score: integer("score").notNull(),
  status: varchar("status").notNull().default('pending'), // pending, scheduled, accepted, declined
  match_reason: json("match_reason"),
  decline_reason: text("decline_reason"),
  intro_call_requested: boolean("intro_call_requested").default(false),
  intro_call_scheduled_at: timestamp("intro_call_scheduled_at"),
  intro_call_notes: text("intro_call_notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Conversations table - for messaging between advocates and parents
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advocate_id: varchar("advocate_id").notNull(),
  parent_id: varchar("parent_id").notNull(),
  student_id: varchar("student_id"), // Which student this conversation is about
  match_proposal_id: varchar("match_proposal_id"), // Link to the match proposal that created this
  title: varchar("title"), // Optional conversation title
  status: varchar("status").default('active'), // active, archived, closed
  last_message_at: timestamp("last_message_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Messages table - individual messages within conversations
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversation_id: varchar("conversation_id").notNull(),
  sender_id: varchar("sender_id").notNull(), // User ID of the sender
  content: text("content").notNull(),
  read_at: timestamp("read_at"), // When the message was read by recipient
  created_at: timestamp("created_at").defaultNow(),
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
  strengths: json("strengths"),
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
  // AI Analysis fields
  ai_analysis_parent: json("ai_analysis_parent"), // AI insights for parents
  ai_analysis_advocate: json("ai_analysis_advocate"), // AI insights for advocates
  ai_recommendations: json("ai_recommendations"), // Smart recommendations
  ai_generated_at: timestamp("ai_generated_at"), // When AI analysis was generated
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

export type MatchProposal = typeof match_proposals.$inferSelect;
export type InsertMatchProposal = typeof match_proposals.$inferInsert;

export type Advocate = typeof advocates.$inferSelect;
export type InsertAdvocate = typeof advocates.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;