"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateDescription, type PostPropertyDraft } from "@/lib/post-property";

type Props = {
  draft: PostPropertyDraft;
  onChange: (patch: Partial<PostPropertyDraft>) => void;
};

const MAX_DESC = 2000;
const MIN_DESC = 50;

export function Step7Description({ draft, onChange }: Props) {
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    // Simulate a brief "thinking" delay for UX
    await new Promise((r) => setTimeout(r, 600));
    const desc = generateDescription(draft);
    // Auto-build a title too if empty
    const autoTitle = draft.title.trim()
      ? draft.title
      : buildTitle(draft);
    onChange({ description: desc, title: autoTitle });
    setGenerating(false);
  }

  const descLen = draft.description.length;
  const titleLen = draft.title.length;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label htmlFor="title">Listing Title *</Label>
          <span className={`text-xs ${titleLen > 120 ? "text-red-500" : "text-muted-foreground"}`}>
            {titleLen}/120
          </span>
        </div>
        <Input
          id="title"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value.slice(0, 120) })}
          placeholder="e.g. Sunlit 3BHK in Koramangala with balcony garden"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          A specific, descriptive title gets 3× more clicks
        </p>
      </div>

      {/* Description */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label htmlFor="desc">Description *</Label>
          <span className={`text-xs ${descLen < MIN_DESC ? "text-amber-500" : descLen > MAX_DESC ? "text-red-500" : "text-muted-foreground"}`}>
            {descLen}/{MAX_DESC}
          </span>
        </div>
        <textarea
          id="desc"
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value.slice(0, MAX_DESC) })}
          rows={10}
          className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          placeholder="Describe the property — highlights, neighbourhood, connectivity, what makes it special…"
        />
        {descLen > 0 && descLen < MIN_DESC && (
          <p className="mt-1 text-xs text-amber-600">
            Add at least {MIN_DESC - descLen} more characters
          </p>
        )}
      </div>

      {/* AI Generate button */}
      <Button
        type="button"
        variant="outline"
        onClick={generate}
        disabled={generating}
        className="w-full border-dashed border-emerald-400 text-emerald-700 hover:bg-emerald-50"
      >
        <Sparkles className="mr-2 size-4" />
        {generating ? "Generating description…" : "Generate Description with AI"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        AI will draft a description based on your property details — you can edit it freely
      </p>
    </div>
  );
}

function buildTitle(draft: PostPropertyDraft): string {
  const typeLabel: Record<string, string> = {
    APARTMENT: "Apartment", VILLA: "Villa", PLOT: "Plot", COMMERCIAL: "Commercial Space", PG: "PG",
  };
  const type = typeLabel[draft.propertyType] ?? "Property";
  const beds = draft.bedrooms > 0 ? `${draft.bedrooms}BHK ` : "";
  const location = [draft.locality, draft.city].filter(Boolean).join(", ");
  const purpose = draft.priceType === "RENT" ? "for Rent" : "for Sale";
  return `${beds}${type} ${purpose}${location ? ` in ${location}` : ""}`.trim();
}
