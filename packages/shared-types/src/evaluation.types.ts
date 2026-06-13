// Evaluation types — mirrors FastAPI Evaluation, EvaluationVerdict, QuestionResult schemas

export type EvaluationVerdict =
  | "correct"
  | "partial"
  | "wrong"
  | "skipped"
  | "diagram_correct"
  | "diagram_partial"
  | "diagram_wrong";

export interface EvaluationBBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Evaluation {
  id: string;
  sheet_id: string;
  q_no: string;
  question_type: string;
  page_number: number;
  student_answer_transcribed: string;
  awarded_marks: number;
  max_marks: number;
  verdict: EvaluationVerdict;
  reason: string;
  ai_confidence: number;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  is_flagged: boolean;
  is_reviewed: boolean;
  created_at: string;
}

export interface QuestionResult {
  q_no: string;
  awarded_marks: number;
  max_marks: number;
  verdict: EvaluationVerdict;
  reason: string;
  student_answer_transcribed: string;
  ai_confidence: number;
}
