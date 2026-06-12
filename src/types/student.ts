export interface StudentResult {
  rollNumber: string;
  studentName: string;
  batchId: string;
  batchName: string;
  subject: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  evaluatedAt: string;
  questionBreakdown: StudentQuestionResult[];
  annotatedSheetUrl?: string;
}

export interface StudentQuestionResult {
  questionNumber: number;
  awardedMarks: number;
  maxMarks: number;
  feedback: string;
  isCorrect: boolean;
  isPartial: boolean;
}
