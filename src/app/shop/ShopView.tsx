"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { Product, ProductCategory } from "@/types/product";
import { ProductCard } from "@/components/ui/ProductCard";
import { FilterBar, type SortOption } from "@/components/ui/FilterBar";
import { SpecEyebrow } from "@/components/ui/SpecLabel";

/**
 * Filtering and sorting stay on the client — they are instant and need no
 * round trip. The catalogue itself is fetched on the server and handed
 * down, because the query now hits Postgres.
 */
export function ShopView({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filteredProducts = useMemo(() => {
    let result = products;

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    switch (sortBy) {
      case "newest":
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [products, category, sortBy]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12">
      <div className="mb-12">
        <SpecEyebrow>The collection</SpecEyebrow>
        <h1 className="font-display mt-6 text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-foreground">
          Shop
        </h1>
        <p className="spec-label mt-4">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <FilterBar
        selectedCategory={category}
        sortBy={sortBy}
        onCategoryChange={setCategory}
        onSortChange={setSortBy}
      />

      <LayoutGroup>
        <motion.div
          layout
          className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {filteredProducts.length === 0 && (
        <div className="border border-border bg-surface px-6 py-20 text-center">
          <p className="font-display text-2xl text-foreground">
            Nothing here yet
          </p>
          <p className="mt-2 text-sm text-muted">
            Try another category, or clear the filter to see everything.
          </p>
        </div>
      )}
    </div>
  );
}
