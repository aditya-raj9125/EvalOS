"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, ArrowRight, FileText, CheckCircle, AlertTriangle, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusPill } from "@/components/shared/StatusPill";
import { formatDate } from "@/lib/utils";

// Mock summary metrics
const stats = [
  {
    name: "Total Batches",
    value: "14",
    icon: FileText,
    description: "Evaluated this academic year",
  },
  {
    name: "Answer Sheets Evaluated",
    value: "687",
    icon: CheckCircle,
    description: "Evaluated in minutes",
  },
  {
    name: "Average Batch Score",
    value: "72.4%",
    icon: BarChart3,
    description: "Across all class subjects",
  },
  {
    name: "Flagged for Review",
    value: "4",
    icon: AlertTriangle,
    description: "High ambiguity or low confidence",
    badge: "Action Required",
  },
];

// Mock recent batches list
const recentBatches = [
  {
    id: "batch-1",
    name: "Class 12 Physics — Term Exam",
    subject: "Physics",
    totalSheets: 45,
    completedSheets: 45,
    averagePercentage: 74.5,
    status: "completed" as const,
    createdAt: "2026-06-10T10:00:00Z",
  },
  {
    id: "batch-2",
    name: "Grade 10 Mathematics — Practice Paper",
    subject: "Mathematics",
    totalSheets: 60,
    completedSheets: 58,
    averagePercentage: 68.2,
    status: "processing" as const,
    createdAt: "2026-06-12T05:30:00Z",
  },
  {
    id: "batch-3",
    name: "Class 11 Chemistry — Weekly Quiz",
    subject: "Chemistry",
    totalSheets: 30,
    completedSheets: 30,
    averagePercentage: 81.0,
    status: "completed" as const,
    createdAt: "2026-06-08T14:15:00Z",
  },
  {
    id: "batch-4",
    name: "IIT-JEE Physics Prep Batch A",
    subject: "Physics",
    totalSheets: 120,
    completedSheets: 0,
    averagePercentage: 0,
    status: "pending" as const,
    createdAt: "2026-06-12T06:00:00Z",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your exam evaluations, classes and review queues."
        action={
          <Button asChild className="btn-primary flex items-center gap-1.5 h-10 shadow-card">
            <Link href="/upload">
              <Plus className="h-4 w-4" />
              Upload New Batch
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.name} variants={itemVariants}>
              <Card className="hover:shadow-card transition-all duration-150 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {stat.name}
                  </span>
                  <div className="rounded-md bg-surface-50 p-2 dark:bg-neutral-800">
                    <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                      {stat.value}
                    </span>
                    {stat.badge && (
                      <span className="inline-flex items-center rounded-full bg-danger-50 px-2 py-0.5 text-xs font-medium text-danger-700 dark:bg-danger-950/50 dark:text-danger-400 animate-pulse">
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Batches List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Batches</h2>
          <Button variant="ghost" asChild className="btn-ghost flex items-center gap-1">
            <Link href="/batches">
              View All Batches
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {recentBatches.map((batch) => (
            <motion.div key={batch.id} variants={itemVariants}>
              <Link href={`/batches/${batch.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-card transition-all duration-150">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {batch.name}
                      </h3>
                      <StatusPill status={batch.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>Subject: {batch.subject}</span>
                      <span>•</span>
                      <span>Total Sheets: {batch.totalSheets}</span>
                      <span>•</span>
                      <span>Created {formatDate(batch.createdAt, "MMM d, yyyy h:mm a")}</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex items-center justify-between gap-6">
                    {batch.status === "completed" && (
                      <div className="text-right sm:block hidden">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Avg. Score</span>
                        <div className="text-lg font-bold text-neutral-900 dark:text-white">
                          {batch.averagePercentage}%
                        </div>
                      </div>
                    )}

                    {batch.status === "processing" && (
                      <div className="text-right sm:block hidden">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Progress</span>
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {batch.completedSheets}/{batch.totalSheets}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                      View Results
                      <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
