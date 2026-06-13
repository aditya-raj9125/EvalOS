export type BatchStatus = "pending" | "processing" | "completed" | "failed";
export type SheetStatus = "pending" | "evaluated" | "flagged";

export interface Batch {
  id: string;
  name: string;
  subject: string;
  expectedMarks: number;
  totalSheets: number;
  completedSheets: number;
  flaggedSheets: number;
  averageScore: number;
  averagePercentage: number;
  status: BatchStatus;
  enableStudentPortal: boolean;
  accessCode?: string;
  createdAt: string;
  completedAt?: string;
  timeTakenSeconds?: number;
  teacherId: string;
}

export interface BatchProgress {
  batchId: string;
  totalSheets: number;
  completedSheets: number;
  flaggedSheets: number;
  estimatedRemainingSeconds: number;
  status: BatchStatus;
}

export interface QuestionScore {
  questionNumber: number;
  awardedMarks: number;
  maxMarks: number;
  studentAnswer: string;
  aiReason: string;
  isFlagged: boolean;
  confidence: number;
}

export interface Sheet {
  id: string;
  batchId: string;
  rollNumber: string;
  studentName?: string;
  status: SheetStatus;
  totalScore: number;
  maxScore: number;
  percentage: number;
  questionScores: QuestionScore[];
  annotatedImageUrl?: string;
  originalImageUrl?: string;
  aiConfidence: number;
  evaluatedAt?: string;
  flagReason?: string;
}

export interface BatchListItem {
  id: string;
  name: string;
  subject: string;
  totalSheets: number;
  completedSheets: number;
  status: BatchStatus;
  averagePercentage: number;
  createdAt: string;
}
