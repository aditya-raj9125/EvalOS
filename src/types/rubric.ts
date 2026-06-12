export interface Question {
  id: string;
  number: number;
  text: string;
  maxMarks: number;
  subQuestions?: Question[];
}

export interface MarkingSchemeEntry {
  questionId: string;
  modelAnswer: string;
  keywords: string[];
  partialCreditAllowed: boolean;
  markingNotes?: string;
}

export interface Rubric {
  id: string;
  batchId: string;
  questionPaperUrl: string;
  markingSchemeUrl: string;
  questions: Question[];
  markingScheme: MarkingSchemeEntry[];
  specialGuidelines?: string;
  totalMarks: number;
  uploadedAt: string;
}
