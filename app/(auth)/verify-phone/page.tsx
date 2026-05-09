import Link from "next/link";

import { PhoneOtpForm } from "@/components/auth/phone-otp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyPhonePage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Sign in with phone</CardTitle>
        <CardDescription>
          We&apos;ll text you a 6-digit code to confirm your number.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PhoneOtpForm mode="signin" />
        <p className="text-center text-sm text-muted-foreground">
          Prefer email?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in with email
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
