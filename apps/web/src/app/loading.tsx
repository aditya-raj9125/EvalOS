"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-spin" />
        <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          Loading EvalAI...
        </p>
      </div>
    </div>
  );
}
