"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    comment: "",
    rating: "5",
    image_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
  });

  const syncProductReviewSummary = async () => {
    const { data: ratingsData } = await supabase.from("testimonials").select("rating");
    const totalReviews = ratingsData?.length || 0;
    const avgRating =
      totalReviews > 0
        ? Number(
            (
              ratingsData.reduce((sum: number, row: any) => sum + Number(row.rating || 0), 0) /
              totalReviews
            ).toFixed(1)
          )
        : 0;

    await supabase.from("products").update({
      reviews: totalReviews,
      rating: avgRating
    }).neq("id", 0);
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (data) setTestimonials(data);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchTestimonialsSafe = async () => {
      setLoading(true);
      const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (isMounted) {
        if (data) setTestimonials(data);
        setLoading(false);
      }
    };
    fetchTestimonialsSafe();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      ...formData,
      rating: parseInt(formData.rating)
    };

    let error;
    if (editingItem) {
      const { error: err } = await supabase.from('testimonials').update(submitData).eq('id', editingItem.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('testimonials').insert([submitData]);
      error = err;
    }

    if (error) {
      toast.error(error.message);
    } else {
      await syncProductReviewSummary();
      toast.success(editingItem ? "Testimoni diperbarui!" : "Testimoni ditambahkan!");
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: "", role: "", comment: "", rating: "5", image_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" });
      fetchTestimonials();
    }
    setLoading(false);
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Apakah Anda yakin ingin menghapus testimoni ini?")) return;
    
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await syncProductReviewSummary();
      toast.success("Testimoni berhasil dihapus");
      fetchTestimonials();
    } catch (err: any) {
      toast.error(translateError(err.message));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-2xl font-bold text-dark">Kelola Testimoni</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingItem(null);
          }}
          className="w-full sm:w-auto bg-blue text-white py-3 px-8 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-dark transition-all shadow-md"
        >
          {showForm ? "Batal" : "+ Tambah Testimoni"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-12 p-8 bg-gray-1 rounded-xl border border-gray-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nama Pelanggan</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
                placeholder="mis: Ibu Siti"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Peran / Jabatan</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
                placeholder="mis: Orang Tua Murid SD"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium">Isi Testimoni</label>
              <textarea
                required
                rows={3}
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
                placeholder="Tulis ulasan pelanggan di sini..."
              ></textarea>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: e.target.value})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">URL Foto</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-8 bg-blue text-white py-3 px-10 rounded-md font-bold hover:bg-blue-dark transition-all"
          >
            {loading ? "Menyimpan..." : "Simpan Testimoni"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="p-6 bg-white rounded-xl border border-gray-3 shadow-sm relative group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue/5 flex items-center justify-center text-blue font-black text-sm border border-blue/10 shadow-sm flex-shrink-0">
                {t.name ? t.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
              </div>
              <div>
                <h4 className="font-bold text-dark">{t.name}</h4>
                <p className="text-xs text-dark-4">{t.role}</p>
              </div>
            </div>
            <div className="flex text-orange mb-3">
              {Array.from({ length: t.rating }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <p className="text-sm text-dark-4 italic">"{t.comment}"</p>
            
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <button onClick={() => {
                setEditingItem(t);
                setFormData({
                  name: t.name,
                  role: t.role || "",
                  comment: t.comment,
                  rating: t.rating.toString(),
                  image_url: t.image_url || ""
                });
                setShowForm(true);
              }} className="bg-blue/10 text-blue py-1 px-3 rounded text-xs font-bold hover:bg-blue hover:text-white transition-all">Edit</button>
              <button onClick={() => handleDelete(t.id)} className="bg-red/10 text-red py-1 px-3 rounded text-xs font-bold hover:bg-red hover:text-white transition-all">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;
