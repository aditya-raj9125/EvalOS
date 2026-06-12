"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  {
    number: "38M+",
    label: "Answer sheets evaluated in India annually",
    color: "from-blue-400 to-blue-600",
    glow: "shadow-blue-500/20",
  },
  {
    number: "10×",
    label: "Faster than manual grading",
    color: "from-violet-400 to-violet-600",
    glow: "shadow-violet-500/20",
  },
  {
    number: "98.2%",
    label: "AI accuracy on typed & handwritten sheets",
    color: "from-emerald-400 to-emerald-600",
    glow: "shadow-emerald-500/20",
  },
  {
    number: "Free",
    label: "No credit card — completely free during beta",
    color: "from-amber-400 to-amber-600",
    glow: "shadow-amber-500/20",
  },
];

export function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative bg-neutral-900 py-16"
    >
      {/* Top & bottom border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.number}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              <span
                className={`mb-2 bg-gradient-to-br ${stat.color} bg-clip-text text-4xl font-extrabold text-transparent lg:text-5xl`}
              >
                {stat.number}
              </span>
              <span className="text-sm leading-snug text-neutral-400 max-w-[140px]">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
