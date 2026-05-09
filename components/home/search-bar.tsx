"use client";

import { Check, ChevronDown, MapPin, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { POPULAR_CITIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "buy", label: "Buy", priceType: "SALE", type: "" },
  { value: "rent", label: "Rent", priceType: "RENT", type: "" },
  { value: "pg", label: "PG / Co-living", priceType: "RENT", type: "PG" },
] as const;

const PROPERTY_TYPES = [
  { value: "any", label: "Any property" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "commercial", label: "Commercial" },
];

export function SearchBar() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("buy");
  const [city, setCity] = useState<string>("");
  const [cityOpen, setCityOpen] = useState(false);
  const [propertyType, setPropertyType] = useState("any");
  const [aiSearch, setAiSearch] = useState(true);

  function search() {
    const active = TABS.find((t) => t.value === tab)!;
    const params = new URLSearchParams();
    params.set("priceType", active.priceType);
    if (active.type) params.set("type", active.type);
    else if (propertyType !== "any") params.set("type", propertyType.toUpperCase());
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.04]">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-3 bg-white/[0.06] text-white/80">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-3 grid gap-2 lg:grid-cols-[1.4fr_1fr_auto_auto]">
        <Popover open={cityOpen} onOpenChange={setCityOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex h-12 w-full items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-left text-sm text-white outline-none ring-offset-2 ring-offset-slate-950 hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-emerald-400"
              type="button"
            >
              <MapPin className="size-4 shrink-0 text-white/60" />
              <span className={cn("flex-1 truncate", !city && "text-white/50")}>
                {city || "Where are you looking?"}
              </span>
              <ChevronDown className="size-4 text-white/60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search city or neighbourhood…" />
              <CommandList>
                <CommandEmpty>No matches.</CommandEmpty>
                <CommandGroup heading="Popular cities">
                  {POPULAR_CITIES.map((c) => (
                    <CommandItem
                      key={c}
                      value={c}
                      onSelect={() => {
                        setCity(c);
                        setCityOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          city === c ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {c}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="h-12 border-0 bg-white/[0.06] text-white hover:bg-white/[0.09] focus:ring-emerald-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl bg-white/[0.06] px-4 text-sm text-white hover:bg-white/[0.09]">
          <Sparkles className={cn("size-4", aiSearch ? "text-emerald-400" : "text-white/60")} />
          <span className="font-medium">AI Search</span>
          <Switch
            checked={aiSearch}
            onCheckedChange={setAiSearch}
            className="data-[state=checked]:bg-emerald-500"
          />
        </label>

        <Button
          onClick={search}
          className="h-12 bg-emerald-500 px-5 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
        >
          <Search className="mr-2 size-4" />
          Search
        </Button>
      </div>

      <p className="mt-3 px-1 text-xs text-white/60">
        Tip: try natural prompts like “3BHK near a metro under ₹2Cr in Bengaluru”
      </p>
    </div>
  );
}
