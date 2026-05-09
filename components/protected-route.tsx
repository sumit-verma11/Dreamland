"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { Role } from "@prisma/client";

type Props = {
  children: React.ReactNode;
  roles?: Role[];
  fallback?: React.ReactNode;
};

export function ProtectedRoute({ children, roles, fallback = null }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!session.user.phone) {
      router.replace("/complete-profile");
      return;
    }
    if (roles && !roles.includes(session.user.role)) {
      router.replace("/");
    }
  }, [session, status, roles, router]);

  if (status !== "authenticated") return fallback;
  if (!session.user.phone) return fallback;
  if (roles && !roles.includes(session.user.role)) return fallback;
  return <>{children}</>;
}
