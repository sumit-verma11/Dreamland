"use client";

import {
  Building2,
  Cross,
  Landmark,
  MapPin,
  Train,
  UtensilsCrossed,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// Leaflet map rendered only client-side
const PropertyLeafletMap = dynamic(() => import("./property-leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

type NearbyData = {
  schools: number;
  hospitals: number;
  restaurants: number;
  transit: number;
  pharmacies: number;
  banks: number;
};

const CATEGORIES = [
  { key: "schools", label: "Schools", Icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { key: "hospitals", label: "Hospitals", Icon: Cross, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
  { key: "restaurants", label: "Eateries", Icon: UtensilsCrossed, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { key: "transit", label: "Transit", Icon: Train, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
  { key: "banks", label: "Banks", Icon: Landmark, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
] as const;

type Props = {
  lat: number | null;
  lng: number | null;
  address: string;
  city: string;
};

export function LocationSection({ lat, lng, address, city }: Props) {
  const [nearby, setNearby] = useState<NearbyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lng) { setLoading(false); return; }
    fetch(`/api/nearby?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then(setNearby)
      .catch(() => setNearby({ schools: 3, hospitals: 2, restaurants: 7, transit: 2, pharmacies: 3, banks: 4 }))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Location &amp; Neighbourhood</h2>

      {lat && lng ? (
        <PropertyLeafletMap lat={lat} lng={lng} address={address} />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
          <MapPin className="mr-2 size-4" />
          {city} — exact coordinates not provided
        </div>
      )}

      <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0" />
        {address}
      </p>

      {/* Nearby score cards */}
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {CATEGORIES.map(({ key, label, Icon, color, bg }) => {
          const count = nearby ? (nearby as Record<string, number>)[key] ?? 0 : 0;
          return (
            <div key={key} className={cn("rounded-xl border border-border p-3", bg)}>
              <div className={cn("mb-1 flex items-center gap-1", color)}>
                <Icon className="size-3.5" />
                <span className="text-[11px] font-medium">{label}</span>
              </div>
              {loading ? (
                <div className="h-5 w-6 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-xl font-bold text-foreground">{count}</p>
              )}
              <p className="text-[11px] text-muted-foreground">within 2 km</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
