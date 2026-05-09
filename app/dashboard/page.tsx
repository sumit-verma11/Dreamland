import { getServerSession } from "next-auth";

import { Navbar } from "@/components/nav/navbar";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <Navbar />
      <main className="container py-10">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Signed in as {session?.user.name ?? session?.user.email} ({session?.user.role}).
        </p>
      </main>
    </>
  );
}
