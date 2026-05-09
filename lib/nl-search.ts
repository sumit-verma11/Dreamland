import type { Furnishing, PropertyType } from "@prisma/client";

import type { SearchFilters } from "./property-search";

export type NlChip = {
  label: string;
  filterKey: string;
};

export type NlSearchResult = {
  filters: Partial<SearchFilters>;
  chips: NlChip[];
};

const CITIES = [
  "navi mumbai", "greater noida",
  "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "chennai",
  "kolkata", "pune", "ahmedabad", "patna", "jaipur", "lucknow", "noida",
  "gurgaon", "gurugram", "surat", "nagpur", "bhopal", "indore",
  "chandigarh", "vadodara", "agra", "coimbatore", "visakhapatnam",
  "vijayawada", "kochi", "thiruvananthapuram", "mysore", "mangalore",
  "nashik", "thane", "faridabad", "ghaziabad", "meerut", "varanasi",
  "prayagraj", "dehradun", "ranchi", "raipur", "amritsar", "ludhiana",
  "jodhpur", "udaipur", "srinagar", "jammu",
];

const CITY_ALIASES: Record<string, string> = {
  bengaluru: "Bangalore",
  gurugram: "Gurgaon",
};

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPriceLabel(price: number): string {
  if (price >= 10_000_000) {
    const v = price / 10_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}Cr`;
  }
  if (price >= 100_000) {
    const v = price / 100_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}L`;
  }
  if (price >= 1_000) return `${price / 1_000}K`;
  return String(price);
}

function parsePrice(num: string, unitStr: string): number {
  const n = parseFloat(num);
  const u = unitStr.toLowerCase();
  if (/cr/.test(u)) return Math.round(n * 10_000_000);
  if (/k/.test(u)) return Math.round(n * 1_000);
  return Math.round(n * 100_000); // lakhs default
}

