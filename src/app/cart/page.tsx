import type { Metadata } from "next";
import { getAllProducts } from "@/services/productService";
import { CartView } from "./CartView";

export const metadata: Metadata = {
  title: "Cart",
};

export default async function CartPage() {
  // The cart stores ids only; prices and names are resolved against the
  // live catalogue so a stale localStorage cart can never quote an old price.
  const products = await getAllProducts();
  return <CartView products={products} />;
}
