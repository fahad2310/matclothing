import Link from "next/link";
import { getAllProductsForAdmin } from "@/services/productService";
import { hasDb } from "@/db";
import { SpecEyebrow } from "@/components/ui/SpecLabel";
import { ProductManager } from "./ProductManager";

export default async function AdminProductsPage() {
  if (!hasDb()) {
    return (
      <div className="border-l-2 border-l-accent-soft bg-label px-6 py-6">
        <p className="spec-label">Database not connected</p>
        <p className="mt-3 text-sm text-foreground">
          Provision Neon, then run <code>vercel env pull .env.local</code>.
        </p>
      </div>
    );
  }

  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SpecEyebrow>Catalogue</SpecEyebrow>
          <h1 className="font-display mt-4 text-4xl text-foreground">
            All pieces
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-foreground px-6 py-3 text-xs uppercase tracking-[0.18em] text-background transition-colors hover:bg-accent-hover"
        >
          Add a piece
        </Link>
      </div>

      <ProductManager products={products} />
    </div>
  );
}
