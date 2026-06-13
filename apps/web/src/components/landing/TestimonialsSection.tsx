"use client";

import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useRef } from "react";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Head of Department, Physics",
    institution: "Delhi Public School, R.K. Puram",
    avatar: "PS",
    rating: 5,
    quote:
      "EvalAI cut our evaluation time from 3 weeks to 4 hours. The AI is remarkably accurate — even on handwritten answers. Our teachers can now focus on teaching instead of marking.",
    color: "from-blue-500 to-blue-700",
    borderGlow: "hover:border-blue-500/30",
  },
  {
    name: "Prof. Ramesh Gupta",
    role: "Professor of Mathematics",
    institution: "IIT-JEE Preparation Centre, Kota",
    avatar: "RG",
    rating: 5,
    quote:
      "The rubric flexibility is impressive. I uploaded my custom marking scheme and the AI understood partial credit rules perfectly. It's like having 10 TAs working in parallel.",
    color: "from-violet-500 to-violet-700",
    borderGlow: "hover:border-violet-500/30",
  },
  {
    name: "Ananya Krishnan",
    role: "Vice Principal",
    institution: "St. Xavier's College, Mumbai",
    avatar: "AK",
    rating: 5,
    quote:
      "Students love getting results instantly through the portal. The question-by-question feedback helps them understand exactly where they went wrong. Truly game-changing.",
    color: "from-emerald-500 to-teal-600",
    borderGlow: "hover:border-emerald-500/30",
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative bg-neutral-950 py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-20" />
      <div className="glow-orb pointer-events-none absolute bottom-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 bg-violet-600/8" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
            Testimonials
          </div>
          <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Trusted by educators{" "}
            <span className="gradient-text">across India</span>
          </h2>
          <p className="text-lg text-neutral-400">
            Join thousands of teachers and institutions already using EvalAI
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`group relative rounded-2xl border border-white/8 bg-white/4 p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white/6 ${t.borderGlow}`}
            >
              {/* Quote icon */}
              <div className="mb-5">
                <Quote className="h-8 w-8 text-white/10" />
              </div>

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-7 text-sm leading-relaxed text-neutral-300 group-hover:text-neutral-200 transition-colors">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-xs font-bold text-white shadow-lg`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-neutral-500">
                    {t.role}
                  </p>
                  <p className="text-xs text-neutral-600">{t.institution}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {[
            ["1,200+", "Teachers onboarded"],
            ["85+", "Schools & colleges"],
            ["2.4M+", "Sheets evaluated"],
          ].map(([num, label]) => (
            <div key={num}>
              <p className="text-2xl font-extrabold text-white">{num}</p>
              <p className="text-sm text-neutral-500">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
