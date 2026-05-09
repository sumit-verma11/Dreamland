import { createHash, createHmac, randomInt, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";

const COOKIE_NAME = "nestiq_otp";
const TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Payload = {
  phone: string;
  hash: string;
  exp: number;
  attempts: number;
};

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is not set");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function hashOtp(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}:${secret()}`).digest("hex");
}

function encode(p: Payload) {
  const body = Buffer.from(JSON.stringify(p)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(raw: string | undefined): Payload | null {
  if (!raw) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
  } catch {
    return null;
  }
}

export function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function issueOtpCookie(phone: string, code: string) {
  const payload: Payload = {
    phone,
    hash: hashOtp(phone, code),
    exp: Date.now() + TTL_MS,
    attempts: 0,
  };
  cookies().set(COOKIE_NAME, encode(payload), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export type OtpResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "invalid" | "missing" | "too_many_attempts" | "phone_mismatch" };

export async function verifyOtpCookie(phone: string, code: string): Promise<OtpResult> {
  const jar = cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  const payload = decode(raw);
  if (!payload) return { ok: false, reason: "missing" };
  if (payload.exp < Date.now()) {
    jar.delete(COOKIE_NAME);
    return { ok: false, reason: "expired" };
  }
  if (payload.phone !== phone) return { ok: false, reason: "phone_mismatch" };
  if (payload.attempts >= MAX_ATTEMPTS) {
    jar.delete(COOKIE_NAME);
    return { ok: false, reason: "too_many_attempts" };
  }

  const expected = hashOtp(phone, code);
  const a = Buffer.from(expected);
  const b = Buffer.from(payload.hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    const next: Payload = { ...payload, attempts: payload.attempts + 1 };
    jar.set(COOKIE_NAME, encode(next), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.max(1, Math.floor((payload.exp - Date.now()) / 1000)),
    });
    return { ok: false, reason: "invalid" };
  }

  jar.delete(COOKIE_NAME);
  return { ok: true };
}
