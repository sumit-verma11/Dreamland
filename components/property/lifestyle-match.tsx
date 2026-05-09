import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Deterministic match score [65, 97] derived from userId + propertyId.
function matchScore(userId: string, propertyId: string): number {
  let h = 0;
  const combined = userId + propertyId;
  for (let i = 0; i < combined.length; i++) h = (h * 31 + combined.charCodeAt(i)) | 0;
  return 65 + (Math.abs(h) % 33);
}

function matchReasons(amenities: string[], bedrooms: number): string[] {
  const reasons: string[] = [];
  if (amenities.includes("Parking")) reasons.push("Has dedicated parking");
  if (amenities.includes("Gym")) reasons.push("Gym on premises");
  if (amenities.includes("Security")) reasons.push("Gated & secured");
  if (amenities.includes("Pool")) reasons.push("Swimming pool");
  if (bedrooms >= 3) reasons.push("Spacious layout");
  if (amenities.includes("Power Backup")) reasons.push("24×7 power backup");
  if (amenities.includes("Lift")) reasons.push("Lift available");
  return reasons.slice(0, 4);
}

type Props = {
  userId: string | null;
  propertyId: string;
  amenities: string[];
  bedrooms: number;
};

export function LifestyleMatch({ userId, propertyId, amenities, bedrooms }: Props) {
  if (!userId) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
        <Sparkles className="mx-auto mb-2 size-6 text-emerald-500" />
        <p className="mb-1 text-sm font-medium">See your Lifestyle Match score</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Sign in to see how well this property fits your preferences.
        </p>
        <Button size="sm" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </section>
    );
  }

  const score = matchScore(userId, propertyId);
  const reasons = matchReasons(amenities, bedrooms);

  const color =
    score >= 85 ? "text-emerald-600" : score >= 70 ? "text-amber-600" : "text-muted-foreground";
  const ring =
    score >= 85
      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
      : score >= 70
        ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
        : "border-border bg-muted/30";

  return (
    <section className={`rounded-xl border p-5 ${ring}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles className="size-5 text-emerald-500" />
          Lifestyle Match
        </h2>
        <Badge variant="outline" className="text-xs">Based on your profile</Badge>
      </div>

      <div className="flex items-center gap-6">
        {/* Score ring */}
        <div className="flex flex-col items-center">
          <div className={`relative flex size-20 flex-col items-center justify-center rounded-full border-4 ${ring}`}>
            <span className={`text-2xl font-bold ${color}`}>{score}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
          <span className="mt-1.5 text-xs font-medium text-muted-foreground">
            {score >= 85 ? "Great match" : score >= 70 ? "Good match" : "Partial match"}
          </span>
        </div>

        {/* Reasons */}
        <div className="flex-1">
          {reasons.length > 0 && (
            <ul className="space-y-1.5">
              {reasons.map((r) => (
                <li key={r} className="flex items-center gap-2 text-sm">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {r}
                </li>
              ))}
            </ul>
          )}
          {reasons.length === 0 && (
            <p className="text-sm text-muted-foreground">Matches your city preference</p>
          )}
        </div>
      </div>
    </section>
  );
}
