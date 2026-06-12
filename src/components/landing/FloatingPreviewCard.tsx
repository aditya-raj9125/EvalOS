"use client";

import { motion } from "framer-motion";
import { CheckCircle, X, TrendingUp, Clock, Users, Zap, Bot } from "lucide-react";

const answerLines = [
  { label: "Q1. The velocity of light is...", mark: "correct", score: "2/2", width: 85 },
  { label: "Q2. Newton's second law states...", mark: "correct", score: "3/3", width: 92 },
  { label: "Q3. The formula for kinetic energy...", mark: "wrong", score: "0/2", width: 68 },
  { label: "Q4. Ohm's law can be derived...", mark: "correct", score: "4/4", width: 78 },
  { label: "Q5. The photoelectric effect...", mark: "partial", score: "1/3", width: 72 },
];

const floatingStats = [
  {
    Icon: Zap,
    label: "500 sheets",
    sub: "4 min avg",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    pos: "right-0 top-6",
    delay: 0.7,
    dir: { x: 20, y: 0 },
  },
  {
    Icon: TrendingUp,
    label: "98.2% accuracy",
    sub: "AI confidence",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    pos: "-left-4 bottom-20",
    delay: 0.85,
    dir: { x: -20, y: 0 },
  },
  {
    Icon: Users,
    label: "1,240 students",
    sub: "results ready",
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    pos: "right-4 bottom-4",
    delay: 1.0,
    dir: { x: 0, y: 20 },
  },
  {
    Icon: Clock,
    label: "3 min 42s",
    sub: "batch completed",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    pos: "left-4 top-4",
    delay: 0.6,
    dir: { x: 0, y: -20 },
  },
];

export function FloatingPreviewCard() {
  return (
    <div className="relative h-[520px] w-full max-w-lg">

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          animation: "floatCard 4s ease-in-out infinite",
        }}
        className="w-72 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/12 bg-neutral-900/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Answer Sheet
            </p>
            <p className="text-sm font-bold text-white">Roll No: A2024-042</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5">
          <div className="pulse-dot h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span className="text-xs font-medium text-blue-300">AI Evaluating — Physics Midterm</span>
        </div>

        {/* Answer lines with annotations */}
        <div className="space-y-2.5">
          {answerLines.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.12, ease: "easeOut" }}
              className="flex items-center gap-2.5"
            >
              {/* Line mockup */}
              <div className="flex-1 space-y-1">
                <div
                  className="h-1.5 rounded-full bg-neutral-700"
                  style={{ width: `${item.width}%` }}
                />
                <div
                  className="h-1 rounded-full bg-neutral-800"
                  style={{ width: `${item.width * 0.6}%` }}
                />
              </div>

              {/* Mark */}
              {item.mark === "correct" && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + i * 0.12, type: "spring", stiffness: 300 }}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"
                >
                  <CheckCircle className="h-3 w-3 text-white" />
                </motion.div>
              )}
              {item.mark === "wrong" && (
                <motion.div
                  initial={{ scale: 0, rotate: 20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + i * 0.12, type: "spring", stiffness: 300 }}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/30"
                >
                  <X className="h-3 w-3 text-white" />
                </motion.div>
              )}
              {item.mark === "partial" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.12, type: "spring", stiffness: 300 }}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/30"
                >
                  <span className="text-[9px] font-bold text-white">½</span>
                </motion.div>
              )}

              {/* Score */}
              <span
                className={`w-7 text-right text-[10px] font-bold ${
                  item.mark === "correct"
                    ? "text-emerald-400"
                    : item.mark === "wrong"
                    ? "text-red-400"
                    : "text-amber-400"
                }`}
              >
                {item.score}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Total score */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 px-4 py-2.5"
        >
          <span className="text-xs font-semibold text-emerald-400">Total Score</span>
          <span className="text-base font-extrabold text-emerald-400">10 / 14</span>
        </motion.div>
      </motion.div>

      {/* Floating stat chips */}
      {floatingStats.map(({ Icon, label, sub, color, bg, pos, delay, dir }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, ...dir }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay, duration: 0.5, ease: "easeOut" }}
          className={`absolute ${pos} rounded-xl border border-white/10 bg-neutral-900/90 p-3 shadow-xl shadow-black/40 backdrop-blur-sm`}
        >
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{label}</p>
              <p className="text-[10px] text-neutral-500">{sub}</p>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Keyframe for float */}
      <style jsx>{`
        @keyframes floatCard {
          0%, 100% { transform: translateX(-50%) translateY(-50%); }
          50% { transform: translateX(-50%) translateY(calc(-50% - 12px)); }
        }
      `}</style>
    </div>
  );
}
