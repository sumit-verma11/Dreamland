"use client";

import { Minus, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FACING_OPTIONS, type PostPropertyDraft } from "@/lib/post-property";

type Props = {
  draft: PostPropertyDraft;
  onChange: (patch: Partial<PostPropertyDraft>) => void;
};

function Counter({
  label,
  value,
  min = 0,
  max = 10,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted disabled:opacity-30"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="min-w-[2rem] text-center text-lg font-semibold tabular-nums">
          {value >= max ? `${max}+` : value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted disabled:opacity-30"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

const FURNISHING_OPTIONS = [
  { value: "UNFURNISHED" as const, label: "Unfurnished" },
  { value: "SEMI" as const, label: "Semi Furnished" },
  { value: "FURNISHED" as const, label: "Fully Furnished" },
];

const isPlotOrCommercial = (type: string) => type === "PLOT" || type === "COMMERCIAL";

export function Step3Details({ draft, onChange }: Props) {
  const hideBedsAndBaths = isPlotOrCommercial(draft.propertyType);

  return (
    <div className="space-y-6">
      {/* Beds / Baths */}
      {!hideBedsAndBaths && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Counter
            label="Bedrooms"
            value={draft.bedrooms}
            onChange={(v) => onChange({ bedrooms: v })}
          />
          <Counter
            label="Bathrooms"
            value={draft.bathrooms}
            min={1}
            onChange={(v) => onChange({ bathrooms: v })}
          />
          <Counter
            label="Parking Spots"
            value={draft.parking}
            max={5}
            onChange={(v) => onChange({ parking: v })}
          />
        </div>
      )}

      {/* Area */}
      <div>
        <Label className="mb-2 block">Built-up Area *</Label>
        <div className="flex gap-2">
          <Input
            value={draft.area}
            onChange={(e) => onChange({ area: e.target.value.replace(/[^\d.]/g, "") })}
            placeholder="e.g. 1200"
            inputMode="decimal"
            className="flex-1"
          />
          <Select
            value={draft.areaUnit}
            onValueChange={(v) => onChange({ areaUnit: v as PostPropertyDraft["areaUnit"] })}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SQFT">sq.ft</SelectItem>
              <SelectItem value="SQM">sq.m</SelectItem>
              <SelectItem value="SQYD">sq.yd</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Floor info */}
      {!isPlotOrCommercial(draft.propertyType) && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="floorNo" className="mb-1 block">Floor Number</Label>
            <Input
              id="floorNo"
              value={draft.floorNo}
              onChange={(e) => onChange({ floorNo: e.target.value.replace(/\D/g, "") })}
              placeholder="e.g. 3"
              inputMode="numeric"
            />
          </div>
          <div>
            <Label htmlFor="totalFloors" className="mb-1 block">Total Floors</Label>
            <Input
              id="totalFloors"
              value={draft.totalFloors}
              onChange={(e) => onChange({ totalFloors: e.target.value.replace(/\D/g, "") })}
              placeholder="e.g. 12"
              inputMode="numeric"
            />
          </div>
        </div>
      )}

      {/* Age & Facing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age" className="mb-1 block">Property Age (years)</Label>
          <Input
            id="age"
            value={draft.age}
            onChange={(e) => onChange({ age: e.target.value.replace(/\D/g, "") })}
            placeholder="0 = new"
            inputMode="numeric"
          />
        </div>
        <div>
          <Label className="mb-1 block">Facing Direction</Label>
          <Select
            value={draft.facing || "none"}
            onValueChange={(v) => onChange({ facing: v === "none" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select facing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {FACING_OPTIONS.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Furnishing */}
      {!isPlotOrCommercial(draft.propertyType) && (
        <div>
          <Label className="mb-2 block">Furnishing Status</Label>
          <div className="flex flex-wrap gap-2">
            {FURNISHING_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ furnishing: value })}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  draft.furnishing === value
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-border bg-background hover:border-emerald-300",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
