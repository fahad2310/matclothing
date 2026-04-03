"use client";

import type { ProductColor } from "@/types/product";
import { cn } from "@/lib/utils";

interface ColorSelectorProps {
  colors: { id: string; color: ProductColor }[];
  selectedId: string;
  onSelect: (variantId: string) => void;
}

export function ColorSelector({ colors, selectedId, onSelect }: ColorSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-muted">
        Color —{" "}
        <span className="text-foreground">
          {colors.find((c) => c.id === selectedId)?.color.name}
        </span>
      </label>
      <div className="flex gap-3">
        {colors.map(({ id, color }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "h-8 w-8 rounded-full border-2 transition-all",
              selectedId === id
                ? "border-accent scale-110"
                : "border-transparent hover:border-muted",
            )}
            title={color.name}
          >
            <span
              className="block h-full w-full rounded-full"
              style={{ backgroundColor: color.hex }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
