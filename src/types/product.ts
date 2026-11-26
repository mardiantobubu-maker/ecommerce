export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  priceLong?: number;
  discountedPriceLong?: number;
  id: number;
  stock?: number;
  category?: string;
  gender?: string;
  sizes?: string[];
  colors?: string[];
  description?: string;
  image_url?: string;
  sleeves?: string[];
  fits?: string[];
  rating?: number;
  kodiPrice?: number;    // Harga per kodi (jika tidak ada, dihitung: discountedPrice × 20)
  minKodi?: number;      // Minimum order dalam kodi (default: 1)
  specifications?: {
    [key: string]: string;
  };
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  size_prices?: {
    [size: string]: {
      pendek?: number;
      panjang?: number;
    }
  };
};
