"use client";

import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Loader2,
  MapPin,
  PlusCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AMENITIES, CITY_DATA } from "@/lib/post-property";
import type { PredictionResult } from "@/lib/price-predictor";
import {
  ConfidenceGauge,
  FactorChart,
  TrendChart,
} from "@/components/tools/price-predictor-charts";

// ── Form state ────────────────────────────────────────────────────────────────

type FormState = {
  city: string;
  locality: string;
  propertyType: "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL" | "PG";
  area: string;
  bedrooms: number;
  floorNo: string;
  totalFloors: string;
  age: string;
  furnishing: "FURNISHED" | "SEMI" | "UNFURNISHED";
  amenities: string[];
  distanceToMetro: string;
};

const INITIAL: FormState = {
  city: "",
  locality: "",
  propertyType: "APARTMENT",
  area: "",
  bedrooms: 2,
  floorNo: "",
  totalFloors: "",
  age: "",
  furnishing: "UNFURNISHED",
  amenities: [],
  distanceToMetro: "3",
};

const METRO_OPTIONS = [
  { label: "< 500 m — walking distance", value: "0.3" },
  { label: "500 m – 1 km", value: "0.75" },
  { label: "1 – 2 km", value: "1.5" },
  { label: "2 – 5 km", value: "3" },
  { label: "> 5 km", value: "7" },
];

const PROP_TYPES = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "VILLA", label: "Villa / House" },
  { value: "PLOT", label: "Plot / Land" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "PG", label: "PG / Hostel" },
];

// ── Amenity selection (top 12 for the form) ───────────────────────────────────

const FORM_AMENITIES = AMENITIES.slice(0, 16).map((a) => a.key);

// ── Formatter ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── Main component ────────────────────────────────────────────────────────────

