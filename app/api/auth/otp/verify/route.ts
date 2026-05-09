import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { verifyOtpCookie } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { verifyOtpSchema } from "@/lib/validation";

// Used by /complete-profile to bind a phone to the *currently signed-in* user.
// (For OTP login as a sign-in method, the phone-otp CredentialsProvider in
// lib/auth.ts handles its own verification.)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await verifyOtpCookie(parsed.data.phone, parsed.data.code);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  const conflict = await prisma.user.findFirst({
    where: { phone: parsed.data.phone, NOT: { id: session.user.id } },
    select: { id: true },
  });
  if (conflict) {
    return NextResponse.json({ error: "Phone already in use" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { phone: parsed.data.phone, verified: true },
  });

  return NextResponse.json({ ok: true });
}
