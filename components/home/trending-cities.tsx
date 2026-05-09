"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { TRENDING_CITIES } from "@/lib/mock-data";

export function TrendingCities() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Trending
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Cities buyers are watching
          </h2>
          <p className="mt-2 text-muted-foreground">
            Real-time activity across the metros NestIQ users are searching most.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TRENDING_CITIES.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/buy?city=${encodeURIComponent(city.name)}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-slate-900 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${city.imageSeed}/480/600`}
                  alt={city.name}
                  className="absolute inset-0 size-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{city.name}</h3>
                      <p className="text-sm text-white/70">{city.state}</p>
                    </div>
                    <ArrowUpRight className="size-5 -translate-x-1 translate-y-1 opacity-0 transition group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </div>
                  <p className="mt-3 text-sm text-emerald-300">
                    {city.count.toLocaleString("en-IN")} listings
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
