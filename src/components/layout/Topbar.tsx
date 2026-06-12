"use client";

import { usePathname } from "next/navigation";
import { Bell, Sun, Moon, Menu, User, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your evaluation batches" },
  "/upload": { title: "Upload Batch", subtitle: "Upload answer sheets and configure evaluation" },
  "/batches": { title: "All Batches", subtitle: "View and manage your evaluation batches" },
  "/review": { title: "Review Queue", subtitle: "Manually review flagged AI evaluations" },
  "/settings": { title: "Settings", subtitle: "Manage your account and preferences" },
};

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { setMobileSidebarOpen, reviewQueueCount, sidebarOpen } = useUIStore();

  const routeInfo = Object.entries(routeTitles).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  );
  const pageTitle = routeInfo?.[1]?.title ?? "EvalAI";

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 transition-all duration-150 ease-out dark:border-neutral-800 dark:bg-neutral-950",
        sidebarOpen ? "left-64" : "left-16"
      )}
    >
      {/* Left: mobile menu + page title */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-sidebar-trigger"
          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-surface-100 lg:hidden dark:hover:bg-neutral-800"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-neutral-900 dark:text-white">
          {pageTitle}
        </h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-surface-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button
          id="notifications-btn"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-surface-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {reviewQueueCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger-600 text-[9px] font-bold text-white">
              {reviewQueueCount > 9 ? "9+" : reviewQueueCount}
            </span>
          )}
        </button>

        {/* Avatar dropdown */}
        <button
          id="user-avatar-btn"
          className="flex h-9 items-center gap-2 rounded-md px-2 text-neutral-700 transition-colors hover:bg-surface-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          aria-label="User menu"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
            T
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        </button>
      </div>
    </header>
  );
}
