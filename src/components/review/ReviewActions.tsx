"use client";

import { useState } from "react";
import { Check, Edit2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReviewActionsProps {
  maxMarks: number;
  aiScore: number;
  onApprove: () => void;
  onOverride: (newScore: number, reason: string) => void;
  onRecheck: () => void;
  disabled?: boolean;
}

export function ReviewActions({
  maxMarks,
  aiScore,
  onApprove,
  onOverride,
  onRecheck,
  disabled = false,
}: ReviewActionsProps) {
  const [isOverriding, setIsOverriding] = useState(false);
  const [newScoreVal, setNewScoreVal] = useState(aiScore.toString());
  const [reason, setReason] = useState("");

  const handleConfirmOverride = () => {
    const parsed = parseFloat(newScoreVal);
    if (isNaN(parsed) || parsed < 0 || parsed > maxMarks) {
      alert(`Score must be between 0 and ${maxMarks}`);
      return;
    }
    if (reason.trim().length < 10) {
      alert("Please enter a reason of at least 10 characters.");
      return;
    }
    onOverride(parsed, reason);
    setIsOverriding(false);
    setReason("");
  };

  return (
    <div className="space-y-4">
      {isOverriding ? (
        <div className="p-4 rounded-2xl border border-primary-200 bg-primary-50/10 dark:border-primary-800 dark:bg-primary-950/20 space-y-4 animate-in fade-in duration-200">
          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Override Score</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="overrideScore">New Score (Max: {maxMarks})</Label>
              <Input
                id="overrideScore"
                type="number"
                value={newScoreVal}
                onChange={(e) => setNewScoreVal(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="overrideReason">Reason</Label>
              <Input
                id="overrideReason"
                type="text"
                placeholder="Faint handwriting read successfully"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleConfirmOverride}
              disabled={disabled}
              className="btn-primary"
            >
              Confirm Override
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOverriding(false)}
              className="btn-ghost border border-neutral-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={onApprove}
            disabled={disabled}
            className="flex items-center gap-1.5 h-10 bg-success-600 hover:bg-success-700 text-white font-semibold shadow-card rounded-md"
          >
            <Check className="h-4 w-4" />
            Approve AI Score
          </Button>

          <Button
            onClick={() => setIsOverriding(true)}
            disabled={disabled}
            className="flex items-center gap-1.5 h-10 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-card rounded-md"
          >
            <Edit2 className="h-4 w-4" />
            Override Score
          </Button>

          <Button
            onClick={onRecheck}
            disabled={disabled}
            variant="outline"
            className="flex items-center gap-1.5 h-10 border-warning-300 text-warning-700 bg-warning-50 hover:bg-warning-100 font-semibold rounded-md dark:border-warning-800 dark:bg-warning-950/20 dark:text-warning-400"
          >
            <AlertCircle className="h-4 w-4" />
            Mark for Recheck
          </Button>
        </div>
      )}
    </div>
  );
}
