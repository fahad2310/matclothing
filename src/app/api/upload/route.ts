import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";
import {
  getUploadMode,
  putImage,
  validateImage,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "@/lib/storage";

/**
 * One upload endpoint, two shapes.
 *
 * With Vercel Blob configured, the browser posts JSON here to get a
 * short-lived token and then uploads straight to Blob — nothing streams
 * through this function, so the 4.5 MB body limit does not apply and phone
 * photos go through untouched.
 *
 * Without Blob, the browser posts the file itself as multipart and it is
 * written to disk. That path only exists so a local clone works with no
 * cloud account; it cannot run on Vercel's read-only filesystem.
 *
 * The old implementation always wrote to public/ with fs.writeFile, which
 * silently failed in production.
 */

export async function GET() {
  return NextResponse.json({ mode: getUploadMode() });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  // Local backend: the file arrives directly.
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const invalid = validateImage(file);
      if (invalid) {
        return NextResponse.json({ error: invalid }, { status: 400 });
      }

      const stored = await putImage(file);
      return NextResponse.json(stored);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      console.error("[api/upload] local upload failed:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Blob backend: issue a client-upload token.
  try {
    const body = (await request.json()) as HandleUploadBody;

    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_IMAGE_TYPES,
        maximumSizeInBytes: MAX_IMAGE_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        // Fires from Blob's servers once the upload lands. The row is
        // written when the admin saves the product, so nothing to persist.
        console.log("[api/upload] blob stored:", blob.pathname);
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload could not be authorised";
    console.error("[api/upload] token generation failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
