"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 text-center dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 p-8 rounded-3xl shadow-card space-y-6"
      >
        <div className="rounded-full bg-primary-50 p-4 text-primary-600 dark:bg-primary-950 dark:text-primary-400 w-16 h-16 mx-auto flex items-center justify-center animate-pulse">
          <HelpCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sorry, we couldn't find the page you are looking for. It might have been moved or deleted.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="btn-primary w-full h-11 justify-center flex items-center gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
