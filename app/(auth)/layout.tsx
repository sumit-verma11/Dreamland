import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/"
            className="block text-center text-xl font-semibold tracking-tight"
          >
            NestIQ
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
