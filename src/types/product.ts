export type ProductCategory = "clothing" | "watches" | "shoes";

export type ClothingSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type ShoeSize = number;
export type WatchSize = "38mm" | "40mm" | "42mm" | "44mm";
export type ProductSize = ClothingSize | ShoeSize | WatchSize;

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  color: ProductColor;
  sizes: {
    size: ProductSize;
    inStock: boolean;
  }[];
  images: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  currency: string;
  variants: ProductVariant[];
  defaultVariantId: string;
  modelPath?: string;
  tags: string[];
  featured: boolean;
  createdAt: string;

  /**
   * Care-label spec. Optional so existing products keep working —
   * the label renders whatever is present and omits the rest.
   */
  material?: string;
  weightGsm?: number;
  careInstructions?: string;
}
