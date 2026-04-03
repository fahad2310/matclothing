import type { CartItem } from "@/types/cart";
import { SITE_URL } from "./constants";

export function getProductShareUrl(
  slug: string,
  colorName: string,
  size: string,
) {
  const params = new URLSearchParams();
  if (colorName) params.set("color", colorName.toLowerCase());
  if (size) params.set("size", String(size));
  return `${SITE_URL}/shop/${slug}?${params.toString()}`;
}

export function encodeCartForSharing(items: CartItem[]): string {
  return btoa(JSON.stringify(items));
}

export function decodeCartFromSharing(encoded: string): CartItem[] | null {
  try {
    return JSON.parse(atob(encoded)) as CartItem[];
  } catch {
    return null;
  }
}

export function getCartShareUrl(items: CartItem[]) {
  const encoded = encodeCartForSharing(items);
  return `${SITE_URL}/cart?shared=${encoded}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
