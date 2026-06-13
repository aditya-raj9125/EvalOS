"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 text-center dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 p-8 rounded-3xl shadow-card space-y-6"
      >
        <div className="rounded-full bg-danger-50 p-4 text-danger-650 dark:bg-danger-950/20 dark:text-danger-400 w-16 h-16 mx-auto flex items-center justify-center animate-bounce">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Something went wrong!
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={() => reset()}
            className="btn-primary w-full h-11 justify-center flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
