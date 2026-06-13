"use client";

import { CheckCircle2, AlertTriangle, FileText, BarChart3, Clock, Loader2 } from "lucide-react";
import type { Batch } from "@/types/batch";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface BatchSummaryCardProps {
  batch: Batch;
}

export function BatchSummaryCard({ batch }: BatchSummaryCardProps) {
  const isProcessing = batch.status === "processing";
  const progressPercentage = batch.totalSheets > 0 ? (batch.completedSheets / batch.totalSheets) * 100 : 0;

  const stats = [
    {
      label: "Total Sheets",
      value: batch.totalSheets,
      icon: FileText,
      color: "text-primary-600 dark:text-primary-400",
    },
    {
      label: "Completed",
      value: `${batch.completedSheets}/${batch.totalSheets}`,
      icon: CheckCircle2,
      color: "text-success-600 dark:text-success-400",
    },
    {
      label: "Flagged Sheets",
      value: batch.flaggedSheets,
      icon: AlertTriangle,
      color: batch.flaggedSheets > 0 ? "text-warning-600 dark:text-warning-400 animate-pulse" : "text-neutral-400",
    },
    {
      label: "Average Percentage",
      value: batch.status === "completed" ? `${batch.averagePercentage}%` : "--",
      icon: BarChart3,
      color: "text-primary-600 dark:text-primary-400",
    },
  ];

  return (
    <Card className="bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 shadow-card rounded-3xl overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-505 dark:text-neutral-400 uppercase tracking-wider">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {isProcessing && (
          <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-4 animate-pulse">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-primary-600 dark:text-primary-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI is evaluating answer sheets...
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-neutral-100 dark:bg-neutral-800" />
            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Est. time remaining: ~3 minutes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
