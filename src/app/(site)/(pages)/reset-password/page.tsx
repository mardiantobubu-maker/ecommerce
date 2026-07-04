import ResetPassword from "@/components/Auth/ResetPassword";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi",
  description: "Atur ulang kata sandi akun mitra Anda",
};

const ResetPasswordPage = () => {
  return (
    <main>
      <ResetPassword />
    </main>
  );
};

export default ResetPasswordPage;
