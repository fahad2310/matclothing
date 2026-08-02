"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { formatPrice, cn } from "@/lib/utils";
import { totalStock } from "@/lib/stock";
import { setFeatured, setArchived, deleteProduct } from "../actions";

/**
 * The catalogue manager.
 *
 * Everything routine — featuring a piece, hiding it, checking stock —
 * happens here without leaving the page or opening a form. Only editing
 * the piece itself navigates away. Deletion is the single destructive
 * action, so it is the only one behind a confirmation.
 */
export function ProductManager({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  function run(id: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyId(id);
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Something went wrong");
      setBusyId(null);
      setConfirmId(null);
    });
  }

  const categories = ["all", "clothing", "watches", "shoes"];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="product-search" className="sr-only">
          Search pieces
        </label>
        <input
          id="product-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, slug or tag"
          className="min-w-[16rem] flex-1 border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-foreground"
        />
        <div className="flex gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "spec-label border px-3 py-2 transition-colors",
                category === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 border-l-2 border-l-foreground bg-label px-4 py-3 text-sm text-foreground"
        >
          {error}
        </p>
      )}

      <p className="spec-label mb-4">
        {filtered.length} of {products.length}
      </p>

      <ul className="space-y-3">
        {filtered.map((product) => {
          const cover = product.variants[0]?.images?.[0];
          const stock = totalStock(product);
          const isBusy = pending && busyId === product.id;
          const archived = Boolean(product.archived);

          return (
            <li
              key={product.id}
              className={cn(
                "grid grid-cols-[64px_1fr_auto] items-center gap-4 border border-border bg-background p-3 transition-opacity",
                isBusy && "opacity-50",
              )}
            >
              <div className="relative aspect-square w-16 overflow-hidden border border-border bg-surface">
                {cover ? (
                  <Image src={cover} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <span className="spec-label absolute inset-0 flex items-center justify-center text-[9px]">
                    None
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm text-foreground">{product.name}</p>
                  {product.featured && (
                    <span className="spec-label border border-border px-1.5">
                      Featured
                    </span>
                  )}
                  {archived && (
                    <span className="spec-label border border-foreground bg-foreground px-1.5 text-background">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="spec-label mt-1 truncate">
                  {product.category} · {formatPrice(product.price, product.currency)} ·{" "}
                  {product.variants.length}{" "}
                  {product.variants.length === 1 ? "colour" : "colours"} ·{" "}
                  <span className={cn(stock === 0 && "text-foreground")}>
                    {stock === 0 ? "Sold out" : `${stock} in stock`}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    run(product.id, () => setFeatured(product.id, !product.featured))
                  }
                  disabled={isBusy}
                  className="spec-label border border-border px-3 py-2 transition-colors hover:border-foreground disabled:opacity-40"
                >
                  {product.featured ? "Unfeature" : "Feature"}
                </button>

                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="spec-label border border-border px-3 py-2 transition-colors hover:border-foreground"
                >
                  Edit
                </Link>

                {confirmId === product.id ? (
                  <>
                    <button
                      onClick={() => run(product.id, () => deleteProduct(product.id))}
                      disabled={isBusy}
                      className="spec-label border border-foreground bg-foreground px-3 py-2 text-background disabled:opacity-40"
                    >
                      Delete for good
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="spec-label border border-border px-3 py-2 transition-colors hover:border-foreground"
                    >
                      Keep
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        run(product.id, () => setArchived(product.id, !archived))
                      }
                      disabled={isBusy}
                      className="spec-label border border-border px-3 py-2 transition-colors hover:border-foreground disabled:opacity-40"
                      title="Hide from the shop without deleting"
                    >
                      {archived ? "Show" : "Hide"}
                    </button>
                    <button
                      onClick={() => setConfirmId(product.id)}
                      className="spec-label border border-border px-3 py-2 transition-colors hover:border-foreground"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="font-display text-xl text-foreground">Nothing matches</p>
          <p className="mt-2 text-sm text-muted">
            Try a different search or clear the category filter.
          </p>
        </div>
      )}

      {confirmId && (
        <p className="spec-label mt-4">
          Deleting removes the piece and its uploaded photos permanently. Use
          Hide instead to take it off the shop and keep it.
        </p>
      )}
    </div>
  );
}
