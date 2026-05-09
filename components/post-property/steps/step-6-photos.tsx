"use client";

import { Image as ImageIcon, Link, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { MediaItem, PostPropertyDraft } from "@/lib/post-property";

type Props = {
  draft: PostPropertyDraft;
  onChange: (patch: Partial<PostPropertyDraft>) => void;
};

export function Step6Photos({ draft, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = draft.media.filter((m) => m.type === "IMAGE");

  async function uploadFiles(files: FileList | File[]) {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArr.length === 0) return;
    if (images.length + fileArr.length > 20) {
      toast.error("Maximum 20 images allowed");
      return;
    }
    setUploading(true);
    const uploads = fileArr.map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      return res.json() as Promise<{ url: string; publicId: string }>;
    });

    try {
      const results = await Promise.all(uploads);
      const newItems: MediaItem[] = results.map((r, i) => ({
        url: r.url,
        publicId: r.publicId,
        type: "IMAGE" as const,
        order: draft.media.length + i,
        isCover: draft.media.length === 0 && i === 0,
      }));
      onChange({ media: [...draft.media, ...newItems] });
      toast.success(`${results.length} photo${results.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Some uploads failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    const next = draft.media.filter((_, i) => i !== idx).map((m, i) => ({ ...m, order: i }));
    // If we removed the cover, set first remaining as cover
    if (draft.media[idx]?.isCover && next.length > 0) next[0].isCover = true;
    onChange({ media: next });
  }

  function setCover(idx: number) {
    onChange({ media: draft.media.map((m, i) => ({ ...m, isCover: i === idx })) });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }

  // Reorder via drag
  function onThumbDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const next = [...draft.media];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    onChange({ media: next.map((m, i) => ({ ...m, order: i })) });
    setDragIdx(null);
    setDragOverIdx(null);
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
          dragOver ? "border-emerald-500 bg-emerald-50" : "border-border hover:border-emerald-300 hover:bg-muted/30",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="size-8 animate-spin text-emerald-600" />
            <p className="text-sm text-muted-foreground">Uploading photos…</p>
          </>
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Drag photos here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG — up to 10 MB each, max 20 photos</p>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>{images.length} photo{images.length !== 1 ? "s" : ""}</Label>
            <p className="text-xs text-muted-foreground">Drag to reorder · ★ = cover photo</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {images.map((img, idx) => (
              <div
                key={img.publicId || idx}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                onDrop={() => onThumbDrop(idx)}
                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                className={cn(
                  "group relative cursor-grab rounded-lg overflow-hidden border-2 aspect-square transition-all",
                  img.isCover ? "border-emerald-500" : "border-transparent hover:border-emerald-200",
                  dragOverIdx === idx && dragIdx !== idx ? "ring-2 ring-emerald-400 scale-105" : "",
                  dragIdx === idx ? "opacity-50" : "",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="size-full object-cover" />
                {img.isCover && (
                  <div className="absolute bottom-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Cover
                  </div>
                )}
                {/* Hover actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCover(idx); }}
                    title="Set as cover"
                    className="flex size-7 items-center justify-center rounded-full bg-white/90 hover:bg-white"
                  >
                    <Star className={cn("size-3.5", img.isCover ? "fill-yellow-400 text-yellow-400" : "text-gray-600")} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    title="Remove"
                    className="flex size-7 items-center justify-center rounded-full bg-white/90 hover:bg-white"
                  >
                    <Trash2 className="size-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
            {/* Add more button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-emerald-300 hover:text-emerald-600"
            >
              <ImageIcon className="size-5" />
              <span className="text-[10px]">Add more</span>
            </button>
          </div>
        </div>
      )}

      {/* Video URL */}
      <div>
        <Label htmlFor="videoUrl" className="mb-1 block">
          <span className="flex items-center gap-1.5">
            <Link className="size-3.5" /> Video URL <span className="text-muted-foreground">(optional)</span>
          </span>
        </Label>
        <Input
          id="videoUrl"
          value={draft.videoUrl}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="YouTube or Vimeo property walkthrough link"
        />
      </div>
    </div>
  );
}
