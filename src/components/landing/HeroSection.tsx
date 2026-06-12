"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { FloatingPreviewCard } from "./FloatingPreviewCard";

const trustSignals = [
  "Free during beta",
  "No credit card required",
  "Results in minutes",
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
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 pt-20 pb-16"
    >
      {/* ── Background layers ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-40" />

        {/* Gradient orbs */}
        <div className="glow-orb absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 bg-blue-600/20" />
        <div className="glow-orb absolute top-1/3 -right-40 h-[500px] w-[500px] bg-violet-600/10" />
        <div className="glow-orb absolute bottom-0 -left-20 h-[400px] w-[400px] bg-cyan-600/8" />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,7,18,0.7)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">

          {/* ── Left: copy ── */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">

            {/* Announcement badge */}
            <motion.div
              custom={0}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 backdrop-blur-sm badge-glow"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-semibold tracking-wide text-blue-300">
                Now in Beta — Free for educators
              </span>
              <span className="pulse-dot ml-0.5 h-1.5 w-1.5 rounded-full bg-blue-400" />
            </motion.div>

            {/* H1 */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="mb-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Grade answer sheets
              <br />
              <span className="shimmer-text">10× faster</span>
              <span className="text-white"> with AI</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              custom={2}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="mb-10 max-w-[480px] text-lg leading-relaxed text-neutral-400"
            >
              Upload any subject's answer sheets. AI evaluates, annotates with
              ticks &amp; crosses, and delivers results — just like manual
              grading, but in minutes.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="mb-10 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/dashboard"
                id="hero-primary-cta"
                className="btn-glow"
              >
                Start Evaluating Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                id="hero-secondary-cta"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                <Zap className="h-4 w-4 text-yellow-400" />
                See it in action
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              custom={4}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={fadeUp}
              className="flex flex-wrap items-center gap-5"
            >
              {trustSignals.map((signal) => (
                <div key={signal} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-neutral-400">{signal}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: preview mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative flex items-center justify-center"
          >
            <FloatingPreviewCard />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />
    </section>
  );
}
