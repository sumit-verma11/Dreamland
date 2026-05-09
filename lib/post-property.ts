// Types and shared constants for the Post Property wizard

export type PostPropertyDraft = {
  // Step 1
  priceType: "SALE" | "RENT";
  propertyType: "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL" | "PG";

  // Step 2
  address: string;
  city: string;
  state: string;
  locality: string;
  pincode: string;
  lat: number | null;
  lng: number | null;

  // Step 3
  bedrooms: number;
  bathrooms: number;
  area: string;
  areaUnit: "SQFT" | "SQM" | "SQYD";
  floorNo: string;
  totalFloors: string;
  age: string;
  facing: string;
  parking: number;
  furnishing: "FURNISHED" | "SEMI" | "UNFURNISHED";

  // Step 4
  price: string;
  negotiable: boolean;
  maintenance: string;
  availableFrom: string;

  // Step 5
  amenities: string[];

  // Step 6
  media: MediaItem[];
  videoUrl: string;

  // Step 7
  title: string;
  description: string;
};

export type MediaItem = {
  url: string;
  publicId: string;
  type: "IMAGE" | "VIDEO";
  order: number;
  isCover: boolean;
};

export const DRAFT_KEY = "nestiq_post_property_draft";

export const INITIAL_DRAFT: PostPropertyDraft = {
  priceType: "SALE",
  propertyType: "APARTMENT",
  address: "",
  city: "",
  state: "",
  locality: "",
  pincode: "",
  lat: null,
  lng: null,
  bedrooms: 2,
  bathrooms: 2,
  area: "",
  areaUnit: "SQFT",
  floorNo: "",
  totalFloors: "",
  age: "",
  facing: "",
  parking: 1,
  furnishing: "UNFURNISHED",
  price: "",
  negotiable: false,
  maintenance: "",
  availableFrom: "",
  amenities: [],
  media: [],
  videoUrl: "",
  title: "",
  description: "",
};

export const CITY_DATA = [
  {
    name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946,
    localities: ["Indiranagar", "Koramangala", "Whitefield", "HSR Layout", "Jayanagar", "Hebbal", "Sarjapur", "Electronic City", "BTM Layout", "Marathahalli", "Bannerghatta Road", "Yelahanka"],
  },
  {
    name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777,
    localities: ["Bandra West", "Andheri West", "Powai", "Worli", "Lower Parel", "Goregaon", "Malad", "Juhu", "Thane", "Navi Mumbai", "Borivali", "Kandivali"],
  },
  {
    name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567,
    localities: ["Koregaon Park", "Baner", "Wakad", "Hinjewadi", "Viman Nagar", "Kothrud", "Aundh", "Pimpri", "Chinchwad", "Hadapsar", "Magarpatta", "Nagar Road"],
  },
  {
    name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867,
    localities: ["Madhapur", "Gachibowli", "Banjara Hills", "Kondapur", "Hitech City", "Jubilee Hills", "Kukatpally", "LB Nagar", "Miyapur", "Manikonda"],
  },
  {
    name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209,
    localities: ["Vasant Kunj", "Saket", "Dwarka", "Greater Kailash", "Hauz Khas", "Rohini", "Pitampura", "Janakpuri", "Lajpat Nagar", "South Extension"],
  },
  {
    name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266,
    localities: ["Sector 24", "Sector 49", "Golf Course Road", "DLF Phase 3", "Sushant Lok", "MG Road", "Sector 56", "Sector 14", "Palam Vihar", "Nirvana Country"],
  },
  {
    name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707,
    localities: ["ECR", "Velachery", "T Nagar", "Anna Nagar", "OMR", "Adyar", "Porur", "Perumbakkam", "Sholinganallur", "Nungambakkam"],
  },
  {
    name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639,
    localities: ["Park Street", "Salt Lake", "New Town", "Rajarhat", "Alipore", "Ballygunge", "Garia", "Dum Dum", "Howrah", "Belgharia"],
  },
  {
    name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391,
    localities: ["Sector 18", "Sector 62", "Sector 137", "Sector 150", "Greater Noida West", "Expressway", "Sector 44", "Sector 76", "Sector 100", "Sector 128"],
  },
  {
    name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714,
    localities: ["Prahlad Nagar", "SG Highway", "Vastrapur", "Satellite", "Bodakdev", "Maninagar", "Navrangpura", "Thaltej", "Bopal", "Chandkheda"],
  },
  {
    name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873,
    localities: ["Vaishali Nagar", "Malviya Nagar", "C-Scheme", "Bani Park", "Raja Park", "Jagatpura", "Tonk Road", "Ajmer Road", "Sodala", "Mansarovar"],
  },
  {
    name: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794,
    localities: ["Sector 17", "Sector 22", "Sector 35", "Sector 44", "Mohali", "Panchkula", "Zirakpur", "Kharar", "IT Park", "Industrial Area"],
  },
];

