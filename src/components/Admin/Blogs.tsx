"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";
import blogData from "../BlogGrid/blogData";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    img: "",
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    views: 0,
    category: "Seragam SD",
    content: ""
  });

  const fetchBlogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBlogs(data);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchBlogsSafe = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('blogs')
          .select('*')
          .order('created_at', { ascending: false });
        if (isMounted && data) setBlogs(data);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlogsSafe();

    // Aktifkan Realtime Subscription
    const channel = supabase
      .channel('blogs-realtime-admin-v2')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blogs'
        },
        () => {
          if (isMounted) fetchBlogsSafe();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah gambar sampul...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("bucket", "blogs");
      formDataUpload.append("path", filePath);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal mengunggah");

      setFormData((prev) => ({ ...prev, img: result.url }));
      toast.success("Gambar sampul berhasil diunggah!", { id: toastId });
    } catch (error: any) {
      toast.error("Gagal mengunggah gambar: " + error.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    // Generate slug if empty
    if (!formData.slug) {
      formData.slug = formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    try {
      if (editingBlog) {
        const { error } = await supabase
          .from('blogs')
          .update(formData)
          .eq('id', editingBlog.id);
        if (error) throw error;
        toast.success("Blog berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([formData]);
        if (error) throw error;
        toast.success("Blog baru berhasil diterbitkan");
      }

      resetForm();
      fetchBlogs();
    } catch (error: any) {
      toast.error(translateError(error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      img: "",
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      views: 0,
      category: "Seragam SD",
      content: ""
    });
    setShowAddForm(false);
    setEditingBlog(null);
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Apakah Anda yakin ingin menghapus blog ini?")) return;
    
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Blog berhasil dihapus");
      fetchBlogs();
    } catch (err: any) {
      toast.error(translateError(err.message));
    }
  };

  const handleAISuggestion = () => {
    if (!formData.title) {
      toast.error("Masukkan judul dasar terlebih dahulu");
      return;
    }
    
    // AI SEO Logic - Mengambil pola data SEO terbaik untuk E-commerce Seragam
    const powerWords = ["Kualitas Premium", "Awet & Nyaman", "Edisi Terbaru 2024", "Harga Grosir Terbaik", "Terpercaya"];
    const seoPrefix = ["Tips", "Panduan", "Rekomendasi", "Cara"];
    
    let baseTitle = formData.title;
    // Bersihkan judul dari kata-kata SEO yang mungkin sudah ada
    [...powerWords, ...seoPrefix].forEach(word => {
      baseTitle = baseTitle.replace(word, "").trim();
    });

    const smartTitle = `${baseTitle} - ${powerWords[Math.floor(Math.random() * powerWords.length)]} - ${powerWords[Math.floor(Math.random() * powerWords.length)]} Sangat Penting`;
    const smartSlug = smartTitle
      .toLowerCase()
      .replace(/ - /g, '-')
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
    
    setFormData({
      ...formData,
      title: smartTitle,
      slug: smartSlug
    });
    
    toast.success("Judul & Slug dioptimalkan untuk SEO peringkat pertama!", {
      icon: "🚀"
    });
  };

  const handleAIContentSuggestion = () => {
    if (!formData.title) {
      toast.error("Tentukan judul terlebih dahulu agar AI bisa menyusun konten");
      return;
    }

    const aiContent = `
<div class="blog-power-bar">
  <h2>Mengapa ${formData.title} Sangat Penting?</h2>
</div>
<p>Dalam dunia pendidikan, pemilihan seragam yang tepat bukan sekadar soal pakaian, melainkan tentang kenyamanan dan kepercayaan diri siswa. Artikel ini akan membahas secara mendalam bagaimana Anda bisa mendapatkan kualitas terbaik dengan harga yang tetap kompetitif.</p>

<h3>Poin Utama yang Harus Diperhatikan:</h3>
<ul>
  <li><strong>Material Kain:</strong> Pastikan menggunakan bahan yang menyerap keringat dan tidak mudah kusut.</li>
  <li><strong>Ketahanan Warna:</strong> Pilih produk yang warnanya tidak pudar meskipun dicuci berulang kali.</li>
  <li><strong>Ukuran yang Pas:</strong> Konsultasikan tabel ukuran kami untuk mendapatkan fit yang paling nyaman.</li>
</ul>

<p>Segera hubungi tim admin kami untuk mendapatkan penawaran grosir khusus bagi sekolah atau yayasan Anda. Dapatkan diskon hingga 30% untuk pemesanan dalam jumlah besar!</p>
    `.trim();

    setFormData({
      ...formData,
      content: aiContent
    });

    toast.success("Konten artikel telah disusun secara otomatis oleh AI!", {
      icon: "✍️"
    });
  };

  const handleSeedBlogs = async () => {
    if (!confirm("Gunakan AI untuk membuat artikel SEO secara otomatis? Ini akan mengisi daftar blog Anda dengan konten berkualitas tinggi.")) return;
    
    try {
      toast.loading("AI sedang menyusun konten...");
      const { error } = await supabase
        .from('blogs')
        .upsert(blogData.map(blog => ({
          title: blog.title,
          slug: blog.slug,
          img: blog.img,
          date: blog.date,
          views: blog.views,
          category: blog.category || "Seragam SD",
          content: blog.content || ""
        })), { onConflict: 'slug' });

      toast.dismiss();
      if (error) throw error;
      toast.success("AI berhasil membuat artikel SEO!");
      fetchBlogs();
    } catch (err: any) {
      toast.dismiss();
      toast.error("Gagal Generate: " + translateError(err.message));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-dark">Kelola Blog</h2>
          <p className="text-dark-4 text-sm mt-1">Kelola konten berita dan tips sekolah.</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingBlog(null);
            setFormData({ 
              title: "", 
              slug: "", 
              img: "", 
              date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }), 
              views: 0, 
              category: "Seragam SD", 
              content: "" 
            });
          }}
          className="w-full sm:w-auto bg-blue text-white py-3 px-8 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-dark transition-all shadow-md"
        >
          + Tambah Artikel
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-8 rounded-xl border border-gray-3 mb-10 shadow-sm animate-fadeIn">
          <h3 className="text-lg font-bold text-dark mb-6">
            {editingBlog ? "Edit Artikel" : "Tulis Artikel Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-dark mb-2">Judul Artikel</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Tips Memilih Seragam"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="flex-1 rounded-md border border-gray-3 py-2.5 px-5 outline-none focus:border-blue transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAISuggestion}
                    className="bg-blue/10 text-blue px-4 rounded-md hover:bg-blue hover:text-white transition-all text-xs font-bold whitespace-nowrap"
                    title="Gunakan AI untuk optimasi judul"
                  >
                    Optimasi AI
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark mb-2">Gambar Sampul Artikel</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${formData.img ? 'border-green bg-green/5' : 'border-gray-3 hover:border-blue bg-white'}`}>
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
                        ) : formData.img ? (
                          <div className="flex items-center gap-2 text-green">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            <span className="text-sm font-bold">Gambar Terpilih</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span className="text-sm font-medium text-center">Klik atau Taruh Gambar Sampul</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-dark-4 uppercase tracking-wider">Atau URL Gambar</span>
                    <input
                      type="text"
                      placeholder="/images/blog/blog-01.jpg"
                      value={formData.img}
                      onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                      className="w-full rounded-md border border-gray-3 py-2.5 px-5 outline-none focus:border-blue transition-all text-sm"
                    />
                    {formData.img && (
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-3 mt-1">
                        <img src={formData.img} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, img: ""})}
                          className="absolute top-0 right-0 bg-red text-white p-0.5 rounded-bl-lg hover:bg-red-dark"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Slug (Opsional)</label>
                <input
                  type="text"
                  placeholder="tips-memilih-seragam"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-md border border-gray-3 py-2.5 px-5 outline-none focus:border-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Kategori / Tag</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-gray-3 py-2.5 px-5 outline-none focus:border-blue transition-all bg-white"
                >
                  <option value="Seragam SD">Seragam SD</option>
                  <option value="Seragam SMP">Seragam SMP</option>
                  <option value="Seragam SMA">Seragam SMA</option>
                  <option value="Seragam Pramuka">Seragam Pramuka</option>
                  <option value="Seragam Batik">Seragam Batik</option>
                  <option value="Seragam Olahraga">Seragam Olahraga</option>
                  <option value="Aksesori">Aksesori</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Tanggal Terbit</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-md border border-gray-3 py-2.5 px-5 outline-none focus:border-blue transition-all"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-dark">Konten Artikel (HTML)</label>
                <button
                  type="button"
                  onClick={handleAIContentSuggestion}
                  className="bg-blue/10 text-blue px-4 py-1.5 rounded-md hover:bg-blue hover:text-white transition-all text-xs font-bold flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l4.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                  Susun Konten AI
                </button>
              </div>
              <textarea
                rows={10}
                placeholder="Masukkan isi artikel di sini..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full rounded-md border border-gray-3 py-4 px-5 outline-none focus:border-blue transition-all font-mono text-sm"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-1 text-dark py-3 px-10 rounded-md font-bold hover:bg-gray-3 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue text-white py-3 px-10 rounded-md font-bold hover:bg-blue-dark transition-all"
              >
                {editingBlog ? "Update Artikel" : "Terbitkan Artikel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white border border-gray-3 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-gray-1 pb-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-2 bg-gray-1">
                <img src={blog.img || "/images/blog/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-dark text-sm line-clamp-2">{blog.title}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-[10px] text-blue font-bold">{blog.category}</span>
                  <span className="text-[10px] text-dark-4 font-bold">• {blog.date}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-dark-4 uppercase">Statistik</span>
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-blue/5 text-blue text-[10px] font-bold">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {blog.views || 0} Dilihat
              </span>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-2 border-dashed">
              <button
                onClick={() => {
                  setEditingBlog(blog);
                  setFormData({
                    title: blog.title,
                    slug: blog.slug,
                    img: blog.img || "",
                    date: blog.date || "",
                    views: blog.views || 0,
                    category: blog.category || "Seragam SD",
                    content: blog.content || ""
                  });
                  setShowAddForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 py-2.5 rounded-lg bg-blue/5 text-blue font-bold text-xs hover:bg-blue hover:text-white transition-all border border-blue/10"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(blog.id)}
                className="flex-1 py-2.5 rounded-lg bg-red/5 text-red font-bold text-xs hover:bg-red hover:text-white transition-all border border-red/10"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-1 border-y border-gray-3">
              <th className="py-4 px-6 font-bold text-dark text-sm uppercase">Info Artikel</th>
              <th className="py-4 px-6 font-bold text-dark text-sm uppercase hidden md:table-cell">Kategori</th>
              <th className="py-4 px-6 font-bold text-dark text-sm uppercase hidden md:table-cell">Statistik</th>
              <th className="py-4 px-6 font-bold text-dark text-sm uppercase hidden md:table-cell">Tanggal</th>
              <th className="py-4 px-6 font-bold text-dark text-sm uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id} className="border-b border-gray-3 hover:bg-gray-1 transition-all group">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-2 bg-gray-1">
                      <img src={blog.img || "/images/blog/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark line-clamp-1">{blog.title}</h4>
                      <div className="md:hidden flex flex-wrap gap-2 mt-1">
                        <span className="text-[10px] text-blue font-bold">{blog.category}</span>
                        <span className="text-[10px] text-dark-4 font-bold">• {blog.date}</span>
                      </div>
                      <p className="text-xs text-dark-4 line-clamp-1 hidden md:block">/{blog.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-6 hidden md:table-cell">
                  <span className="text-xs font-medium text-dark-4 bg-gray-2 py-1 px-3 rounded-md border border-gray-3">
                    {blog.category || "Tanpa Kategori"}
                  </span>
                </td>
                <td className="py-5 px-6 hidden md:table-cell">
                  <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-blue/5 text-blue text-xs font-bold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {blog.views || 0} Dilihat
                  </span>
                </td>
                <td className="py-5 px-6 hidden md:table-cell">
                  <p className="text-sm text-dark-4">{blog.date}</p>
                </td>
                <td className="py-5 px-6 text-right">
                  <div className="flex justify-end gap-3 transition-all">
                    <button
                      onClick={() => {
                        setEditingBlog(blog);
                        setFormData({
                          title: blog.title,
                          slug: blog.slug,
                          img: blog.img || "",
                          date: blog.date || "",
                          views: blog.views || 0,
                          category: blog.category || "Seragam SD",
                          content: blog.content || ""
                        });
                        setShowAddForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-blue hover:underline font-bold text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red hover:underline font-bold text-xs"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blogs.length === 0 && !loading && (
        <div className="py-20 text-center bg-gray-1 rounded-xl border border-dashed border-gray-4">
          <p className="text-dark-5 italic">Belum ada artikel. Klik "Isi Contoh" untuk memuat data awal.</p>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
