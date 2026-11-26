import React from "react";
import toast from "react-hot-toast";

const OrderDetails = ({ orderItem, toggleModal }: any) => {
  return (
    <>
      <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Pesanan</p>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Date</p>
        </div>

        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Status</p>
        </div>

        {/* <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Title</p>
        </div> */}

        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Total</p>
        </div>

        {/* <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Aksi</p>
        </div> */}
      </div>

      <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
        <div className="min-w-[111px]">
          <p className="text-custom-sm text-red">
            #{orderItem?.orderId ? orderItem.orderId.slice(-8) : '...'}
          </p>
        </div>
        <div className="min-w-[175px]">
          <p className="text-custom-sm text-dark">
            {orderItem.createdAt}
          </p>
        </div>

        <div className="min-w-[128px]">
          <p
            className={`inline-block text-custom-sm  py-0.5 px-2.5 rounded-[30px] capitalize ${
              orderItem.status === "delivered"
                ? "text-green bg-green-light-6"
                : orderItem.status === "on-hold"
                ? "text-red bg-red-light-6"
                : orderItem.status === "processing"
                ? "text-yellow bg-yellow-light-4"
                : "Status Tidak Diketahui"
            }`}
          >
            {orderItem.status}
          </p>
        </div>

        {/* <div className="min-w-[213px]">
          <p className="text-custom-sm text-dark">{orderItem.orderTitle}</p>
        </div> */}

        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">
            {orderItem.total}
          </p>
        </div>
      </div>
      <div className="px-7.5 w-full mt-4 border-t border-gray-3 pt-4">
        <p className="font-bold text-dark mb-2">Alamat Pengiriman:</p>
        <p className="text-sm text-dark-3 mb-4">
          {orderItem.shipping_address ? (
            `${orderItem.shipping_address.recipientName}, ${orderItem.shipping_address.streetAddress}, ${orderItem.shipping_address.kelurahan}, ${orderItem.shipping_address.kecamatan}, ${orderItem.shipping_address.kota}, ${orderItem.shipping_address.provinsi} ${orderItem.shipping_address.kodePos}`
          ) : (
            "Detail alamat tidak tersedia"
          )}
        </p>

        {orderItem.is_booking && orderItem.dp_amount && (
          <div className="bg-blue/5 p-4 rounded-xl border border-blue/20 mt-2">
            <p className="text-xs text-blue font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Rincian Pembayaran DP
            </p>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-dark-4">Nilai DP ({orderItem.dp_option === 'dp30' ? '30%' : orderItem.dp_option === 'dp50' ? '50%' : 'Lunas'}):</span>
              <span className="text-sm font-bold text-blue">Rp{orderItem.dp_amount.toLocaleString()}</span>
            </div>
            {orderItem.dp_option !== 'lunas' && (
              <div className="flex justify-between items-center pt-2 border-t border-blue/10">
                <span className="text-sm text-dark-4">Sisa Pelunasan:</span>
                <span className="text-sm font-bold text-dark">Rp{(orderItem.total_amount - orderItem.dp_amount).toLocaleString()}</span>
              </div>
            )}
            <p className="text-[10px] text-dark-5 italic mt-3 leading-tight">
              * Pelunasan wajib dilakukan sebelum barang dikirim sesuai jadwal yang dipilih.
            </p>
          </div>
        )}
      </div>

      {orderItem.payment_method !== 'cash' && orderItem.payment_method !== 'invoice' && (
        <div className="px-7.5 w-full mt-6 bg-gray-2/50 p-4 rounded-lg">
          <p className="font-bold text-dark mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            Bukti Pembayaran:
          </p>
          
          {orderItem.payment_proof ? (
            <div className="relative group overflow-hidden rounded-xl border border-gray-2 shadow-sm bg-gray-1">
              <img 
                src={orderItem.payment_proof} 
                alt="Bukti Pembayaran" 
                className="w-full h-auto max-h-[350px] object-contain mx-auto"
              />
              
              {/* View Button - Center Overlay */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                <a 
                  href={orderItem.payment_proof} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/90 text-dark flex items-center justify-center hover:bg-blue hover:text-white transition-all shadow-xl pointer-events-auto scale-90 group-hover:scale-100"
                  title="Lihat Penuh"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>

              {/* Delete Button - Highest Priority */}
              <button 
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Langsung hapus tanpa konfirmasi
                  const { supabase } = await import("@/lib/supabase");
                  const { error } = await supabase
                    .from('orders')
                    .update({ payment_proof: null })
                    .eq('id', orderItem.orderId);
                  
                  if (error) {
                    const toast = (await import("react-hot-toast")).default;
                    toast.error("Gagal menghapus: " + error.message);
                  }
                }}
                className="absolute top-2 right-2 w-9 h-9 rounded-full bg-red text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-xl z-[999] active:scale-95 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                title="Hapus Foto"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="bg-red/5 border-2 border-red/40 p-5 rounded-xl animate-pulse-slow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red/10 flex items-center justify-center text-red mt-0.5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-black text-red mb-1 leading-tight uppercase tracking-tight">
                    Wajib foto bukti transfer setelah melakukan pemesanan agar pesanan dapat diproses
                  </p>
                  <p className="text-xs text-dark-4 font-medium leading-relaxed">
                    Pembayaran menggunakan metode Transfer Bank. Pesanan Anda <span className="text-red font-bold">TIDAK AKAN DIPROSES</span> sebelum bukti transfer diunggah dan diverifikasi.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5">
            <label 
              htmlFor={`upload-proof-${orderItem.orderId}`}
              className="w-full inline-flex items-center justify-center gap-3 bg-blue py-4 px-8 rounded-xl text-white text-base font-black cursor-pointer hover:bg-blue-dark transition-all shadow-lg active:scale-[0.98] group"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              <span>Ambil foto</span>
              <input 
                id={`upload-proof-${orderItem.orderId}`}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const { supabase } = await import("@/lib/supabase");
                  const toast = (await import("react-hot-toast")).default;
                  
                  const loadingToast = toast.loading("Sedang mengunggah bukti...");
                  
                  try {
                    const fileName = `payment-proofs/${orderItem.orderId}-${Date.now()}`;
                    const { data, error } = await supabase.storage
                      .from('payment-proofs')
                      .upload(fileName, file);
                      
                    if (error) throw error;
                    
                    const { data: { publicUrl } } = supabase.storage
                      .from('payment-proofs')
                      .getPublicUrl(data.path);
                      
                    const { error: updateError } = await supabase
                      .from('orders')
                      .update({ payment_proof: publicUrl })
                      .eq('id', orderItem.orderId);
                      
                    if (updateError) throw updateError;
                    
                    toast.dismiss(loadingToast);
                    
                    // Clear the ID from URL to prevent auto-pop on next refresh
                    const url = new URL(window.location.href);
                    url.searchParams.delete('id');
                    window.history.replaceState({}, '', url.pathname + url.search);

                    // Close modal automatically
                    if (toggleModal) toggleModal(false);
                  } catch (err: any) {
                    toast.dismiss(loadingToast);
                    toast.error("Gagal mengunggah: " + err.message);
                  }
                }}
              />
            </label>
            <div className="flex items-center gap-2 mt-3 text-dark-5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p className="text-[11px] font-medium italic">
                Pastikan gambar terlihat jelas untuk mempercepat verifikasi admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {orderItem.payment_method === 'invoice' && (
        <div className="px-7.5 w-full mt-6 bg-blue/5 p-5 rounded-lg border border-blue/20">
          <p className="font-bold text-blue mb-1 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Metode Invoice / Penagihan (B2B)
          </p>
          <p className="text-sm text-dark-4 leading-relaxed">
            Metode pembayaran khusus instansi/sekolah telah dipilih. Pesanan akan diproses dan faktur penagihan resmi akan dikirimkan kepada pihak terkait sesuai kesepakatan kerjasama.
          </p>
        </div>
      )}

      {orderItem.payment_method === 'cash' && (
        <div className="px-7.5 w-full mt-6 bg-green-light-6 p-5 rounded-lg border border-green/20">
          <p className="font-bold text-green mb-1 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Metode Bayar di Tempat (COD)
          </p>
          <p className="text-sm text-green/80">
            Pesanan Anda akan diproses. Silakan siapkan pembayaran tunai sebesar <strong>{orderItem.total}</strong> saat pesanan tiba di lokasi Anda. Tidak perlu mengunggah bukti transfer.
          </p>
        </div>
      )}
    </>
  );
};

export default OrderDetails;
