"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { reviewApi } from "@/lib/apiClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setReviewQueueCount } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch real review queue count for sidebar badge
  useEffect(() => {
    if (!isAuthenticated) return;
    reviewApi.stats()
      .then((stats) => setReviewQueueCount(stats.pending_count))
      .catch(() => {});
  }, [isAuthenticated, setReviewQueueCount]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-neutral-950">
      <Sidebar />
      <MobileSidebar />
      <div className={`flex flex-col min-h-screen transition-all duration-200 ${sidebarOpen ? "lg:pl-64" : "lg:pl-20"}`}>
        <Topbar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
