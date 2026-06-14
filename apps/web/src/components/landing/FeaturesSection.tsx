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
  },
  {
    icon: Bot,
    title: "AI Annotation & Marks",
    description:
      "AI reads each answer, applies the rubric, and marks red crosses and green ticks — just like a human examiner.",
  },
  {
    icon: BookOpen,
    title: "Any Subject + Rubric",
    description:
      "Upload your custom question paper and marking scheme. Works for CBSE, IIT-JEE, state boards, and universities.",
  },
  {
    icon: Eye,
    title: "Human Review Queue",
    description:
      "Low-confidence AI decisions are flagged for human review. Approve, override, or send back for re-check.",
  },
  {
    icon: Users,
    title: "Student Portal",
    description:
      "Students enter their roll number and instantly see their annotated sheet, score breakdown, and feedback.",
  },
  {
    icon: ImageIcon,
    title: "Diagram Evaluation",
    description:
      "AI recognizes and evaluates diagrams, graphs, and circuit diagrams — not just text answers.",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="relative bg-[#fdfdfd] py-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Heading: The Problem */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-32 text-center"
        >
          <div className="mb-6 inline-flex items-center text-[13px] font-semibold tracking-[0.2em] text-primary-500 uppercase">
            The Problem
          </div>
          <h2 className="mx-auto max-w-4xl text-4xl font-medium tracking-tight text-[#222222] sm:text-5xl md:text-6xl leading-[1.15]">
            Teachers are Stuck Spending 80% of Their Time Manually Grading
          </h2>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 hover:ring-neutral-300"
              >
                {/* Icon */}
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Text */}
                <h3 className="mb-3 text-xl font-semibold text-[#222222]">
                  {feature.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
