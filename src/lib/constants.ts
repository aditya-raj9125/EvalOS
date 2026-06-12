import { env } from "./env";

export const API_BASE_URL = env.NEXT_PUBLIC_API_URL;
export const WS_URL = env.NEXT_PUBLIC_WS_URL;
export const APP_NAME = env.NEXT_PUBLIC_APP_NAME;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",

  // Batches
  BATCHES: "/batches",
  BATCH: (id: string) => `/batches/${id}`,
  BATCH_SHEETS: (id: string) => `/batches/${id}/sheets`,
  BATCH_PROGRESS: (id: string) => `/batches/${id}/progress`,
  BATCH_EXPORT_CSV: (id: string) => `/batches/${id}/export/csv`,
  BATCH_EXPORT_ZIP: (id: string) => `/batches/${id}/export/zip`,

  // Sheets
  SHEET: (batchId: string, sheetId: string) =>
    `/batches/${batchId}/sheets/${sheetId}`,

  // Review
  REVIEW_QUEUE: "/review",
  REVIEW_ACTION: (flaggedId: string) => `/review/${flaggedId}`,

  // Student
  STUDENT_RESULT: (rollNumber: string) => `/student/${rollNumber}`,

  // Upload
  UPLOAD: "/upload",
} as const;

export const UPLOAD_CONFIG = {
  MAX_FILES: 500,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ACCEPTED_TYPES: {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "application/zip": [".zip"],
    "application/x-zip-compressed": [".zip"],
  },
} as const;

export const PAGINATION = {
  PAGE_SIZE: 50,
  REVIEW_PAGE_SIZE: 20,
} as const;

export const QUERY_KEYS = {
  BATCHES: ["batches"] as const,
  BATCH: (id: string) => ["batch", id] as const,
  BATCH_SHEETS: (id: string) => ["batch-sheets", id] as const,
  BATCH_PROGRESS: (id: string) => ["batch-progress", id] as const,
  REVIEW_QUEUE: ["review-queue"] as const,
  STUDENT_RESULT: (rollNumber: string) =>
    ["student-result", rollNumber] as const,
  ME: ["me"] as const,
} as const;

export const GRADE_LABELS: Record<string, string> = {
  A: "90-100%",
  B: "75-89%",
  C: "60-74%",
  D: "45-59%",
  F: "Below 45%",
};

export function getGrade(percentage: number): string {
  if (percentage >= 90) return "A";
  if (percentage >= 75) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 45) return "D";
  return "F";
}
