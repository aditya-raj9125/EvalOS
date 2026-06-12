"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Share2, ArrowLeft, RefreshCw } from "lucide-react";
import type { Batch, Sheet } from "@/types/batch";
import { BatchSummaryCard } from "@/components/results/BatchSummaryCard";
import { GradeTable } from "@/components/results/GradeTable";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

// Mock Batches Data
const initialBatches: Record<string, Batch> = {
  "batch-1": {
    id: "batch-1",
    name: "Class 12 Physics — Term Exam",
    subject: "Physics",
    expectedMarks: 100,
    totalSheets: 6,
    completedSheets: 6,
    flaggedSheets: 1,
    averageScore: 78.5,
    averagePercentage: 78.5,
    status: "completed",
    enableStudentPortal: true,
    accessCode: "PHYS-12",
    createdAt: "2026-06-10T10:00:00Z",
    completedAt: "2026-06-10T10:05:00Z",
    timeTakenSeconds: 300,
    teacherId: "teacher-1",
  },
  "batch-2": {
    id: "batch-2",
    name: "Grade 10 Mathematics — Practice Paper",
    subject: "Mathematics",
    expectedMarks: 80,
    totalSheets: 8,
    completedSheets: 4,
    flaggedSheets: 1,
    averageScore: 58.0,
    averagePercentage: 72.5,
    status: "processing",
    enableStudentPortal: false,
    createdAt: "2026-06-12T05:30:00Z",
    teacherId: "teacher-1",
  },
};

