"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SupportSidebar from "../SupportSidebar";

const RefundPolicy = () => {
  return (
    <>
      <Breadcrumb title={"Kebijakan Pengembalian Dana"} pages={["kebijakan pengembalian dana"]} />
      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* Sidebar */}
            <SupportSidebar />

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl shadow-1 p-6 sm:p-10 xl:p-15">
              <div className="max-w-[870px] mx-auto">
                <p className="text-dark-4 mb-8 leading-relaxed">
                  Kepuasan pelanggan adalah prioritas utama kami. Jika Anda tidak puas dengan pembelian Anda, kami menawarkan kebijakan pengembalian dana yang adil dan transparan.
                </p>
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">1</span>
                    Syarat Pengembalian
                  </h2>
                  <div className="pl-11">
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Pengajuan pengembalian dilakukan maksimal <strong>7 hari</strong> setelah barang diterima</li>
                      <li>Barang dalam kondisi asli, belum digunakan, dan belum dicuci</li>
                      <li>Label dan kemasan produk masih utuh</li>
                      <li>Disertai bukti pembelian (invoice/nota)</li>
                    </ul>
                  </div>
                </div>
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">2</span>
                    Kondisi yang Dapat Dikembalikan
                  </h2>
                  <div className="pl-11">
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Produk cacat atau rusak saat diterima</li>
                      <li>Produk tidak sesuai dengan deskripsi atau gambar</li>
                      <li>Ukuran tidak sesuai dengan panduan ukuran</li>
                      <li>Kesalahan pengiriman (produk berbeda dari pesanan)</li>
                    </ul>
                  </div>
                </div>
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red/10 text-red text-sm font-bold">3</span>
                    Kondisi yang Tidak Dapat Dikembalikan
                  </h2>
                  <div className="pl-11">
                    <ul className="list-disc pl-5 text-dark-4 space-y-2">
                      <li>Produk sudah digunakan, dicuci, atau dimodifikasi</li>
                      <li>Produk pesanan khusus (custom/bordir nama)</li>
                      <li>Kerusakan akibat penggunaan yang tidak sesuai</li>
                      <li>Pengajuan melebihi batas waktu 7 hari</li>
                    </ul>
                  </div>
                </div>
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">4</span>
                    Proses Pengembalian
                  </h2>
                  <div className="pl-11 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold text-sm">1</div>
                      <div>
                        <h4 className="font-medium text-dark mb-1">Hubungi Tim Kami</h4>
                        <p className="text-dark-4 text-sm">Kirim email ke cs@seragamsekolah.co.id dengan nomor pesanan dan alasan pengembalian.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold text-sm">2</div>
                      <div>
                        <h4 className="font-medium text-dark mb-1">Konfirmasi Persetujuan</h4>
                        <p className="text-dark-4 text-sm">Tim kami akan meninjau pengajuan dalam 1-2 hari kerja.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold text-sm">3</div>
                      <div>
                        <h4 className="font-medium text-dark mb-1">Kirim Barang Kembali</h4>
                        <p className="text-dark-4 text-sm">Kirim barang ke alamat yang diberikan. Biaya pengiriman ditanggung pembeli kecuali kesalahan dari kami.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold text-sm">4</div>
                      <div>
                        <h4 className="font-medium text-dark mb-1">Proses Pengembalian Dana</h4>
                        <p className="text-dark-4 text-sm">Pengembalian dana diproses dalam 5-14 hari kerja ke metode pembayaran asal.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-dark mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue text-sm font-bold">5</span>
                    Penukaran Ukuran
                  </h2>
                  <div className="pl-11">
                    <p className="text-dark-4 leading-relaxed">
                      Kami menyediakan layanan penukaran ukuran gratis (1x per produk) jika ukuran seragam tidak pas. Biaya pengiriman penukaran pertama ditanggung oleh kami.
                    </p>
                  </div>
                </div>
                <div className="mt-12 p-8 bg-gradient-to-br from-blue/5 to-transparent rounded-2xl border border-blue/10 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-blue shrink-0">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-dark uppercase tracking-tight mb-2">Butuh Bantuan?</h3>
                    <p className="text-dark-4 leading-relaxed mb-4">
                      Tim kami siap membantu Anda dengan pengembalian dana atau penukaran produk.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a href="mailto:cs@seragamsekolah.co.id" className="inline-flex items-center gap-2 text-blue font-bold hover:underline transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                        cs@seragamsekolah.co.id
                      </a>
                      <span className="text-gray-3 hidden sm:inline">|</span>
                      <a href="https://wa.me/6288211346422" target="_blank" className="inline-flex items-center gap-2 text-green font-bold hover:underline transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Hubungi WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
                <p className="text-dark-5 text-sm mt-8 text-center">Terakhir diperbarui: April 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RefundPolicy;
