"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Product } from "@/types/product";
import { ProductForm } from "../../ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Product not found");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="text-muted">Loading...</p>;
  }

  if (error || !product) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg text-red-500">{error || "Product not found"}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-wider text-foreground">
          Edit Product
        </h1>
        <p className="text-sm text-muted">{product.name}</p>
      </div>

      <ProductForm initialData={product} mode="edit" />
    </div>
  );
}
