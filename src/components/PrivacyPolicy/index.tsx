"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SupportSidebar from "../SupportSidebar";

const PrivacyPolicy = () => {
  return (
    <>
      <Breadcrumb title={"Kebijakan Privasi"} pages={["kebijakan privasi"]} />

      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* Sidebar */}
            <SupportSidebar />

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl shadow-1 p-6 sm:p-10 xl:p-15">
              <div className="max-w-[870px] mx-auto">
                {/* Intro */}
                <p className="text-dark-4 mb-8 leading-relaxed">
                  Terima kasih telah mengunjungi Toko Seragam Sekolah. Kami menghargai kepercayaan Anda dan berkomitmen untuk melindungi privasi informasi pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda saat menggunakan layanan kami.
                </p>

                {/* Section 1 */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">1</span>
                    Informasi yang Kami Kumpulkan
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 mb-3 leading-relaxed">
                      Kami dapat mengumpulkan informasi berikut saat Anda menggunakan layanan kami:
                    </p>
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Nama lengkap dan informasi kontak (email, nomor telepon, alamat)</li>
                      <li>Informasi sekolah/instansi dan jabatan</li>
                      <li>Data transaksi dan riwayat pembelian</li>
                      <li>Informasi pembayaran (diproses secara aman melalui via transfer bank, COD, Invoice / Penagihan (B2B) Khusus instansi/koperasi sekolah. Wajib memiliki kerjasama MOU.)</li>
                      <li>Data perangkat dan browser saat mengakses situs kami</li>
                      <li>Alamat IP dan data lokasi umum</li>
                    </ul>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">2</span>
                    Penggunaan Informasi
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 mb-3 leading-relaxed">
                      Informasi yang kami kumpulkan digunakan untuk:
                    </p>
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Memproses dan mengirimkan pesanan Anda</li>
                      <li>Mengirimkan konfirmasi pesanan dan pembaruan pengiriman</li>
                      <li>Menyediakan layanan pelanggan dan dukungan teknis</li>
                      <li>Mengirimkan informasi promosi dan penawaran khusus (dengan persetujuan Anda)</li>
                      <li>Meningkatkan kualitas produk dan layanan kami</li>
                      <li>Memenuhi kewajiban hukum dan peraturan yang berlaku</li>
                    </ul>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">3</span>
                    Perlindungan Data
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 mb-3 leading-relaxed">
                      Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi informasi pribadi Anda dari akses yang tidak sah, pengubahan, pengungkapan, atau penghancuran. Langkah-langkah ini meliputi:
                    </p>
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Enkripsi SSL/TLS untuk semua transmisi data</li>
                      <li>Penyimpanan data dengan enkripsi di server yang aman</li>
                      <li>Akses terbatas hanya untuk personel yang berwenang</li>
                      <li>Audit keamanan berkala dan pemantauan sistem</li>
                    </ul>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">4</span>
                    Cookies dan Teknologi Pelacakan
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 leading-relaxed">
                      Situs kami menggunakan cookies dan teknologi serupa untuk meningkatkan pengalaman browsing Anda. Cookies membantu kami mengingat preferensi Anda, menganalisis lalu lintas situs, dan menyediakan konten yang relevan. Anda dapat mengatur pengaturan cookies melalui browser Anda, namun beberapa fitur situs mungkin tidak berfungsi dengan baik tanpa cookies.
                    </p>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">5</span>
                    Berbagi Informasi dengan Pihak Ketiga
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 mb-3 leading-relaxed">
                      Kami tidak menjual, menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran. Informasi Anda hanya dapat dibagikan kepada:
                    </p>
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Mitra pengiriman untuk memproses pengiriman pesanan</li>
                      <li>Penyedia layanan pembayaran untuk memproses transaksi</li>
                      <li>Pihak berwenang jika diwajibkan oleh hukum</li>
                    </ul>
                  </div>
                </div>

                {/* Section 6 */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">6</span>
                    Hak Pengguna
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 mb-3 leading-relaxed">
                      Anda memiliki hak untuk:
                    </p>
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Mengakses dan melihat data pribadi Anda yang kami simpan</li>
                      <li>Meminta perbaikan data yang tidak akurat</li>
                      <li>Meminta penghapusan data pribadi Anda</li>
                      <li>Menarik persetujuan untuk penggunaan data tertentu</li>
                      <li>Mengajukan keluhan tentang penggunaan data Anda</li>
                    </ul>
                  </div>
                </div>

                {/* Section 7 */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">7</span>
                    Perubahan Kebijakan
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 leading-relaxed">
                      Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diposting di halaman ini dengan tanggal pembaruan terbaru. Kami menyarankan Anda untuk memeriksa halaman ini secara berkala.
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-12 p-8 bg-gradient-to-br from-blue/5 to-transparent rounded-2xl border border-blue/10 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-blue shrink-0">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-dark uppercase tracking-tight mb-2">Punya Pertanyaan?</h3>
                    <p className="text-dark-4 leading-relaxed mb-4">
                      Tim privasi kami siap membantu Anda memahami bagaimana data Anda dilindungi.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a href="mailto:cs@seragamsekolah.co.id" className="inline-flex items-center gap-2 text-blue font-bold hover:underline transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                        cs@seragamsekolah.co.id
                      </a>
                    </div>
                  </div>
                </div>

                <p className="text-dark-5 text-sm mt-8 text-center">
                  Terakhir diperbarui: Mei 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default PrivacyPolicy;
