"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SupportSidebar from "../SupportSidebar";

const TermsConditions = () => {
  return (
    <>
      <Breadcrumb title={"Syarat Penggunaan"} pages={["syarat penggunaan"]} />
      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* Sidebar */}
            <SupportSidebar />

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl shadow-1 p-6 sm:p-10 xl:p-15">
              <div className="max-w-[870px] mx-auto">
                <p className="text-dark-4 mb-8 leading-relaxed">
                  Selamat datang di Toko Seragam Sekolah. Dengan mengakses dan menggunakan situs ini, Anda menyetujui syarat dan ketentuan berikut. Mohon baca dengan saksama sebelum melakukan transaksi.
                </p>

                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">1</span>
                    Ketentuan Umum
                  </h2>
                  <div className="pl-11">
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Situs ini dioperasikan oleh Toko Seragam Sekolah</li>
                      <li>Pengguna harus berusia minimal 18 tahun atau didampingi orang tua/wali</li>
                      <li>Informasi yang Anda berikan harus akurat dan terkini</li>
                      <li>Kami berhak menolak layanan kepada siapa pun dengan alasan apa pun</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">2</span>
                    Produk dan Harga
                  </h2>
                  <div className="pl-11">
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Harga produk dapat berubah sewaktu-waktu tanpa pemberitahuan</li>
                      <li>Warna produk dapat sedikit berbeda dari tampilan di layar</li>
                      <li>Kami berusaha menjaga ketersediaan stok, namun kehabisan stok dapat terjadi</li>
                      <li>Harga yang tertera belum termasuk biaya pengiriman dan jasa layanan lainnya</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">3</span>
                    Pemesanan dan Pembayaran
                  </h2>
                  <div className="pl-11">
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Pesanan dianggap sah setelah pembayaran dikonfirmasi</li>
                      <li>Kami menerima pembayaran via transfer bank, COD, Invoice / Penagihan (B2B) Khusus instansi/koperasi sekolah. Wajib memiliki kerjasama MOU.</li>
                      <li>Pesanan akan diproses dalam 1-3 hari kerja setelah pembayaran</li>
                      <li>Pesanan dalam jumlah besar (B2B) memerlukan konfirmasi terpisah</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">4</span>
                    Pengiriman
                  </h2>
                  <div className="pl-11">
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Pengiriman tersedia ke seluruh wilayah Indonesia</li>
                      <li>Estimasi pengiriman 2-7 hari kerja tergantung lokasi</li>
                      <li>Biaya pengiriman dihitung berdasarkan berat dan tujuan</li>
                      <li>Gratis ongkir untuk pembelian minimal Rp500.000 (area tertentu)</li>
                      <li>Risiko kehilangan/kerusakan selama pengiriman menjadi tanggung jawab jasa ekspedisi</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">5</span>
                    Hak Kekayaan Intelektual
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 leading-relaxed">
                      Seluruh konten di situs ini termasuk teks, gambar, logo, desain, dan kode sumber dilindungi oleh hak cipta. Dilarang menyalin, mendistribusikan, atau menggunakan konten tanpa izin tertulis dari kami.
                    </p>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">6</span>
                    Batasan Tanggung Jawab
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 leading-relaxed">
                      Kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan produk atau layanan kami. Tanggung jawab kami terbatas pada nilai produk yang dibeli.
                    </p>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">7</span>
                    Perubahan Ketentuan
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 leading-relaxed">
                      Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan di situs ini. Penggunaan berkelanjutan atas layanan kami berarti Anda menyetujui perubahan tersebut.
                    </p>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-blue/5 rounded-lg border border-blue/10">
                  <h3 className="text-lg font-semibold text-dark mb-3">Pertanyaan?</h3>
                  <p className="text-dark-4 leading-relaxed">
                    Hubungi kami di{" "}
                    <a href="mailto:cs@seragamsekolah.co.id" className="text-blue hover:underline">cs@seragamsekolah.co.id</a>
                    {" "}atau telepon <strong>+6288211346422</strong>.
                  </p>
                </div>
                <p className="text-dark-5 text-sm mt-8 text-center">Terakhir diperbarui: Mei 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default TermsConditions;
