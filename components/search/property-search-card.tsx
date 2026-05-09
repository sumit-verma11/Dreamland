"use client";

import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SearchProperty } from "@/lib/property-search";

type Props = {
  property: SearchProperty;
  variant?: "grid" | "list";
  saved?: boolean;
  compared?: boolean;
  onToggleSave?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
};

export function PropertySearchCard({
  property,
  variant = "grid",
  saved = false,
  compared = false,
  onToggleSave,
  onToggleCompare,
}: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = property.images.length > 0
    ? property.images
    : [`https://picsum.photos/seed/${property.id}/640/480`];

  const isList = variant === "list";

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl",
        isList ? "flex" : "flex flex-col",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          isList ? "aspect-[4/3] w-72 shrink-0" : "aspect-[4/3]",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[imgIdx]}
          alt={property.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.preventDefault();
                setImgIdx((i) => (i - 1 + images.length) % images.length);
              }}
              className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.preventDefault();
                setImgIdx((i) => (i + 1) % images.length);
              }}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-white"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-slate-950/70 px-1.5 py-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block size-1.5 rounded-full transition",
                    i === imgIdx ? "bg-white" : "bg-white/40",
                  )}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {property.featured && (
            <Badge className="border-0 bg-rose-500/95 text-[10px] font-semibold tracking-wide text-white">
              FEATURED
            </Badge>
          )}
          {property.verified && (
            <Badge className="border-0 bg-blue-500/95 text-[10px] font-semibold tracking-wide text-white">
              <ShieldCheck className="mr-1 size-3" />
              VERIFIED
            </Badge>
          )}
        </div>

        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save property"}
          onClick={(e) => {
            e.preventDefault();
            onToggleSave?.(property.id);
          }}
          className={cn(
            "absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-slate-700 backdrop-blur transition hover:bg-white",
            saved && "text-rose-500",
          )}
        >
          <Heart className={cn("size-4", saved && "fill-current")} />
        </button>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-950/85 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          {property.matchScore}% match
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xl font-semibold tracking-tight">
            {formatPrice(property.price, property.priceType)}
          </p>
          <Badge variant="secondary" className="shrink-0 text-[10px] font-medium uppercase tracking-wide">
            {property.priceType === "RENT" ? "Rent" : "Sale"}
          </Badge>
        </div>

        <Link href={`/property/${property.id}`} className="block">
          <h3 className="line-clamp-1 text-sm font-medium text-foreground hover:underline">
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {property.locality}, {property.city}
          </p>
        </Link>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          {property.bedrooms > 0 && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="size-3.5" />
              {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bath className="size-3.5" />
              {property.bathrooms} bath
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Maximize className="size-3.5" />
            {property.area.toLocaleString("en-IN")} {property.areaUnit.toLowerCase()}
          </span>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
            {property.propertyType}
          </span>
        </div>

        {onToggleCompare && (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={compared}
              onCheckedChange={() => onToggleCompare(property.id)}
            />
            Compare
          </label>
        )}
      </div>
    </article>
  );
}
