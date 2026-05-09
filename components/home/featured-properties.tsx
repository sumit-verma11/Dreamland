import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { matchScoreFor } from "@/lib/property-search";
import { FeaturedPropertiesCarousel } from "@/components/home/featured-properties-carousel";

export async function FeaturedProperties() {
  const raw = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ featured: "desc" }, { views: "desc" }, { createdAt: "desc" }],
    take: 8,
    select: {
      id: true,
      title: true,
      price: true,
      priceType: true,
      city: true,
      address: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      areaUnit: true,
      verified: true,
      featured: true,
      media: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
    },
  });

  const properties = raw.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    priceType: p.priceType,
    city: p.city,
    // Use the first comma-separated segment of the address as the locality
    locality: p.address.split(",")[0]?.trim() ?? p.city,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: Number(p.area),
    areaUnit: p.areaUnit,
    coverUrl: p.media[0]?.url ?? null,
    verified: p.verified,
    featured: p.featured,
    matchScore: matchScoreFor(p.id),
  }));

  return (
    <section id="featured" className="bg-background py-20">
      <div className="container">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Featured
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Hand-picked homes you&apos;ll want to tour
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Match scores reflect lifestyle fit, commute, and budget — not just keywords.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
            <Link href="/search">
              View all
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10">
          <FeaturedPropertiesCarousel properties={properties} />
        </div>
      </div>
    </section>
  );
}
