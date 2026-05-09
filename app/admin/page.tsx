import { Navbar } from "@/components/nav/navbar";

export default function AdminHome() {
  return (
    <>
      <Navbar />
      <main className="container py-10">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-2 text-muted-foreground">
          Visible only to ADMIN users. Hooked up to the role middleware.
        </p>
      </main>
    </>
  );
}
