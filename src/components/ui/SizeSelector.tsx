"use client";

import type { ProductSize } from "@/types/product";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: { size: ProductSize; inStock: boolean }[];
  selectedSize: ProductSize | null;
  onSelect: (size: ProductSize) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-muted">Size</label>
      <div className="flex flex-wrap gap-2">
        {sizes.map(({ size, inStock }) => (
          <button
            key={String(size)}
            onClick={() => inStock && onSelect(size)}
            disabled={!inStock}
            className={cn(
              "min-w-[3rem] border px-3 py-2 text-xs uppercase tracking-wider transition-all",
              selectedSize === size
                ? "border-accent bg-accent text-background"
                : inStock
                  ? "border-border text-foreground hover:border-accent"
                  : "border-border/30 text-muted/30 cursor-not-allowed line-through",
            )}
          >
            {String(size)}
          </button>
        ))}
      </div>
    </div>
  );
}
