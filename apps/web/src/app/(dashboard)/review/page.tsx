"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Inbox, Loader2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { ReviewCard, type FlaggedItem } from "@/components/review/ReviewCard";
import { ReviewActions } from "@/components/review/ReviewActions";
import { AnnotationOverlay, type Annotation } from "@/components/results/AnnotationOverlay";
import { PageHeader } from "@/components/shared/PageHeader";
import { reviewApi, type ReviewQueueItem } from "@/lib/apiClient";

function queueItemToFlaggedItem(item: ReviewQueueItem): FlaggedItem {
  return {
    id: item.review_id,
    sheetId: item.sheet_id,
    batchId: "",
    batchName: item.roll_number ? `Roll: ${item.roll_number}` : "Unknown Sheet",
    rollNumber: item.roll_number ?? "—",
    questionNumber: item.q_no,
    maxMarks: item.max_marks,
    aiScore: item.original_ai_score,
    confidence: Math.round((item.ai_confidence ?? 0.7) * 100),
    reason: item.reason ?? "Low AI confidence",
    studentAnswer: item.student_answer_transcribed ?? "(No transcription available)",
    // Extra fields for the review panel
    pageImageUrl: item.page_image_url ?? undefined,
    bboxX: item.bbox_x ?? undefined,
    bboxY: item.bbox_y ?? undefined,
    bboxW: item.bbox_w ?? undefined,
    bboxH: item.bbox_h ?? undefined,
    questionText: item.question_text ?? undefined,
  };
}

export default function ReviewQueuePage() {
  const [items, setItems] = useState<FlaggedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { setReviewQueueCount, decrementReviewQueueCount } = useUIStore();

  useEffect(() => {
    reviewApi.queue()
      .then((queueItems) => {
        const mapped = queueItems.map(queueItemToFlaggedItem);
        setItems(mapped);
        setReviewQueueCount(mapped.length);
        if (mapped.length > 0) setSelectedId(mapped[0].id);
      })
      .catch(() => toast.error("Failed to load review queue"))
      .finally(() => setLoading(false));
  }, [setReviewQueueCount]);

  const activeItem = items.find((i) => i.id === selectedId) || null;

  // Build annotation for the right panel from the active item's bbox
  const activeAnnotations: Annotation[] = activeItem
    ? [
        {
          id: `ann-${activeItem.id}`,
          // Convert bbox fractions to pixel percentages for AnnotationOverlay
          x: Math.round((activeItem.bboxX ?? 0.1) * 100),
          y: Math.round((activeItem.bboxY ?? 0.4) * 100),
          type: activeItem.aiScore === activeItem.maxMarks ? "tick" : activeItem.aiScore === 0 ? "cross" : "half",
          questionNumber: activeItem.questionNumber,
          marks: `${activeItem.aiScore}/${activeItem.maxMarks}`,
          comment: activeItem.reason,
        },
      ]
    : [];

  const removeItem = (id: string) => {
    const remaining = items.filter((i) => i.id !== id);
    setItems(remaining);
    decrementReviewQueueCount();
    if (remaining.length > 0) setSelectedId(remaining[0].id);
    else setSelectedId(null);
  };

  const handleApprove = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await reviewApi.approve(selectedId);
      removeItem(selectedId);
      toast.success("AI score approved.");
    } catch {
      toast.error("Failed to approve. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverride = async (newScore: number, note: string) => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await reviewApi.override(selectedId, newScore, note);
      removeItem(selectedId);
      toast.success(`Score overridden to ${newScore}.`);
    } catch {
      toast.error("Failed to override. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecheck = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await reviewApi.recheck(selectedId);
      removeItem(selectedId);
      toast.success("Marked for physical recheck.");
    } catch {
      toast.error("Failed to mark for recheck.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Review Queue"
        subtitle="Review and manually override scores for answers flagged due to handwriting variance or low confidence scores."
      />

      {loading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-card text-center min-h-[400px]">
          <div className="rounded-full bg-success-50 p-4 text-success-600 dark:bg-success-950 dark:text-success-400 mb-4 animate-bounce">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Review Queue Clear!</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
            All flagged answer sheets have been verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Queue list */}
          <div className="lg:col-span-4 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} layout>
                  <ReviewCard item={item} isActive={item.id === selectedId} onClick={() => setSelectedId(item.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right: Review panel */}
          <div className="lg:col-span-8">
            {activeItem ? (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-card space-y-6 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Reviewing Q{activeItem.questionNumber} — Roll: {activeItem.rollNumber}
                    </h3>
                    {activeItem.questionText && (
                      <p className="text-xs text-neutral-500 mt-0.5 italic">
                        "{activeItem.questionText}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-500">AI Confidence</span>
                    <div className={`text-lg font-bold ${activeItem.confidence < 70 ? "text-danger-600" : "text-amber-600"}`}>
                      {activeItem.confidence}%
                    </div>
                  </div>
                </div>

                {/* Page image with bbox highlight */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    {activeItem.pageImageUrl ? "Actual Answer Sheet (Signed URL)" : "Simulated Flagged Area"}
                  </h4>
                  <div className="max-w-md mx-auto">
                    <AnnotationOverlay
                      imageUrl={activeItem.pageImageUrl ?? "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=400&auto=format&fit=crop"}
                      annotations={activeAnnotations}
                    />
                  </div>
                </div>

                {/* Transcription & reason */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <div>
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      Student's Answer (AI Transcription)
                    </span>
                    <p className="mt-1 bg-surface-50 p-3 rounded-xl border border-neutral-100 dark:bg-neutral-950/50 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 italic">
                      "{activeItem.studentAnswer}"
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      AI Flag Reason
                    </span>
                    <p className="mt-1 p-3 text-neutral-800 dark:text-neutral-200">{activeItem.reason}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                  <ReviewActions
                    maxMarks={activeItem.maxMarks}
                    aiScore={activeItem.aiScore}
                    onApprove={handleApprove}
                    onOverride={(score, note) => handleOverride(score, note)}
                    onRecheck={handleRecheck}
                    disabled={actionLoading}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-12 bg-surface-50 rounded-3xl border border-dashed text-neutral-400 min-h-[300px]">
                Select a flagged answer card from the list to start reviewing.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
