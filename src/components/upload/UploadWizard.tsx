"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Play } from "lucide-react";
import { useUploadStore, type UploadStep } from "@/store/uploadStore";
import { DropZone } from "./DropZone";
import { RubricUploader } from "./RubricUploader";
import { BatchConfirmation } from "./BatchConfirmation";
import { UploadProgress } from "./UploadProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const steps = [
  { id: 1, name: "Answer Sheets" },
  { id: 2, name: "Rubrics" },
  { id: 3, name: "Configuration" },
  { id: 4, name: "Review" },
];

export function UploadWizard() {
  const router = useRouter();
  const {
    step,
    setStep,
    answerSheets,
    questionPaper,
    markingScheme,
    batchName,
    subject,
    expectedMarks,
    enableStudentPortal,
    accessCode,
    notifyOnComplete,
    setBatchConfig,
    updateFileProgress,
    isSubmitting,
    setIsSubmitting,
  } = useUploadStore();

  const handleNext = () => {
    if (step === 1) {
      if (answerSheets.length === 0) {
        toast.error("Please add at least one answer sheet.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!questionPaper || !markingScheme) {
        toast.error("Both Question Paper and Marking Scheme PDFs are required.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!batchName.trim()) {
        toast.error("Batch Name is required.");
        return;
      }
      if (!subject.trim()) {
        toast.error("Subject is required.");
        return;
      }
      if (enableStudentPortal && (!accessCode || accessCode.length < 4)) {
        toast.error("Access code must be at least 4 characters when student portal is enabled.");
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as UploadStep);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate per-file uploads progress bars
    for (let i = 0; i < answerSheets.length; i++) {
      const file = answerSheets[i];
      updateFileProgress(file.id, 0, "uploading");
      
      // Simulate progress ticks
      for (let p = 10; p <= 100; p += 30) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        updateFileProgress(file.id, Math.min(p, 100), p >= 100 ? "done" : "uploading");
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    toast.success("Batch uploaded successfully! Evaluation started.");
    
    // Redirect to the newly created batch page (batch-2 is mock processing)
    router.push("/batches/batch-2");
  };

  if (isSubmitting) {
    return <UploadProgress />;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Wizard Steps Indicator */}
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <li key={s.name} className={`relative flex items-center ${idx !== steps.length - 1 ? "w-full" : ""}`}>
              <div className="flex items-center shrink-0">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-2 ${
                    s.id === step
                      ? "bg-primary-600 text-white ring-primary-600"
                      : s.id < step
                      ? "bg-success-600 text-white ring-success-600"
                      : "bg-white text-neutral-500 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800"
                  }`}
                >
                  {s.id < step ? "✓" : s.id}
                </span>
                <span className="ml-3 text-sm font-semibold hidden md:block text-neutral-900 dark:text-white truncate">
                  {s.name}
                </span>
              </div>
              {idx !== steps.length - 1 && (
                <div
                  className={`flex-1 mx-4 h-0.5 hidden md:block ${
                    s.id < step ? "bg-success-600" : "bg-neutral-200 dark:bg-neutral-800"
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Main Content for current step */}
      <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-card">
        {step === 1 && <DropZone />}
        {step === 2 && <RubricUploader />}
        {step === 3 && (
          <div className="space-y-6 max-w-xl">
            <div>
              <Label htmlFor="batchName">Batch Name</Label>
              <Input
                id="batchName"
                value={batchName}
                onChange={(e) => setBatchConfig({ batchName: e.target.value })}
                placeholder="e.g. Class 12 Physics — March 2025"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setBatchConfig({ subject: e.target.value })}
                placeholder="e.g. Physics"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expectedMarks">Expected Marks per Paper</Label>
              <Input
                id="expectedMarks"
                type="number"
                value={expectedMarks}
                onChange={(e) => setBatchConfig({ expectedMarks: parseInt(e.target.value) || 0 })}
                placeholder="100"
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-neutral-100 p-4 dark:border-neutral-800">
              <div className="space-y-0.5">
                <Label htmlFor="studentPortal" className="text-sm font-medium">Enable Student Portal</Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Allow students to enter a code and view their marked sheets.
                </p>
              </div>
              <Switch
                id="studentPortal"
                checked={enableStudentPortal}
                onCheckedChange={(val) => setBatchConfig({ enableStudentPortal: val })}
              />
            </div>

            {enableStudentPortal && (
              <div className="animate-in fade-in-50 duration-150">
                <Label htmlFor="accessCode">Student Access Code</Label>
                <Input
                  id="accessCode"
                  value={accessCode}
                  onChange={(e) => setBatchConfig({ accessCode: e.target.value })}
                  placeholder="e.g. PHYS-2025"
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-neutral-100 p-4 dark:border-neutral-800">
              <div className="space-y-0.5">
                <Label htmlFor="notify" className="text-sm font-medium">Notify me when complete</Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Receive an email once the evaluation is fully annotated.
                </p>
              </div>
              <Switch
                id="notify"
                checked={notifyOnComplete}
                onCheckedChange={(val) => setBatchConfig({ notifyOnComplete: val })}
              />
            </div>
          </div>
        )}
        {step === 4 && <BatchConfirmation />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="btn-ghost px-4 h-10 border-neutral-300 dark:border-neutral-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {step < 4 ? (
          <Button onClick={handleNext} className="btn-primary px-5 h-10 shadow-card">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="btn-primary px-6 h-10 shadow-card bg-success-600 hover:bg-success-700">
            <Play className="h-4 w-4 mr-2" />
            Start Evaluation
          </Button>
        )}
      </div>
    </div>
  );
}
