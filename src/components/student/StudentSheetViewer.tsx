"use client";

import type { Sheet } from "@/types/batch";
import { AnnotationOverlay, type Annotation } from "@/components/results/AnnotationOverlay";
import { ScoreBadge } from "@/components/results/ScoreBadge";

interface StudentSheetViewerProps {
  sheet: Sheet;
}

export function StudentSheetViewer({ sheet }: StudentSheetViewerProps) {
  // Map scores to layout coordinates
  const annotations: Annotation[] = sheet.questionScores.map((q, idx) => {
    const coords = [
      { x: 25, y: 30 },
      { x: 70, y: 45 },
      { x: 30, y: 65 },
      { x: 65, y: 80 },
    ];
    const coord = coords[idx % coords.length];
    return {
      id: `ann-${q.questionNumber}`,
      x: coord.x,
      y: coord.y,
      type: q.awardedMarks === q.maxMarks ? "tick" : q.awardedMarks === 0 ? "cross" : "half",
      questionNumber: q.questionNumber,
      marks: `${q.awardedMarks}/${q.maxMarks}`,
      comment: q.aiReason,
    };
  });

  return (
    <div className="space-y-8">
      {/* Annotated sheet display */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Your Evaluated Sheet</h3>
        <p className="text-xs text-neutral-500">
          Hover or tap on tick/cross marks to view teacher/AI feedback details directly.
        </p>
        <AnnotationOverlay
          imageUrl={sheet.annotatedImageUrl || "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop"}
          annotations={annotations}
        />
      </div>

      {/* Breakdown feedback table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Question-by-Question Feedback</h3>
        <div className="space-y-4">
          {sheet.questionScores.map((q) => (
            <div
              key={q.questionNumber}
              className="p-5 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  Question {q.questionNumber}
                </span>
                <ScoreBadge score={q.awardedMarks} maxScore={q.maxMarks} />
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Your Answer
                  </span>
                  <p className="mt-1 text-neutral-850 dark:text-neutral-200 bg-surface-50 p-3 rounded-xl border border-neutral-100 dark:bg-neutral-950/50 dark:border-neutral-800 italic">
                    "{q.studentAnswer}"
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Evaluation Comments
                  </span>
                  <p className="mt-1 text-neutral-700 dark:text-neutral-350 p-2.5">
                    {q.aiReason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
