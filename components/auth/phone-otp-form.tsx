"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { phoneSchema } from "@/lib/validation";

type Mode = "signin" | "verify";

export function PhoneOtpForm({ mode = "signin" }: { mode?: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const { update } = useSession();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [submitting, setSubmitting] = useState(false);

  async function sendCode() {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid phone");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: parsed.data }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error("Could not send code");
      return;
    }
    const body = await res.json();
    toast.success(body.dev ? "Dev mode — check the server logs for the OTP" : "Code sent");
    setStep("code");
  }

  async function verify() {
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setSubmitting(true);

    if (mode === "signin") {
      const res = await signIn("phone-otp", { phone, code, redirect: false });
      setSubmitting(false);
      if (res?.error) {
        toast.error("Invalid or expired code");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
      return;
    }

    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Invalid code");
      return;
    }
    await update();
    toast.success("Phone verified");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (E.164)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+14155552671"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={step === "code"}
        />
      </div>

      {step === "phone" ? (
        <Button className="w-full" onClick={sendCode} disabled={submitting}>
          {submitting ? "Sending…" : "Send code"}
        </Button>
      ) : (
        <div className="space-y-3">
          <Label>Enter the 6-digit code</Label>
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Button className="w-full" onClick={verify} disabled={submitting}>
            {submitting ? "Verifying…" : mode === "signin" ? "Sign in" : "Verify phone"}
          </Button>
          <button
            type="button"
            className="block w-full text-center text-sm text-muted-foreground hover:underline"
            onClick={() => {
              setCode("");
              setStep("phone");
            }}
          >
            Change number
          </button>
        </div>
      )}
    </div>
  );
}
