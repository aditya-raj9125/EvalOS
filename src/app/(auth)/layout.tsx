"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-surface-50 py-12 sm:px-6 lg:px-8 dark:bg-neutral-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-card transition-all duration-150 group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {APP_NAME}
          </span>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white px-4 py-8 shadow-elevated rounded-3xl sm:px-10 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
