"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  AlertCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Upload Batch",
    href: "/upload",
    icon: Upload,
  },
  {
    label: "All Batches",
    href: "/batches",
    icon: FolderOpen,
  },
  {
    label: "Review Queue",
    href: "/review",
    icon: AlertCircle,
    badge: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, reviewQueueCount } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-full flex-col border-r border-neutral-200 bg-white transition-all duration-150 ease-out dark:border-neutral-800 dark:bg-neutral-950",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-neutral-900 dark:text-white">{APP_NAME}</span>
          </Link>
        )}
        <button
          id="sidebar-toggle-btn"
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-surface-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 pt-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href as any}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "group relative flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ease-out",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400"
                  : "text-neutral-600 hover:bg-surface-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              {/* Active left accent bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-600" />
              )}

              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
                )}
              />

              {sidebarOpen && (
                <span className="flex-1 truncate">{item.label}</span>
              )}

              {/* Badge */}
              {item.badge && reviewQueueCount > 0 && sidebarOpen && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1.5 text-xs font-semibold text-white">
                  {reviewQueueCount > 99 ? "99+" : reviewQueueCount}
                </span>
              )}

              {/* Collapsed badge */}
              {item.badge && reviewQueueCount > 0 && !sidebarOpen && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger-600 text-[10px] font-bold text-white">
                  {reviewQueueCount > 9 ? "9+" : reviewQueueCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              T
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">Teacher</p>
              <p className="truncate text-xs text-neutral-500">teacher@school.edu</p>
            </div>
            <button
              id="signout-btn"
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-surface-100 hover:text-danger-600 dark:hover:bg-neutral-800"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            id="signout-collapsed-btn"
            className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-surface-100 hover:text-danger-600 dark:hover:bg-neutral-800"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
