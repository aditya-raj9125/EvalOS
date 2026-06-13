import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  activeModal: string | null;
  reviewQueueCount: number;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setReviewQueueCount: (count: number) => void;
  decrementReviewQueueCount: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  activeModal: null,
  reviewQueueCount: 0,

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
  setReviewQueueCount: (reviewQueueCount) => set({ reviewQueueCount }),
  decrementReviewQueueCount: () =>
    set((state) => ({
      reviewQueueCount: Math.max(0, state.reviewQueueCount - 1),
    })),
}));
