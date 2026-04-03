"use client";

import type { ProductCategory } from "@/types/product";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";

export type SortOption = "newest" | "price-asc" | "price-desc" | "name";

interface FilterBarProps {
  selectedCategory: ProductCategory | "all";
  sortBy: SortOption;
  onCategoryChange: (category: ProductCategory | "all") => void;
  onSortChange: (sort: SortOption) => void;
}

export function FilterBar({
  selectedCategory,
  sortBy,
  onCategoryChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Desktop filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => onCategoryChange("all")}
            className={cn(
              "px-4 py-2 text-xs uppercase tracking-wider transition-all",
              selectedCategory === "all"
                ? "bg-accent text-background"
                : "text-muted hover:text-foreground",
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onCategoryChange(cat.slug as ProductCategory)}
              className={cn(
                "px-4 py-2 text-xs uppercase tracking-wider transition-all",
                selectedCategory === cat.slug
                  ? "bg-accent text-background"
                  : "text-muted hover:text-foreground",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none bg-surface border border-border px-4 py-2 text-xs uppercase tracking-wider text-foreground outline-none focus:border-accent cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
  );
}
