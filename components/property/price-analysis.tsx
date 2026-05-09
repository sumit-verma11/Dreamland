"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { PriceHistoryPoint, PropertyStats } from "@/lib/property-detail";

// Deterministic synthetic price history when DB has no records.
function syntheticHistory(currentPrice: number, propertyId: string): PriceHistoryPoint[] {
  let h = 0;
  for (let i = 0; i < propertyId.length; i++) h = (h * 31 + propertyId.charCodeAt(i)) | 0;

  const points: PriceHistoryPoint[] = [];
  let price = currentPrice * 0.85;
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const drift = ((Math.abs((h * (i + 3)) | 0) % 120) / 1000) - 0.03;
    price = Math.round(price * (1 + drift));
    points.push({ id: `s${i}`, price, recordedAt: d.toISOString() });
  }
  points[points.length - 1].price = currentPrice;
  return points;
}

function priceLabel(p: number) {
  if (p >= 1_00_00_000) return `₹${(p / 1_00_00_000).toFixed(1)}Cr`;
  if (p >= 1_00_000) return `₹${(p / 1_00_000).toFixed(1)}L`;
  return `₹${p.toLocaleString("en-IN")}`;
}

type Props = {
  property: { id: string; price: number; priceType: string; area: number; city: string };
  stats: PropertyStats;
  priceHistory: PriceHistoryPoint[];
};

export function PriceAnalysis({ property, stats, priceHistory }: Props) {
  const points =
    priceHistory.length >= 3 ? priceHistory : syntheticHistory(property.price, property.id);

  const pricePerSqft = property.area > 0 ? Math.round(property.price / property.area) : 0;
  const deviationPct =
    stats.avgPricePerSqft > 0
      ? ((pricePerSqft - stats.avgPricePerSqft) / stats.avgPricePerSqft) * 100
      : 0;

  const verdict =
    deviationPct > 18
      ? "overpriced"
      : deviationPct < -12
        ? "underpriced"
        : ("fair" as "overpriced" | "underpriced" | "fair");

  const VERDICT_CFG = {
    overpriced: { label: "Overpriced", color: "bg-red-100 text-red-700", Icon: TrendingUp },
    underpriced: { label: "Good Deal", color: "bg-emerald-100 text-emerald-700", Icon: TrendingDown },
    fair: { label: "Fair Price", color: "bg-blue-100 text-blue-700", Icon: Minus },
  }[verdict];

  const chartData = points.map((p) => ({
    month: new Date(p.recordedAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    price: p.price,
  }));

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        Price Analysis
        <Badge variant="outline" className="text-xs font-normal">Smart</Badge>
      </h2>

      {/* Top row */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Listed Price</p>
          <p className="mt-1 text-base font-bold">
            {formatPrice(property.price, property.priceType as "SALE" | "RENT")}
          </p>
        </div>

        {stats.comparableCount > 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Est. Fair Value</p>
            <p className="mt-1 text-base font-bold">
              {formatPrice(stats.fairValue, property.priceType as "SALE" | "RENT")}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Price / sqft</p>
          <p className="mt-1 text-base font-bold">₹{pricePerSqft.toLocaleString("en-IN")}</p>
          {stats.avgPricePerSqft > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {property.city} avg ₹{stats.avgPricePerSqft.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${VERDICT_CFG.color}`}
          >
            <VERDICT_CFG.Icon className="size-3.5" />
            {VERDICT_CFG.label}
          </span>
        </div>
      </div>

      {/* Price history chart */}
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <p className="mb-3 text-sm font-medium">
          Price History
          {priceHistory.length < 3 && (
            <span className="ml-2 text-xs text-muted-foreground">(estimated trend)</span>
          )}
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={priceLabel}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip
              formatter={(v) => [priceLabel(Number(v)), "Price"]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
