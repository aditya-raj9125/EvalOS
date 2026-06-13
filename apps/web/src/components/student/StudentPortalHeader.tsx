"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function StudentPortalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-card transition-all duration-150 group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">
            {APP_NAME} <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full dark:bg-primary-950 dark:text-primary-400 ml-1.5">Student Portal</span>
          </span>
        </Link>

        <div className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          Public Verification Link
        </div>
      </div>
    </header>
  );
}
