import Link from "next/link";
import Image from "next/image";
import { getAllProductsForAdmin } from "@/services/productService";
import { totalStock } from "@/lib/stock";
import { hasDb } from "@/db";
import { formatPrice } from "@/lib/utils";
import { SpecEyebrow } from "@/components/ui/SpecLabel";
import { CATEGORIES } from "@/lib/constants";

/** Stock below this shows as low so it can be restocked before it sells out. */
const LOW_STOCK = 5;

export default async function AdminDashboard() {
  if (!hasDb()) return <NotProvisioned />;

  const products = await getAllProductsForAdmin();
  const live = products.filter((p) => totalStock(p) > 0);
  const soldOut = products.filter((p) => totalStock(p) === 0);
  const lowStock = products.filter((p) => {
    const s = totalStock(p);
    return s > 0 && s <= LOW_STOCK;
  });

  const stats = [
    { label: "Pieces", value: products.length },
    { label: "In stock", value: live.length },
    { label: "Low stock", value: lowStock.length },
    { label: "Sold out", value: soldOut.length },
    { label: "Featured", value: products.filter((p) => p.featured).length },
  ];

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SpecEyebrow>Dashboard</SpecEyebrow>
          <h1 className="font-display mt-4 text-4xl text-foreground">
            Your catalogue
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-foreground px-6 py-3 text-xs uppercase tracking-[0.18em] text-background transition-colors hover:bg-accent-hover"
        >
          Add a piece
        </Link>
      </div>

      <dl className="grid grid-cols-2 border border-border md:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-b border-r border-border p-5 last:border-r-0 md:border-b-0"
          >
            <dt className="spec-label">{stat.label}</dt>
            <dd className="font-display mt-2 text-4xl tabular-nums text-foreground">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {lowStock.length > 0 && (
        <div className="mt-6 border-l-2 border-l-accent-soft bg-label px-5 py-4">
          <p className="spec-label">Running low</p>
          <p className="mt-2 text-sm text-foreground">
            {lowStock.map((p) => p.name).join(", ")} —{" "}
            {lowStock.length === 1 ? "this piece has" : "these have"} {LOW_STOCK}{" "}
            units or fewer left.
          </p>
        </div>
      )}

      <div className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl text-foreground">
            Recently added
          </h2>
          <Link
            href="/admin/products"
            className="spec-label transition-colors hover:text-foreground"
          >
            Manage all →
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyCatalogue />
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {products
              .slice()
              .reverse()
              .slice(0, 5)
              .map((product) => {
                const cover = product.variants[0]?.images?.[0];
                const stock = totalStock(product);
                return (
                  <li key={product.id}>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="group block"
                    >
                      <div className="relative aspect-square overflow-hidden border border-border bg-surface">
                        {cover ? (
                          <Image
                            src={cover}
                            alt=""
                            fill
                            sizes="240px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="spec-label absolute inset-0 flex items-center justify-center">
                            No photo
                          </span>
                        )}
                        {stock === 0 && (
                          <span className="spec-label absolute left-2 top-2 border border-border bg-background px-1.5 py-0.5">
                            Sold out
                          </span>
                        )}
                      </div>
                      <p className="mt-2 truncate text-sm text-foreground transition-colors group-hover:text-accent">
                        {product.name}
                      </p>
                      <p className="spec-label mt-0.5">
                        {formatPrice(product.price, product.currency)} ·{" "}
                        {stock} left
                      </p>
                    </Link>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((c) => {
          const count = products.filter((p) => p.category === c.slug).length;
          return (
            <Link
              key={c.slug}
              href={`/admin/products?category=${c.slug}`}
              className="border border-border p-5 transition-colors hover:border-foreground"
            >
              <p className="spec-label">{c.label}</p>
              <p className="font-display mt-2 text-3xl tabular-nums text-foreground">
                {count}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function EmptyCatalogue() {
  return (
    <div className="border border-dashed border-border bg-surface px-6 py-16 text-center">
      <p className="font-display text-2xl text-foreground">No pieces yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        Add your first piece — you can upload several photos at once and set
        stock per size.
      </p>
      <Link
        href="/admin/products/new"
        className="mt-6 inline-block bg-foreground px-6 py-3 text-xs uppercase tracking-[0.18em] text-background"
      >
        Add a piece
      </Link>
    </div>
  );
}

function NotProvisioned() {
  return (
    <div className="border-l-2 border-l-accent-soft bg-label px-6 py-6">
      <p className="spec-label">Database not connected</p>
      <p className="mt-3 max-w-lg text-sm text-foreground">
        DATABASE_URL is not set, so the catalogue cannot load. Provision Neon
        from the Vercel Marketplace, then run{" "}
        <code className="bg-surface-2 px-1.5 py-0.5">
          vercel env pull .env.local
        </code>{" "}
        and restart the dev server.
      </p>
    </div>
  );
}
