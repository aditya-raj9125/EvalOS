import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger-200 bg-danger-50 px-8 py-12 text-center dark:border-danger-900 dark:bg-danger-950/30">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-100 dark:bg-danger-900/50">
        <AlertCircle className="h-7 w-7 text-danger-600 dark:text-danger-400" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-900 dark:text-white">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-danger-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
}
