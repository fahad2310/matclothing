"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { ProductCategory } from "@/types/product";
import { getAllProducts } from "@/services/productService";
import { ProductCard } from "@/components/ui/ProductCard";
import { FilterBar, type SortOption } from "@/components/ui/FilterBar";

export default function ShopPage() {
  const allProducts = getAllProducts();
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filteredProducts = useMemo(() => {
    let result = allProducts;

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
  }, [allProducts, category, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-6 py-12"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-wider text-foreground">
          Shop
        </h1>
        <p className="mt-2 text-muted">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
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
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <p className="text-lg text-muted">No products found</p>
        </motion.div>
      )}
    </motion.div>
  );
}
