import { Bath, BedDouble, Heart, MapPin, Maximize } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { FeaturedProperty } from "@/components/home/featured-properties-carousel";

export function HomePropertyCard({ property }: { property: FeaturedProperty }) {
  const badge = property.featured ? "HOT" : property.verified ? "VERIFIED" : null;

  const BADGE_STYLES: Record<string, string> = {
    HOT: "bg-rose-500/90 text-white",
    VERIFIED: "bg-blue-500/90 text-white",
  };

  return (
    <Link href={`/property/${property.id}`} className="block h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {property.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.coverUrl}
              alt={property.title}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-emerald-100 to-emerald-50" />
          )}

          <div className="absolute left-3 top-3 flex gap-2">
            {badge && (
              <Badge className={`border-0 text-[10px] font-semibold tracking-wide ${BADGE_STYLES[badge]}`}>
                {badge}
              </Badge>
            )}
          </div>

          <div className="absolute right-3 top-3">
            <button
              type="button"
              aria-label="Save property"
              onClick={(e) => e.preventDefault()}
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
            <p className="text-xl font-semibold tracking-tight">
              {formatPrice(property.price, property.priceType as "SALE" | "RENT")}
            </p>
            <h3 className="mt-1 line-clamp-1 text-sm font-medium text-foreground">
              {property.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {property.locality}, {property.city}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
            {property.bedrooms > 0 && (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="size-3.5" />
                {property.bedrooms} beds
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="inline-flex items-center gap-1">
                <Bath className="size-3.5" />
                {property.bathrooms} baths
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Maximize className="size-3.5" />
              {Number(property.area).toLocaleString("en-IN")} {property.areaUnit.toLowerCase()}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
