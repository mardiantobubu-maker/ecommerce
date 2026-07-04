"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";
import Image from "next/image";

const AdminPromoBanners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    type: "HERO_MAIN",
    title: "",
    subtitle: "",
    discount_text: "",
    image_url: "",
    button_text: "Belanja Sekarang",
    button_link: "/shop-with-sidebar",
    bg_color: "#ffffff",
    coupon_code: ""
  });

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('home_banners')
      .select('*')
      .order('id', { ascending: true });
    
    const existingData = data || [];
    setBanners(existingData);
    setLoading(false);
  };

  const setupHeroBanners = async () => {
    const toastId = toast.loading("Membuat slot banner hero...");
    try {
      const heroTypes = ['HERO_MAIN', 'HERO_SIDEBAR_TOP', 'HERO_SIDEBAR_BOTTOM'];
      const existingTypes = banners.map(b => b.type);
      const missingTypes = heroTypes.filter(t => !existingTypes.includes(t));

      const defaults: Record<string, any> = {
        HERO_MAIN: {
          type: 'HERO_MAIN',
          title: 'Seragam Sekolah Kualitas Terbaik',
          subtitle: 'Bahan premium nyaman dipakai seharian.',
          discount_text: '25% DISKON',
          image_url: '/images/hero/seragam-sekolah-kualitas-terbaik.png',
          button_text: 'Belanja Sekarang',
          button_link: '/shop-with-sidebar',
          bg_color: '#ffffff',
          coupon_code: ''
        },
        HERO_SIDEBAR_TOP: {
          type: 'HERO_SIDEBAR_TOP',
          title: 'Paket Seragam Lengkap',
          subtitle: 'Promo Terbatas',
          discount_text: 'Harga Spesial',
          image_url: '/images/products/terbaru-seragam-sd.png',
          button_text: 'Lihat Produk',
          button_link: '/shop-with-sidebar',
          bg_color: '#ffffff',
          coupon_code: ''
        },
        HERO_SIDEBAR_BOTTOM: {
          type: 'HERO_SIDEBAR_BOTTOM',
          title: 'Seragam SMP & SMA',
          subtitle: 'Promo Seragam',
          discount_text: '20% OFF',
          image_url: '/images/products/seragam-smp.png',
          button_text: 'Lihat Produk',
          button_link: '/shop-with-sidebar',
          bg_color: '#ffffff',
          coupon_code: ''
        }
      };

      for (const type of missingTypes) {
        await supabase.from('home_banners').insert(defaults[type]);
      }

      toast.success(`${missingTypes.length} slot banner hero berhasil dibuat!`, { id: toastId });
      
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/' }),
        });
      } catch (revalidateError) {
        console.error("Failed to revalidate cache:", revalidateError);
      }
      
      fetchBanners();
    } catch (err: any) {
      toast.error('Gagal membuat banner: ' + err.message, { id: toastId });
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah gambar...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("bucket", "promos");
      formDataUpload.append("path", filePath);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal mengunggah");

      setFormData((prev) => ({ ...prev, image_url: result.url }));
      toast.success("Gambar berhasil diunggah!", { id: toastId });
    } catch (error: any) {
      toast.error("Gagal mengunggah: " + error.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const [broadcast, setBroadcast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let error;
      if (editingItem?.id) {
        const { error: err } = await supabase
          .from('home_banners')
          .update(formData)
          .eq('id', editingItem.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('home_banners')
          .insert(formData);
        error = err;
      }

      if (error) throw error;

      if (broadcast) {
        const broadcastMessage = formData.coupon_code 
          ? `Gunakan kode kupon: ${formData.coupon_code}. ${formData.discount_text} - ${formData.subtitle}`
          : `${formData.discount_text} - ${formData.subtitle}`;

        const { error: broadcastErr } = await supabase.rpc('broadcast_promo_notification', {
          p_title: formData.title,
          p_message: broadcastMessage,
          p_link: formData.button_link || "/shop"
        });

        if (broadcastErr) {
          console.error("Broadcast failed:", broadcastErr);
          toast.error("Gagal mengirim notifikasi");
        } else {
          supabase.channel('promotions_global').send({
            type: 'broadcast',
            event: 'new_promo',
            payload: { 
              title: formData.title, 
              message: broadcastMessage
            }
          });
          toast.success("Notifikasi promo telah dikirim!");
        }
      }

      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/' }),
        });
      } catch (revalidateError) {
        console.error("Failed to revalidate cache:", revalidateError);
      }

      toast.success("Banner berhasil disimpan!");
      setEditingItem(null);
      setBroadcast(false);
      setFormData({
        type: "HERO_MAIN",
        title: "",
        subtitle: "",
        discount_text: "",
        image_url: "",
        button_text: "Belanja Sekarang",
        button_link: "/shop-with-sidebar",
        bg_color: "#ffffff",
        coupon_code: ""
      });
      fetchBanners();
    } catch (err: any) {
      toast.error(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && banners.length === 0) return <div className="py-20 text-center">Memuat data banner...</div>;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold text-dark">Manajemen Banner Hero Beranda</h2>
        <div className="flex gap-3">
          {!banners.some(b => b.type === 'HERO_MAIN') && (
            <button
              onClick={setupHeroBanners}
              className="bg-green text-white py-2.5 px-6 rounded-lg font-bold hover:bg-green-dark transition-all shadow-md text-sm"
            >
              ⚡ Setup Banner Hero
            </button>
          )}
          {!editingItem && (
            <button 
              onClick={() => {
                setEditingItem({});
                setFormData({
                  type: "HERO_MAIN",
                  title: "",
                  subtitle: "",
                  discount_text: "",
                  image_url: "",
                  button_text: "Belanja Sekarang",
                  button_link: "/shop-with-sidebar",
                  bg_color: "#ffffff",
                  coupon_code: ""
                });
              }}
              className="bg-blue text-white py-2.5 px-6 rounded-lg font-bold hover:bg-blue-dark transition-all shadow-md text-sm"
            >
              + Tambah Banner Baru
            </button>
          )}
        </div>
      </div>

      {editingItem ? (
        <div className="bg-white p-8 rounded-xl border border-gray-3 shadow-sm mb-10 animate-fadeIn">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-2">
            <h3 className="font-bold text-lg text-blue">
              {editingItem.id ? "Edit Banner" : "Tambah Banner Baru"}
            </h3>
            <button onClick={() => setEditingItem(null)} className="text-dark-4 hover:text-dark">Batal</button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-dark mb-2">Posisi / Tipe Banner</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all bg-white"
                required
              >
                <option value="HERO_MAIN">Hero Utama (Carousel)</option>
                <option value="HERO_SIDEBAR_TOP">Hero Sidebar Atas (Paket SD)</option>
                <option value="HERO_SIDEBAR_BOTTOM">Hero Sidebar Bawah (SMP/SMA)</option>
                <option value="BIG">Promo Tengah (Legasi BIG)</option>
                <option value="SMALL_1">Promo Bawah Kiri (Legasi SMALL_1)</option>
                <option value="SMALL_2">Promo Bawah Kanan (Legasi SMALL_2)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-dark mb-2">Judul Utama</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all"
                placeholder="mis: Seragam SMP & SMA"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-dark mb-2">Sub-judul / Deskripsi Pendek</label>
              <textarea
                rows={2}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all"
                placeholder="mis: Promo Kembali ke Sekolah"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-dark mb-2">Teks Diskon / Harga</label>
              <input
                type="text"
                value={formData.discount_text}
                onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all"
                placeholder="mis: Rp150rb / Diskon 25%"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark mb-2">Warna Background (Hex)</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.bg_color}
                  onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                  className="flex-1 rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all font-mono"
                />
                <input 
                  type="color" 
                  value={formData.bg_color} 
                  onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                  className="w-12 h-12 rounded-md border border-gray-3 p-1 cursor-pointer" 
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-dark mb-2">Gambar Banner</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center ${formData.image_url ? 'border-green bg-green/5' : 'border-gray-3 hover:border-blue bg-gray-50'}`}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        <span className="text-sm font-medium">Klik untuk upload gambar</span>
                        <span className="text-xs text-gray-4 mt-1">PNG/JPG up to 5MB</span>
                      </>
                    )}
                  </div>
                </div>
                {formData.image_url && (
                  <div className="w-40 h-40 relative rounded-xl border border-gray-3 overflow-hidden bg-white shadow-inner flex items-center justify-center p-2">
                    <img src={formData.image_url} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-dark mb-2">Teks Tombol</label>
              <input type="text" value={formData.button_text} onChange={(e) => setFormData({ ...formData, button_text: e.target.value })} className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all" />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark mb-2">Link Tombol</label>
              <input type="text" value={formData.button_link} onChange={(e) => setFormData({ ...formData, button_link: e.target.value })} className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all" />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark mb-2">Kode Kupon (Opsional)</label>
              <input 
                type="text" 
                value={formData.coupon_code} 
                onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })} 
                className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all font-bold text-blue" 
                placeholder="mis: SERAGAM2026"
              />
            </div>

            <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-2 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 bg-blue/5 p-4 rounded-lg border border-blue/10 w-full sm:w-auto">
                <input type="checkbox" id="broadcast-home" checked={broadcast} onChange={(e) => setBroadcast(e.target.checked)} className="w-5 h-5 cursor-pointer accent-blue" />
                <label htmlFor="broadcast-home" className="text-sm font-bold text-blue cursor-pointer">Kirim notifikasi promo ini sekarang</label>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 sm:flex-none border border-gray-3 text-dark py-3.5 px-8 rounded-lg font-bold hover:bg-gray-1 transition-all">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 sm:flex-none bg-blue text-white py-3.5 px-12 rounded-lg font-bold hover:bg-blue-dark transition-all shadow-md disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan Banner"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {banners.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-3 p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-all">
              <div className="w-full md:w-52 h-36 relative rounded-xl bg-gray-50 overflow-hidden border border-gray-2 flex-shrink-0 flex items-center justify-center p-2">
                <img src={item.image_url} alt={item.title} className="max-w-full max-h-full object-contain" />
                <div className="absolute top-2 left-2 bg-blue text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                  {item.type.replace('HERO_', '').replace('_', ' ')}
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-dark">{item.title}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${item.type.startsWith('HERO_') ? 'bg-green/10 text-green' : 'bg-gray-2 text-dark-4'}`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-sm text-dark-4 line-clamp-2">{item.subtitle}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-1 bg-orange/10 text-orange rounded-full">{item.discount_text}</span>
                  {item.coupon_code && <span className="text-xs font-bold px-2.5 py-1 bg-blue/10 text-blue rounded-full">Kupon: {item.coupon_code}</span>}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-1 border border-gray-2 rounded-full">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.bg_color }}></div>
                    <span className="text-[10px] font-bold text-dark-4 font-mono">{item.bg_color}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setFormData({
                      type: item.type,
                      title: item.title,
                      subtitle: item.subtitle,
                      discount_text: item.discount_text,
                      image_url: item.image_url,
                      button_text: item.button_text,
                      button_link: item.button_link,
                      bg_color: item.bg_color,
                      coupon_code: item.coupon_code || ""
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-2.5 bg-blue/10 text-blue font-bold rounded-lg hover:bg-blue hover:text-white transition-all text-sm"
                >
                  Edit Banner
                </button>
                <button 
                  onClick={async () => {
                    if (window.confirm("Hapus banner ini?")) {
                      await supabase.from('home_banners').delete().eq('id', item.id);
                      try {
                        await fetch('/api/revalidate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ path: '/' }),
                        });
                      } catch (revalidateError) {
                        console.error("Failed to revalidate cache:", revalidateError);
                      }
                      fetchBanners();
                    }
                  }}
                  className="p-2.5 text-red hover:bg-red/5 rounded-lg transition-all"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPromoBanners;
