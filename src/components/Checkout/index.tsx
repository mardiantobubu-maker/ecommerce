"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import dynamic from "next/dynamic";
const Login = dynamic(() => import("./Login"), { ssr: false });
const Shipping = dynamic(() => import("./Shipping"), { ssr: false });
const ShippingMethod = dynamic(() => import("./ShippingMethod"), { ssr: false });
const PaymentMethod = dynamic(() => import("./PaymentMethod"), { ssr: false });
const Coupon = dynamic(() => import("./Coupon"), { ssr: false });
const BookingOption = dynamic(() => import("./BookingOption"), { ssr: false });
const DPPaymentMethod = dynamic(() => import("./DPPaymentMethod"), { ssr: false });

import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { removeAllItemsFromCart, selectTotalKodi, selectTotalPrice, selectTotalWeight, selectTotalQuantity, selectCartSubtotal } from "@/redux/features/cart-slice";
import { formatRupiah, getKodiDiscount } from "@/utils/kodiPricing";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PreLoader, { Spinner } from "../Common/PreLoader";
import Skeleton from "../Common/Skeleton";
import { useCartSync } from "@/hooks/useCartSync";

const Checkout = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const { clearAllCartSupabase } = useCartSync();
  const totalPrice = useSelector(selectTotalPrice);
  const subtotal = useSelector(selectCartSubtotal);
  const totalKodi = useAppSelector(selectTotalKodi);
  const totalWeight = useAppSelector(selectTotalWeight);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showShippingDropdown, setShowShippingDropdown] = useState(false);

  // Notes, discount, and booking states
  const [notes, setNotes] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [appliedCode, setAppliedCode] = useState("");

  const [isBooking, setIsBooking] = useState(false);
  const [bookingPeriod, setBookingPeriod] = useState("");
  const [dpOption, setDpOption] = useState("dp50");
  const [dpAmount, setDpAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState("free");
  const [courier, setCourier] = useState("Ambil di Toko");
  const [shippingCost, setShippingCost] = useState(0);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [mouUrl, setMouUrl] = useState("");
  const [uploadingMou, setUploadingMou] = useState(false);

  const handleApplyDiscount = (coupon: any, code: string) => {
    setAppliedCoupon(coupon);
    setAppliedCode(code);
  };

  const handleRemoveDiscount = () => {
    setAppliedCoupon(null);
    setAppliedCode("");
  };

  const handleBookingChange = (booking: boolean, period: string) => {
    setIsBooking(booking);
    setBookingPeriod(period);
    if (!booking) {
      setDpOption("dp50");
      setDpAmount(0);
    }
  };

  const handleDPChange = (option: string, amount: number) => {
    setDpOption(option);
    setDpAmount(amount);
  };

  const volumeDiscountInfo = getKodiDiscount(totalKodi);
  const volumeDiscountAmount = volumeDiscountInfo ? subtotal * volumeDiscountInfo.discount : 0;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = Math.round((totalPrice * appliedCoupon.discount_value) / 100);
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }
  const finalPrice = Math.max(0, totalPrice - discountAmount + shippingCost);

  useEffect(() => {
    let isMounted = true;
    const checkUserSafe = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUser(currentUser);
      
      if (currentUser) {
        const meta = currentUser.user_metadata;
        let isComplete = false;
        
        if (meta && meta.company_name && meta.whatsapp && meta.business_type && meta.store_photo_url) {
          isComplete = true;
        } else {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('company_name, whatsapp, business_type, store_photo_url')
            .eq('id', currentUser.id)
            .single();

          if (isMounted && !error && profile && profile.company_name && profile.whatsapp && profile.business_type && profile.store_photo_url) {
            isComplete = true;
          }
        }

        if (isMounted) {
          if (!isComplete) {
            setIsProfileComplete(false);
            localStorage.setItem('profile_incomplete', 'true');
            toast.error(
              (t) => (
                <div 
                  className="cursor-pointer hover:underline" 
                  onClick={() => {
                    toast.dismiss(t.id);
                    router.push("/my-account?tab=account-details");
                  }}
                >
                  Profil bisnis belum lengkap. Mohon lengkapi data untuk melanjutkan transaksi. <span className="font-bold">Klik di sini.</span>
                </div>
              ),
              {
                duration: 5000,
                icon: '⚠️'
              }
            );
          } else {
            setIsProfileComplete(true);
            localStorage.setItem('profile_incomplete', 'false');
          }
        }
      }
      if (isMounted) setLoading(false);
    };
    checkUserSafe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleUploadMou = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMou(true);
    const toastId = toast.loading("Mengunggah dokumen MOU...");

    try {
      const fileName = `mou/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(data.path);

      setMouUrl(publicUrl);
      toast.success("MOU berhasil diunggah!", { id: toastId });
    } catch (error: any) {
      toast.error("Gagal mengunggah MOU: " + error.message, { id: toastId });
    } finally {
      setUploadingMou(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Keranjang Anda kosong!");
      return;
    }

    setProcessingOrder(true);

    // 0. Validasi Kelengkapan Profil Bisnis
    if (!isProfileComplete) {
      toast.error("Profil bisnis Anda belum lengkap! Silakan lengkapi Nama Perusahaan, WhatsApp, dan Foto Toko di menu Akun.");
      setProcessingOrder(false);
      // Opsional: Buka modal lengkapi profil atau arahkan ke dashboard
      router.push("/my-account?tab=account-details"); 
      return;
    }

    // 1. Validasi Alamat Pengiriman
    if (!shippingAddress ||
      !shippingAddress.recipientName ||
      !shippingAddress.streetAddress ||
      !shippingAddress.kelurahan ||
      !shippingAddress.kecamatan ||
      !shippingAddress.kota ||
      !shippingAddress.provinsi ||
      !shippingAddress.kodePos ||
      !shippingAddress.phone) {
      toast.error("Silakan lengkapi alamat pengiriman Anda!");
      setShowShippingDropdown(true); // Buka jika belum lengkap
      setProcessingOrder(false);
      return;
    }

    // Jika alamat sudah lengkap, tutup dropdown alamat
    setShowShippingDropdown(false);

    if (paymentMethod === "invoice" && !mouUrl) {
      toast.error("Wajib mengunggah dokumen kerjasama MOU untuk metode ini!");
      setProcessingOrder(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Silakan masuk untuk melakukan pemesanan");
        setShowLoginDropdown(true); // Buka dropdown login
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setProcessingOrder(false);
        return;
      }

      // Jika sudah login, pastikan dropdown login tertutup
      setShowLoginDropdown(false);

      // 1. Ensure profile exists in public.profiles to satisfy fk_orders_user
      // This is critical for social login users who may not have a profile row yet.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
          company_name: user.user_metadata?.company_name || "",
          whatsapp: user.user_metadata?.whatsapp || "",
          business_type: user.user_metadata?.business_type || "",
          store_photo_url: user.user_metadata?.store_photo_url || "",
        }, { onConflict: 'id' });

      if (profileError) {
        console.error("Profile sync error details:", profileError);
        toast.error(`Gagal sinkronisasi akun: ${profileError.message}. Silakan coba lagi.`);
        setLoading(false);
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            status: 'pending',
            total_amount: finalPrice,
            items: cartItems,
            notes: notes,
            payment_method: paymentMethod,
            shipping_method: shippingMethod,
            shipping_cost: shippingCost,
            is_booking: isBooking,
            booking_period: bookingPeriod,
            shipping_address: shippingAddress,
            payment_proof: paymentMethod === 'invoice' ? mouUrl : null,
            dp_option: isBooking ? dpOption : null,
            dp_amount: isBooking ? (dpAmount || Math.round(finalPrice * 0.5)) : null,
            courier: courier,
          }
        ])
        .select()
        .single();

      if (orderError) {
        console.error("Order insertion error details:", orderError);
        throw orderError;
      }

      // 3. Tambahkan Notifikasi untuk User
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          type: 'order',
          title: 'Pesanan Berhasil Dibuat!',
          message: `Pesanan Anda #${orderData?.id?.slice(-6).toUpperCase() || 'BARU'} telah berhasil kami terima dan sedang menunggu verifikasi.`,
          link: `/transactions?id=${orderData?.id}`,
          status: 'Pending'
        }
      ]);

      // 4. Sinkronisasi Alamat ke tabel 'addresses' secara otomatis
      try {
        // 1. Ambil semua alamat user untuk pengecekan manual
        const { data: allAddresses } = await supabase
          .from('addresses')
          .select('id, recipient_name, street_address')
          .eq('user_id', user.id);

        // 2. Cari apakah ada yang SANGAT identik (Nama + Jalan)
        const existingIdentical = allAddresses?.find(a => 
          a.recipient_name === shippingAddress.recipientName && 
          a.street_address === shippingAddress.streetAddress
        );

        const addressData: any = {
          user_id: user.id,
          recipient_name: shippingAddress.recipientName,
          street_address: shippingAddress.streetAddress,
          kelurahan: shippingAddress.kelurahan,
          kecamatan: shippingAddress.kecamatan,
          kota: shippingAddress.kota,
          provinsi: shippingAddress.provinsi,
          kode_pos: shippingAddress.kodePos,
          name: `Alamat ${shippingAddress.recipientName}`,
          address: `[WA:${shippingAddress.phone}] ${shippingAddress.streetAddress}, ${shippingAddress.kelurahan}, ${shippingAddress.kecamatan}, ${shippingAddress.kota}, ${shippingAddress.provinsi}, ${shippingAddress.kodePos}`,
          phone: shippingAddress.phone,
          whatsapp: shippingAddress.phone,
          is_default: (allAddresses?.length === 0)
        };

        const trySync = async (data: any) => {
          if (existingIdentical) {
            return await supabase.from('addresses').update(data).eq('id', existingIdentical.id);
          } else {
            return await supabase.from('addresses').insert([data]);
          }
        };

        let { error: syncError } = await trySync(addressData);

        // Fallback jika kolom 'whatsapp' atau 'phone' tidak ada di database
        if (syncError && (syncError.message.includes('whatsapp') || syncError.message.includes('phone') || syncError.code === 'PGRST204')) {
          console.warn("Retrying address sync without whatsapp/phone columns...");
          const fallbackData = { ...addressData };
          delete fallbackData.whatsapp;
          delete fallbackData.phone;
          const retry = await trySync(fallbackData);
          syncError = retry.error;
        }

        if (syncError) {
          console.error("Gagal sinkronisasi alamat:", syncError);
          toast.error(`Gagal simpan alamat: ${syncError.message}`);
        }
      } catch (e) {
        console.error("Kesalahan sistem saat sinkronisasi alamat:", e);
      }

      // Clear cart from BOTH local state AND Supabase database
      // This prevents the background SyncInitializer from restoring items from the DB
      await clearAllCartSupabase();
      dispatch(removeAllItemsFromCart());
      router.push(`/transactions?id=${orderData?.id}`); // Redirect to transactions with auto-open modal
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat pesanan");
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) return (
    <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0 py-10 lg:py-20 flex flex-col gap-6">
      <Skeleton className="w-1/3 h-8 mb-4" />
      <div className="flex flex-col lg:flex-row gap-7.5">
        <Skeleton className="w-full lg:w-2/3 h-96" />
        <Skeleton className="w-full lg:w-1/3 h-96" />
      </div>
    </div>
  );

  return (
    <>
      <Breadcrumb title={"Pembayaran"} pages={["pembayaran"]} />

      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* Coupon Box (Desktop & Mobile) */}
                <div className="mb-7.5">
                  <Coupon 
                    onApplyDiscount={handleApplyDiscount} 
                    appliedCode={appliedCode} 
                    onRemoveDiscount={handleRemoveDiscount} 
                  />
                </div>
                {/* <!-- login box --> */}
                {!user && (
                  <Login isOpen={showLoginDropdown} setIsOpen={setShowLoginDropdown} />
                )}

                {/* <!-- address box two --> */}
                <Shipping 
                  onChange={(data) => setShippingAddress(data)} 
                  isOpen={showShippingDropdown} 
                  setIsOpen={setShowShippingDropdown} 
                />
                
                {/* <!-- booking options --> */}
                <BookingOption onBookingChange={handleBookingChange} />

                {/* <!-- DP Payment Method (hanya untuk booking) --> */}
                {isBooking && (
                  <DPPaymentMethod
                    totalPrice={finalPrice}
                    dpOption={dpOption}
                    onDPChange={handleDPChange}
                  />
                )}

              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* // <!-- shipping box --> */}
                <ShippingMethod 
                  isBooking={isBooking}
                  totalWeight={totalWeight}
                  destination={shippingAddress}
                  onShippingChange={(method, cost, courierLabel) => {
                    setShippingMethod(method);
                    setShippingCost(cost);
                    setCourier(courierLabel);
                    if (method === "free") {
                      setPaymentMethod("cash");
                    } else if (method === "jne" || method === "jnt") {
                      setPaymentMethod("bank");
                    }
                  }} 
                />

                {/* <!-- payment box --> */}
                <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} isBooking={isBooking} shippingMethod={shippingMethod} />

                {/* <!-- MOU Upload for B2B --> */}
                {paymentMethod === 'invoice' && (
                  <div className="bg-white shadow-1 rounded-[10px] mt-7.5 p-6 sm:p-8 border-2 border-dashed border-blue/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center text-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-dark">Kerjasama MOU (Wajib)</h4>
                        <p className="text-xs text-dark-4">Silakan unggah dokumen MOU instansi/sekolah Anda.</p>
                      </div>
                    </div>

                    <label className={`flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${mouUrl ? "border-green bg-green/5" : "border-gray-3 hover:border-blue bg-gray-50"}`}>
                      {mouUrl ? (
                        <>
                          <div className="w-12 h-12 bg-green/20 rounded-full flex items-center justify-center text-green mb-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <p className="text-sm font-bold text-green">MOU Telah Diunggah</p>
                          <p className="text-xs text-dark-4">Klik untuk mengganti dokumen</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gray-2 rounded-full flex items-center justify-center text-dark-4 mb-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          </div>
                          <p className="text-sm font-bold text-dark">Pilih File MOU</p>
                          <p className="text-xs text-dark-4">Format: JPG, PNG, atau PDF</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleUploadMou}
                        accept="image/*,application/pdf"
                        disabled={uploadingMou}
                      />
                    </label>
                    {uploadingMou && <p className="text-center text-xs text-blue mt-4 animate-pulse font-medium">Sedang memproses dokumen...</p>}
                  </div>
                )}

                {/* <!-- order list box (Accordion) --> */}
                <div className="bg-white shadow-1 rounded-[10px] overflow-hidden mt-7.5">
                  <div 
                    className="flex items-center justify-between border-b border-gray-3 py-5 px-4 sm:px-8.5 cursor-pointer hover:bg-gray-1 transition-colors duration-200"
                    onClick={() => setIsOrdersOpen(!isOrdersOpen)}
                  >
                    <div className="flex items-center gap-4 text-dark">
                      <div className="w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center text-blue shrink-0 shadow-sm border border-blue/5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-black text-blue uppercase tracking-[0.15em] leading-none mb-1.5">Rincian Barang</span>
                        <span className="font-medium text-[18px] sm:text-xl">Pesanan Anda</span>
                      </div>
                    </div>
                    <span className={`transform transition-transform duration-300 ${isOrdersOpen ? "rotate-180" : ""}`}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>

                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOrdersOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Produk</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* <!-- product item --> */}
                    {cartItems.map((item, key) => {
                      const isWholesale = item.quantity >= 20 && item.quantity % 20 === 0;
                      return (
                        <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3">
                          <div className="flex-1 pr-4">
                            <p className="text-dark font-medium">{item.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs bg-gray-2 text-dark-4 px-2 py-0.5 rounded">
                                {(item.quantity / 20).toLocaleString("id-ID")} Kodi ({(item.quantity || 0).toLocaleString("id-ID")} Unit)
                              </span>
                              {(item.sleeve || item.color) && (
                                <span className="text-[10px] font-bold text-blue bg-blue/5 px-2 py-0.5 rounded uppercase tracking-wider border border-blue/10">
                                  {[item.color, item.sleeve].filter(Boolean).join(' ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-dark font-bold">{formatRupiah(item.discountedPrice * item.quantity)}</p>
                            {isWholesale && (
                              <p className="text-[10px] text-[#3C50E0] font-bold">{formatRupiah(item.discountedPrice * 20)} / kodi</p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* <!-- shipping item --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Biaya Pengiriman</p>
                        <p className="text-xs text-dark-4">
                          {shippingMethod === "free" ? "Ambil di Toko" : shippingMethod === "jne" ? "JNE Reguler" : shippingMethod === "jnt" ? "J&T Express" : shippingMethod === "sicepat" ? "SiCepat REG" : shippingMethod === "anteraja" ? "Anteraja Reguler" : "Ekspedisi"}
                        </p>
                      </div>
                      <div>
                        <p className={`text-right font-medium ${shippingCost === 0 ? "text-green" : "text-dark"}`}>
                          {shippingCost === 0 ? "Gratis" : `Rp${shippingCost.toLocaleString("id-ID")}`}
                        </p>
                      </div>
                    </div>

                    {/* <!-- volume discount item --> */}
                    {volumeDiscountAmount > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3 bg-orange/5 -mx-4 sm:-mx-8.5 px-4 sm:px-8.5">
                        <div>
                          <p className="text-orange font-bold">Potongan Volume ({totalKodi}+ Kodi)</p>
                          <p className="text-orange text-xs">
                            Diskon {volumeDiscountInfo?.label.split("→")[1].trim()}
                          </p>
                        </div>
                        <div>
                          <p className="text-orange text-right font-bold">-{formatRupiah(volumeDiscountAmount)}</p>
                        </div>
                      </div>
                    )}

                    {/* <!-- discount item --> */}
                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-green">Diskon ({appliedCode})</p>
                          <p className="text-green text-xs">
                            {appliedCoupon?.discount_type === 'percentage' ? `-${appliedCoupon.discount_value}%` : `-${appliedCoupon?.discount_value?.toLocaleString('id-ID')}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-green text-right font-medium">-{formatRupiah(discountAmount)}</p>
                        </div>
                      </div>
                    )}

                    {/* <!-- booking info item --> */}
                    {isBooking && (
                      <div className="border-b border-gray-3 bg-blue/5 -mx-4 sm:-mx-8.5 px-4 sm:px-8.5 mt-2">
                        <div className="py-3">
                          <p className="text-sm text-blue mb-1 font-medium">Jadwal Pengiriman (Pre-Order):</p>
                          <p className="text-sm text-dark">{bookingPeriod}</p>
                        </div>
                        <div className="py-3 border-t border-blue/10">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-blue font-medium">Dibayar Sekarang ({dpOption === 'dp30' ? '30%' : dpOption === 'dp50' ? '50%' : '100%'}):</p>
                            <p className="text-sm font-bold text-blue">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(dpAmount || Math.round(finalPrice * 0.5))}</p>
                          </div>
                          {dpOption !== 'lunas' && (
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-dark-4">Sisa Pelunasan:</p>
                              <p className="text-xs font-bold text-dark">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(finalPrice - (dpAmount || Math.round(finalPrice * 0.5)))}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          {formatRupiah(finalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] overflow-hidden mt-7.5 mb-7.5">
                  <div className="py-5 px-4 sm:px-8.5 border-b border-gray-3 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center text-blue shrink-0 shadow-sm border border-blue/5">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-black text-blue uppercase tracking-[0.15em] leading-none mb-1.5">Informasi Tambahan</span>
                      <span className="font-medium text-[18px] sm:text-xl">Catatan Lainnya</span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-8.5">
                    <textarea
                      name="notes"
                      id="notes"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Catatan tentang pesanan Anda, mis. catatan khusus untuk pengiriman."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>

                {/* <!-- checkout button --> */}
                <button
                  type="button"
                  disabled={processingOrder || !isProfileComplete}
                  className={`w-full flex items-center justify-center gap-2 font-bold text-white py-4 px-6 rounded-lg ease-out duration-200 mt-7.5 shadow-lg uppercase tracking-wider ${
                    !isProfileComplete 
                      ? "bg-gray-4 cursor-not-allowed opacity-70" 
                      : "bg-blue hover:bg-blue-dark active:scale-95"
                  }`}
                  onClick={handlePlaceOrder}
                >
                  {processingOrder && <Spinner className="h-5 w-5 border-white border-t-transparent border-r-transparent border-l-transparent" />}
                  {processingOrder 
                    ? "Sedang Memproses..." 
                    : !isProfileComplete 
                      ? "Lengkapi Profil untuk Order" 
                      : "Konfirmasi Pesanan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;
