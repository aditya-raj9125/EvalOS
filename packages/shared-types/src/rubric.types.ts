// Rubric types — mirrors FastAPI Rubric, ParsedQuestion, QuestionType schemas

export type QuestionType =
  | "mcq"
  | "short_answer"
  | "long_answer"
  | "numerical"
  | "diagram"
  | "fill_blank";

export type RubricParsingStatus = "pending" | "completed" | "failed";

export interface ParsedQuestion {
  q_no: string;
  question_text: string;
  question_type: QuestionType;
  max_marks: number;
  expected_answer: string;
  marking_notes: string;
  diagram_checklist: string[] | null;
  keyword_list: string[] | null;
}

export interface Rubric {
  id: string;
  batch_id: string;
  question_paper_path: string;
  marking_scheme_path: string;
  guidelines: string | null;
  parsed_structure: ParsedQuestion[] | null;
  parsing_status: RubricParsingStatus;
  created_at: string;
}

export interface RubricUpload {
  question_paper: File;
  marking_scheme: File;
  guidelines?: string;
}
