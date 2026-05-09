"use client";

import Link from "next/link";

const SocialIcon = {
  X: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Instagram: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  LinkedIn: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.15 1.45-2.15 2.95v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.86 3.38-1.86 3.61 0 4.27 2.38 4.27 5.47zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.55V9h3.57z" />
    </svg>
  ),
  YouTube: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42a2.5 2.5 0 0 0-1.76 1.77A26 26 0 0 0 2 12a26 26 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.42-4.81M10 15.02V8.98L15.5 12z" />
    </svg>
  ),
  Facebook: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12" />
    </svg>
  ),
};

const COLUMNS = [
  {
    heading: "Buy",
    links: [
      { label: "Apartments", href: "/buy?type=apartment" },
      { label: "Villas", href: "/buy?type=villa" },
      { label: "Plots", href: "/buy?type=plot" },
      { label: "New launches", href: "/new-projects" },
    ],
  },
  {
    heading: "Rent & PG",
    links: [
      { label: "Rent a home", href: "/rent" },
      { label: "Co-living / PG", href: "/pg" },
      { label: "Short stays", href: "/rent?duration=short" },
      { label: "Commercial", href: "/commercial" },
    ],
  },
  {
    heading: "Sellers",
    links: [
      { label: "Post property", href: "/post-property" },
      { label: "Pricing", href: "/pricing" },
      { label: "Agent program", href: "/agents" },
      { label: "Builder partnerships", href: "/builders" },
    ],
  },
  {
    heading: "NestIQ",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr] lg:gap-16">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
              <span className="grid size-8 place-items-center rounded-md bg-emerald-500 text-slate-950">
                N
              </span>
              NestIQ
            </Link>
            <p className="mt-4 max-w-md text-sm text-slate-400">
              The AI-powered way to find, finance, and move into your next home. Trusted by
              buyers across 38 cities.
            </p>

            <form
              className="mt-6 flex max-w-sm gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Get weekly market updates"
                className="h-11 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="h-11 rounded-md bg-emerald-500 px-4 text-sm font-medium text-white hover:bg-emerald-600"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <AppBadge store="apple" />
              <AppBadge store="google" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold uppercase tracking-wider text-white">
                  {col.heading}
                </p>
                <ul className="mt-4 space-y-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-slate-400 transition hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} NestIQ Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[
              { Icon: SocialIcon.X, href: "#", label: "X / Twitter" },
              { Icon: SocialIcon.Instagram, href: "#", label: "Instagram" },
              { Icon: SocialIcon.LinkedIn, href: "#", label: "LinkedIn" },
              { Icon: SocialIcon.YouTube, href: "#", label: "YouTube" },
              { Icon: SocialIcon.Facebook, href: "#", label: "Facebook" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid size-9 place-items-center rounded-full bg-white/[0.05] text-slate-400 transition hover:bg-emerald-500/20 hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function AppBadge({ store }: { store: "apple" | "google" }) {
  const isApple = store === "apple";
  return (
    <a
      href="#"
      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 transition hover:border-emerald-500/40 hover:bg-white/[0.06]"
    >
      <span className="text-2xl leading-none" aria-hidden>
        {isApple ? "" : ""}
      </span>
      {isApple ? (
        <svg className="size-7 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M16.365 1.43c0 1.14-.41 2.22-1.07 2.97-.7.81-1.84 1.45-2.95 1.36-.13-1.13.43-2.31 1.06-3.03.7-.8 1.93-1.42 2.96-1.3zM20.5 17.59c-.55 1.27-.81 1.83-1.52 2.95-.99 1.55-2.39 3.49-4.13 3.51-1.55.01-1.95-1.01-4.06-1-2.11.01-2.55 1.02-4.1 1.01-1.74-.02-3.07-1.78-4.06-3.34C0.85 17.32-.18 12.85 1.69 9.96c1.32-2.04 3.41-3.23 5.37-3.23 2 0 3.26 1.09 4.92 1.09 1.6 0 2.58-1.09 4.89-1.09 1.74 0 3.59.95 4.91 2.59-4.32 2.36-3.62 8.51-1.28 8.27z" />
        </svg>
      ) : (
        <svg className="size-7" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#34A853"
            d="M3.6 20.4 13.4 12 3.6 3.6c-.3.3-.5.7-.5 1.2v14.4c0 .5.2.9.5 1.2z"
          />
          <path fill="#FBBC04" d="m13.4 12 3.7-3.7L6.5 2.7c-.3-.2-.7-.2-1 0L13.4 12z" />
          <path fill="#EA4335" d="m13.4 12-7.9 9.3c.3.2.7.2 1 0l10.6-5.6L13.4 12z" />
          <path fill="#4285F4" d="m17.1 8.3 3.6 2c.6.3.6 1.1 0 1.4l-3.6 2L13.4 12l3.7-3.7z" />
        </svg>
      )}
      <span className="flex flex-col text-left text-white">
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          {isApple ? "Download on the" : "Get it on"}
        </span>
        <span className="text-sm font-semibold">
          {isApple ? "App Store" : "Google Play"}
        </span>
      </span>
    </a>
  );
}
