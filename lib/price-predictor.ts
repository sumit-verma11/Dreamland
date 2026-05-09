// Free, deterministic price predictor — no paid API.
// Uses real DB comparables + rule-based multipliers + statistical estimation.

export type PredictorInput = {
  city: string;
  locality: string;
  propertyType: "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL" | "PG";
  area: number;
  bedrooms: number;
  floorNo: number;
  totalFloors: number;
  age: number;
  furnishing: "FURNISHED" | "SEMI" | "UNFURNISHED";
  amenities: string[];
  distanceToMetro: number; // km
};

export type PriceFactor = {
  label: string;
  impact: number;  // % relative to base, e.g. +12 or -8
};

export type TrendPoint = {
  month: string;
  price: number;
  forecast: boolean;
};

export type PredictionResult = {
  estimatedPrice: number;
  minPrice: number;
  maxPrice: number;
  pricePerSqft: number;
  areaAvgPricePerSqft: number;
  comparableCount: number;
  confidence: number; // 0–100
  factors: PriceFactor[];
  trend: TrendPoint[];
  insights: string[];
};

// City-level base rates ₹/sqft (SALE, median 2024)
export const CITY_BASE_RATES: Record<string, number> = {
  Bengaluru: 12500,
  Mumbai: 27000,
  Pune: 10500,
  Hyderabad: 9800,
  Delhi: 19000,
  Gurugram: 15500,
  Chennai: 8500,
  Kolkata: 7200,
  Noida: 9000,
  Ahmedabad: 6800,
  Jaipur: 5500,
  Chandigarh: 7000,
};

// Annual price appreciation by city (%)
const CITY_GROWTH_RATE: Record<string, number> = {
  Bengaluru: 11, Mumbai: 7, Pune: 9, Hyderabad: 10, Delhi: 8,
  Gurugram: 9, Chennai: 7, Kolkata: 6, Noida: 9, Ahmedabad: 8,
  Jaipur: 7, Chandigarh: 6,
};

// ── Multiplier helpers ────────────────────────────────────────────────────────

function floorMultiplier(floor: number, total: number): number {
  if (!floor || !total || total === 0) return 1;
  const ratio = floor / total;
  if (ratio < 0.15) return 0.97;  // ground / very low
  if (ratio < 0.40) return 1.0;
  if (ratio < 0.70) return 1.03;
  return 1.06;                     // upper floors / penthouse
}

function ageMultiplier(age: number): number {
  if (age === 0) return 1.14;
  if (age <= 2) return 1.10;
  if (age <= 5) return 1.05;
  if (age <= 10) return 1.0;
  if (age <= 15) return 0.94;
  if (age <= 20) return 0.88;
  return 0.82;
}

const FURNISHING_MULT: Record<string, number> = {
  FURNISHED: 1.17, SEMI: 1.08, UNFURNISHED: 1.0,
};

const PROPERTY_TYPE_MULT: Record<string, number> = {
  APARTMENT: 1.0, VILLA: 1.28, PLOT: 0.72, COMMERCIAL: 1.15, PG: 0.88,
};

function metroMultiplier(distKm: number): number {
  if (distKm <= 0.5) return 1.16;
  if (distKm <= 1.0) return 1.11;
  if (distKm <= 2.0) return 1.06;
  if (distKm <= 3.0) return 1.02;
  return 1.0;
}

function amenityMultiplier(count: number): number {
  return 1 + Math.min(count * 0.016, 0.22);
}

function bedroomMultiplier(beds: number, type: string): number {
  if (type === "PLOT" || type === "COMMERCIAL") return 1;
  if (beds === 0) return 0.92;
  if (beds === 1) return 0.96;
  if (beds === 2) return 0.99;
  if (beds === 3) return 1.0;
  if (beds === 4) return 1.04;
  return 1.08;
}

// ── Confidence scoring ────────────────────────────────────────────────────────

export function computeConfidence(comparableCount: number): number {
  if (comparableCount >= 30) return 92;
  if (comparableCount >= 20) return 87;
  if (comparableCount >= 10) return 80;
  if (comparableCount >= 5)  return 70;
  if (comparableCount >= 2)  return 58;
  return 45;
}

// ── Median helper ─────────────────────────────────────────────────────────────

export function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ── Main estimation (pure, no DB) ─────────────────────────────────────────────

