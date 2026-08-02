import type { Metadata } from "next";
import { getAllProducts } from "@/services/productService";
import { ShopView } from "./ShopView";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "The full Brand Industrys collection — clothing, watches and shoes, made in small batches in Mumbai.",
};

export default async function ShopPage() {
  const products = await getAllProducts();
  return <ShopView products={products} />;
}
