import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-wider text-foreground">
          Add Product
        </h1>
        <p className="text-sm text-muted">
          Create a new product listing
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
