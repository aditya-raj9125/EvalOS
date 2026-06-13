"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown, Search, Eye, X, Download } from "lucide-react";
import autoAnimate from "@formkit/auto-animate";
import type { Sheet } from "@/types/batch";
import { getCoreColumns } from "./GradeTableColumns";
import { SheetViewer } from "./SheetViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet as Drawer, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface GradeTableProps {
  sheets: Sheet[];
  onOverrideScore?: (sheetId: string, questionNumber: number, newScore: number, reason: string) => void;
}

export function GradeTable({ sheets, onOverrideScore }: GradeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  // Apply row animation
  useEffect(() => {
    if (tbodyRef.current) {
      autoAnimate(tbodyRef.current);
    }
  }, []);

  // Filter sheets by status
  const filteredSheets = useMemo(() => {
    if (statusFilter === "all") return sheets;
    return sheets.filter((s) => s.status === statusFilter);
  }, [sheets, statusFilter]);

  // Extract the maximum number of questions across all sheets to build dynamic columns
  const questionCount = useMemo(() => {
    if (sheets.length === 0) return 0;
    return Math.max(...sheets.map((s) => s.questionScores.length));
  }, [sheets]);

  // Build columns dynamically
  const columns = useMemo<ColumnDef<Sheet>[]>(() => {
    const core = getCoreColumns((sheet) => setSelectedSheet(sheet));

    // Dynamic question columns inserted between Student Name and Total Score
    const questionCols: ColumnDef<Sheet>[] = Array.from({ length: questionCount }).map((_, idx) => {
      const qNum = idx + 1;
      return {
        id: `q-${qNum}`,
        header: `Q${qNum}`,
        cell: ({ row }) => {
          const qScore = row.original.questionScores.find((q) => q.questionNumber === qNum);
          if (!qScore) return <span className="text-neutral-350">-</span>;

          const { awardedMarks, maxMarks } = qScore;
          const isFull = awardedMarks === maxMarks;
          const isZero = awardedMarks === 0;

          return (
            <span
              className={`font-semibold ${
                isFull
                  ? "text-success-600 dark:text-success-400"
                  : isZero
                  ? "text-danger-600 dark:text-danger-400"
                  : "text-warning-600 dark:text-warning-400"
              }`}
            >
              {awardedMarks}
            </span>
          );
        },
      };
    });

    // Splice dynamic columns right after name (index 2)
    const result = [...core];
    result.splice(2, 0, ...questionCols);

    // Actions Column
    result.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedSheet(row.original)}
          className="btn-ghost flex items-center gap-1 h-8 px-2 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        >
          <Eye className="h-3.5 w-3.5" />
          View Sheet
        </Button>
      ),
    });

    return result;
  }, [questionCount]);

  const table = useReactTable({
    data: filteredSheets,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Handle score override from SheetViewer inside the sheet drawer
  const handleSheetOverride = (questionNumber: number, newScore: number, reason: string) => {
    if (!selectedSheet) return;
    
    // Call parent handler
    if (onOverrideScore) {
      onOverrideScore(selectedSheet.id, questionNumber, newScore, reason);
    }

    // Locally update selectedSheet to trigger visual update inside drawer
    const updatedQuestionScores = selectedSheet.questionScores.map((q) =>
      q.questionNumber === questionNumber
        ? { ...q, awardedMarks: newScore, isFlagged: false }
        : q
    );
    const totalScore = updatedQuestionScores.reduce((sum, q) => sum + q.awardedMarks, 0);
    const percentage = (totalScore / selectedSheet.maxScore) * 100;
    
    setSelectedSheet({
      ...selectedSheet,
      questionScores: updatedQuestionScores,
      totalScore,
      percentage,
      status: updatedQuestionScores.some((q) => q.isFlagged) ? "flagged" : "evaluated",
    });
  };

  return (
    <div className="space-y-4">
      {/* Filtering and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search roll number or name..."
            className="pl-9 h-10 border-neutral-300 dark:border-neutral-800"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="evaluated">Evaluated</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TanStack Table Container */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-neutral-200 bg-surface-50 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      className={`px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-400 select-none ${
                        header.column.getCanSort() ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="h-3.5 w-3.5" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody ref={tbodyRef} className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedSheet(row.original)}
                    className="hover:bg-surface-50/55 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-neutral-500">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-surface-50/40 dark:bg-neutral-950/20">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Showing {table.getRowModel().rows.length} of {filteredSheets.length} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 text-xs px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 text-xs px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Drawer slide-over Sheet Component */}
      <Drawer open={selectedSheet !== null} onOpenChange={(open) => !open && setSelectedSheet(null)}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto bg-white border-l border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 p-6">
          <SheetHeader className="mb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-neutral-900 dark:text-white">
                Answer Sheet Evaluation
              </SheetTitle>
            </div>
            {selectedSheet && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex flex-wrap gap-x-4">
                <span>Roll No: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedSheet.rollNumber}</span></span>
                <span>•</span>
                <span>Student: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedSheet.studentName || "Anonymous"}</span></span>
              </div>
            )}
          </SheetHeader>

          {selectedSheet && (
            <SheetViewer sheet={selectedSheet} onOverrideScore={handleSheetOverride} />
          )}
        </SheetContent>
      </Drawer>
    </div>
  );
}
