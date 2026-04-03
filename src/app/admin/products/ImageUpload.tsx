"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }

    const data = await res.json();
    return data.path as string;
  }

  async function handleFiles(files: FileList | File[]) {
    setError("");
    setUploading(true);

    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const path = await uploadFile(file);
        paths.push(path);
      }
      onChange([...images, ...paths]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs uppercase tracking-wider text-muted">
        Product Images
      </label>

      {/* Existing images */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div
              key={src}
              className="relative group h-24 w-24 border border-border bg-surface overflow-hidden"
            >
              <Image
                src={src}
                alt={`Product image ${i + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="text-xs text-red-500">Remove</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-8 transition-colors",
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-muted",
        )}
      >
        {uploading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span className="text-xs text-muted">Uploading...</span>
          </div>
        ) : (
          <>
            <span className="text-2xl mb-2 opacity-30">📷</span>
            <span className="text-xs text-muted">
              Drag & drop images here or click to browse
            </span>
            <span className="text-[10px] text-muted/50 mt-1">
              JPG, PNG, WebP — Max 5MB
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
