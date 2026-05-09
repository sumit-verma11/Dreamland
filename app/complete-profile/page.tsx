import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ProfileCompletionForm } from "@/components/auth/profile-completion-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/complete-profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, phone: true, verified: true },
  });

  if (user?.phone && user.verified) redirect("/");

  const initialRole =
    user?.role === "SELLER" || user?.role === "AGENT" ? user.role : "BUYER";

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
            <CardDescription>
              A few more details so people on NestIQ can reach you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileCompletionForm initialRole={initialRole} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
