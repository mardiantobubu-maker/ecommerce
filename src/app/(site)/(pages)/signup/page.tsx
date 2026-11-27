import Signup from "@/components/Auth/Signup";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Daftar Akun Mitra",
  description: "Daftar sebagai mitra Seragam Grosir untuk harga pabrik langsung dari konveksi.",
  robots: { index: false, follow: false },
};

const SignupPage = () => {
  return (
    <main>
      <Signup />
    </main>
  );
};

export default SignupPage;
