"use client";

import { ShieldCheck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatPrice } from "@/lib/format";
import {
  AGE_BOUNDS,
  AMENITIES,
  AREA_BOUNDS,
  FACINGS,
  FURNISHINGS,
  POSTED_BY_LABELS,
  PRICE_BOUNDS,
  PROPERTY_TYPES,
  type SearchFilters,
} from "@/lib/property-search";
import { cn } from "@/lib/utils";

type Patch = Partial<SearchFilters>;

type Props = {
  filters: SearchFilters;
  onChange: (patch: Patch) => void;
  onReset: () => void;
};

const BED_BATH_OPTIONS = ["1", "2", "3", "4", "5"] as const;

function toggleArr<T>(arr: T[] | undefined, v: T): T[] {
  const cur = arr ?? [];
  return cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
}

export function FiltersSidebar({ filters, onChange, onReset }: Props) {
  const priceMin = filters.priceMin ?? PRICE_BOUNDS.min;
  const priceMax = filters.priceMax ?? PRICE_BOUNDS.max;
  const areaMin = filters.areaMin ?? AREA_BOUNDS.min;
  const areaMax = filters.areaMax ?? AREA_BOUNDS.max;
  const ageMax = filters.ageMax ?? AGE_BOUNDS.max;

  return (
    <aside className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-sm font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-7 text-xs">
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 py-3 border-b border-border">
        {(["SALE", "RENT"] as const).map((pt) => {
          const active = (filters.priceType ?? "SALE") === pt;
          return (
            <button
              key={pt}
              type="button"
              onClick={() => onChange({ priceType: pt })}
              className={cn(
                "rounded-md py-1.5 text-xs font-semibold transition",
                active
                  ? "bg-emerald-500 text-white"
                  : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {pt === "SALE" ? "For Sale" : "For Rent"}
            </button>
          );
        })}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["type", "price", "beds"]}
        className="flex-1"
      >
        <AccordionItem value="type">
          <AccordionTrigger>Property type</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-1">
              {PROPERTY_TYPES.map((t) => {
                const active = filters.type?.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ type: toggleArr(filters.type, t) })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                    )}
                  >
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              <Slider
                value={[priceMin, priceMax]}
                onValueChange={([min, max]) =>
                  onChange({
                    priceMin: min === PRICE_BOUNDS.min ? undefined : min,
                    priceMax: max === PRICE_BOUNDS.max ? undefined : max,
                  })
                }
                min={PRICE_BOUNDS.min}
                max={PRICE_BOUNDS.max}
                step={500_000}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatPrice(priceMin, "SALE")}</span>
                <span>{formatPrice(priceMax, "SALE")}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="area">
          <AccordionTrigger>Area</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              <Slider
                value={[areaMin, areaMax]}
                onValueChange={([min, max]) =>
                  onChange({
                    areaMin: min === AREA_BOUNDS.min ? undefined : min,
                    areaMax: max === AREA_BOUNDS.max ? undefined : max,
                  })
                }
                min={AREA_BOUNDS.min}
                max={AREA_BOUNDS.max}
                step={50}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{areaMin.toLocaleString("en-IN")} sqft</span>
                <span>{areaMax.toLocaleString("en-IN")} sqft</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="beds">
          <AccordionTrigger>Bedrooms</AccordionTrigger>
          <AccordionContent>
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              value={(filters.bedrooms ?? []).map(String)}
              onValueChange={(vals: string[]) =>
                onChange({
                  bedrooms: vals.length ? vals.map(Number) : undefined,
                })
              }
              className="flex-wrap"
            >
              {BED_BATH_OPTIONS.map((b) => (
                <ToggleGroupItem key={b} value={b} className="px-3">
                  {b === "5" ? "5+" : b}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="baths">
          <AccordionTrigger>Bathrooms</AccordionTrigger>
          <AccordionContent>
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              value={(filters.bathrooms ?? []).map(String)}
              onValueChange={(vals: string[]) =>
                onChange({
                  bathrooms: vals.length ? vals.map(Number) : undefined,
                })
              }
              className="flex-wrap"
            >
              {BED_BATH_OPTIONS.map((b) => (
                <ToggleGroupItem key={b} value={b} className="px-3">
                  {b === "5" ? "5+" : b}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="furnishing">
          <AccordionTrigger>Furnishing</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-1">
              {FURNISHINGS.map((f) => {
                const active = filters.furnishing?.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() =>
                      onChange({ furnishing: toggleArr(filters.furnishing, f) })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                    )}
                  >
                    {f === "SEMI" ? "Semi-furnished" : f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="postedBy">
          <AccordionTrigger>Posted by</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {(Object.keys(POSTED_BY_LABELS) as Array<keyof typeof POSTED_BY_LABELS>).map(
                (key) => {
                  const checked = filters.postedBy?.includes(key) ?? false;
                  return (
                    <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                          onChange({ postedBy: toggleArr(filters.postedBy, key) })
                        }
                      />
                      {POSTED_BY_LABELS[key].label}
                    </label>
                  );
                },
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amenities">
          <AccordionTrigger>Amenities</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2 pt-1">
              {AMENITIES.map((a) => {
                const checked = filters.amenities?.includes(a) ?? false;
                return (
                  <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() =>
                        onChange({ amenities: toggleArr(filters.amenities, a) })
                      }
                    />
                    {a}
                  </label>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="age">
          <AccordionTrigger>Age of property</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              <Slider
                value={[ageMax]}
                onValueChange={([max]) =>
                  onChange({ ageMax: max === AGE_BOUNDS.max ? undefined : max })
                }
                min={AGE_BOUNDS.min}
                max={AGE_BOUNDS.max}
                step={1}
              />
              <div className="text-xs text-muted-foreground">
                Up to {ageMax} {ageMax === 1 ? "year" : "years"} old
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="facing">
          <AccordionTrigger>Facing</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {FACINGS.map((f) => {
                const active = filters.facing?.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => onChange({ facing: toggleArr(filters.facing, f) })}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-medium transition",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="verified" className="border-b-0">
          <AccordionTrigger>Verified only</AccordionTrigger>
          <AccordionContent>
            <label className="flex cursor-pointer items-center justify-between gap-3 pt-1">
              <span className="inline-flex items-center gap-2 text-sm">
                <ShieldCheck className="size-4 text-blue-500" />
                Show only verified listings
              </span>
              <Switch
                checked={filters.verified ?? false}
                onCheckedChange={(c) => onChange({ verified: c ? true : undefined })}
              />
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
