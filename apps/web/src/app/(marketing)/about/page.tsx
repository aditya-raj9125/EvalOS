"use client";

import { motion } from "framer-motion";
import { Bot, Award, Clock, ShieldCheck, Heart } from "lucide-react";

const values = [
  {
    icon: Clock,
    title: "Time reclaimed",
    description: "We help teachers reduce their manual grading time by up to 90%, giving them back hours each week for mentoring and teaching.",
  },
  {
    icon: Award,
    title: "Fairness and accuracy",
    description: "Our dual-verification process ensures AI accuracy matches the standard of double-blind manual grading, eliminating biases.",
  },
  {
    icon: ShieldCheck,
    title: "Institutional trust",
    description: "Built with security-first protocols to ensure exam papers and student data remain encrypted, private, and confidential.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Mission Section */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400"
          >
            About Us
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-white"
          >
            Empowering educators through intelligent grading
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400"
          >
            EvalAI was born out of a simple observation: teachers spend too much time grading and too little time teaching. 
            By leveraging state-of-the-art AI visual models, we transcribe, evaluate, and annotate handwritten and typed 
            answer sheets in minutes. We provide the speed of technology with the control of human review.
          </motion.p>
        </div>

        {/* Our values */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex flex-col rounded-2xl border border-neutral-200 p-8 shadow-card dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Story details */}
        <div className="mx-auto mt-24 max-w-3xl rounded-3xl bg-primary-50 p-8 dark:bg-primary-950/20 xl:p-12">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-elevated">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Our Vision</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                To build an ecosystem where examinations are no longer administrative hurdles. 
                Our platform integrates with Board Standards (CBSE, State Boards), Higher Education institutions, 
                and competitive prep platforms (IIT-JEE, NEET) to deliver seamless, instant feedback to students and automated grading for institutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