export function parseNaturalLanguage(query: string): NlSearchResult {
  const filters: Partial<SearchFilters> = {};
  const chips: NlChip[] = [];
  let rem = query.toLowerCase();

  function consume(pattern: RegExp) {
    rem = rem.replace(pattern, " ");
  }

  // ── Price type ───────────────────────────────────────────────────────────
  if (/\b(for rent|on rent|rental|to rent)\b/.test(rem)) {
    filters.priceType = "RENT";
    chips.push({ label: "For Rent", filterKey: "priceType" });
    consume(/\b(for rent|on rent|rental|to rent)\b/g);
  } else if (/\b(for sale|to buy|purchase)\b/.test(rem)) {
    filters.priceType = "SALE";
    chips.push({ label: "For Sale", filterKey: "priceType" });
    consume(/\b(for sale|to buy|purchase)\b/g);
  }

  // ── Bedrooms ─────────────────────────────────────────────────────────────
  const rangeMatch = rem.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:bhk|bedroom|bed)\b/i);
  if (rangeMatch) {
    const from = parseInt(rangeMatch[1]);
    const to = parseInt(rangeMatch[2]);
    filters.bedrooms = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    chips.push({ label: `${from}–${to} BHK`, filterKey: "bedrooms" });
    consume(new RegExp(rangeMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  } else {
    const bedMatch = rem.match(/(\d+)\s*(?:bhk|bedroom|bed)\b/i);
    if (bedMatch) {
      filters.bedrooms = [parseInt(bedMatch[1])];
      chips.push({ label: `${bedMatch[1]} BHK`, filterKey: "bedrooms" });
      consume(new RegExp(bedMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    } else if (/\bstudio\b/.test(rem)) {
      filters.bedrooms = [0];
      chips.push({ label: "Studio", filterKey: "bedrooms" });
      consume(/\bstudio\b/g);
    }
  }

  // ── Max price ─────────────────────────────────────────────────────────────
  const priceNum = "\\d+(?:\\.\\d+)?";
  const priceUnit = "(?:lakhs?|lakh|crores?|crore|cr|k)";
  const maxRe = new RegExp(
    `(?:under|below|max|upto|up to|less than|within)[\\s₹]*(${priceNum})\\s*(${priceUnit})`,
    "i",
  );
  const maxMatch = rem.match(maxRe);
  if (maxMatch) {
    const price = parsePrice(maxMatch[1], maxMatch[2]);
    filters.priceMax = price;
    chips.push({ label: `Under ₹${formatPriceLabel(price)}`, filterKey: "priceMax" });
    consume(new RegExp(maxMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }

  // ── Min price ─────────────────────────────────────────────────────────────
  const minRe = new RegExp(
    `(?:above|over|min|minimum|atleast|at least|more than|starting)[\\s₹]*(${priceNum})\\s*(${priceUnit})`,
    "i",
  );
  const minMatch = rem.match(minRe);
  if (minMatch) {
    const price = parsePrice(minMatch[1], minMatch[2]);
    filters.priceMin = price;
    chips.push({ label: `Above ₹${formatPriceLabel(price)}`, filterKey: "priceMin" });
    consume(new RegExp(minMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }

  // ── Property type ─────────────────────────────────────────────────────────
  const typeMap: [RegExp, PropertyType, string][] = [
    [/\b(flat|apartment|appartment)\b/g, "APARTMENT", "Apartment"],
    [/\b(villa|bungalow|independent house|row house)\b/g, "VILLA", "Villa"],
    [/\b(plot|land|site)\b/g, "PLOT", "Plot"],
    [/\b(commercial|office|shop|showroom|warehouse)\b/g, "COMMERCIAL", "Commercial"],
    [/\b(pg|paying guest|hostel|room for rent)\b/g, "PG", "PG"],
  ];
  for (const [pattern, val, label] of typeMap) {
    if (pattern.test(rem)) {
      filters.type = [val];
      chips.push({ label, filterKey: `type:${val}` });
      consume(pattern);
      break;
    }
  }

  // ── Furnishing ────────────────────────────────────────────────────────────
  if (/\bsemi[- ]?furnished\b/.test(rem)) {
    filters.furnishing = ["SEMI" as Furnishing];
    chips.push({ label: "Semi-furnished", filterKey: "furnishing:SEMI" });
    consume(/\bsemi[- ]?furnished\b/g);
  } else if (/\bfurnished\b/.test(rem)) {
    filters.furnishing = ["FURNISHED" as Furnishing];
    chips.push({ label: "Furnished", filterKey: "furnishing:FURNISHED" });
    consume(/\bfurnished\b/g);
  } else if (/\b(unfurnished|bare shell)\b/.test(rem)) {
    filters.furnishing = ["UNFURNISHED" as Furnishing];
    chips.push({ label: "Unfurnished", filterKey: "furnishing:UNFURNISHED" });
    consume(/\b(unfurnished|bare shell)\b/g);
  }

  // ── Amenities ─────────────────────────────────────────────────────────────
  const amenityMap: [RegExp, string][] = [
    [/\b(parking|car park|car parking)\b/g, "Parking"],
    [/\b(gym|fitness centre|fitness center)\b/g, "Gym"],
    [/\b(pool|swimming pool|swimming)\b/g, "Pool"],
    [/\b(security|gated community|security guard)\b/g, "Security"],
    [/\b(garden|landscaped)\b/g, "Garden"],
    [/\b(lift|elevator)\b/g, "Lift"],
    [/\b(power backup|generator|backup power)\b/g, "Power Backup"],
    [/\b(clubhouse|club house)\b/g, "Clubhouse"],
    [/\b(cctv|surveillance camera)\b/g, "CCTV"],
    [/\b(pet friendly|pets allowed)\b/g, "Pet Friendly"],
    [/\b(kids play area|play area|playground|children play)\b/g, "Kids Play Area"],
    [/\b(jogging track|running track)\b/g, "Jogging Track"],
  ];
  const foundAmenities: string[] = [];
  for (const [pattern, name] of amenityMap) {
    if (pattern.test(rem)) {
      foundAmenities.push(name);
      chips.push({ label: name, filterKey: `amenity:${name}` });
      consume(pattern);
    }
  }
  if (foundAmenities.length) filters.amenities = foundAmenities;

  // ── Verified ──────────────────────────────────────────────────────────────
  if (/\b(verified|genuine|authentic listing)\b/.test(rem)) {
    filters.verified = true;
    chips.push({ label: "Verified", filterKey: "verified" });
    consume(/\b(verified|genuine|authentic listing)\b/g);
  }

  // ── City (longest match first) ────────────────────────────────────────────
  for (const city of CITIES) {
    if (new RegExp(`\\b${city}\\b`, "i").test(rem)) {
      const display = CITY_ALIASES[city] ?? titleCase(city);
      filters.city = display;
      chips.push({ label: display, filterKey: "city" });
      consume(new RegExp(`\\b${city}\\b`, "gi"));
      break;
    }
  }

  // ── Remaining keywords → q ────────────────────────────────────────────────
  const stopWords =
    /\b(in|near|with|and|or|a|an|the|for|of|to|at|on|by|from|under|above|per|having|want|need|looking|search)\b/gi;
  const cleaned = rem
    .replace(stopWords, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (cleaned.length > 2) {
    filters.q = cleaned;
    chips.push({ label: `"${cleaned}"`, filterKey: "q" });
  }

  return { filters, chips };
}
