"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  let colorClass = "";
  if (confidence >= 85) {
    colorClass = "bg-success-50 text-success-700 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-800";
  } else if (confidence >= 70) {
    colorClass = "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-950 dark:text-warning-400 dark:border-warning-800";
  } else {
    colorClass = "bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-950 dark:text-danger-400 dark:border-danger-800";
  }

  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 text-xs font-semibold rounded-full border", colorClass, className)}
    >
      {confidence}%
    </Badge>
  );
}
