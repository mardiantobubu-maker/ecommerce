import React from "react";
import Error from "@/components/Error";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan",
  description: "Halaman yang Anda cari tidak tersedia.",
  robots: { index: false, follow: false },
};

const ErrorPage = () => {
  return (
    <main>
      <Error />
    </main>
  );
};

export default ErrorPage;
