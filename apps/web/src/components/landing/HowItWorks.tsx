"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { CheckCircle2, FileText, Upload, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeTab, setActiveTab] = useState("schools");

  return (
    <section id="how-it-works" ref={ref} className="relative bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-6 inline-flex items-center text-[13px] font-semibold tracking-[0.2em] text-primary-500 uppercase">
            EVAL AI SOLVES IT
          </div>
          <h2 className="mx-auto max-w-3xl text-4xl font-medium tracking-tight text-[#222222] sm:text-5xl md:text-6xl leading-[1.15]">
            Eval AI Gives Teachers The Infrastructure to Grade Papers- Securely
          </h2>
        </motion.div>

        {/* Toggle Pill */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-20 flex justify-center"
        >
          <div className="inline-flex items-center rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("schools")}
              className={cn(
                "rounded-xl px-8 py-3.5 text-[15px] font-medium transition-all duration-200",
                activeTab === "schools"
                  ? "bg-[#111111] text-white shadow-md"
                  : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              For Schools
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={cn(
                "rounded-xl px-8 py-3.5 text-[15px] font-medium transition-all duration-200",
                activeTab === "teachers"
                  ? "bg-[#111111] text-white shadow-md"
                  : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              For Teachers
            </button>
          </div>
        </motion.div>

        {/* Content Box */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-xl lg:grid-cols-2"
        >
          {/* Left: Mockup UI */}
          <div className="relative flex items-center justify-center bg-gradient-to-b from-[#020617] to-[#042f2e] p-8 lg:p-12">
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-8">
                <div className="mb-2 h-1 w-12 rounded-full bg-white/20" />
                <h3 className="text-xl font-medium text-white">Complete Grading</h3>
              </div>
              
              <div className="space-y-4">
                {/* File Upload Mock */}
                <div className="flex items-center gap-4 rounded-xl border border-white/20 bg-white/10 p-4 transition-all hover:bg-white/15">
                  <Upload className="h-6 w-6 text-primary-400" />
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-white">Upload Answer Sheets</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-primary-400" />
                </div>
                
                {/* Rubric Mock */}
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-gradient-to-r from-primary-900/50 to-primary-800/30 p-4">
                  <FileText className="h-6 w-6 text-primary-300" />
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-primary-100">Physics_Class10_Rubric</p>
                  </div>
                </div>
                
                {/* Evaluate Mock */}
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 opacity-70">
                  <BrainCircuit className="h-6 w-6 text-neutral-400" />
                  <div className="flex-1">
                    <p className="text-[15px] text-neutral-300">Run AI Evaluation</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/20 blur-[80px]" />
          </div>

          {/* Right: Features */}
          <div className="flex flex-col justify-center p-10 lg:p-16">
            <p className="mb-10 text-[17px] leading-relaxed text-neutral-500">
              Use Eval AI to enable automated grading, natively on your School's Platform or through our App.
            </p>
            
            <ul className="mb-12 space-y-6">
              {[
                "Zero Manual Errors - AI grades with high precision",
                "Detailed Analytics with Score Breakdown",
                "Teachers stay in control with review options",
                "Grading time drops dramatically from hours to minutes",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-primary-500/30 bg-primary-50/50">
                    <div className="h-2 w-2 rounded-full bg-primary-500" />
                  </div>
                  <span className="text-[15px] font-medium text-[#444444]">{item}</span>
                </li>
              ))}
            </ul>

            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-[#111111] px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-black hover:shadow-lg"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
