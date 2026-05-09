# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NestIQ — AI-powered real estate search platform (Next.js 14 App Router, TypeScript, Prisma/PostgreSQL, NextAuth v4, Tailwind CSS, shadcn/ui).

## Commands

```bash
# Dev server — pnpm dev fails due to esbuild build-script approval; use this instead:
node_modules/.bin/next dev

# Build & lint
pnpm build
pnpm lint

# Database (all require Docker container nestiq-postgres to be running)
pnpm db:push        # push schema without migration history
pnpm db:migrate     # create + apply a named migration
pnpm db:seed        # seed with sample data (tsx prisma/seed.ts)
pnpm db:studio      # open Prisma Studio at localhost:5555
pnpm db:generate    # regenerate Prisma client after schema changes
```

**Database setup (first run or after restart):**
```bash
docker start nestiq-postgres
# If container doesn't exist yet:
docker run -d --name nestiq-postgres \
  -e POSTGRES_USER=nestiq -e POSTGRES_PASSWORD=nestiq_dev -e POSTGRES_DB=nestiq \
  -p 5432:5432 postgres:16
```

After schema changes always run `pnpm db:generate` before running the dev server.

## Architecture

### Module structure
Modules are built sequentially; earlier modules are dependencies of later ones.
- **M2** Prisma schema (`prisma/schema.prisma`)
- **M3** Auth — credentials + Google OAuth + phone OTP, profile completion, RBAC middleware
- **M4** Home page — Hero, FeaturedProperties, TrendingCities, AiFeatures, NewProjects, Testimonials
- **M5** Search — filter sidebar, top bar, property cards, Leaflet map, infinite scroll

### Auth system (`lib/auth.ts`, `middleware.ts`)
Three NextAuth providers:
1. `credentials` — email + bcrypt password
2. `google` — OAuth via PrismaAdapter
3. `phone-otp` — OTP stored as HMAC-signed HTTP-only cookie (`lib/otp.ts`), Twilio SMS or console fallback in dev

**Prisma adapter wrapper** (`nestiqAdapter` in `lib/auth.ts`): NextAuth's PrismaAdapter expects a field called `image`, but the schema uses `avatar`. The wrapper translates between them on `createUser`, `getUser`, `getUserByEmail`, `getUserByAccount`, and `updateUser`.

**JWT session** stores `id`, `role`, `phone`, `verified`. The `jwt` callback re-fetches these from the database when `token.role === undefined` (first sign-in) or on a forced `trigger === "update"` call.

**Middleware** (`middleware.ts`) runs on `/dashboard`, `/seller`, `/admin`, `/complete-profile`. Authenticated users without a phone are redirected to `/complete-profile`. Role gates: admin-only `/admin`, seller+agent+admin for `/seller`.

**Type augmentation**: `types/next-auth.d.ts` extends `Session.user` with `id`, `role`, `phone`, `verified`.

### Search system (`lib/property-search.ts`, `app/api/properties/route.ts`)
All filter state lives in the URL. `filtersSchema` (Zod) parses every URL param; `buildSearchParams` serializes back. `SearchPage` reads `useSearchParams`, calls `updateFilters(patch)` which does `router.replace` — this is the only way to change any filter.

The API at `GET /api/properties` mirrors every filter field from `filtersSchema` into a Prisma `where` clause. `5+` bedrooms/bathrooms is handled by expanding the selection to `[5,6,7,8,9,10]`. For map view the page size is 100 (not 12).

`matchScore` is deterministic from property ID (`matchScoreFor` in `lib/property-search.ts`) — it is not stored in the database.

`postedBy` UI filter maps to Prisma `Role`: `OWNER → SELLER`, `AGENT → AGENT`, `BUILDER → ADMIN`.

The Leaflet map (`components/search/property-map.tsx`) is dynamically imported with `ssr: false`. It uses `leaflet.markercluster` imperatively (not react-leaflet) for clustering.

### API conventions
All API routes validate input with Zod (`safeParse`), return `{ error, issues }` on 400, and use `getServerSession(authOptions)` for auth checks. The Prisma singleton (`lib/prisma.ts`) is stored on `globalThis` to survive hot-reload in dev.

### Key shared libraries
| File | Purpose |
|------|---------|
| `lib/validation.ts` | Zod schemas for all user-facing forms and API input |
| `lib/format.ts` | `formatPrice(amount, type)` — Indian number formatting (Cr/L) |
| `lib/mock-data.ts` | Static data for home page sections and `POPULAR_CITIES` used in search |
| `lib/otp.ts` | Cookie-based OTP: `issueOtpCookie`, `verifyOtpCookie` (5 min TTL, 5 attempts max) |
| `lib/sms.ts` | Twilio wrapper; logs to console when `TWILIO_*` env vars are absent |

### Environment variables (`.env.local`)
Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`  
Optional (features degrade gracefully): `GOOGLE_CLIENT_*` (OAuth), `TWILIO_*` (OTP SMS), `CLOUDINARY_*` (image uploads)
