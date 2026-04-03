import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import { formatPrice } from "./utils";
import { WHATSAPP_NUMBER, SITE_URL } from "./constants";

function getProductUrl(product: Product, variantId: string, size: string) {
  const variant = product.variants.find((v) => v.id === variantId);
  const colorParam = variant ? encodeURIComponent(variant.color.name.toLowerCase()) : "";
  const sizeParam = encodeURIComponent(String(size));
  return `${SITE_URL}/shop/${product.slug}?color=${colorParam}&size=${sizeParam}`;
}

export function buildSingleProductMessage(
  product: Product,
  variantId: string,
  size: string,
) {
  const variant = product.variants.find((v) => v.id === variantId);
  const colorName = variant?.color.name ?? "";
  const url = getProductUrl(product, variantId, size);

  return [
    `Hi! I'd like to order from MAT Clothing:`,
    ``,
    `${product.name} — Size ${size}, ${colorName} — ${formatPrice(product.price, product.currency)}`,
    `🔗 ${url}`,
  ].join("\n");
}

export function buildCartMessage(
  items: CartItem[],
  products: Product[],
) {
  const lines: string[] = ["Hi! I'd like to order from MAT Clothing:", ""];

  let total = 0;

  items.forEach((item, i) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    const variant = product.variants.find((v) => v.id === item.variantId);
    const colorName = variant?.color.name ?? "";
    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    const url = getProductUrl(product, item.variantId, String(item.size));

    lines.push(
      `${i + 1}. ${product.name} — Size ${item.size}, ${colorName} — ${formatPrice(itemTotal, product.currency)} (x${item.quantity})`,
    );
    lines.push(`   🔗 ${url}`);
    lines.push("");
  });

  const currency = products[0]?.currency ?? "INR";
  lines.push(`Total: ${formatPrice(total, currency)}`);

  return lines.join("\n");
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
