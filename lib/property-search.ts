import type { Furnishing, PropertyType, Role } from "@prisma/client";
import { z } from "zod";

export const SORTS = ["relevance", "price-asc", "newest", "views"] as const;
export type Sort = (typeof SORTS)[number];

export const VIEWS = ["grid", "list", "map"] as const;
export type ViewMode = (typeof VIEWS)[number];

export const PROPERTY_TYPES: PropertyType[] = ["APARTMENT", "VILLA", "PLOT", "COMMERCIAL", "PG"];
export const FURNISHINGS: Furnishing[] = ["FURNISHED", "SEMI", "UNFURNISHED"];
export const POSTED_BY_LABELS: Record<"OWNER" | "AGENT" | "BUILDER", { label: string; role: Role }> = {
  OWNER: { label: "Owner", role: "SELLER" },
  AGENT: { label: "Agent", role: "AGENT" },
  BUILDER: { label: "Builder", role: "ADMIN" },
};
export type PostedBy = keyof typeof POSTED_BY_LABELS;

export const FACINGS = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

export const AMENITIES = [
  "Pool",
  "Gym",
  "Parking",
  "Security",
  "Garden",
  "Lift",
  "Power Backup",
  "Clubhouse",
  "Kids Play Area",
  "Jogging Track",
  "CCTV",
  "Pet Friendly",
];

export const PRICE_BOUNDS = { min: 0, max: 200_000_000 };
export const AREA_BOUNDS = { min: 0, max: 6000 };
export const AGE_BOUNDS = { min: 0, max: 50 };

export const PAGE_SIZE = 12;

const csv = (val: string) => val.split(",").map((s) => s.trim()).filter(Boolean);

export const filtersSchema = z
  .object({
    q: z.string().trim().optional(),
    city: z.string().trim().optional(),
    priceType: z.enum(["SALE", "RENT"]).optional(),
    type: z
      .string()
      .transform(csv)
      .pipe(z.array(z.enum(["APARTMENT", "VILLA", "PLOT", "COMMERCIAL", "PG"])))
      .optional(),
    priceMin: z.coerce.number().int().nonnegative().optional(),
    priceMax: z.coerce.number().int().positive().optional(),
    areaMin: z.coerce.number().nonnegative().optional(),
    areaMax: z.coerce.number().positive().optional(),
    bedrooms: z
      .string()
      .transform(csv)
      .pipe(z.array(z.coerce.number().int().min(0).max(10)))
      .optional(),
    bathrooms: z
      .string()
      .transform(csv)
      .pipe(z.array(z.coerce.number().int().min(0).max(10)))
      .optional(),
    furnishing: z
      .string()
      .transform(csv)
      .pipe(z.array(z.enum(["FURNISHED", "SEMI", "UNFURNISHED"])))
      .optional(),
    postedBy: z
      .string()
      .transform(csv)
      .pipe(z.array(z.enum(["OWNER", "AGENT", "BUILDER"])))
      .optional(),
    amenities: z.string().transform(csv).pipe(z.array(z.string())).optional(),
    ageMax: z.coerce.number().int().nonnegative().optional(),
    facing: z.string().transform(csv).pipe(z.array(z.string())).optional(),
    verified: z
      .union([z.literal("1"), z.literal("0"), z.boolean()])
      .transform((v) => v === true || v === "1")
      .optional(),
    sort: z.enum(SORTS).default("relevance"),
    view: z.enum(VIEWS).default("grid"),
    page: z.coerce.number().int().min(1).default(1),
  })
  .partial({ sort: true, view: true, page: true });

export type SearchFilters = z.infer<typeof filtersSchema>;

export type SearchProperty = {
  id: string;
  title: string;
  city: string;
  state: string;
  locality: string;
  price: number;
  priceType: "SALE" | "RENT";
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  amenities: string[];
  furnishing: Furnishing;
  facing: string | null;
  age: number | null;
  parking: number;
  status: string;
  verified: boolean;
  featured: boolean;
  views: number;
  lat: number | null;
  lng: number | null;
  images: string[];
  postedBy: "OWNER" | "AGENT" | "BUILDER";
  matchScore: number;
};

export type SearchResponse = {
  properties: SearchProperty[];
  total: number;
  page: number;
  hasMore: boolean;
};

// Stable synthetic match score in [72, 99] derived from property id.
export function matchScoreFor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return 72 + (Math.abs(h) % 28);
}

export function roleToPostedBy(role: Role): "OWNER" | "AGENT" | "BUILDER" {
  if (role === "AGENT") return "AGENT";
  if (role === "ADMIN") return "BUILDER";
  return "OWNER";
}

export function buildSearchParams(filters: Partial<SearchFilters>): URLSearchParams {
  const params = new URLSearchParams();
  const set = (k: string, v: string | undefined | null) => {
    if (v && v.length) params.set(k, v);
  };
  set("q", filters.q);
  set("city", filters.city);
  if (filters.priceType) set("priceType", filters.priceType);
  if (filters.type?.length) set("type", filters.type.join(","));
  if (filters.priceMin != null) set("priceMin", String(filters.priceMin));
  if (filters.priceMax != null) set("priceMax", String(filters.priceMax));
  if (filters.areaMin != null) set("areaMin", String(filters.areaMin));
  if (filters.areaMax != null) set("areaMax", String(filters.areaMax));
  if (filters.bedrooms?.length) set("bedrooms", filters.bedrooms.join(","));
  if (filters.bathrooms?.length) set("bathrooms", filters.bathrooms.join(","));
  if (filters.furnishing?.length) set("furnishing", filters.furnishing.join(","));
  if (filters.postedBy?.length) set("postedBy", filters.postedBy.join(","));
  if (filters.amenities?.length) set("amenities", filters.amenities.join(","));
  if (filters.ageMax != null) set("ageMax", String(filters.ageMax));
  if (filters.facing?.length) set("facing", filters.facing.join(","));
  if (filters.verified) set("verified", "1");
  if (filters.sort && filters.sort !== "relevance") set("sort", filters.sort);
  if (filters.view && filters.view !== "grid") set("view", filters.view);
  if (filters.page && filters.page > 1) set("page", String(filters.page));
  return params;
}

export const DEFAULT_FILTERS: SearchFilters = {
  sort: "relevance",
  view: "grid",
  page: 1,
};
