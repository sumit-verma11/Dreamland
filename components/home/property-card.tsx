import { Bath, BedDouble, Heart, Maximize, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeaturedProperty } from "@/lib/mock-data";

const BADGE_STYLES: Record<NonNullable<FeaturedProperty["badge"]>, string> = {
  HOT: "bg-rose-500/90 text-white",
  NEW: "bg-emerald-500/90 text-white",
  VERIFIED: "bg-blue-500/90 text-white",
};

export function PropertyCard({ property }: { property: FeaturedProperty }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${property.imageSeed}/640/480`}
          alt={property.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />

        <div className="absolute left-3 top-3 flex gap-2">
          {property.badge && (
            <Badge
              className={cn("border-0 text-[10px] font-semibold tracking-wide", BADGE_STYLES[property.badge])}
            >
              {property.badge}
            </Badge>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <button
            type="button"
            aria-label="Save property"
            className="grid size-9 place-items-center rounded-full bg-white/90 text-slate-700 backdrop-blur transition hover:bg-white hover:text-rose-500"
          >
            <Heart className="size-4" />
          </button>
        </div>

        <div className="absolute bottom-3 right-3">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-950/85 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {property.matchScore}% match
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xl font-semibold tracking-tight">{property.price}</p>
          <h3 className="mt-1 line-clamp-1 text-sm font-medium text-foreground">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {property.locality}, {property.city}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="size-3.5" />
            {property.beds} beds
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="size-3.5" />
            {property.baths} baths
          </span>
          <span className="inline-flex items-center gap-1">
            <Maximize className="size-3.5" />
            {property.area}
          </span>
        </div>
      </div>
    </article>
  );
}
