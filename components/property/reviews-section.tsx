"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReviewWithUser } from "@/lib/property-detail";

function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "size-6" : "size-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(sz, s <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground")}
        />
      ))}
    </div>
  );
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${s} stars`}
        >
          <Star
            className={cn(
              "size-7 transition-colors",
              s <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}

type Props = {
  propertyId: string;
  reviews: ReviewWithUser[];
  isLoggedIn: boolean;
  averageRating: number;
};

export function ReviewsSection({ propertyId, reviews: initial, isLoggedIn, averageRating }: Props) {
  const [reviews, setReviews] = useState(initial);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  async function submitReview() {
    if (!isLoggedIn) { toast.error("Sign in to leave a review"); return; }
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (comment.trim().length < 5) { toast.error("Comment too short"); return; }

    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, rating, comment }),
    }).finally(() => setSubmitting(false));

    if (res.ok) {
      const newReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setRating(0);
      setComment("");
      setFormOpen(false);
      toast.success("Review posted!");
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? "Failed to post review");
    }
  }

  const avg = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : averageRating;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Reviews
          <span className="ml-2 text-sm font-normal text-muted-foreground">({reviews.length})</span>
        </h2>
        {avg > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(avg)} />
            <span className="text-sm font-semibold">{avg.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Write review */}
      {!formOpen ? (
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={() => {
            if (!isLoggedIn) { toast.error("Sign in to write a review"); return; }
            setFormOpen(true);
          }}
        >
          Write a Review
        </Button>
      ) : (
        <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-3 text-sm font-medium">Your rating</p>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience…"
            rows={3}
            className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={submitting}
              onClick={submitReview}
            >
              {submitting ? "Posting…" : "Post Review"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {(r.user.name?.[0] ?? "U").toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{r.user.name ?? "Anonymous"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <Stars value={r.rating} />
                  <p className="mt-1.5 text-sm text-muted-foreground">{r.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
