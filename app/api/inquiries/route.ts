import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  propertyId: z.string(),
  message: z.string().min(10).max(1000),
  visitDate: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { propertyId, message } = parsed.data;

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }
  if (property.sellerId === session.user.id) {
    return NextResponse.json({ error: "Cannot inquire on your own listing" }, { status: 400 });
  }

  const inquiry = await prisma.inquiry.create({
    data: { userId: session.user.id, propertyId, message },
  });

  return NextResponse.json(inquiry, { status: 201 });
}
