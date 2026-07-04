"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";
import { Spinner } from "@/components/Common/PreLoader";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    businessType: "",
    whatsapp: "",
    password: "",
    reTypePassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.reTypePassword) {
      toast.error("Kata sandi tidak cocok");
      return;
    }
    setLoading(true);

    // 1. Validasi manual ke database apakah Email atau WA sudah dipakai
    const { data: existsData, error: existsError } = await supabase.rpc('check_user_exists', {
      p_email: formData.email,
      p_whatsapp: formData.whatsapp
    });

    if (!existsError && existsData) {
      if (existsData.email_exists) {
        toast.error("Alamat Email ini sudah terdaftar!");
        setLoading(false);
        return;
      }
      if (existsData.wa_exists) {
        toast.error("Nomor WhatsApp ini sudah terdaftar!");
        setLoading(false);
        return;
      }
    }

    const metadata = {
      full_name: formData.name,
      user_type: "Bisnis",
      company_name: formData.companyName,
      business_type: formData.businessType,
      whatsapp: formData.whatsapp,
    };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          metadata
        }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        toast.error(translateError(result.message || "Gagal mendaftarkan akun"));
      }
    } catch (err: any) {
      setLoading(false);
      console.error("Signup error:", err);
      toast.error("Terjadi kesalahan sistem saat mendaftar");
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/?google_signup=true`,
      },
    });
    if (error) {
      toast.error(translateError(error.message));
    }
  };

  const handleResendEmail = async () => {
    if (!formData.email) return;
    setResending(true);
    
    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await response.json();
      setResending(false);

      if (response.ok) {
        toast.success("Email verifikasi telah dikirim ulang!");
      } else {
        toast.error(translateError(result.message || "Gagal mengirim ulang email"));
      }
    } catch (err: any) {
      setResending(false);
      toast.error("Terjadi kesalahan sistem saat mengirim ulang email");
    }
  };

  return (
    <>
      <Breadcrumb title={"Daftar Sekarang"} pages={["Daftar"]} />
      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5 flex items-center justify-center gap-3">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue/10 text-blue shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                </span>
                Daftar Sekarang
              </h2>
              <p>Silakan lengkapi data Anda untuk mulai berbelanja.</p>
            </div>

            <div className="flex flex-col gap-4.5">
              <button 
                onClick={() => signInWithOAuth('google')}
                className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2 w-full font-medium text-dark"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_98_7461)">
                    <mask
                      id="mask0_98_7461"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                    >
                      <path d="M20 0H0V20H20V0Z" fill="white" />
                    </mask>
                    <g mask="url(#mask0_98_7461)">
                      <path
                        d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z"
                        fill="#34A853"
                      />
                      <path
                        d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z"
                        fill="#EB4335"
                      />
                    </g>
                  </g>
                  <defs>
                    <clipPath id="clip0_98_7461">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Daftar dengan Google
              </button>
            </div>

            <span className="relative z-1 block font-medium text-center mt-4.5">
              <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
              <span className="inline-block px-3 bg-white">Atau isi form di bawah</span>
            </span>

            <div className="mt-5.5">
              <form onSubmit={handleSignUp}>
                <div className="mb-5">
                  <label htmlFor="companyName" className="block mb-2.5">
                    Nama Perusahaan <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nama perusahaan"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap isi nama perusahaan Anda')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="businessType" className="block mb-2.5">
                    Bidang Usaha <span className="text-red">*</span>
                  </label>
                  <select
                    name="businessType"
                    id="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 text-dark w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 appearance-none"
                    onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity('Harap pilih bidang usaha Anda')}
                    onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity('')}
                  >
                    <option value="">Pilih Bidang Usaha</option>
                    <option value="Retail">Retail / Toko</option>
                    <option value="Instansi">Instansi / Sekolah</option>
                    <option value="Konveksi">Konveksi / Penjahit</option>
                    <option value="Distributor">Distributor / Grosir</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2.5">
                    Nama Penanggung Jawab <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nama lengkap penanggung jawab"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap isi nama penanggung jawab')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Alamat Email <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: email@perusahaan.com"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap isi alamat email yang valid')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="whatsapp" className="block mb-2.5">
                    Nomor WhatsApp Bisnis <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="whatsapp"
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: 08123456789"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap isi nomor WhatsApp bisnis Anda')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>



                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Kata Sandi <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Buat kata sandi akun bisnis"
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap buat kata sandi Anda')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <div className="mb-5.5">
                  <label htmlFor="re-type-password" className="block mb-2.5">
                    Ulangi Kata Sandi <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="reTypePassword"
                    id="re-type-password"
                    value={formData.reTypePassword}
                    onChange={handleChange}
                    required
                    placeholder="Ketik ulang kata sandi"
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap ulangi kata sandi Anda')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50"
                >
                  {loading && <Spinner className="h-5 w-5 border-white border-t-transparent border-r-transparent border-l-transparent" />}
                  {loading ? "Sedang mendaftarkan..." : "Daftar Kemitraan"}
                </button>

                <p className="text-center mt-6">
                  Sudah punya akun mitra?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Masuk Sekarang
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-blue/10 text-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-2">Verifikasi Email Anda</h3>
            <p className="text-dark-4 mb-8">
              Terima kasih telah mendaftar! Kami telah mengirimkan tautan verifikasi ke <span className="font-semibold text-dark">{formData.email}</span>. 
              Silakan periksa kotak masuk (atau folder spam) Anda dan klik tautan tersebut untuk mengaktifkan akun Anda.
            </p>
            <button
              onClick={() => router.push("/signin")}
              className="w-full bg-blue text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-all"
            >
              Sudah Verifikasi? Masuk Sekarang
            </button>
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="mt-4 flex items-center justify-center gap-2 mx-auto text-blue hover:underline text-sm font-medium disabled:opacity-50"
            >
              {resending && <Spinner className="h-4 w-4 border-blue border-t-transparent border-r-transparent border-l-transparent" />}
              {resending ? "Mengirim ulang..." : "Kirim ulang email verifikasi"}
            </button>
            <p className="mt-4 text-sm text-dark-5">
              Belum menerima email? Periksa folder spam atau tunggu beberapa saat.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;
