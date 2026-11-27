import MyAccount from "@/components/MyAccount";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Akun Saya",
  description: "Kelola profil akun, alamat pengiriman, dan pesanan Anda di Seragam Grosir.",
  robots: { index: false, follow: false },
};

const MyAccountPage = () => {
  return (
    <main>
      <React.Suspense fallback={null}>
        <MyAccount />
      </React.Suspense>
    </main>
  );
};

export default MyAccountPage;
