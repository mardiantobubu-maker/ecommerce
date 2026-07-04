import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface AddressData {
  id?: string;
  recipientName: string;
  streetAddress: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  phone: string;
}

interface ShippingProps {
  onChange?: (data: any) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const Shipping = ({ onChange, isOpen, setIsOpen }: ShippingProps) => {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const isInitialized = useRef(false);
  const [address, setAddress] = useState<AddressData>({
    recipientName: "",
    streetAddress: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    kodePos: "",
    phone: "",
  });

  useEffect(() => {
    const loadSavedAddress = async () => {
      if (isInitialized.current) return;
      
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;
      
      if (user) {
        // Ambil alamat default/terbaru
        const { data: addr, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (addr && !error) {
          const savedAddress = {
            id: addr.id,
            recipientName: addr.recipient_name || addr.name || "",
            streetAddress: addr.street_address || addr.address?.replace(/\[WA:.*?\]\s*/, "") || "",
            kelurahan: addr.kelurahan || "",
            kecamatan: addr.kecamatan || "",
            kota: addr.kota || "",
            provinsi: addr.provinsi || "",
            kodePos: addr.kode_pos || "",
            phone: addr.phone || addr.whatsapp || addr.phone_number || addr.address?.match(/\[WA:(.*?)\]/)?.[1] || "",
          };
          setAddress(savedAddress);
          onChange?.(savedAddress);
          if (savedAddress.streetAddress) {
            setIsOpen(false);
          }
        }
        isInitialized.current = true;
      }
    };
    loadSavedAddress();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...address, [e.target.name]: e.target.value };
    setAddress(newData);
    onChange?.(newData);
  };

  const fetchLocation = async () => {
    if (!navigator.geolocation) {
      setGeoError("Browser Anda tidak mendukung geolocation");
      return;
    }

    setIsLocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=id`,
            { headers: { "Accept-Language": "id" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const kelurahanVal = addr.village || addr.neighbourhood || addr.hamlet || "";
          const kecamatanVal = addr.subdistrict || addr.city_district || (addr.suburb !== kelurahanVal ? addr.suburb : "") || addr.district || "";
          
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

          const newAddress = {
            ...address,
            streetAddress: [addr.road, addr.house_number].filter(Boolean).join(" ") || "",
            kelurahan: kelurahanVal,
            kecamatan: kecamatanVal,
            kota: addr.city || addr.regency || addr.county || addr.municipality || addr.town || "",
            provinsi: provinsiVal,
            kodePos: addr.postcode || "",
          };
          setAddress(newAddress);
          onChange?.(newAddress);
        } catch {
          setGeoError("Gagal mendapatkan data alamat. Coba lagi.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError("Gagal mendapatkan lokasi. Pastikan izin lokasi aktif.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const inputClass =
    "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center justify-between py-5 px-4 sm:px-8.5 hover:bg-gray-1 transition-colors duration-200"
      >
        <div className="flex items-center gap-4 text-dark">
          <div className="w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center text-blue shrink-0 shadow-sm border border-blue/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black text-blue uppercase tracking-[0.15em] leading-none mb-1.5">Lokasi Pengiriman</span>
            <span className="font-medium text-[18px] sm:text-xl">Kirim ke alamat</span>
          </div>
        </div>
        <svg
          className={`fill-current ease-out duration-200 ${
            isOpen && "rotate-180"
          }`}
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
          />
        </svg>
      </div>

      <div className={`p-4 sm:p-8.5 ${isOpen ? "block" : "hidden"}`}>
        <div className="mb-6">
          <button
            type="button"
            onClick={fetchLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-blue py-2.5 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
          >
            {isLocating ? "Mendeteksi..." : "Isi Otomatis dari Lokasi Saya"}
          </button>
          {geoError && <p className="text-red text-xs mt-2">{geoError}</p>}
        </div>

        <div className="flex flex-col lg:flex-row gap-5 mb-5">
          <div className="w-full">
            <label className="block mb-2.5 font-medium">Nama Lengkap Penerima <span className="text-red">*</span></label>
            <input type="text" name="recipientName" value={address.recipientName} onChange={handleChange} className={inputClass} placeholder="Sesuai KTP" />
          </div>
          <div className="w-full">
            <label className="block mb-2.5 font-medium">Nomor WhatsApp <span className="text-red">*</span></label>
            <input type="text" name="phone" value={address.phone} onChange={handleChange} className={inputClass} placeholder="0812..." />
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-2.5 font-medium">Nama Jalan & Nomor Rumah <span className="text-red">*</span></label>
          <input type="text" name="streetAddress" value={address.streetAddress} onChange={handleChange} className={inputClass} />
        </div>

        <div className="flex flex-col lg:flex-row gap-5 mb-5">
          <div className="w-full">
            <label className="block mb-2.5 font-medium">Kelurahan/Desa <span className="text-red">*</span></label>
            <input type="text" name="kelurahan" value={address.kelurahan} onChange={handleChange} className={inputClass} />
          </div>
          <div className="w-full">
            <label className="block mb-2.5 font-medium">Kecamatan <span className="text-red">*</span></label>
            <input type="text" name="kecamatan" value={address.kecamatan} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 mb-5">
          <div className="w-full">
            <label className="block mb-2.5 font-medium">Kota/Kabupaten <span className="text-red">*</span></label>
            <input type="text" name="kota" value={address.kota} onChange={handleChange} className={inputClass} />
          </div>
          <div className="w-full">
            <label className="block mb-2.5 font-medium">Provinsi <span className="text-red">*</span></label>
            <input type="text" name="provinsi" value={address.provinsi} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-2.5 font-medium">Kode Pos <span className="text-red">*</span></label>
          <input type="text" name="kodePos" value={address.kodePos} onChange={handleChange} className={`${inputClass} lg:max-w-[200px]`} maxLength={5} />
        </div>
      </div>
    </div>
  );
};

export default Shipping;

