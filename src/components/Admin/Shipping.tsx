"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";

const AdminShipping = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResi, setEditingResi] = useState<any>(null);
  const [resiValue, setResiValue] = useState("");
  const [courierValue, setCourierValue] = useState("JNE");

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (!response.ok) throw new Error("Gagal mengambil data dari API");
      const data = await response.json();
      
      // Filter out cancelled orders if not already filtered by API
      const filteredData = (data || []).filter((o: any) => o.status !== 'cancelled');
      setOrders(filteredData);
    } catch (err: any) {
      console.error("DEBUG SHIPPING ERROR:", err);
      if (!isSilent) toast.error("Database Error: " + err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchOrdersSafe = async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const response = await fetch('/api/admin/orders', { cache: 'no-store' });
        if (!response.ok) throw new Error("Gagal mengambil data dari API");
        const data = await response.json();
        
        if (isMounted) {
          const filteredData = (data || []).filter((o: any) => o.status !== 'cancelled');
          setOrders(filteredData);
        }
      } catch (err: any) {
        console.error("DEBUG SHIPPING ERROR:", err);
        if (!isSilent && isMounted) toast.error("Database Error: " + err.message);
      } finally {
        if (!isSilent && isMounted) setLoading(false);
      }
    };

    fetchOrdersSafe();

    // Setup Realtime for Shipping Management
    const channel = supabase
      .channel('admin_shipping_realtime_v2')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'orders',
        },
        () => {
          if (isMounted) fetchOrdersSafe(true);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateResi = async (orderId: any) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: resiValue,
          courier: courierValue,
          status: 'shipping' 
        })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success("Nomor Resi berhasil diperbarui!");
      setEditingResi(null);
      setResiValue("");
      setCourierValue("JNE");
      // Realtime will trigger the re-fetch
    } catch (error: any) {
      toast.error(translateError(error.message));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-dark">Manajemen Pengiriman</h2>
        </div>
        <button
          onClick={() => fetchOrders()}
          className="w-full sm:w-auto bg-gray-1 text-dark border border-gray-3 py-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-3 transition-all shadow-sm"
        >
          Refresh Manual
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-3 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 pb-6 border-b border-gray-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm text-dark-5 font-medium">Order ID:</span>
                  <span className="font-bold text-dark">#{order.id.toString().slice(-6).toUpperCase()}</span>
                  <span className="text-[10px] bg-gray-2 px-2 py-0.5 rounded font-bold text-dark-4">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-dark-5 font-medium">Pelanggan:</span>
                    <span className="font-bold text-dark text-sm">{order.profiles?.full_name || "Unknown"}</span>
                  </div>
                  {order.profiles?.company_name && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-dark-5 font-medium tracking-tighter uppercase opacity-60">Mitra:</span>
                      <span className="text-[10px] font-black text-blue uppercase tracking-widest">{order.profiles.company_name}</span>
                    </div>
                  )}
                  {order.profiles?.whatsapp && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-dark-5 font-medium">WhatsApp:</span>
                      <a href={`https://wa.me/${order.profiles.whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-xs font-bold text-blue hover:underline">
                        {order.profiles.whatsapp}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-dark-5 font-medium">Status:</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green/10 text-green' : 
                      order.status === 'shipping' ? 'bg-blue/10 text-blue' : 
                      order.status === 'processing' ? 'bg-yellow/10 text-yellow-600' : 'bg-orange/10 text-orange'
                    }`}>
                      {order.status === 'shipping' ? 'Sedang Dikirim' : 
                       order.status === 'processing' ? 'Diproses' : 
                       order.status === 'delivered' ? 'Selesai' : order.status === 'pending' ? 'Menunggu' : order.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-dark-5">Metode Pengiriman:</p>
                <div className="mt-1">
                  {order.shipping_method === 'free' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black uppercase bg-green/5 text-green-600 border border-green-500/20">
                      Ambil di Toko
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black uppercase border ${
                      order.shipping_method?.toLowerCase().includes('jne') ? 'bg-blue/5 text-[#00529C] border-[#00529C]/30' :
                      order.shipping_method?.toLowerCase().includes('jnt') || order.shipping_method?.toLowerCase().includes('j&t') ? 'bg-red/5 text-[#ED1C24] border-[#ED1C24]/30' :
                      order.shipping_method?.toLowerCase().includes('sicepat') ? 'bg-orange/5 text-[#F15A24] border-[#F15A24]/30' :
                      order.shipping_method?.toLowerCase().includes('anteraja') ? 'bg-pink/5 text-[#E91E63] border-[#E91E63]/30' :
                      'bg-blue/5 text-blue-600 border-blue-500/20'
                    }`}>
                      {order.shipping_method?.toUpperCase() || 'KIRIM'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-2">
              <div>
                <p className="text-sm text-dark-5 font-medium mb-1">Tipe Pesanan:</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-md ${
                    order.is_booking ? 'bg-purple/10 text-purple border border-purple/20' : 'bg-blue/10 text-blue border border-blue/20'
                  }`}>
                    {order.is_booking 
                      ? `PRE-ORDER (${order.booking_period || 'Periode Belum Dipilih'})` 
                      : 'KIRIM LANGSUNG (READY)'}
                  </span>
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-4">
                 <div className="bg-orange/5 p-3 rounded-lg border border-orange/10">
                  <p className="text-sm text-dark-5 font-medium mb-1 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Catatan Pelanggan:
                  </p>
                  <p className="text-sm text-dark italic">
                    {order.notes || "Tidak ada catatan khusus."}
                  </p>
                </div>

                {order.is_booking && order.dp_amount && (
                  <div className="bg-blue/5 p-4 rounded-lg border border-blue/20">
                    <p className="text-xs text-blue font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                      Informasi Pembayaran DP
                    </p>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-dark-4">Nilai DP ({order.dp_option === 'dp30' ? '30%' : order.dp_option === 'dp50' ? '50%' : 'Lunas'}):</span>
                      <span className="text-sm font-bold text-blue">Rp{order.dp_amount.toLocaleString()}</span>
                    </div>
                    {order.dp_option !== 'lunas' && (
                      <div className="flex justify-between items-center pt-2 border-t border-blue/10">
                        <span className="text-sm text-dark-4">Sisa Pelunasan:</span>
                        <span className="text-sm font-bold text-dark">Rp{(order.total_amount - order.dp_amount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {order.payment_proof && (
                  <div className="bg-green/5 p-3 rounded-lg border border-green/10">
                    <p className="text-sm text-green font-bold mb-2 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                      </svg>
                      Bukti Pembayaran (Transfer):
                    </p>
                    <a href={order.payment_proof} target="_blank" className="block mt-2">
                      <img src={order.payment_proof} alt="Bukti Transfer" className="max-h-[150px] rounded-md border border-green/20 hover:opacity-90 transition-opacity cursor-zoom-in" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Alamat Penerima */}
              <div className="bg-gray-1 p-5 rounded-lg border border-gray-2">
                <h4 className="font-bold text-dark mb-3 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Alamat Pengiriman
                </h4>
                <div className="text-sm text-dark-4 space-y-1">
                  {order.shipping_address ? (
                    <>
                      <p className="font-bold text-dark text-base mb-1">{order.shipping_address.recipientName || "Nama tidak ada"}</p>
                      <p className="text-blue font-bold mb-2 flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {order.shipping_address.phone || "-"}
                      </p>
                      <p>{order.shipping_address.streetAddress || "Alamat tidak ada"}</p>
                      <p>{order.shipping_address.kelurahan}, {order.shipping_address.kecamatan}</p>
                      <p>{order.shipping_address.kota}, {order.shipping_address.provinsi}</p>
                      <p className="font-medium text-dark mt-2">Kode Pos: {order.shipping_address.kodePos}</p>
                    </>
                  ) : (
                    <p className="italic text-red">Data alamat tidak tersimpan di database.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <h4 className="font-bold text-dark mb-3">Informasi Resi (Tracking)</h4>
                
                {order.shipping_method === 'free' ? (
                  <div className="bg-gray-1 p-4 rounded-lg border border-gray-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green/10 text-green flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-dark-4 uppercase tracking-wide">Pesanan akan diambil langsung di toko.</p>
                  </div>
                ) : editingResi === order.id ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <p className="text-xs font-bold text-dark-5 uppercase tracking-widest">Kurir Pilihan User: <span className="text-blue font-black">{order.courier || "Belum dipilih"}</span></p>
                    <div className="grid grid-cols-3 gap-2">
                      <select 
                        value={courierValue}
                        onChange={(e) => setCourierValue(e.target.value)}
                        className="p-3 border border-gray-3 rounded-md outline-none bg-white font-bold text-dark text-sm focus:border-blue shadow-sm"
                      >
                        <option value="JNE">JNE</option>
                        <option value="J&T">J&T</option>
                        <option value="SiCepat">SiCepat</option>
                        <option value="Anteraja">Anteraja</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Masukkan Nomor Resi..."
                        value={resiValue}
                        onChange={(e) => setResiValue(e.target.value)}
                        className="col-span-2 p-3 border border-blue rounded-md outline-none bg-white shadow-input font-bold"
                        autoFocus
                      />
                    </div>

                    {/* Real-time Tracking Preview (Simulated) */}
                    {resiValue.length > 5 && (
                      <div className="bg-blue/5 border border-blue/10 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-black text-blue uppercase tracking-widest flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue"></span>
                            </span>
                            Live Preview Status ({courierValue})
                          </p>
                          <span className="text-[9px] font-bold bg-white text-dark-4 px-2 py-0.5 rounded border border-gray-2 uppercase">Data Simulasi</span>
                        </div>
                        <div className="space-y-3 relative pl-3 border-l-2 border-blue/20">
                          <div className="relative">
                            <div className="absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full bg-blue border-2 border-white shadow-sm" />
                            <p className="text-xs font-bold text-dark">Paket sedang diproses di {courierValue} Sorting Center</p>
                            <p className="text-[10px] text-dark-4 mt-0.5">Jakarta Selatan · Baru Saja</p>
                          </div>
                          <div className="relative opacity-60">
                            <div className="absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full bg-blue/50 border-2 border-white shadow-sm" />
                            <p className="text-xs font-medium text-dark">Paket telah diterima oleh {courierValue}</p>
                            <p className="text-[10px] text-dark-4 mt-0.5">Titik Pick-up · 2 Jam Lalu</p>
                          </div>
                        </div>
                        <p className="text-[9px] text-blue/60 italic mt-3">* Ini adalah preview visual. Status asli akan sinkron otomatis setelah disimpan.</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateResi(order.id)}
                        className="flex-1 bg-blue text-white py-3 px-6 rounded-md font-bold text-sm hover:bg-blue-dark transition-all shadow-lg shadow-blue/20"
                      >
                        Simpan & Update Status
                      </button>
                      <button
                        onClick={() => setEditingResi(null)}
                        className="bg-gray-2 text-dark py-3 px-4 rounded-md text-sm hover:bg-gray-3 transition-all font-bold"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 font-mono bg-white text-dark border border-gray-3 px-3 py-2 rounded text-sm tracking-wider shadow-sm">
                        {order.courier && (
                          <span className="bg-blue text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">
                            {order.courier}
                          </span>
                        )}
                        <span className="font-bold">{order.tracking_number || "Belum ada resi"}</span>
                      </div>

                      {order.tracking_number && (
                        <a
                          href={
                            order.courier?.toUpperCase() === 'JNE' ? `https://www.jne.co.id/id/tracking/track/${order.tracking_number}` :
                            order.courier?.toUpperCase() === 'J&T' ? `https://www.jet.co.id/track/${order.tracking_number}` :
                            order.courier?.toUpperCase() === 'SICEPAT' ? `https://www.sicepat.com/check-resi?resi=${order.tracking_number}` :
                            `https://www.google.com/search?q=cek+resi+${order.courier}+${order.tracking_number}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue/10 text-blue px-3 py-2 rounded-md text-xs font-bold hover:bg-blue hover:text-white transition-all border border-blue/20"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          Cek di Web Resmi
                        </a>
                      )}

                      <button
                        onClick={() => {
                          setEditingResi(order.id);
                          setResiValue(order.tracking_number || "");
                          setCourierValue(order.courier || "JNE");
                        }}
                        className="text-blue text-sm font-bold hover:underline ml-auto md:ml-0"
                      >
                        {order.tracking_number ? "Ubah Resi" : "+ Input Resi"}
                      </button>
                    </div>

                    {/* Upload Bukti Resi (Foto) */}
                    <div className="mt-4 pt-4 border-t border-gray-2">
                      <p className="text-sm text-dark-5 mb-2 font-medium">Bukti Foto Resi:</p>
                      {order.tracking_proof ? (
                        <div className="relative group w-32 h-32 mb-3">
                          <img 
                            src={order.tracking_proof} 
                            alt="Bukti Resi" 
                            className="w-full h-full object-cover rounded-lg border border-gray-3 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                            onClick={() => window.open(order.tracking_proof, '_blank')}
                          />
                          <button 
                            onClick={async () => {
                              const { supabase } = await import("@/lib/supabase");
                              await supabase.from('orders').update({ tracking_proof: null }).eq('id', order.id);
                              window.location.reload();
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-1 border-2 border-dashed border-gray-3 rounded-lg text-xs font-bold text-dark-4 cursor-pointer hover:border-blue hover:bg-blue/5 transition-all">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                          </svg>
                          Upload Foto Resi
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const { supabase } = await import("@/lib/supabase");
                              const toast = (await import("react-hot-toast")).default;
                              const load = toast.loading("Mengunggah foto resi...");
                              
                              try {
                                const fileName = `tracking-proofs/${order.id}-${Date.now()}`;
                                const { data, error } = await supabase.storage.from('payment-proofs').upload(fileName, file);
                                if (error) throw error;
                                const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(data.path);
                                await supabase.from('orders').update({ tracking_proof: publicUrl }).eq('id', order.id);
                                toast.success("Foto resi berhasil diunggah!", { id: load });
                                window.location.reload();
                              } catch (err: any) {
                                toast.error("Gagal: " + err.message, { id: load });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && !loading && (
          <div className="py-20 text-center bg-gray-1 rounded-xl border border-dashed border-gray-4">
            <p className="text-dark-5 italic">Belum ada pesanan yang perlu diproses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShipping;
