// WebSocket event types — mirrors Phase 10 backend event schema

export interface WSEvent<T = Record<string, unknown>> {
  type: WSEventType;
  batch_id: string;
  timestamp: string; // ISO8601
  payload: T;
}

export type WSEventType =
  | "batch_started"
  | "rubric_parsed"
  | "sheet_converting"
  | "sheet_extracting"
  | "sheet_evaluating"
  | "sheet_annotating"
  | "sheet_completed"
  | "sheet_failed"
  | "batch_completed"
  | "progress_update";

export interface WSBatchStartedPayload {
  total_sheets: number;
}

export interface WSRubricParsedPayload {
  question_count: number;
}

export interface WSSheetConvertingPayload {
  sheet_id: string;
  filename: string;
}

export interface WSSheetExtractingPayload {
  sheet_id: string;
  filename: string;
}

export interface WSSheetEvaluatingPayload {
  sheet_id: string;
  roll_number: string | null;
}

export interface WSSheetAnnotatingPayload {
  sheet_id: string;
  roll_number: string | null;
}

export interface WSSheetCompletedPayload {
  sheet_id: string;
  roll_number: string | null;
  student_name: string | null;
  total_marks: number;
  max_marks: number;
  percentage: number;
  grade: string;
  flagged: boolean;
}

export interface WSSheetFailedPayload {
  sheet_id: string;
  filename: string;
  error: string;
}

export interface WSBatchCompletedPayload {
  total_processed: number;
  total_flagged: number;
  total_failed: number;
  avg_score: number;
  time_taken_seconds: number;
}

export interface WSProgressUpdatePayload {
  processed: number;
  total: number;
  progress_percent: number;
}
