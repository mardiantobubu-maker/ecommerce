export const KODI_SIZE = 20;

// Tiered discount tiers
const TIERED_DISCOUNTS = [
  { minKodi: 10, discount: 0.05, label: "10+ Kodi → Diskon 5%" },
  { minKodi: 5, discount: 0.02, label: "5+ Kodi → Diskon 2%" },
];

/**
 * Calculate kodi price from unit price (unit × 20)
 */
export function calculateKodiPrice(unitPrice: number): number {
  return unitPrice * KODI_SIZE;
}

/**
 * Get applicable tiered discount based on total kodi count
 */
export function getKodiDiscount(totalKodi: number): { discount: number; label: string } | null {
  for (const tier of TIERED_DISCOUNTS) {
    if (totalKodi >= tier.minKodi) {
      return { discount: tier.discount, label: tier.label };
    }
  }
  return null;
}

/**
 * Get all discount tiers for display
 */
export function getDiscountTiers() {
  return TIERED_DISCOUNTS.map(t => ({ ...t }));
}

/**
 * Check if a total quantity is valid for B2B (Min 20, Multiple of 5)
 */
export function isValidKodiQuantity(totalPcs: number): boolean {
  return totalPcs >= 20 && totalPcs % 5 === 0;
}

/**
 * Calculate how many kodi from total pieces
 */
export function pcsToKodi(totalPcs: number): number {
  return Math.floor(totalPcs / KODI_SIZE);
}

/**
 * Calculate remaining pcs needed to complete a kodi
 */
export function pcsToNextKodi(totalPcs: number): number {
  if (totalPcs === 0) return KODI_SIZE;
  const remainder = totalPcs % KODI_SIZE;
  return remainder === 0 ? 0 : KODI_SIZE - remainder;
}

/**
 * Format variant breakdown into human-readable summary
 * e.g. "2 Kodi (40 pcs): 10 S (Putih), 20 M (Biru), 10 L (Putih)"
 */
export function formatKodiSummary(breakdown: { [key: string]: number }): string {
  const totalPcs = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  const kodi = pcsToKodi(totalPcs);
  
  const details = Array.from(new Set(Object.entries(breakdown)
    .filter(([_, qty]) => qty > 0)
    .map(([key, qty]) => {
      const parts = key.split("-");
      return parts[0]; // Only size
    })))
    .join(", ");
  
  return `${kodi} Kodi ${totalPcs} pcs: ${details}`;
}

/**
 * Format price in Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  const safeAmount = Number(amount || 0);
  if (isNaN(safeAmount)) return "Rp0";
  return `Rp${safeAmount.toLocaleString("id-ID")}`;
}
