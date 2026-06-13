"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, ArrowRight, FileText, CheckCircle, AlertTriangle, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusPill } from "@/components/shared/StatusPill";
import { formatDate } from "@/lib/utils";
import { batchesApi, reviewApi, type ApiBatchList } from "@/lib/apiClient";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const [batches, setBatches] = useState<ApiBatchList[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([batchesApi.list(1, 50), reviewApi.stats()])
      .then(([batchList, stats]) => {
        setBatches(batchList);
        setReviewCount(stats.pending_count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Aggregate stats from real data
  const totalSheets = batches.reduce((s, b) => s + b.total_sheets, 0);
  const completedBatches = batches.filter((b) => b.status === "completed");
  const avgScore =
    completedBatches.length > 0 && completedBatches.some((b) => b.avg_score != null)
      ? (
          completedBatches.reduce((s, b) => s + (b.avg_score ?? 0), 0) /
          completedBatches.filter((b) => b.avg_score != null).length
        ).toFixed(1)
      : "—";

  const stats = [
    { name: "Total Batches", value: loading ? "—" : String(batches.length), icon: FileText, description: "Evaluated this academic year" },
    { name: "Answer Sheets Evaluated", value: loading ? "—" : String(totalSheets), icon: CheckCircle, description: "Across all your batches" },
    { name: "Average Batch Score", value: loading ? "—" : avgScore !== "—" ? `${avgScore}%` : "—", icon: BarChart3, description: "Across all completed batches" },
    { name: "Flagged for Review", value: loading ? "—" : String(reviewCount), icon: AlertTriangle, description: "High ambiguity or low confidence", badge: reviewCount > 0 ? "Action Required" : undefined },
  ];

  const recentBatches = batches.slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your exam evaluations, classes and review queues."
        action={
          <Button asChild className="btn-primary flex items-center gap-1.5 h-10 shadow-card">
            <Link href="/upload"><Plus className="h-4 w-4" />Upload New Batch</Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.name} variants={itemVariants}>
              <Card className="hover:shadow-card transition-all duration-150 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.name}</span>
                  <div className="rounded-md bg-surface-50 p-2 dark:bg-neutral-800">
                    <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                    ) : (
                      <span className="text-3xl font-bold text-neutral-900 dark:text-white">{stat.value}</span>
                    )}
                    {stat.badge && (
                      <span className="inline-flex items-center rounded-full bg-danger-50 px-2 py-0.5 text-xs font-medium text-danger-700 dark:bg-danger-950/50 dark:text-danger-400 animate-pulse">
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Batches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Batches</h2>
          <Button variant="ghost" asChild className="btn-ghost flex items-center gap-1">
            <Link href="/batches">View All Batches<ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : recentBatches.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl">
            <p className="text-neutral-500 dark:text-neutral-400">No batches yet.</p>
            <Button asChild className="btn-primary mt-4"><Link href="/upload">Upload your first batch</Link></Button>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4">
            {recentBatches.map((batch) => (
              <motion.div key={batch.id} variants={itemVariants}>
                <Link href={`/batches/${batch.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-card transition-all duration-150">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">{batch.name}</h3>
                        <StatusPill status={batch.status as any} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {batch.subject && <span>Subject: {batch.subject}</span>}
                        <span>•</span>
                        <span>Sheets: {batch.processed_sheets}/{batch.total_sheets}</span>
                        <span>•</span>
                        <span>Created {formatDate(batch.created_at, "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-6">
                      {batch.status === "completed" && batch.avg_score != null && (
                        <div className="text-right sm:block hidden">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Avg. Score</span>
                          <div className="text-lg font-bold text-neutral-900 dark:text-white">{batch.avg_score.toFixed(1)}%</div>
                        </div>
                      )}
                      <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                        View Results<ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
