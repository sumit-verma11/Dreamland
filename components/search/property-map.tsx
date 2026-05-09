"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { PropertySearchCard } from "@/components/search/property-search-card";
import { formatPrice } from "@/lib/format";
import type { SearchProperty } from "@/lib/property-search";

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function priceIcon(label: string, active: boolean) {
  return L.divIcon({
    className: "nestiq-price-pin",
    html: `<div class="${
      "rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg ring-1 transition " +
      (active
        ? "bg-emerald-500 text-white ring-emerald-300"
        : "bg-slate-950 text-emerald-300 ring-white/40 hover:bg-slate-800")
    }">${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function ClusterGroup({
  properties,
  selectedId,
  onSelect,
}: {
  properties: SearchProperty[];
  selectedId: string | null;
  onSelect: (p: SearchProperty) => void;
}) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
    });
    map.addLayer(group);
    groupRef.current = group;
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    const bounds: L.LatLngTuple[] = [];

    for (const p of properties) {
      if (p.lat == null || p.lng == null) continue;
      const marker = L.marker([p.lat, p.lng], {
        icon: priceIcon(formatPrice(p.price, p.priceType), p.id === selectedId),
      });
      marker.on("click", () => onSelect(p));
      group.addLayer(marker);
      bounds.push([p.lat, p.lng]);
    }

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds).pad(0.2), { animate: false });
    }
  }, [map, properties, selectedId, onSelect]);

  return null;
}

export default function PropertyMap({ properties }: { properties: SearchProperty[] }) {
  const [selected, setSelected] = useState<SearchProperty | null>(null);

  const center = useMemo<[number, number]>(() => {
    const located = properties.filter((p) => p.lat != null && p.lng != null);
    if (located.length === 0) return DEFAULT_CENTER;
    const lat =
      located.reduce((sum, p) => sum + (p.lat ?? 0), 0) / located.length;
    const lng =
      located.reduce((sum, p) => sum + (p.lng ?? 0), 0) / located.length;
    return [lat, lng];
  }, [properties]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClusterGroup
          properties={properties}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
        {selected && selected.lat != null && selected.lng != null && (
          <Marker
            position={[selected.lat, selected.lng]}
            icon={priceIcon(formatPrice(selected.price, selected.priceType), true)}
            eventHandlers={{ click: () => setSelected(selected) }}
          >
            <Popup
              minWidth={280}
              maxWidth={320}
              closeOnClick={false}
              eventHandlers={{ remove: () => setSelected(null) }}
            >
              <div className="-m-3 w-72">
                <PropertySearchCard property={selected} />
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
