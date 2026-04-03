"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted">{products.length} total</p>
        </div>
        <Link href="/admin/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="mb-6 w-full border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted/50 focus:border-accent sm:max-w-xs"
      />

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Variants
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Featured
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0 hover:bg-surface/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="text-sm text-foreground hover:text-accent"
                      target="_blank"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted capitalize">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {product.currency} {product.price.toLocaleString()}
                    {product.originalPrice && (
                      <span className="ml-2 text-xs text-muted line-through">
                        {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {product.variants.map((v) => (
                        <span
                          key={v.id}
                          className="h-4 w-4 rounded-full border border-border"
                          style={{ backgroundColor: v.color.hex }}
                          title={v.color.name}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {product.featured ? (
                      <span className="text-accent">Yes</span>
                    ) : (
                      <span className="text-muted">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs text-accent hover:underline"
                      >
                        Edit
                      </Link>
                      {deleteId === product.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="text-xs text-muted hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="text-xs text-muted hover:text-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
