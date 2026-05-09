"use client";

import { ChevronLeft, ChevronRight, Expand, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PropertyMedia } from "@/lib/property-detail";

type Props = {
  media: PropertyMedia[];
  title: string;
  verified: boolean;
  featured: boolean;
};

export function ImageGallery({ media, title, verified, featured }: Props) {
  const images = media.filter((m) => m.type === "IMAGE");
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const prev = useCallback(
    (set: React.Dispatch<React.SetStateAction<number>>) =>
      set((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    (set: React.Dispatch<React.SetStateAction<number>>) =>
      set((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev(setLightboxIdx);
      if (e.key === "ArrowRight") next(setLightboxIdx);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, prev, next]);

  if (images.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
        No images available
      </div>
    );
  }

  const active = images[activeIdx];

  return (
    <div>
      {/* Hero image */}
      <div className="group relative h-[340px] w-full overflow-hidden bg-muted sm:h-[440px] lg:h-[520px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active?.url}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute left-4 top-4 flex gap-2">
          {featured && <Badge className="bg-amber-500 text-white shadow">Featured</Badge>}
          {verified && (
            <Badge className="bg-emerald-600 text-white shadow">
              <ShieldCheck className="mr-1 size-3" />
              Verified
            </Badge>
          )}
        </div>

        {/* Fullscreen trigger */}
        <button
          type="button"
          onClick={() => { setLightboxIdx(activeIdx); setLightboxOpen(true); }}
          className="absolute right-4 top-4 rounded-full bg-black/55 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="View fullscreen"
        >
          <Expand className="size-4" />
        </button>

        {/* Image counter */}
        <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
          {activeIdx + 1} / {images.length}
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => prev(setActiveIdx)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => next(setActiveIdx)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-background px-3 py-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                i === activeIdx
                  ? "border-emerald-500"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-0 [&>button]:text-white">
          <div className="relative flex h-[75vh] items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIdx]?.url}
              alt={title}
              className="max-h-full max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/25"
            >
              <X className="size-5" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => prev(setLightboxIdx)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => next(setLightboxIdx)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
              {lightboxIdx + 1} / {images.length}
            </span>
          </div>
          {/* Lightbox thumbnails */}
          <div className="flex gap-1.5 overflow-x-auto bg-black p-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxIdx(i)}
                className={cn(
                  "h-12 w-16 shrink-0 overflow-hidden rounded transition-all",
                  i === lightboxIdx ? "ring-2 ring-white" : "opacity-40 hover:opacity-80",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
