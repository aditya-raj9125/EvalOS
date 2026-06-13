"use client";

import { useDropzone } from "react-dropzone";
import { Upload, File, Trash2 } from "lucide-react";
import { useUploadStore } from "@/store/uploadStore";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";

export function DropZone() {
  const { answerSheets, addAnswerSheets, removeAnswerSheet } = useUploadStore();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      addAnswerSheets(acceptedFiles);
    },
    accept: {
      "application/pdf": [".pdf"],
      "application/zip": [".zip"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 500,
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-150 ease-out min-h-[300px] ${
          isDragActive
            ? "border-primary-500 bg-primary-50/50 dark:border-primary-400 dark:bg-primary-950/20"
            : "border-neutral-300 bg-surface-50 dark:border-neutral-800 dark:bg-neutral-900/50 hover:border-primary-400 hover:bg-primary-50/10"
        }`}
      >
        <input {...getInputProps()} />
        <div className="rounded-full bg-primary-100 p-4 text-primary-600 dark:bg-primary-950 dark:text-primary-400 mb-4 float-animation">
          <Upload className="h-8 w-8" />
        </div>
        <p className="text-lg font-semibold text-neutral-900 dark:text-white">
          Drop PDF, ZIP or images here
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          or click to browse from your device
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4">
          PDF, JPG, PNG, ZIP (max 500 files per batch)
        </p>
      </div>

      {answerSheets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Selected Sheets ({answerSheets.length})
            </h3>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Ready to evaluate
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
            {answerSheets.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center justify-between p-3.5 hover:bg-surface-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <File className="h-5 w-5 text-neutral-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatFileSize(fileObj.file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => removeAnswerSheet(fileObj.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
