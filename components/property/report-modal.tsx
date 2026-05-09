"use client";

import { Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const REASONS = [
  "Misleading information",
  "Incorrect price",
  "Property already sold/rented",
  "Duplicate listing",
  "Fraudulent listing",
  "Inappropriate content",
];

type Props = { propertyId: string };

export function ReportModal({ propertyId }: Props) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit() {
    if (!reason) { toast.error("Please select a reason"); return; }
    setLoading(true);
    // Stub — no reports table in schema yet; log to console in dev.
    await new Promise((r) => setTimeout(r, 600));
    console.info("[report]", { propertyId, reason, detail });
    setLoading(false);
    setOpen(false);
    toast.success("Report submitted. Our team will review it.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <Flag className="size-3.5" />
          Report listing
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Report this listing</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          <div className="space-y-1.5">
            {REASONS.map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-emerald-600"
                />
                {r}
              </label>
            ))}
          </div>
          <div>
            <Label htmlFor="report-detail" className="text-xs">
              Additional details (optional)
            </Label>
            <textarea
              id="report-detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            size="sm"
            disabled={loading}
            onClick={submit}
          >
            {loading ? "Submitting…" : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
