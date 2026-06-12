import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-surface-50 px-8 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900/50",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mb-6 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
