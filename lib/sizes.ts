export const APPAREL_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

const SIZED_PRODUCT_TYPES = new Set(["shirt", "sweater"]);

export function requiresSize(productType: string) {
  return SIZED_PRODUCT_TYPES.has(productType);
}
