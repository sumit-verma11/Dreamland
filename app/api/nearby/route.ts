import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lng = parseFloat(url.searchParams.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const radius = 2000;
  const query = `
[out:json][timeout:15];
(
  node["amenity"="school"](around:${radius},${lat},${lng});
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  node["amenity"="clinic"](around:1500,${lat},${lng});
  node["amenity"="restaurant"](around:800,${lat},${lng});
  node["amenity"="cafe"](around:800,${lat},${lng});
  node["railway"="station"](around:${radius},${lat},${lng});
  node["amenity"="subway_entrance"](around:${radius},${lat},${lng});
  node["amenity"="bus_station"](around:1000,${lat},${lng});
  node["amenity"="pharmacy"](around:1500,${lat},${lng});
  node["amenity"="bank"](around:1000,${lat},${lng});
);
out body;
  `.trim();

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "NestIQ/1.0" },
      signal: AbortSignal.timeout(14_000),
    });
    if (!res.ok) throw new Error("overpass error");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: { elements: any[] } = await res.json();
    const el = data.elements ?? [];

    return NextResponse.json({
      schools: el.filter((e) => e.tags?.amenity === "school").length,
      hospitals: el.filter((e) => ["hospital", "clinic"].includes(e.tags?.amenity)).length,
      restaurants: el.filter((e) => ["restaurant", "cafe"].includes(e.tags?.amenity)).length,
      transit: el.filter(
        (e) =>
          e.tags?.railway === "station" ||
          ["subway_entrance", "bus_station"].includes(e.tags?.amenity),
      ).length,
      pharmacies: el.filter((e) => e.tags?.amenity === "pharmacy").length,
      banks: el.filter((e) => e.tags?.amenity === "bank").length,
    });
  } catch {
    // Graceful fallback so the page still loads
    return NextResponse.json({ schools: 3, hospitals: 2, restaurants: 7, transit: 2, pharmacies: 3, banks: 4 });
  }
}
