import { PrismaClient, type Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const CITIES = [
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, pincode: "560001", localities: ["Indiranagar", "Koramangala", "Whitefield", "HSR Layout", "Jayanagar", "Hebbal"] },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, pincode: "400001", localities: ["Bandra West", "Andheri West", "Powai", "Worli", "Lower Parel", "Goregaon"] },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, pincode: "411001", localities: ["Koregaon Park", "Baner", "Wakad", "Hinjewadi", "Viman Nagar", "Kothrud"] },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, pincode: "500001", localities: ["Madhapur", "Gachibowli", "Banjara Hills", "Kondapur", "Hitech City"] },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209, pincode: "110001", localities: ["Vasant Kunj", "Saket", "Dwarka", "Greater Kailash", "Hauz Khas"] },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, pincode: "122001", localities: ["Sector 24", "Sector 49", "Golf Course Road", "DLF Phase 3", "Sushant Lok"] },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, pincode: "600001", localities: ["ECR", "Velachery", "T Nagar", "Anna Nagar", "OMR"] },
];

const PROPERTY_TYPES = ["APARTMENT", "VILLA", "PLOT", "COMMERCIAL", "PG"] as const;
const PRICE_TYPES = ["SALE", "RENT"] as const;
const FURNISHINGS = ["FURNISHED", "SEMI", "UNFURNISHED"] as const;
const FACINGS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const AMENITIES_POOL = ["Pool", "Gym", "Parking", "Security", "Garden", "Lift", "Power Backup", "Clubhouse", "Kids Play Area", "Jogging Track", "CCTV", "Pet Friendly"];

const TITLES = [
  "Sunlit {beds}BHK with skyline view",
  "Modern {beds}BHK in the heart of {locality}",
  "Spacious {beds}-bed home near tech hubs",
  "Premium {beds}BHK with balcony garden",
  "Newly renovated {beds}-bedroom apartment",
  "Family-friendly {beds}BHK with parking",
  "Smart {beds}BHK with home automation",
  "Builder-floor {beds}BHK in gated society",
  "Sea-facing {beds}BHK with terrace access",
  "Quiet {beds}BHK in green belt locality",
];

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

// Tiny seedable RNG so seed runs are deterministic.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const rng = mulberry32(42);

  console.log("→ ensuring seed sellers (SELLER, AGENT, ADMIN)…");
  const password = await hash("password123", 10);
  const sellers = await Promise.all(
    [
      { email: "owner@nestiq.dev", name: "Aditi Owner", role: "SELLER" as const },
      { email: "agent@nestiq.dev", name: "Rohan Agent", role: "AGENT" as const },
      { email: "builder@nestiq.dev", name: "Prestige Builder", role: "ADMIN" as const },
    ].map((s) =>
      prisma.user.upsert({
        where: { email: s.email },
        create: {
          email: s.email,
          name: s.name,
          role: s.role,
          hashedPassword: password,
          phone: `+91999000${Math.floor(rng() * 9000 + 1000)}`,
          verified: true,
        },
        update: { role: s.role },
      }),
    ),
  );

  console.log("→ wiping existing seeded properties…");
  await prisma.property.deleteMany({
    where: { sellerId: { in: sellers.map((s) => s.id) } },
  });

  const COUNT = 60;
  console.log(`→ creating ${COUNT} properties…`);

  for (let i = 0; i < COUNT; i++) {
    const city = pick(CITIES, rng);
    const locality = pick(city.localities, rng);
    const propertyType = pick(PROPERTY_TYPES, rng);
    const isPlotOrCommercial = propertyType === "PLOT" || propertyType === "COMMERCIAL";
    const beds = isPlotOrCommercial ? 0 : Math.floor(rng() * 5) + 1;
    const baths = isPlotOrCommercial ? 0 : Math.max(1, beds - Math.floor(rng() * 2));
    const isRent = rng() < 0.35;
    const priceType = isRent ? "RENT" : "SALE";
    const baseSalePrice = 5_000_000 + Math.floor(rng() * 95_000_000); // 50L–10Cr
    const baseRentPrice = 15_000 + Math.floor(rng() * 285_000); // 15k–3L
    const price = priceType === "SALE" ? baseSalePrice : baseRentPrice;
    const area = 400 + Math.floor(rng() * 4600);
    const seller = pick(sellers, rng);
    const status: Prisma.PropertyCreateInput["status"] =
      rng() < 0.85 ? "ACTIVE" : rng() < 0.5 ? "SOLD" : "RENTED";
    const titleTpl = pick(TITLES, rng);
    const title = titleTpl.replace("{beds}", String(Math.max(beds, 1))).replace("{locality}", locality);

    // Jitter coords ±0.05° (~5km) so they don't all stack at city center.
    const lat = city.lat + (rng() - 0.5) * 0.1;
    const lng = city.lng + (rng() - 0.5) * 0.1;

    const verified = rng() < 0.7;
    const featured = rng() < 0.15;
    const views = Math.floor(rng() * 5000);
    const age = Math.floor(rng() * 30);
    const facing = pick(FACINGS, rng);
    const furnishing = pick(FURNISHINGS, rng);
    const parking = Math.floor(rng() * 4);
    const totalFloors = isPlotOrCommercial ? null : Math.floor(rng() * 30) + 1;
    const floorNo =
      totalFloors === null ? null : Math.floor(rng() * totalFloors);
    const amenities = pickN(AMENITIES_POOL, Math.floor(rng() * 6) + 2, rng);

    await prisma.property.create({
      data: {
        title,
        description: `${title}. Located in ${locality}, ${city.name}, this ${propertyType.toLowerCase()} offers ${area} sqft with ${beds} bedrooms and ${baths} bathrooms. Move-in ready.`,
        price,
        priceType,
        propertyType,
        bedrooms: beds,
        bathrooms: baths,
        area,
        areaUnit: "SQFT",
        address: `${Math.floor(rng() * 200) + 1}, ${locality}`,
        city: city.name,
        state: city.state,
        pincode: city.pincode,
        lat,
        lng,
        amenities,
        furnishing,
        facing,
        floorNo,
        totalFloors,
        age,
        parking,
        status,
        verified,
        featured,
        views,
        sellerId: seller.id,
        media: {
          create: Array.from({ length: 3 }, (_, k) => ({
            url: `https://picsum.photos/seed/nestiq-${propertyType.toLowerCase()}-${i}-${k}/800/600`,
            type: "IMAGE" as const,
            order: k,
          })),
        },
        priceHistory: {
          create: Array.from({ length: 3 }, (_, k) => {
            const drift = (rng() - 0.5) * 0.1;
            return {
              price: Math.round(price * (1 + drift * (3 - k))),
              recordedAt: new Date(Date.now() - (k + 1) * 30 * 24 * 60 * 60 * 1000),
            };
          }),
        },
      },
    });
  }

  console.log("✔ seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
