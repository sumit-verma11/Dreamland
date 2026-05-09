import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  propertyId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(2000),
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

  const { propertyId, rating, comment } = parsed.data;

  const existing = await prisma.review.findFirst({
    where: { propertyId, userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "You already reviewed this property" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: { userId: session.user.id, propertyId, rating, comment },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  return NextResponse.json(
    { ...review, createdAt: review.createdAt.toISOString() },
    { status: 201 },
  );
}
