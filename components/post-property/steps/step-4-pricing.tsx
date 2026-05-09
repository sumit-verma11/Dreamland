"use client";

import { IndianRupee } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { PostPropertyDraft } from "@/lib/post-property";

type Props = {
  draft: PostPropertyDraft;
  onChange: (patch: Partial<PostPropertyDraft>) => void;
};

function pricePreview(val: string): string {
  const n = parseFloat(val.replace(/,/g, ""));
  if (isNaN(n) || n === 0) return "";
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Crore`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} Lakh`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function Step4Pricing({ draft, onChange }: Props) {
  const isRent = draft.priceType === "RENT";

  return (
    <div className="space-y-6">
      {/* Price */}
      <div>
        <Label htmlFor="price" className="mb-1 block">
          {isRent ? "Monthly Rent" : "Asking Price"} *
        </Label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="price"
            value={draft.price}
            onChange={(e) => onChange({ price: e.target.value.replace(/[^\d]/g, "") })}
            placeholder="e.g. 5000000"
            inputMode="numeric"
            className="pl-9"
          />
        </div>
        {draft.price && (
          <p className="mt-1 text-sm font-medium text-emerald-600">{pricePreview(draft.price)}</p>
        )}
      </div>

      {/* Negotiable */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Price Negotiable</p>
          <p className="text-xs text-muted-foreground">Buyers can make offers below the listed price</p>
        </div>
        <Switch
          checked={draft.negotiable}
          onCheckedChange={(v) => onChange({ negotiable: v })}
        />
      </div>

      {/* Maintenance (rent only) */}
      {isRent && (
        <div>
          <Label htmlFor="maintenance" className="mb-1 block">
            Monthly Maintenance <span className="text-muted-foreground">(optional)</span>
          </Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="maintenance"
              value={draft.maintenance}
              onChange={(e) => onChange({ maintenance: e.target.value.replace(/[^\d]/g, "") })}
              placeholder="e.g. 2000"
              inputMode="numeric"
              className="pl-9"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Charged over and above the monthly rent
          </p>
        </div>
      )}

      {/* Available from */}
      {isRent && (
        <div>
          <Label htmlFor="availableFrom" className="mb-1 block">
            Available From <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="availableFrom"
            type="date"
            value={draft.availableFrom}
            onChange={(e) => onChange({ availableFrom: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      )}

      {/* Price insight card */}
      {draft.price && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-700">Listing Summary</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{pricePreview(draft.price)}</p>
          {draft.negotiable && (
            <p className="text-xs text-emerald-600 mt-0.5">Negotiable</p>
          )}
          {isRent && draft.maintenance && (
            <p className="mt-1 text-xs text-muted-foreground">
              + ₹{parseInt(draft.maintenance).toLocaleString("en-IN")} / month maintenance
            </p>
          )}
        </div>
      )}
    </div>
  );
}
