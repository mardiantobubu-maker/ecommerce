"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const OAuthSuccessHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAuthAndShowModal = async () => {
      const isGoogleLogin = searchParams.get("google_signup") === "true";
      const isEmailVerified = searchParams.get("verified") === "true";
      
      // Jika tidak ada pemicu signup/verify, kita tetap cek session sesekali
      if (!isGoogleLogin && !isEmailVerified) return;

      // Ambil data user yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      // Cek apakah profil bisnis sudah lengkap di tabel 'profiles'
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name, whatsapp")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      // Jika data penting masih kosong, tampilkan modal
      const isIncomplete = !profile?.company_name || !profile?.whatsapp;
      
      const alreadyShown = sessionStorage.getItem("oauth_modal_shown");
      if (isIncomplete && !alreadyShown) {
        setShowModal(true);
        sessionStorage.setItem("oauth_modal_shown", "true");
      }
      
      // Bersihkan URL dari parameter pemicu
      if (isGoogleLogin || isEmailVerified) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    };

    checkAuthAndShowModal();
    return () => { isMounted = false; };
  }, [searchParams, router]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[24px] shadow-2xl max-w-md w-full p-8 sm:p-10 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green/10 text-green rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-black text-dark mb-3 tracking-tight">Registrasi Berhasil!</h3>
        <p className="text-dark-4 text-sm sm:text-base mb-10 leading-relaxed">
          Terima kasih telah bergabung. Lengkapi profil bisnis Anda sekarang untuk mendapatkan akses penuh ke harga grosir dan fitur transaksi eksklusif kami.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-blue text-white font-black py-4 px-6 rounded-xl hover:bg-blue-dark active:scale-[0.98] transition-all shadow-lg shadow-blue/20 uppercase tracking-widest text-xs"
          >
            Mulai Belanja
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              router.push("/dashboard/settings");
            }}
            className="w-full bg-gray-1 text-dark font-black py-4 px-6 rounded-xl border border-gray-3 hover:bg-gray-2 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
          >
            Lengkapi Profil Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccessHandler;
