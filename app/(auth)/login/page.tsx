import Link from "next/link";

import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue to NestIQ.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs uppercase text-muted-foreground">
            or
          </span>
        </div>
        <GoogleButton />
        <Link
          href="/verify-phone"
          className="block w-full rounded-md border bg-background px-3 py-2 text-center text-sm hover:bg-accent"
        >
          Sign in with phone OTP
        </Link>
      </CardContent>
    </Card>
  );
}
