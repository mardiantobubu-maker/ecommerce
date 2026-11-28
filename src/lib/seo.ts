export const domain = (process.env.NEXT_PUBLIC_SITE_URL || "https://seragamgrosir.com").replace(/\/+$/, "");

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
      target: `${domain}/seragamsekolah?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateProductSchema(product: {
  id?: string | number;
  name: string;
  description: string;
  image: string;
  price: number | string;
  sku: string;
  inStock: boolean;
}) {
  const now = new Date();
  const validFrom = now.toISOString().split("T")[0];
  const validUntilDate = new Date(now);
  validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);
  const priceValidUntil = validUntilDate.toISOString().split("T")[0];

  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `${domain}${product.image?.startsWith("/") ? "" : "/"}${product.image || ""}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: imageUrl,
    description: product.description,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      "@type": "Brand",
      name: "Seragam Grosir",
    },
    offers: {
      "@type": "Offer",
      url: `${domain}/seragamsekolah-details${product.id ? `?id=${product.id}` : ""}`,
      priceCurrency: "IDR",
      price: product.price,
      validFrom,
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Seragam Grosir"
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "ID",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "IDR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "ID",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
    }
  };
}
