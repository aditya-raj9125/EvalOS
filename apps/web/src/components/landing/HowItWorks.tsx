"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Bot, Eye, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    tag: "Upload",
    title: "Upload sheets & rubric",
    description:
      "Drag and drop your answer sheets (PDF, images, or ZIP) and upload the question paper with marking scheme. Add any special evaluation guidelines.",
    color: "from-blue-500 to-blue-700",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
    visual: (
      <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-6">
        <div className="mb-4 rounded-lg border-2 border-dashed border-blue-500/40 bg-blue-950/40 p-6 text-center">
          <Upload className="mx-auto mb-2 h-7 w-7 text-blue-400" />
          <p className="text-sm font-semibold text-blue-300">Drop PDF, ZIP or images</p>
          <p className="mt-0.5 text-xs text-blue-500">up to 500 files per batch</p>
        </div>
        <div className="space-y-1.5">
          {["physics-batch-2024.zip", "marking-scheme.pdf", "guidelines.txt"].map((f, i) => (
            <div
              key={f}
              className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-xs text-neutral-300"
            >
              <div className={`h-1.5 w-1.5 rounded-full ${i === 2 ? "bg-amber-400" : "bg-emerald-400"}`} />
              {f}
              {i < 2 && <span className="ml-auto text-[10px] text-emerald-400">✓ Ready</span>}
              {i === 2 && <span className="ml-auto text-[10px] text-amber-400">Uploading…</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: Bot,
    tag: "AI Evaluation",
    title: "AI evaluates & annotates",
    description:
      "Our AI reads each answer against the rubric, marks correct answers with green ticks and wrong ones with red crosses, exactly like manual grading.",
    color: "from-violet-500 to-violet-700",
    textColor: "text-violet-400",
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/5",
    visual: (
      <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-violet-300">AI Evaluating — 47 sheets</span>
          <div className="ml-auto text-xs text-neutral-500">3 min 12s</div>
        </div>
        {/* Progress bar */}
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "68%" }}
            transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
          />
        </div>
        <div className="space-y-1.5">
          {[
            { q: "Q1", status: "correct", score: "2/2" },
            { q: "Q2", status: "correct", score: "5/5" },
            { q: "Q3", status: "wrong", score: "0/3" },
            { q: "Q4", status: "partial", score: "2/4" },
          ].map((item) => (
            <div
              key={item.q}
              className="flex items-center justify-between rounded-md bg-white/5 px-3 py-1.5"
            >
              <span className="text-sm font-medium text-neutral-300">{item.q}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold ${
                    item.status === "correct"
                      ? "text-emerald-400"
                      : item.status === "wrong"
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                >
                  {item.score}
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                    item.status === "correct"
                      ? "bg-emerald-500"
                      : item.status === "wrong"
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }`}
                >
                  {item.status === "correct" ? "✓" : item.status === "wrong" ? "✗" : "½"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: Eye,
    tag: "Human Review",
    title: "Review flagged items",
    description:
      "Low-confidence AI decisions are surfaced to you. Approve the AI's score, override it, or mark for re-check — all in one queue.",
    color: "from-amber-500 to-orange-500",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/5",
    visual: (
      <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
            2 items flagged
          </span>
          <span className="ml-auto text-xs text-neutral-500">Confidence &lt; 75%</span>
        </div>
        {[
          { roll: "A2024-042", q: "Q3", confidence: 64, score: "1/5" },
          { roll: "B2024-018", q: "Q7", confidence: 71, score: "3/5" },
        ].map((item) => (
          <div
            key={item.roll}
            className="mb-2 rounded-lg border border-amber-500/20 bg-white/4 p-3"
          >
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-200">{item.roll} · {item.q}</span>
              <span className="text-amber-400">{item.confidence}% confidence</span>
            </div>
            <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${item.confidence}%` }}
              />
            </div>
            <div className="flex gap-1.5">
              <button className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500">
                Approve {item.score}
              </button>
              <button className="rounded-md border border-white/15 px-2.5 py-1 text-[11px] text-neutral-400 hover:bg-white/10">
                Override
              </button>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "04",
    icon: Users,
    tag: "Results",
    title: "Students get results instantly",
    description:
      "When evaluation is complete, students enter their roll number on the portal and see their annotated sheet, question-by-question feedback, and final score.",
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/5",
    visual: (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-lg">
            R
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Riya Sharma</p>
            <p className="text-xs text-neutral-500">Roll: A2024-042</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-extrabold text-emerald-400">72</p>
            <p className="text-xs text-neutral-500">out of 100</p>
          </div>
        </div>
        {/* Score bar */}
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "72%" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Grade: B+</span>
          <span className="text-emerald-400 font-medium">Results available!</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[["Physics", "28/30"], ["Chemistry", "24/30"], ["Math", "20/40"]].map(([sub, score]) => (
            <div key={sub} className="rounded-md bg-white/5 px-2 py-1.5 text-center">
              <p className="text-xs font-bold text-white">{score}</p>
              <p className="text-[10px] text-neutral-500">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="how-it-works" ref={ref} className="relative bg-neutral-900 py-28">
      {/* Border lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
            How It Works
          </div>
          <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            From upload to results in{" "}
            <span className="gradient-text">4 simple steps</span>
          </h2>
          <p className="text-lg text-neutral-400">
            A streamlined workflow built for busy educators
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isReverse = i % 2 !== 0;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
                className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${
                  isReverse ? "lg:direction-ltr" : ""
                }`}
              >
                {/* Text side */}
                <div className={isReverse ? "lg:order-2" : ""}>
                  {/* Step badge */}
                  <div className="mb-5 flex items-center gap-3">
                    <span
                      className={`text-7xl font-extrabold leading-none bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-30 select-none`}
                    >
                      {step.number}
                    </span>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border ${step.borderColor} ${step.bgColor} px-3 py-1 text-xs font-semibold ${step.textColor}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {step.tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-neutral-400">
                    {step.description}
                  </p>
                </div>

                {/* Visual side */}
                <div className={isReverse ? "lg:order-1" : ""}>{step.visual}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
