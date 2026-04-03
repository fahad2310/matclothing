import type { ProductSize } from "./product";

export interface CartItem {
  productId: string;
  variantId: string;
  size: ProductSize;
  quantity: number;
}
