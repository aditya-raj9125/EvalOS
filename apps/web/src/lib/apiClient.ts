/**
 * Typed API client — all backend calls in one place.
 * Uses the pre-configured axios instance (api.ts) which auto-attaches JWT.
 */

import api from "./api";

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  email: string; password: string;
  full_name: string; institution_name?: string; role?: "teacher" | "admin";
}
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: import("@/store/authStore").AuthUser;
}

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<TokenResponse>("/api/v1/auth/login", data).then((r) => r.data),
  register: (data: RegisterPayload) =>
    api.post<TokenResponse>("/api/v1/auth/register", data).then((r) => r.data),
  me: () =>
    api.get<import("@/store/authStore").AuthUser>("/api/v1/auth/me").then((r) => r.data),
};

// ─── Batches ─────────────────────────────────────────────────────────────────

export interface BatchCreatePayload {
  name: string; subject?: string;
  max_score_per_sheet?: number;
  enable_student_portal?: boolean;
  student_access_code?: string;
}

export interface ApiBatch {
  id: string; user_id: string; name: string; subject: string | null;
  status: string; total_sheets: number; processed_sheets: number;
  flagged_count: number; avg_score: number | null;
  max_score_per_sheet: number; enable_student_portal: boolean;
  student_access_code: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  error_message: string | null;
  created_at: string; updated_at: string;
}

export interface ApiBatchList {
  id: string; name: string; subject: string | null;
  status: string; total_sheets: number; processed_sheets: number;
  avg_score: number | null; created_at: string;
}

export interface BatchStatusResponse {
  batch_id: string; status: string;
  total_sheets: number; processed_sheets: number; flagged_count: number;
  progress_percent: number; estimated_remaining_seconds: number;
  sheet_statuses: { sheet_id: string; roll_number: string | null; status: string }[];
}

export const batchesApi = {
  list: (page = 1, pageSize = 50) =>
    api.get<ApiBatchList[]>("/api/v1/batches/", { params: { page, page_size: pageSize } }).then((r) => r.data),
  get: (id: string) =>
    api.get<ApiBatch>(`/api/v1/batches/${id}`).then((r) => r.data),
  create: (data: BatchCreatePayload) =>
    api.post<ApiBatch>("/api/v1/batches/", data).then((r) => r.data),
  status: (id: string) =>
    api.get<BatchStatusResponse>(`/api/v1/batches/${id}/status`).then((r) => r.data),

  uploadSheets: (batchId: string, files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    return api.post<{ batch_id: string; sheets_received: number; sheets: { id: string; filename: string; status: string }[] }>(
      `/api/v1/batches/${batchId}/upload-sheets`, fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    ).then((r) => r.data);
  },

  uploadRubric: (batchId: string, questionPaper: File, markingScheme: File, guidelines: string) => {
    const fd = new FormData();
    fd.append("question_paper", questionPaper);
    fd.append("marking_scheme", markingScheme);
    fd.append("guidelines", guidelines);
    return api.post<{ rubric_id: string; batch_id: string; message: string }>(
      `/api/v1/batches/${batchId}/upload-rubric`, fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    ).then((r) => r.data);
  },

  start: (batchId: string) =>
    api.post<{ message: string; batch_id: string; estimated_time_seconds: number }>(
      `/api/v1/batches/${batchId}/start`
    ).then((r) => r.data),

  results: (batchId: string, page = 1, pageSize = 200) =>
    api.get<{ batch_id: string; total: number; page: number; data: SheetResultRow[] }>(
      `/api/v1/batches/${batchId}/results`,
      { params: { page, page_size: pageSize } }
    ).then((r) => r.data),

  sheetDetail: (batchId: string, sheetId: string) =>
    api.get<SheetDetail>(`/api/v1/batches/${batchId}/sheets/${sheetId}`).then((r) => r.data),

  analytics: (batchId: string) =>
    api.get<BatchAnalytics>(`/api/v1/batches/${batchId}/analytics`).then((r) => r.data),

  exportCsvUrl: (batchId: string) => `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/batches/${batchId}/export/csv`,
  exportExcelUrl: (batchId: string) => `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/batches/${batchId}/export/excel`,
  exportZipUrl: (batchId: string) => `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/batches/${batchId}/export/annotated-zip`,
};

// ─── Results types ────────────────────────────────────────────────────────────

export interface EvalItem {
  q_no: string; awarded_marks: number; max_marks: number;
  verdict: string; student_answer_transcribed?: string;
  reason?: string; ai_confidence?: number;
  bbox?: { x: number; y: number; w: number; h: number };
  is_flagged?: boolean; is_reviewed?: boolean;
  page_number?: number; question_type?: string; id?: string;
}

export interface SheetResultRow {
  sheet_id: string; roll_number: string | null; student_name: string | null;
  status: string; grade: string | null; percentage: number | null;
  total_awarded_marks: number | null; total_max_marks: number | null;
  is_flagged: boolean;
  evaluations: EvalItem[];
}

export interface SheetDetail extends SheetResultRow {
  annotated_page_urls: string[];
  annotated_pdf_url: string | null;
}

export interface BatchAnalytics {
  batch_id: string;
  score_distribution: Record<string, number>;
  grade_distribution: Record<string, number>;
  pass_count: number; fail_count: number;
  per_question_stats: { q_no: string; avg_awarded: number; avg_max: number; avg_percentage: number }[];
  hardest_questions: { q_no: string; avg_percentage: number }[];
  easiest_questions: { q_no: string; avg_percentage: number }[];
}

// ─── Review ────────────────────────────────────────────────────────────────────

export interface ReviewQueueItem {
  review_id: string; sheet_id: string;
  roll_number: string | null; student_name: string | null;
  q_no: number; question_text: string | null;
  student_answer_transcribed: string | null;
  original_ai_score: number; max_marks: number;
  reason: string | null; ai_confidence: number | null;
  page_image_url: string | null;
  bbox_x: number | null; bbox_y: number | null;
  bbox_w: number | null; bbox_h: number | null;
  action: string;
}

export interface ReviewStats {
  pending_count: number; approved_count: number;
  overridden_count: number; recheck_count: number;
}

export const reviewApi = {
  queue: (batchId?: string, page = 1, pageSize = 50) =>
    api.get<ReviewQueueItem[]>("/api/v1/review/queue", {
      params: { ...(batchId ? { batch_id: batchId } : {}), page, page_size: pageSize }
    }).then((r) => r.data),

  stats: () =>
    api.get<ReviewStats>("/api/v1/review/stats").then((r) => r.data),

  approve: (reviewId: string) =>
    api.post(`/api/v1/review/${reviewId}/approve`).then((r) => r.data),

  override: (reviewId: string, overrideScore: number, note?: string) =>
    api.post(`/api/v1/review/${reviewId}/override`, { override_score: overrideScore, note }).then((r) => r.data),

  recheck: (reviewId: string) =>
    api.post(`/api/v1/review/${reviewId}/recheck`).then((r) => r.data),
};
