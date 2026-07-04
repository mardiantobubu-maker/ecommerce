"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    image_url: ""
  });

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah gambar kategori...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("bucket", "categories");
      formDataUpload.append("path", filePath);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal mengunggah");

      setFormData((prev) => ({ ...prev, image_url: result.url }));
      toast.success("Gambar kategori berhasil diunggah!", { id: toastId });
    } catch (error: any) {
      toast.error("Gagal mengunggah gambar: " + error.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast.success("Kategori berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([formData]);
        if (error) throw error;
        toast.success("Kategori baru berhasil ditambahkan");
      }

      setFormData({ name: "", image_url: "" });
      setShowAddForm(false);
      setEditingCategory(null);
      
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/' }),
        });
      } catch (revalidateError) {
        console.error("Failed to revalidate cache:", revalidateError);
      }
      
      fetchCategories();
    } catch (error: any) {
      toast.error(translateError(error.message));
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/' }),
        });
      } catch (revalidateError) {
        console.error("Failed to revalidate cache:", revalidateError);
      }
      
      toast.success("Kategori berhasil dihapus");
      fetchCategories();
    } catch (err: any) {
      toast.error(translateError(err.message));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-2xl font-bold text-dark">Kelola Kategori</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: "", image_url: "" });
            setShowAddForm(!showAddForm);
          }}
          className="w-full sm:w-auto bg-blue text-white py-3 px-8 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-dark transition-all shadow-md"
        >
          {showAddForm ? "Batal" : "+ Tambah Kategori"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-8 rounded-xl border border-gray-3 mb-10 shadow-sm animate-fadeIn">
          <h3 className="text-lg font-bold text-dark mb-6">
            {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Nama Kategori</label>
              <input
                type="text"
                placeholder="Contoh: Seragam SD"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-gray-3 py-2.5 px-5 outline-none focus:border-blue transition-all"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">Gambar Kategori</label>
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
                          <span className="text-sm font-bold">Gambar Terpilih</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <span className="text-sm font-medium">Klik atau Taruh Gambar Ikon Kategori</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-dark-4 uppercase tracking-wider">Atau URL Gambar</span>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full rounded-md border border-gray-3 py-2.5 px-5 outline-none focus:border-blue transition-all text-sm"
                    />
                  </div>
                  {formData.image_url && (
                    <div className="flex items-center gap-3 p-3 bg-gray-1 rounded-lg border border-gray-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-3 bg-white shrink-0">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-dark-4 truncate">{formData.image_url}</p>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, image_url: ""})}
                          className="text-[10px] text-red font-bold hover:underline"
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-blue text-white py-3 px-10 rounded-md font-bold hover:bg-blue-dark transition-all"
              >
                {editingCategory ? "Update Kategori" : "Simpan Kategori"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-gray-3 rounded-xl p-6 text-center group hover:shadow-md transition-all relative">
            <div className="w-20 h-20 mx-auto bg-gray-1 rounded-full flex items-center justify-center mb-4 overflow-hidden border border-gray-2">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue text-2xl font-bold">{cat.name.charAt(0)}</span>
              )}
            </div>
            <h4 className="font-bold text-dark mb-1">{cat.name}</h4>
            
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => {
                  setEditingCategory(cat);
                  setFormData({ name: cat.name, image_url: cat.image_url || "" });
                  setShowAddForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-blue text-xs font-bold hover:underline"
              >
                Edit
              </button>
              <span className="text-gray-4">|</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red text-xs font-bold hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="py-20 text-center bg-gray-1 rounded-xl border border-dashed border-gray-4">
          <p className="text-dark-5 italic">Belum ada kategori. Silakan tambah kategori baru.</p>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
