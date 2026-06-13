"use client";

import { StudentPortalHeader } from "@/components/student/StudentPortalHeader";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-neutral-950 flex flex-col">
      <StudentPortalHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
