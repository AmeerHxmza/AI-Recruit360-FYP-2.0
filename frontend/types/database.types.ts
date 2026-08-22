export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrganizationRole = "owner" | "admin" | "recruiter" | "interviewer" | "viewer";
export type JobStatus = "draft" | "active" | "paused" | "closed";
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type WorkplaceType = "on_site" | "hybrid" | "remote";

export type ApplicationStatus =
  | "applied"
  | "screening"
  | "knocked_out"
  | "assessment"
  | "assessment_failed"
  | "interview"
  | "evaluation"
  | "shortlisted"
  | "rejected"
  | "hired";

export type DocumentType = "resume" | "cover_letter" | "portfolio" | "assessment" | "other";
export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";

export type CvRecommendation = "strong_match" | "match" | "borderline" | "no_match";
export type AssessmentStatus = "pending" | "in_progress" | "completed" | "failed" | "abandoned";

export type InterviewStatus = "pending" | "in_progress" | "completed" | "abandoned" | "scheduled" | "cancelled";
export type InterviewType = "ai_adaptive" | "technical" | "behavioral" | "screening";
export type QuestionSource = "job" | "cv" | "previous_answer" | "adaptive";

export type FinalRecommendation = "strong_hire" | "hire" | "review" | "no_hire" | "strong_no_hire";
export type EvaluationStatus = "pending" | "in_review" | "completed";

export type AiEventType =
  | "job_analyzed"
  | "job_analysis"
  | "cv_extracted"
  | "cv_screened"
  | "candidate_knocked_out"
  | "assessment_generated"
  | "assessment_completed"
  | "interview_started"
  | "interview_question_generated"
  | "interview_evaluated"
  | "candidate_evaluated"
  | "document_ingest_completed"
  | "document_ingest_failed";

