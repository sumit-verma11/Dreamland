"use client";

import { Grid2x2, List, Map as MapIcon, MapPin, Search, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { POPULAR_CITIES } from "@/lib/mock-data";
import type { Sort, ViewMode } from "@/lib/property-search";

const SORT_LABELS: Record<Sort, string> = {
  relevance: "Relevance",
  "price-asc": "Price: low to high",
  newest: "Newest",
  views: "Most viewed",
};

type Props = {
  total: number;
  loading: boolean;
  sort: Sort;
  view: ViewMode;
  q?: string;
  city?: string;
  onSortChange: (s: Sort) => void;
  onViewChange: (v: ViewMode) => void;
  onSearch: (q: string, city: string) => void;
};

export function TopBar({ total, loading, sort, view, q, city, onSortChange, onViewChange, onSearch }: Props) {
  const [localQ, setLocalQ] = useState(q ?? "");
  const [localCity, setLocalCity] = useState(city ?? "");
  const [cityOpen, setCityOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    onSearch(localQ.trim(), localCity.trim());
  }

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur">
      {/* Search row */}
      <div className="flex gap-2 px-4 py-2 sm:px-6">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Search by keyword, project…"
            className="h-9 pl-9 pr-8 text-sm"
          />
          {localQ && (
            <button
              type="button"
              onClick={() => { setLocalQ(""); inputRef.current?.focus(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Popover open={cityOpen} onOpenChange={setCityOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:border-foreground hover:text-foreground"
            >
              <MapPin className="size-3.5 shrink-0" />
              <span className="max-w-[80px] truncate sm:max-w-[120px]">
                {localCity || "Any city"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52 p-1">
            <button
              type="button"
              onClick={() => { setLocalCity(""); setCityOpen(false); }}
              className="w-full rounded px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Any city
            </button>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setLocalCity(c); setCityOpen(false); }}
                className="w-full rounded px-3 py-1.5 text-left text-sm hover:bg-accent"
              >
                {c}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <Button size="sm" onClick={submit} className="h-9 shrink-0 bg-emerald-500 text-white hover:bg-emerald-600">
          Search
        </Button>
      </div>

      {/* Sort + view row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 sm:px-6">
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <span className="animate-pulse">Loading…</span>
          ) : (
            <>
              <span className="font-semibold text-foreground">{total.toLocaleString("en-IN")}</span>
              {" "}
              {total === 1 ? "property" : "properties"} found
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => onSortChange(v as Sort)}>
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && onViewChange(v as ViewMode)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" className="px-2.5">
              <Grid2x2 className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="px-2.5">
              <List className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="map" aria-label="Map view" className="px-2.5">
              <MapIcon className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}
