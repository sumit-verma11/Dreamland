import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { SimilarPropertyItem } from "@/lib/property-detail";

type Props = { items: SimilarPropertyItem[] };

const TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Apt",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Comm.",
  PG: "PG",
};

export function SimilarProperties({ items }: Props) {
  if (!items.length) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Similar Properties</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/property/${p.id}`}
            className="group w-56 shrink-0 overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-md"
          >
            {/* Cover image */}
            <div className="relative h-32 w-full overflow-hidden bg-muted">
              {p.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.coverImage}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
              {p.verified && (
                <Badge className="absolute left-2 top-2 bg-emerald-600 text-[10px] text-white">
                  Verified
                </Badge>
              )}
            </div>

            <div className="p-3">
              <p className="truncate text-sm font-medium leading-snug">{p.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.city}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-600">
                  {formatPrice(p.price, p.priceType as "SALE" | "RENT")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {p.bedrooms > 0 ? `${p.bedrooms} BHK` : "Studio"} ·{" "}
                  {TYPE_LABEL[p.propertyType] ?? p.propertyType}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Match <span className="font-semibold text-foreground">{p.matchScore}%</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
