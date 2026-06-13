// Review types — mirrors FastAPI ReviewItem, ReviewAction, ReviewStats schemas

export type ReviewAction = "pending" | "approved" | "overridden" | "recheck";

export interface ReviewItem {
  id: string;
  evaluation_id: string;
  batch_id: string;
  sheet_id: string;
  reviewer_id: string | null;
  original_ai_score: number;
  override_score: number | null;
  action: ReviewAction;
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined fields from evaluation / sheet
  q_no?: string;
  question_text?: string;
  student_answer_transcribed?: string;
  max_marks?: number;
  reason?: string;
  ai_confidence?: number;
  roll_number?: string | null;
  student_name?: string | null;
  page_image_url?: string;
  bbox?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface ReviewStats {
  pending_count: number;
  approved_count: number;
  overridden_count: number;
  recheck_count: number;
}

export interface ReviewOverrideRequest {
  override_score: number;
  note: string;
}
