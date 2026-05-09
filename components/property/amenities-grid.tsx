import {
  Camera,
  Car,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Home,
  LandPlot,
  ShieldCheck,
  Sparkles,
  TreePine,
  Waves,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Pool: Waves,
  Gym: Dumbbell,
  Parking: Car,
  Security: ShieldCheck,
  Garden: TreePine,
  Lift: Home,
  "Power Backup": Zap,
  Clubhouse: LandPlot,
  "Kids Play Area": Sparkles,
  "Jogging Track": Footprints,
  CCTV: Camera,
  "Pet Friendly": Heart,
  default: Flame,
};

type Props = { amenities: string[] };

export function AmenitiesGrid({ amenities }: Props) {
  if (!amenities.length) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Amenities</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {amenities.map((name) => {
          const Icon = AMENITY_ICONS[name] ?? AMENITY_ICONS.default;
          return (
            <div
              key={name}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-4 text-center",
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                <Icon className="size-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium leading-snug">{name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
