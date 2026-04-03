import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getAllProducts,
  getRelatedProducts,
} from "@/services/productService";
import { ProductDetail } from "@/components/ui/ProductDetail";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
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
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = getRelatedProducts(product.id, 4);

  return <ProductDetail product={product} relatedProducts={relatedProducts} />;
}
