import { notFound } from "next/navigation";
import { getProductById } from "@/services/productService";
import { SpecEyebrow } from "@/components/ui/SpecLabel";
import { ProductForm } from "../../ProductForm";
import { getUploadMode } from "@/lib/storage";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-8">
        <SpecEyebrow>Editing</SpecEyebrow>
        <h1 className="font-display mt-4 text-4xl text-foreground">
          {product.name}
        </h1>
      </div>

      <ProductForm initialData={product} mode="edit" uploadMode={getUploadMode()} />
    </div>
  );
}
