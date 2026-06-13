"use client";

import { cn, getScoreColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ScoreBadgeProps {
  score: number;
  maxScore: number;
  className?: string;
}

export function ScoreBadge({ score, maxScore, className }: ScoreBadgeProps) {
  const status = getScoreColor(score, maxScore);

  const colors = {
    success: "bg-success-50 text-success-700 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-800",
    warning: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-950 dark:text-warning-400 dark:border-warning-800",
    danger: "bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-950 dark:text-danger-400 dark:border-danger-800",
  };

  return (
    <Badge
      variant="outline"
      className={cn("px-2 py-0.5 font-semibold text-xs rounded-full border", colors[status], className)}
    >
      {score}/{maxScore}
    </Badge>
  );
}
