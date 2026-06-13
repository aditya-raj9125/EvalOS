"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const isProcessing = isLoading || loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isProcessing ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-elevated dark:border-neutral-700 dark:bg-neutral-900">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-950">
            <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-400" />
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-neutral-900 dark:text-white">{title}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-surface-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-dialog-btn"
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50 ${
              variant === "danger"
                ? "bg-danger-600 hover:bg-danger-700"
                : "bg-primary-600 hover:bg-primary-700"
            }`}
          >
            {isProcessing && <LoadingSpinner size="sm" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
