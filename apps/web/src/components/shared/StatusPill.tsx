import { cn } from "@/lib/utils";

type StatusType = "evaluated" | "flagged" | "pending" | "processing" | "completed" | "failed";

interface StatusPillProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  evaluated: {
    label: "Evaluated",
    className: "bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400",
  },
  flagged: {
    label: "Flagged",
    className: "bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-400",
  },
  pending: {
    label: "Pending",
    className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  },
  processing: {
    label: "Processing",
    className: "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400",
  },
  completed: {
    label: "Completed",
    className: "bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400",
  },
  failed: {
    label: "Failed",
    className: "bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-400",
  },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
