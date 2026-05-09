"use client";

import {
  Archive,
  ArrowUpDown,
  Baby,
  BatteryCharging,
  BellRing,
  Building2,
  Car,
  CloudRain,
  Droplets,
  Dumbbell,
  Flame,
  FlameKindling,
  Home,
  Leaf,
  Lock,
  ParkingCircle,
  PartyPopper,
  PawPrint,
  PersonStanding,
  Phone,
  Shield,
  Sun,
  Trophy,
  Video,
  Waves,
  Wifi,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AMENITIES, type PostPropertyDraft } from "@/lib/post-property";

// Map icon strings to components
const ICON_MAP: Record<string, React.ElementType> = {
  Waves, Dumbbell, Building2, PersonStanding, Baby, Trophy, Wind, PartyPopper,
  Car, ParkingCircle, ArrowUpDown, Flame, Phone, Home, Archive, Sun,
  Shield, Video, FlameKindling, Lock,
  Zap, Droplets, CloudRain, BatteryCharging, Wifi,
  Leaf, PawPrint, BellRing, Wrench,
};

type Props = {
  draft: PostPropertyDraft;
  onChange: (patch: Partial<PostPropertyDraft>) => void;
};

// Group amenities by category
const CATEGORIES = ["Recreation", "Convenience", "Safety", "Infrastructure", "Green", "Lifestyle"];

export function Step5Amenities({ draft, onChange }: Props) {
  function toggle(key: string) {
    const next = draft.amenities.includes(key)
      ? draft.amenities.filter((a) => a !== key)
      : [...draft.amenities, key];
    onChange({ amenities: next });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Select all amenities available in the property / society
        </p>
        {draft.amenities.length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ amenities: [] })}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {CATEGORIES.map((cat) => {
        const items = AMENITIES.filter((a) => a.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {cat}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {items.map(({ key, label, icon }) => {
                const Icon = ICON_MAP[icon] ?? Home;
                const selected = draft.amenities.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                      selected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-border bg-background hover:border-emerald-200 hover:bg-emerald-50/40",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {draft.amenities.length > 0 && (
        <div className="rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {draft.amenities.length} amenit{draft.amenities.length === 1 ? "y" : "ies"} selected
          </p>
          <div className="flex flex-wrap gap-1.5">
            {draft.amenities.map((a) => (
              <span key={a} className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-700">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
