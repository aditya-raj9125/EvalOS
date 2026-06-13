"use client";

import { Award, Percent, ClipboardCheck, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getScoreColor } from "@/lib/utils";

interface StudentScoreCardProps {
  studentName: string;
  rollNumber: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
}

export function StudentScoreCard({
  studentName,
  rollNumber,
  totalScore,
  maxScore,
  percentage,
}: StudentScoreCardProps) {
  const statusColor = getScoreColor(totalScore, maxScore);

  const colors = {
    success: "text-success-600 dark:text-success-400 border-success-200 dark:border-success-800 bg-success-50/20",
    warning: "text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-800 bg-warning-50/20",
    danger: "text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800 bg-danger-50/20",
  };

  const getLetterGrade = (pct: number) => {
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    return "F";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-card">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="rounded-full bg-primary-50 dark:bg-primary-950 p-3 text-primary-650">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Student</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white block">{studentName}</span>
            <span className="text-xs text-neutral-450 block">Roll: {rollNumber}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-card">
        <CardContent className="p-6 flex items-center gap-4">
          <div className={`rounded-full p-3 ${colors[statusColor]}`}>
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Awarded Marks</span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white block">
              {totalScore} <span className="text-sm font-medium text-neutral-500">/ {maxScore}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-card">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="rounded-full bg-primary-50 dark:bg-primary-950 p-3 text-primary-650">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Grade Result</span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white block">
              {percentage.toFixed(1)}% <span className="text-sm font-medium text-neutral-500">({getLetterGrade(percentage)})</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
