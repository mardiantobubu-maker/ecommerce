/** Normalize raw Supabase product row for UI rendering across shop list and detail views. */
export function normalizeProduct(item: any) {
  if (!item) return null;

  const parseList = (val: unknown, fallback: string[]): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      return val
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return fallback;
  };

  const allPrices = [
    item.discounted_price,
    item.price,
    item.discounted_price_panjang,
    item.price_panjang,
  ].filter((p) => p && p > 0);

  const displayPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const normalPrice = item.price || item.price_panjang || displayPrice;

  return {
    ...item,
    imgs: {
      thumbnails: item.thumbnails || [item.image_url],
      previews: item.previews || [item.image_url],
    },
    discountedPrice: displayPrice,
    price: normalPrice,
    priceLong: item.price_panjang,
    discountedPriceLong: item.discounted_price_panjang,
    size_prices: item.size_prices || {},
    colors: parseList(item.colors, []),
    sizes: parseList(item.sizes, []),
    sleeves: parseList(item.sleeves, []),
  };
}
