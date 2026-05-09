"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { NEW_PROJECTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<(typeof NEW_PROJECTS)[number]["status"], string> = {
  "NEW LAUNCH": "bg-emerald-100 text-emerald-700",
  "COMING SOON": "bg-amber-100 text-amber-800",
  "READY TO MOVE": "bg-blue-100 text-blue-700",
};

export function NewProjects() {
  return (
    <section id="new-projects" className="bg-background py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-6"
        >
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              New projects
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Launches from India&apos;s top builders
            </h2>
            <p className="mt-2 text-muted-foreground">
              RERA-verified launches with AI-priced configurations and walkthroughs.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
            <Link href="/new-projects">
              All projects
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {NEW_PROJECTS.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-slate-950 text-base font-bold text-emerald-400">
                  {p.builderInitial}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {p.builder}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="size-3" />
                    {p.city}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide",
                    STATUS_STYLES[p.status],
                  )}
                >
                  {p.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>

              <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="font-medium">{p.priceRange}</span>
                <span className="inline-flex items-center text-emerald-600 transition group-hover:translate-x-0.5">
                  Explore
                  <ArrowRight className="ml-1 size-4" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
