import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const AddressModal = ({ isOpen, closeModal, onAddressAdded, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    village: "",
    district: "",
    city: "",
    province: "",
    postalCode: "",
  });

  useEffect(() => {
    const initForm = async () => {
      if (initialData) {
        // Ambil data profile untuk fallback nomor whatsapp jika di data alamat kosong
        let profileWhatsapp = "";
        if (!(initialData.phone || initialData.whatsapp || initialData.phone_number || initialData.address?.match(/\[WA:(.*?)\]/)?.[1])) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('whatsapp').eq('id', user.id).single();
            profileWhatsapp = profile?.whatsapp || "";
          }
        }

        setFormData({
          name: initialData.recipient_name || initialData.name || "",
          phone: initialData.phone || initialData.whatsapp || initialData.phone_number || initialData.address?.match(/\[WA:(.*?)\]/)?.[1] || profileWhatsapp || "",
          street: initialData.street_address || initialData.address?.replace(/\[WA:.*?\]\s*/, "") || "",
          village: initialData.kelurahan || "",
          district: initialData.kecamatan || "",
          city: initialData.kota || "",
          province: initialData.provinsi || "",
          postalCode: initialData.kode_pos || "",
        });
      } else {
        setFormData({
          name: "",
          phone: "",
          street: "",
          village: "",
          district: "",
          city: "",
          province: "",
          postalCode: "",
        });
      }
    };
    
    initForm();
  }, [initialData, isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Menggunakan Nominatim (OpenStreetMap) untuk Reverse Geocoding (Gratis)
          const response = await fetch(
            `/api/geocode?lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
            const addr = data.address || {};
            const kelurahanVal = addr.village || addr.neighbourhood || addr.hamlet || "";
            const kecamatanVal = addr.subdistrict || addr.city_district || (addr.suburb !== kelurahanVal ? addr.suburb : "") || addr.district || "";
            
            // Fallback untuk Provinsi jika state kosong (sering terjadi di Jakarta)
            const iso = addr["ISO3166-2-lvl4"] || "";
            let provinsiVal = addr.state || addr.province || "";
            if (!provinsiVal) {
              if (iso === "ID-JK") provinsiVal = "DKI Jakarta";
              else if (iso === "ID-JB") provinsiVal = "Jawa Barat";
              else if (iso === "ID-JT") provinsiVal = "Jawa Tengah";
              else if (iso === "ID-JI") provinsiVal = "Jawa Timur";
              else if (iso === "ID-BT") provinsiVal = "Banten";
              else if (iso === "ID-YO") provinsiVal = "DI Yogyakarta";
              else provinsiVal = addr.region || "";
            }

            setFormData(prev => ({
              ...prev,
              street: addr.road || addr.suburb || addr.neighbourhood || "",
              village: kelurahanVal,
              district: kecamatanVal,
              city: addr.city || addr.regency || addr.county || addr.municipality || addr.town || "",
              province: provinsiVal,
              postalCode: addr.postcode || "",
            }));
            toast.success("Lokasi berhasil ditemukan!");
        } catch (error) {
          toast.error("Gagal mengambil detail alamat");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        toast.error("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.getUser();
      const user = data?.user;
      
      if (authError || !user) {
        toast.error("Sesi Anda berakhir. Silakan masuk kembali.");
        setLoading(false);
        return;
      }

      const addressData = { 
        user_id: user.id,
        // Kolom Baru
        recipient_name: formData.name,
        street_address: formData.street,
        kelurahan: formData.village,
        kecamatan: formData.district,
        kota: formData.city,
        provinsi: formData.province,
        kode_pos: formData.postalCode,
        // Kolom Lama (untuk kompatibilitas & menghindari error Not-Null)
        name: formData.name,
        address: `${formData.street}, ${formData.village}, ${formData.district}, ${formData.city}, ${formData.province}, ${formData.postalCode}`,
        // Coba simpan ke kolom whatsapp jika phone tidak ada
        whatsapp: formData.phone,
        is_default: initialData?.is_default || false
      };

      let { error } = initialData?.id 
        ? await supabase.from('addresses').update(addressData).eq('id', initialData.id)
        : await supabase.from('addresses').insert([addressData]);
      
      // FALLBACK: Jika gagal karena kolom whatsapp tidak ada, coba simpan tanpa kolom itu
      // Tapi kita masukkan nomor telepon ke dalam string alamat agar data tidak hilang
      if (error && (error.message.includes('whatsapp') || error.code === 'PGRST204' || error.message.includes('column'))) {
        console.warn("Retrying save without whatsapp column...");
        const fallbackData = { ...addressData };
        delete (fallbackData as any).whatsapp;
        // Masukkan nomor WA ke dalam string address sebagai penanda
        fallbackData.address = `[WA:${formData.phone}] ${fallbackData.address}`;
        
        const retry = initialData?.id
          ? await supabase.from('addresses').update(fallbackData).eq('id', initialData.id)
          : await supabase.from('addresses').insert([fallbackData]);
        error = retry.error;
      }

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success(initialData?.id ? "Alamat berhasil diperbarui!" : "Alamat berhasil ditambahkan!");
      setFormData({ 
        name: "", 
        phone: "", 
        street: "",
        village: "",
        district: "",
        city: "",
        province: "",
        postalCode: "",
      });
      if (onAddressAdded) onAddressAdded();
      closeModal();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message || "Gagal menyimpan alamat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 sm:px-8 px-4 py-10 ${isOpen ? "block z-[999999]" : "hidden"}`}
    >
      <div className="flex items-center justify-center min-h-full text-left">
        <div className="w-full max-w-[800px] rounded-xl shadow-3 bg-white p-6 sm:p-10 relative modal-content">
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-gray-2 text-dark hover:bg-gray-3 transition-all"
          >
            ✕
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-bold text-dark">{initialData ? "Edit Alamat" : "Tambah Alamat Baru"}</h3>
            {!initialData && (
              <button
                type="button"
                onClick={handleGeolocation}
                disabled={geoLoading}
                className="flex items-center gap-2 bg-blue/10 text-blue py-2 px-4 rounded-lg font-bold text-sm hover:bg-blue/20 transition-all border border-blue/20"
              >
                {geoLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue border-b-transparent rounded-full animate-spin"></div>
                    Mencari Lokasi...
                  </>
                ) : (
                  <>📍 Gunakan Lokasi Saat Ini</>
                )}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 text-left">
              <div className="w-full text-left">
                <label className="block mb-2 font-medium text-dark text-sm">Nama Lengkap Penerima <span className="text-red">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Sesuai KTP/identitas"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none focus:border-blue/50"
                />
              </div>
              <div className="w-full text-left">
                <label className="block mb-2 font-medium text-dark text-sm">Nomor WhatsApp/Telepon <span className="text-red">*</span></label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Contoh: 08123456789"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none focus:border-blue/50"
                />
              </div>
            </div>

            <div className="w-full text-left mb-5">
              <label className="block mb-2 font-medium text-dark text-sm">Nama Jalan & Nomor Rumah <span className="text-red">*</span></label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Termasuk nomor blok, gedung, atau lantai (jika ada)"
                required
                className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none focus:border-blue/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 text-left">
              <div className="w-full text-left">
                <label className="block mb-2 font-medium text-dark text-sm">Kelurahan/Desa <span className="text-red">*</span></label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="Masukkan kelurahan/desa"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none focus:border-blue/50"
                />
              </div>
              <div className="w-full text-left">
                <label className="block mb-2 font-medium text-dark text-sm">Kecamatan <span className="text-red">*</span></label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Masukkan kecamatan"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none focus:border-blue/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 text-left">
              <div className="w-full text-left">
                <label className="block mb-2 font-medium text-dark text-sm">Kota/Kabupaten <span className="text-red">*</span></label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Masukkan kota/kabupaten"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none focus:border-blue/50"
                />
              </div>
              <div className="w-full text-left">
                <label className="block mb-2 font-medium text-dark text-sm">Provinsi <span className="text-red">*</span></label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Masukkan provinsi"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none focus:border-blue/50"
                />
              </div>
            </div>

            <div className="w-full text-left mb-8">
              <label className="block mb-2 font-medium text-dark text-sm">Kode Pos <span className="text-red">*</span></label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Masukkan kode pos"
                required
                className="rounded-lg border border-gray-3 bg-gray-1 w-full sm:w-1/2 py-3 px-5 outline-none focus:border-blue/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold text-white bg-blue py-4 px-7 rounded-lg ease-out duration-200 hover:bg-blue-dark shadow-lg shadow-blue/20 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : (initialData ? "Perbarui Alamat" : "Simpan Alamat Sekarang")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
