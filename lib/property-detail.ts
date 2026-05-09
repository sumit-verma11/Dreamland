// Shared types for the property detail page (M7).

export type SellerInfo = {
  id: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  verified: boolean;
};

export type PropertyMedia = {
  id: string;
  url: string;
  type: string;
  order: number;
};

export type ReviewWithUser = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null };
};

export type PriceHistoryPoint = {
  id: string;
  price: number;
  recordedAt: string;
};

export type PropertyDetailData = {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  amenities: string[];
  furnishing: string;
  facing: string | null;
  floorNo: number | null;
  totalFloors: number | null;
  age: number | null;
  parking: number;
  status: string;
  verified: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
  seller: SellerInfo;
  media: PropertyMedia[];
  reviews: ReviewWithUser[];
  priceHistory: PriceHistoryPoint[];
  favoriteCount: number;
  reviewCount: number;
};

export type PropertyStats = {
  avgPricePerSqft: number;
  fairValue: number;
  comparableCount: number;
};

export type SimilarPropertyItem = {
  id: string;
  title: string;
  price: number;
  priceType: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  propertyType: string;
  verified: boolean;
  matchScore: number;
  coverImage: string | null;
};
