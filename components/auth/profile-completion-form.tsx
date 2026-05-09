"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PhoneOtpForm } from "@/components/auth/phone-otp-form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ROLES = ["BUYER", "SELLER", "AGENT"] as const;
type Role = (typeof ROLES)[number];

export function ProfileCompletionForm({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const { update } = useSession();
  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState<"role" | "phone">("role");
  const [saving, setSaving] = useState(false);

  async function saveRole() {
    setSaving(true);
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save role");
      return;
    }
    await update();
    setStep("phone");
  }

  if (step === "role") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Pick your role</p>
          <RadioGroup
            className="grid grid-cols-3 gap-2"
            value={role}
            onValueChange={(v) => setRole(v as Role)}
          >
            {ROLES.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent has-[[data-state=checked]]:border-foreground"
              >
                <RadioGroupItem value={r} />
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </label>
            ))}
          </RadioGroup>
        </div>
        <Button className="w-full" onClick={saveRole} disabled={saving}>
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Verify your phone so buyers and sellers can reach you.
      </p>
      <PhoneOtpForm mode="verify" />
      <button
        type="button"
        className="block w-full text-center text-sm text-muted-foreground hover:underline"
        onClick={() => router.push("/")}
      >
        Skip for now
      </button>
    </div>
  );
}
