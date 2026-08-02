"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product, ProductSize } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { buildSingleProductMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import { getProductShareUrl, copyToClipboard } from "@/lib/sharing";
import { Badge } from "./Badge";
import { SpecLabel, productSpecRows } from "./SpecLabel";
import { SizeSelector } from "./SizeSelector";
import { ColorSelector } from "./ColorSelector";
import { Button } from "./Button";
import { ProductCard } from "./ProductCard";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { ImageViewer } from "./ImageViewer";
import { isProductSoldOut, isVariantSoldOut } from "@/lib/stock";

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.defaultVariantId);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copied, setCopied] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId)!;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;
  const productSoldOut = isProductSoldOut(product);
  const variantSoldOut = isVariantSoldOut(product, selectedVariantId);
  const selectedSizeInStock = selectedSize
    ? selectedVariant.sizes.find((s) => s.size === selectedSize)?.inStock ?? false
    : false;
  const canAddToCart = selectedSize && selectedSizeInStock && !productSoldOut;

  function handleAddToCart() {
    if (!canAddToCart) return;
    addItem({
      productId: product.id,
      variantId: selectedVariantId,
      size: selectedSize,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleWhatsApp() {
    if (!canAddToCart) return;
    const message = buildSingleProductMessage(
      product,
      selectedVariantId,
      String(selectedSize),
    );
    window.open(getWhatsAppUrl(message), "_blank");
  }

  async function handleShare() {
    const url = getProductShareUrl(
      product.slug,
      selectedVariant.color.name,
      selectedSize ? String(selectedSize) : "",
    );
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-6 py-12"
    >
      {/* Breadcrumb */}
      <nav className="mb-8 text-xs text-muted">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-accent">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left: Image / 3D viewer area */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="relative">
            <ImageViewer
              images={selectedVariant.images}
              alt={product.name}
              category={product.category}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {product.tags.includes("new") && <Badge variant="new">New</Badge>}
              {hasDiscount && <Badge variant="sale">-{discountPercent}%</Badge>}
            </div>
          </div>
        </motion.div>

        {/* Right: Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-muted mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl font-bold tracking-wider text-foreground md:text-4xl">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(product.price, product.currency)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted line-through">
                {formatPrice(product.originalPrice!, product.currency)}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-muted">
            {product.description}
          </p>

          {/* Color selector */}
          {product.variants.length > 1 && (
            <ColorSelector
              colors={product.variants.map((v) => ({ id: v.id, color: v.color }))}
              selectedId={selectedVariantId}
              onSelect={(id) => {
                setSelectedVariantId(id);
                setSelectedSize(null);
              }}
            />
          )}

          {/* Size selector */}
          <SizeSelector
            sizes={selectedVariant.sizes}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
          />

          {/* Status messages */}
          {productSoldOut && (
            <div className="border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              This product is currently sold out.
            </div>
          )}
          {!productSoldOut && variantSoldOut && (
            <p className="text-xs text-red-400">This color is sold out. Try another color.</p>
          )}
          {!productSoldOut && !variantSoldOut && !selectedSize && (
            <p className="text-xs text-accent">Please select a size</p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <MagneticButton className="w-full">
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                size="lg"
                className="w-full"
              >
                {productSoldOut
                  ? "Sold Out"
                  : addedToCart
                    ? "Added to Cart!"
                    : "Add to Cart"}
              </Button>
            </MagneticButton>

            <Button
              onClick={handleWhatsApp}
              disabled={!canAddToCart}
              variant="outline"
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
              Order on WhatsApp
            </Button>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-xs text-muted transition-colors hover:text-accent"
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
            {copied ? "Link Copied!" : "Share Product"}
          </button>

          {/* The care label — same tag that appears on cards and in the cart */}
          <div className="border-t border-border pt-8">
            <SpecLabel
              rows={[
                ...productSpecRows(product, selectedVariantId),
                { term: "Category", value: product.category },
              ]}
              variant="stacked"
            />
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold tracking-wider text-foreground">
            You May Also Like
          </h2>
          <StaggerChildren className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </StaggerChildren>
        </section>
      )}
    </motion.div>
  );
}
