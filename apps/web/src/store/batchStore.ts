/**
 * Batch Zustand store.
 * Manages active batch state, WebSocket event handling, and real-time progress.
 */

import { create } from "zustand";
import type { Batch } from "@/types/batch";

interface SheetStatus {
  sheet_id: string;
  roll_number: string | null;
  status: string;
  student_name?: string;
  total_marks?: number;
  max_marks?: number;
  percentage?: number;
  grade?: string;
  flagged?: boolean;
}

interface RecentCompletion {
  sheet_id: string;
  roll_number: string | null;
  student_name: string | null;
  percentage: number | null;
  grade: string | null;
  flagged: boolean;
  timestamp: string;
}

interface BatchState {
  // Active batch context
  activeBatch: Batch | null;
  setActiveBatch: (batch: Batch | null) => void;

  // Real-time progress
  processedCount: number;
  totalCount: number;
  progressPercent: number;
  sheetStatuses: Record<string, SheetStatus>;
  recentCompletions: RecentCompletion[];
  currentStatus: string;

  // WebSocket event dispatcher
  handleWebSocketEvent: (event: Record<string, unknown>) => void;

  // Reset
  resetProgress: () => void;
}

export const useBatchStore = create<BatchState>((set) => ({
  activeBatch: null,
  setActiveBatch: (batch) => set({ activeBatch: batch }),

  processedCount: 0,
  totalCount: 0,
  progressPercent: 0,
  sheetStatuses: {},
  recentCompletions: [],
  currentStatus: "idle",

  handleWebSocketEvent: (event) => {
    const { type, payload } = event as {
      type: string;
      payload: Record<string, unknown>;
    };

    set((state) => {
      switch (type) {
        case "initial_status":
          return {
            currentStatus: (payload.status as string) ?? state.currentStatus,
            totalCount: (payload.total_sheets as number) ?? state.totalCount,
            processedCount: (payload.processed_sheets as number) ?? state.processedCount,
            progressPercent: (payload.progress_percent as number) ?? state.progressPercent,
          };

        case "batch_started":
          return {
            currentStatus: "processing",
            totalCount: (payload.total_sheets as number) ?? state.totalCount,
            processedCount: 0,
            progressPercent: 0,
          };

        case "sheet_converting":
        case "sheet_extracting":
        case "sheet_evaluating":
        case "sheet_annotating": {
          const sheetId = payload.sheet_id as string;
          return {
            sheetStatuses: {
              ...state.sheetStatuses,
              [sheetId]: {
                ...(state.sheetStatuses[sheetId] ?? {}),
                sheet_id: sheetId,
                roll_number: (payload.roll_number as string) ?? null,
                status: type.replace("sheet_", ""),
              },
            },
          };
        }

        case "sheet_completed": {
          const sheetId = payload.sheet_id as string;
          const completion: RecentCompletion = {
            sheet_id: sheetId,
            roll_number: (payload.roll_number as string) ?? null,
            student_name: (payload.student_name as string) ?? null,
            percentage: (payload.percentage as number) ?? null,
            grade: (payload.grade as string) ?? null,
            flagged: (payload.flagged as boolean) ?? false,
            timestamp: new Date().toISOString(),
          };
          return {
            sheetStatuses: {
              ...state.sheetStatuses,
              [sheetId]: {
                sheet_id: sheetId,
                roll_number: (payload.roll_number as string) ?? null,
                status: "completed",
                student_name: (payload.student_name as string) ?? undefined,
                percentage: (payload.percentage as number) ?? undefined,
                grade: (payload.grade as string) ?? undefined,
                flagged: (payload.flagged as boolean) ?? false,
              },
            },
            recentCompletions: [completion, ...state.recentCompletions].slice(0, 50),
          };
        }

        case "progress_update":
          return {
            processedCount: (payload.processed as number) ?? state.processedCount,
            totalCount: (payload.total as number) ?? state.totalCount,
            progressPercent: (payload.progress_percent as number) ?? state.progressPercent,
          };

        case "batch_completed":
          return { currentStatus: "completed" };

        default:
          return {};
      }
    });
  },

  resetProgress: () =>
    set({
      processedCount: 0,
      totalCount: 0,
      progressPercent: 0,
      sheetStatuses: {},
      recentCompletions: [],
      currentStatus: "idle",
    }),
}));
