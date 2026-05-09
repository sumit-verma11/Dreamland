import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(["IMAGE", "VIDEO"]),
  order: z.number().int().min(0),
});

const schema = z.object({
  priceType: z.enum(["SALE", "RENT"]),
  propertyType: z.enum(["APARTMENT", "VILLA", "PLOT", "COMMERCIAL", "PG"]),
  address: z.string().min(5, "Address too short"),
  city: z.string().min(2),
  state: z.string().min(2),
  locality: z.string().default(""),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  bedrooms: z.number().int().min(0).max(10),
  bathrooms: z.number().int().min(0).max(10),
  area: z.number().positive("Area must be positive"),
  areaUnit: z.enum(["SQFT", "SQM", "SQYD"]),
  floorNo: z.number().int().optional().nullable(),
  totalFloors: z.number().int().optional().nullable(),
  age: z.number().int().min(0).optional().nullable(),
  facing: z.string().optional().nullable(),
  parking: z.number().int().min(0),
  furnishing: z.enum(["FURNISHED", "SEMI", "UNFURNISHED"]),
  price: z.number().positive("Price must be positive"),
  negotiable: z.boolean().default(false),
  maintenance: z.number().optional().nullable(),
  availableFrom: z.string().optional().nullable(),
  amenities: z.array(z.string()),
  media: z.array(mediaSchema),
  title: z.string().min(10, "Title too short").max(120, "Title too long"),
  description: z.string().min(50, "Description too short").max(5000, "Description too long"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;

  const property = await prisma.property.create({
    data: {
      title: d.title,
      description: d.description,
      price: d.price,
      priceType: d.priceType,
      propertyType: d.propertyType,
      bedrooms: d.bedrooms,
      bathrooms: d.bathrooms,
      area: d.area,
      areaUnit: d.areaUnit,
      address: [d.locality, d.address].filter(Boolean).join(", "),
      city: d.city,
      state: d.state,
      pincode: d.pincode,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
      amenities: d.amenities,
      furnishing: d.furnishing,
      facing: d.facing ?? null,
      floorNo: d.floorNo ?? null,
      totalFloors: d.totalFloors ?? null,
      age: d.age ?? null,
      parking: d.parking,
      sellerId: session.user.id,
      status: "ACTIVE",
      media: {
        create: d.media.map((m) => ({
          url: m.url,
          type: m.type,
          order: m.order,
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: property.id }, { status: 201 });
}
