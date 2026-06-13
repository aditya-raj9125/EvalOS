"use client";

import { useDropzone } from "react-dropzone";
import { FileUp, File, X } from "lucide-react";
import { useUploadStore } from "@/store/uploadStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatFileSize } from "@/lib/utils";

import { GuidelinesInput } from "./GuidelinesInput";

interface SlotProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

function RubricSlot({ label, file, onChange }: SlotProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onChange(acceptedFiles[0]);
    },
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  if (file) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-3 min-w-0">
          <File className="h-6 w-6 text-primary-600 dark:text-primary-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase font-semibold">
              {label}
            </p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {file.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md"
          onClick={() => onChange(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 ${
        isDragActive
          ? "border-primary-500 bg-primary-50/50 dark:border-primary-400 dark:bg-primary-950/20"
          : "border-neutral-300 bg-surface-50 hover:border-primary-400 dark:border-neutral-800 dark:bg-neutral-900/50"
      }`}
    >
      <input {...getInputProps()} />
      <FileUp className="h-6 w-6 text-neutral-400 mb-2" />
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Upload {label}
      </span>
      <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
        PDF format only
      </span>
    </div>
  );
}

export function RubricUploader() {
  const {
    questionPaper,
    markingScheme,
    setQuestionPaper,
    setMarkingScheme,
  } = useUploadStore();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block mb-2 font-medium">Question Paper</Label>
          <RubricSlot
            label="Question Paper (PDF)"
            file={questionPaper}
            onChange={setQuestionPaper}
          />
        </div>
        <div>
          <Label className="block mb-2 font-medium">Marking Scheme</Label>
          <RubricSlot
            label="Marking Scheme (PDF)"
            file={markingScheme}
            onChange={setMarkingScheme}
          />
        </div>
      </div>

      <GuidelinesInput />
    </div>
  );
}
