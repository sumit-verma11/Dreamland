"use client";

import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITY_DATA, type PostPropertyDraft } from "@/lib/post-property";

const DragMarkerMap = dynamic(
  () => import("@/components/post-property/drag-marker-map").then((m) => m.DragMarkerMap),
  { ssr: false, loading: () => <div className="h-56 w-full rounded-xl border border-border bg-muted/30 animate-pulse" /> },
);

type Props = {
  draft: PostPropertyDraft;
  onChange: (patch: Partial<PostPropertyDraft>) => void;
};

const DEFAULT_LAT = 20.5937;
const DEFAULT_LNG = 78.9629;

export function Step2Location({ draft, onChange }: Props) {
  const [citySuggestions, setCitySuggestions] = useState<typeof CITY_DATA>([]);
  const [localitySuggestions, setLocalitySuggestions] = useState<string[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [localityOpen, setLocalityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const localityRef = useRef<HTMLDivElement>(null);

  const selectedCity = CITY_DATA.find((c) => c.name === draft.city);
  const mapLat = draft.lat ?? selectedCity?.lat ?? DEFAULT_LAT;
  const mapLng = draft.lng ?? selectedCity?.lng ?? DEFAULT_LNG;

  function onCityInput(val: string) {
    onChange({ city: val, state: "", locality: "", lat: null, lng: null });
    if (val.length >= 1) {
      setCitySuggestions(
        CITY_DATA.filter((c) => c.name.toLowerCase().startsWith(val.toLowerCase())).slice(0, 6),
      );
      setCityOpen(true);
    } else {
      setCityOpen(false);
    }
  }

  function selectCity(city: (typeof CITY_DATA)[number]) {
    onChange({ city: city.name, state: city.state, locality: "", lat: city.lat, lng: city.lng });
    setCityOpen(false);
    setCitySuggestions([]);
  }

  function onLocalityInput(val: string) {
    onChange({ locality: val });
    const city = CITY_DATA.find((c) => c.name === draft.city);
    if (city && val.length >= 1) {
      setLocalitySuggestions(
        city.localities.filter((l) => l.toLowerCase().includes(val.toLowerCase())).slice(0, 6),
      );
      setLocalityOpen(true);
    } else {
      setLocalityOpen(false);
    }
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
      if (localityRef.current && !localityRef.current.contains(e.target as Node)) setLocalityOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* City */}
        <div ref={cityRef} className="relative">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={draft.city}
            onChange={(e) => onCityInput(e.target.value)}
            placeholder="e.g. Bengaluru"
            className="mt-1"
            autoComplete="off"
          />
          {cityOpen && citySuggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
              {citySuggestions.map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    onMouseDown={() => selectCity(c)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60"
                  >
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{c.state}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Locality */}
        <div ref={localityRef} className="relative">
          <Label htmlFor="locality">Locality / Area</Label>
          <Input
            id="locality"
            value={draft.locality}
            onChange={(e) => onLocalityInput(e.target.value)}
            placeholder="e.g. Indiranagar"
            className="mt-1"
            autoComplete="off"
            disabled={!draft.city}
          />
          {localityOpen && localitySuggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
              {localitySuggestions.map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    onMouseDown={() => { onChange({ locality: l }); setLocalityOpen(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/60"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <Label htmlFor="address">Full Address *</Label>
          <Input
            id="address"
            value={draft.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Building name, street, landmark..."
            className="mt-1"
          />
        </div>

        {/* State (auto-filled) */}
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={draft.state}
            onChange={(e) => onChange({ state: e.target.value })}
            placeholder="State"
            className="mt-1"
          />
        </div>

        {/* Pincode */}
        <div>
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            value={draft.pincode}
            onChange={(e) => onChange({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
            placeholder="6-digit pincode"
            inputMode="numeric"
            className="mt-1"
          />
        </div>
      </div>

      {/* Map */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Label>Pin Location on Map</Label>
          <span className="text-xs text-muted-foreground">(drag the marker for precise location)</span>
        </div>
        <DragMarkerMap
          lat={mapLat}
          lng={mapLng}
          onMove={(lat, lng) => onChange({ lat, lng })}
        />
        {draft.lat && (
          <p className="mt-1 text-xs text-muted-foreground">
            Coordinates: {draft.lat.toFixed(5)}, {draft.lng?.toFixed(5)}
          </p>
        )}
      </div>
    </div>
  );
}
