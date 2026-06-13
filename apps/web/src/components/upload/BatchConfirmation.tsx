"use client";

import { CheckCircle2, FileText, Globe, Bell, Eye, EyeOff } from "lucide-react";
import { useUploadStore } from "@/store/uploadStore";

export function BatchConfirmation() {
  const {
    batchName,
    subject,
    expectedMarks,
    enableStudentPortal,
    accessCode,
    notifyOnComplete,
    answerSheets,
    questionPaper,
    markingScheme,
    guidelines,
  } = useUploadStore();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 p-6 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-card">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Batch Summary</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div className="border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <dt className="text-neutral-500 dark:text-neutral-400 font-medium">Batch Name</dt>
            <dd className="text-neutral-900 dark:text-white font-semibold mt-0.5">{batchName || "N/A"}</dd>
          </div>
          <div className="border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <dt className="text-neutral-500 dark:text-neutral-400 font-medium">Subject</dt>
            <dd className="text-neutral-900 dark:text-white font-semibold mt-0.5">{subject || "N/A"}</dd>
          </div>
          <div className="border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <dt className="text-neutral-500 dark:text-neutral-400 font-medium">Expected Marks per Paper</dt>
            <dd className="text-neutral-900 dark:text-white font-semibold mt-0.5">{expectedMarks}</dd>
          </div>
          <div className="border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <dt className="text-neutral-500 dark:text-neutral-400 font-medium">Answer Sheets Count</dt>
            <dd className="text-neutral-900 dark:text-white font-semibold mt-0.5">{answerSheets.length} files</dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rubrics Card */}
        <div className="rounded-2xl border border-neutral-200 p-6 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-card">
          <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            Evaluation Rubrics
          </h4>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-400" />
              Question Paper: <span className="font-medium text-neutral-850 dark:text-neutral-200 truncate">{questionPaper?.name}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-400" />
              Marking Scheme: <span className="font-medium text-neutral-850 dark:text-neutral-200 truncate">{markingScheme?.name}</span>
            </li>
          </ul>
        </div>

        {/* Configurations Card */}
        <div className="rounded-2xl border border-neutral-200 p-6 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-card">
          <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            Portal & Notifications
          </h4>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-center gap-2">
              {enableStudentPortal ? (
                <>
                  <Eye className="h-4 w-4 text-success-600 dark:text-success-400" />
                  <span>Student Portal: Enabled (Code: <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono dark:bg-neutral-800">{accessCode}</code>)</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-neutral-400" />
                  <span>Student Portal: Disabled</span>
                </>
              )}
            </li>
            <li className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span>Email notification on completion: {notifyOnComplete ? "Yes" : "No"}</span>
            </li>
          </ul>
        </div>
      </div>

      {guidelines && (
        <div className="rounded-2xl border border-neutral-200 p-6 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-card">
          <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Special Guidelines</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
            {guidelines}
          </p>
        </div>
      )}
    </div>
  );
}
