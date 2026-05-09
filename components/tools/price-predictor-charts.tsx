"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PriceFactor, TrendPoint } from "@/lib/price-predictor";

// ── Confidence gauge ──────────────────────────────────────────────────────────

export function ConfidenceGauge({ value }: { value: number }) {
  const color =
    value >= 80 ? "#10b981" :
    value >= 60 ? "#f59e0b" :
    "#ef4444";

  const label =
    value >= 80 ? "High" :
    value >= 60 ? "Moderate" :
    "Low";

  // Semicircle gauge using two PieChart layers
  const bg = [{ value: 100 }];
  const fg = [{ value }, { value: 100 - value }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <PieChart width={180} height={100}>
          <Pie
            data={bg}
            cx={90} cy={90}
            startAngle={180} endAngle={0}
            innerRadius={54} outerRadius={78}
            dataKey="value"
            stroke="none"
            fill="hsl(var(--muted))"
          />
          <Pie
            data={fg}
            cx={90} cy={90}
            startAngle={180} endAngle={0}
            innerRadius={56} outerRadius={76}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="transparent" />
          </Pie>
        </PieChart>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
          <p className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">Confidence Score</p>
    </div>
  );
}

// ── Factor impact bars ────────────────────────────────────────────────────────

export function FactorChart({ factors }: { factors: PriceFactor[] }) {
  const data = factors.map((f) => ({ ...f, abs: Math.abs(f.impact) }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(factors.length * 40 + 20, 160)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 40, bottom: 4, left: 0 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          domain={[-25, 25]}
          tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={130}
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
        <Tooltip
          formatter={(v) => [`${Number(v) > 0 ? "+" : ""}${Number(v)}%`, "Impact"]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.impact >= 0 ? "#10b981" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Price trend line ──────────────────────────────────────────────────────────

function priceLabel(p: number) {
  if (p >= 1_00_00_000) return `₹${(p / 1_00_00_000).toFixed(1)}Cr`;
  if (p >= 1_00_000) return `₹${(p / 1_00_000).toFixed(0)}L`;
  return `₹${p.toLocaleString("en-IN")}`;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const historicalEnd = data.findIndex((d) => d.forecast) - 1;

  // Split into actual and forecast series — actual has value, forecast has null; forecast series reversed
  const chartData = data.map((d, i) => ({
    month: d.month,
    actual: !d.forecast ? d.price : undefined,
    forecast: d.forecast || i === (historicalEnd < 0 ? data.length - 1 : historicalEnd)
      ? d.price
      : undefined,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={priceLabel} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={60} />
        <Tooltip
          formatter={(v) => [priceLabel(Number(v)), ""]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls={false}
          name="Historical"
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls={false}
          name="Forecast"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
