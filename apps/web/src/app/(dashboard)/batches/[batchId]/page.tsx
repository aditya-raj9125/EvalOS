"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Download, Share2, ArrowLeft, Loader2,
  FileSpreadsheet, Archive, RefreshCw, Wifi,
} from "lucide-react";
import { batchesApi, type ApiBatch, type SheetResultRow } from "@/lib/apiClient";
import { BatchSummaryCard } from "@/components/results/BatchSummaryCard";
import { GradeTable } from "@/components/results/GradeTable";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useBatchStore } from "@/store/batchStore";
import type { Batch, Sheet } from "@/types/batch";

// ─── Adapters (API → existing UI type shapes) ─────────────────────────────────

function apiBatchToBatch(b: ApiBatch): Batch {
  return {
    id: b.id,
    name: b.name,
    subject: b.subject ?? "",
    expectedMarks: b.max_score_per_sheet,
    totalSheets: b.total_sheets,
    completedSheets: b.processed_sheets,
    flaggedSheets: b.flagged_count,
    averageScore: b.avg_score ?? 0,
    averagePercentage: b.avg_score ?? 0,
    status: b.status as any,
    enableStudentPortal: b.enable_student_portal,
    accessCode: b.student_access_code ?? undefined,
    createdAt: b.created_at,
    completedAt: b.processing_completed_at ?? undefined,
    timeTakenSeconds: b.processing_started_at && b.processing_completed_at
      ? Math.round((new Date(b.processing_completed_at).getTime() - new Date(b.processing_started_at).getTime()) / 1000)
      : undefined,
    teacherId: b.user_id,
  };
}

