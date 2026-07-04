import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Populer",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Toko",
    newTab: false,
    path: "/shop-with-sidebar",
  },

  {
    id: 7,
    title: "Blog",
    newTab: false,
    path: "/blogs/blog-grid",
  },

  {
    id: 3,
    title: "Kontak",
    newTab: false,
    path: "/contact",
  },
  {
    id: 99,
    title: "Tautan Cepat",
    newTab: false,
    mobileOnly: true,
    submenu: [
      { id: 991, title: "Kebijakan Privasi", path: "/privacy-policy", newTab: false, prefetch: false },
      { id: 992, title: "Kebijakan Pengembalian Dana", path: "/refund-policy", newTab: false, prefetch: false },
      { id: 993, title: "Syarat Penggunaan", path: "/terms-conditions", newTab: false, prefetch: false },
      { id: 994, title: "FAQ", path: "/faq", newTab: false, prefetch: false },
      { id: 995, title: "Kontak", path: "/contact", newTab: false },
    ]
  }
];
