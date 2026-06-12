"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Upload,
  Bot,
  BookOpen,
  Users,
  Eye,
  ImageIcon,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Bulk Upload",
    description:
      "Upload hundreds of answer sheets at once — PDF, JPG, PNG, or ZIP bundles up to 500 files per batch.",
    gradient: "from-blue-500 to-blue-700",
    glow: "rgba(59,130,246,0.15)",
    accent: "text-blue-400",
    border: "hover:border-blue-500/30",
  },
  {
    icon: Bot,
    title: "AI Annotation & Marks",
    description:
      "AI reads each answer, applies the rubric, and marks red crosses and green ticks — just like a human examiner.",
    gradient: "from-violet-500 to-violet-700",
    glow: "rgba(139,92,246,0.15)",
    accent: "text-violet-400",
    border: "hover:border-violet-500/30",
  },
  {
    icon: BookOpen,
    title: "Any Subject + Rubric",
    description:
      "Upload your custom question paper and marking scheme. Works for CBSE, IIT-JEE, state boards, and universities.",
    gradient: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.15)",
    accent: "text-amber-400",
    border: "hover:border-amber-500/30",
  },
  {
    icon: Eye,
    title: "Human Review Queue",
    description:
      "Low-confidence AI decisions are flagged for human review. Approve, override, or send back for re-check.",
    gradient: "from-rose-500 to-pink-600",
    glow: "rgba(244,63,94,0.15)",
    accent: "text-rose-400",
    border: "hover:border-rose-500/30",
  },
  {
    icon: Users,
    title: "Student Portal",
    description:
      "Students enter their roll number and instantly see their annotated sheet, score breakdown, and feedback.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.15)",
    accent: "text-emerald-400",
    border: "hover:border-emerald-500/30",
  },
  {
    icon: ImageIcon,
    title: "Diagram Evaluation",
    description:
      "AI recognizes and evaluates diagrams, graphs, and circuit diagrams — not just text answers.",
    gradient: "from-cyan-500 to-sky-600",
    glow: "rgba(6,182,212,0.15)",
    accent: "text-cyan-400",
    border: "hover:border-cyan-500/30",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="relative bg-neutral-950 py-28">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />

      {/* Glow accent */}
      <div className="glow-orb pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 bg-blue-600/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
            Platform Features
          </div>
          <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Everything you need for{" "}
            <span className="gradient-text">fair, fast evaluation</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-400">
            A complete platform designed for modern educational institutions —
            from upload to result delivery.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white/6 ${feature.border} cursor-default`}
                style={{
                  background: `radial-gradient(350px circle at 0% 0%, ${feature.glow}, transparent 70%)`,
                }}
              >
                {/* Icon */}
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Text */}
                <h3 className="mb-2.5 text-lg font-bold text-white">
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed text-neutral-400 group-hover:text-neutral-300 transition-colors`}>
                  {feature.description}
                </p>

                {/* Decorative corner accent */}
                <div
                  className={`pointer-events-none absolute right-4 top-4 h-16 w-16 rounded-full bg-gradient-to-br ${feature.gradient} opacity-10 blur-xl transition-opacity duration-300 group-hover:opacity-25`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
