export const domain = "https://www.seragamsekolah.com";

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Toko Seragam Sekolah",
    url: domain,
    logo: `${domain}/images/logo/logo.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+6288211346422",
      contactType: "customer service"
    }
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: domain,
    name: "Seragam Sekolah Terbaik | Toko Seragam Lengkap",
    potentialAction: {
      "@type": "SearchAction",
      target: `${domain}/shop-with-sidebar?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number | string;
  sku: string;
  inStock: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: `${domain}/shop-details`,
      priceCurrency: "IDR",
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Toko Seragam Sekolah"
      }
    }
  };
}
