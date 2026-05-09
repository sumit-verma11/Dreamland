import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/nav/navbar";
import { PostPropertyWizard } from "@/components/post-property/wizard";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Post Property | NestIQ",
  description: "List your property for sale or rent on NestIQ — reach thousands of verified buyers and tenants.",
};

export default async function PostPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/post-property");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20">
        <div className="border-b border-border bg-muted/30 py-6">
          <div className="mx-auto max-w-2xl px-4">
            <h1 className="text-xl font-bold">Post Your Property</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Fill in the details below — your draft is auto-saved at every step
            </p>
          </div>
        </div>
        <div className="py-8">
          <PostPropertyWizard />
        </div>
      </main>
    </>
  );
}
