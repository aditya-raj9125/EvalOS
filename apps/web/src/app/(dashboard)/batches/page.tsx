"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Calendar, Award, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusPill } from "@/components/shared/StatusPill";
import { formatDate } from "@/lib/utils";
import { batchesApi, type ApiBatchList } from "@/lib/apiClient";

export default function BatchesPage() {
  const [batches, setBatches] = useState<ApiBatchList[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    batchesApi.list(1, 200)
      .then(setBatches)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Derive unique subjects for filter dropdown from real data
  const subjects = Array.from(new Set(batches.map((b) => b.subject).filter(Boolean))) as string[];

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = batch.name.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "all" || (batch.subject?.toLowerCase() === subjectFilter.toLowerCase());
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Batches"
        subtitle="Manage and check all historical and active evaluation batches."
        action={
          <Button asChild className="btn-primary h-10 shadow-card">
            <Link href="/upload"><Plus className="h-4 w-4 mr-1.5" />Upload New Batch</Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batches..." className="pl-9 h-10 border-neutral-300 dark:border-neutral-800" />
        </div>
        <div className="flex items-center gap-3">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-44 h-10"><SelectValue placeholder="All Subjects" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
        </div>
      ) : (
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
                        <StatusPill status={batch.status as any} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {batch.subject && (
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-neutral-400" />Subject: {batch.subject}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-neutral-400" />
                          Created {formatDate(batch.created_at, "MMMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right sm:block hidden">
                        <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Sheets</p>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">
                          {batch.processed_sheets}/{batch.total_sheets}
                        </p>
                      </div>
                      {batch.status === "completed" && batch.avg_score != null && (
                        <div className="text-right sm:block hidden">
                          <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Avg Score</p>
                          <p className="text-sm font-bold text-success-600 dark:text-success-400">
                            {batch.avg_score.toFixed(1)}%
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

          {filteredBatches.length === 0 && !loading && (
            <div className="text-center p-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl">
              <p className="text-neutral-500 dark:text-neutral-400">
                {batches.length === 0 ? "No batches yet. Upload your first batch to get started." : "No batches match your criteria."}
              </p>
              {batches.length === 0 && (
                <Button asChild className="btn-primary mt-4"><Link href="/upload">Upload Batch</Link></Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
