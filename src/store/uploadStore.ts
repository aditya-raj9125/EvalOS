import { create } from "zustand";

export type UploadStep = 1 | 2 | 3 | 4;

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface UploadState {
  step: UploadStep;
  answerSheets: UploadFile[];
  questionPaper: File | null;
  markingScheme: File | null;
  guidelines: string;
  batchName: string;
  subject: string;
  expectedMarks: number;
  enableStudentPortal: boolean;
  accessCode: string;
  notifyOnComplete: boolean;
  isSubmitting: boolean;

  setStep: (step: UploadStep) => void;
  setAnswerSheets: (files: UploadFile[]) => void;
  addAnswerSheets: (files: File[]) => void;
  removeAnswerSheet: (id: string) => void;
  updateFileProgress: (id: string, progress: number, status: UploadFile["status"]) => void;
  setQuestionPaper: (file: File | null) => void;
  setMarkingScheme: (file: File | null) => void;
  setGuidelines: (text: string) => void;
  setBatchConfig: (config: Partial<Pick<UploadState,
    "batchName" | "subject" | "expectedMarks" |
    "enableStudentPortal" | "accessCode" | "notifyOnComplete"
  >>) => void;
  setIsSubmitting: (val: boolean) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as UploadStep,
  answerSheets: [],
  questionPaper: null,
  markingScheme: null,
  guidelines: "",
  batchName: "",
  subject: "",
  expectedMarks: 100,
  enableStudentPortal: false,
  accessCode: "",
  notifyOnComplete: false,
  isSubmitting: false,
};

export const useUploadStore = create<UploadState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setAnswerSheets: (answerSheets) => set({ answerSheets }),

  addAnswerSheets: (files) =>
    set((state) => ({
      answerSheets: [
        ...state.answerSheets,
        ...files.map((file) => ({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          progress: 0,
          status: "pending" as const,
        })),
      ],
    })),

  removeAnswerSheet: (id) =>
    set((state) => ({
      answerSheets: state.answerSheets.filter((f) => f.id !== id),
    })),

  updateFileProgress: (id, progress, status) =>
    set((state) => ({
      answerSheets: state.answerSheets.map((f) =>
        f.id === id ? { ...f, progress, status } : f
      ),
    })),

  setQuestionPaper: (questionPaper) => set({ questionPaper }),
  setMarkingScheme: (markingScheme) => set({ markingScheme }),
  setGuidelines: (guidelines) => set({ guidelines }),

  setBatchConfig: (config) => set((state) => ({ ...state, ...config })),

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  reset: () => set(initialState),
}));
