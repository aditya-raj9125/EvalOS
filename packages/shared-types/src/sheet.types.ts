// Sheet types — mirrors FastAPI Sheet, SheetResult, AnnotatedSheet schemas

export type SheetStatus =
  | "uploaded"
  | "converting"
  | "extracting"
  | "evaluating"
  | "annotating"
  | "completed"
  | "flagged"
  | "failed";

export interface Sheet {
  id: string;
  batch_id: string;
  original_file_path: string;
  page_image_paths: string[];
  annotated_image_paths: string[];
  annotated_pdf_path: string | null;
  roll_number: string | null;
  student_name: string | null;
  total_awarded_marks: number | null;
  total_max_marks: number | null;
  percentage: number | null;
  grade: string | null;
  status: SheetStatus;
  ai_extraction_confidence: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SheetResult {
  sheet_id: string;
  roll_number: string | null;
  student_name: string | null;
  status: SheetStatus;
  grade: string | null;
  percentage: number | null;
  total_awarded_marks: number | null;
  total_max_marks: number | null;
  is_flagged: boolean;
  question_breakdown: Array<{
    q_no: string;
    awarded_marks: number;
    max_marks: number;
    verdict: string;
  }>;
}

export interface AnnotatedSheet {
  sheet_id: string;
  student_name: string | null;
  roll_number: string | null;
  annotated_page_urls: string[];
  annotated_pdf_url: string | null;
  evaluations: import("./evaluation.types").Evaluation[];
}
