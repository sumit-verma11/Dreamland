"use client";

import {
  Building,
  Building2,
  Home,
  LayoutGrid,
  TreePine,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { PostPropertyDraft } from "@/lib/post-property";

type Props = {
  draft: PostPropertyDraft;
  onChange: (patch: Partial<PostPropertyDraft>) => void;
};

const LISTING_TYPES = [
  {
    value: "SALE" as const,
    label: "For Sale",
    desc: "Sell your property",
    icon: Home,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    activeBg: "bg-emerald-600 border-emerald-600 text-white",
  },
  {
    value: "RENT" as const,
    label: "For Rent",
    desc: "List for tenants",
    icon: Building,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    activeBg: "bg-blue-600 border-blue-600 text-white",
  },
  {
    value: "PG" as const,
    label: "PG / Hostel",
    desc: "Paying guest listing",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    activeBg: "bg-violet-600 border-violet-600 text-white",
  },
];

const PROPERTY_TYPES = [
  { value: "APARTMENT" as const, label: "Apartment / Flat", icon: Building },
  { value: "VILLA" as const, label: "Villa / House", icon: Home },
  { value: "PLOT" as const, label: "Plot / Land", icon: TreePine },
  { value: "COMMERCIAL" as const, label: "Commercial", icon: LayoutGrid },
  { value: "PG" as const, label: "PG / Hostel", icon: Users },
];

const isPG = (pt: "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL" | "PG") => pt === "PG";

export function Step1Type({ draft, onChange }: Props) {
  const listingPurpose =
    draft.propertyType === "PG" ? "PG" : draft.priceType;

  function selectListing(v: "SALE" | "RENT" | "PG") {
    if (v === "PG") {
      onChange({ priceType: "RENT", propertyType: "PG" });
    } else {
      onChange({
        priceType: v,
        propertyType: isPG(draft.propertyType) ? "APARTMENT" : draft.propertyType,
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Listing purpose */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Listing Purpose
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {LISTING_TYPES.map(({ value, label, desc, icon: Icon, bg, activeBg }) => {
            const active = listingPurpose === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => selectListing(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 text-center transition-all",
                  active ? activeBg : `${bg} hover:opacity-80`,
                )}
              >
                <Icon className="size-7" />
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className={cn("text-xs", active ? "text-white/80" : "text-muted-foreground")}>{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property type — hidden when PG is selected */}
      {listingPurpose !== "PG" && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Property Type
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {PROPERTY_TYPES.filter((p) => p.value !== "PG").map(({ value, label, icon: Icon }) => {
              const active = draft.propertyType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ propertyType: value })}
                  className={cn(
                    "flex flex-col items-center gap-2.5 rounded-xl border-2 px-3 py-4 text-center transition-all",
                    active
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-border bg-muted/30 hover:border-emerald-300 hover:bg-emerald-50/50",
                  )}
                >
                  <Icon className="size-6" />
                  <p className="text-xs font-medium leading-tight">{label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PG confirmation badge */}
      {listingPurpose === "PG" && (
        <div className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 text-sm text-violet-700">
          <Users className="size-4 shrink-0" />
          <span>You are listing a <strong>PG / Hostel</strong>. Pricing will be set as monthly rent per bed/room.</span>
        </div>
      )}
    </div>
  );
}
