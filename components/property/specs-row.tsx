import { BathIcon, BedDouble, Building2, CalendarDays, Car, Maximize2, Wind } from "lucide-react";

import { Separator } from "@/components/ui/separator";

const FURNISHING_LABEL: Record<string, string> = {
  FURNISHED: "Furnished",
  SEMI: "Semi-furnished",
  UNFURNISHED: "Unfurnished",
};

type Spec = { icon: React.ComponentType<{ className?: string }>; label: string; value: string };

type Props = {
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  floorNo: number | null;
  totalFloors: number | null;
  age: number | null;
  parking: number;
  furnishing: string;
};

export function SpecsRow({
  bedrooms,
  bathrooms,
  area,
  areaUnit,
  floorNo,
  totalFloors,
  age,
  parking,
  furnishing,
}: Props) {
  const specs: Spec[] = [
    { icon: BedDouble, label: "Bedrooms", value: bedrooms === 0 ? "Studio" : `${bedrooms} BHK` },
    { icon: BathIcon, label: "Bathrooms", value: String(bathrooms) },
    {
      icon: Maximize2,
      label: "Area",
      value: `${Number(area).toLocaleString("en-IN")} ${areaUnit.toLowerCase()}`,
    },
    {
      icon: Building2,
      label: "Floor",
      value:
        floorNo != null
          ? totalFloors
            ? `${floorNo} / ${totalFloors}`
            : String(floorNo)
          : "—",
    },
    {
      icon: CalendarDays,
      label: "Age",
      value: age != null ? (age === 0 ? "New" : `${age} yr${age > 1 ? "s" : ""}`) : "—",
    },
    { icon: Car, label: "Parking", value: parking > 0 ? String(parking) : "—" },
    { icon: Wind, label: "Furnishing", value: FURNISHING_LABEL[furnishing] ?? furnishing },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-7">
      {specs.map(({ icon: Icon, label, value }, idx) => (
        <div key={label} className="flex flex-col items-center gap-1 text-center">
          <Icon className="size-5 text-emerald-600" />
          <span className="text-sm font-semibold text-foreground">{value}</span>
          <span className="text-[11px] text-muted-foreground">{label}</span>
          {idx < specs.length - 1 && (
            <Separator orientation="vertical" className="absolute hidden sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}
