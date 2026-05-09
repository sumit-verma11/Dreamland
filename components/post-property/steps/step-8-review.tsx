"use client";

import {
  Bath,
  BedDouble,
  Building,
  Calendar,
  Car,
  CheckSquare,
  IndianRupee,
  Layers,
  MapPin,
  Maximize2,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import type { PostPropertyDraft } from "@/lib/post-property";

type Props = {
  draft: PostPropertyDraft;
  agreed: boolean;
  onAgreeChange: (v: boolean) => void;
};

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-[100px] text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

const FURNISHING_LABEL: Record<string, string> = {
  FURNISHED: "Fully Furnished", SEMI: "Semi Furnished", UNFURNISHED: "Unfurnished",
};
const TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Apartment", VILLA: "Villa", PLOT: "Plot", COMMERCIAL: "Commercial", PG: "PG",
};

export function Step8Review({ draft, agreed, onAgreeChange }: Props) {
  const [imgErr, setImgErr] = useState(false);
  const coverImage = draft.media.find((m) => m.isCover && m.type === "IMAGE") ?? draft.media.find((m) => m.type === "IMAGE");
  const priceNum = parseFloat(draft.price || "0");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Cover image */}
        {coverImage && !imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage.url}
            alt={draft.title}
            onError={() => setImgErr(true)}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-muted">
            <Building className="size-12 text-muted-foreground/40" />
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Title + badges */}
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="outline">{TYPE_LABEL[draft.propertyType] ?? draft.propertyType}</Badge>
              <Badge variant="outline">{draft.priceType === "RENT" ? "For Rent" : "For Sale"}</Badge>
              {draft.facing && <Badge variant="outline">{draft.facing} facing</Badge>}
            </div>
            <h3 className="text-lg font-bold leading-tight">{draft.title || "(no title)"}</h3>
            {(draft.locality || draft.city) && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {[draft.locality, draft.city, draft.state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {/* Price */}
          {priceNum > 0 && (
            <p className="text-2xl font-bold text-emerald-600">
              {formatPrice(priceNum, draft.priceType as "SALE" | "RENT")}
              {draft.negotiable && <span className="ml-2 text-sm font-normal text-muted-foreground">(Negotiable)</span>}
            </p>
          )}

          <Separator />

          {/* Key details */}
          <div className="divide-y divide-border/50">
            {draft.bedrooms > 0 && <Row icon={BedDouble} label="Bedrooms" value={draft.bedrooms} />}
            {draft.bathrooms > 0 && <Row icon={Bath} label="Bathrooms" value={draft.bathrooms} />}
            {draft.area && (
              <Row icon={Maximize2} label="Area" value={`${draft.area} ${draft.areaUnit.toLowerCase()}`} />
            )}
            {draft.parking > 0 && <Row icon={Car} label="Parking" value={`${draft.parking} spot${draft.parking > 1 ? "s" : ""}`} />}
            {draft.floorNo && (
              <Row icon={Layers} label="Floor" value={`${draft.floorNo}${draft.totalFloors ? ` / ${draft.totalFloors}` : ""}`} />
            )}
            {draft.furnishing && (
              <Row icon={IndianRupee} label="Furnishing" value={FURNISHING_LABEL[draft.furnishing]} />
            )}
            {draft.availableFrom && (
              <Row icon={Calendar} label="Available from" value={new Date(draft.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
            )}
          </div>

          {/* Amenities */}
          {draft.amenities.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {draft.amenities.map((a) => (
                    <span key={a} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{a}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Description preview */}
          {draft.description && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Description</p>
                <p className="text-sm text-muted-foreground line-clamp-4">{draft.description}</p>
              </div>
            </>
          )}

          {/* Media count */}
          {draft.media.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {draft.media.filter((m) => m.type === "IMAGE").length} photo{draft.media.filter((m) => m.type === "IMAGE").length !== 1 ? "s" : ""}
              {draft.videoUrl ? " · 1 video" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Terms */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreeChange(e.target.checked)}
          className="mt-0.5 accent-emerald-600"
        />
        <span className="text-sm">
          I confirm that all information provided is accurate and I agree to NestIQ&apos;s{" "}
          <a href="#" className="text-emerald-600 underline">Terms of Service</a> and{" "}
          <a href="#" className="text-emerald-600 underline">Listing Guidelines</a>.
          I also confirm that I have the authority to list this property.
        </span>
      </label>

      {/* Checklist */}
      <div className="space-y-2">
        {[
          { ok: !!draft.city && !!draft.address, label: "Location filled in" },
          { ok: !!draft.area, label: "Property area specified" },
          { ok: !!draft.price, label: "Asking price set" },
          { ok: draft.media.filter((m) => m.type === "IMAGE").length > 0, label: "At least 1 photo added" },
          { ok: draft.title.length >= 10, label: "Listing title (10+ characters)" },
          { ok: draft.description.length >= 50, label: "Description (50+ characters)" },
        ].map(({ ok, label }) => (
          <div key={label} className={`flex items-center gap-2 text-sm ${ok ? "text-foreground" : "text-muted-foreground"}`}>
            <CheckSquare className={`size-4 ${ok ? "text-emerald-600" : "text-muted-foreground/40"}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
