import { NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  PAGE_SIZE,
  POSTED_BY_LABELS,
  filtersSchema,
  matchScoreFor,
  roleToPostedBy,
  type SearchProperty,
  type SearchResponse,
} from "@/lib/property-search";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = filtersSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filters", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const f = parsed.data;
  const page = f.page ?? 1;
  const sort = f.sort ?? "relevance";
  const limit = f.view === "map" ? 100 : PAGE_SIZE;

  const where: Prisma.PropertyWhereInput = { status: "ACTIVE" };

  if (f.q) {
    where.OR = [
      { title: { contains: f.q, mode: "insensitive" } },
      { description: { contains: f.q, mode: "insensitive" } },
      { city: { contains: f.q, mode: "insensitive" } },
      { address: { contains: f.q, mode: "insensitive" } },
    ];
  }
  if (f.city) where.city = { equals: f.city, mode: "insensitive" };
  if (f.priceType) where.priceType = f.priceType;
  if (f.type?.length) where.propertyType = { in: f.type };
  if (f.priceMin != null || f.priceMax != null) {
    where.price = {
      ...(f.priceMin != null ? { gte: f.priceMin } : {}),
      ...(f.priceMax != null ? { lte: f.priceMax } : {}),
    };
  }
  if (f.areaMin != null || f.areaMax != null) {
    where.area = {
      ...(f.areaMin != null ? { gte: f.areaMin } : {}),
      ...(f.areaMax != null ? { lte: f.areaMax } : {}),
    };
  }
  if (f.bedrooms?.length) {
    const max = Math.max(...f.bedrooms);
    where.bedrooms = max >= 5 ? { in: f.bedrooms.filter((b) => b < 5).concat([5, 6, 7, 8, 9, 10]) } : { in: f.bedrooms };
  }
  if (f.bathrooms?.length) {
    const max = Math.max(...f.bathrooms);
    where.bathrooms = max >= 5 ? { in: f.bathrooms.filter((b) => b < 5).concat([5, 6, 7, 8, 9, 10]) } : { in: f.bathrooms };
  }
  if (f.furnishing?.length) where.furnishing = { in: f.furnishing };
  if (f.postedBy?.length) {
    const roles = f.postedBy.map((p) => POSTED_BY_LABELS[p].role);
    where.seller = { role: { in: roles } };
  }
  if (f.amenities?.length) where.amenities = { hasEvery: f.amenities };
  if (f.ageMax != null) where.age = { lte: f.ageMax };
  if (f.facing?.length) where.facing = { in: f.facing };
  if (f.verified) where.verified = true;

  const orderBy: Prisma.PropertyOrderByWithRelationInput[] =
    sort === "price-asc"
      ? [{ price: "asc" }, { createdAt: "desc" }]
      : sort === "newest"
        ? [{ createdAt: "desc" }]
        : sort === "views"
          ? [{ views: "desc" }, { createdAt: "desc" }]
          : [{ featured: "desc" }, { verified: "desc" }, { views: "desc" }];

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        media: { orderBy: { order: "asc" }, take: 5 },
        seller: { select: { role: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  const properties: SearchProperty[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    state: p.state,
    locality: p.address.split(",").slice(-1)[0]?.trim() || p.city,
    price: Number(p.price),
    priceType: p.priceType,
    propertyType: p.propertyType,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: Number(p.area),
    areaUnit: p.areaUnit,
    amenities: p.amenities,
    furnishing: p.furnishing,
    facing: p.facing,
    age: p.age,
    parking: p.parking,
    status: p.status,
    verified: p.verified,
    featured: p.featured,
    views: p.views,
    lat: p.lat,
    lng: p.lng,
    images: p.media.map((m) => m.url),
    postedBy: roleToPostedBy(p.seller.role),
    matchScore: matchScoreFor(p.id),
  }));

  const response: SearchResponse = {
    properties,
    total,
    page,
    hasMore: page * limit < total,
  };

  return NextResponse.json(response);
}
