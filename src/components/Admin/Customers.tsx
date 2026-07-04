"use client";
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");


  const fetchAllCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/customers', { cache: 'no-store' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengambil data pelanggan");
      }
      const data = await response.json();
      setCustomers(data || []);
    } catch (err: any) {
      console.error("Fetch all customers failed:", err);
      toast.error("Gagal mengambil data pelanggan: " + translateError(err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  const exportToExcel = () => {
    if (customers.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    // Header kolom
    const headers = ["ID Pelanggan", "Nama Lengkap", "Nama Perusahaan", "Bidang Usaha", "Email", "WhatsApp", "Tanggal Terdaftar"];
    
    // Konversi data ke format CSV
    const csvData = customers.map(c => [
      c.id?.slice(-6).toUpperCase(),
      c.full_name || "-",
      c.company_name || "-",
      c.business_type || "-",
      c.email || "-",
      c.whatsapp || "-",
      c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID') : "-"
    ]);

    // Gabungkan header dan data
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    
    // Buat file dan download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `data_pelanggan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data berhasil diekspor ke CSV/Excel");
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.whatsapp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.business_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-2xl font-bold text-dark">Data Pelanggan</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 bg-green text-white py-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green/90 transition-all shadow-md shadow-green/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Excel
          </button>
          <button
            onClick={() => fetchAllCustomers()}
            className="w-full sm:w-auto bg-gray-1 text-dark border border-gray-3 py-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-3 transition-all shadow-sm"
          >
            Refresh Manual
          </button>
        </div>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-4 opacity-50">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cari pelanggan..."
          className="w-full bg-white border border-gray-3 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-dark focus:border-blue focus:ring-4 focus:ring-blue/5 outline-none transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-dark-4 hover:text-dark transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>


      {loading ? (
        <div className="py-20 text-center">Memuat data pelanggan...</div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (

                <div key={c.id} className="bg-white border border-gray-3 rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5">
                  <div className="flex justify-between items-center border-b border-gray-1 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-3 bg-gray-1">
                        {c.store_photo_url || c.photo ? (
                          <img 
                            src={c.store_photo_url || c.photo} 
                            alt="" 
                            className="w-full h-full object-cover cursor-zoom-in" 
                            onClick={() => setZoomedImage(c.store_photo_url || c.photo)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-1">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAB4C8" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-dark-4 uppercase tracking-widest opacity-60">ID Pelanggan</span>
                        <span className="font-bold text-blue text-sm">#{c.id?.slice(-6).toUpperCase() || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-dark-4 uppercase">Nama</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-dark">{c.full_name || "Unknown"}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-dark-4 uppercase">Bisnis</span>
                      <div className="text-right flex flex-col items-end">
                        <div className="text-xs font-bold text-dark">{c.company_name || "-"}</div>
                        {c.business_type ? (
                          <div className="text-[10px] font-medium text-dark-4 uppercase mt-0.5">
                            {c.business_type}
                          </div>
                        ) : (
                          <div className="text-[9px] font-black text-dark-4/50 uppercase tracking-tighter bg-gray-1 px-1.5 py-0.5 rounded mt-0.5 border border-gray-2">
                            Belum Diatur
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-dark-4 uppercase">Kontak</span>
                      <div className="text-right text-xs font-medium text-dark-4 flex flex-col items-end">
                        {c.email && <span>{c.email}</span>}
                        {c.whatsapp ? (
                          <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-blue hover:underline font-bold">
                            WA: {c.whatsapp}
                          </a>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-2 border-dashed">
                      <span className="text-[11px] font-bold text-dark-4 uppercase">Status</span>
                      <div>
                        {c.email_verified ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green/10 text-green border border-green/20">
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber/10 text-amber border border-amber/20">
                            Belum Verif
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-dark-4 uppercase">Terdaftar</span>
                      <div className="text-right text-xs font-medium text-dark-4">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-white rounded-xl border border-gray-3 shadow-sm">
                <p className="text-dark-4 font-bold">Tidak ada data pelanggan.</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-3">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-1">
                  <th className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 w-[120px]">Pelanggan</th>
                  <th className="py-5 px-4 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3">Info Pribadi</th>
                  <th className="py-5 px-4 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3">Perusahaan / Bisnis</th>
                  <th className="py-5 px-4 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3">Kontak</th>
                  <th className="py-5 px-4 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 text-center">Status Akun</th>
                  <th className="py-5 px-4 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 text-right">Terdaftar</th>
                  <th className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 text-right w-[100px]">Foto Usaha</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (

                    <tr key={c.id} className="border-b border-gray-2 hover:bg-gray-1/30 transition-all group">
                      <td className="py-6 px-6 align-top">
                        <div className="flex flex-col">
                          <span className="font-bold text-blue text-xs mb-0.5">#{c.id?.slice(-6).toUpperCase() || "-"}</span>
                        </div>
                      </td>
                      <td className="py-6 px-4 align-top">
                        <div className="font-bold text-dark text-sm">{c.full_name || "Unknown"}</div>
                      </td>
                      <td className="py-6 px-4 align-top">
                        <div className="flex flex-col">
                          <span className="text-sm text-dark font-medium">{c.company_name || "-"}</span>
                          {c.business_type ? (
                            <span className="text-[10px] font-bold text-dark-4 uppercase mt-1">
                              {c.business_type}
                            </span>
                          ) : (
                            <span className="inline-flex mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gray-1 text-dark-4/50 border border-gray-2 w-fit">
                              Belum Diatur
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-4 align-top">
                        <div className="flex flex-col gap-1 text-sm text-dark font-medium">
                          {c.email && <span>{c.email}</span>}
                          {c.whatsapp ? (
                            <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-[12px] font-bold text-blue hover:underline">
                              WA: {c.whatsapp}
                            </a>
                          ) : (
                            <span className="text-dark-4">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-4 align-top text-center">
                        {c.email_verified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green/10 text-green border border-green/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
                            Terverifikasi
                          </span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber/10 text-amber border border-amber/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber"></span>
                              Belum Verif
                            </span>
                            {c.email_confirmed_at === null && (
                              <span className="text-[9px] text-dark-4/60 italic font-medium">Menunggu Email</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-6 px-4 align-top text-right text-sm text-dark-4 font-medium">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                      </td>
                      <td className="py-6 px-6 align-top text-right">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-3 bg-gray-1 ml-auto">
                          {c.store_photo_url || c.photo ? (
                            <img 
                              src={c.store_photo_url || c.photo} 
                              alt="Store" 
                              className="w-full h-full object-cover hover:scale-110 transition-transform cursor-zoom-in"
                              onClick={() => setZoomedImage(c.store_photo_url || c.photo)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AAB4C8" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <p className="text-dark-4 font-bold text-base">Tidak ada data pelanggan ditemukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-dark/95 backdrop-blur-md p-4 sm:p-10 animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          {/* Close Button - Fixed at top right with better visibility */}
          <button 
            className="fixed top-6 right-6 z-[10001] bg-white text-dark w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:bg-gray-2 hover:scale-110 transition-all active:scale-95 group"
            onClick={() => setZoomedImage(null)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="w-full h-full flex items-center justify-center">
            <div 
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={zoomedImage} 
                alt="Zoomed" 
                className="max-w-[95vw] max-h-[80vh] md:max-h-[85vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/20"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
