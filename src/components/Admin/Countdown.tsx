"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";

const AdminCountdown = () => {
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "Persiapan Masuk Sekolah Dimulai!",
    description: "Dapatkan koleksi seragam terbaru dengan harga promo sebelum tahun ajaran baru dimulai.",
    target_date: "",
    image_url: "/images/promo/promo-01.png",
    button_text: "Lihat Sekarang!",
    button_link: "/shop"
  });

  const fetchPromo = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('promos')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setPromo(data);
      setFormData({
        title: data.title,
        description: data.description,
        target_date: data.target_date ? data.target_date.replace(' ', 'T').split('.')[0].slice(0, 16) : "", // Format for datetime-local input (YYYY-MM-DDTHH:mm)
        image_url: data.image_url,
        button_text: data.button_text,
        button_link: data.button_link
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPromo();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah gambar promo...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `promo-${Date.now()}.${fileExt}`;
      const filePath = `banner/${fileName}`;

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
      toast.success("Gambar promo berhasil diunggah!", { id: toastId });
    } catch (error: any) {
      toast.error("Gagal mengunggah gambar: " + error.message, { id: toastId });
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
      const submitData = {
        ...formData,
        target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null
      };

      if (promo) {
        const { error: err } = await supabase
          .from('promos')
          .update(submitData)
          .eq('id', promo.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('promos')
          .insert([submitData]);
        error = err;
      }

      if (error) throw error;

      // Broadcast jika dipilih
      if (broadcast) {
        const { error: broadcastErr } = await supabase.rpc('broadcast_promo_notification', {
          p_title: "Promo Terbatas Baru!",
          p_message: `${formData.title} - ${formData.description}`,
          p_link: formData.button_link || "/shop"
        });
        
        if (broadcastErr) {
          console.error("Broadcast failed:", broadcastErr);
          toast.error("Gagal mengirim notifikasi ke pelanggan");
          toast.success("Pengaturan Promo berhasil disimpan!");
        } else {
          toast.success("Promo disimpan & Notifikasi telah dikirim!");
        }
      } else {
        toast.success("Pengaturan Promo berhasil disimpan!");
      }
      setBroadcast(false);
      fetchPromo();
    } catch (err: any) {
      toast.error(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark mb-10">Pengaturan Banner Promo & Countdown</h2>

      <div className="bg-white p-8 rounded-xl border border-gray-3 shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark mb-2">Judul Banner</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all"
              placeholder="Masukkan judul promo..."
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark mb-2">Deskripsi Singkat</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all"
              placeholder="Tulis kalimat ajakan belanja..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Waktu Berakhir (Countdown)</label>
            <input
              type="datetime-local"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark mb-2">Gambar Banner Promo</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${formData.image_url ? 'border-green bg-green/5' : 'border-gray-3 hover:border-blue bg-gray-50'}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <div className="flex flex-col items-center justify-center py-2">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                    ) : formData.image_url ? (
                      <div className="flex items-center gap-2 text-green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        <span className="text-sm font-bold">Gambar Terunggah</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <span className="text-sm font-medium">Upload Gambar Banner Baru</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-dark-4 uppercase tracking-wider">URL Gambar (Opsional)</span>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all text-sm"
                    placeholder="https://example.com/image.png"
                  />
                </div>
                {formData.image_url && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-3 bg-gray-1">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain" />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, image_url: ""})}
                      className="absolute top-1 right-1 bg-red text-white p-1 rounded-md hover:bg-red-dark shadow-sm"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Teks Tombol</label>
            <input
              type="text"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Link Tombol</label>
            <input
              type="text"
              value={formData.button_link}
              onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
              className="w-full rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-blue transition-all"
            />
          </div>

          <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-2">
            <div className="mb-6 flex items-center gap-3 bg-blue/5 p-4 rounded-lg border border-blue/10">
              <input 
                type="checkbox" 
                id="broadcast-promo"
                checked={broadcast}
                onChange={(e) => setBroadcast(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-blue"
              />
              <label htmlFor="broadcast-promo" className="text-sm font-bold text-blue cursor-pointer">
                Kirim notifikasi promo ini ke seluruh pelanggan sekarang
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue text-white py-3.5 px-12 rounded-md font-bold hover:bg-blue-dark transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Pengaturan Promo"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-10 p-6 bg-blue/5 rounded-xl border border-blue/10">
        <h4 className="font-bold text-blue mb-2 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Tips Penggunaan
        </h4>
        <ul className="text-sm text-dark-4 list-disc ml-5 space-y-1">
          <li>Atur <strong>Waktu Berakhir</strong> ke tanggal di masa depan agar jam hitung mundur muncul.</li>
          <li>Gunakan gambar dengan background transparan (PNG) untuk hasil terbaik.</li>
          <li>Klik simpan, maka tampilan di halaman depan akan langsung berubah otomatis.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminCountdown;
