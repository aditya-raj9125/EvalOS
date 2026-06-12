import { create } from "zustand";
import type { Batch } from "@/types/batch";

interface BatchState {
  activeBatch: Batch | null;
  setActiveBatch: (batch: Batch | null) => void;
}

export const useBatchStore = create<BatchState>((set) => ({
  activeBatch: null,
  setActiveBatch: (activeBatch) => set({ activeBatch }),
}));
