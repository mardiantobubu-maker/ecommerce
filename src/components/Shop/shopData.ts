import { Product } from "@/types/product";

const shopData: Product[] = [
  {
    title: "Paket Seragam SD Lengkap",
    category: "Seragam SD",
    gender: "Uniseks",
    sizes: ["M", "L", "XL"],
    colors: ["red", "white"],
    reviews: 15,
    price: 150000,
    discountedPrice: 125000,
    id: 1,
    imgs: {
      thumbnails: [
        "/images/products/terbaru-seragam-sd.png",
        "/images/products/terbaru-seragam-sd.png",
      ],
      previews: [
        "/images/products/terbaru-seragam-sd.png",
        "/images/products/terbaru-seragam-sd.png",
      ],
    },
  },
  {
    title: "Seragam SMP Putih Biru Lengkap",
    category: "Seragam SMP",
    gender: "Uniseks",
    sizes: ["L", "XL", "XXL"],
    colors: ["blue", "white"],
    reviews: 5,
    price: 175000,
    discountedPrice: 150000,
    id: 2,
    imgs: {
      thumbnails: [
        "/images/products/seragam-smp.png",
        "/images/products/seragam-smp.png",
      ],
      previews: [
        "/images/products/seragam-smp.png",
        "/images/products/seragam-smp.png",
      ],
    },
  },
  {
    title: "Seragam SMA Putih Abu-abu Lengkap",
    category: "Seragam SMA",
    gender: "Uniseks",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["purple", "white"],
    reviews: 5,
    price: 200000,
    discountedPrice: 175000,
    id: 3,
    imgs: {
      thumbnails: [
        "/images/products/seragam-sma.png",
        "/images/products/seragam-sma.png",
      ],
      previews: [
        "/images/products/seragam-sma.png",
        "/images/products/seragam-sma.png",
      ],
    },
  },
  {
    title: "Seragam Pramuka Penggalang Lengkap",
    category: "Seragam Pramuka",
    gender: "Laki-laki",
    sizes: ["M", "L", "XL"],
    colors: ["orange"],
    reviews: 6,
    price: 180000,
    discountedPrice: 160000,
    id: 4,
    imgs: {
      thumbnails: [
        "/images/products/seragam-pramuka.png",
        "/images/products/seragam-pramuka.png",
      ],
      previews: [
        "/images/products/seragam-pramuka.png",
        "/images/products/seragam-pramuka.png",
      ],
    },
  },
  {
    id: 5,
    title: "Seragam Batik Sekolah Nasional",
    category: "Seragam Batik",
    gender: "Perempuan",
    sizes: ["M", "L"],
    colors: ["pink", "blue"],
    price: 95000,
    discountedPrice: 110000,
    description: "Seragam batik sekolah dengan motif nasional yang indah. Bahan katun primisima yang halus dan menyerap keringat. Tersedia dalam berbagai ukuran.",
    rating: 4.9,
    reviews: 120,
    imgs: {
      thumbnails: ["/images/products/seragam-batik.png", "/images/products/seragam-batik.png"],
      previews: ["/images/products/seragam-batik.png", "/images/products/seragam-batik.png"],
    },
    specifications: {
      "Ukuran": "S, M, L, XL",
      "Lengan": "Pendek",
      "Bahan": "Katun Primisima",
      "Instruksi Cuci": "Cuci manual, jangan disikat keras"
    }
  }
];

export default shopData;
