"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = { url: string };

export function ShareListingButton({ url }: Props) {
  function share() {
    navigator.clipboard.writeText(url).then(
      () => toast.success("Listing link copied to clipboard"),
      () => toast.error("Could not copy link"),
    );
  }

  return (
    <Button variant="outline" onClick={share}>
      <Share2 className="mr-2 size-4" />
      Copy Listing Link
    </Button>
  );
}
