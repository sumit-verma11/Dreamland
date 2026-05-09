"use client";

import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { POPULAR_CITIES } from "@/lib/mock-data";

type Props = {
  onClearFilters: () => void;
  onPickCity: (city: string) => void;
};

export function NoResults({ onClearFilters, onPickCity }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-7" />
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight">No properties match your filters</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Try removing a filter or two, or browse one of the cities buyers are most active in
        right now.
      </p>

      <Button onClick={onClearFilters} className="mt-6">
        Clear all filters
      </Button>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {POPULAR_CITIES.slice(0, 6).map((c) => (
          <button
            key={c}
            onClick={() => onPickCity(c)}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground hover:text-foreground"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
