"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SupportSidebar from "../SupportSidebar";

const faqData = [
  {
    question: "Bagaimana cara memesan seragam sekolah?",
    answer: "Anda dapat memesan melalui situs kami dengan memilih produk, ukuran, dan jumlah yang diinginkan. Tambahkan ke keranjang, lalu lanjutkan ke halaman checkout untuk menyelesaikan pembayaran."
  },
  {
    question: "Berapa lama waktu pengiriman?",
    answer: "Estimasi pengiriman adalah 2-7 hari kerja tergantung lokasi Anda. Untuk wilayah Jabodetabek biasanya 2-3 hari kerja, sedangkan luar Jawa bisa mencapai 5-7 hari kerja."
  },
  {
    question: "Apakah bisa memesan dalam jumlah besar untuk sekolah?",
    answer: "Tentu! Kami melayani pemesanan B2B untuk sekolah dan instansi. Daftar sebagai mitra B2B di halaman pendaftaran kami untuk mendapatkan harga khusus dan layanan prioritas."
  },
  {
    question: "Bagaimana jika ukuran seragam tidak pas?",
    answer: "Kami menyediakan layanan penukaran ukuran gratis (1x per produk). Hubungi tim kami dalam 7 hari setelah menerima barang untuk mengajukan penukaran."
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Kami menerima transfer bank (BCA, BRI, BNI, Mandiri), e-wallet (GoPay, OVO, DANA, ShopeePay), kartu kredit/debit (Visa, Mastercard), dan COD untuk area tertentu."
  },
  {
    question: "Apakah ada garansi untuk produk seragam?",
    answer: "Ya, kami memberikan garansi kualitas 30 hari untuk cacat produksi seperti jahitan lepas, warna luntur saat pencucian pertama, atau kerusakan bahan. Hubungi kami untuk klaim garansi."
  },
  {
    question: "Apakah bisa request bordir nama/logo sekolah?",
    answer: "Ya, kami menyediakan layanan bordir nama siswa dan logo sekolah. Layanan ini tersedia untuk pemesanan minimal 10 Unit per jenis. Hubungi kami untuk informasi lebih lanjut."
  },
  {
    question: "Bagaimana cara merawat seragam agar awet?",
    answer: "Cuci dengan air dingin, hindari pemutih, jangan diperas terlalu keras, dan jemur di tempat teduh. Setrika dengan suhu sedang. Baca label perawatan pada setiap produk untuk instruksi spesifik."
  },
  {
    question: "Apakah ada diskon untuk pembelian grosir?",
    answer: "Ya! Kami menawarkan diskon hingga 25% untuk pembelian grosir. Semakin banyak quantity, semakin besar diskonnya. Hubungi tim B2B kami untuk penawaran khusus."
  },
  {
    question: "Bagaimana cara menghubungi customer service?",
    answer: "Anda dapat menghubungi kami via email di cs@seragamsekolah.co.id, telepon di +6288211346422, atau WhatsApp. Jam operasional: Senin-Jumat 08:00-17:00 WIB, Sabtu 08:00-12:00 WIB."
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Breadcrumb title={"FAQ"} pages={["faq"]} />
      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* Sidebar */}
            <SupportSidebar />

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl shadow-1 p-6 sm:p-10 xl:p-15">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-dark mb-3">Pertanyaan yang Sering Diajukan</h2>
                <p className="text-dark-4">Temukan jawaban untuk pertanyaan umum tentang produk dan layanan kami.</p>
              </div>

              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-1 overflow-hidden border border-gray-3">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-gray-1 transition-colors duration-200"
                    >
                      <span className="font-medium text-dark pr-4">{faq.question}</span>
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? "bg-blue text-white rotate-180" : "bg-gray-2 text-dark-4"}`}>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        <p className="text-dark-4 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-blue/5 rounded-xl border border-blue/10 text-center">
                <h3 className="text-lg font-semibold text-dark mb-3">Masih punya pertanyaan?</h3>
                <p className="text-dark-4 mb-5">Tim kami siap membantu Anda.</p>
                <a href="/contact" className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark">
                  Hubungi Kami
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQ;
