"use client";

import { useState } from "react";
import { AlertTriangle, Edit3, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Sheet, QuestionScore } from "@/types/batch";
import { AnnotationOverlay, type Annotation } from "./AnnotationOverlay";
import { ScoreBadge } from "./ScoreBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SheetViewerProps {
  sheet: Sheet;
  onOverrideScore?: (questionNumber: number, newScore: number, reason: string) => void;
}

export function SheetViewer({ sheet, onOverrideScore }: SheetViewerProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionScore | null>(null);
  const [overrideScoreVal, setOverrideScoreVal] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Map sheet.questionScores to absolute position markers for AnnotationOverlay
  const mockAnnotations: Annotation[] = sheet.questionScores.map((q, idx) => {
    // Generate distinct coordinates based on question number for demo purposes
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

  const handleOpenOverride = (q: QuestionScore) => {
    setSelectedQuestion(q);
    setOverrideScoreVal(q.awardedMarks.toString());
    setOverrideReason("");
  };

  const handleSaveOverride = async () => {
    if (!selectedQuestion) return;
    const val = parseFloat(overrideScoreVal);
    if (isNaN(val) || val < 0 || val > selectedQuestion.maxMarks) {
      toast.error(`Please enter a valid score between 0 and ${selectedQuestion.maxMarks}.`);
      return;
    }
    if (!overrideReason.trim() || overrideReason.length < 10) {
      toast.error("Please provide a reason of at least 10 characters.");
      return;
    }

    setIsSaving(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (onOverrideScore) {
      onOverrideScore(selectedQuestion.questionNumber, val, overrideReason);
    }
    
    setIsSaving(false);
    setSelectedQuestion(null);
    toast.success(`Updated Score for Q${selectedQuestion.questionNumber} to ${val}`);
  };

  return (
    <div className="space-y-6 overflow-y-auto h-full pb-10">
      {/* Annotated Image Panel */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
          Annotated Sheet Preview
        </h4>
        <AnnotationOverlay
          imageUrl={sheet.annotatedImageUrl || "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=600&auto=format&fit=crop"}
          annotations={mockAnnotations}
        />
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Questions Breakdown
        </h4>
        <div className="space-y-3">
          {sheet.questionScores.map((q) => (
            <div
              key={q.questionNumber}
              className={`p-4 rounded-2xl border transition-all ${
                q.isFlagged
                  ? "border-warning-300 bg-warning-50/20 dark:border-warning-800/40 dark:bg-warning-950/10"
                  : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    Q{q.questionNumber}
                  </span>
                  <ScoreBadge score={q.awardedMarks} maxScore={q.maxMarks} />
                  <ConfidenceBadge confidence={q.confidence} />
                  {q.isFlagged && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning-700 bg-warning-50 px-2 py-0.5 rounded-full dark:bg-warning-950/50 dark:text-warning-400">
                      <AlertTriangle className="h-3 w-3" />
                      Flagged
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenOverride(q)}
                  className="btn-ghost text-xs h-7 px-2 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" />
                  Override
                </Button>
              </div>

              {/* Transcribed Answer & Reason */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-neutral-500 dark:text-neutral-400">
                    Transcribed Answer
                  </span>
                  <p className="mt-1 text-neutral-800 dark:text-neutral-200 bg-surface-50 p-2.5 rounded-xl border border-neutral-100 dark:bg-neutral-950/50 dark:border-neutral-800 italic">
                    "{q.studentAnswer}"
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-neutral-500 dark:text-neutral-400">
                    AI Evaluation Reason
                  </span>
                  <p className="mt-1 text-neutral-800 dark:text-neutral-200 p-2.5">
                    {q.aiReason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Override Dialog */}
      <Dialog open={selectedQuestion !== null} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl">
          <DialogHeader>
            <DialogTitle>Override Score for Q{selectedQuestion?.questionNumber}</DialogTitle>
            <DialogDescription>
              Modify the marks awarded by the AI checking engine. Please provide an audit reason.
            </DialogDescription>
          </DialogHeader>

          {selectedQuestion && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="marks">Awarded Marks (Max: {selectedQuestion.maxMarks})</Label>
                <Input
                  id="marks"
                  type="number"
                  value={overrideScoreVal}
                  onChange={(e) => setOverrideScoreVal(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="reason">Audit Reason</Label>
                <textarea
                  id="reason"
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Awarded partial credit for correct formula usage despite wrong final answer."
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all duration-150 ease-out focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setSelectedQuestion(null)}
              className="btn-ghost border border-neutral-200 dark:border-neutral-800"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveOverride} disabled={isSaving} className="btn-primary">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Override"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
