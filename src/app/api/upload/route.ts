import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

/**
 * Issues short-lived client-upload tokens for Vercel Blob.
 *
 * The previous implementation wrote to public/images/products with
 * fs.writeFile, which cannot work on Vercel — the filesystem is read-only
 * outside /tmp, and /tmp is per-instance and ephemeral.
 *
 * Uploading straight from the browser to Blob also sidesteps the 4.5 MB
 * request body limit on serverless functions, so large product photos
 * straight off a phone go through untouched.
 */

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Tokens are what authorise the write, so the admin check belongs
        // here — not on the upload itself, which never touches our server.
        if (!(await verifySession())) {
          throw new Error("Not authorised to upload");
        }

        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ uploadedAt: Date.now() }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Fires from Blob's servers after the upload lands. The DB row is
        // written by the admin form once the product is saved, so there is
        // nothing to persist here — this is only useful for logging.
        console.log("blob uploaded:", blob.pathname);
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
