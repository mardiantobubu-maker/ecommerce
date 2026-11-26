"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const supportLinks = [
  {
    id: "privacy-policy",
    label: "Kebijakan Privasi",
    path: "/privacy-policy",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: "refund-policy",
    label: "Kebijakan Pengembalian Dana",
    path: "/refund-policy",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
  },
  {
    id: "terms-conditions",
    label: "Syarat Penggunaan",
    path: "/terms-conditions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "faq",
    label: "FAQ",
    path: "/faq",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "contact",
    label: "Kontak",
    path: "/contact",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
];

const SupportSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="xl:max-w-[350px] w-full bg-white rounded-2xl shadow-xl border border-gray-3 overflow-hidden h-fit animate-fadeIn">
      <div className="py-10 px-9 bg-gray-1 border-b border-gray-3">
        <h3 className="font-black text-2xl text-dark tracking-tight">Pusat Bantuan</h3>
        <p className="text-[13px] text-dark-4 font-medium mt-1.5">Informasi & Dukungan Pelanggan</p>
      </div>

      <div className="p-6 flex flex-col gap-2">
        {supportLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.id}
              href={link.path}
              className={`flex items-center gap-4 py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${
                isActive
                  ? "bg-blue text-white shadow-lg shadow-blue/20 translate-x-1"
                  : "text-dark-4 bg-transparent hover:bg-gray-1 hover:text-dark hover:translate-x-1"
              }`}
            >
              <div className={`transition-colors duration-300 ${isActive ? "text-white" : "text-blue"}`}>
                {link.icon}
              </div>
              {link.label}
            </Link>
          );
        })}
      </div>
      
      <div className="p-8 bg-gradient-to-br from-blue/5 to-transparent border-t border-gray-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-blue/10 flex items-center justify-center text-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-bold text-dark">Butuh bantuan?</p>
            <p className="text-[11px] text-dark-4 font-medium uppercase tracking-widest opacity-70">Tim CS Siap 24/7</p>
          </div>
        </div>
        <p className="text-sm text-dark-2 mb-6 leading-relaxed">Hubungi tim kami untuk konsultasi seragam atau pertanyaan seputar pesanan Anda.</p>
        <Link 
          href="https://wa.me/6288211346422" 
          target="_blank"
          className="flex items-center justify-center gap-3 w-full py-4 bg-green text-white rounded-xl text-sm font-bold shadow-lg shadow-green/20 hover:bg-green-dark hover:scale-[1.02] transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Chat WhatsApp
        </Link>
      </div>
    </div>
  );
};

export default SupportSidebar;
