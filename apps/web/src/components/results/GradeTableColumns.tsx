"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Sheet } from "@/types/batch";
import { ScoreBadge } from "./ScoreBadge";
import { StatusPill } from "@/components/shared/StatusPill";
import { getScoreColor } from "@/lib/utils";

// Core static columns definition helper
export const getCoreColumns = (onViewSheet: (sheet: Sheet) => void): ColumnDef<Sheet>[] => [
  {
    accessorKey: "rollNumber",
    header: "Roll No.",
    cell: ({ row }) => (
      <span className="font-semibold text-neutral-900 dark:text-white">
        {row.getValue("rollNumber")}
      </span>
    ),
  },
  {
    accessorKey: "studentName",
    header: "Student Name",
    cell: ({ row }) => (
      <span className="text-neutral-700 dark:text-neutral-300">
        {row.getValue("studentName") || "Anonymous"}
      </span>
    ),
  },
  {
    accessorKey: "totalScore",
    header: "Score",
    cell: ({ row }) => {
      const score = row.original.totalScore;
      const maxScore = row.original.maxScore;
      return <ScoreBadge score={score} maxScore={maxScore} />;
    },
  },
  {
    accessorKey: "percentage",
    header: "Percentage",
    cell: ({ row }) => {
      const val = row.original.percentage;
      return (
        <span className="font-medium text-neutral-900 dark:text-white">
          {val.toFixed(1)}%
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      // Map sheet status "pending" / "evaluated" / "flagged" to StatusPill inputs
      const mapping = {
        pending: "pending" as const,
        evaluated: "evaluated" as const,
        flagged: "flagged" as const,
      };
      return <StatusPill status={mapping[status]} />;
    },
  },
];
