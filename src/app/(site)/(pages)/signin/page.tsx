import Signin from "@/components/Auth/Signin";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Masuk Akun",
  description: "Masuk ke akun mitra Seragam Grosir untuk memesan dan melacak pesanan.",
  robots: { index: false, follow: false },
};

const SigninPage = () => {
  return (
    <main>
      <React.Suspense fallback={null}>
        <Signin />
      </React.Suspense>
    </main>
  );
};

export default SigninPage;
