import { Navbar } from "@/components/nav/navbar";

export default function SellerHome() {
  return (
    <>
      <Navbar />
      <main className="container py-10">
        <h1 className="text-2xl font-semibold">Seller workspace</h1>
        <p className="mt-2 text-muted-foreground">
          Sellers and agents land here. Listings UI ships in a later module.
        </p>
      </main>
    </>
  );
}
