"use client";

import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useUploadStore } from "@/store/uploadStore";
import { Progress } from "@/components/ui/progress";

export function UploadProgress() {
  const { answerSheets } = useUploadStore();

  return (
    <div className="space-y-4 max-w-xl mx-auto p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-card">
      <div className="text-center pb-4">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Uploading Batch</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Please wait while your files are uploaded to our secure evaluation engine.
        </p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {answerSheets.map((fileObj) => (
          <div key={fileObj.id} className="space-y-1.5 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-surface-50/50 dark:bg-neutral-950/20">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[70%]">
                {fileObj.file.name}
              </span>
              <span className="flex items-center gap-1">
                {fileObj.status === "uploading" && (
                  <span className="text-primary-600 dark:text-primary-400 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {fileObj.progress}%
                  </span>
                )}
                {fileObj.status === "done" && (
                  <span className="text-success-600 dark:text-success-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Done
                  </span>
                )}
                {fileObj.status === "error" && (
                  <span className="text-danger-600 dark:text-danger-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Error
                  </span>
                )}
                {fileObj.status === "pending" && (
                  <span className="text-neutral-400 dark:text-neutral-500">
                    Queueing...
                  </span>
                )}
              </span>
            </div>
            {fileObj.status === "uploading" && (
              <Progress value={fileObj.progress} className="h-1 bg-neutral-100 dark:bg-neutral-800" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