function apiSheetToSheet(s: SheetResultRow): Sheet {
  return {
    id: s.sheet_id,
    batchId: "",
    rollNumber: s.roll_number ?? "",
    studentName: s.student_name ?? "",
    status: s.is_flagged ? "flagged" : "evaluated",
    totalScore: s.total_awarded_marks ?? 0,
    maxScore: s.total_max_marks ?? 0,
    percentage: s.percentage ?? 0,
    aiConfidence: 0,
    questionScores: s.evaluations.map((e) => ({
      questionNumber: parseInt(e.q_no) || 0,
      awardedMarks: e.awarded_marks,
      maxMarks: e.max_marks,
      studentAnswer: e.student_answer_transcribed ?? "",
      aiReason: e.reason ?? "",
      isFlagged: e.is_flagged ?? false,
      confidence: Math.round((e.ai_confidence ?? 0.8) * 100),
    })),
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.batchId as string;

  const [batch, setBatch] = useState<Batch | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { processedCount, totalCount, progressPercent, currentStatus, recentCompletions } = useBatchStore();

  // Connect WebSocket for live updates
  useWebSocket(batchId);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [batchData, resultsData] = await Promise.all([
        batchesApi.get(batchId),
        batchesApi.results(batchId, 1, 500),
      ]);
      setBatch(apiBatchToBatch(batchData));
      setSheets(resultsData.data.map((s) => apiSheetToSheet(s)));
    } catch (err: any) {
      toast.error("Failed to load batch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [batchId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Refresh when WebSocket reports batch_completed
  useEffect(() => {
    if (currentStatus === "completed" && batch && batch.status !== "completed") {
      loadData(true);
    }
  }, [currentStatus]);

  // Update progress from WebSocket in real-time (for processing batches)
  useEffect(() => {
    if (!batch) return;
    if (currentStatus === "processing" && totalCount > 0) {
      setBatch((prev) =>
        prev ? { ...prev, completedSheets: processedCount, totalSheets: totalCount } : prev
      );
    }
  }, [processedCount, totalCount, currentStatus]);

  // Real-time sheet completions from WebSocket — add to table live
  useEffect(() => {
    if (recentCompletions.length === 0) return;
    const latest = recentCompletions[0];
    if (!latest) return;
    // Re-fetch full results when new sheets complete during processing
    if (batch?.status === "processing") {
      loadData(false);
    }
  }, [recentCompletions.length]);

  const handleOverrideScore = useCallback((sheetId: string, questionNumber: number, newScore: number) => {
    setSheets((prev) =>
      prev.map((s) => {
        if (s.id !== sheetId) return s;
        const updatedQ = s.questionScores.map((q) =>
          q.questionNumber === questionNumber ? { ...q, awardedMarks: newScore, isFlagged: false } : q
        );
        const total = updatedQ.reduce((sum, q) => sum + q.awardedMarks, 0);
        return { ...s, questionScores: updatedQ, totalScore: total, percentage: (total / s.maxScore) * 100, status: "evaluated" };
      })
    );
  }, []);

  const handleSharePortal = () => {
    if (batch?.accessCode) {
      navigator.clipboard.writeText(`${window.location.origin}/student/${batch.accessCode}`);
      toast.success("Portal link copied to clipboard!");
    } else {
      toast.error("Student portal not configured for this batch.");
    }
  };

  // Authenticated export download helper
  const downloadExport = (url: string, filename: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("evalai_token") : null;
    const link = document.createElement("a");
    // For authenticated downloads, fetch with auth header then create blob URL
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => toast.error("Export failed. Please try again."));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (!batch) return (
    <div className="text-center p-16 text-neutral-500">Batch not found.</div>
  );

  const isProcessing = batch.status === "processing";

  return (
    <div className="space-y-6">
      {/* Back */}
      <div>
        <Button variant="ghost" onClick={() => router.push("/batches")}
          className="btn-ghost flex items-center gap-1.5 h-8 px-2 text-neutral-500">
          <ArrowLeft className="h-4 w-4" />Back to Batches
        </Button>
      </div>

      <PageHeader
        title={batch.name}
        subtitle={`Subject: ${batch.subject ?? "—"}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-sm font-medium">
                <Wifi className="h-4 w-4 animate-pulse" />
                Live: {processedCount}/{totalCount} ({progressPercent.toFixed(0)}%)
              </div>
            )}

            <Button variant="outline" onClick={() => loadData(true)} disabled={refreshing}
              className="h-10 border-neutral-300 dark:border-neutral-800 text-neutral-600">
              <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button variant="outline"
              onClick={() => downloadExport(batchesApi.exportCsvUrl(batchId), `${batch.name}_results.csv`)}
              className="h-10 border-neutral-300 dark:border-neutral-800 text-neutral-600 hover:text-neutral-900">
              <Download className="h-4 w-4 mr-1.5" />Export CSV
            </Button>

            <Button variant="outline"
              onClick={() => downloadExport(batchesApi.exportExcelUrl(batchId), `${batch.name}_results.xlsx`)}
              className="h-10 border-neutral-300 dark:border-neutral-800 text-neutral-600 hover:text-neutral-900">
              <FileSpreadsheet className="h-4 w-4 mr-1.5" />Export Excel
            </Button>

            <Button variant="outline"
              onClick={() => downloadExport(batchesApi.exportZipUrl(batchId), `${batch.name}_sheets.zip`)}
              className="h-10 border-neutral-300 dark:border-neutral-800 text-neutral-600 hover:text-neutral-900">
              <Archive className="h-4 w-4 mr-1.5" />Download Sheets
            </Button>

            {batch.enableStudentPortal && (
              <Button onClick={handleSharePortal} className="btn-primary h-10 shadow-card">
                <Share2 className="h-4 w-4 mr-1.5" />Share Portal
              </Button>
            )}
          </div>
        }
      />

      <BatchSummaryCard batch={batch} />

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Student Gradebook</h3>
        <p className="text-xs text-neutral-500">
          Click any row to open the answer sheet annotation panel.
          {sheets.length > 0 && ` ${sheets.length} students loaded.`}
        </p>
        <GradeTable sheets={sheets} onOverrideScore={handleOverrideScore} />
      </div>
    </div>
  );
}
