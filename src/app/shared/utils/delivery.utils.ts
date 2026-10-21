/**
 * Display-only mirror of the Phase 6 server delivery formula
 * (checkout_delivery_fee in supabase/phase-6-server-side-order-totals.sql):
 * free at or above the threshold, otherwise the configured fee.
 * The server recomputes the real charge at order time and the confirmation
 * page always shows the server-returned amounts.
 */
export function estimateDeliveryFee(subtotal: number, freeDeliveryThreshold: number, deliveryFee: number): number {
  if (!subtotal || subtotal <= 0) return 0;
  if (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) return 0;
  return Math.max(0, deliveryFee || 0);
}
