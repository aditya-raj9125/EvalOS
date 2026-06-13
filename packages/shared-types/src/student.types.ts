// Student portal types — mirrors FastAPI StudentLookupRequest, StudentResult schemas

export interface StudentLookupRequest {
  roll_number: string;
  access_code: string;
}

export interface StudentQuestionFeedback {
  q_no: string;
  awarded_marks: number;
  max_marks: number;
  verdict: string;
  reason: string;
  student_answer_transcribed: string;
}

export interface StudentResult {
  student_name: string | null;
  roll_number: string;
  subject: string;
  batch_name: string;
  total_awarded_marks: number;
  total_max_marks: number;
  percentage: number;
  grade: string;
  annotated_page_urls: string[];
  annotated_pdf_url: string | null;
  question_feedback: StudentQuestionFeedback[];
  evaluated_at: string | null;
}

export interface StudentPortalSheet {
  sheet_id: string;
  roll_number: string;
  student_name: string | null;
  percentage: number;
  grade: string;
  annotated_pdf_url: string | null;
}
