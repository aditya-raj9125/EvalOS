// Batch types — mirrors FastAPI BatchCreate, Batch, BatchSummary, BatchAnalytics schemas

export type BatchStatus =
  | "created"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export interface BatchCreate {
  name: string;
  subject: string;
  max_score_per_sheet: number;
  enable_student_portal: boolean;
  student_access_code?: string;
}

export interface Batch {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  status: BatchStatus;
  total_sheets: number;
  processed_sheets: number;
  flagged_count: number;
  avg_score: number | null;
  max_score_per_sheet: number;
  enable_student_portal: boolean;
  student_access_code: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface BatchSummary {
  id: string;
  name: string;
  subject: string;
  status: BatchStatus;
  total_sheets: number;
  processed_sheets: number;
  avg_score: number | null;
  created_at: string;
}

export interface BatchProcessingStatus {
  batch_id: string;
  status: BatchStatus;
  total_sheets: number;
  processed_sheets: number;
  flagged_count: number;
  progress_percent: number;
  estimated_remaining_seconds: number;
  sheet_statuses: Array<{
    sheet_id: string;
    roll_number: string | null;
    status: string;
  }>;
}

export interface ScoreBucket {
  range: string;
  count: number;
}

export interface QuestionAnalytics {
  q_no: string;
  avg_marks: number;
  max_marks: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface BatchAnalytics {
  batch_id: string;
  score_distribution: ScoreBucket[];
  per_question_averages: QuestionAnalytics[];
  hardest_questions: QuestionAnalytics[];
  easiest_questions: QuestionAnalytics[];
  pass_count: number;
  fail_count: number;
  grade_distribution: Record<string, number>;
}
