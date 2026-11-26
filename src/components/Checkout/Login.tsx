import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { translateError } from "@/lib/error-translator";
import Link from "next/link";

const Login = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  if (user) return null;

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

    const { error } = await supabase.auth.signInWithPassword({
      email: loginId,
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      toast.error(translateError(error.message));
    } else {
      toast.success("Berhasil masuk!");
      setIsOpen(false);
      // Refresh the router so the checkout page can re-evaluate the auth state
      router.refresh();
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] overflow-hidden">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center justify-between py-5 px-4 sm:px-8.5 hover:bg-gray-1 transition-colors duration-200 ${
          isOpen && "border-b border-gray-3 bg-gray-1/50"
        }`}
      >
        <div className="flex items-center gap-4 text-dark">
          <div className="w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center text-blue shrink-0 shadow-sm border border-blue/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black text-blue uppercase tracking-[0.15em] leading-none mb-1.5">Akses Akun</span>
            <div className="flex items-center gap-1">
              Pelanggan Lama?
              <span className="font-bold text-blue hover:underline pl-1">
                Klik di sini untuk masuk
              </span>
            </div>
          </div>
        </div>
        <svg
          className={`${
            isOpen && "rotate-180"
          } fill-current ease-out duration-200 text-dark-4`}
          width="20"
          height="20"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
          />
        </svg>
      </div>

      {/* <!-- dropdown content --> */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } pt-7.5 pb-8.5 px-4 sm:px-8.5 animate-fadeIn`}
      >
        <p className="text-custom-sm mb-6 text-dark-4">
          Gunakan nomor WhatsApp atau email Anda yang terdaftar untuk melanjutkan pesanan.
        </p>

        <form onSubmit={handleSignIn}>
          <div className="mb-5">
            <label htmlFor="login-email" className="block mb-2.5 font-medium text-dark">
              Nomor WhatsApp / Email
            </label>

            <input
              type="text"
              name="email"
              id="login-email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="0812XXXXXXXX atau email@anda.com"
              className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="mb-5 relative">
            <div className="flex items-center justify-between mb-2.5">
              <label htmlFor="password-login" className="font-medium text-dark">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-blue hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password-login"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 pr-12 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 hover:text-dark"
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-medium text-white bg-blue py-3 px-10.5 rounded-lg shadow-md ease-out duration-200 hover:bg-blue-dark active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sedang masuk..." : "Masuk Sekarang"}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal (Ported from Signin) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center animate-fade-in-up">
            <h3 className="text-2xl font-bold text-dark mb-4">Lupa Kata Sandi?</h3>
            <p className="text-dark-4 mb-6 text-sm">
              Masukkan Alamat Email atau nomor WhatsApp Anda yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>
            <input
              type="text"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="0812XXXXXXXX atau email@anda.com"
              className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 mb-6"
            />
            <div className="flex flex-col-reverse sm:flex-row gap-4">
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full bg-gray-2 text-dark font-medium py-3 px-6 rounded-lg hover:bg-gray-3 transition-all"
              >
                Batal
              </button>
              <button
                disabled={loading}
                onClick={async () => {
                  if (!resetEmail) {
                    toast.error("Harap masukkan nomor WA atau email Anda");
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

                    if (response.ok) {
                      toast.success("Instruksi reset kata sandi telah dikirim!");
                      setShowForgotModal(false);
                      setResetEmail("");
                    } else {
                      const result = await response.json();
                      toast.error(translateError(result.message || "Gagal mengirim email reset."));
                    }
                  } catch (err: any) {
                    toast.error(translateError(err.message || "Terjadi kesalahan sistem"));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full bg-blue text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? "Mengirim..." : "Kirim Tautan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
