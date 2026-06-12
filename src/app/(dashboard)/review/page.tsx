"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { ReviewCard, type FlaggedItem } from "@/components/review/ReviewCard";
import { ReviewActions } from "@/components/review/ReviewActions";
import { AnnotationOverlay, type Annotation } from "@/components/results/AnnotationOverlay";
import { PageHeader } from "@/components/shared/PageHeader";

// Mock flagged items
const initialFlaggedItems: FlaggedItem[] = [
  {
    id: "flag-1",
    sheetId: "sheet-3",
    batchId: "batch-1",
    batchName: "Class 12 Physics",
    rollNumber: "PHY-103",
    questionNumber: 4,
    maxMarks: 25,
    aiScore: 10,
    confidence: 58,
    reason: "Low optical confidence score due to highly scribbled cursive handwriting.",
    studentAnswer: "Energy of hydrogen atom is given by E = hc/lambda. The lines represent Bohr orbital state changes.",
  },
  {
    id: "flag-2",
    sheetId: "sheet-202",
    batchId: "batch-2",
    batchName: "Grade 10 Mathematics",
    rollNumber: "MAT-202",
    questionNumber: 2,
    maxMarks: 30,
    aiScore: 15,
    confidence: 61,
    reason: "Faint pencil sketch graph. Image scanning threshold might have omitted minor coordinates.",
    studentAnswer: "Area of segment = sector area - triangle area = pi * r^2 * theta/360 - 1/2 r^2 sin theta = 28.5 cm^2.",
  },
  {
    id: "flag-3",
    sheetId: "sheet-301",
    batchId: "batch-3",
    batchName: "Class 11 Chemistry",
    rollNumber: "CHM-112",
    questionNumber: 1,
    maxMarks: 10,
    aiScore: 5,
    confidence: 68,
    reason: "Multiple scratch-outs and corrections detected. AI marking uncertainty high.",
    studentAnswer: "Molarity is moles of solute per liter of solution. M = n/V.",
  },
  {
    id: "flag-4",
    sheetId: "sheet-404",
    batchId: "batch-1",
    batchName: "Class 12 Physics",
    rollNumber: "PHY-118",
    questionNumber: 3,
    maxMarks: 25,
    aiScore: 12,
    confidence: 72,
    reason: "Alternative explanation provided that diverges from official marking scheme keyword guidelines.",
    studentAnswer: "Refraction happens due to velocity differentials in optical densities.",
  },
];

export default function ReviewQueuePage() {
  const [items, setItems] = useState<FlaggedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { setReviewQueueCount, decrementReviewQueueCount } = useUIStore();

  // Populate items on mount
  useEffect(() => {
    // Sort by lowest confidence first
    const sorted = [...initialFlaggedItems].sort((a, b) => a.confidence - b.confidence);
    setItems(sorted);
    setReviewQueueCount(sorted.length);
    if (sorted.length > 0) {
      setSelectedId(sorted[0].id);
    }
  }, [setReviewQueueCount]);

  const activeItem = items.find((i) => i.id === selectedId) || null;

  // Generate mock single annotation details for the right panel preview
  const activeAnnotations: Annotation[] = activeItem
    ? [
        {
          id: `ann-${activeItem.id}`,
          x: 50,
          y: 40,
          type: activeItem.aiScore === activeItem.maxMarks ? "tick" : activeItem.aiScore === 0 ? "cross" : "half",
          questionNumber: activeItem.questionNumber,
          marks: `${activeItem.aiScore}/${activeItem.maxMarks}`,
          comment: activeItem.reason,
        },
      ]
    : [];

  const handleActionCompleted = (actionType: string) => {
    if (!selectedId) return;

    // Remove item from queue
    const remaining = items.filter((i) => i.id !== selectedId);
    setItems(remaining);
    decrementReviewQueueCount();

    // Select next item
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
    } else {
      setSelectedId(null);
    }

    toast.success(`Review completed: item was ${actionType}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Review Queue"
        subtitle="Review and manually override scores for answers flagged due to handwriting variance or low confidence scores."
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-card text-center min-h-[400px]">
          <div className="rounded-full bg-success-50 p-4 text-success-600 dark:bg-success-950 dark:text-success-400 mb-4 animate-bounce">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Review Queue Clear!</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
            Excellent work! All flagged answer sheets have been verified and processed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Scrollable Queue List */}
          <div className="lg:col-span-4 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  layout
                >
                  <ReviewCard
                    item={item}
                    isActive={item.id === selectedId}
                    onClick={() => setSelectedId(item.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right: Flagged Answer Zoom Region & Actions */}
          <div className="lg:col-span-8">
            {activeItem ? (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-card space-y-6 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Reviewing Q{activeItem.questionNumber} for {activeItem.rollNumber}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Batch: {activeItem.batchName}
                    </p>
                  </div>
                </div>

                {/* Simulated zoomed-in image overlay region */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Flagged Answer Area (Zoomed)
                  </h4>
                  <div className="max-w-md mx-auto">
                    <AnnotationOverlay
                      imageUrl="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=400&auto=format&fit=crop"
                      annotations={activeAnnotations}
                    />
                  </div>
                </div>

                {/* Transcription */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <div>
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      Student Handwritten Answer
                    </span>
                    <p className="mt-1 bg-surface-50 p-3 rounded-xl border border-neutral-100 dark:bg-neutral-950/50 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 italic">
                      "{activeItem.studentAnswer}"
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      AI Marking Flag Reason
                    </span>
                    <p className="mt-1 p-3 text-neutral-800 dark:text-neutral-200">
                      {activeItem.reason}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                  <ReviewActions
                    maxMarks={activeItem.maxMarks}
                    aiScore={activeItem.aiScore}
                    onApprove={() => handleActionCompleted("approved")}
                    onOverride={(newScore, reason) => handleActionCompleted(`overridden to ${newScore}`)}
                    onRecheck={() => handleActionCompleted("marked for recheck")}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-12 bg-surface-50 rounded-3xl border border-dashed text-neutral-400 min-h-[300px]">
                Please select a flagged answer card from the list to start reviewing.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
