export type FeaturedProperty = {
  id: string;
  title: string;
  city: string;
  locality: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  matchScore: number;
  imageSeed: string;
  badge?: "NEW" | "HOT" | "VERIFIED";
};

export type City = {
  name: string;
  state: string;
  count: number;
  imageSeed: string;
};

export type AiFeature = {
  title: string;
  description: string;
  icon: "Sparkles" | "Wand2" | "View";
  accent: string;
};

export type NewProject = {
  id: string;
  builder: string;
  builderInitial: string;
  name: string;
  city: string;
  status: "NEW LAUNCH" | "COMING SOON" | "READY TO MOVE";
  priceRange: string;
};

export type Testimonial = {
  id: string;
  name: string;
  city: string;
  rating: number;
  quote: string;
  avatarSeed: string;
};

export const FEATURED_PROPERTIES: FeaturedProperty[] = [
  {
    id: "p1",
    title: "Sunlit 3BHK with skyline view",
    city: "Bengaluru",
    locality: "Indiranagar",
    price: "₹1.85 Cr",
    beds: 3,
    baths: 3,
    area: "1,820 sqft",
    matchScore: 96,
    imageSeed: "nestiq-bengaluru-1",
    badge: "HOT",
  },
  {
    id: "p2",
    title: "Contemporary villa near Koregaon Park",
    city: "Pune",
    locality: "Koregaon Park",
    price: "₹4.20 Cr",
    beds: 4,
    baths: 5,
    area: "3,400 sqft",
    matchScore: 93,
    imageSeed: "nestiq-pune-1",
    badge: "VERIFIED",
  },
  {
    id: "p3",
    title: "Sea-facing apartment, walk to promenade",
    city: "Mumbai",
    locality: "Bandra West",
    price: "₹6.75 Cr",
    beds: 3,
    baths: 4,
    area: "2,100 sqft",
    matchScore: 91,
    imageSeed: "nestiq-mumbai-1",
  },
  {
    id: "p4",
    title: "Modern studio in HiTech City",
    city: "Hyderabad",
    locality: "Madhapur",
    price: "₹62 L",
    beds: 1,
    baths: 1,
    area: "640 sqft",
    matchScore: 89,
    imageSeed: "nestiq-hyderabad-1",
    badge: "NEW",
  },
  {
    id: "p5",
    title: "Plotted villa with private garden",
    city: "Chennai",
    locality: "ECR",
    price: "₹2.95 Cr",
    beds: 4,
    baths: 4,
    area: "2,800 sqft",
    matchScore: 88,
    imageSeed: "nestiq-chennai-1",
  },
  {
    id: "p6",
    title: "Smart home in DLF Cyber City",
    city: "Gurugram",
    locality: "Sector 24",
    price: "₹3.40 Cr",
    beds: 4,
    baths: 4,
    area: "2,450 sqft",
    matchScore: 95,
    imageSeed: "nestiq-gurugram-1",
    badge: "HOT",
  },
  {
    id: "p7",
    title: "Penthouse with rooftop terrace",
    city: "Delhi",
    locality: "Vasant Kunj",
    price: "₹8.10 Cr",
    beds: 5,
    baths: 6,
    area: "4,500 sqft",
    matchScore: 92,
    imageSeed: "nestiq-delhi-1",
    badge: "VERIFIED",
  },
];

export const TRENDING_CITIES: City[] = [
  { name: "Bengaluru", state: "Karnataka", count: 12450, imageSeed: "city-blr" },
  { name: "Mumbai", state: "Maharashtra", count: 9820, imageSeed: "city-bom" },
  { name: "Pune", state: "Maharashtra", count: 7610, imageSeed: "city-pnq" },
  { name: "Hyderabad", state: "Telangana", count: 6840, imageSeed: "city-hyd" },
  { name: "Delhi", state: "Delhi", count: 8120, imageSeed: "city-del" },
  { name: "Gurugram", state: "Haryana", count: 5320, imageSeed: "city-ggn" },
  { name: "Chennai", state: "Tamil Nadu", count: 4980, imageSeed: "city-maa" },
  { name: "Kolkata", state: "West Bengal", count: 3210, imageSeed: "city-ccu" },
];

export const POPULAR_CITIES = TRENDING_CITIES.map((c) => c.name);

export const AI_FEATURES: AiFeature[] = [
  {
    title: "AI Price Predictor",
    description:
      "Forecast 12-month price trajectories for any locality with confidence bands trained on five years of transactions.",
    icon: "Sparkles",
    accent: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Smart Match",
    description:
      "Tell NestIQ how you live. We rank properties on commute, lifestyle, and budget fit — not just keywords.",
    icon: "Wand2",
    accent: "bg-violet-500/10 text-violet-500",
  },
  {
    title: "Virtual Tour",
    description:
      "Walk through every shortlisted home in 3D before you book a visit. Measure rooms, see the view at any time of day.",
    icon: "View",
    accent: "bg-amber-500/10 text-amber-500",
  },
];

export const NEW_PROJECTS: NewProject[] = [
  {
    id: "np1",
    builder: "Prestige Group",
    builderInitial: "P",
    name: "Prestige Lakeside Habitat",
    city: "Whitefield, Bengaluru",
    status: "NEW LAUNCH",
    priceRange: "₹1.25 Cr – ₹2.40 Cr",
  },
  {
    id: "np2",
    builder: "Lodha",
    builderInitial: "L",
    name: "Lodha World One Towers",
    city: "Lower Parel, Mumbai",
    status: "COMING SOON",
    priceRange: "₹4.80 Cr – ₹12 Cr",
  },
  {
    id: "np3",
    builder: "DLF",
    builderInitial: "D",
    name: "DLF The Crest",
    city: "Sector 54, Gurugram",
    status: "READY TO MOVE",
    priceRange: "₹6.20 Cr – ₹9.10 Cr",
  },
  {
    id: "np4",
    builder: "Godrej Properties",
    builderInitial: "G",
    name: "Godrej Splendour",
    city: "Whitefield, Bengaluru",
    status: "NEW LAUNCH",
    priceRange: "₹95 L – ₹1.80 Cr",
  },
  {
    id: "np5",
    builder: "Brigade",
    builderInitial: "B",
    name: "Brigade Cornerstone Utopia",
    city: "Varthur, Bengaluru",
    status: "COMING SOON",
    priceRange: "₹1.10 Cr – ₹2.10 Cr",
  },
  {
    id: "np6",
    builder: "Hiranandani",
    builderInitial: "H",
    name: "Hiranandani Fortune City",
    city: "Panvel, Mumbai",
    status: "NEW LAUNCH",
    priceRange: "₹78 L – ₹1.45 Cr",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Aarti Menon",
    city: "Bengaluru",
    rating: 5,
    quote:
      "NestIQ's smart match knew I cared about quiet streets and short commutes. I shortlisted in two evenings and signed in three weeks.",
    avatarSeed: "av-aarti",
  },
  {
    id: "t2",
    name: "Rohan Kapoor",
    city: "Mumbai",
    rating: 5,
    quote:
      "The price predictor caught me right before I overpaid by twelve lakhs. The seller agreed to my counter the same day.",
    avatarSeed: "av-rohan",
  },
  {
    id: "t3",
    name: "Sneha Iyer",
    city: "Pune",
    rating: 4,
    quote:
      "Virtual tours saved me half a dozen weekend trips. Walked the rooms at 7am to check sunlight before booking a visit.",
    avatarSeed: "av-sneha",
  },
];

export const NAV_LINKS = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "PG", href: "/pg" },
  { label: "Commercial", href: "/commercial" },
  { label: "New Projects", href: "/new-projects" },
];
