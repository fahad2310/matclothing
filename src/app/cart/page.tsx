"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { getAllProducts } from "@/services/productService";
import { formatPrice } from "@/lib/utils";
import { buildCartMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import { getCartShareUrl, copyToClipboard } from "@/lib/sharing";
import { CartItemRow } from "@/components/ui/CartItem";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/animations/MagneticButton";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [copied, setCopied] = useState(false);

  const allProducts = getAllProducts();

  const subtotal = items.reduce((sum, item) => {
    const product = allProducts.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const currency = allProducts[0]?.currency ?? "INR";

  function handleWhatsAppOrder() {
    if (items.length === 0) return;
    const message = buildCartMessage(items, allProducts);
    window.open(getWhatsAppUrl(message), "_blank");
  }

  async function handleShareCart() {
    const url = getCartShareUrl(items);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl px-6 py-20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-6xl mb-6 opacity-20"
        >
          🛒
        </motion.div>
        <h1 className="text-3xl font-bold tracking-wider text-foreground">
          Your Cart is Empty
        </h1>
        <p className="mt-3 text-muted">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/shop">
          <MagneticButton className="mt-8">
            <Button variant="outline" size="lg">
              Continue Shopping
            </Button>
          </MagneticButton>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-6 py-12"
    >
      <h1 className="text-4xl font-bold tracking-wider text-foreground mb-2">
        Your Cart
      </h1>
      <p className="text-muted mb-8">
        {items.length} item{items.length !== 1 ? "s" : ""}
      </p>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const product = allProducts.find(
                (p) => p.id === item.productId,
              );
              if (!product) return null;
              return (
                <motion.div
                  key={`${item.productId}-${item.variantId}-${item.size}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CartItemRow item={item} product={product} />
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div className="mt-4 flex justify-between">
            <Link
              href="/shop"
              className="text-xs text-muted hover:text-accent transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-xs text-muted hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            layout
            className="sticky top-24 space-y-6 bg-surface p-6"
          >
            <h2 className="text-lg font-bold tracking-wider text-foreground">
              Order Summary
            </h2>

            <div className="space-y-3 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-foreground">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Shipping</span>
                <span className="text-foreground">Calculated on WhatsApp</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">Total</span>
              <motion.span
                key={subtotal}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-accent"
              >
                {formatPrice(subtotal, currency)}
              </motion.span>
            </div>

            <MagneticButton className="w-full">
              <Button
                onClick={handleWhatsAppOrder}
                size="lg"
                className="w-full"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Order via WhatsApp
              </Button>
            </MagneticButton>

            <button
              onClick={handleShareCart}
              className="flex w-full items-center justify-center gap-2 text-xs text-muted transition-colors hover:text-accent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {copied ? "Cart Link Copied!" : "Share Cart"}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