export type AiActivityStatus = "success" | "warning" | "error" | "in_progress";
export type AiEventStatus = AiActivityStatus;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          job_title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          job_title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          job_title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: OrganizationRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: OrganizationRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: OrganizationRole;
          created_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          organization_id: string;
          created_by: string | null;
          title: string;
          slug: string;
          department: string | null;
          location: string | null;
          employment_type: EmploymentType | null;
          workplace_type: WorkplaceType | null;
          description: string;
          requirements: string | null;
          responsibilities: string | null;
          qualifications: string | null;
          status: JobStatus;
          published_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          created_by?: string | null;
          title: string;
          slug: string;
          department?: string | null;
          location?: string | null;
          employment_type?: EmploymentType | null;
          workplace_type?: WorkplaceType | null;
          description: string;
          requirements?: string | null;
          responsibilities?: string | null;
          qualifications?: string | null;
          status?: JobStatus;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          created_by?: string | null;
          title?: string;
          slug?: string;
          department?: string | null;
          location?: string | null;
          employment_type?: EmploymentType | null;
          workplace_type?: WorkplaceType | null;
          description?: string;
          requirements?: string | null;
          responsibilities?: string | null;
          qualifications?: string | null;
          status?: JobStatus;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      candidates: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          location: string | null;
          headline: string | null;
          summary: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          location?: string | null;
          headline?: string | null;
          summary?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          location?: string | null;
          headline?: string | null;
          summary?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          organization_id: string;
          job_id: string;
          candidate_id: string;
          status: ApplicationStatus;
          applied_at: string;
          screening_started_at: string | null;
          screening_completed_at: string | null;
          assessment_started_at: string | null;
          assessment_completed_at: string | null;
          interview_started_at: string | null;
          interview_completed_at: string | null;
          finalized_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          job_id: string;
          candidate_id: string;
          status?: ApplicationStatus;
          applied_at?: string;
          screening_started_at?: string | null;
          screening_completed_at?: string | null;
          assessment_started_at?: string | null;
          assessment_completed_at?: string | null;
          interview_started_at?: string | null;
          interview_completed_at?: string | null;
          finalized_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          job_id?: string;
          candidate_id?: string;
          status?: ApplicationStatus;
          applied_at?: string;
          screening_started_at?: string | null;
          screening_completed_at?: string | null;
          assessment_started_at?: string | null;
          assessment_completed_at?: string | null;
          interview_started_at?: string | null;
          interview_completed_at?: string | null;
          finalized_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      candidate_documents: {
        Row: {
          id: string;
          organization_id: string;
          candidate_id: string;
          application_id: string;
          document_type: DocumentType;
          storage_path: string;
          original_filename: string;
          file_name?: string;
          mime_type: string;
          file_size: number;
          extracted_text: string | null;
          extraction_status: ExtractionStatus;
          processing_status?: ExtractionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          candidate_id: string;
          application_id: string;
          document_type?: DocumentType;
          storage_path: string;
          original_filename: string;
          file_name?: string;
          mime_type: string;
          file_size: number;
          extracted_text?: string | null;
          extraction_status?: ExtractionStatus;
          processing_status?: ExtractionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          candidate_id?: string;
          application_id?: string;
          document_type?: DocumentType;
          storage_path?: string;
          original_filename?: string;
          file_name?: string;
          mime_type?: string;
          file_size?: number;
          extracted_text?: string | null;
          extraction_status?: ExtractionStatus;
          processing_status?: ExtractionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cv_screenings: {
        Row: {
          id: string;
          organization_id: string;
          application_id: string;
          match_score: number | null;
          recommendation: CvRecommendation | null;
          skills_score: number | null;
          experience_score: number | null;
          education_score: number | null;
          keyword_score: number | null;
          matched_skills: Json;
          missing_skills: Json;
          matched_experience: Json;
          missing_requirements: Json;
          evidence: Json;
          reasoning_summary: string | null;
          model: string | null;
          processing_status: ExtractionStatus;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          application_id: string;
          match_score?: number | null;
          recommendation?: CvRecommendation | null;
          skills_score?: number | null;
          experience_score?: number | null;
          education_score?: number | null;
          keyword_score?: number | null;
          matched_skills?: Json;
          missing_skills?: Json;
          matched_experience?: Json;
          missing_requirements?: Json;
          evidence?: Json;
          reasoning_summary?: string | null;
          model?: string | null;
          processing_status?: ExtractionStatus;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          application_id?: string;
          match_score?: number | null;
          recommendation?: CvRecommendation | null;
          skills_score?: number | null;
          experience_score?: number | null;
          education_score?: number | null;
          keyword_score?: number | null;
          matched_skills?: Json;
          missing_skills?: Json;
          matched_experience?: Json;
          missing_requirements?: Json;
          evidence?: Json;
          reasoning_summary?: string | null;
          model?: string | null;
          processing_status?: ExtractionStatus;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          organization_id: string;
          application_id: string;
          total_questions: number;
          correct_answers: number;
          score: number;
          percentage: number | null;
          status: AssessmentStatus;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          application_id: string;
          total_questions?: number;
          correct_answers?: number;
          score?: number;
          percentage?: number | null;
          status?: AssessmentStatus;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          application_id?: string;
          total_questions?: number;
          correct_answers?: number;
          score?: number;
          percentage?: number | null;
          status?: AssessmentStatus;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assessment_questions: {
        Row: {
          id: string;
          assessment_id: string;
          question_number: number;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: string;
          explanation: string | null;
          skill_category: string | null;
          difficulty: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          question_number: number;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: string;
          explanation?: string | null;
          skill_category?: string | null;
          difficulty?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          question_number?: number;
          question?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          correct_option?: string;
          explanation?: string | null;
          skill_category?: string | null;
          difficulty?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      assessment_answers: {
        Row: {
          id: string;
          assessment_id: string;
          question_id: string;
          selected_option: string;
          is_correct: boolean;
          time_taken_seconds: number | null;
          answered_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          question_id: string;
          selected_option: string;
          is_correct: boolean;
          time_taken_seconds?: number | null;
          answered_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          question_id?: string;
          selected_option?: string;
          is_correct?: boolean;
          time_taken_seconds?: number | null;
          answered_at?: string;
        };
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          organization_id: string;
          application_id: string;
          status: InterviewStatus;
          interview_type: InterviewType;
          total_questions: number;
          questions_answered: number;
          scheduled_at?: string | null;
          duration_minutes?: number | null;
          overall_score: number | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          application_id: string;
          status?: InterviewStatus;
          interview_type?: InterviewType;
          total_questions?: number;
          questions_answered?: number;
          scheduled_at?: string | null;
          duration_minutes?: number | null;
          overall_score?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          application_id?: string;
          status?: InterviewStatus;
          interview_type?: InterviewType;
          total_questions?: number;
          questions_answered?: number;
          scheduled_at?: string | null;
          duration_minutes?: number | null;
          overall_score?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interview_questions: {
        Row: {
          id: string;
          interview_id: string;
          question_number: number;
          question_text: string;
          question_type: string;
          source: QuestionSource;
          skill_category: string | null;
          category?: string | null;
          is_follow_up: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          question_number: number;
          question_text: string;
          question_type?: string;
          source?: QuestionSource;
          skill_category?: string | null;
          category?: string | null;
          is_follow_up?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          question_number?: number;
          question_text?: string;
          question_type?: string;
          source?: QuestionSource;
          skill_category?: string | null;
          category?: string | null;
          is_follow_up?: boolean | null;
          created_at?: string;
        };
        Relationships: [];
      };
      interview_responses: {
        Row: {
          id: string;
          interview_id: string;
          question_id: string;
          response_text: string | null;
          audio_storage_path: string | null;
          transcript: string | null;
          technical_score: number | null;
          communication_score: number | null;
          relevance_score: number | null;
          ai_feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          question_id: string;
          response_text?: string | null;
          audio_storage_path?: string | null;
          transcript?: string | null;
          technical_score?: number | null;
          communication_score?: number | null;
          relevance_score?: number | null;
          ai_feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          question_id?: string;
          response_text?: string | null;
          audio_storage_path?: string | null;
          transcript?: string | null;
          technical_score?: number | null;
          communication_score?: number | null;
          relevance_score?: number | null;
          ai_feedback?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      final_evaluations: {
        Row: {
          id: string;
          organization_id: string;
          application_id: string;
          cv_score: number | null;
          assessment_score: number | null;
          interview_score: number | null;
          overall_score: number | null;
          recommendation: FinalRecommendation | null;
          strengths: Json;
          weaknesses: Json;
          evidence: Json;
          ai_summary: string | null;
          model: string | null;
          status?: EvaluationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          application_id: string;
          cv_score?: number | null;
          assessment_score?: number | null;
          interview_score?: number | null;
          overall_score?: number | null;
          recommendation?: FinalRecommendation | null;
          strengths?: Json;
          weaknesses?: Json;
          evidence?: Json;
          ai_summary?: string | null;
          model?: string | null;
          status?: EvaluationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          application_id?: string;
          cv_score?: number | null;
          assessment_score?: number | null;
          interview_score?: number | null;
          overall_score?: number | null;
          recommendation?: FinalRecommendation | null;
          strengths?: Json;
          weaknesses?: Json;
          evidence?: Json;
          ai_summary?: string | null;
          model?: string | null;
          status?: EvaluationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_activity_logs: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          application_id: string | null;
          job_id: string | null;
          event_type: AiEventType;
          status: AiEventStatus;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          application_id?: string | null;
          job_id?: string | null;
          event_type: AiEventType;
          status?: AiEventStatus;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          application_id?: string | null;
          job_id?: string | null;
          event_type?: AiEventType;
          status?: AiEventStatus;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      security_audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string | null;
          action: string;
          ip_address: string | null;
          user_agent: string | null;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          action: string;
          ip_address?: string | null;
          user_agent?: string | null;
          details?: Json;
          created_at: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          action?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_org_member: {
        Args: { _org_id: string };
        Returns: boolean;
      };
      get_user_org_role: {
        Args: { _org_id: string };
        Returns: string;
      };
      create_organization: {
        Args: { _name: string; _slug: string };
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
