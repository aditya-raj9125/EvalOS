"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, FileDown, LogOut, Loader2 } from "lucide-react";
import type { Sheet } from "@/types/batch";
import { StudentScoreCard } from "@/components/student/StudentScoreCard";
import { StudentSheetViewer } from "@/components/student/StudentSheetViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock student sheet search result
const mockStudentSheets: Record<string, Sheet> = {
  "PHY-101": {
    id: "sheet-1",
    batchId: "batch-1",
    rollNumber: "PHY-101",
    studentName: "Aditya Raj",
    status: "evaluated",
    totalScore: 92,
    maxScore: 100,
    percentage: 92,
    aiConfidence: 96,
    questionScores: [
      { questionNumber: 1, awardedMarks: 20, maxMarks: 20, studentAnswer: "Acceleration is the rate of change of velocity.", aiReason: "Perfect explanation and correct units.", isFlagged: false, confidence: 98 },
      { questionNumber: 2, awardedMarks: 30, maxMarks: 30, studentAnswer: "The total flux is Q/epsilon_0.", aiReason: "Correct application of Gauss's Law.", isFlagged: false, confidence: 97 },
      { questionNumber: 3, awardedMarks: 22, maxMarks: 25, studentAnswer: "Refractive index = c/v = 1.5", aiReason: "Correct math, slight spelling mistake.", isFlagged: false, confidence: 95 },
      { questionNumber: 4, awardedMarks: 20, maxMarks: 25, studentAnswer: "Total energy = K.E + P.E = -13.6 eV", aiReason: "Correct final energy but missed drawing levels.", isFlagged: false, confidence: 94 },
    ],
    annotatedImageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop",
  },
  "PHY-102": {
    id: "sheet-2",
    batchId: "batch-1",
    rollNumber: "PHY-102",
    studentName: "Sneha Gupta",
    status: "evaluated",
    totalScore: 78,
    maxScore: 100,
    percentage: 78,
    aiConfidence: 92,
    questionScores: [
      { questionNumber: 1, awardedMarks: 18, maxMarks: 20, studentAnswer: "Acceleration is change in velocity over time.", aiReason: "Good explanation, minor unit missing.", isFlagged: false, confidence: 94 },
      { questionNumber: 2, awardedMarks: 25, maxMarks: 30, studentAnswer: "Flux through closed surface depends on charge.", aiReason: "Formula not written explicitly.", isFlagged: false, confidence: 91 },
      { questionNumber: 3, awardedMarks: 20, maxMarks: 25, studentAnswer: "R.I = 1.33 for water.", aiReason: "Correct, step detailed calculation is missing.", isFlagged: false, confidence: 93 },
      { questionNumber: 4, awardedMarks: 15, maxMarks: 25, studentAnswer: "Ground state energy is negative.", aiReason: "Incorrect formula derivation.", isFlagged: false, confidence: 90 },
    ],
  },
};

export default function StudentPortalPage() {
  const params = useParams();
  const router = useRouter();
  const initialRollNumber = params.rollNumber as string;

  const [rollNumberInput, setRollNumberInput] = useState(
    initialRollNumber && initialRollNumber !== "portal" ? initialRollNumber : ""
  );
  const [accessCode, setAccessCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sheetData, setSheetData] = useState<Sheet | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumberInput.trim()) {
      toast.error("Please enter your Roll Number.");
      return;
    }
    if (!accessCode.trim()) {
      toast.error("Please enter the Portal Access Code.");
      return;
    }

    setLoading(true);
    // Simulate lookup verification delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);

    // Mock verification: accessCode matches "PHYS-12" or "PHYS-2025"
    const isCodeValid = accessCode.toUpperCase() === "PHYS-12" || accessCode.toUpperCase() === "PHYS-2025";
    const foundSheet = mockStudentSheets[rollNumberInput.toUpperCase()];

    if (isCodeValid && foundSheet) {
      setSheetData(foundSheet);
      setIsVerified(true);
      toast.success("Verification successful!");
      // Optionally rewrite URL dynamically
      window.history.replaceState(null, "", `/student/${rollNumberInput}`);
    } else {
      toast.error("Invalid Roll Number or Access Code. Please check credentials.");
    }
  };

  const handleSignOut = () => {
    setIsVerified(false);
    setSheetData(null);
    setAccessCode("");
    setRollNumberInput("");
    router.push("/student/portal");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {!isVerified ? (
        <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-3xl shadow-card space-y-6">
          <div className="text-center pb-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-905 dark:text-white">
              Student Gradebook Verification
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Enter details below to retrieve your evaluated and annotated answer sheet.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="rollNumber">Roll Number / Student ID</Label>
              <Input
                id="rollNumber"
                type="text"
                placeholder="e.g. PHY-101"
                value={rollNumberInput}
                onChange={(e) => setRollNumberInput(e.target.value)}
                className="mt-1 h-10 border-neutral-300 dark:border-neutral-800"
              />
            </div>

            <div>
              <Label htmlFor="accessCode">Portal Access Code</Label>
              <Input
                id="accessCode"
                type="text"
                placeholder="Provided by school, e.g. PHYS-12"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="mt-1 h-10 border-neutral-300 dark:border-neutral-800"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-primary h-11">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Retrieve Answer Sheet
                </>
              )}
            </Button>
          </form>
        </div>
      ) : (
        sheetData && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Evaluation Report Card
                </h2>
                <p className="text-xs text-neutral-500">
                  Securely generated by EvalAI AI-checking engine.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => toast.success("Downloading annotated report PDF...")}
                  className="h-9 text-xs border-neutral-300 dark:border-neutral-800 flex items-center gap-1.5"
                >
                  <FileDown className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="h-9 text-xs border border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Score card grid */}
            <StudentScoreCard
              studentName={sheetData.studentName || "Aditya Raj"}
              rollNumber={sheetData.rollNumber}
              totalScore={sheetData.totalScore}
              maxScore={sheetData.maxScore}
              percentage={sheetData.percentage}
            />

            {/* Sheet viewer breakdown */}
            <StudentSheetViewer sheet={sheetData} />
          </div>
        )
      )}
    </div>
  );
}
