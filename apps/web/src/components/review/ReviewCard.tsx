"use client";

import { AlertTriangle } from "lucide-react";
import { ConfidenceBadge } from "@/components/results/ConfidenceBadge";
import { ScoreBadge } from "@/components/results/ScoreBadge";
import { Card, CardContent } from "@/components/ui/card";

export interface FlaggedItem {
  id: string;
  sheetId: string;
  batchId: string;
  batchName: string;
  rollNumber: string;
  questionNumber: number;
  maxMarks: number;
  aiScore: number;
  confidence: number;
  reason: string;
  studentAnswer: string;
  // Real API fields (optional)
  pageImageUrl?: string;
  bboxX?: number;
  bboxY?: number;
  bboxW?: number;
  bboxH?: number;
  questionText?: string;
}

interface ReviewCardProps {
  item: FlaggedItem;
  isActive: boolean;
  onClick: () => void;
}

export function ReviewCard({ item, isActive, onClick }: ReviewCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-150 rounded-2xl border ${
        isActive
          ? "border-primary-600 ring-1 ring-primary-650 bg-primary-50/10 dark:border-primary-500 dark:bg-primary-950/20"
          : "border-neutral-200 hover:border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      }`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {item.batchName}
          </span>
          <ConfidenceBadge confidence={item.confidence} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-neutral-905 dark:text-white">
              Roll No: {item.rollNumber}
            </h4>
            <span className="font-bold text-xs text-primary-600 dark:text-primary-400">
              Q{item.questionNumber}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-warning-500 shrink-0" />
            AI score: <ScoreBadge score={item.aiScore} maxScore={item.maxMarks} className="scale-90" />
          </p>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-300 italic line-clamp-2 border-t border-neutral-100 dark:border-neutral-800 pt-2">
          Reason: {item.reason}
        </p>
      </CardContent>
    </Card>
  );
}
