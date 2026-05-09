import type { Metadata } from "next";
import { Calculator } from "lucide-react";

import { Navbar } from "@/components/nav/navbar";
import { EmiCalculator } from "@/components/tools/emi-calculator";

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator | NestIQ",
  description:
    "Calculate your home loan EMI, stamp duty, registration charges, and total cost of buying a property in India. Compare rates across top banks.",
};

export default function EmiCalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-16">
        <div className="border-b border-border bg-muted/30 py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Calculator className="size-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Home Loan EMI Calculator</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Plan your home purchase — EMI, stamp duty, registration &amp; total acquisition cost
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <EmiCalculator />
        </div>
      </main>
    </>
  );
}
