"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function calcEmi(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function fmt(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

type Props = { price: number };

export function EmiCalculator({ price }: Props) {
  const defaultLoan = Math.round(price * 0.8);
  const [loan, setLoan] = useState(defaultLoan);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const emi = calcEmi(loan, rate, tenure);
  const total = emi * tenure * 12;
  const interest = total - loan;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-sm font-semibold">EMI Calculator</p>

      <div>
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <Label>Loan Amount</Label>
          <span className="font-medium text-foreground">{fmt(loan)}</span>
        </div>
        <Slider
          min={500_000}
          max={price}
          step={100_000}
          value={[loan]}
          onValueChange={([v]) => setLoan(v)}
        />
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <Label>Interest Rate</Label>
          <span className="font-medium text-foreground">{rate.toFixed(1)}%</span>
        </div>
        <Slider
          min={6}
          max={15}
          step={0.1}
          value={[rate]}
          onValueChange={([v]) => setRate(v)}
        />
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <Label>Tenure</Label>
          <span className="font-medium text-foreground">{tenure} yrs</span>
        </div>
        <Slider
          min={5}
          max={30}
          step={5}
          value={[tenure]}
          onValueChange={([v]) => setTenure(v)}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-lg bg-background p-3 text-center text-xs">
        <div>
          <p className="text-muted-foreground">Monthly EMI</p>
          <p className="mt-0.5 text-sm font-bold text-emerald-600">{fmt(emi)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Interest</p>
          <p className="mt-0.5 font-semibold">{fmt(interest)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Amount</p>
          <p className="mt-0.5 font-semibold">{fmt(total)}</p>
        </div>
      </div>
    </div>
  );
}
