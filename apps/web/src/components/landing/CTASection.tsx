"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Copy } from "lucide-react";
import { useRef } from "react";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-white py-24 pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          
          {/* Left Column: Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex flex-col items-center text-center"
          >
            {/* Mockup code block */}
            <div className="mb-8 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-[#fdfdfd] shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 bg-[#f8f8f8] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <button className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 shadow-sm hover:bg-neutral-50">
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <div className="p-6 text-left font-mono text-sm leading-relaxed text-[#333333]">
                <p><span className="text-pink-600">import</span> {'{'} EvalSDK {'}'} <span className="text-pink-600">from</span> <span className="text-emerald-600">'@eval-ai/core'</span>;</p>
                <br />
                <p><span className="text-pink-600">const</span> evalApi = <span className="text-pink-600">new</span> EvalSDK({'{'}</p>
                <p className="ml-4">apiKey: <span className="text-violet-600">process.env.EVAL_KEY</span>,</p>
                <p className="ml-4">environment: <span className="text-emerald-600">'production'</span>,</p>
                <p>{'})'};</p>
              </div>
            </div>

            <h2 className="mb-4 text-3xl font-medium tracking-tight text-[#222222]">
              Integrations
            </h2>
            <p className="mb-8 max-w-md text-[17px] leading-relaxed text-neutral-500">
              Integrate Eval API in 4 lines of code.<br/>
              Signup on Dashboard for Free Sandbox!
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={"/docs" as any}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 hover:text-neutral-900"
              >
                Read Docs
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-[#111111] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-black hover:shadow-lg"
              >
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Setup */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex flex-col items-center text-center"
          >
            {/* Mockup Mobile App */}
            <div className="mb-8 relative flex h-64 w-full items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50">
              <div className="relative h-56 w-[260px] rounded-t-3xl border-[6px] border-b-0 border-[#111111] bg-white shadow-xl">
                <div className="absolute left-1/2 top-0 h-4 w-24 -translate-x-1/2 rounded-b-xl bg-[#111111]" />
                <div className="p-4 pt-8">
                  <div className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <div className="h-6 w-6 rounded-full bg-primary-500" />
                    <span className="text-sm font-semibold text-neutral-800">Eval AI</span>
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-[#222222]">Home</h3>
                  <p className="mb-4 text-xs text-neutral-500">Manage your grading and rubrics.</p>
                  <div className="flex gap-2 border-b border-neutral-100 pb-3">
                    <span className="text-xs font-semibold text-neutral-800">Sheets</span>
                    <span className="ml-4 text-xs font-medium text-neutral-400">Rubrics</span>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="mb-4 text-3xl font-medium tracking-tight text-[#222222]">
              Setup Eval AI in 60 Seconds
            </h2>
            <p className="mb-8 max-w-md text-[17px] leading-relaxed text-neutral-500">
              Signup on Eval AI, Upload your Answer Sheets &amp; Approve Results!
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 hover:text-neutral-900"
              >
                Platform Features
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-[#4d9f94] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#3d8379] hover:shadow-lg shadow-teal-500/20"
              >
                Setup Eval AI
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
