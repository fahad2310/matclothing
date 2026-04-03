"use client";

import Link from "next/link";
import Image from "next/image";
import type { CartItem as CartItemType } from "@/types/cart";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { QuantitySelector } from "./QuantitySelector";

interface CartItemProps {
  item: CartItemType;
  product: Product;
}

export function CartItemRow({ item, product }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const variant = product.variants.find((v) => v.id === item.variantId);
  const itemTotal = product.price * item.quantity;

  return (
    <div className="flex gap-4 border-b border-border py-6 last:border-0">
      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative h-24 w-24 flex-shrink-0 bg-surface hover:opacity-80 transition-opacity overflow-hidden"
      >
        {variant?.images?.[0] ? (
          <Image
            src={variant.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl opacity-20">
            {product.category === "shoes" ? "👟" : product.category === "watches" ? "⌚" : "👕"}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/shop/${product.slug}`}
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-muted">
            {variant?.color.name} / Size {String(item.size)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <QuantitySelector
            quantity={item.quantity}
            onChange={(q) =>
              updateQuantity(item.productId, item.variantId, item.size, q)
            }
          />
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(itemTotal, product.currency)}
            </span>
            <button
              onClick={() =>
                removeItem(item.productId, item.variantId, item.size)
              }
              className="text-xs text-muted hover:text-red-500 transition-colors"
              aria-label="Remove item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
