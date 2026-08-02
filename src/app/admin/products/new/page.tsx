import { SpecEyebrow } from "@/components/ui/SpecLabel";
import { ProductForm } from "../ProductForm";
import { getUploadMode } from "@/lib/storage";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <SpecEyebrow>New piece</SpecEyebrow>
        <h1 className="font-display mt-4 text-4xl text-foreground">
          Add to the catalogue
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          Upload several photos at once and set stock per size. You can add
          more colourways below.
        </p>
      </div>

      <ProductForm mode="create" uploadMode={getUploadMode()} />
    </div>
  );
}
