// Product availability: "in_stock" | "order_in" | "found_online".
// Older API responses and the offline fallback data only have `inStock`.
export function availabilityOf(product) {
  const a = product?.availability;
  if (a === "in_stock" || a === "order_in" || a === "found_online") return a;
  return product?.inStock === false ? "order_in" : "in_stock";
}

export const isInStock = (product) => availabilityOf(product) === "in_stock";

// Items that need Lane to confirm availability and the final price before payment.
export const needsConfirmation = (product) => !isInStock(product);

// Price comparison for sorting; items without a price go last.
export const priceForSort = (p) => p.price ?? p.estimatedPrice ?? Number.POSITIVE_INFINITY;
export const byPrice = (list) => [...list].sort((a, b) => priceForSort(a) - priceForSort(b));

export const CONFIRM_NOTE = "Lane confirms availability and final price on WhatsApp before you pay.";
