"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center min-h-[600px] pt-[170px] pb-20 px-4 text-center">
      <div className="w-20 h-20 bg-red/10 text-red rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-dark mb-4">Something broke!</h2>
      <p className="text-dark-4 mb-8 max-w-md mx-auto">
        Maaf, terjadi kesalahan teknis pada halaman ini. Silakan coba memuat ulang atau hubungi tim bantuan jika masalah berlanjut.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="bg-blue text-white font-medium py-3 px-8 rounded-lg hover:opacity-90 transition-all"
        >
          Coba Lagi
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-gray-2 text-dark font-medium py-3 px-8 rounded-lg hover:bg-gray-3 transition-all"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
