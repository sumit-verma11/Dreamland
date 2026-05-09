"use client";

import { motion } from "framer-motion";
import { Sparkles, View, Wand2 } from "lucide-react";

import { AI_FEATURES } from "@/lib/mock-data";

const ICONS = { Sparkles, Wand2, View } as const;

export function AiFeatures() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(16,185,129,0.16)_0%,transparent_70%)]" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Built with AI
          </p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Three tools that change how you find a home
          </h2>
          <p className="mt-3 text-white/70">
            We trained models on years of transactions, commute data, and 3D scans so you can
            decide with confidence.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {AI_FEATURES.map((feature, i) => {
            const Icon = ICONS[feature.icon];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06]"
              >
                <div
                  className={
                    "inline-grid size-11 place-items-center rounded-xl " + feature.accent
                  }
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {feature.description}
                </p>
                <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 transition group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
