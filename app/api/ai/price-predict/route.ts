import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  CITY_BASE_RATES,
  computeConfidence,
  estimatePrice,
  median,
} from "@/lib/price-predictor";

const schema = z.object({
  city: z.string().min(1),
  locality: z.string().default(""),
  propertyType: z.enum(["APARTMENT", "VILLA", "PLOT", "COMMERCIAL", "PG"]),
  area: z.number().positive(),
  bedrooms: z.number().int().min(0).max(10),
  floorNo: z.number().int().min(0).default(0),
  totalFloors: z.number().int().min(0).default(0),
  age: z.number().int().min(0).default(0),
  furnishing: z.enum(["FURNISHED", "SEMI", "UNFURNISHED"]).default("UNFURNISHED"),
  amenities: z.array(z.string()).default([]),
  distanceToMetro: z.number().min(0).default(5),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;

  // ── Fetch real comparables from DB ──────────────────────────────────────────
  const comparables = await prisma.property.findMany({
    where: {
      city: { equals: input.city, mode: "insensitive" },
      propertyType: input.propertyType,
      priceType: "SALE",
      status: "ACTIVE",
      area: { gt: 0 },
      price: { gt: 0 },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: { price: true, area: true },
  });

  // Price per sqft for each comparable
  const ppsqftList = comparables
    .map((c) => Number(c.price) / Number(c.area))
    .filter((p) => p > 200 && p < 200_000); // sanity filter

  // City-wide average (broader, for comparison card)
  const cityStats = await prisma.property.aggregate({
    where: {
      city: { equals: input.city, mode: "insensitive" },
      priceType: "SALE",
      status: "ACTIVE",
      area: { gt: 0 },
      price: { gt: 0 },
    },
    _avg: { price: true, area: true },
  });
  const cityAvgPpsqft =
    Number(cityStats._avg.area ?? 0) > 0
      ? Math.round(Number(cityStats._avg.price ?? 0) / Number(cityStats._avg.area ?? 1))
      : (CITY_BASE_RATES[input.city] ?? 10000);

  // Base: median of comparables, or city default if too few
  const basePpsqft =
    ppsqftList.length >= 3
      ? Math.round(median(ppsqftList))
      : (CITY_BASE_RATES[input.city] ?? 10000);

  const result = estimatePrice(input, basePpsqft, ppsqftList.length, cityAvgPpsqft);

  return NextResponse.json(result);
}
