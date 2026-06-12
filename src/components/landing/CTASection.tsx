"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRef } from "react";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-neutral-900 py-28">
      {/* Decorative border lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="glow-orb absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-blue-600/15" />
        <div className="glow-orb absolute -right-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 bg-violet-600/10" />
        <div className="glow-orb absolute -left-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 bg-cyan-600/8" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 badge-glow">
            <Sparkles className="h-4 w-4 text-blue-400" />
            Free during beta — no credit card required
          </div>

          {/* Headline */}
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Start evaluating smarter
            <br />
            <span className="shimmer-text">today</span>
          </h2>

          <p className="mx-auto mb-10 max-w-xl text-lg text-neutral-400">
            Works for any subject, any board. CBSE, IIT-JEE, state boards,
            universities — upload your rubric and go.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              id="cta-section-btn"
              className="btn-glow text-base"
            >
              Upload Your First Batch — Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              Explore features
            </Link>
          </div>

          {/* Micro trust signals */}
          <p className="mt-8 text-sm text-neutral-600">
            Trusted by 1,200+ educators · 85+ institutions · 2.4M sheets evaluated
          </p>
        </motion.div>
      </div>
    </section>
  );
}