export type AmenityItem = {
  key: string;
  label: string;
  icon: string;
  category: string;
};

export const AMENITIES: AmenityItem[] = [
  { key: "Pool", label: "Swimming Pool", icon: "Waves", category: "Recreation" },
  { key: "Gym", label: "Gym / Fitness Centre", icon: "Dumbbell", category: "Recreation" },
  { key: "Clubhouse", label: "Clubhouse", icon: "Building2", category: "Recreation" },
  { key: "Jogging Track", label: "Jogging Track", icon: "PersonStanding", category: "Recreation" },
  { key: "Kids Play Area", label: "Kids Play Area", icon: "Baby", category: "Recreation" },
  { key: "Sports Court", label: "Sports Court", icon: "Trophy", category: "Recreation" },
  { key: "Yoga Room", label: "Yoga / Meditation Room", icon: "Wind", category: "Recreation" },
  { key: "Party Hall", label: "Party / Banquet Hall", icon: "PartyPopper", category: "Recreation" },

  { key: "Parking", label: "Covered Parking", icon: "Car", category: "Convenience" },
  { key: "Visitor Parking", label: "Visitor Parking", icon: "ParkingCircle", category: "Convenience" },
  { key: "Lift", label: "Elevator / Lift", icon: "ArrowUpDown", category: "Convenience" },
  { key: "Gas Pipeline", label: "Gas Pipeline", icon: "Flame", category: "Convenience" },
  { key: "Intercom", label: "Intercom / Video Door", icon: "Phone", category: "Convenience" },
  { key: "Servant Room", label: "Servant / Staff Room", icon: "Home", category: "Convenience" },
  { key: "Store Room", label: "Storage / Store Room", icon: "Archive", category: "Convenience" },
  { key: "Terrace", label: "Private Terrace", icon: "Sun", category: "Convenience" },

  { key: "Security", label: "24/7 Security", icon: "Shield", category: "Safety" },
  { key: "CCTV", label: "CCTV Surveillance", icon: "Video", category: "Safety" },
  { key: "Fire Safety", label: "Fire Safety System", icon: "FlameKindling", category: "Safety" },
  { key: "Gated Community", label: "Gated Community", icon: "Lock", category: "Safety" },

  { key: "Power Backup", label: "Power Backup", icon: "Zap", category: "Infrastructure" },
  { key: "Water Supply", label: "24/7 Water Supply", icon: "Droplets", category: "Infrastructure" },
  { key: "Rainwater Harvesting", label: "Rainwater Harvesting", icon: "CloudRain", category: "Infrastructure" },
  { key: "Solar Panels", label: "Solar Panels", icon: "Sun", category: "Infrastructure" },
  { key: "EV Charging", label: "EV Charging Station", icon: "BatteryCharging", category: "Infrastructure" },
  { key: "High Speed Internet", label: "High Speed Internet", icon: "Wifi", category: "Infrastructure" },

  { key: "Garden", label: "Garden / Landscaping", icon: "Leaf", category: "Green" },
  { key: "Pet Friendly", label: "Pet Friendly", icon: "PawPrint", category: "Lifestyle" },
  { key: "Concierge", label: "Concierge Service", icon: "BellRing", category: "Lifestyle" },
  { key: "Maintenance Staff", label: "In-house Maintenance", icon: "Wrench", category: "Lifestyle" },
];

export const FACING_OPTIONS = [
  "North", "South", "East", "West",
  "North-East", "North-West", "South-East", "South-West",
];

export const STEPS = [
  { number: 1, title: "Property Type", desc: "What are you listing?" },
  { number: 2, title: "Location", desc: "Where is the property?" },
  { number: 3, title: "Details", desc: "Specs and features" },
  { number: 4, title: "Pricing", desc: "Set your price" },
  { number: 5, title: "Amenities", desc: "What's available?" },
  { number: 6, title: "Photos", desc: "Add images and video" },
  { number: 7, title: "Description", desc: "Tell buyers more" },
  { number: 8, title: "Review", desc: "Preview and submit" },
];

function ordinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

export function generateDescription(draft: PostPropertyDraft): string {
  const typeLabel: Record<string, string> = {
    APARTMENT: "apartment", VILLA: "villa", PLOT: "plot", COMMERCIAL: "commercial space", PG: "PG accommodation",
  };
  const furnLabel: Record<string, string> = {
    FURNISHED: "fully furnished", SEMI: "semi-furnished", UNFURNISHED: "unfurnished",
  };

  const type = typeLabel[draft.propertyType] ?? "property";
  const furn = furnLabel[draft.furnishing] ?? "unfurnished";
  const purpose = draft.priceType === "RENT" ? "for rent" : "for sale";
  const bedsText = draft.bedrooms > 0 ? `${draft.bedrooms} BHK ` : "";
  const locationStr = [draft.locality, draft.city].filter(Boolean).join(", ") || "a prime location";

  const ageNum = parseInt(draft.age || "0");
  const ageNote =
    isNaN(ageNum) || ageNum === 0 ? " brand-new" :
    ageNum <= 2 ? " recently constructed" :
    ageNum <= 5 ? "" :
    " well-established";

  const floorNum = parseInt(draft.floorNo || "");
  const totalNum = parseInt(draft.totalFloors || "");
  const floorNote = !isNaN(floorNum) && floorNum > 0
    ? `, situated on the ${floorNum}${ordinalSuffix(floorNum)} floor${!isNaN(totalNum) && totalNum > 0 ? ` of a ${totalNum}-storey building` : ""}`
    : "";

  const facingNote = draft.facing ? ` The ${draft.facing}-facing layout ensures ample natural light throughout the day.` : "";
  const parkingNote = draft.parking > 0 ? ` ${draft.parking} dedicated parking ${draft.parking > 1 ? "spots are" : "spot is"} included.` : "";

  const topAmenities = draft.amenities.slice(0, 5);
  const amenityNote = topAmenities.length > 0
    ? `\n\nResidents enjoy access to premium society amenities including ${topAmenities.join(", ")}${draft.amenities.length > 5 ? ` and ${draft.amenities.length - 5} more` : ""}.`
    : "";

  const closingNote = draft.priceType === "RENT"
    ? `\n\nAn excellent choice for working professionals and families seeking quality living in ${draft.city || "the city"}. Reach out today to schedule a visit!`
    : `\n\nThis is a strong investment opportunity in ${draft.city || "the city"}'s growing property market. Contact us now to arrange a site visit!`;

  const areaText = draft.area ? `Spanning ${draft.area} ${draft.areaUnit.toLowerCase()}` : "Generously sized";
  const bathText = draft.bathrooms > 0 ? `${draft.bathrooms} bathroom${draft.bathrooms > 1 ? "s" : ""}` : "";
  const bedsFullText = draft.bedrooms > 0 ? `${draft.bedrooms} bedroom${draft.bedrooms > 1 ? "s" : ""} and ${bathText}` : bathText;

  return `Presenting a${ageNote} ${furn} ${bedsText}${type} ${purpose} in ${locationStr}${floorNote}. ${areaText}${bedsFullText ? `, this property offers ${bedsFullText}` : ""} along with a thoughtful layout designed for modern living.${facingNote}${parkingNote}${amenityNote}${closingNote}`;
}

export function validateStep(step: number, draft: PostPropertyDraft): string | null {
  switch (step) {
    case 2:
      if (!draft.city) return "Please select a city";
      if (!draft.address.trim()) return "Please enter the property address";
      if (draft.pincode && !/^\d{6}$/.test(draft.pincode)) return "Pincode must be 6 digits";
      return null;
    case 3:
      if (!draft.area.trim() || isNaN(parseFloat(draft.area))) return "Please enter the property area";
      return null;
    case 4:
      if (!draft.price.trim() || isNaN(parseFloat(draft.price))) return "Please enter the property price";
      return null;
    case 7:
      if (!draft.title.trim() || draft.title.length < 10) return "Title must be at least 10 characters";
      if (!draft.description.trim() || draft.description.length < 50) return "Description must be at least 50 characters";
      return null;
    default:
      return null;
  }
}
