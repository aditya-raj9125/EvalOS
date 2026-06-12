"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface Annotation {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  type: "tick" | "cross" | "half";
  questionNumber: number;
  marks: string;
  comment?: string;
}

interface AnnotationOverlayProps {
  imageUrl: string;
  annotations: Annotation[];
}

export function AnnotationOverlay({ imageUrl, annotations }: AnnotationOverlayProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 select-none">
      {/* Base Sheet Image */}
      <img
        src={imageUrl}
        alt="Answer Sheet"
        className="w-full h-auto object-contain"
        draggable={false}
      />

      {/* Render Annotations as absolute layers */}
      <TooltipProvider>
        {annotations.map((ann) => {
          const isTick = ann.type === "tick";
          const isCross = ann.type === "cross";

          return (
            <div
              key={ann.id}
              className="absolute"
              style={{ left: `${ann.x}%`, top: `${ann.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className={`flex items-center justify-center h-8 w-8 rounded-full border shadow-elevated cursor-pointer transition-all duration-150 ${
                      isTick
                        ? "bg-success-50 border-success-400 text-success-600 dark:bg-success-950 dark:border-success-700 dark:text-success-400 hover:scale-110"
                        : isCross
                        ? "bg-danger-50 border-danger-400 text-danger-600 dark:bg-danger-950 dark:border-danger-700 dark:text-danger-400 hover:scale-110"
                        : "bg-warning-50 border-warning-400 text-warning-600 dark:bg-warning-950 dark:border-warning-700 dark:text-warning-400 hover:scale-110"
                    }`}
                  >
                    {isTick && <Check className="h-4.5 w-4.5 stroke-[3]" />}
                    {isCross && <X className="h-4.5 w-4.5 stroke-[3]" />}
                    {!isTick && !isCross && (
                      <span className="text-[10px] font-bold">½</span>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-neutral-900 text-white p-2.5 rounded-lg border border-neutral-800 shadow-elevated">
                  <div className="space-y-1">
                    <p className="font-bold text-xs">Question {ann.questionNumber}</p>
                    <p className="text-xs text-neutral-300">Marks: <span className="font-semibold text-white">{ann.marks}</span></p>
                    {ann.comment && (
                      <p className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-1 mt-1 italic max-w-[180px]">
                        "{ann.comment}"
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