export function PricePredictorForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [showAmenities, setShowAmenities] = useState(false);

  function patch(p: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...p }));
  }

  async function predict(e: React.FormEvent) {
    e.preventDefault();
    if (!form.city) { toast.error("Please select a city"); return; }
    const area = parseFloat(form.area);
    if (!area || area <= 0) { toast.error("Please enter a valid area"); return; }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/price-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.city,
          locality: form.locality,
          propertyType: form.propertyType,
          area,
          bedrooms: form.bedrooms,
          floorNo: parseInt(form.floorNo || "0") || 0,
          totalFloors: parseInt(form.totalFloors || "0") || 0,
          age: parseInt(form.age || "0") || 0,
          furnishing: form.furnishing,
          amenities: form.amenities,
          distanceToMetro: parseFloat(form.distanceToMetro),
        }),
      });
      if (!res.ok) throw new Error("Prediction failed");
      const data = (await res.json()) as PredictionResult;
      setResult(data);
      setTimeout(() => document.getElementById("prediction-result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      toast.error("Could not generate prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* ── Form ── */}
      <form onSubmit={predict} className="space-y-6">
        {/* Location */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="size-3.5" /> Location
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1 block">City *</Label>
              <Select value={form.city} onValueChange={(v) => patch({ city: v, locality: "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {CITY_DATA.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Locality <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                value={form.locality}
                onChange={(e) => patch({ locality: e.target.value })}
                placeholder="e.g. Koramangala"
                list="locality-list"
              />
              {form.city && (
                <datalist id="locality-list">
                  {CITY_DATA.find((c) => c.name === form.city)?.localities.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              )}
            </div>
          </div>
        </div>

        {/* Property details */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <IndianRupee className="size-3.5" /> Property Details
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-1 block">Type</Label>
              <Select
                value={form.propertyType}
                onValueChange={(v) => patch({ propertyType: v as FormState["propertyType"] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROP_TYPES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Area (sqft) *</Label>
              <Input
                value={form.area}
                onChange={(e) => patch({ area: e.target.value.replace(/[^\d.]/g, "") })}
                placeholder="e.g. 1200"
                inputMode="decimal"
              />
            </div>
            {form.propertyType !== "PLOT" && form.propertyType !== "COMMERCIAL" && (
              <div>
                <Label className="mb-1 block">Bedrooms</Label>
                <Select
                  value={String(form.bedrooms)}
                  onValueChange={(v) => patch({ bedrooms: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0,1,2,3,4,5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n === 0 ? "Studio" : `${n} BHK`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="mb-1 block">Floor No.</Label>
              <Input
                value={form.floorNo}
                onChange={(e) => patch({ floorNo: e.target.value.replace(/\D/g, "") })}
                placeholder="e.g. 4"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label className="mb-1 block">Total Floors</Label>
              <Input
                value={form.totalFloors}
                onChange={(e) => patch({ totalFloors: e.target.value.replace(/\D/g, "") })}
                placeholder="e.g. 12"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label className="mb-1 block">Age (years)</Label>
              <Input
                value={form.age}
                onChange={(e) => patch({ age: e.target.value.replace(/\D/g, "") })}
                placeholder="0 = new"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        {/* Furnishing + Metro */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block">Furnishing</Label>
            <div className="flex gap-2">
              {(["UNFURNISHED", "SEMI", "FURNISHED"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => patch({ furnishing: f })}
                  className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${form.furnishing === f ? "border-emerald-600 bg-emerald-600 text-white" : "border-border bg-background hover:border-emerald-300"}`}
                >
                  {f === "UNFURNISHED" ? "Unfurnished" : f === "SEMI" ? "Semi" : "Furnished"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1 block">Distance to Metro</Label>
            <Select value={form.distanceToMetro} onValueChange={(v) => patch({ distanceToMetro: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {METRO_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amenities (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAmenities((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-medium"
          >
            <span>
              Amenities{" "}
              {form.amenities.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">{form.amenities.length} selected</Badge>
              )}
            </span>
            {showAmenities ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          {showAmenities && (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FORM_AMENITIES.map((key) => {
                const sel = form.amenities.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => patch({ amenities: sel ? form.amenities.filter((a) => a !== key) : [...form.amenities, key] })}
                    className={`rounded-lg border px-3 py-2 text-xs transition-colors ${sel ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border hover:border-emerald-200"}`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 py-6 text-base font-semibold hover:bg-emerald-700"
        >
          {loading ? (
            <><Loader2 className="mr-2 size-5 animate-spin" />Analysing market data…</>
          ) : (
            <><Sparkles className="mr-2 size-5" />Predict Price</>
          )}
        </Button>
      </form>

      {/* ── Result ── */}
      {result && (
        <div id="prediction-result" className="space-y-6">
          <Separator />

          {/* Price range hero */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-lg">
            <p className="text-sm font-medium opacity-80">Estimated Market Value</p>
            <p className="mt-1 text-4xl font-bold tracking-tight">{fmt(result.estimatedPrice)}</p>
            <p className="mt-1 text-sm opacity-75">
              Range: {fmt(result.minPrice)} — {fmt(result.maxPrice)}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
              <div>
                <p className="text-xs opacity-70">Price / sqft</p>
                <p className="mt-0.5 text-lg font-semibold">₹{result.pricePerSqft.toLocaleString("en-IN")}</p>
              </div>
              {result.areaAvgPricePerSqft > 0 && (
                <div>
                  <p className="text-xs opacity-70">{form.city} avg / sqft</p>
                  <p className="mt-0.5 text-lg font-semibold">₹{result.areaAvgPricePerSqft.toLocaleString("en-IN")}</p>
                </div>
              )}
              <div>
                <p className="text-xs opacity-70">Based on</p>
                <p className="mt-0.5 text-lg font-semibold">
                  {result.comparableCount > 0 ? `${result.comparableCount} sales` : "City avg"}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence + Factors */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-4">
              <ConfidenceGauge value={result.confidence} />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {result.comparableCount > 0
                  ? `Based on ${result.comparableCount} comparable sale${result.comparableCount !== 1 ? "s" : ""} in ${form.city}`
                  : `Using ${form.city} market baseline rates`}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="mb-3 text-sm font-semibold">Value Drivers</p>
              {result.factors.length > 0 ? (
                <FactorChart factors={result.factors} />
              ) : (
                <p className="text-sm text-muted-foreground">No significant factors detected.</p>
              )}
            </div>
          </div>

          {/* vs City average */}
          {result.areaAvgPricePerSqft > 0 && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="mb-3 text-sm font-semibold">Comparison with {form.city} Average</p>
              <div className="space-y-2">
                {[
                  { label: "This property", ppsqft: result.pricePerSqft, highlight: true },
                  { label: `${form.city} average`, ppsqft: result.areaAvgPricePerSqft, highlight: false },
                ].map(({ label, ppsqft, highlight }) => {
                  const maxVal = Math.max(result.pricePerSqft, result.areaAvgPricePerSqft) * 1.1;
                  const pct = Math.round((ppsqft / maxVal) * 100);
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
                      <div className="flex-1 overflow-hidden rounded-full bg-muted h-2.5">
                        <div
                          className={`h-full rounded-full transition-all ${highlight ? "bg-emerald-500" : "bg-slate-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-24 text-right text-xs font-semibold">
                        ₹{ppsqft.toLocaleString("en-IN")}/sqft
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6-month trend */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-600" />
              <p className="text-sm font-semibold">6-Month Price Forecast</p>
              <span className="ml-auto rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                Projected
              </span>
            </div>
            <TrendChart data={result.trend} />
            <p className="mt-2 text-[11px] text-muted-foreground">
              ─── Historical &nbsp;&nbsp; ╌╌╌ Forecast (based on {form.city} growth rate)
            </p>
          </div>

          {/* AI Insights */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-amber-500" />
              Market Insights
            </p>
            <ul className="space-y-2">
              {result.insights.map((ins, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {ins}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              <a href="/post-property">
                <PlusCircle className="mr-2 size-4" />
                List at This Price
              </a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href="/search">
                <ArrowRight className="mr-2 size-4" />
                Browse Similar Properties
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
