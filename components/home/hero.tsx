"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { SearchBar } from "@/components/home/search-bar";

const HEADLINE = ["Find", "Your", "Perfect", "Home", "with", "AI"];

const TAGLINES = [
  "Predictive pricing for every locality.",
  "Tours in 3D before you visit.",
  "Smart matches based on how you live.",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.18)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_85%_30%,rgba(99,102,241,0.18)_0%,transparent_60%)]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]"
        />
      </div>

      <div className="container relative flex min-h-[calc(100vh-4rem)] flex-col justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/80"
        >
          <Sparkles className="size-3.5 text-emerald-400" />
          AI-powered property search · Now in 38 cities
        </motion.div>

        <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          {HEADLINE.map((word, i) => {
            const isAccent = word === "AI";
            return (
              <motion.span
                key={`${word}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i + 0.1, duration: 0.5, ease: "easeOut" }}
                className={
                  "mr-3 inline-block " +
                  (isAccent
                    ? "bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent"
                    : "")
                }
              >
                {word}
              </motion.span>
            );
          })}
        </h1>

        <RotatingTagline lines={TAGLINES} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 max-w-5xl"
        >
          <SearchBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/60"
        >
          <Stat value="38" label="cities" />
          <Stat value="2.4M+" label="listings indexed" />
          <Stat value="96%" label="match accuracy" />
          <Stat value="4.8/5" label="user rating" />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span className="font-semibold text-white">{value}</span>{" "}
      <span className="text-white/60">{label}</span>
    </div>
  );
}

function RotatingTagline({ lines }: { lines: string[] }) {
  return (
    <div className="mt-5 h-7 max-w-2xl text-base text-white/70 sm:text-lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative"
      >
        {lines.map((line, i) => (
          <motion.span
            key={line}
            className="absolute left-0 top-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [8, 0, 0, -8],
            }}
            transition={{
              duration: 9,
              times: [0, 0.06, 0.32, 0.36],
              delay: i * 3,
              repeat: Infinity,
              repeatDelay: lines.length * 3 - 9,
            }}
          >
            {line}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
