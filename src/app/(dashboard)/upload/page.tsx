"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { UploadWizard } from "@/components/upload/UploadWizard";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Batch"
        subtitle="Create a new evaluation batch by uploading answer sheets and providing a grading rubric."
      />

      <UploadWizard />
    </div>
  );
}
