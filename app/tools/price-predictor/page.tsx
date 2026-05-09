import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { Navbar } from "@/components/nav/navbar";
import { PricePredictorForm } from "@/components/tools/price-predictor-form";

export const metadata: Metadata = {
  title: "AI Price Predictor | NestIQ",
  description:
    "Get an instant estimated market value for any property in India. Powered by real comparable data and market analysis — no API fees, no guesswork.",
};

export default function PricePredictorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20">
        {/* Hero header */}
        <div className="border-b border-border bg-gradient-to-br from-emerald-50 to-background py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                <Sparkles className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">AI Price Predictor</h1>
                <p className="mt-1 text-muted-foreground">
                  Instant market valuation using real comparable sales data from NestIQ&apos;s
                  database — no paid API, no guesswork.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {["Real DB comparables", "7 value factors", "6-month forecast", "Confidence score"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form + results */}
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <PricePredictorForm />
        </div>
      </main>
    </>
  );
}
