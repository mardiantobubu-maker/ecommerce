"use client";
import React, { useEffect, useState } from "react";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

const LocationPermissionModal = ({
  isOpen,
  onAllow,
  onDeny,
}: LocationPermissionModalProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes lpm-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lpm-card-in {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes lpm-ping {
          0%,100% { transform: scale(1);    opacity: 0.3; }
          50%      { transform: scale(1.4); opacity: 0; }
        }
        @keyframes lpm-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes lpm-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200%  center; }
        }
        .lpm-overlay { animation: lpm-overlay-in 0.25s ease both; }
        .lpm-card    { animation: lpm-card-in 0.4s cubic-bezier(0.34,1.5,0.64,1) 0.1s both; }
        .lpm-ping    { animation: lpm-ping 2.5s cubic-bezier(0,0,0.2,1) infinite; }
        .lpm-float   { animation: lpm-float 3.5s ease-in-out infinite; }
        .lpm-shimmer-btn {
          background: linear-gradient(
            110deg,
            #3c50e0 30%,
            #5c6ef0 50%,
            #3c50e0 70%
          );
          background-size: 200% 100%;
          animation: lpm-shimmer 3s linear infinite;
        }
      `}</style>

      {/* Overlay */}
      <div
        className="lpm-overlay fixed inset-0 z-[9999999] flex items-end sm:items-center justify-center sm:px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lpm-title"
      >
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(33,33,33,0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={onDeny}
        />

        {/* Card */}
        <div
          className="lpm-card relative w-full sm:max-w-[400px] rounded-t-[24px] sm:rounded-[24px] overflow-hidden"
          style={{
            background: "#ffffff",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05) inset",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[4px]"
            style={{
              background: "#3c50e0",
            }}
          />

          <div className="relative z-10 px-6 pt-10 pb-8 flex flex-col items-center gap-6">

            {/* Icon with ping rings */}
            <div className="relative w-20 h-20 flex items-center justify-center lpm-float">
              {/* Ping rings */}
              <span
                className="lpm-ping absolute inset-0 rounded-full"
                style={{ background: "rgba(60,80,224,0.15)" }}
              />
              <span
                className="lpm-ping absolute inset-0 rounded-full"
                style={{ background: "rgba(60,80,224,0.1)", animationDelay: "0.8s" }}
              />

              {/* Icon circle */}
              <div
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "#f0f2ff",
                  boxShadow: "0 4px 15px rgba(60,80,224,0.1)",
                }}
              >
                {/* Map pin icon */}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                    stroke="#3c50e0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z"
                    stroke="#3c50e0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-3">
              <h2
                id="lpm-title"
                className="text-[22px] font-bold tracking-tight text-[#212121]"
              >
                Izinkan Akses Lokasi?
              </h2>
              <p
                className="text-[15px] leading-relaxed text-[#666666] max-w-[280px] mx-auto"
              >
                Dapatkan estimasi pengiriman yang lebih akurat dan temukan kota terdekat dengan mengaktifkan akses lokasi.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-col gap-2 w-full">
              {[
                { icon: "🛡️", text: "Privasi Anda Terjaga" },
                { icon: "📍", text: "Hanya untuk Lokasi Pengiriman" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium"
                  style={{
                    background: "#f8f9ff",
                    border: "1px solid #eef0ff",
                    color: "#3c50e0",
                  }}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-3 mt-2">
              {/* Izinkan */}
              <button
                id="lpm-allow-btn"
                onClick={onAllow}
                className="lpm-shimmer-btn relative w-full rounded-[12px] py-4 text-[16px] font-bold text-white flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] overflow-hidden"
                style={{ boxShadow: "0 8px 20px rgba(60,80,224,0.25)" }}
              >
                Lanjutkan
              </button>

              {/* Tidak Sekarang */}
              <button
                id="lpm-deny-btn"
                onClick={onDeny}
                className="w-full rounded-[12px] py-4 text-[15px] font-semibold text-[#666666] hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: "transparent",
                }}
              >
                Nanti Saja
              </button>
            </div>
          </div>

          {/* Mobile drag handle */}
          <div className="flex justify-center pb-4 sm:hidden">
            <div className="w-12 h-1.5 rounded-full" style={{ background: "#e0e0e0" }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationPermissionModal;
