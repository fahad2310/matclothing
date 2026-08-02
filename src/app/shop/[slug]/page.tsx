import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getAllProducts,
  getRelatedProducts,
} from "@/services/productService";
import { ProductDetail } from "@/components/ui/ProductDetail";

export async function generateStaticParams() {
  // Skipped when no database is configured — the build should not fail
  // just because Neon has not been provisioned yet. Pages then render
  // on demand instead of being prerendered.
  if (!process.env.DATABASE_URL) return [];
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, 4);

  return <ProductDetail product={product} relatedProducts={relatedProducts} />;
}
