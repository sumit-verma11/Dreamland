"use client";

import { Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmiCalculator } from "@/components/property/emi-calculator";
import { InquiryModal } from "@/components/property/inquiry-modal";
import { ReportModal } from "@/components/property/report-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import type { SellerInfo } from "@/lib/property-detail";

type Props = {
  propertyId: string;
  price: number;
  priceType: string;
  area: number;
  seller: SellerInfo;
  isLoggedIn: boolean;
  favoriteCount: number;
};

export function StickySidebar({
  propertyId,
  price,
  priceType,
  area,
  seller,
  isLoggedIn,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const pricePerSqft = area > 0 ? Math.round(price / area) : 0;

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(
      () => toast.success("Link copied to clipboard"),
      () => toast.error("Could not copy link"),
    );
  }

  return (
    <>
      <div className="space-y-4 rounded-xl border border-border bg-background p-5 shadow-sm">
        {/* Price */}
        <div>
          <p className="text-2xl font-bold">
            {formatPrice(price, priceType as "SALE" | "RENT")}
          </p>
          {pricePerSqft > 0 && (
            <p className="text-xs text-muted-foreground">
              ₹{pricePerSqft.toLocaleString("en-IN")} / sqft
            </p>
          )}
        </div>

        {/* Seller info */}
        <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            {(seller.name?.[0] ?? "S").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{seller.name ?? "Seller"}</p>
            <p className="text-xs capitalize text-muted-foreground">
              {seller.role.toLowerCase()}
              {seller.verified && (
                <Badge variant="outline" className="ml-1.5 px-1 py-0 text-[10px]">
                  Verified
                </Badge>
              )}
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-2">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setModalOpen(true)}
          >
            Contact Seller
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setModalOpen(true)}
          >
            Schedule Visit
          </Button>
        </div>

        <Separator />

        {/* Secondary actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => { setSaved((v) => !v); toast.success(saved ? "Removed from saved" : "Saved to wishlist"); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Heart className={saved ? "size-4 fill-red-500 text-red-500" : "size-4"} />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Share2 className="size-4" />
            Share
          </button>
          <ReportModal propertyId={propertyId} />
        </div>

        <Separator />

        {/* EMI calculator */}
        <EmiCalculator price={price} />
      </div>

      <InquiryModal
        propertyId={propertyId}
        sellerName={seller.name}
        isLoggedIn={isLoggedIn}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
