"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { FloatingPreviewCard } from "./FloatingPreviewCard";

const trustSignals = [
  "WTFund",
  "Carrypro",
  "Rye",
  "Yut",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

export function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 pt-32 pb-16"
    >
      {/* ── Background layers ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 mesh-gradient opacity-60" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* ── Left: copy ── */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            
            {/* Announcement badge */}
            <motion.div
              custom={0}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="mb-8 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 shadow-sm"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                P
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                Featured on Product Hunt
              </span>
              <span className="text-[11px] font-bold text-red-400">
                ▲ 352
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="mb-6 text-5xl font-medium tracking-tight text-[#333333] sm:text-6xl lg:text-[4.5rem] leading-[1.1]"
            >
              Evaluation Stack for
              <br />
              <span className="text-primary-500">Agentic Grading</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              custom={2}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="mb-10 max-w-[480px] text-lg leading-relaxed text-neutral-500"
            >
              Eval AI is the evaluation orchestrator for schools enabling
              secure, high-accuracy grading with AI. One integration to 
              grade all subjects and extract marks seamlessly.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="mb-16 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/dashboard"
                id="hero-primary-cta"
                className="inline-flex items-center justify-center rounded-xl bg-[#111111] px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-black hover:shadow-lg"
              >
                Dashboard
              </Link>
              <Link
                href="#how-it-works"
                id="hero-secondary-cta"
                className="inline-flex items-center justify-center rounded-xl bg-[#4d9f94] px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-[#3d8379] hover:shadow-lg shadow-teal-500/20"
              >
                Eval AI Flow
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              custom={4}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="flex w-full flex-wrap items-center justify-center lg:justify-start gap-8 opacity-40 grayscale"
            >
              {trustSignals.map((signal) => (
                <div key={signal} className="text-xl font-bold tracking-tight text-neutral-800">
                  {signal}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: preview mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white/60 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl border border-white/40">
              <FloatingPreviewCard />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
