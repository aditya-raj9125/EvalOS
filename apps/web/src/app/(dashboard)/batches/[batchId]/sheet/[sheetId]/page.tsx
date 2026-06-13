"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SheetViewer } from "@/components/results/SheetViewer";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

// Minimal mock sheet dataset
const mockSheets: Record<string, any> = {
  "sheet-1": {
    id: "sheet-1",
    batchId: "batch-1",
    rollNumber: "PHY-101",
    studentName: "Aditya Raj",
    status: "evaluated",
    totalScore: 92,
    maxScore: 100,
    percentage: 92,
    aiConfidence: 96,
    questionScores: [
      { questionNumber: 1, awardedMarks: 20, maxMarks: 20, studentAnswer: "Acceleration is the rate of change of velocity.", aiReason: "Perfect explanation and correct units.", isFlagged: false, confidence: 98 },
      { questionNumber: 2, awardedMarks: 30, maxMarks: 30, studentAnswer: "The total flux is Q/epsilon_0.", aiReason: "Correct application of Gauss's Law.", isFlagged: false, confidence: 97 },
      { questionNumber: 3, awardedMarks: 22, maxMarks: 25, studentAnswer: "Refractive index = c/v = 1.5", aiReason: "Correct math, slight spelling mistake.", isFlagged: false, confidence: 95 },
      { questionNumber: 4, awardedMarks: 20, maxMarks: 25, studentAnswer: "Total energy = K.E + P.E = -13.6 eV", aiReason: "Correct final energy but missed drawing levels.", isFlagged: false, confidence: 94 },
    ],
    annotatedImageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop",
  },
};

export default function SheetViewerPage() {
  const params = useParams();
  const router = useRouter();
  
  const batchId = params.batchId as string;
  const sheetId = params.sheetId as string;

  const sheet = mockSheets[sheetId] || mockSheets["sheet-1"];

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.push(`/batches/${batchId}`)} className="btn-ghost flex items-center gap-1.5 h-8 px-2 text-neutral-500">
          <ArrowLeft className="h-4 w-4" />
          Back to Batch Results
        </Button>
      </div>

      <PageHeader
        title={`Evaluation Sheet — ${sheet.rollNumber}`}
        subtitle={`Student Name: ${sheet.studentName || "Anonymous"}`}
      />

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-card">
        <SheetViewer sheet={sheet} />
      </div>
    </div>
  );
}
