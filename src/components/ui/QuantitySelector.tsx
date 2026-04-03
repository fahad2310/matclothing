"use client";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 10,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center border border-border">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-accent disabled:text-muted/30"
      >
        -
      </button>
      <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm text-foreground">
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-accent disabled:text-muted/30"
      >
        +
      </button>
    </div>
  );
}
