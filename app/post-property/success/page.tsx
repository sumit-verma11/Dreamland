import type { Metadata } from "next";
import { CheckCircle2, Eye, Home, PlusCircle } from "lucide-react";

import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ShareListingButton } from "@/components/post-property/share-listing-button";

export const metadata: Metadata = {
  title: "Listing Published | NestIQ",
};

type Props = { searchParams: { id?: string } };

export default async function SuccessPage({ searchParams }: Props) {
  const id = searchParams.id ?? "";

  let property = null;
  if (id) {
    property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true, title: true, city: true, state: true, price: true, priceType: true,
        bedrooms: true, area: true, areaUnit: true,
        media: { where: { type: "IMAGE" }, orderBy: { order: "asc" }, take: 1 },
      },
    }).catch(() => null);
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? (typeof window !== "undefined" ? window.location.origin : "");
  const listingUrl = id ? `${baseUrl}/property/${id}` : "";

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-start bg-background pb-20 pt-16">
        <div className="mx-auto w-full max-w-lg px-4 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-10 text-emerald-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold">Your listing is live!</h1>
          <p className="mt-2 text-muted-foreground">
            Your property has been published on NestIQ and is now visible to buyers and tenants.
          </p>

          {property && (
            <div className="my-8 overflow-hidden rounded-xl border border-border text-left shadow-sm">
              {property.media[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.media[0].url}
                  alt={property.title}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-muted">
                  <Home className="size-10 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-4">
                <p className="font-semibold leading-snug">{property.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {property.city}, {property.state}
                </p>
                <p className="mt-2 text-lg font-bold text-emerald-600">
                  {formatPrice(Number(property.price), property.priceType as "SALE" | "RENT")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {property.bedrooms > 0 && `${property.bedrooms} BHK · `}
                  {Number(property.area).toLocaleString("en-IN")} {property.areaUnit.toLowerCase()}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {id && (
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <a href={`/property/${id}`}>
                  <Eye className="mr-2 size-4" />
                  View Listing
                </a>
              </Button>
            )}

            {listingUrl && <ShareListingButton url={listingUrl} />}

            <Button variant="outline" asChild>
              <a href="/post-property">
                <PlusCircle className="mr-2 size-4" />
                Post Another Property
              </a>
            </Button>

            <Button variant="ghost" asChild>
              <a href="/">
                <Home className="mr-2 size-4" />
                Back to Home
              </a>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
