"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";
import { formatRupiah, getDiscountTiers, calculateKodiPrice, KODI_SIZE } from "@/utils/kodiPricing";

import { CATEGORIES, COLOR_OPTIONS, SIZE_OPTIONS, VARIATION_OPTIONS } from "@/utils/constants";

const MultiSelect = ({ label, options, selected, onChange }: { label: string, options: string[], selected: string, onChange: (val: string) => void }) => {
  const selectedArray = selected ? selected.split(";").map(s => s.trim()).filter(Boolean) : [];

  const toggleOption = (option: string) => {
    let newArray;
    if (selectedArray.includes(option)) {
      newArray = selectedArray.filter(item => item !== option);
    } else {
      newArray = [...selectedArray, option];
    }
    onChange(newArray.join("; "));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-dark-4">{label}</label>
      <div className="relative group">
        <div className="min-h-[46px] p-2 border border-gray-3 rounded-md bg-white flex flex-wrap gap-2 focus-within:border-blue transition-all cursor-pointer">
          {selectedArray.length > 0 ? (
            selectedArray.map(opt => (
              <span key={opt} className="bg-blue/10 text-blue text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                {opt}
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleOption(opt); }} className="hover:text-blue-dark">
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm py-1 px-1">Pilih {label}...</span>
          )}
        </div>

        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-3 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all max-h-48 overflow-y-auto">
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => toggleOption(opt)}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-1 flex items-center justify-between ${selectedArray.includes(opt) ? 'text-blue font-bold bg-blue/5' : 'text-dark'}`}
            >
              {opt}
              {selectedArray.includes(opt) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const initialFormData: any = {
    title: "",
    category: "",
    gender: "Uniseks",
    price: "",
    discounted_price: "",
    price_panjang: "",
    discounted_price_panjang: "",
    image_url: "",
    description: "",
    stock: "0",
    colors: "",
    sizes: "",
    sleeves: "",
    fits: "",
    is_new: false,
    is_best: false,
    weight: "250",
    profit_margin: "",
    profit_margin_panjang: "",
    size_prices: {} as any
  };

  const [formData, setFormData] = useState(initialFormData);

  const [sizePrices, setSizePrices] = useState<{ [size: string]: { [variation: string]: string } }>({});

  const [isSyncing, setIsSyncing] = useState(false);

  const syncCategories = async () => {
    if (!confirm("Apakah Anda yakin ingin menyinkronkan kategori database dengan standar terbaru? Kategori lama yang tidak terdaftar (seperti 'Rok SD') akan dihapus dari pilihan kategori.")) return;
    
    setIsSyncing(true);
    const toastId = toast.loading("Menyinkronkan kategori...");
    try {
      // 1. Get current categories from DB
      const { data: dbCats } = await supabase.from('categories').select('name');
      const dbNames = dbCats?.map(c => c.name) || [];

      // 2. Add missing categories
      const missing = CATEGORIES.filter(cat => !dbNames.includes(cat));
      if (missing.length > 0) {
        await supabase.from('categories').insert(missing.map(name => ({ name })));
      }

      // 3. Delete extra categories (old ones)
      const extra = dbNames.filter(name => !CATEGORIES.includes(name));
      if (extra.length > 0) {
        await supabase.from('categories').delete().in('name', extra);
      }

      toast.success("Kategori database berhasil disinkronkan!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyinkronkan kategori.", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProductsSafe = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (isMounted) {
        if (data) setProducts(data);
        setLoading(false);
      }
    };
    fetchProductsSafe();
    return () => { isMounted = false; };
  }, []);

  const formatInput = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    return numeric ? parseInt(numeric).toLocaleString("id-ID") : "";
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah gambar...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("bucket", "products");
      formDataUpload.append("path", filePath);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal mengunggah");

      setFormData((prev: any) => ({ ...prev, image_url: result.url }));
      toast.success("Gambar berhasil diunggah!", { id: toastId });
    } catch (error: any) {
      toast.error("Gagal mengunggah gambar: " + error.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: formData.price ? (parseFloat(formData.price.replace(/\./g, '')) / KODI_SIZE) : 0,
        discounted_price: formData.discounted_price ? (parseFloat(formData.discounted_price.replace(/\./g, '')) / KODI_SIZE) : null,
        price_panjang: formData.price_panjang ? (parseFloat(formData.price_panjang.replace(/\./g, '')) / KODI_SIZE) : null,
        discounted_price_panjang: formData.discounted_price_panjang ? (parseFloat(formData.discounted_price_panjang.replace(/\./g, '')) / KODI_SIZE) : null,
        stock: (parseInt(formData.stock.replace(/\./g, '')) || 0) * KODI_SIZE,
        is_new: formData.is_new,
        is_best: formData.is_best,
        colors: formData.colors.split(";").map(s => s.trim()).filter(Boolean),
        sizes: formData.sizes.split(";").map(s => s.trim()).filter(Boolean),
        sleeves: formData.sleeves.split(";").map(s => s.trim()).filter(Boolean),
        fits: formData.fits.split(";").map(s => s.trim()).filter(Boolean),
        weight: parseInt(formData.weight) || 250,
        profit_margin: formData.profit_margin ? parseFloat(formData.profit_margin) : 0,
        profit_margin_panjang: formData.profit_margin_panjang ? parseFloat(formData.profit_margin_panjang) : 0,
        size_prices: Object.keys(sizePrices).reduce((acc, sz) => {
          acc[sz] = Object.keys(sizePrices[sz]).reduce((varAcc, v) => {
            const price = sizePrices[sz][v];
            varAcc[v.toLowerCase()] = price ? (parseFloat(price.replace(/\./g, '')) / KODI_SIZE) : null;
            return varAcc;
          }, {} as any);
          return acc;
        }, {} as any)
      };

      let error;
      if (editingProduct) {
        const { error: err } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('products')
          .insert([productData]);
        error = err;
      }

      if (error) {
        toast.error(translateError(error.message));
      } else {
        toast.success(editingProduct ? "Produk diperbarui!" : "Produk ditambahkan!");
        setShowForm(false);
        setEditingProduct(null);
        resetForm();
        
        try {
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: '/' }),
          });
        } catch (revalidateError) {
          console.error("Failed to revalidate cache:", revalidateError);
        }
        
        fetchProducts();
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      discounted_price: "",
      price_panjang: "",
      discounted_price_panjang: "",
      category: "",
      description: "",
      image_url: "",
      stock: "0",
      is_new: false,
      is_best: false,
      colors: "",
      sizes: "",
      sleeves: "",
      fits: "",
      weight: "250",
      profit_margin: "",
      profit_margin_panjang: "",
      size_prices: {}
    });
  };

  const handleDuplicate = (p: any) => {
    setEditingProduct(null); // Force it to be a new product
    setFormData({
      title: `${p.title} (Copy)`,
      category: p.category,
      gender: p.gender || "Uniseks",
      price: formatInput((p.price * KODI_SIZE).toString()),
      discounted_price: p.discounted_price ? formatInput((p.discounted_price * KODI_SIZE).toString()) : "",
      price_panjang: p.price_panjang ? formatInput((p.price_panjang * KODI_SIZE).toString()) : "",
      discounted_price_panjang: p.discounted_price_panjang ? formatInput((p.discounted_price_panjang * KODI_SIZE).toString()) : "",
      description: p.description || "",
      image_url: p.image_url || "",
      stock: formatInput(Math.floor((p.stock || 0) / KODI_SIZE).toString()),
      is_new: p.is_new || false,
      is_best: p.is_best || false,
      colors: p.colors?.join("; ") || "",
      sizes: (p.sizes || []).filter((sz: string) => SIZE_OPTIONS.includes(sz)).join("; ") || "",
      sleeves: p.sleeves?.join("; ") || "",
      fits: p.fits?.join("; ") || "",
      weight: (p.weight || 250).toString(),
      profit_margin: p.discounted_price ? (p.profit_margin?.toString() || "") : "",
      profit_margin_panjang: p.discounted_price_panjang ? (p.profit_margin_panjang?.toString() || "") : "",
      size_prices: p.size_prices || {}
    });

    // Sync size prices
    const savedPrices = p.size_prices || {};
    const formattedPrices: any = {};
    Object.keys(savedPrices).forEach(sz => {
      formattedPrices[sz] = {};
      Object.keys(savedPrices[sz]).forEach(v => {
        const price = savedPrices[sz][v];
        if (price) {
          formattedPrices[sz][v] = (price * KODI_SIZE).toLocaleString('id-ID');
        }
      });
    });
    setSizePrices(formattedPrices);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success("Produk berhasil diduplikasi. Silakan ubah data lalu klik 'Simpan Produk'.");
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Produk berhasil dihapus");
      
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/' }),
        });
      } catch (revalidateError) {
        console.error("Failed to revalidate cache:", revalidateError);
      }
      
      fetchProducts();
    } catch (err: any) {
      toast.error(translateError(err.message));
    }
  };

  const handleSeedData = async () => {
    if (!confirm("Isi database dengan data produk seragam sekolah (SD, SMP, SMA, Pramuka) yang lengkap?")) return;
    setLoading(true);

    const dummyProducts = [
      {
        title: "Paket Seragam SD Lengkap",
        category: "Seragam SD",
        gender: "Uniseks",
        price: 150000 / 20,
        discounted_price: 125000 / 20,
        image_url: "/images/products/terbaru-seragam-sd.png",
        description: "Setelan seragam SD lengkap (Baju & Celana/Rok) kualitas premium.",
        stock: 1000,
        is_new: true,
        is_best: true,
        sizes: ["7,8", "9,10", "11,12", "13,14", "15,16", "17,18", "19,20"],
        colors: ["Putih", "Merah"],
        sleeves: ["Pendek", "Panjang"],
        fits: ["Reguler"],
        weight: 250
      },
      {
        title: "Rok SD Merah Panjang",
        category: "Rok SD",
        gender: "Perempuan",
        price: 700000 / 20,
        image_url: "/images/categories/seragam-sd.png",
        description: "Rok SD warna merah bahan famatex premium.",
        stock: 400,
        is_new: true,
        sizes: ["25/26", "27/28", "29/30", "31/32", "33/34"],
        colors: ["Merah"],
        sleeves: ["Panjang"],
        weight: 300
      },
      {
        title: "Celana SD Merah Panjang",
        category: "Celana SD",
        gender: "Laki-laki",
        price: 650000 / 20,
        image_url: "/images/categories/seragam-sd.png",
        description: "Celana SD warna merah panjang bahan kuat.",
        stock: 500,
        sizes: ["25/26", "27/28", "29/30", "31/32", "33/34", "35/36"],
        colors: ["Merah"],
        sleeves: ["Panjang"],
        weight: 350
      },
      {
        title: "Celana SMP Biru Panjang",
        category: "Celana SMP",
        gender: "Laki-laki",
        price: 950000 / 20,
        image_url: "/images/categories/seragam-smp.png",
        description: "Celana SMP biru panjang kualitas premium.",
        stock: 300,
        sizes: ["25/26", "27/28", "29/30", "31/32", "33/34"],
        colors: ["Biru"],
        sleeves: ["Panjang"],
        weight: 400
      },
      {
        title: "Rok SMP Biru Panjang",
        category: "Rok SMP",
        gender: "Perempuan",
        price: 950000 / 20,
        image_url: "/images/categories/seragam-smp.png",
        description: "Rok SMP biru panjang bahan adem.",
        stock: 300,
        sizes: ["M/L", "L1/L2", "L3/L4", "L5/L6"],
        colors: ["Biru"],
        sleeves: ["Panjang"],
        weight: 400
      },
      {
        title: "Dasi SD Merah Logo",
        category: "Aksesori",
        gender: "Uniseks",
        price: 150000 / 20,
        image_url: "/images/categories/aksesori.png",
        description: "Dasi SD merah dengan logo bordir rapi.",
        stock: 1000,
        sizes: ["S", "M", "L"],
        colors: ["Merah"],
        sleeves: ["Aksesoris"],
        weight: 50
      }
    ];

    const { error } = await supabase.from('products').insert(dummyProducts);
    if (error) toast.error(translateError(error.message));
    else {
      toast.success("Data contoh lengkap berhasil ditambahkan!");
      fetchProducts();
    }
    setLoading(false);
  };


  return (
    <div className="p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-2xl font-bold text-dark">Manajemen Produk</h2>
        <div className="grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto">
          <button
            onClick={syncCategories}
            disabled={isSyncing}
            className={`${isSyncing ? 'bg-blue/50' : 'bg-blue'} text-white py-2 px-3 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wide hover:bg-blue-dark transition-all flex-1 sm:flex-none shadow-sm flex items-center justify-center gap-2`}
          >
            {isSyncing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : "Sinkronkan Kategori"}
          </button>
          <button
            onClick={handleSeedData}
            disabled={loading}
            className="bg-gray-1 text-dark border border-gray-3 py-2 px-3 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wide hover:bg-gray-3 transition-all flex-1 sm:flex-none shadow-sm"
          >
            Isi Contoh
          </button>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingProduct(null);
              resetForm();
            }}
            className="bg-blue text-white py-2 px-4 sm:py-3 sm:px-8 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wide hover:bg-blue-dark transition-all flex-1 sm:flex-none shadow-md"
          >
            {showForm ? "Batal" : "+ Tambah Produk"}
          </button>
        </div>
      </div>



      {showForm && (
        <form onSubmit={handleSubmit} className="mb-12 p-6 sm:p-8 bg-gray-1 rounded-xl border border-gray-3">
          <h3 className="text-xl font-semibold mb-6">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-dark-4">Nama Produk</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-dark-4">Kategori</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue bg-white"
              >
                <option value="">Pilih Kategori</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-dark-4">Jenis Kelamin</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue bg-white"
              >
                <option value="Uniseks">Uniseks</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            {/* Dynamic Variation Pricing Section */}
            <div className="md:col-span-2 p-6 bg-white rounded-xl border border-blue/20 shadow-sm">
              <h3 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
                <span className="p-1 bg-blue text-white rounded">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </span>
                Atur Harga Berdasarkan Variasi
              </h3>

              <div className="space-y-4">
                {/* Variant Row 1 (Default/Pendek) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-2 relative">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-dark-4 uppercase tracking-widest">Variasi</label>
                    <div className="p-2.5 bg-white border border-gray-3 rounded text-sm font-bold text-blue">
                      Pendek (Utama)
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-dark-4 uppercase tracking-widest">Harga Normal / Kodi</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: formatInput(e.target.value) })}
                      className="p-2.5 border border-gray-3 rounded outline-none focus:border-blue text-sm"
                      placeholder="Misal: 1.500.000"
                    />
                    {formData.price && (
                      <span className="text-[10px] font-bold text-blue">= {formatRupiah(parseFloat(formData.price.replace(/\./g, '')) / KODI_SIZE)} / Unit</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-dark-4 uppercase tracking-widest">Harga Diskon / Kodi</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.discounted_price}
                        onChange={(e) => setFormData({ ...formData, discounted_price: formatInput(e.target.value) })}
                        className="flex-1 min-w-0 p-2.5 border border-gray-3 rounded outline-none focus:border-blue text-sm"
                        placeholder="Misal: 1.250.000"
                      />
                      <div className="relative w-[85px] shrink-0">
                        <input 
                          type="number" 
                          value={formData.profit_margin || ""} 
                          placeholder="0"
                          onChange={(e) => setFormData({ ...formData, profit_margin: e.target.value })}
                          className="w-full p-2.5 pl-3 pr-6 border border-orange/30 rounded bg-orange/5 text-sm font-bold text-orange outline-none focus:border-orange [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                          onBlur={(e) => {
                            const margin = parseFloat(formData.profit_margin);
                            const currentVal = parseFloat(formData.discounted_price.replace(/\./g, ''));
                            if (margin && currentVal) {
                              const newVal = Math.round(currentVal + (currentVal * margin / 100));
                              const newNormal = Math.round(newVal * 1.2);
                              setFormData(prev => ({ 
                                ...prev, 
                                discounted_price: newVal.toLocaleString('id-ID'),
                                price: newNormal.toLocaleString('id-ID')
                              }));
                            }
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-orange">%</span>
                      </div>
                    </div>
                    {formData.discounted_price && (
                      <span className="text-[10px] font-bold text-green">= {formatRupiah(parseFloat(formData.discounted_price.replace(/\./g, '')) / KODI_SIZE)} / Unit</span>
                    )}
                  </div>
                </div>

                {/* Variant Row 2 (Panjang) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue/5 rounded-lg border border-blue/10 relative">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-dark-4 uppercase tracking-widest">Variasi</label>
                    <div className="p-2.5 bg-white border border-blue/20 rounded text-sm font-bold text-blue">
                      Panjang
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-dark-4 uppercase tracking-widest">Harga Normal / Kodi</label>
                    <input
                      type="text"
                      value={formData.price_panjang}
                      onChange={(e) => setFormData({ ...formData, price_panjang: formatInput(e.target.value) })}
                      className="p-2.5 border border-blue/20 rounded outline-none focus:border-blue text-sm"
                      placeholder="Misal: 1.600.000"
                    />
                    {formData.price_panjang && (
                      <span className="text-[10px] font-bold text-blue">= {formatRupiah(parseFloat(formData.price_panjang.replace(/\./g, '')) / KODI_SIZE)} / Unit</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-dark-4 uppercase tracking-widest">Harga Diskon / Kodi</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.discounted_price_panjang}
                        onChange={(e) => setFormData({ ...formData, discounted_price_panjang: formatInput(e.target.value) })}
                        className="flex-1 min-w-0 p-2.5 border border-blue/20 rounded outline-none focus:border-blue text-sm"
                        placeholder="Misal: 1.350.000"
                      />
                      <div className="relative w-[85px] shrink-0">
                        <input 
                          type="number" 
                          value={formData.profit_margin_panjang || ""} 
                          placeholder="0"
                          onChange={(e) => setFormData({ ...formData, profit_margin_panjang: e.target.value })}
                          className="w-full p-2.5 pl-3 pr-6 border border-orange/30 rounded bg-orange/5 text-sm font-bold text-orange outline-none focus:border-orange [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                          onBlur={(e) => {
                            const margin = parseFloat(formData.profit_margin_panjang);
                            const currentVal = parseFloat(formData.discounted_price_panjang.replace(/\./g, ''));
                            if (margin && currentVal) {
                              const newVal = Math.round(currentVal + (currentVal * margin / 100));
                              const newNormal = Math.round(newVal * 1.2);
                              setFormData(prev => ({ 
                                ...prev, 
                                discounted_price_panjang: newVal.toLocaleString('id-ID'),
                                price_panjang: newNormal.toLocaleString('id-ID')
                              }));
                            }
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-orange">%</span>
                      </div>
                    </div>
                    {formData.discounted_price_panjang && (
                      <span className="text-[10px] font-bold text-green">= {formatRupiah(parseFloat(formData.discounted_price_panjang.replace(/\./g, '')) / KODI_SIZE)} / Unit</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-dark-4">Gambar Produk</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${formData.image_url ? 'border-green bg-green/5' : 'border-gray-3 hover:border-blue bg-white'}`}>
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
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          <span className="text-sm font-bold">Gambar Terpilih</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                          <span className="text-sm font-medium">Klik atau Seret Gambar ke Sini</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-dark-4 uppercase tracking-wider">Atau Masukkan URL Gambar</span>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
              {formData.image_url && (
                <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-3">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                    className="absolute top-0 right-0 bg-red text-white p-0.5 rounded-bl-lg hover:bg-red-dark"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-dark-4">Deskripsi</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
              ></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-dark-4">Berat Produk (Gram)</label>
              <input
                required
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
                placeholder="Contoh: 250"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-dark-4">Stok (Kodi 20 Unit)</label>
                {formData.stock && (
                  <span className="text-[10px] font-bold text-orange uppercase bg-orange/5 px-2 py-0.5 rounded">
                    = {parseInt(formData.stock.replace(/\./g, '')) * KODI_SIZE} Total Unit
                  </span>
                )}
              </div>
              <input
                required
                type="text"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: formatInput(e.target.value) })}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
                placeholder="Misal: 5"
              />
            </div>

            <MultiSelect
              label="Warna"
              options={COLOR_OPTIONS}
              selected={formData.colors}
              onChange={(val) => setFormData({ ...formData, colors: val })}
            />

            <MultiSelect
              label="Ukuran"
              options={SIZE_OPTIONS}
              selected={formData.sizes}
              onChange={(val) => setFormData({ ...formData, sizes: val })}
            />

            <MultiSelect
              label="Variasi"
              options={VARIATION_OPTIONS}
              selected={formData.sleeves}
              onChange={(val) => setFormData({ ...formData, sleeves: val })}
            />

            {/* Size-Specific Pricing Grid */}
            <div className="md:col-span-2 mt-4 p-6 bg-gray-1 rounded-xl border border-gray-3">
              <h3 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
                <span className="p-1 bg-blue text-white rounded">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </span>
                Harga Spesifik Per Ukuran (Opsional)
              </h3>
              <p className="text-[10px] text-dark-4 mb-4">Jika diisi, harga ini akan menggantikan harga kodi umum di atas untuk ukuran tersebut.</p>

              {/* Dynamic Pricing Grid - Based on selected variations */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-3">
                      <th className="py-2 px-2 font-bold">Ukuran</th>
                      {formData.sleeves.split(";").map(s => s.trim()).filter(Boolean).map(v => (
                        <th key={v} className="py-2 px-2 font-bold whitespace-nowrap">Harga Kodi ({v})</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.sizes.split(";").map(s => s.trim()).filter(Boolean).map(size => (
                      <tr key={size} className="border-b border-gray-2 last:border-0">
                        <td className="py-3 px-2 font-black text-blue">{size}</td>
                        {formData.sleeves.split(";").map(s => s.trim()).filter(Boolean).map(v => (
                          <td key={v} className="py-2 px-2">
                            <input 
                              type="text" 
                              placeholder="Ketik Harga..."
                              value={sizePrices[size]?.[v.toLowerCase()] || ""}
                              onChange={(e) => setSizePrices({
                                ...sizePrices, 
                                [size]: { ...sizePrices[size], [v.toLowerCase()]: formatInput(e.target.value) }
                              })}
                              className="w-full p-2 border border-gray-3 rounded outline-none focus:border-blue bg-white"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Vertical Stack */}
              <div className="sm:hidden space-y-4">
                {formData.sizes.split(";").map(s => s.trim()).filter(Boolean).map(size => (
                  <div key={size} className="bg-white p-4 rounded-xl border border-gray-3 shadow-sm">
                    <div className="flex justify-between items-center border-b border-gray-1 pb-3 mb-4">
                      <span className="text-[10px] font-black uppercase text-dark-4 tracking-widest">Ukuran</span>
                      <span className="text-sm font-black text-blue">{size}</span>
                    </div>
                    <div className="space-y-4">
                      {formData.sleeves.split(";").map(s => s.trim()).filter(Boolean).map(v => (
                        <div key={v} className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-dark uppercase">Harga Kodi ({v})</label>
                          <input 
                            type="text" 
                            placeholder="Ketik Harga..."
                            value={sizePrices[size]?.[v.toLowerCase()] || ""}
                            onChange={(e) => setSizePrices({
                              ...sizePrices, 
                              [size]: { ...sizePrices[size], [v.toLowerCase()]: formatInput(e.target.value) }
                            })}
                            className="w-full p-3 border border-gray-3 rounded-lg outline-none focus:border-blue bg-gray-1 text-sm font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* B2B Preview & Config Section - Restored and Dynamic */}
            <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-3">
              <h3 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-blue/10 text-blue rounded-md">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </span>
                Preview Kombinasi Ukuran & Warna
              </h3>

              <div className="bg-white p-6 rounded-xl border border-dashed border-gray-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-dark-4 opacity-50 block mb-4">Daftar Kombinasi Terdeteksi</span>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {(() => {
                        const colors = formData.colors.split(";").map(s => s.trim()).filter(Boolean);
                        const sleeves = formData.sleeves.split(";").map(s => s.trim()).filter(Boolean);
                        const sizes = formData.sizes.split(";").map(s => s.trim()).filter(Boolean);

                        if (colors.length === 0 || sleeves.length === 0 || sizes.length === 0) {
                          return <p className="text-sm text-dark-4 italic">Pilih Warna, Ukuran, dan Variasi di atas untuk melihat kombinasi.</p>;
                        }

                        const combinations: any[] = [];
                        colors.forEach(c => {
                          sleeves.forEach(sl => {
                            // Filter logic: Standard School Colors
                            const colorLower = c.toLowerCase();
                            const sleeveLower = sl.toLowerCase();
                            let isAllowed = true;

                            if ((colorLower === "putih" || colorLower === "merah") && (sleeveLower === "smp" || sleeveLower === "sma" || sleeveLower === "smk" || sleeveLower === "pramuka")) isAllowed = false;
                            if (colorLower === "biru" && (sleeveLower === "sd" || sleeveLower === "sma" || sleeveLower === "smk" || sleeveLower === "pramuka")) isAllowed = false;
                            if (colorLower === "abu-abu" && (sleeveLower === "sd" || sleeveLower === "smp" || sleeveLower === "smk" || sleeveLower === "pramuka")) isAllowed = false;
                            if (colorLower === "cokelat" && (sleeveLower === "sd" || sleeveLower === "smp" || sleeveLower === "sma" || sleeveLower === "smk")) isAllowed = false;
                            if (sleeveLower === "pramuka" && colorLower !== "cokelat") isAllowed = false;

                            if (isAllowed) {
                              combinations.push({ color: c, sleeve: sl });
                            }
                          });
                        });

                        return combinations.map((comb, idx) => {
                          const isPanjang = comb.sleeve.toLowerCase().includes("panjang");
                          const isAksesoris = comb.sleeve.toLowerCase().includes("aksesoris");
                          
                          return (
                            <div key={idx} className="p-4 bg-gray-1 rounded-lg border border-gray-3 flex flex-col gap-3">
                              <span className="text-sm font-bold text-dark">{comb.color} ({comb.sleeve})</span>
                              <div className="flex flex-col gap-2">
                                {sizes.map(sz => {
                                  // Determine type from variation label
                                  const type = comb.sleeve.toLowerCase();
                                  
                                  const customPriceStr = sizePrices[sz]?.[type];
                                  
                                  // Fallback logic
                                  let basePriceStr = formData.price;
                                  let discPriceStr = formData.discounted_price;
                                  
                                  if (type === 'panjang' && formData.price_panjang) {
                                    basePriceStr = formData.price_panjang;
                                    discPriceStr = formData.discounted_price_panjang;
                                  }

                                  const activePrice = customPriceStr 
                                    ? (parseFloat(customPriceStr.replace(/\./g, '')) / KODI_SIZE)
                                    : (parseFloat((discPriceStr || basePriceStr || "0").replace(/\./g, '')) / KODI_SIZE);

                                  return (
                                    <div key={sz} className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-gray-2 text-[10px]">
                                      <span className="font-black text-blue">{sz}</span>
                                      <span className="font-bold text-dark">{formatRupiah(activePrice * KODI_SIZE)}/Kodi</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  <div className="bg-blue/5 p-6 rounded-xl border border-blue/10 h-fit">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue opacity-70 block mb-4">Informasi B2B Otomatis</span>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue/20 flex items-center justify-center text-blue shrink-0 mt-0.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                        </div>
                        <p className="text-xs text-dark-4 leading-relaxed"><span className="font-bold text-dark">Minimal Order:</span> Sistem akan otomatis mengunci pesanan minimal 20 Unit (1 Kodi) di halaman toko.</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue/20 flex items-center justify-center text-blue shrink-0 mt-0.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                        </div>
                        <p className="text-xs text-dark-4 leading-relaxed"><span className="font-bold text-dark">Harga Grosir:</span> Harga kodi akan otomatis dihitung dari harga satuan produk.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 md:col-span-2 mt-4 bg-white p-4 rounded-lg border border-gray-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_new}
                  onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                  className="w-5 h-5 accent-blue"
                />
                <span className="text-sm font-medium">Produk Baru</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={formData.is_best}
                  onChange={(e) => setFormData({ ...formData, is_best: e.target.checked })}
                  className="w-5 h-5 accent-blue"
                />
                <span className="text-sm font-medium">Produk Terlaris</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-8 bg-blue text-white py-3 px-10 rounded-md font-bold hover:bg-blue-dark transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : editingProduct ? "Simpan Perubahan" : "Simpan Produk"}
          </button>
        </form>
      )}
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-gray-3 rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center gap-3 border-b border-gray-1 pb-2">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-2 bg-gray-1">
                <img src={p.image_url || "/images/product/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-dark text-sm line-clamp-2">{p.title}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-[10px] text-blue font-bold uppercase">{p.category}</span>
                  <span className="text-[10px] text-dark-4 font-bold uppercase">• {p.gender || 'Belum Set'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-dark-4 uppercase">Harga (Kodi)</span>
                <span className="font-black text-blue text-sm">
                  {p.price > 0
                    ? `Rp${(p.price * KODI_SIZE).toLocaleString('id-ID')}`
                    : (p.price_panjang > 0 ? `Rp${(p.price_panjang * KODI_SIZE).toLocaleString('id-ID')}` : "-")}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-dark-4 uppercase">Stok</span>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-black ${p.stock >= 20 ? 'text-green' : 'text-red'}`}>
                    {Math.floor((p.stock || 0) / KODI_SIZE)} Kodi
                  </span>
                  {p.stock > 0 && p.stock < 20 && (
                    <span className="text-[8px] text-red font-black uppercase">Eceran ({p.stock} Unit)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-2 border-dashed">
              <button
                onClick={() => {
                  setEditingProduct(p);
                  setFormData({
                    title: p.title,
                    category: p.category,
                    gender: p.gender || "Uniseks",
                    price: formatInput((p.price * KODI_SIZE).toString()),
                    discounted_price: p.discounted_price ? formatInput((p.discounted_price * KODI_SIZE).toString()) : "",
                    price_panjang: p.price_panjang ? formatInput((p.price_panjang * KODI_SIZE).toString()) : "",
                    discounted_price_panjang: p.discounted_price_panjang ? formatInput((p.discounted_price_panjang * KODI_SIZE).toString()) : "",
                    description: p.description || "",
                    image_url: p.image_url || "",
                    stock: formatInput(Math.floor((p.stock || 0) / KODI_SIZE).toString()),
                    is_new: p.is_new || false,
                    is_best: p.is_best || false,
                    colors: p.colors?.join("; ") || "",
                    sizes: (p.sizes || []).filter((sz: string) => SIZE_OPTIONS.includes(sz)).join("; ") || "",
                    sleeves: p.sleeves?.join("; ") || "",
                    fits: p.fits?.join("; ") || "",
                    weight: (p.weight || 250).toString(),
                    profit_margin: p.discounted_price ? (p.profit_margin?.toString() || "") : "",
                    profit_margin_panjang: p.discounted_price_panjang ? (p.profit_margin_panjang?.toString() || "") : "",
                    size_prices: p.size_prices || {}
                  });

                  // Sync the local sizePrices state
                  const savedPrices = p.size_prices || {};
                  const formattedPrices: any = {};
                  Object.keys(savedPrices).forEach(sz => {
                    formattedPrices[sz] = {
                      pendek: savedPrices[sz].pendek ? (savedPrices[sz].pendek * KODI_SIZE).toLocaleString('id-ID') : "",
                      panjang: savedPrices[sz].panjang ? (savedPrices[sz].panjang * KODI_SIZE).toLocaleString('id-ID') : "",
                      aksesoris: savedPrices[sz].aksesoris ? (savedPrices[sz].aksesoris * KODI_SIZE).toLocaleString('id-ID') : ""
                    };
                  });
                  setSizePrices(formattedPrices);
                  setShowForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 py-2 rounded-lg bg-blue/5 text-blue font-black text-[9px] uppercase hover:bg-blue hover:text-white transition-all border border-blue/10 active:scale-95"
              >
                Edit
              </button>
              <button
                onClick={() => handleDuplicate(p)}
                className="flex-1 py-2 rounded-lg bg-blue/5 text-blue font-black text-[9px] uppercase hover:bg-blue hover:text-white transition-all border border-blue/10 active:scale-95"
              >
                Duplikat
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="flex-1 py-2 rounded-lg bg-red/5 text-red font-black text-[9px] uppercase hover:bg-red hover:text-white transition-all border border-red/10 active:scale-95"
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
            <tr className="border-b border-gray-3 bg-gray-1">
              <th className="py-4 px-6 font-bold text-dark min-w-[200px]">Produk</th>
              <th className="py-4 px-4 font-bold text-dark hidden md:table-cell">Kategori</th>
              <th className="py-4 px-4 font-bold text-dark text-center hidden md:table-cell">Gender</th>
              <th className="py-4 px-4 font-bold text-dark min-w-[140px]">Harga (Kodi)</th>
              <th className="py-4 px-4 font-bold text-dark text-center min-w-[100px]">Stok</th>
              <th className="py-4 px-6 font-bold text-dark text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-2 hover:bg-gray-1 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-gray-2 overflow-hidden flex-shrink-0">
                      <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium text-dark">{p.title}</div>
                      <div className="md:hidden text-[10px] text-dark-4 mt-0.5">{p.category}</div>
                      <div className="flex gap-1 mt-1">
                        {p.is_new && <span className="text-[10px] bg-blue/10 text-blue px-1 rounded font-bold uppercase">New</span>}
                        {p.is_best && <span className="text-[10px] bg-orange/10 text-orange px-1 rounded font-bold uppercase">Best</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-dark-4 hidden md:table-cell">{p.category}</td>
                <td className="py-4 px-4 text-center hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${(p.gender === 'Laki-laki' || p.gender === 'Perempuan') ? 'bg-blue/10 text-blue' :
                      'bg-gray-2 text-dark'
                    }`}>
                    {p.gender || 'Belum Set'}
                  </span>
                </td>
                <td className="py-4 px-4 font-black text-dark whitespace-nowrap">
                  {p.price > 0
                    ? `Rp${(p.price * KODI_SIZE).toLocaleString('id-ID')}`
                    : (p.price_panjang > 0 ? `Rp${(p.price_panjang * KODI_SIZE).toLocaleString('id-ID')}` : "-")}
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`px-2 py-1 rounded text-sm font-black ${p.stock >= 20 ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
                      {Math.floor((p.stock || 0) / KODI_SIZE)} Kodi
                    </span>
                    {p.stock > 0 && p.stock < 20 && (
                      <span className="text-[8px] text-red font-black uppercase mt-1">Eceran ({p.stock} Unit)</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setFormData({
                          title: p.title,
                          category: p.category,
                          gender: p.gender || "Uniseks",
                          price: formatInput((p.price * KODI_SIZE).toString()),
                          discounted_price: p.discounted_price ? formatInput((p.discounted_price * KODI_SIZE).toString()) : "",
                          price_panjang: p.price_panjang ? formatInput((p.price_panjang * KODI_SIZE).toString()) : "",
                          discounted_price_panjang: p.discounted_price_panjang ? formatInput((p.discounted_price_panjang * KODI_SIZE).toString()) : "",
                          description: p.description || "",
                          image_url: p.image_url || "",
                          stock: formatInput(Math.floor((p.stock || 0) / KODI_SIZE).toString()),
                          is_new: p.is_new || false,
                          is_best: p.is_best || false,
                          colors: p.colors?.join("; ") || "",
                          sizes: (p.sizes || []).filter((sz: string) => SIZE_OPTIONS.includes(sz)).join("; ") || "",
                          sleeves: p.sleeves?.join("; ") || "",
                          fits: p.fits?.join("; ") || "",
                          weight: (p.weight || 250).toString(),
                          profit_margin: p.discounted_price ? (p.profit_margin?.toString() || "") : "",
                          profit_margin_panjang: p.discounted_price_panjang ? (p.profit_margin_panjang?.toString() || "") : "",
                          size_prices: p.size_prices || {}
                        });

                        // Sync the local sizePrices state
                        const savedPrices = p.size_prices || {};
                        const formattedPrices: any = {};
                        Object.keys(savedPrices).forEach(sz => {
                          formattedPrices[sz] = {};
                          Object.keys(savedPrices[sz]).forEach(v => {
                            const price = savedPrices[sz][v];
                            if (price) {
                              formattedPrices[sz][v] = (price * KODI_SIZE).toLocaleString('id-ID');
                            }
                          });
                        });
                        setSizePrices(formattedPrices);
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-blue/10 text-blue py-1 px-3 rounded text-xs font-bold hover:bg-blue hover:text-white transition-all w-fit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(p)}
                      className="bg-blue/10 text-blue py-1 px-3 rounded text-xs font-bold hover:bg-blue hover:text-white transition-all w-fit"
                    >
                      Duplikat
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red/10 text-red py-1 px-3 rounded text-xs font-bold hover:bg-red hover:text-white transition-all w-fit"
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
    </div>
  );
};

export default AdminProducts;
