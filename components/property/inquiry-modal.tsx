"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  propertyId: string;
  sellerName: string | null;
  isLoggedIn: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function InquiryModal({ propertyId, sellerName, isLoggedIn, open, onOpenChange }: Props) {
  const [message, setMessage] = useState(
    "Hi, I am interested in this property. Please share more details.",
  );
  const [visitDate, setVisitDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(type: "inquiry" | "visit") {
    if (!isLoggedIn) {
      toast.error("Please sign in to contact the seller.");
      return;
    }
    setLoading(true);
    const body =
      type === "visit"
        ? { propertyId, message: `Schedule visit on ${visitDate}. ${message}`, visitDate }
        : { propertyId, message };

    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).finally(() => setLoading(false));

    if (res.ok) {
      toast.success(type === "visit" ? "Visit request sent!" : "Inquiry sent!");
      onOpenChange(false);
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {sellerName ?? "Seller"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="inquiry">
          <TabsList className="w-full">
            <TabsTrigger value="inquiry" className="flex-1">Send Inquiry</TabsTrigger>
            <TabsTrigger value="visit" className="flex-1">Schedule Visit</TabsTrigger>
          </TabsList>

          <TabsContent value="inquiry" className="mt-4 space-y-3">
            <div>
              <Label htmlFor="inquiry-msg">Message</Label>
              <textarea
                id="inquiry-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => submit("inquiry")}
              disabled={loading || message.length < 10}
            >
              {loading ? "Sending…" : "Send Inquiry"}
            </Button>
          </TabsContent>

          <TabsContent value="visit" className="mt-4 space-y-3">
            <div>
              <Label htmlFor="visit-date">Preferred Date</Label>
              <input
                id="visit-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <Label htmlFor="visit-msg">Message (optional)</Label>
              <textarea
                id="visit-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => submit("visit")}
              disabled={loading || !visitDate}
            >
              {loading ? "Sending…" : "Request Visit"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