// Mock Sheets Data
const initialSheets: Record<string, Sheet[]> = {
  "batch-1": [
    {
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
        { questionNumber: 3, awardedMarks: 22, maxMarks: 25, studentAnswer: "Refractive index = c/v = 1.5", aiReason: "Correct math, slight spelling mistake in description.", isFlagged: false, confidence: 95 },
        { questionNumber: 4, awardedMarks: 20, maxMarks: 25, studentAnswer: "Total energy = K.E + P.E = -13.6 eV", aiReason: "Correct final energy but missed drawing energy levels.", isFlagged: false, confidence: 94 },
      ],
      annotatedImageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "sheet-2",
      batchId: "batch-1",
      rollNumber: "PHY-102",
      studentName: "Sneha Gupta",
      status: "evaluated",
      totalScore: 78,
      maxScore: 100,
      percentage: 78,
      aiConfidence: 92,
      questionScores: [
        { questionNumber: 1, awardedMarks: 18, maxMarks: 20, studentAnswer: "Acceleration is change in velocity over time.", aiReason: "Good explanation, minor unit missing.", isFlagged: false, confidence: 94 },
        { questionNumber: 2, awardedMarks: 25, maxMarks: 30, studentAnswer: "Flux through closed surface depends on charge.", aiReason: "Formula not written explicitly.", isFlagged: false, confidence: 91 },
        { questionNumber: 3, awardedMarks: 20, maxMarks: 25, studentAnswer: "R.I = 1.33 for water.", aiReason: "Correct, step detailed calculation is missing.", isFlagged: false, confidence: 93 },
        { questionNumber: 4, awardedMarks: 15, maxMarks: 25, studentAnswer: "Ground state energy is negative.", aiReason: "Incorrect formula derivation.", isFlagged: false, confidence: 90 },
      ],
    },
    {
      id: "sheet-3",
      batchId: "batch-1",
      rollNumber: "PHY-103",
      studentName: "Rahul Kumar",
      status: "flagged",
      totalScore: 56,
      maxScore: 100,
      percentage: 56,
      aiConfidence: 58,
      questionScores: [
        { questionNumber: 1, awardedMarks: 15, maxMarks: 20, studentAnswer: "Acceleration is speed changes.", aiReason: "Incomplete definition.", isFlagged: false, confidence: 92 },
        { questionNumber: 2, awardedMarks: 10, maxMarks: 30, studentAnswer: "Electric flux is magnetic flux.", aiReason: "Confused electric flux with magnetic flux.", isFlagged: false, confidence: 90 },
        { questionNumber: 3, awardedMarks: 21, maxMarks: 25, studentAnswer: "Snell's Law says n1 sin i = n2 sin r.", aiReason: "Correct formula and application.", isFlagged: false, confidence: 94 },
        { questionNumber: 4, awardedMarks: 10, maxMarks: 25, studentAnswer: "Energy of hydrogen atom is given by E = hc/lambda.", aiReason: "Wrong formula used. Handwriting is highly illegible.", isFlagged: true, confidence: 58 },
      ],
    },
  ],
  "batch-2": [
    {
      id: "sheet-201",
      batchId: "batch-2",
      rollNumber: "MAT-201",
      studentName: "Ananya Sen",
      status: "evaluated",
      totalScore: 72,
      maxScore: 80,
      percentage: 90,
      aiConfidence: 97,
      questionScores: [
        { questionNumber: 1, awardedMarks: 20, maxMarks: 20, studentAnswer: "x = 4, y = 5", aiReason: "Both roots correct.", isFlagged: false, confidence: 98 },
        { questionNumber: 2, awardedMarks: 30, maxMarks: 30, studentAnswer: "Area of segment = 28.5 cm^2", aiReason: "Used correct formula and calculation.", isFlagged: false, confidence: 96 },
        { questionNumber: 3, awardedMarks: 22, maxMarks: 30, studentAnswer: "Probability is 1/6.", aiReason: "Correct odds, slightly messy reasoning.", isFlagged: false, confidence: 97 },
      ],
    },
    {
      id: "sheet-202",
      batchId: "batch-2",
      rollNumber: "MAT-202",
      studentName: "Vikram Malhotra",
      status: "flagged",
      totalScore: 50,
      maxScore: 80,
      percentage: 62.5,
      aiConfidence: 61,
      questionScores: [
        { questionNumber: 1, awardedMarks: 10, maxMarks: 20, studentAnswer: "x = 2, y = -1", aiReason: "Partial steps correct, wrong final signs.", isFlagged: false, confidence: 92 },
        { questionNumber: 2, awardedMarks: 15, maxMarks: 30, studentAnswer: "Area = pi * r^2 * theta/360 - chord.", aiReason: "Handwriting is extremely faint.", isFlagged: true, confidence: 61 },
        { questionNumber: 3, awardedMarks: 25, maxMarks: 30, studentAnswer: "Probability = favorable/total = 5/36", aiReason: "Correct calculations.", isFlagged: false, confidence: 94 },
      ],
    },
  ],
};

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.batchId as string;

  const [batch, setBatch] = useState<Batch | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);

  // Load batch data
  useEffect(() => {
    const activeBatch = initialBatches[batchId];
    const activeSheets = initialSheets[batchId] || [];
    
    if (activeBatch) {
      setBatch(activeBatch);
      setSheets(activeSheets);
    } else {
      // Fallback if uploading new
      setBatch({
        id: batchId,
        name: "Class 12 Physics — March 2025",
        subject: "Physics",
        expectedMarks: 100,
        totalSheets: 10,
        completedSheets: 3,
        flaggedSheets: 0,
        averageScore: 0,
        averagePercentage: 0,
        status: "processing",
        enableStudentPortal: false,
        createdAt: new Date().toISOString(),
        teacherId: "teacher-1",
      });
      setSheets([]);
    }
  }, [batchId]);

  // Simulate WebSocket / Polling processing updates for MAT-202/batch-2
  useEffect(() => {
    if (!batch || batch.status !== "processing") return;

    const timer = setInterval(() => {
      setBatch((prev) => {
        if (!prev) return null;
        if (prev.completedSheets >= prev.totalSheets) {
          clearInterval(timer);
          toast.success("AI Evaluation completed for all sheets!");
          return { ...prev, status: "completed" };
        }
        
        const nextCompleted = prev.completedSheets + 1;
        return {
          ...prev,
          completedSheets: nextCompleted,
          status: nextCompleted >= prev.totalSheets ? "completed" : "processing",
        };
      });

      // Add a mock new evaluated sheet to the table
      setSheets((prev) => {
        const nextId = prev.length + 201;
        const newSheet: Sheet = {
          id: `sheet-${nextId}`,
          batchId: batchId,
          rollNumber: `MAT-${nextId}`,
          studentName: ["Amit Sharma", "Karan Malhotra", "Rhea Kapoor", "Varun Dhawan"][prev.length % 4],
          status: "evaluated",
          totalScore: Math.floor(Math.random() * 20) + 50,
          maxScore: 80,
          percentage: 0,
          aiConfidence: Math.floor(Math.random() * 10) + 88,
          questionScores: [
            { questionNumber: 1, awardedMarks: 15, maxMarks: 20, studentAnswer: "x=3", aiReason: "Correct", isFlagged: false, confidence: 95 },
            { questionNumber: 2, awardedMarks: 20, maxMarks: 30, studentAnswer: "Formula used", aiReason: "Correct calculation steps", isFlagged: false, confidence: 93 },
            { questionNumber: 3, awardedMarks: 25, maxMarks: 30, studentAnswer: "Prob is correct", aiReason: "Perfect odds", isFlagged: false, confidence: 97 },
          ],
        };
        newSheet.percentage = (newSheet.totalScore / newSheet.maxScore) * 100;
        return [...prev, newSheet];
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [batch]);

  const handleOverrideScore = (sheetId: string, questionNumber: number, newScore: number, reason: string) => {
    // Modify sheets list locally
    setSheets((prevSheets) =>
      prevSheets.map((s) => {
        if (s.id !== sheetId) return s;

        const updatedQ = s.questionScores.map((q) =>
          q.questionNumber === questionNumber
            ? { ...q, awardedMarks: newScore, isFlagged: false }
            : q
        );
        const total = updatedQ.reduce((sum, q) => sum + q.awardedMarks, 0);
        
        return {
          ...s,
          questionScores: updatedQ,
          totalScore: total,
          percentage: (total / s.maxScore) * 100,
          status: updatedQ.some((q) => q.isFlagged) ? "flagged" : "evaluated",
        };
      })
    );

    // Update batch metrics
    setBatch((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        flaggedSheets: Math.max(0, prev.flaggedSheets - 1),
      };
    });
  };

  const handleSharePortal = () => {
    if (batch?.accessCode) {
      navigator.clipboard.writeText(`${window.location.origin}/student/${batch.accessCode}`);
      toast.success("Portal link copied to clipboard!");
    } else {
      toast.error("Portal access code not configured for this batch.");
    }
  };

  if (!batch) return null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button variant="ghost" onClick={() => router.push("/batches")} className="btn-ghost flex items-center gap-1.5 h-8 px-2 text-neutral-500">
          <ArrowLeft className="h-4 w-4" />
          Back to Batches
        </Button>
      </div>

      <PageHeader
        title={batch.name}
        subtitle={`Subject: ${batch.subject}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("Downloading CSV Gradebook...")}
              className="h-10 border-neutral-300 dark:border-neutral-800 text-neutral-600 hover:text-neutral-900"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
            {batch.enableStudentPortal && (
              <Button onClick={handleSharePortal} className="btn-primary h-10 shadow-card">
                <Share2 className="h-4 w-4 mr-1.5" />
                Share Portal Link
              </Button>
            )}
          </div>
        }
      />

      {/* Batch Summary Card */}
      <BatchSummaryCard batch={batch} />

      {/* Grade Table */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Student Gradebook</h3>
        <p className="text-xs text-neutral-500">
          Click any row to open the answer sheet annotation panel and override scores.
        </p>
        <GradeTable sheets={sheets} onOverrideScore={handleOverrideScore} />
      </div>
    </div>
  );
}
