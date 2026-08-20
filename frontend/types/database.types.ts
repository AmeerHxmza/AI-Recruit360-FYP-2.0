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
export type ApplicationStatus = "applied" | "screening" | "interview" | "evaluation" | "shortlisted" | "rejected" | "hired";
export type DocumentType = "resume" | "cover_letter" | "portfolio" | "assessment" | "other";
export type ProcessingStatus = "uploaded" | "processing" | "processed" | "failed";
export type Recommendation = "strong_match" | "potential_match" | "low_alignment" | "needs_review";
export type InterviewStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type InterviewType = "ai_adaptive" | "technical" | "behavioral" | "screening";
export type EvaluationStatus = "pending" | "in_review" | "completed";
export type EvaluationRecommendation = "strong_hire" | "hire" | "no_hire" | "strong_no_hire";
export type AiActivityStatus = "success" | "warning" | "error" | "in_progress";

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
          title: string;
          department: string;
          location: string;
          employment_type: EmploymentType;
          workplace_type: WorkplaceType;
          description: string | null;
          requirements: string | null;
          status: JobStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          department: string;
          location: string;
          employment_type: EmploymentType;
          workplace_type?: WorkplaceType;
          description?: string | null;
          requirements?: string | null;
          status?: JobStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          department?: string;
          location?: string;
          employment_type?: EmploymentType;
          workplace_type?: WorkplaceType;
          description?: string | null;
          requirements?: string | null;
          status?: JobStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
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
          source: string;
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          job_id: string;
          candidate_id: string;
          status?: ApplicationStatus;
          source?: string;
          applied_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          job_id?: string;
          candidate_id?: string;
          status?: ApplicationStatus;
          source?: string;
          applied_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      candidate_documents: {
        Row: {
          id: string;
          organization_id: string;
          candidate_id: string;
          application_id: string | null;
          file_name: string;
          file_type: string;
          storage_path: string;
          file_size: number;
          document_type: DocumentType;
          processing_status: ProcessingStatus;
          extracted_text: string | null;
          parser_version: string | null;
          uploaded_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          candidate_id: string;
          application_id?: string | null;
          file_name: string;
          file_type: string;
          storage_path: string;
          file_size: number;
          document_type?: DocumentType;
          processing_status?: ProcessingStatus;
          extracted_text?: string | null;
          parser_version?: string | null;
          uploaded_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          candidate_id?: string;
          application_id?: string | null;
          file_name?: string;
          file_type?: string;
          storage_path?: string;
          file_size?: number;
          document_type?: DocumentType;
          processing_status?: ProcessingStatus;
          extracted_text?: string | null;
          parser_version?: string | null;
          uploaded_at?: string;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      ai_candidate_analyses: {
        Row: {
          id: string;
          organization_id: string;
          application_id: string;
          match_score: number | null;
          skills_alignment: Json;
          experience_alignment: Json;
          education_alignment: Json;
          reasoning: string | null;
          recommendation: Recommendation | null;
          model_info: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          application_id: string;
          match_score?: number | null;
          skills_alignment?: Json;
          experience_alignment?: Json;
          education_alignment?: Json;
          reasoning?: string | null;
          recommendation?: Recommendation | null;
          model_info?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          application_id?: string;
          match_score?: number | null;
          skills_alignment?: Json;
          experience_alignment?: Json;
          education_alignment?: Json;
          reasoning?: string | null;
          recommendation?: Recommendation | null;
          model_info?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_analysis_evidences: {
        Row: {
          id: string;
          organization_id: string;
          analysis_id: string;
          source_document_id: string | null;
          evidence_type: string;
          source_reference: string | null;
          content: string;
          relevance_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          analysis_id: string;
          source_document_id?: string | null;
          evidence_type: string;
          source_reference?: string | null;
          content: string;
          relevance_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          analysis_id?: string;
          source_document_id?: string | null;
          evidence_type?: string;
          source_reference?: string | null;
          content?: string;
          relevance_score?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          organization_id: string;
          application_id: string;
          scheduled_at: string;
          duration_minutes: number;
          status: InterviewStatus;
          interview_type: InterviewType;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          application_id: string;
          scheduled_at: string;
          duration_minutes?: number;
          status?: InterviewStatus;
          interview_type?: InterviewType;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          application_id?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          status?: InterviewStatus;
          interview_type?: InterviewType;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interview_questions: {
        Row: {
          id: string;
          interview_id: string;
          question_text: string;
          category: string;
          question_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          question_text: string;
          category: string;
          question_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          question_text?: string;
          category?: string;
          question_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      interview_responses: {
        Row: {
          id: string;
          question_id: string;
          response_text: string | null;
          audio_storage_path: string | null;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          response_text?: string | null;
          audio_storage_path?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          response_text?: string | null;
          audio_storage_path?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      evaluations: {
        Row: {
          id: string;
          organization_id: string;
          application_id: string;
          interview_id: string | null;
          evaluator_id: string | null;
          status: EvaluationStatus;
          overall_score: number | null;
          recommendation: EvaluationRecommendation | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          application_id: string;
          interview_id?: string | null;
          evaluator_id?: string | null;
          status?: EvaluationStatus;
          overall_score?: number | null;
          recommendation?: EvaluationRecommendation | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          application_id?: string;
          interview_id?: string | null;
          evaluator_id?: string | null;
          status?: EvaluationStatus;
          overall_score?: number | null;
          recommendation?: EvaluationRecommendation | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      evaluation_criteria_scores: {
        Row: {
          id: string;
          evaluation_id: string;
          criteria_name: string;
          score: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          evaluation_id: string;
          criteria_name: string;
          score: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          evaluation_id?: string;
          criteria_name?: string;
          score?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
      ai_activity_logs: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          event_type: string;
          entity_type: string | null;
          entity_id: string | null;
          status: AiActivityStatus;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          event_type: string;
          entity_type?: string | null;
          entity_id?: string | null;
          status?: AiActivityStatus;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          event_type?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          status?: AiActivityStatus;
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
          created_at?: string;
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
    Views: Record<string, never>;
    Functions: {
      create_organization: {
        Args: {
          _name: string;
          _slug: string;
        };
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
      is_org_member: {
        Args: {
          _org_id: string;
        };
        Returns: boolean;
      };
      get_user_org_role: {
        Args: {
          _org_id: string;
        };
        Returns: OrganizationRole | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
