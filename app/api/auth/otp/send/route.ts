import { NextResponse } from "next/server";

import { generateOtp, issueOtpCookie } from "@/lib/otp";
import { sendSms } from "@/lib/sms";
import { sendOtpSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = sendOtpSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid phone", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const code = generateOtp();
  await issueOtpCookie(parsed.data.phone, code);
  const result = await sendSms(parsed.data.phone, `Your NestIQ code is ${code}. Expires in 5 minutes.`);

  return NextResponse.json({ ok: true, dev: result.dev });
}
