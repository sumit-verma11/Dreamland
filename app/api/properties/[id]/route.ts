import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { matchScoreFor, roleToPostedBy } from "@/lib/property-search";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          verified: true,
        },
      },
      media: { orderBy: { order: "asc" } },
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
      priceHistory: { orderBy: { recordedAt: "asc" }, take: 24 },
      _count: { select: { favorites: true, reviews: true } },
    },
  });

  if (!property || property.status === "INACTIVE") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Increment views without blocking response
  prisma.property
    .update({ where: { id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  // City-level price stats for price analysis
  const cityStats = await prisma.property.aggregate({
    where: {
      city: property.city,
      priceType: property.priceType,
      propertyType: property.propertyType,
      status: "ACTIVE",
      id: { not: id },
    },
    _avg: { price: true, area: true },
    _count: true,
  });

  const avgPrice = Number(cityStats._avg.price ?? 0);
  const avgArea = Number(cityStats._avg.area ?? 0);
  const avgPricePerSqft = avgArea > 0 ? avgPrice / avgArea : 0;
  const thisArea = Number(property.area);
  const fairValue =
    avgPricePerSqft > 0
      ? Math.round(avgPricePerSqft * thisArea)
      : Number(property.price);

  // Similar properties
  const similar = await prisma.property.findMany({
    where: {
      id: { not: id },
      city: property.city,
      priceType: property.priceType,
      status: "ACTIVE",
      price: {
        gte: Number(property.price) * 0.65,
        lte: Number(property.price) * 1.4,
      },
    },
    take: 8,
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    include: {
      media: { orderBy: { order: "asc" }, take: 1 },
      seller: { select: { role: true } },
    },
  });

  return NextResponse.json({
    property: {
      ...property,
      price: Number(property.price),
      area: Number(property.area),
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
      favoriteCount: property._count.favorites,
      reviewCount: property._count.reviews,
      priceHistory: property.priceHistory.map((ph) => ({
        id: ph.id,
        price: Number(ph.price),
        recordedAt: ph.recordedAt.toISOString(),
      })),
      reviews: property.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
    },
    stats: {
      avgPricePerSqft: Math.round(avgPricePerSqft),
      fairValue,
      comparableCount: cityStats._count,
    },
    similar: similar.map((p) => ({
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
    })),
  });
}
