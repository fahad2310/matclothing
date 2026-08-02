import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

/**
 * Image storage, behind one interface with two backends.
 *
 * Vercel Blob is the right answer in production, but it needs a Vercel
 * account and a provisioned store — which means uploads cannot work at all
 * on a fresh clone. So local disk is the default and Blob switches on
 * automatically when its token is present.
 *
 * Local files land in public/uploads, which Next serves statically. This
 * is a development convenience only: on Vercel the filesystem is read-only
 * outside /tmp, so the Blob backend is not optional there.
 */

export type UploadMode = "blob" | "local";

/**
 * Blob in production, disk in local development.
 *
 * Having the token is not enough. Blob's client-upload flow calls back to
 * the app once a file lands, and it cannot reach a laptop — so from
 * localhost the upload hangs rather than completing. Local development
 * therefore writes to disk even when a token is present, which also keeps
 * test images out of the production store.
 *
 * STORAGE_BACKEND overrides this either way.
 */
export function getUploadMode(): UploadMode {
  const override = process.env.STORAGE_BACKEND;
  if (override === "blob" || override === "local") return override;

  const onVercel = Boolean(process.env.VERCEL);
  return onVercel && process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

const LOCAL_DIR = join(process.cwd(), "public", "uploads");

export interface StoredImage {
  url: string;
  /** Identifier used to delete the object later. */
  pathname: string;
}

export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Use a JPG, PNG, WEBP or AVIF image";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "That image is larger than 15 MB";
  }
  return null;
}

function safeName(name: string) {
  const ext = (name.split(".").pop() || "jpg").toLowerCase().replace(/\W/g, "");
  const base = name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase()
    .slice(0, 60);
  // Random suffix rather than a timestamp: two files uploaded in the same
  // millisecond would otherwise collide.
  return `${base || "image"}-${randomBytes(4).toString("hex")}.${ext}`;
}

/** Writes to whichever backend is active. Server-side only. */
export async function putImage(file: File): Promise<StoredImage> {
  const filename = safeName(file.name);

  if (getUploadMode() === "blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return { url: blob.url, pathname: blob.pathname };
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(LOCAL_DIR, filename), buffer);
  return { url: `/uploads/${filename}`, pathname: `uploads/${filename}` };
}

/** Best-effort removal. A missing object is not worth failing a delete over. */
export async function removeImage(pathname: string): Promise<void> {
  if (!pathname) return;

  if (getUploadMode() === "blob" && !pathname.startsWith("uploads/")) {
    const { del } = await import("@vercel/blob");
    await del(pathname);
    return;
  }

  const relative = pathname.replace(/^uploads\//, "");
  await unlink(join(LOCAL_DIR, relative)).catch(() => {});
}