export function estimatePrice(
  input: PredictorInput,
  basePpsqft: number,
  comparableCount: number,
  areaAvgPpsqft: number,
): PredictionResult {
  const typeMult    = PROPERTY_TYPE_MULT[input.propertyType] ?? 1;
  const floorMult   = floorMultiplier(input.floorNo, input.totalFloors);
  const ageMult     = ageMultiplier(input.age);
  const furnMult    = FURNISHING_MULT[input.furnishing] ?? 1;
  const amenityMult = amenityMultiplier(input.amenities.length);
  const metroMult   = metroMultiplier(input.distanceToMetro);
  const bedMult     = bedroomMultiplier(input.bedrooms, input.propertyType);

  const allMults = [typeMult, floorMult, ageMult, furnMult, amenityMult, metroMult, bedMult];
  const totalMult = allMults.reduce((acc, m) => acc * m, 1);

  const estimatedPpsqft = Math.round(basePpsqft * totalMult);
  const estimatedPrice  = Math.round(estimatedPpsqft * input.area);

  // ±15% range, tighter when confidence is high
  const spread = computeConfidence(comparableCount) > 80 ? 0.12 : 0.16;
  const minPrice = Math.round(estimatedPrice * (1 - spread));
  const maxPrice = Math.round(estimatedPrice * (1 + spread));

  // Factors: each multiplier relative to base (impact = (mult-1)*100, capped)
  const rawFactors: PriceFactor[] = [
    { label: "Property Type",      impact: Math.round((typeMult - 1) * 100) },
    { label: "Floor Position",     impact: Math.round((floorMult - 1) * 100) },
    { label: "Building Age",       impact: Math.round((ageMult - 1) * 100) },
    { label: "Furnishing",         impact: Math.round((furnMult - 1) * 100) },
    { label: "Amenities",          impact: Math.round((amenityMult - 1) * 100) },
    { label: "Metro Proximity",    impact: Math.round((metroMult - 1) * 100) },
    { label: "BHK Configuration",  impact: Math.round((bedMult - 1) * 100) },
  ].filter((f) => f.impact !== 0)
   .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const confidence = computeConfidence(comparableCount);
  const trend = buildTrend(estimatedPpsqft, input.city, input.area);
  const insights = buildInsights(input, estimatedPpsqft, areaAvgPpsqft, trend, rawFactors);

  return {
    estimatedPrice,
    minPrice,
    maxPrice,
    pricePerSqft: estimatedPpsqft,
    areaAvgPricePerSqft: areaAvgPpsqft,
    comparableCount,
    confidence,
    factors: rawFactors,
    trend,
    insights,
  };
}

// ── Trend builder ─────────────────────────────────────────────────────────────

function buildTrend(currentPpsqft: number, city: string, area: number): TrendPoint[] {
  const annualGrowth = (CITY_GROWTH_RATE[city] ?? 8) / 100;
  const monthlyGrowth = Math.pow(1 + annualGrowth, 1 / 12) - 1;

  const points: TrendPoint[] = [];
  // 3 historical months (walk back from current)
  for (let i = 3; i >= 1; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const price = Math.round(currentPpsqft * Math.pow(1 - monthlyGrowth, i) * area);
    points.push({
      month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      price,
      forecast: false,
    });
  }
  // current
  points.push({
    month: new Date().toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    price: Math.round(currentPpsqft * area),
    forecast: false,
  });
  // 6 forecast months
  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    const price = Math.round(currentPpsqft * Math.pow(1 + monthlyGrowth, i) * area);
    points.push({
      month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      price,
      forecast: true,
    });
  }
  return points;
}

// ── Insight text builder ──────────────────────────────────────────────────────

function buildInsights(
  input: PredictorInput,
  ppsqft: number,
  avgPpsqft: number,
  trend: TrendPoint[],
  factors: PriceFactor[],
): string[] {
  const insights: string[] = [];

  // Comparison vs city avg
  const diffPct = avgPpsqft > 0 ? ((ppsqft - avgPpsqft) / avgPpsqft) * 100 : 0;
  if (diffPct > 12) {
    insights.push(
      `${input.locality || input.city} commands a ~${Math.round(diffPct)}% premium over the ${input.city} average — driven by location quality and amenity density.`,
    );
  } else if (diffPct < -10) {
    insights.push(
      `This property is priced ~${Math.round(Math.abs(diffPct))}% below the ${input.city} average, suggesting room for appreciation as the micro-market matures.`,
    );
  } else {
    insights.push(
      `Pricing is well-aligned with the ${input.city} market average, indicating healthy demand-supply balance in this micro-market.`,
    );
  }

  // Trend insight
  const first = trend[0];
  const last = trend[trend.length - 1];
  if (first && last) {
    const forecastPct = ((last.price - first.price) / first.price) * 100;
    insights.push(
      `Based on ${input.city}'s historical growth rate, the model projects ~${forecastPct.toFixed(1)}% price appreciation over the next 6 months.`,
    );
  }

  // Top positive factor
  const top = factors.find((f) => f.impact > 0);
  if (top) {
    insights.push(
      `"${top.label}" is the strongest value driver for this property, adding an estimated ${top.impact}% above the locality baseline.`,
    );
  }

  // Top negative factor
  const drag = [...factors].reverse().find((f) => f.impact < 0);
  if (drag) {
    insights.push(
      `"${drag.label}" is currently the primary value detractor (${drag.impact}%). Improvements here could unlock additional price potential.`,
    );
  }

  return insights;
}
