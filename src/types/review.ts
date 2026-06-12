export type ReviewActionType = "approve" | "override" | "recheck";

export interface FlaggedAnswer {
  id: string;
  batchId: string;
  sheetId: string;
  rollNumber: string;
  studentName?: string;
  questionNumber: number;
  studentAnswer: string;
  aiScore: number;
  maxScore: number;
  aiReason: string;
  aiConfidence: number;
  annotatedRegionUrl?: string;
  flaggedAt: string;
  status: "pending" | "resolved";
}

export interface ReviewAction {
  flaggedAnswerId: string;
  action: ReviewActionType;
  overrideScore?: number;
  reviewerNote?: string;
  reviewedAt: string;
}
