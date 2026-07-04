"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { Spinner } from "./PreLoader";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // 1. Cek apakah email sudah terdaftar
      const { data: existing, error: checkError } = await supabase
        .from('subscribers')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        toast.error("Email ini sudah terdaftar sebelumnya.");
        setLoading(false);
        return;
      }

      // 2. Ambil kode kupon terbaru (atau default jika 403/Forbidden)
      let couponCode = "WELCOME10";
      let discText = "10%";

      try {
        const { data: coupon, error: couponError } = await supabase
          .from('coupons')
          .select('code, discount_type, discount_value')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (coupon && !couponError) {
          couponCode = coupon.code;
          discText = coupon.discount_type === 'percentage' 
            ? `${coupon.discount_value}%` 
            : `Rp${coupon.discount_value.toLocaleString('id-ID')}`;
        }
      } catch (e) {
        console.warn("Could not fetch latest coupon, using default:", e);
      }

      // 3. Simpan ke daftar subscriber
      const { error: insertError } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (insertError) {
        if (insertError.code === '42501' || insertError.message.includes('Forbidden')) {
          throw new Error("Izin akses ditolak. Silakan hubungi admin untuk aktivasi RLS.");
        }
        throw insertError;
      }

      // 4. Kirim notifikasi ke user (jika login & diizinkan)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('notifications').insert([{
            user_id: user.id,
            title: "Hadiah Berlangganan! 🎉",
            message: `Terima kasih telah berlangganan! Gunakan kode kupon ${couponCode} untuk mendapatkan diskon ${discText} pada pesanan Anda berikutnya.`,
            link: "/shop"
          }]);
        }
      } catch (e) {
        console.warn("Could not create notification record:", e);
      }

      // 5. Tampilkan toast sukses dengan info kupon
      toast.success(
        (t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-dark">Berhasil Berlangganan!</span>
            <span className="text-sm">Gunakan kode: <b className="text-blue">{couponCode}</b></span>
            <span className="text-xs text-dark-4">Diskon {discText} untuk Anda!</span>
          </div>
        ),
        { duration: 6000 }
      );
      
      setEmail("");
    } catch (error) {
      console.error("Newsletter error:", error);
      toast.error("Gagal berlangganan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden pb-10 lg:pb-25">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-xl shadow-lg transform hover:scale-[1.01] transition-all duration-300">
          {/* <!-- bg shapes --> */}
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="background illustration"
            fill
            sizes="(max-width: 1170px) 100vw, 1170px"
            className="absolute -z-1 object-cover rounded-xl"
          />
          <div className="absolute -z-1 max-w-[523px] max-h-[243px] w-full h-full right-0 top-0 bg-gradient-1 opacity-80"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 xl:pl-12.5 xl:pr-14 py-11 bg-blue/10 backdrop-blur-sm">
            <div className="max-w-[491px] w-full">
              <h2 className="max-w-[399px] text-white font-bold text-base sm:text-xl xl:text-heading-4 mb-3 leading-tight">
                Jangan Lewatkan Tren & Penawaran Terbaru
              </h2>
              <p className="text-white/90">
                Daftar untuk menerima kabar tentang penawaran terbaru & kode diskon khusus mitra.
              </p>
            </div>

            <div className="max-w-[477px] w-full">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Masukkan email Anda"
                    className="w-full bg-white/90 border border-transparent outline-none rounded-md placeholder:text-dark-4 py-3.5 px-6 focus:bg-white focus:ring-2 focus:ring-blue/50 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center items-center py-3.5 px-8 text-white bg-blue font-bold rounded-md ease-out duration-200 hover:bg-blue-dark shadow-lg transform active:scale-95 disabled:opacity-50 min-w-[160px]"
                  >
                    {loading ? (
                      <Spinner className="h-5 w-5 border-white" />
                    ) : (
                      "Berlangganan"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
