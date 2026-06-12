"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, LayoutDashboard, Upload, FolderOpen, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Batch", href: "/upload", icon: Upload },
  { label: "All Batches", href: "/batches", icon: FolderOpen },
  { label: "Review Queue", href: "/review", icon: AlertCircle, badge: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const { mobileSidebarOpen, setMobileSidebarOpen, reviewQueueCount } = useUIStore();

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 lg:hidden"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">{APP_NAME}</span>
              </Link>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-surface-100 dark:hover:bg-neutral-800"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
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
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "relative flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400"
                        : "text-neutral-600 hover:bg-surface-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-600" />
                    )}
                    <Icon className={cn("h-4 w-4", isActive ? "text-primary-600" : "text-neutral-400")} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && reviewQueueCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1.5 text-xs font-semibold text-white">
                        {reviewQueueCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
