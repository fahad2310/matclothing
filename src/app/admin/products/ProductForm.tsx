"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductCategory, ProductVariant, ProductSize } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";
import { ImageUpload } from "./ImageUpload";

interface ProductFormProps {
  initialData?: Product;
  mode: "create" | "edit";
}

const defaultVariant: ProductVariant = {
  id: "",
  color: { name: "Black", hex: "#0a0a0a" },
  sizes: [{ size: "M", inStock: true }],
  images: [],
};

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    initialData?.category ?? "clothing",
  );
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.originalPrice ?? 0,
  );
  const [currency] = useState(initialData?.currency ?? "PKR");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [tags, setTags] = useState(initialData?.tags.join(", ") ?? "");
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants ?? [{ ...defaultVariant, id: "variant-1" }],
  );

  function handleNameChange(value: string) {
    setName(value);
    if (mode === "create") {
      setSlug(slugify(value));
    }
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        ...defaultVariant,
        id: `variant-${Date.now()}`,
      },
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, updates: Partial<ProductVariant>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...updates } : v)),
    );
  }

  function updateVariantColor(
    index: number,
    colorUpdates: Partial<ProductVariant["color"]>,
  ) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, color: { ...v.color, ...colorUpdates } } : v,
      ),
    );
  }

  function updateVariantSizes(index: number, sizesStr: string) {
    const existingSizes = variants[index].sizes;
    const sizes = sizesStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const size = (isNaN(Number(s)) ? s : Number(s)) as ProductSize;
        // Preserve existing stock status if this size already exists
        const existing = existingSizes.find((es) => String(es.size) === String(size));
        return { size, inStock: existing?.inStock ?? true };
      });
    updateVariant(index, { sizes });
  }

  function toggleSizeStock(variantIndex: number, sizeIndex: number) {
    const newVariants = [...variants];
    const sizes = [...newVariants[variantIndex].sizes];
    sizes[sizeIndex] = { ...sizes[sizeIndex], inStock: !sizes[sizeIndex].inStock };
    newVariants[variantIndex] = { ...newVariants[variantIndex], sizes };
    setVariants(newVariants);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !slug || !description || !price) {
      setError("Please fill in all required fields");
      return;
    }

    setSaving(true);

    const productData = {
      name,
      slug,
      description,
      category,
      price,
      originalPrice: originalPrice || undefined,
      currency,
      featured,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      variants: variants.map((v) => ({
        ...v,
        id: v.id || `${slug}-${v.color.name.toLowerCase()}`,
      })),
      defaultVariantId:
        variants[0]?.id || `${slug}-${variants[0]?.color.name.toLowerCase()}`,
    };

    try {
      const url =
        mode === "create"
          ? "/api/products"
          : `/api/products/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-wider text-foreground">
          Basic Info
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent resize-none"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent cursor-pointer"
            >
              <option value="clothing">Clothing</option>
              <option value="watches">Watches</option>
              <option value="shoes">Shoes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">
              Price ({currency}) *
            </label>
            <input
              type="number"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              required
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">
              Original Price
            </label>
            <input
              type="number"
              value={originalPrice || ""}
              onChange={(e) => setOriginalPrice(Number(e.target.value))}
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              min={0}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="new, featured, bestseller"
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted/50 focus:border-accent"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-[#c9a84c]"
              />
              <span className="text-sm text-foreground">Featured product</span>
            </label>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-wider text-foreground">
            Variants
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="text-xs text-accent hover:underline"
          >
            + Add Variant
          </button>
        </div>

        {variants.map((variant, i) => (
          <div
            key={variant.id || i}
            className="border border-border bg-surface p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">
                Variant {i + 1}
              </span>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-xs text-muted hover:text-red-500"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-muted mb-1">
                  Color Name
                </label>
                <input
                  type="text"
                  value={variant.color.name}
                  onChange={(e) => updateVariantColor(i, { name: e.target.value })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">
                  Color Hex
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={variant.color.hex}
                    onChange={(e) => updateVariantColor(i, { hex: e.target.value })}
                    className="h-9 w-9 cursor-pointer border border-border bg-background"
                  />
                  <input
                    type="text"
                    value={variant.color.hex}
                    onChange={(e) => updateVariantColor(i, { hex: e.target.value })}
                    className="flex-1 border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">
                  Sizes (comma-separated)
                </label>
                <input
                  type="text"
                  value={variant.sizes.map((s) => s.size).join(", ")}
                  onChange={(e) => updateVariantSizes(i, e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted/50 focus:border-accent"
                />
              </div>
            </div>

            {/* Stock toggles per size */}
            {variant.sizes.length > 0 && (
              <div className="mt-3">
                <label className="block text-xs text-muted mb-2">
                  Stock Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {variant.sizes.map((s, si) => (
                    <button
                      key={String(s.size)}
                      type="button"
                      onClick={() => toggleSizeStock(i, si)}
                      className={`px-3 py-1 text-xs border transition-all ${
                        s.inStock
                          ? "border-green-500/50 bg-green-500/10 text-green-400"
                          : "border-red-500/50 bg-red-500/10 text-red-400 line-through"
                      }`}
                    >
                      {String(s.size)} — {s.inStock ? "In Stock" : "Sold Out"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variant Images */}
            <div className="mt-3">
              <ImageUpload
                images={variant.images}
                onChange={(newImages) =>
                  updateVariant(i, { images: newImages })
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
