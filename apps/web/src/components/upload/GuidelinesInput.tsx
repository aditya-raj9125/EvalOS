"use client";

import { useUploadStore } from "@/store/uploadStore";
import { Label } from "@/components/ui/label";

export function GuidelinesInput() {
  const { guidelines, setGuidelines } = useUploadStore();

  return (
    <div className="space-y-2">
      <Label htmlFor="guidelines" className="font-medium">
        Special Evaluation Guidelines (Optional)
      </Label>
      <textarea
        id="guidelines"
        value={guidelines}
        onChange={(e) => setGuidelines(e.target.value)}
        rows={5}
        placeholder="e.g. Award full marks for alternative valid methods. Do not penalise spelling errors in scientific terms."
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all duration-150 ease-out focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
      />
    </div>
  );
}
