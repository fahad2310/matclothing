"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { ImageUpload } from "./ImageUpload";
import { saveProduct, type ProductInput, type VariantInput } from "../actions";

/**
 * One form for creating and editing.
 *
 * A piece is a set of colourways, each with its own photos and its own
 * stock per size — so the form is built around the colourway rather than a
 * flat field list. Adding a second colour is one click.
 */

const SIZE_PRESETS: Record<string, string[]> = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  shoes: ["38", "40", "42", "44", "46"],
  watches: ["38mm", "40mm", "42mm", "44mm"],
};

function blankVariant(category: string): VariantInput {
  return {
    colorName: "",
    colorHex: "#14110e",
    images: [],
    sizes: (SIZE_PRESETS[category] ?? SIZE_PRESETS.clothing).map((size) => ({
      size,
      quantity: 0,
    })),
  };
}

function toVariantInputs(product: Product): VariantInput[] {
  return product.variants.map((v) => ({
    id: v.id,
    colorName: v.color.name,
    colorHex: v.color.hex,
    images: v.images.map((url) => ({ url, blobPathname: null, alt: null })),
    sizes: v.sizes.map((s) => ({
      size: String(s.size),
      quantity: s.quantity ?? 0,
    })),
  }));
}

interface ProductFormProps {
  initialData?: Product;
  mode: "create" | "edit";
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<string>(
    initialData?.category ?? "clothing",
  );
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData ? String(initialData.price) : "");
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.originalPrice ? String(initialData.originalPrice) : "",
  );
  const [material, setMaterial] = useState(initialData?.material ?? "");
  const [weightGsm, setWeightGsm] = useState(
    initialData?.weightGsm ? String(initialData.weightGsm) : "",
  );
  const [careInstructions, setCare] = useState(initialData?.careInstructions ?? "");
  const [tags, setTags] = useState((initialData?.tags ?? []).join(", "));
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [variants, setVariants] = useState<VariantInput[]>(
    initialData ? toVariantInputs(initialData) : [blankVariant("clothing")],
  );

  function updateVariant(index: number, patch: Partial<VariantInput>) {
    setVariants((vs) => vs.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function handleCategoryChange(next: string) {
    setCategory(next);
    // Swap size presets, keeping counts already entered for sizes present
    // in both lists.
    setVariants((vs) =>
      vs.map((v) => {
        const preset = SIZE_PRESETS[next] ?? SIZE_PRESETS.clothing;
        return {
          ...v,
          sizes: preset.map((size) => ({
            size,
            quantity: v.sizes.find((s) => s.size === size)?.quantity ?? 0,
          })),
        };
      }),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input: ProductInput = {
      id: initialData?.id,
      name,
      slug: initialData?.slug,
      description,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      material: material || null,
      weightGsm: weightGsm ? Number(weightGsm) : null,
      careInstructions: careInstructions || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featured,
      variants,
    };

    startTransition(async () => {
      const result = await saveProduct(input);
      if (!result.ok) {
        setError(result.error ?? "Could not save");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  const totalUnits = variants.reduce(
    (sum, v) => sum + v.sizes.reduce((s, x) => s + (Number(x.quantity) || 0), 0),
    0,
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-10">
      {error && (
        <p
          role="alert"
          className="border-l-2 border-l-foreground bg-label px-4 py-3 text-sm text-foreground"
        >
          {error}
        </p>
      )}

      <section className="space-y-4">
        <p className="spec-label">The piece</p>

        <Field label="Name" htmlFor="name">
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Structured Jacket"
            className={inputClass}
          />
        </Field>

        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What it is, in one or two lines."
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field label="Category" htmlFor="category-clothing">
          <div className="flex gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                id={`category-${c.slug}`}
                type="button"
                onClick={() => handleCategoryChange(c.slug)}
                aria-pressed={category === c.slug}
                className={cn(
                  "spec-label border px-4 py-2.5 transition-colors",
                  category === c.slug
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (₹)" htmlFor="price">
            <input
              id="price"
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Was (₹) — optional" htmlFor="originalPrice">
            <input
              id="originalPrice"
              type="number"
              min="0"
              step="1"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="Shows as a strikethrough"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <p className="spec-label">Care label</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fabric" htmlFor="material">
            <input
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="100% cotton"
              className={inputClass}
            />
          </Field>
          <Field label="Weight (gsm)" htmlFor="weightGsm">
            <input
              id="weightGsm"
              type="number"
              min="0"
              value={weightGsm}
              onChange={(e) => setWeightGsm(e.target.value)}
              placeholder="340"
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Care" htmlFor="care">
          <input
            id="care"
            value={careInstructions}
            onChange={(e) => setCare(e.target.value)}
            placeholder="Cold wash, dry flat"
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="spec-label">
            Colourways — {totalUnits} {totalUnits === 1 ? "unit" : "units"} total
          </p>
          <button
            type="button"
            onClick={() => setVariants((vs) => [...vs, blankVariant(category)])}
            className="spec-label border border-border px-3 py-2 transition-colors hover:border-foreground"
          >
            Add colour
          </button>
        </div>

        {variants.map((variant, vi) => (
          <fieldset key={vi} className="border border-border p-5">
            <legend className="spec-label px-2">
              {variant.colorName || `Colour ${vi + 1}`}
              {vi === 0 && " · default"}
            </legend>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
              <Field label="Colour name" htmlFor={`color-${vi}`}>
                <input
                  id={`color-${vi}`}
                  value={variant.colorName}
                  onChange={(e) => updateVariant(vi, { colorName: e.target.value })}
                  placeholder="Off White"
                  className={inputClass}
                />
              </Field>
              <Field label="Swatch" htmlFor={`hex-${vi}`}>
                <input
                  id={`hex-${vi}`}
                  type="color"
                  value={variant.colorHex}
                  onChange={(e) => updateVariant(vi, { colorHex: e.target.value })}
                  className="h-[42px] w-16 cursor-pointer border border-border bg-background"
                />
              </Field>
              {variants.length > 1 && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setVariants((vs) => vs.filter((_, i) => i !== vi))}
                    className="spec-label border border-border px-3 py-2.5 transition-colors hover:border-foreground"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5">
              <p className="spec-label mb-2">Photos</p>
              <ImageUpload
                images={variant.images}
                onChange={(images) => updateVariant(vi, { images })}
                label={`${name} — ${variant.colorName}`}
              />
            </div>

            <div className="mt-5">
              <p className="spec-label mb-2">Stock per size</p>
              <div className="flex flex-wrap gap-2">
                {variant.sizes.map((s, si) => (
                  <label
                    key={s.size}
                    className={cn(
                      "flex items-center gap-2 border px-3 py-2",
                      s.quantity > 0 ? "border-foreground" : "border-border",
                    )}
                  >
                    <span className="spec-label">{s.size}</span>
                    <input
                      type="number"
                      min="0"
                      value={s.quantity}
                      onChange={(e) =>
                        updateVariant(vi, {
                          sizes: variant.sizes.map((x, i) =>
                            i === si
                              ? { ...x, quantity: Number(e.target.value) || 0 }
                              : x,
                          ),
                        })
                      }
                      aria-label={`Stock for size ${s.size}`}
                      className="w-14 bg-transparent text-sm tabular-nums text-foreground outline-none"
                    />
                  </label>
                ))}
              </div>
              <p className="spec-label mt-2">Zero means sold out for that size</p>
            </div>
          </fieldset>
        ))}
      </section>

      <section className="space-y-4">
        <p className="spec-label">Listing</p>
        <Field label="Tags — comma separated" htmlFor="tags">
          <input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="new, featured"
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-[#14110e]"
          />
          <span className="text-sm text-foreground">Show on the homepage</span>
        </label>
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={pending}
          className="bg-foreground px-8 py-3.5 text-xs uppercase tracking-[0.18em] text-background transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Add to catalogue"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="border border-border px-8 py-3.5 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-foreground";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="spec-label mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
