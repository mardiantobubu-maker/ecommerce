"use client";
import React, { useEffect, useState } from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmDeleteModal = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmDeleteModalProps) => {
  const [mounted, setMounted] = useState(false);

  // Animasi masuk
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setMounted(true), 10);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  // Kunci scroll background
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes cdm-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cdm-slideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .cdm-overlay {
          animation: cdm-fadeIn 0.22s ease both;
        }
        .cdm-card {
          animation: cdm-slideUp 0.32s cubic-bezier(0.34, 1.36, 0.64, 1) both;
        }
      `}</style>

      <div
        className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center sm:px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cdm-title"
      >
        {/* ── Overlay ── */}
        <div
          className="cdm-overlay absolute inset-0 bg-dark/40 backdrop-blur-[4px]"
          onClick={!isLoading ? onCancel : undefined}
        />

        {/* ── Card ── */}
        <div
          className="cdm-card relative w-full sm:max-w-[400px] rounded-t-[24px] sm:rounded-2xl bg-white shadow-2xl overflow-hidden"
        >
          {/* ── Inner content ── */}
          <div className="relative z-10 px-6 sm:px-8 pt-10 pb-8 flex flex-col items-center gap-6">

            {/* Icon */}
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red/10 border-8 border-red/5">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            {/* Title & description */}
            <div className="text-center space-y-2">
              <h2
                id="cdm-title"
                className="text-xl sm:text-2xl font-bold text-dark"
              >
                Hapus Pesanan?
              </h2>
              <p className="text-sm text-dark-4 leading-relaxed max-w-[280px] mx-auto">
                Pesanan ini akan dihapus secara permanen.{" "}
                <span className="text-red font-semibold">
                  Tindakan ini tidak dapat dibatalkan.
                </span>
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-2 my-2" />

            {/* Action buttons */}
            <div className="w-full flex flex-col sm:flex-row-reverse gap-3">
              {/* Hapus button */}
              <button
                id="confirm-delete-btn"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 rounded-xl py-3.5 text-sm font-bold text-white bg-red hover:bg-red/90 transition-all flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(239,68,68,0.2)] hover:shadow-[0_8px_16px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Ya, Hapus
                  </>
                )}
              </button>

              {/* Batalkan button */}
              <button
                id="cancel-delete-btn"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 rounded-xl py-3.5 text-sm font-bold text-dark-3 bg-gray-1 border border-gray-3 hover:bg-gray-2 hover:text-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batalkan
              </button>
            </div>
          </div>

          {/* Bottom drag handle (mobile hint) */}
          <div className="flex justify-center pb-4 sm:hidden">
            <div className="w-12 h-1.5 rounded-full bg-gray-3" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDeleteModal;
