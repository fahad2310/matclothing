"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { cn } from "@/lib/utils";
import type { ImageInput } from "../actions";

/**
 * Multi-image uploader.
 *
 * Two paths, chosen by what the server has configured. With Vercel Blob,
 * files go browser-to-Blob with a short-lived token, so nothing streams
 * through a function and large phone photos are fine. Without it, the file
 * is posted here and written to disk — that keeps a local clone working
 * with no cloud account.
 *
 * Uploads run in parallel and each tile owns its progress, so one slow
 * file never blocks the rest.
 */

export type UploadMode = "blob" | "local";

interface PendingUpload {
  key: string;
  name: string;
  previewUrl: string;
  progress: number;
  error?: string;
}

interface ImageUploadProps {
  images: ImageInput[];
  onChange: (images: ImageInput[]) => void;
  /** Used as alt text for uploaded photos. */
  label?: string;
  mode?: UploadMode;
}

export function ImageUpload({
  images,
  onChange,
  label,
  mode = "local",
}: ImageUploadProps) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!list.length) return;

      const started: PendingUpload[] = list.map((file, i) => ({
        key: `${Date.now()}-${i}-${file.name}`,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
      }));
      setPending((p) => [...p, ...started]);

      const uploaded = await Promise.all(
        list.map(async (file, i) => {
          const key = started[i].key;
          const setProgress = (percentage: number) =>
            setPending((p) =>
              p.map((u) => (u.key === key ? { ...u, progress: percentage } : u)),
            );

          try {
            if (mode === "blob") {
              const blob = await upload(`products/${file.name}`, file, {
                access: "public",
                handleUploadUrl: "/api/upload",
                onUploadProgress: ({ percentage }) => setProgress(percentage),
              });
              return {
                url: blob.url,
                blobPathname: blob.pathname,
                alt: label ?? null,
              } as ImageInput;
            }

            // Local backend: post the file itself. fetch gives no upload
            // progress, so the bar jumps rather than creeps.
            setProgress(35);
            const body = new FormData();
            body.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Upload failed");
            setProgress(100);

            return {
              url: data.url,
              blobPathname: data.pathname,
              alt: label ?? null,
            } as ImageInput;
          } catch (err) {
            const message = err instanceof Error ? err.message : "Upload failed";
            setPending((p) =>
              p.map((u) => (u.key === key ? { ...u, error: message } : u)),
            );
            return null;
          }
        }),
      );

      const ok = uploaded.filter((u): u is ImageInput => u !== null);
      if (ok.length) onChange([...images, ...ok]);

      // Failed tiles stay on screen so the admin sees what did not land.
      setPending((p) =>
        p.filter((u) => {
          const failed = Boolean(u.error);
          if (!failed) URL.revokeObjectURL(u.previewUrl);
          return failed;
        }),
      );
    },
    [images, onChange, label, mode],
  );

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  /** Order matters: the first image is what the shop grid shows. */
  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "border border-dashed px-6 py-8 text-center transition-colors",
          dragOver ? "border-foreground bg-label" : "border-border bg-surface",
        )}
      >
        <p className="text-sm text-foreground">
          Drop photos here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="underline underline-offset-4 hover:text-accent"
          >
            choose files
          </button>
        </p>
        <p className="spec-label mt-2">
          JPG, PNG, WEBP or AVIF — up to 15 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(images.length > 0 || pending.length > 0) && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <li
              key={`${img.url}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, i);
                setDragIndex(null);
              }}
              className={cn(
                "group relative aspect-square cursor-grab overflow-hidden border border-border bg-surface",
                dragIndex === i && "opacity-40",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                fill
                sizes="200px"
                className="object-cover"
              />
              {i === 0 && (
                <span className="spec-label absolute left-1.5 top-1.5 border border-border bg-background px-1.5 py-0.5">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove image ${i + 1}`}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center border border-border bg-background text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                ×
              </button>
            </li>
          ))}

          {pending.map((u) => (
            <li
              key={u.key}
              className="relative aspect-square overflow-hidden border border-border bg-surface"
            >
              {/* Local object URL previews instantly; next/image can't take one */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.previewUrl}
                alt=""
                className="h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-x-0 bottom-0 p-2">
                {u.error ? (
                  <p className="spec-label text-foreground">Failed</p>
                ) : (
                  <div className="h-px w-full bg-border">
                    <div
                      className="h-full bg-foreground transition-[width] duration-200"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {images.length > 1 && (
        <p className="spec-label">Drag to reorder — first photo is the cover</p>
      )}
    </div>
  );
}
