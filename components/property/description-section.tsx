"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

const COLLAPSE_AT = 320;

type Props = { description: string };

export function DescriptionSection({ description }: Props) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = description.length > COLLAPSE_AT;
  const shown = !expanded && needsTruncation ? description.slice(0, COLLAPSE_AT) + "…" : description;

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">About this property</h2>
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{shown}</p>
      {needsTruncation && (
        <Button
          variant="link"
          size="sm"
          className="mt-1 h-auto p-0 text-emerald-600"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Read more"}
        </Button>
      )}
    </section>
  );
}
