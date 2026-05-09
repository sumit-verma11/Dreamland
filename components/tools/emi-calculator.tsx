"use client";

import { Calculator, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── State-wise stamp duty data (stamp %, registration %) ─────────────────────
const STAMP: Record<string, { m: number; f: number; reg: number }> = {
  "Andhra Pradesh":   { m: 5,   f: 5,    reg: 1   },
  Bihar:              { m: 6,   f: 5.7,  reg: 2   },
  Delhi:              { m: 6,   f: 4,    reg: 1   },
  Goa:                { m: 3.5, f: 3.5,  reg: 0.5 },
  Gujarat:            { m: 4.9, f: 4.9,  reg: 1   },
  Haryana:            { m: 7,   f: 5,    reg: 2   },
  "Himachal Pradesh": { m: 5,   f: 5,    reg: 2   },
  Jharkhand:          { m: 4,   f: 3,    reg: 3   },
  Karnataka:          { m: 5,   f: 5,    reg: 1   },
  Kerala:             { m: 8,   f: 8,    reg: 2   },
  "Madhya Pradesh":   { m: 7.5, f: 7.5,  reg: 3   },
  Maharashtra:        { m: 6,   f: 5,    reg: 1   },
  Odisha:             { m: 5,   f: 4,    reg: 2   },
  Punjab:             { m: 7,   f: 5,    reg: 1   },
  Rajasthan:          { m: 6,   f: 5,    reg: 1   },
  "Tamil Nadu":       { m: 7,   f: 7,    reg: 1   },
  Telangana:          { m: 5,   f: 5,    reg: 0.5 },
  "Uttar Pradesh":    { m: 7,   f: 6,    reg: 1   },
  Uttarakhand:        { m: 5,   f: 3.75, reg: 2   },
  "West Bengal":      { m: 6,   f: 5,    reg: 1   },
};

const BANKS = [
  { name: "SBI",   rate: "8.50%", color: "#0066CC", bg: "#EBF5FF" },
  { name: "HDFC",  rate: "8.75%", color: "#B22222", bg: "#FFF0F0" },
  { name: "ICICI", rate: "8.75%", color: "#E87722", bg: "#FFF6EE" },
  { name: "Axis",  rate: "8.75%", color: "#68003E", bg: "#FFF0F5" },
  { name: "Kotak", rate: "8.75%", color: "#CC0000", bg: "#FFF5F5" },
  { name: "PNB",   rate: "8.50%", color: "#003C8A", bg: "#EBF4FF" },
];

const PIE_COLORS = ["#10b981", "#f59e0b"];
const STATES = Object.keys(STAMP).sort();

// ── Helpers ───────────────────────────────────────────────────────────────────

function emi(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (n === 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

type AmortRow = {
  year: number;
  opening: number;
  principal: number;
  interest: number;
  closing: number;
};

function amortSchedule(loan: number, annualRate: number, tenure: number): AmortRow[] {
  const r = annualRate / 100 / 12;
  const monthlyEmi = emi(loan, annualRate, tenure);
  let bal = loan;
  const rows: AmortRow[] = [];
  for (let y = 1; y <= tenure; y++) {
    if (bal <= 0) break;
    const opening = bal;
    let yPrin = 0;
    let yInt = 0;
    for (let m = 0; m < 12; m++) {
      if (bal <= 0) break;
      const interest = bal * r;
      const principal = Math.min(monthlyEmi - interest, bal);
      yInt += interest;
      yPrin += principal;
      bal -= principal;
    }
    rows.push({ year: y, opening, principal: yPrin, interest: yInt, closing: Math.max(0, bal) });
  }
  return rows;
}

function fmt(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)} L`;
  if (n >= 1_000) return `₹${Math.round(n).toLocaleString("en-IN")}`;
  return `₹${Math.round(n)}`;
}

function resolveState(s?: string): string {
  if (!s) return "Maharashtra";
  const exact = STATES.find((k) => k === s);
  if (exact) return exact;
  const ci = STATES.find((k) => k.toLowerCase() === s.toLowerCase());
  return ci ?? "Maharashtra";
}

// ── Component ─────────────────────────────────────────────────────────────────

export type EmiCalculatorProps = {
  initialPrice?: number;
  initialState?: string;
  propertyType?: string;
};

export function EmiCalculator({
  initialPrice = 5_000_000,
  initialState,
  propertyType = "APARTMENT",
}: EmiCalculatorProps) {
  // Inputs
  const [propValue, setPropValue] = useState(initialPrice);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  // Stamp duty controls
  const [state, setState] = useState(resolveState(initialState));
  const [gender, setGender] = useState<"m" | "f">("m");
  const [underConst, setUnderConst] = useState(false);

  // UI
  const [amortOpen, setAmortOpen] = useState(false);

  // Derived
  const loan = Math.round(propValue * (1 - downPct / 100));
  const downAmt = propValue - loan;
  const monthlyEmi = useMemo(() => emi(loan, rate, tenure), [loan, rate, tenure]);
  const totalPay = monthlyEmi * tenure * 12;
  const totalInt = totalPay - loan;
  const principalPct = totalPay > 0 ? (loan / totalPay) * 100 : 0;
  const amort = useMemo(() => amortSchedule(loan, rate, tenure), [loan, rate, tenure]);

  // Costs
  const sd = STAMP[state] ?? STAMP["Maharashtra"];
  const stampPct = sd[gender];
  const regPct = sd.reg;
  const stampAmt = Math.round((propValue * stampPct) / 100);
  const regAmt = Math.round((propValue * regPct) / 100);
  const gstPct =
    propertyType === "PLOT" || propertyType === "PG"
      ? 0
      : propertyType === "COMMERCIAL"
        ? 12
        : underConst
          ? propValue <= 4_500_000 ? 1 : 5
          : 0;
  const gstAmt = Math.round((propValue * gstPct) / 100);
  const brokerageAmt = Math.round(propValue * 0.01);
  const movingEst = 50_000;
  const totalCost = propValue + stampAmt + regAmt + gstAmt + brokerageAmt + movingEst;

  const pieData = [
    { name: "Principal", value: Math.round(loan) },
    { name: "Interest", value: Math.round(Math.max(0, totalInt)) },
  ];

  return (
    <div className="space-y-10">

      {/* ── 1. Inputs + Summary ──────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">

        {/* Left — sliders */}
        <div className="space-y-6">
          {/* Property value */}
          <SliderRow
            label="Property Value"
            value={propValue}
            display={fmt(propValue)}
            min={500_000} max={100_000_000} step={100_000}
            marks={["₹5L", "₹10Cr"]}
            onChange={setPropValue}
          />

          {/* Down payment */}
          <SliderRow
            label="Down Payment"
            value={downPct}
            display={`${downPct}% — ${fmt(downAmt)}`}
            min={10} max={50} step={1}
            marks={["10%", "50%"]}
            onChange={setDownPct}
          />

          {/* Loan amount chip */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/20">
            <span className="text-sm text-muted-foreground">Loan Amount</span>
            <span className="text-xl font-bold text-emerald-600">{fmt(loan)}</span>
          </div>

          {/* Interest rate */}
          <SliderRow
            label="Interest Rate (p.a.)"
            value={rate}
            display={`${rate.toFixed(1)}%`}
            min={6} max={15} step={0.1}
            marks={["6%", "15%"]}
            onChange={setRate}
          />

          {/* Tenure */}
          <SliderRow
            label="Loan Tenure"
            value={tenure}
            display={`${tenure} years`}
            min={1} max={30} step={1}
            marks={["1 yr", "30 yrs"]}
            onChange={setTenure}
          />
        </div>

        {/* Right — EMI summary + donut */}
        <div className="space-y-4">
          {/* Monthly EMI hero */}
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 text-center dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/20">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Monthly EMI
            </p>
            <p className="text-5xl font-bold tracking-tight text-emerald-600">
              {fmt(monthlyEmi)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              for {tenure} years @ {rate.toFixed(1)}% p.a.
            </p>
          </div>

          {/* Donut chart */}
          <div className="relative mx-auto flex h-[200px] w-[200px] items-center justify-center">
            <PieChart width={200} height={200}>
              <Pie
                data={pieData}
                cx={100} cy={100}
                innerRadius={62} outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                startAngle={90} endAngle={-270}
                strokeWidth={0}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [fmt(Number(v)), ""]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
              />
            </PieChart>
            {/* Center overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[11px] text-muted-foreground">Principal</p>
              <p className="text-lg font-bold">{principalPct.toFixed(0)}%</p>
            </div>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Principal", value: loan, dot: PIE_COLORS[0] },
              { label: "Interest", value: Math.max(0, totalInt), dot: PIE_COLORS[1] },
            ].map(({ label, value, dot }) => (
              <div key={label} className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: dot }} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className="text-sm font-semibold">{fmt(value)}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-xl border border-border bg-muted/30 p-3">
              <p className="mb-1 text-xs text-muted-foreground">Total Payment</p>
              <p className="text-sm font-semibold">{fmt(totalPay)}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── 2. Stamp Duty & Registration ──────────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold">Stamp Duty &amp; Registration</h3>
          <p className="text-sm text-muted-foreground">State-wise government charges on property purchase</p>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[180px] flex-1">
            <Label className="mb-1.5 block text-sm">State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm">Buyer Gender</Label>
            <div className="flex gap-2">
              {(["m", "f"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={cn(
                    "h-9 rounded-md border px-4 text-sm transition-colors",
                    gender === g
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                      : "border-input bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {g === "m" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>

          {propertyType !== "PLOT" && propertyType !== "PG" && (
            <div>
              <Label className="mb-1.5 block text-sm">Property Status</Label>
              <div className="flex gap-2">
                {[{ v: false, l: "Ready to Move" }, { v: true, l: "Under Construction" }].map(({ v, l }) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setUnderConst(v)}
                    className={cn(
                      "h-9 rounded-md border px-3 text-sm transition-colors",
                      underConst === v
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                        : "border-input bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Charge cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: `Stamp Duty (${stampPct}%)`,    amt: stampAmt,    color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: `Registration (${regPct}%)`,    amt: regAmt,      color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
            { label: `GST (${gstPct}%)`,             amt: gstAmt,      color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
            { label: "Brokerage (~1%)",              amt: brokerageAmt, color: "text-rose-600",  bg: "bg-rose-50 dark:bg-rose-950/30" },
          ].map(({ label, amt, color, bg }) => (
            <div key={label} className={cn("rounded-xl border border-border p-3", bg)}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={cn("mt-1 text-lg font-bold", color)}>{fmt(amt)}</p>
            </div>
          ))}
        </div>

        {/* Total acquisition cost breakdown */}
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Total Acquisition Cost</p>
              <p className="text-xs text-muted-foreground">Property + all charges</p>
            </div>
            <p className="shrink-0 text-2xl font-bold text-emerald-600">{fmt(totalCost)}</p>
          </div>

          <Separator className="my-3" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
            {[
              { l: "Property Price",           v: propValue },
              { l: "Stamp Duty",               v: stampAmt },
              { l: "Registration",             v: regAmt },
              { l: `GST (${gstPct}%)`,         v: gstAmt },
              { l: "Brokerage (~1%)",          v: brokerageAmt },
              { l: "Moving / Shifting est.",   v: movingEst },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{l}</span>
                <span className="font-medium">{fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 3. Amortization Table ─────────────────────────────────────────── */}
      <section>
        <button
          type="button"
          onClick={() => setAmortOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <div>
            <h3 className="text-left text-lg font-semibold">Amortization Schedule</h3>
            <p className="text-left text-sm text-muted-foreground">Year-wise principal &amp; interest breakdown</p>
          </div>
          {amortOpen
            ? <ChevronUp className="size-5 shrink-0 text-muted-foreground" />
            : <ChevronDown className="size-5 shrink-0 text-muted-foreground" />}
        </button>

        {amortOpen && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Year", "Opening Balance", "Principal Paid", "Interest Paid", "Closing Balance"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {amort.map((row, i) => (
                  <tr
                    key={row.year}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors hover:bg-muted/30",
                      i % 2 === 1 && "bg-muted/10",
                    )}
                  >
                    <td className="px-4 py-2.5 font-medium">Year {row.year}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmt(row.opening)}</td>
                    <td className="px-4 py-2.5 font-medium text-emerald-600">{fmt(row.principal)}</td>
                    <td className="px-4 py-2.5 font-medium text-amber-600">{fmt(row.interest)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmt(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Separator />

      {/* ── 4. Apply for Home Loan ────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Apply for Home Loan</h3>
            <p className="text-sm text-muted-foreground">Compare rates from India's top lenders</p>
          </div>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Calculator className="size-4" />
            Check Eligibility
            <ExternalLink className="size-3.5 opacity-70" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {BANKS.map((bank) => (
            <div
              key={bank.name}
              style={{ background: bank.bg }}
              className="cursor-pointer rounded-xl border border-border p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-base font-bold" style={{ color: bank.color }}>{bank.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">from {bank.rate}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          * Indicative rates only. Final rates depend on credit score, income & bank policy.
        </p>
      </section>
    </div>
  );
}

// ── Reusable slider row ───────────────────────────────────────────────────────

function SliderRow({
  label,
  value,
  display,
  min,
  max,
  step,
  marks,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  marks: [string, string];
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <span className="text-sm font-semibold">{display}</span>
      </div>
      <Slider
        min={min} max={max} step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{marks[0]}</span>
        <span>{marks[1]}</span>
      </div>
    </div>
  );
}
