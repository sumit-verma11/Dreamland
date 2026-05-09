import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { AmenitiesGrid } from "@/components/property/amenities-grid";
import { DescriptionSection } from "@/components/property/description-section";
import { ImageGallery } from "@/components/property/image-gallery";
import { LifestyleMatch } from "@/components/property/lifestyle-match";
import { LocationSection } from "@/components/property/location-section";
import { PriceAnalysis } from "@/components/property/price-analysis";
import { ReviewsSection } from "@/components/property/reviews-section";
import { SimilarProperties } from "@/components/property/similar-properties";
import { SpecsRow } from "@/components/property/specs-row";
import { StickySidebar } from "@/components/property/sticky-sidebar";
import { VirtualTourButton } from "@/components/property/virtual-tour-button";
import { EmiCalculator } from "@/components/tools/emi-calculator";
import { Navbar } from "@/components/nav/navbar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authOptions } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { matchScoreFor, roleToPostedBy } from "@/lib/property-search";
import type {
  PriceHistoryPoint,
  PropertyDetailData,
  PropertyStats,
  ReviewWithUser,
  SimilarPropertyItem,
} from "@/lib/property-detail";

export const dynamic = "force-dynamic";

async function fetchPropertyData(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, phone: true, avatar: true, role: true, verified: true } },
      media: { orderBy: { order: "asc" } },
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
      priceHistory: { orderBy: { recordedAt: "asc" }, take: 24 },
      _count: { select: { favorites: true, reviews: true } },
    },
  });

  if (!property || property.status === "INACTIVE") return null;

  // Increment views fire-and-forget
  prisma.property.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

  // City price stats
  const cityStats = await prisma.property.aggregate({
    where: { city: property.city, priceType: property.priceType, propertyType: property.propertyType, status: "ACTIVE", id: { not: id } },
    _avg: { price: true, area: true },
    _count: true,
  });
  const avgPricePerSqft =
    Number(cityStats._avg.area ?? 0) > 0
      ? Number(cityStats._avg.price ?? 0) / Number(cityStats._avg.area ?? 0)
      : 0;
  const fairValue =
    avgPricePerSqft > 0
      ? Math.round(avgPricePerSqft * Number(property.area))
      : Number(property.price);

  // Similar properties
  const similarRaw = await prisma.property.findMany({
    where: { id: { not: id }, city: property.city, priceType: property.priceType, status: "ACTIVE", price: { gte: Number(property.price) * 0.65, lte: Number(property.price) * 1.4 } },
    take: 8,
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    include: { media: { orderBy: { order: "asc" }, take: 1 }, seller: { select: { role: true } } },
  });

  const detail: PropertyDetailData = {
    id: property.id,
    title: property.title,
    description: property.description,
    price: Number(property.price),
    priceType: property.priceType,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: Number(property.area),
    areaUnit: property.areaUnit,
    address: property.address,
    city: property.city,
    state: property.state,
    pincode: property.pincode,
    lat: property.lat,
    lng: property.lng,
    amenities: property.amenities,
    furnishing: property.furnishing,
    facing: property.facing,
    floorNo: property.floorNo,
    totalFloors: property.totalFloors,
    age: property.age,
    parking: property.parking,
    status: property.status,
    verified: property.verified,
    featured: property.featured,
    views: property.views,
    createdAt: property.createdAt.toISOString(),
    seller: property.seller,
    media: property.media,
    reviews: property.reviews.map((r): ReviewWithUser => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
    priceHistory: property.priceHistory.map((ph): PriceHistoryPoint => ({
      id: ph.id,
      price: Number(ph.price),
      recordedAt: ph.recordedAt.toISOString(),
    })),
    favoriteCount: property._count.favorites,
    reviewCount: property._count.reviews,
  };

  const stats: PropertyStats = {
    avgPricePerSqft: Math.round(avgPricePerSqft),
    fairValue,
    comparableCount: cityStats._count,
  };

  const similar: SimilarPropertyItem[] = similarRaw.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    priceType: p.priceType,
    city: p.city,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: Number(p.area),
    areaUnit: p.areaUnit,
    propertyType: p.propertyType,
    verified: p.verified,
    matchScore: matchScoreFor(p.id),
    coverImage: p.media[0]?.url ?? null,
    postedBy: roleToPostedBy(p.seller.role),
  }));

  return { detail, stats, similar };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await fetchPropertyData(params.id).catch(() => null);
  if (!data) return { title: "Property not found" };
  const { detail } = data;
  return {
    title: `${detail.title} — ${detail.city} | NestIQ`,
    description: detail.description.slice(0, 155),
  };
}

const TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
  PG: "PG",
};

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const [data, session] = await Promise.all([
    fetchPropertyData(params.id),
    getServerSession(authOptions),
  ]);

  if (!data) notFound();

  const { detail, stats, similar } = data;
  const userId = session?.user?.id ?? null;
  const isLoggedIn = !!userId;

  const tourMedia = detail.media.find((m) => m.type === "VIRTUAL_TOUR");
  const avgRating =
    detail.reviews.length
      ? detail.reviews.reduce((a, r) => a + r.rating, 0) / detail.reviews.length
      : 0;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pb-16">
        {/* Gallery — full width */}
        <ImageGallery
          media={detail.media}
          title={detail.title}
          verified={detail.verified}
          featured={detail.featured}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            {/* ── Left column ── */}
            <div className="space-y-8 min-w-0">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{detail.title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detail.address}, {detail.city}, {detail.state} — {detail.pincode}
                    </p>
                  </div>
                  <VirtualTourButton tourUrl={tourMedia?.url} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{TYPE_LABEL[detail.propertyType] ?? detail.propertyType}</Badge>
                  <Badge variant="outline">{detail.priceType === "RENT" ? "For Rent" : "For Sale"}</Badge>
                  {detail.facing && <Badge variant="outline">{detail.facing} facing</Badge>}
                  <span className="text-xs text-muted-foreground">
                    {detail.views.toLocaleString("en-IN")} views
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-emerald-600">
                    {formatPrice(detail.price, detail.priceType as "SALE" | "RENT")}
                  </span>
                  {detail.area > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ₹{Math.round(detail.price / detail.area).toLocaleString("en-IN")} / sqft
                    </span>
                  )}
                </div>
              </div>

              <SpecsRow
                bedrooms={detail.bedrooms}
                bathrooms={detail.bathrooms}
                area={detail.area}
                areaUnit={detail.areaUnit}
                floorNo={detail.floorNo}
                totalFloors={detail.totalFloors}
                age={detail.age}
                parking={detail.parking}
                furnishing={detail.furnishing}
              />

              <Separator />
              <DescriptionSection description={detail.description} />

              <Separator />
              <AmenitiesGrid amenities={detail.amenities} />

              <Separator />
              <PriceAnalysis
                property={{ id: detail.id, price: detail.price, priceType: detail.priceType, area: detail.area, city: detail.city }}
                stats={stats}
                priceHistory={detail.priceHistory}
              />

              <Separator />
              <LocationSection
                lat={detail.lat}
                lng={detail.lng}
                address={detail.address}
                city={detail.city}
              />

              <Separator />
              <LifestyleMatch
                userId={userId}
                propertyId={detail.id}
                amenities={detail.amenities}
                bedrooms={detail.bedrooms}
              />

              <Separator />
              <SimilarProperties items={similar} />

              <Separator />
              <section>
                <h2 className="mb-6 text-xl font-semibold">EMI &amp; Buying Cost Calculator</h2>
                <EmiCalculator
                  initialPrice={detail.price}
                  initialState={detail.state}
                  propertyType={detail.propertyType}
                />
              </section>

              <Separator />
              <ReviewsSection
                propertyId={detail.id}
                reviews={detail.reviews}
                isLoggedIn={isLoggedIn}
                averageRating={avgRating}
              />
            </div>

            {/* ── Right sticky sidebar ── */}
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <StickySidebar
                  propertyId={detail.id}
                  price={detail.price}
                  priceType={detail.priceType}
                  area={detail.area}
                  seller={detail.seller}
                  isLoggedIn={isLoggedIn}
                  favoriteCount={detail.favoriteCount}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold">
                {formatPrice(detail.price, detail.priceType as "SALE" | "RENT")}
              </p>
              {detail.area > 0 && (
                <p className="text-xs text-muted-foreground">
                  ₹{Math.round(detail.price / detail.area).toLocaleString("en-IN")} / sqft
                </p>
              )}
            </div>
            <StickySidebar
              propertyId={detail.id}
              price={detail.price}
              priceType={detail.priceType}
              area={detail.area}
              seller={detail.seller}
              isLoggedIn={isLoggedIn}
              favoriteCount={detail.favoriteCount}
            />
          </div>
        </div>
      </main>
    </>
  );
}
