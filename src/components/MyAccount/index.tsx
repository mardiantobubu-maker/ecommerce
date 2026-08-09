"use client";
import React, { useState, useRef, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";
import { Suspense } from "react";
import PreLoader from "../Common/PreLoader";

const MyAccountContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "dashboard");
  const [addressModal, setAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mustCompleteProfile, setMustCompleteProfile] = useState(false);

  const [addresses, setAddresses] = useState<any[]>([]);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    companyName: "",
    businessType: "",
    whatsapp: "",
    photo: "/images/users/user-04.jpg",
    storePhoto: "",
    joinedDate: ""
  });
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [tempPhotoFile, setTempPhotoFile] = useState<File | null>(null);
  const [tempStorePhoto, setTempStorePhoto] = useState<string | null>(null);
  const [tempStorePhotoFile, setTempStorePhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storePhotoInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Auto scroll to content on mobile
    if (window.innerWidth < 1280 && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (user) {
      setProfile({
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        companyName: user.user_metadata?.company_name || "",
        businessType: user.user_metadata?.business_type || "",
        whatsapp: user.user_metadata?.whatsapp || "",
        photo: user.user_metadata?.custom_avatar_url || user.user_metadata?.avatar_url || "",
        storePhoto: user.user_metadata?.store_photo_url || "",
        joinedDate: new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      });
      fetchAddresses(user.id);


      // Cek apakah data wajib kosong (terutama untuk login Google baru)
      if (!user.user_metadata?.company_name || !user.user_metadata?.whatsapp || !user.user_metadata?.store_photo_url) {
        setMustCompleteProfile(true);
        handleTabChange("account-details");
      }

      setLoading(false);
    } else {
      router.push("/signin");
    }
  };

  const fetchAddresses = async (userId: string) => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setAddresses(data);
  };

  const fetchAddressAutoSync = async (userId: string) => {
    // AUTO-SYNC: Jika daftar alamat kosong, coba ambil dari metadata user/profile
    const { data: existingAddrs } = await supabase.from('addresses').select('id').eq('user_id', userId).limit(1);
    if (!existingAddrs || existingAddrs.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.street_address) {
        await supabase.from('addresses').insert([{
          user_id: userId,
          recipient_name: user.user_metadata?.full_name || "Penerima",
          street_address: user.user_metadata?.street_address,
          kelurahan: user.user_metadata?.kelurahan || "",
          kecamatan: user.user_metadata?.kecamatan || "",
          kota: user.user_metadata?.kota || "",
          provinsi: user.user_metadata?.provinsi || "",
          kode_pos: user.user_metadata?.kode_pos || "",
          name: "Alamat Utama",
          is_default: true
        }]);
        fetchAddresses(userId); // Refresh daftar alamat
      }
    }
  };

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let isMounted = true;
    
    const initializeAccount = async () => {
      await fetchUser();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      await fetchAddressAutoSync(user.id);
    };

    initializeAccount();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAddressModal = () => setAddressModal(true);
  const closeAddressModal = () => setAddressModal(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto profil maksimal 5MB.");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, dll).");
      e.target.value = "";
      return;
    }
    if (tempPhoto) URL.revokeObjectURL(tempPhoto);
    setTempPhotoFile(file);
    setTempPhoto(URL.createObjectURL(file));
  };

  const handleStorePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto toko maksimal 5MB.");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, dll).");
      e.target.value = "";
      return;
    }
    if (tempStorePhoto) URL.revokeObjectURL(tempStorePhoto);
    setTempStorePhotoFile(file);
    setTempStorePhoto(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalAvatarUrl = profile.photo;

    // 1. Upload Avatar (Profile Photo)
    if (tempPhotoFile) {
      const fileExt = tempPhotoFile.name.split('.').pop();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const fileName = `avatar-${currentUser?.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(fileName, tempPhotoFile, { upsert: true });

      if (uploadError) {
        toast.error(`Gagal upload foto profil: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('avatar').getPublicUrl(fileName);
      finalAvatarUrl = urlData.publicUrl;
    }

    let finalStorePhotoUrl = profile.storePhoto;

    // 2. Upload Store Photo
    if (tempStorePhotoFile) {
      const fileExt = tempStorePhotoFile.name.split('.').pop();
      const { data: { user: currentUser2 } } = await supabase.auth.getUser();
      const fileName = `store-${currentUser2?.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(fileName, tempStorePhotoFile, { upsert: true });

      if (uploadError) {
        toast.error(`Gagal upload foto toko: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('avatar').getPublicUrl(fileName);
      finalStorePhotoUrl = urlData.publicUrl;
    }

    // Check if store photo is missing (if not uploading now and not existing)
    if (!finalStorePhotoUrl && !tempStorePhotoFile) {
      toast.error("Foto toko/tempat usaha wajib diunggah.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      email: profile.email,
      data: {
        full_name: profile.name,
        company_name: profile.companyName,
        business_type: profile.businessType,
        whatsapp: profile.whatsapp,
        custom_avatar_url: finalAvatarUrl,
        store_photo_url: finalStorePhotoUrl
      }
    });

    // Sync to public.profiles table for Admin visibility
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: profile.name,
          company_name: profile.companyName,
          business_type: profile.businessType,
          whatsapp: profile.whatsapp,
          store_photo_url: finalStorePhotoUrl,
          photo: finalAvatarUrl
        }, { onConflict: 'id' });
      }
    }

    setLoading(false);
    if (error) {
      toast.error(translateError(error.message));
    }
    else {
      toast.success("Profil berhasil diperbarui!");
      if (tempPhoto) {
        URL.revokeObjectURL(tempPhoto);
        setTempPhoto(null);
      }
      setTempPhotoFile(null);
      setMustCompleteProfile(false); // Buka kunci jika sudah diisi
      handleTabChange("dashboard");
      window.location.reload(); // Refresh data user
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Hapus alamat ini?")) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) toast.error(translateError(error.message));
    else {
      toast.success("Alamat berhasil dihapus");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) fetchAddresses(user.id);
    }
  };
  const handleSetDefaultAddress = async (id: string) => {
    // Prevent re-setting if already default
    const current = addresses.find(a => a.id === id);
    if (current?.is_default) return;

    // Optimistic UI Update: Langsung ubah di state lokal agar instan
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      is_default: addr.id === id
    })));

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 1. Reset ALL addresses for this user to is_default: false
      const { error: resetError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      if (resetError) throw resetError;
      
      // 2. Set the SPECIFIC one as default
      const { error: setError } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id); // Guard with user_id
      
      if (setError) throw setError;

      toast.success("Alamat utama berhasil diperbarui");
      await fetchAddresses(user.id);
    } catch (error: any) {
      toast.error(translateError(error.message));
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return <PreLoader />;
  }

  return (
    <>
      <Breadcrumb title={"Akun Saya"} pages={["akun saya"]} />

      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* Sidebar */}
            <div className="xl:max-w-[350px] w-full bg-white rounded-xl shadow-1 overflow-hidden h-fit">
              <div className="flex items-center gap-5 py-8 px-9 border-b border-gray-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue/20 bg-blue/5 flex items-center justify-center">
                  {(tempPhoto || profile.photo) ? (
                    <Image
                      src={tempPhoto || profile.photo}
                      alt="user"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-bold text-dark">{profile.name || "User"}</p>
                  <p className="text-xs text-dark-4">Bergabung {profile.joinedDate}</p>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-3">
                {[
                  { id: "dashboard", label: "Dasbor", icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></> },
                  { id: "orders", label: "Pesanan", icon: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>, isExternal: true, href: "/transactions", hiddenMobile: true },
                  { id: "addresses", label: "Alamat", icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></> },

                  { id: "account-details", label: "Detail Akun", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
                  { id: "testimonials", label: "Ulasan Saya", icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> }
                ].map((item: any) => (
                  <button
                    key={item.id}
                    disabled={mustCompleteProfile && item.id !== "account-details"}
                    onClick={() => item.isExternal ? router.push(item.href) : handleTabChange(item.id)}
                    className={`flex items-center justify-between w-full py-3 px-5 rounded-lg font-medium transition-all ${activeTab === item.id ? "bg-blue text-white shadow-md" : "text-dark-2 bg-gray-2 hover:bg-gray-3"
                      } ${mustCompleteProfile && item.id !== "account-details" ? "opacity-50 cursor-not-allowed" : ""} ${item.hiddenMobile ? "hidden sm:flex" : "flex"}`}
                  >
                    <div className="flex items-center gap-4">
                      <svg className="stroke-current" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                      {item.label}
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`flex items-center justify-center text-[10px] font-bold w-5 h-5 rounded-full ring-2 ${activeTab === item.id ? "bg-white text-blue ring-white/30" : "bg-blue text-white ring-white"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
                  className="flex items-center gap-4 py-3 px-5 rounded-lg font-medium text-red bg-red/5 hover:bg-red/10 mt-4 transition-all"
                >
                  <svg className="stroke-current" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Keluar
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div ref={contentRef} className="flex-1 scroll-mt-20">
              {activeTab === "dashboard" && (
                <div className="bg-white rounded-xl shadow-1 p-8 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-dark mb-4 text-left">Halo, {profile.name || "User"}!</h2>
                  <p className="text-dark-4 mb-8 text-left leading-relaxed">
                    Dari dasbor akun Anda, Anda dapat dengan mudah memeriksa & melihat pesanan terbaru Anda, mengelola alamat pengiriman, dan mengedit detail akun Anda.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: "account-details", label: "Detail Akun", desc: "Update profil Anda", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
                      { id: "orders", label: "Pesanan Terbaru", desc: "Cek status pengiriman", icon: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>, hiddenMobile: true, isExternal: true, href: "/transactions" },
                      { id: "addresses", label: "Alamat Pengiriman", desc: "Kelola lokasi antar", icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></> },
                    ].map(card => (
                      <button 
                        key={card.id} 
                        onClick={() => card.isExternal ? router.push(card.href) : handleTabChange(card.id)} 
                        className={`p-6 border border-gray-3 rounded-xl hover:border-blue hover:bg-blue/[0.02] transition-all text-left group bg-white shadow-sm ${card.hiddenMobile ? 'hidden sm:block' : ''}`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-blue/5 flex items-center justify-center text-blue mb-4 group-hover:bg-blue group-hover:text-white transition-all">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{card.icon}</svg>
                        </div>
                        <h4 className="font-bold text-dark mb-1">{card.label}</h4>
                        <p className="text-xs text-dark-4">{card.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Pesanan dihapus untuk dialihkan ke halaman /transactions */}

              {activeTab === "addresses" && (
                <div className="bg-white rounded-xl shadow-1 overflow-hidden">
                  <div className="flex justify-between items-center p-6 border-b border-gray-3">
                    <h3 className="font-bold text-xl text-dark">Alamat Saya</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className={`p-5 border rounded-xl relative text-left transition-all cursor-pointer group/card ${
                          addr.is_default 
                            ? "border-blue bg-blue/[0.03] ring-1 ring-blue/20" 
                            : "border-gray-3 bg-white hover:border-blue/40 hover:bg-gray-1/30"
                        }`}
                      >
                        <div className="absolute top-4 right-4">
                          {addr.is_default ? (
                            <div className="flex items-center gap-1.5 bg-blue text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-sm">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Dipilih
                            </div>
                          ) : (
                            <div className="text-[10px] font-bold text-dark-4 opacity-0 group-hover/card:opacity-100 border border-gray-4 px-2.5 py-1 rounded-full uppercase transition-all bg-white">
                              Pilih Alamat
                            </div>
                          )}
                        </div>
                        <h5 className="font-bold text-dark mb-2 text-left pr-16 group-hover/card:text-blue transition-colors">
                          {addr.recipient_name || addr.name || "Penerima"}
                        </h5>
                        <p className="text-sm text-dark-4 text-left leading-relaxed">
                          {addr.street_address || addr.address}
                          {(addr.kelurahan || addr.kecamatan) && (
                            <span className="block mt-1 italic">
                              {addr.kelurahan && `${addr.kelurahan}, `}
                              {addr.kecamatan && `${addr.kecamatan}, `}
                              {addr.kota && `${addr.kota}, `}
                              {addr.provinsi && `${addr.provinsi}`}
                            </span>
                          )}
                          {addr.kode_pos && <span className="block mt-1 font-medium text-dark-3">Kode Pos: {addr.kode_pos}</span>}
                        </p>
                        {(addr.phone || addr.whatsapp) && (
                          <div className="flex items-center gap-2 mt-3 text-[12px] font-bold text-blue bg-blue/5 py-1.5 px-3 rounded-lg border border-blue/10 w-fit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            {addr.phone || addr.whatsapp}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-3/50" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(addr);
                              setAddressModal(true);
                            }}
                            className="text-blue text-xs font-bold hover:underline flex items-center gap-1.5"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr.id);
                            }} 
                            className="text-red text-xs font-bold hover:underline flex items-center gap-1.5"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Tambah Alamat Button at Bottom */}
                    <button 
                      onClick={openAddressModal}
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-3 rounded-xl hover:border-blue hover:bg-blue/[0.02] transition-all group min-h-[160px]"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-2 flex items-center justify-center text-dark-4 group-hover:bg-blue group-hover:text-white transition-all mb-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </div>
                      <span className="font-bold text-dark-3 group-hover:text-blue">Tambah Alamat Baru</span>
                    </button>
                  </div>
                </div>
              )}


              {activeTab === "account-details" && (
                <div className="bg-white rounded-xl shadow-1 p-8 sm:p-10">
                  <h3 className="font-bold text-xl mb-8 border-b border-gray-3 pb-4 text-left">Detail Profil & Bisnis</h3>
                  {mustCompleteProfile && (
                    <div className="bg-blue/5 border border-blue/20 p-4 rounded-lg mb-8 text-left">
                      <p className="text-blue font-bold">Wajib Diisi!</p>
                      <p className="text-sm text-blue/80">Lengkapi data di bawah ini untuk mulai bermitra dengan kami.</p>
                    </div>
                  )}
                  <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
                    <div className="flex items-center gap-6 mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-3 bg-blue/5 flex items-center justify-center">
                        {(tempPhoto || profile.photo) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tempPhoto || profile.photo}
                            alt="Profile photo"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        )}
                      </div>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue text-sm font-bold hover:underline">Ubah Foto</button>
                      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="text-left"><label className="block mb-2 font-medium text-dark">Nama Penanggung Jawab <span className="text-red">*</span></label><input type="text" required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg" onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap isi nama penanggung jawab')} onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')} /></div>
                      <div className="text-left"><label className="block mb-2 font-medium text-dark">Alamat Email <span className="text-red">*</span></label><input type="email" required value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg" onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap isi alamat email')} onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')} /></div>
                      <div className="text-left"><label className="block mb-2 font-medium text-dark">Nama Perusahaan <span className="text-red">*</span></label><input type="text" required value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg" onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap isi nama perusahaan Anda')} onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')} /></div>
                      <div className="text-left">
                        <label className="block mb-2 font-medium text-dark">Bidang Usaha <span className="text-red">*</span></label>
                        <select
                          required
                          value={profile.businessType}
                          onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                          className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg appearance-none"
                          onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity('Harap pilih bidang usaha Anda')}
                          onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity('')}
                        >
                          <option value="">Pilih Bidang Usaha</option>
                          <option value="Retail">Retail / Toko</option>
                          <option value="Instansi">Instansi / Sekolah</option>
                          <option value="Konveksi">Konveksi / Penjahit</option>
                          <option value="Distributor">Distributor / Grosir</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                      <div className="text-left"><label className="block mb-2 font-medium text-dark">Nomor WhatsApp Bisnis <span className="text-red">*</span></label><input type="text" required value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg" onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Harap isi nomor WhatsApp bisnis Anda')} onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')} /></div>
                    </div>

                    <div className="text-left mt-4">
                      <label className="block mb-3 font-medium text-dark">Foto Toko / Tempat Usaha <span className="text-red">*</span></label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div
                          className="w-full sm:w-48 h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-4 bg-gray-1 flex items-center justify-center relative group cursor-pointer"
                          onClick={() => storePhotoInputRef.current?.click()}
                        >
                          {(tempStorePhoto || profile.storePhoto) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={tempStorePhoto || profile.storePhoto}
                              alt="Foto Toko"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.querySelector('.photo-placeholder')?.removeAttribute('style');
                              }}
                            />
                          ) : null}
                          <div
                            className="photo-placeholder text-center p-4 absolute inset-0 flex flex-col items-center justify-center"
                            style={{ display: (tempStorePhoto || profile.storePhoto) ? 'none' : 'flex' }}
                          >
                            <svg className="mx-auto mb-2 text-gray-4" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p className="text-[10px] text-dark-5">Klik untuk pilih foto</p>
                          </div>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">📷 Ubah Foto</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => storePhotoInputRef.current?.click()}
                            className="bg-white border border-blue text-blue py-2 px-4 rounded-md text-sm font-bold hover:bg-blue/5 transition-all mb-2"
                          >
                            📂 Pilih Foto Usaha
                          </button>
                          <p className="text-xs text-dark-4 font-medium leading-relaxed mt-1">
                            Format: JPG, PNG, WEBP<br />
                            <span className="text-red">*Maks. 5MB. Unggah foto fisik toko atau papan nama usaha.</span>
                          </p>
                        </div>
                        <input
                          type="file"
                          ref={storePhotoInputRef}
                          onChange={handleStorePhotoUpload}
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="bg-blue text-white py-3 px-10 rounded-lg font-bold w-fit mt-4">Simpan Profil</button>
                  </form>
                </div>
              )}

              {activeTab === "testimonials" && (
                <div className="bg-white rounded-xl shadow-1 p-8 sm:p-10">
                  <h3 className="font-bold text-xl mb-6 text-left">Tulis Ulasan Website</h3>
                  <p className="text-dark-4 mb-8 text-left">Ceritakan pengalaman Anda berbelanja seragam di sini.</p>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    const target = e.target as any;
                    const { error } = await supabase.from('testimonials').insert([{
                      name: profile.name,
                      role: profile.companyName || "Pelanggan Setia",
                      comment: target.comment.value,
                      rating: parseInt(target.rating.value),
                      image_url: profile.photo
                    }]);
                    setLoading(false);
                    if (error) toast.error(translateError(error.message));
                    else {
                      toast.success("Terima kasih atas ulasan Anda!");
                      target.reset();
                      handleTabChange("dashboard");
                    }
                  }} className="flex flex-col gap-6">
                    <div className="text-left">
                      <label className="block mb-3 font-medium">Rating Bintang</label>
                      <select name="rating" className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg">
                        <option value="5">⭐⭐⭐⭐⭐ (Sangat Puas)</option>
                        <option value="4">⭐⭐⭐⭐ (Puas)</option>
                        <option value="3">⭐⭐⭐ (Cukup)</option>
                        <option value="2">⭐⭐ (Kurang)</option>
                        <option value="1">⭐ (Sangat Kurang)</option>
                      </select>
                    </div>
                    <div className="text-left">
                      <label className="block mb-3 font-medium">Pesan Testimoni</label>
                      <textarea name="comment" required rows={4} className="w-full p-4 bg-gray-1 border border-gray-3 rounded-lg" placeholder="Apa yang Anda sukai dari layanan kami?"></textarea>
                    </div>
                    <button type="submit" disabled={loading} className="bg-blue text-white py-3 px-10 rounded-lg font-bold w-fit">{loading ? "Mengirim..." : "Kirim Ulasan"}</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AddressModal
        key={editingAddress?.id || "new-address"}
        isOpen={addressModal}
        closeModal={() => {
          closeAddressModal();
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onAddressAdded={() => {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) fetchAddresses(user.id);
          });
        }}
      />
    </>
  );
};

const MyAccount = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-gray-2">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    }>
      <MyAccountContent />
    </Suspense>
  );
};

export default MyAccount;
