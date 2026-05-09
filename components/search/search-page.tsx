"use client";

import { Loader2, SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FiltersSidebar } from "@/components/search/filters-sidebar";
import { NoResults } from "@/components/search/no-results";
import { PropertySearchCard } from "@/components/search/property-search-card";
import { SmartSearchBar } from "@/components/search/smart-search-bar";
import { TopBar } from "@/components/search/top-bar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { NlChip } from "@/lib/nl-search";
import {
  buildSearchParams,
  filtersSchema,
  type SearchFilters,
  type SearchProperty,
  type SearchResponse,
  type Sort,
  type ViewMode,
} from "@/lib/property-search";

const PropertyMap = dynamic(() => import("@/components/search/property-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      <Loader2 className="mr-2 size-4 animate-spin" /> Loading map…
    </div>
  ),
});

function parseFromParams(searchParams: URLSearchParams): SearchFilters {
  const obj = Object.fromEntries(searchParams);
  const result = filtersSchema.safeParse(obj);
  return result.success ? result.data : { sort: "relevance", view: "grid", page: 1 };
}

export function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();

  const filters = useMemo(() => parseFromParams(params), [params]);

  const [pages, setPages] = useState<SearchProperty[][]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appendLoading, setAppendLoading] = useState(false);
  const [page, setPage] = useState(filters.page ?? 1);

  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [compared, setCompared] = useState<Set<string>>(new Set());

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nlChips, setNlChips] = useState<NlChip[]>([]);

  const filterKey = useMemo(() => {
    const p = buildSearchParams({ ...filters, page: undefined });
    return p.toString();
  }, [filters]);

  // Reset on filter change
  useEffect(() => {
    setPages([]);
    setPage(1);
    setLoading(true);
  }, [filterKey]);

  // Fetch a specific page
  useEffect(() => {
    const ctrl = new AbortController();
    const isInitial = page === 1;
    if (!isInitial) setAppendLoading(true);

    const params = buildSearchParams({ ...filters, page });
    fetch(`/api/properties?${params.toString()}`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: SearchResponse) => {
        setTotal(data.total);
        setHasMore(data.hasMore);
        setPages((prev) => {
          if (page === 1) return [data.properties];
          if (prev.length >= page) return prev;
          return [...prev, data.properties];
        });
      })
      .catch((err) => {
        if (err?.name !== "AbortError") console.error(err);
      })
      .finally(() => {
        if (isInitial) setLoading(false);
        setAppendLoading(false);
      });

    return () => ctrl.abort();
  }, [filterKey, page, filters]);

  const properties = useMemo(() => pages.flat(), [pages]);

  const updateFilters = useCallback(
    (patch: Partial<SearchFilters>) => {
      const next = { ...filters, ...patch, page: 1 };
      const params = buildSearchParams(next);
      router.replace(`/search${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [filters, router],
  );

  const resetFilters = useCallback(() => {
    setNlChips([]);
    router.replace("/search", { scroll: false });
  }, [router]);

  // Apply filters from the smart search bar, replacing current filter state
  // but preserving view + sort preferences.
  const applySmartFilters = useCallback(
    (patch: Partial<SearchFilters>) => {
      const next: Partial<SearchFilters> = {
        ...patch,
        view: filters.view ?? "grid",
        sort: filters.sort ?? "relevance",
        page: 1,
      };
      const params = buildSearchParams(next);
      router.replace(`/search${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [filters.view, filters.sort, router],
  );

  const dismissChip = useCallback(
    (filterKey: string) => {
      setNlChips((prev) => prev.filter((c) => c.filterKey !== filterKey));

      if (filterKey === "city") updateFilters({ city: undefined });
      else if (filterKey === "priceMax") updateFilters({ priceMax: undefined });
      else if (filterKey === "priceMin") updateFilters({ priceMin: undefined });
      else if (filterKey === "priceType") updateFilters({ priceType: undefined });
      else if (filterKey === "bedrooms") updateFilters({ bedrooms: undefined });
      else if (filterKey === "bathrooms") updateFilters({ bathrooms: undefined });
      else if (filterKey === "q") updateFilters({ q: undefined });
      else if (filterKey === "ageMax") updateFilters({ ageMax: undefined });
      else if (filterKey === "verified") updateFilters({ verified: undefined });
      else if (filterKey.startsWith("type:")) {
        const val = filterKey.slice(5);
        updateFilters({ type: (filters.type ?? []).filter((t) => t !== val) as SearchFilters["type"] });
      } else if (filterKey.startsWith("amenity:")) {
        const val = filterKey.slice(8);
        updateFilters({ amenities: (filters.amenities ?? []).filter((a) => a !== val) });
      } else if (filterKey.startsWith("furnishing:")) {
        const val = filterKey.slice(11);
        updateFilters({ furnishing: (filters.furnishing ?? []).filter((f) => f !== val) as SearchFilters["furnishing"] });
      }
    },
    [filters, updateFilters],
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (filters.view === "map") return;
    if (!hasMore || appendLoading || loading) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setPage((p) => p + 1);
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, appendLoading, loading, filters.view]);

  function toggleSet(set: Set<string>, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  const view: ViewMode = filters.view ?? "grid";
  const sort: Sort = filters.sort ?? "relevance";

  const sidebarContent = (
    <FiltersSidebar
      filters={filters}
      onChange={updateFilters}
      onReset={resetFilters}
    />
  );

  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[300px_1fr]">
      <ScrollArea className="hidden h-[calc(100vh-4rem)] sticky top-16 border-r border-border lg:block">
        <div className="p-5">{sidebarContent}</div>
      </ScrollArea>

      <div className="flex flex-col">
        <div className="sticky top-16 z-30 lg:hidden">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="m-3"
              >
                <SlidersHorizontal className="mr-2 size-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-5 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{sidebarContent}</div>
            </SheetContent>
          </Sheet>
        </div>

        <SmartSearchBar
          chips={nlChips}
          onChipsChange={setNlChips}
          onApplyFilters={applySmartFilters}
          onDismissChip={dismissChip}
        />

        <div className="sticky top-16 z-20 lg:top-16">
          <TopBar
            total={total}
            loading={loading}
            sort={sort}
            view={view}
            q={filters.q}
            city={filters.city}
            onSortChange={(s) => updateFilters({ sort: s })}
            onViewChange={(v) => updateFilters({ view: v })}
            onSearch={(q, city) => updateFilters({ q: q || undefined, city: city || undefined })}
          />
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" />
            Loading properties…
          </div>
        ) : properties.length === 0 ? (
          <NoResults
            onClearFilters={resetFilters}
            onPickCity={(city) => updateFilters({ city })}
          />
        ) : view === "map" ? (
          <div className="h-[calc(100vh-9rem)] w-full">
            <PropertyMap properties={properties} />
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-6">
            <div
              className={
                view === "list"
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              }
            >
              {properties.map((p) => (
                <PropertySearchCard
                  key={p.id}
                  property={p}
                  variant={view}
                  saved={saved.has(p.id)}
                  compared={compared.has(p.id)}
                  onToggleSave={(id) => setSaved((s) => toggleSet(s, id))}
                  onToggleCompare={(id) => setCompared((s) => toggleSet(s, id))}
                />
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="flex items-center justify-center py-10">
                {appendLoading && (
                  <span className="inline-flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Loading more…
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
