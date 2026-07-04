"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { Suspense } from "react";

const TrackingContent = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchOrderSafe = async () => {
      if (!orderId) {
        if (isMounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), profiles(full_name)")
        .eq("id", orderId)
        .single();

      if (!isMounted) return;

      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrderSafe();

    // Realtime updates
    const channel = supabase
      .channel(`tracking_${orderId}_v2`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (isMounted) {
            setOrder((prev: any) => ({ ...prev, ...payload.new }));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const handleRatingSubmit = async () => {
    setIsSubmittingRating(true);
    try {
      const { error } = await supabase.from('testimonials').insert([{
        name: order.profiles?.full_name || "Pelanggan",
        role: "Pembeli Seragam",
        comment: comment || "Pesanan telah diterima dengan baik.",
        rating: rating,
        image_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
      }]);

      if (error) throw error;
      
      const toast = (await import("react-hot-toast")).default;
      toast.success("Terima kasih atas penilaian Anda!");
      setIsRatingOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white pb-24">
        <Breadcrumb title="Lacak Pengiriman" pages={["Transaksi", "Lacak"]} />
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto"></div>
          <p className="text-sm text-dark-4 mt-4">Memuat data pengiriman...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-white pb-24">
        <Breadcrumb title="Lacak Pengiriman" pages={["Transaksi", "Lacak"]} />
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-gray-1 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#AAB4C8" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">Pesanan tidak ditemukan</h3>
          <p className="text-dark-4 mb-6">Data pesanan tidak tersedia atau ID tidak valid.</p>
          <Link href="/transactions" className="inline-flex items-center gap-2 py-3 px-8 bg-blue text-white font-bold rounded-full hover:bg-blue-dark transition-all">
            ← Kembali ke Transaksi
          </Link>
        </div>
      </main>
    );
  }

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-";

  const formattedTotal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(order.total_amount || 0));

  const items = order.order_items || [];

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + 
           " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const statusOrder = ["pending", "processing", "shipping", "delivered"];
  const currentIdx = statusOrder.indexOf(order.status);

  const isPickup = order.shipping_method === "free";

  const statusSteps = [
    { 
      key: "pending", label: "Pesanan Dibuat", 
      desc: "Pesanan telah diterima dan menunggu konfirmasi",
      time: order.created_at ? formatDateTime(order.created_at) : ""
    },
    { 
      key: "processing", label: "Diproses", 
      desc: "Pesanan sedang diproses dan disiapkan",
      time: currentIdx >= 1 && order.updated_at ? formatDateTime(order.updated_at) : ""
    },
    { 
      key: "shipping", label: isPickup ? "Siap Diambil" : "Dikirim", 
      desc: isPickup ? "Pesanan siap diambil di lokasi produksi" : (order.tracking_number ? `No. Resi: ${order.tracking_number}` : "Pesanan dalam perjalanan"),
      time: currentIdx >= 2 && order.updated_at ? formatDateTime(order.updated_at) : ""
    },
    { 
      key: "delivered", label: "Selesai", 
      desc: isPickup ? "Pesanan telah diambil oleh pembeli" : "Pesanan telah tiba di tujuan",
      time: currentIdx >= 3 && order.updated_at ? formatDateTime(order.updated_at) : ""
    },
  ];

  const stepIcons: Record<string, (color: string) => React.ReactNode> = {
    pending: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    processing: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    shipping: (color) => isPickup ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    delivered: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  };

  const getTrackingLogs = () => {
    if (!order.tracking_number) return [];
    
    const logs = [
      { status: "Pesanan telah tiba di tujuan", location: "Alamat Penerima", time: order.status === 'delivered' ? formatDateTime(order.updated_at) : null },
      { status: "Paket dibawa kurir menuju alamat", location: "Kurir J&T Express", time: order.status === 'shipping' ? formatDateTime(order.updated_at) : null },
      { status: "Paket tiba di gudang transit", location: "Jakarta Selatan", time: order.status === 'shipping' ? formatDateTime(new Date(new Date(order.updated_at).getTime() - 7200000).toISOString()) : null },
      { status: "Paket dikirim dari gudang asal", location: "Gudang Pusat Seragam", time: order.status === 'shipping' ? formatDateTime(new Date(new Date(order.updated_at).getTime() - 14400000).toISOString()) : null },
      { status: "Pesanan diproses oleh penjual", location: "Sistem", time: formatDateTime(order.created_at) }
    ];

    return logs.filter(l => l.time !== null);
  };

  const trackingLogs = getTrackingLogs();

  return (
    <main className="min-h-screen bg-[#f1f5f9] pb-24">
      <Breadcrumb title="Lacak Pengiriman" pages={["Transaksi", "Lacak"]} />

      <div className="max-w-[600px] mx-auto px-4 py-6">
        {/* Header Order Card */}
        <div className="bg-white rounded-[24px] shadow-xl shadow-blue/5 border border-gray-2 p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-dark-4 uppercase tracking-[0.2em] mb-2">ID Pesanan</p>
              <h2 className="text-2xl font-black text-[#212121]">#{order.id.slice(-8).toUpperCase()}</h2>
            </div>
            <div className={`py-2 px-5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${
              order.status === "delivered" ? "bg-green shadow-green/20" :
              order.status === "shipping" ? "bg-blue shadow-blue/20" :
              order.status === "processing" ? "bg-orange shadow-orange/20" :
              order.status === "pending" ? "bg-red shadow-red/20" :
              "bg-dark-5"
            }`}>
              {order.status === "delivered" ? "Diterima" :
               order.status === "shipping" ? "Dikirim" :
               order.status === "processing" ? "Diproses" :
               order.status === "pending" ? "Menunggu" : order.status}
            </div>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-gray-1 pt-5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-dark-4 uppercase tracking-widest mb-0.5">Tanggal</span>
              <span className="font-bold text-dark">{formattedDate}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-dark-4 uppercase tracking-widest mb-0.5">Total Bayar</span>
              <span className="font-black text-blue text-lg">{formattedTotal}</span>
            </div>
          </div>
        </div>

        {/* Tracking Number Display Card */}
        {order.tracking_number && (
          <div className="bg-white rounded-[24px] border border-gray-2 p-6 mb-6 shadow-xl shadow-blue/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue/10 flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-blue uppercase tracking-[0.2em] mb-1">Nomor Resi {order.courier ? `(${order.courier})` : ""}</p>
                <p className="text-xl font-black text-[#212121] tracking-wider">{order.tracking_number}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.tracking_number);
                  import("react-hot-toast").then(({ default: toast }) => toast.success("Nomor resi disalin!"));
                }}
                className="w-10 h-10 flex items-center justify-center bg-gray-1 text-dark-4 rounded-xl hover:bg-blue hover:text-white transition-all shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Realtime Timeline Card */}
        <div className="bg-white rounded-[24px] border border-gray-2 shadow-xl shadow-blue/5 p-6 mb-6">
          <h3 className="text-[14px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2" style={{ color: "#212121" }}>
            Status Pengiriman
          </h3>

          <div className="relative pl-2">
            {statusSteps.map((step, i) => {
              const isActive = i <= currentIdx;
              const isCurrent = i === currentIdx;
              const iconColor = isCurrent ? "#ffffff" : isActive ? "#3C50E0" : "#AAB4C8";
              return (
                <div key={step.key} className="flex gap-6 relative">
                  {/* Vertical Line */}
                  {i < statusSteps.length - 1 && (
                    <div className={`absolute left-[20px] top-[40px] w-[3px] h-[calc(100%-20px)] rounded-full transition-all duration-700 ${i < currentIdx ? "bg-blue shadow-[0_0_10px_rgba(60,80,224,0.3)]" : "bg-gray-2"}`} />
                  )}

                  {/* Dot / Icon Container */}
                  <div className={`relative z-10 w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    isCurrent ? "bg-blue text-white shadow-xl shadow-blue/30 scale-110 -rotate-3" :
                    isActive ? "bg-blue/10 text-blue" :
                    "bg-gray-1 text-dark-5"
                  }`}>
                    {stepIcons[step.key]?.(iconColor)}
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue border-2 border-white"></span>
                      </span>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className={`pb-10 flex-1 transition-opacity duration-500 ${!isActive ? "opacity-40" : "opacity-100"}`}>
                    <div className="flex justify-between items-start">
                      <p className={`font-black text-[15px] uppercase tracking-wide ${isCurrent ? "text-blue" : "text-[#212121]"}`}>
                        {step.label}
                      </p>
                    </div>
                    <p className={`text-[12px] mt-1 leading-relaxed ${isCurrent ? "text-dark-3 font-medium" : "text-dark-5"}`}>
                      {step.desc}
                    </p>
                    {step.time && isActive && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-dark-5 opacity-50">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className="text-[10px] text-dark-5 font-black uppercase tracking-widest">{step.time}</span>
                      </div>
                    )}

                    {/* Detailed Logs for 'Shipping' phase */}
                    {step.key === "shipping" && isCurrent && trackingLogs.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-1 rounded-2xl border border-gray-2 space-y-4 animate-fadeIn">
                        {trackingLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue mt-1.5 shrink-0" />
                            <div>
                              <p className="text-[11px] font-bold text-dark leading-tight">{log.status}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-dark-4 font-medium uppercase tracking-tighter">{log.location}</span>
                                <span className="text-[9px] text-dark-5">•</span>
                                <span className="text-[9px] text-dark-5 font-medium italic">{log.time?.split(' · ')[1]}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Products Card */}
        {items.length > 0 && (
          <div className="bg-white rounded-[24px] border border-gray-2 shadow-xl shadow-blue/5 p-6 mb-6">
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: "#212121" }}>
              Produk Dikirim
            </h3>
            <div className="space-y-3">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-1 rounded-xl">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name || item.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-dark truncate">{item.product_name || item.name || "Produk"}</p>
                    <p className="text-[11px] text-dark-4">
                      {item.quantity} pcs
                      {item.color && ` · ${item.color}`}
                      {item.size && ` · ${item.size}`}
                    </p>
                  </div>
                  <p className="text-[13px] font-black text-dark whitespace-nowrap">
                    Rp{((item.price || 0) * (item.quantity || 1)).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="bg-white rounded-[24px] border border-gray-2 shadow-xl shadow-blue/5 p-6 mb-6">
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "#212121" }}>
              Alamat Tujuan
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22AD5C" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-black text-[#212121]">{order.shipping_address.recipientName}</p>
                <p className="text-[13px] text-dark-4 mt-1.5 leading-relaxed font-medium">
                  {order.shipping_address.streetAddress}
                  {order.shipping_address.kelurahan && `, ${order.shipping_address.kelurahan}`}
                  {order.shipping_address.kecamatan && `, ${order.shipping_address.kecamatan}`}
                  <br />
                  {order.shipping_address.kota && `${order.shipping_address.kota}, `}
                  {order.shipping_address.provinsi} {order.shipping_address.kodePos}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-[24px] border border-gray-2 shadow-xl shadow-blue/5 p-6 mb-6">
          <h3 className="text-[14px] font-black uppercase tracking-[0.2em] mb-5" style={{ color: "#212121" }}>
            Aksi Cepat
          </h3>
          <div className="space-y-4">
            {/* Konfirmasi Diterima */}
            {(order.status === 'shipping' || order.status === 'shipped') && (
              <button
                onClick={async () => {
                  const toast = (await import("react-hot-toast")).default;
                  const confirmResult = window.confirm("Apakah pesanan sudah diterima?");
                  if (!confirmResult) return;

                  const { error } = await supabase
                    .from("orders")
                    .update({ status: "delivered" })
                    .eq("id", order.id);

                  if (error) {
                    toast.error("Gagal mengubah status");
                  } else {
                    toast.success("Pesanan dikonfirmasi telah diterima!");
                    setOrder((prev: any) => ({ ...prev, status: "delivered" }));
                    setIsRatingOpen(true);
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-green text-white font-black text-sm rounded-[18px] hover:bg-green-dark transition-all active:scale-[0.96] shadow-lg shadow-green/20"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                KONFIRMASI DITERIMA
              </button>
            )}

            {/* Cek Resi */}
            {order.tracking_number && (
              <a
                href={`https://cekresi.com/?noresi=${order.tracking_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 bg-blue/5 text-blue font-black text-sm rounded-[18px] hover:bg-blue hover:text-white transition-all border border-blue/10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                CEK RESI DI KURIR
              </a>
            )}

            {/* Hubungi Penjual */}
            <a
              href={`https://wa.me/6288211346422?text=${encodeURIComponent(`Halo, saya ingin menanyakan status pesanan #${order.id.slice(-8).toUpperCase()}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 py-4 bg-green/5 text-green font-black text-sm rounded-[18px] hover:bg-green hover:text-white transition-all border border-green/10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              HUBUNGI PENJUAL (WA)
            </a>
          </div>
        </div>

        {/* Global Back Link */}
        <Link
          href="/transactions"
          className="flex items-center justify-center gap-2 py-4 text-blue font-black text-sm hover:underline transition-all"
        >
          ← Kembali ke Daftar Transaksi
        </Link>
      </div>

      {/* Rating Satisfaction Modal */}
      {isRatingOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] w-full max-w-[420px] overflow-hidden shadow-2xl animate-scaleUp">
            <div className="relative pt-8 sm:pt-12 pb-6 sm:pb-8 px-6 sm:px-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg width="32" height="32" className="sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-dark mb-1.5 sm:mb-2">Pesanan Selesai!</h3>
              <p className="text-dark-4 text-[13px] sm:text-sm mb-6 sm:mb-8">Bagaimana pengalaman Anda berbelanja di Seragam Sekolah?</p>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    className={`transition-all duration-300 transform ${s <= rating ? "text-orange scale-110" : "text-gray-2"}`}
                  >
                    <svg width="30" height="30" className="sm:w-9 sm:h-9" viewBox="0 0 24 24" fill={s <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Comment Field */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis kesan Anda (opsional)..."
                className="w-full rounded-xl sm:rounded-2xl bg-gray-1 border border-gray-2 p-3 sm:p-4 text-sm outline-none focus:border-blue transition-all mb-6 sm:mb-8 resize-none"
                rows={3}
              ></textarea>

              <div className="flex flex-col gap-2 sm:gap-3">
                <button
                  onClick={handleRatingSubmit}
                  disabled={isSubmittingRating}
                  className="w-full py-3.5 sm:py-4 bg-blue text-white font-black text-sm rounded-[14px] sm:rounded-[18px] hover:bg-blue-dark transition-all active:scale-[0.96] shadow-lg shadow-blue/20 flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? "Mengirim..." : "Kirim Penilaian"}
                </button>
                <button
                  onClick={() => setIsRatingOpen(false)}
                  className="w-full py-2 sm:py-4 text-dark-5 font-bold text-sm hover:text-dark transition-all"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const TrackingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
        </div>
      }
    >
      <Suspense fallback={null}>
        <TrackingContent />
      </Suspense>
    </Suspense>
  );
};

export default TrackingPage;
