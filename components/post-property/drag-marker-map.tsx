"use client";

import { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lng: number;
  onMove: (lat: number, lng: number) => void;
};

export function DragMarkerMap({ lat, lng, onMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);
  const markerRef = useRef<ReturnType<typeof import("leaflet")["marker"]> | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Leaflet is assumed to be already loaded from property-leaflet-map usage
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    // Fix default icon paths
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: false }).setView(
      [lat, lng],
      14,
    );

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onMove(pos.lat, pos.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan/move marker when lat/lng props change externally (city selection)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const pos: [number, number] = [lat, lng];
    markerRef.current.setLatLng(pos);
    mapRef.current.setView(pos, 14, { animate: true });
  }, [lat, lng]);

  return (
    <div ref={containerRef} className="h-56 w-full rounded-xl border border-border" />
  );
}
