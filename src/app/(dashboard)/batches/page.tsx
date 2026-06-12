"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Calendar, Award, ChevronRight, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusPill } from "@/components/shared/StatusPill";
import { formatDate } from "@/lib/utils";

// Mock batches
const mockBatches = [
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
  {
    id: "batch-5",
    name: "Class 12 English Literature — Essays",
    subject: "English",
    totalSheets: 38,
    completedSheets: 38,
    averagePercentage: 72.8,
    status: "completed" as const,
    createdAt: "2026-06-01T09:00:00Z",
  },
];

export default function BatchesPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const filteredBatches = mockBatches.filter((batch) => {
    const matchesSearch = batch.name.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "all" || batch.subject.toLowerCase() === subjectFilter.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Batches"
        subtitle="Manage and check all historical and active evaluation batches."
        action={
          <Button asChild className="btn-primary h-10 shadow-card">
            <Link href="/upload">
              <Plus className="h-4 w-4 mr-1.5" />
              Upload New Batch
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batches..."
            className="pl-9 h-10 border-neutral-300 dark:border-neutral-800"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="english">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid of Batches */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBatches.map((batch) => (
          <div key={batch.id} className="relative group">
            <Link href={`/batches/${batch.id}`}>
              <div className="p-6 rounded-3xl bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-card transition-all duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {batch.name}
                      </h3>
                      <StatusPill status={batch.status} />
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-neutral-400" />
                        Subject: {batch.subject}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        Created {formatDate(batch.createdAt, "MMMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right sm:block hidden">
                      <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Sheets</p>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        {batch.completedSheets}/{batch.totalSheets}
                      </p>
                    </div>

                    {batch.status === "completed" && (
                      <div className="text-right sm:block hidden">
                        <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Avg Score</p>
                        <p className="text-sm font-bold text-success-600 dark:text-success-400">
                          {batch.averagePercentage}%
                        </p>
                      </div>
                    )}

                    <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {filteredBatches.length === 0 && (
          <div className="text-center p-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl">
            <p className="text-neutral-500 dark:text-neutral-400">No batches match your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
