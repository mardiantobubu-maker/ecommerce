"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";
import { Spinner } from "@/components/Common/PreLoader";

const Signin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");


  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  React.useEffect(() => {
    if (verified === "true") {
      toast.success("Email Anda telah berhasil diverifikasi! Silakan masuk.");
    }
  }, [verified]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/my-account");
      }
    });
  }, [router]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loginId = formData.email.includes("@") ? formData.email : `${formData.email}@seragam.id`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginId,
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      // Supabase mungkin menolak login jika email belum diverifikasi
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.error("Email Anda belum diverifikasi. Silakan cek kotak masuk email Anda.");
      } else {
        toast.error(translateError(error.message));
      }
    } else {
      // Cek manual apakah email sudah diverifikasi
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        // Email belum diverifikasi - logout dan beri tahu user
        await supabase.auth.signOut();
        toast.error("Email Anda belum diverifikasi. Silakan cek kotak masuk atau folder spam email Anda untuk tautan verifikasi.");
        return;
      }
      toast.success("Berhasil masuk!");
      
      // Teruskan parameter verified agar modal sukses muncul di home
      const isVerified = window.location.search.includes("verified=true");
      router.push(isVerified ? "/?verified=true" : "/");
    }
  };

  const signInWithOAuth = async (provider: 'google') => {
    // alert(`Mencoba masuk dengan ${provider}...`);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        toast.error(translateError(error.message));
      }
    } catch (err: any) {
      alert(`System Error: ${err.message}`);
    }
  };

  return (
    <>
      <Breadcrumb title={"Masuk"} pages={["Masuk"]} />
      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue/10 text-blue mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
              </div>
              <h2 className="font-bold text-2xl sm:text-3xl text-dark mb-2 tracking-tight">
                Selamat Datang!
              </h2>
              <p className="text-dark-4 text-base sm:text-lg">
                Gunakan nomor WhatsApp dan kata sandi Anda
              </p>
            </div>

            <div>
              <form onSubmit={handleSignIn}>
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Nomor WhatsApp / Email
                  </label>

                  <input
                    type="text"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nomor WA atau email"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap masukkan nomor WA atau email Anda')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Kata Sandi
                  </label>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan kata sandi"
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap masukkan kata sandi Anda')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50"
                >
                  {loading && <Spinner className="h-5 w-5 border-white border-t-transparent border-r-transparent border-l-transparent" />}
                  {loading ? "Sedang masuk..." : "Masuk ke akun"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="block w-full text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                >
                  Lupa kata sandi Anda?
                </button>

                <span className="relative z-1 block font-medium text-center mt-4.5">
                  <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                  <span className="inline-block px-3 bg-white">Atau</span>
                </span>

                <div className="flex flex-col gap-4.5 mt-4.5">
                  <button
                    type="button"
                    onClick={() => signInWithOAuth('google')}
                    className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
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
                    Masuk dengan Google
                  </button>

                </div>

                <p className="text-center mt-6">
                  Belum punya akun?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Daftar Sekarang
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center animate-fade-in-up">
            <h3 className="text-2xl font-bold text-dark mb-4">Lupa Kata Sandi?</h3>
            <p className="text-dark-4 mb-6 text-sm">
              Masukkan Alamat Email Anda yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Contoh: email@perusahaan.com"
              className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 mb-6 text-left"
            />
            <div className="flex flex-col-reverse sm:flex-row gap-4">
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full bg-gray-2 text-dark font-medium py-3 px-6 rounded-lg hover:bg-gray-3 transition-all"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  if (!resetEmail) {
                    toast.error("Harap masukkan email Anda");
                    return;
                  }
                  
                  setLoading(true);
                  const loginId = resetEmail.includes("@") ? resetEmail : `${resetEmail}@seragam.id`;
                  
                  try {
                    const response = await fetch("/api/auth/forgot-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: loginId }),
                    });

                    let result;
                    try {
                      const clonedResponse = response.clone();
                      result = await response.json();
                    } catch (e) {
                      const text = await response.text();
                      console.error("Server returned non-JSON response:", text);
                      toast.error("Server error: " + (text.slice(0, 100) || "Terjadi kesalahan internal"));
                      setLoading(false);
                      return;
                    }

                    if (response.ok) {
                      toast.success("Instruksi reset kata sandi telah dikirim ke email Anda!");
                      setShowForgotModal(false);
                      setResetEmail("");
                    } else {
                      toast.error(translateError(result.message || "Gagal mengirim email reset."));
                    }
                  } catch (err: any) {
                    console.error("System error:", err);
                    toast.error(translateError(err.message || "Terjadi kesalahan sistem"));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading && <Spinner className="h-5 w-5 border-white border-t-transparent border-r-transparent border-l-transparent" />}
                Kirim Tautan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signin;
