"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SAMPLE_PANORAMA = "https://pannellum.org/images/alma.jpg";

type Props = { tourUrl?: string | null };

export function VirtualTourButton({ tourUrl }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const imageUrl = tourUrl || SAMPLE_PANORAMA;

    function initViewer() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pannellum = (window as any).pannellum;
      if (!pannellum || !containerRef.current) return;
      viewerRef.current = pannellum.viewer(containerRef.current, {
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        showControls: true,
        compass: false,
        mouseZoom: true,
      });
    }

    // Inject CSS once
    if (!document.querySelector("#pannellum-css")) {
      const link = document.createElement("link");
      link.id = "pannellum-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
      document.head.appendChild(link);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).pannellum) {
      initViewer();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
      script.onload = initViewer;
      document.head.appendChild(script);
    }

    return () => {
      viewerRef.current?.destroy?.();
      viewerRef.current = null;
    };
  }, [open, tourUrl]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Play className="size-3.5" />
        Virtual Tour
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-4 py-3">
            <DialogTitle className="text-sm">360° Virtual Tour</DialogTitle>
          </DialogHeader>
          <div ref={containerRef} className="h-[65vh] w-full" />
        </DialogContent>
      </Dialog>
    </>
  );
}
