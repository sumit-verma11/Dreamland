import type { Role } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const VARIANTS: Record<Role, string> = {
  BUYER: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  SELLER: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  AGENT: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  ADMIN: "bg-rose-100 text-rose-800 hover:bg-rose-100",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <Badge variant="secondary" className={cn(VARIANTS[role], "border-0", className)}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </Badge>
  );
}
