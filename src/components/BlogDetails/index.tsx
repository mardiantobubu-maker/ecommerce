"use client";
import type { BlogItem } from "@/types/blogItem";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const BlogDetails = ({ blog }: { blog: BlogItem }) => {
  const [shareUrl, setShareUrl] = useState("");
  const [readingNow, setReadingNow] = useState(1);
  const [currentViews, setCurrentViews] = useState(blog.views || 0);

  useEffect(() => {
    let isMounted = true;
    setShareUrl(window.location.href);

    if (blog.id) {
      // 1. Increment total view count secara akurat
      supabase.from('blogs')
        .select('views')
        .eq('id', blog.id)
        .single()
        .then(({ data }) => {
          if (data && isMounted) {
            const newViews = (data.views || 0) + 1;
            supabase.from('blogs')
              .update({ views: newViews })
              .eq('id', blog.id)
              .then(({ error }) => {
                if (error) console.error("Error updating views:", error.message);
              });
          }
        });

      // 2. Setup Realtime Channel untuk Views & Presence (Sedang Membaca)
      const channel = supabase.channel(`blog-${blog.id}-stats`, {
        config: {
          presence: {
            key: blog.id.toString(),
          },
        },
      });

      channel
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'blogs',
            filter: `id=eq.${blog.id}`
          },
          (payload) => {
            if (isMounted && payload.new && typeof payload.new.views === 'number') {
              setCurrentViews(payload.new.views);
            }
          }
        )
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const count = Object.keys(newState).length;
          if (isMounted) {
            // Kita gunakan count + random offset kecil jika ingin terlihat lebih ramai, 
            // atau murni count untuk data yang benar-benar akurat.
            // User minta "bener-bener real time", jadi kita beri data asli.
            setReadingNow(count > 0 ? count : 1);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: Math.random().toString(36).substring(7),
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }
    return () => { isMounted = false; };
  }, [blog.id]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(blog.title);
  const encodedImage = encodeURIComponent(blog.img || "");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link berhasil disalin!");
  };

  return (
    <>
      <Breadcrumb title="Detail Blog" pages={["detail blog"]} />
      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="rounded-[10px] overflow-hidden mb-7.5 bg-gray-50 group relative">
            <Image
              className="rounded-[10px] w-full object-contain max-h-[500px]"
              src={blog.img || (blog as any).image_url || "/images/products/terbaru-seragam-sd.png"}
              alt={blog.title}
              width={750}
              height={477}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
              priority
            />
          </div>

            <span className="flex items-center gap-3 mb-6">
              <span className="text-dark-4 text-sm font-medium">
                {(() => {
                  // Prioritaskan data tanggal manual dari Admin jika ada
                  if (blog.date) return blog.date;

                  const dateToUse = blog.updated_at || blog.created_at;
                  if (!dateToUse) return "Tanpa Tanggal";
                  
                  const date = new Date(dateToUse);
                  const now = new Date();
                  const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
                  
                  if (diffInHours < 24) {
                    return "Baru saja diperbarui";
                  }
                  
                  return date.toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  });
                })()}
              </span>

              {/* <!-- divider --> */}
              <span className="block w-px h-4 bg-gray-4"></span>

              {/* Real-time Dilihat */}
              <div className="flex items-center gap-1.5 group cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue"></span>
                </span>
                <span className="ease-out duration-200 text-blue font-bold text-sm">
                  {currentViews} Dilihat
                </span>
              </div>

              {/* <!-- divider --> */}
              <span className="block w-px h-4 bg-gray-4"></span>

              {/* Real-time Sedang Membaca */}
              <div className="flex items-center gap-1.5 cursor-default bg-blue/5 px-2.5 py-0.5 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green"></span>
                </span>
                <span className="text-[11px] font-bold text-dark-4 uppercase tracking-wider">
                  {readingNow} Sedang Membaca
                </span>
              </div>
            </span>

            <div className="blog-power-bar">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl leading-[1.2]">
                {blog.title}
              </h2>
            </div>

            {blog.content ? (
              <div
                className="blog-content-dynamic"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            ) : (
              <>
                <div className="blog-power-bar !mb-12">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl leading-tight">
                    Mengapa Cara Memilih Seragam Sekolah yang Nyaman dan Awet untuk Buah Hati - Awet & Nyaman Sangat Penting?
                  </h2>
                </div>

                <p className="mb-8 text-base lg:text-lg leading-relaxed text-dark-4">
                  Memasuki tahun ajaran baru, salah satu persiapan terpenting bagi orang tua adalah menyediakan seragam sekolah yang berkualitas. Seragam bukan sekadar pakaian formal, melainkan identitas dan kenyamanan anak selama belajar di sekolah seharian penuh. Memilih seragam yang tepat dapat meningkatkan rasa percaya diri anak dan memastikan mereka tetap fokus pada pelajaran.
                </p>

                <p className="mb-8 text-base lg:text-lg leading-relaxed text-dark-4">
                  Kualitas bahan adalah faktor utama yang harus diperhatikan. Seragam sekolah yang baik biasanya terbuat dari campuran katun dan poliester. Katun memberikan sirkulasi udara yang baik (adem), sementara poliester membuat seragam tidak mudah kusut dan lebih awet setelah dicuci berulang kali. Untuk daerah tropis seperti Indonesia, pastikan bahan yang digunakan cukup menyerap keringat.
                </p>

                <p className="mb-8 text-base lg:text-lg leading-relaxed text-dark-4">
                  Selain bahan, ukuran juga menjadi kunci utama. Anak-anak berada dalam masa pertumbuhan yang cepat, sehingga sangat disarankan untuk memilih ukuran yang sedikit lebih longgar namun tetap rapi. Hal ini memberikan ruang bagi anak untuk bergerak aktif dan memastikan seragam dapat digunakan dalam jangka waktu yang lebih lama.
                </p>

                <div className="mt-7.5">
                  <h3 className="font-bold text-dark text-[26px] leading-tight mb-6">
                    Hal yang Perlu Diperhatikan Saat Membeli Seragam:
                  </h3>

                  <ul className="list-disc pl-6">
                    <li>Pastikan jahitan rapi dan kuat, terutama di bagian kerah and ketiak.</li>
                    <li>Pilih warna kain yang pekat dan tidak mudah luntur saat dicuci.</li>
                    <li>Cek kelengkapan atribut sesuai dengan jenjang sekolah (SD, SMP, atau SMA).</li>
                    <li>Pilih kancing yang terpasang kuat agar tidak mudah lepas saat anak aktif bergerak.</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-white pt-7.5 pb-6 px-4 sm:px-7.5 my-7.5">
                  <p className="italic text-dark text-center">
                    "Kenyamanan anak dalam berpakaian di sekolah adalah investasi kecil yang berdampak besar pada semangat belajar mereka setiap hari."
                  </p>

                  <a
                    href="#"
                    className="flex items-center justify-center gap-3 mt-5.5"
                  >
                    <div className="flex w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src="/images/users/user-04.jpg"
                        alt="user"
                        width={48}
                        height={48}
                      />
                    </div>

                    <div>
                      <h4 className="text-dark text-custom-sm">Budi Santoso</h4>
                      <p className="text-custom-xs">Ahli Tekstil & Orang Tua</p>
                    </div>
                  </a>
                </div>

                <p className="mb-8 text-base lg:text-lg leading-relaxed text-dark-4">
                  Perawatan seragam juga tidak boleh diabaikan. Untuk menjaga warna seragam tetap cerah, hindari penggunaan pemutih secara berlebihan dan jemurlah di tempat yang teduh (tidak terkena sinar matahari langsung). Menyetrika dengan suhu yang tepat juga membantu serat kain tetap kuat dan tidak mudah rapuh.
                </p>

                <p className="mb-8 text-base lg:text-lg leading-relaxed text-dark-4">
                  Di Toko Seragam Sekolah kami, kami menyediakan berbagai pilihan seragam mulai dari tingkat SD, SMP, hingga SMA dengan standar kualitas terbaik. Setiap produk kami dirancang khusus untuk menghadapi aktivitas sekolah yang padat dengan tetap mengedepankan aspek ergonomis dan estetika.
                </p>

                <p className="mb-8 text-base lg:text-lg leading-relaxed text-dark-4">
                  Kami memahami bahwa setiap sekolah mungkin memiliki detail seragam yang berbeda, seperti motif batik khusus atau atribut pramuka yang spesifik. Oleh karena itu, we juga menerima pesanan khusus untuk memenuhi kebutuhan seragam institusi atau sekolah Anda dengan proses produksi yang cepat dan hasil yang memuaskan.
                </p>

                <p className="mb-8 text-base lg:text-lg leading-relaxed text-dark-4">
                  Segera penuhi kebutuhan seragam sekolah putra-putri Anda bersama kami. Nikmati berbagai promo menarik dan kemudahan berbelanja online melalui platform kami yang aman dan terpercaya. Jadikan momen kembali ke sekolah sebagai awal yang penuh semangat dengan seragam baru yang berkualitas!
                </p>
              </>
            )}

            <div className="flex flex-wrap items-center justify-between gap-10 mt-16 pt-10 border-t border-gray-3">
              <div className="flex flex-wrap items-center gap-5">
                <p>Tag Populer :</p>

                <ul className="flex flex-wrap items-center gap-3.5">
                  <li>
                    <Link
                      className="inline-flex hover:text-white border border-gray-3 bg-white py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue"
                      href="/blogs/blog-grid?tag=Seragam SD"
                    >
                      Seragam SD
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="inline-flex hover:text-white border border-gray-3 bg-white py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue"
                      href="/blogs/blog-grid?tag=Seragam SMP"
                    >
                      Seragam SMP
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="inline-flex hover:text-white border border-gray-3 bg-white py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue"
                      href="/blogs/blog-grid?tag=Seragam SMA"
                    >
                      Seragam SMA
                    </Link>
                  </li>
                </ul>
              </div>

              {/* <!-- Social Links start --> */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/seragamsekolah.co.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#E4405F] ease-in duration-200 hover:bg-opacity-90"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_317_501)">
                      <path d="M19.6562 6C19.625 5 19.4375 4.28125 19.2187 3.625C19 2.96875 18.6562 2.4375 18.125 1.90625C17.5937 1.375 17.0625 1.0625 16.4375 0.8125C15.8125 0.5625 15.125 0.40625 14.0625 0.375C12.9687 0.3125 12.6562 0.3125 10 0.3125C7.34375 0.3125 7.0625 0.3125 6 0.34375C4.9375 0.375 4.28125 0.5625 3.625 0.78125C2.96875 1 2.4375 1.375 1.90625 1.90625C1.375 2.4375 1.03125 2.96875 0.8125 3.625C0.5625 4.25 0.40625 4.9375 0.375 6C0.34375 7.0625 0.3125 7.34375 0.3125 10C0.3125 12.6562 0.3125 12.9375 0.34375 14C0.375 15.0625 0.5625 15.7188 0.78125 16.375C1 17.0312 1.34375 17.5625 1.875 18.0938C2.40625 18.625 2.96875 18.9688 3.59375 19.1875C4.21875 19.4062 4.90625 19.5938 5.96875 19.625C7.03125 19.6875 7.3125 19.6875 9.96875 19.6875C12.625 19.6875 12.9062 19.6875 13.9687 19.6562C15.0312 19.625 15.6875 19.4375 16.3437 19.2188C17 19 17.5312 18.6562 18.0625 18.125C18.5937 17.5938 18.9375 17.0312 19.1562 16.4062C19.375 15.7812 19.5625 15.0938 19.5937 14.0312C19.625 13.0312 19.625 12.7188 19.625 10.0625C19.625 7.40625 19.6875 7.0625 19.6562 6ZM17.9062 13.9062C17.875 14.8438 17.6875 15.3438 17.5625 15.7188C17.375 16.1562 17.1562 16.5 16.8125 16.8125C16.4687 17.1562 16.1562 17.3438 15.7187 17.5625C15.375 17.6875 14.875 17.875 13.9062 17.9062C12.9062 17.9062 12.5937 17.9062 10.0312 17.9062C7.46875 17.9062 7.125 17.9062 6.125 17.875C5.1875 17.8438 4.6875 17.6562 4.3125 17.5312C3.875 17.3438 3.53125 17.125 3.21875 16.7812C2.875 16.4375 2.6875 16.125 2.46875 15.6875C2.34375 15.3438 2.15625 14.8438 2.125 13.875C2.125 12.9063 2.125 12.5938 2.125 10C2.125 7.40625 2.125 7.09375 2.15625 6.09375C2.1875 5.15625 2.375 4.65625 2.5 4.28125C2.6875 3.84375 2.90625 3.5 3.21875 3.1875C3.5625 2.84375 3.875 2.65625 4.3125 2.46875C4.65625 2.34375 5.15625 2.15625 6.125 2.125C7.125 2.09375 7.4375 2.09375 10.0312 2.09375C12.625 2.09375 12.9375 2.09375 13.9375 2.125C14.875 2.15625 15.375 2.34375 15.75 2.46875C16.1875 2.65625 16.5312 2.875 16.8437 3.1875C17.1875 3.53125 17.375 3.84375 17.5937 4.28125C17.7187 4.625 17.9062 5.125 17.9375 6.09375C17.9687 7.09375 17.9687 7.40625 17.9687 10C17.9687 12.5938 17.9375 12.9062 17.9062 13.9062Z" fill="white" />
                      <path d="M10.0005 5.03125C7.21924 5.03125 5.03174 7.28125 5.03174 10C5.03174 12.7812 7.28174 14.9688 10.0005 14.9688C12.7192 14.9688 15.0005 12.7812 15.0005 10C15.0005 7.21875 12.7817 5.03125 10.0005 5.03125ZM10.0005 13.25C8.18799 13.25 6.75049 11.7812 6.75049 10C6.75049 8.21875 8.21924 6.75 10.0005 6.75C11.813 6.75 13.2505 8.1875 13.2505 10C13.2505 11.8125 11.813 13.25 10.0005 13.25Z" fill="white" />
                      <path d="M15.2188 5.96875C15.8573 5.96875 16.375 5.45106 16.375 4.8125C16.375 4.17391 15.8573 3.65625 15.2188 3.65625C14.5802 3.65625 14.0625 4.17391 14.0625 4.8125C14.0625 5.45106 14.5802 5.96875 15.2188 5.96875Z" fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_317_501">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@seragamsekolah.co.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#000000] ease-in duration-200 hover:bg-opacity-80 flex-shrink-0"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.53.02C13.84,0,15.14.01,16.44,0c.08,1.53.63,3.09,1.75,4.17,1.12,1.11,2.7,1.74,4.24,1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01V14.5c.03,2.15-.6,4.31-2.01,5.95-1.52,1.76-3.81,2.82-6.12,2.92-2.52.12-5.11-.84-6.84-2.73C-.19,18.6-.88,15.53-.04,12.85c.82-2.61,3-4.75,5.67-5.32,1.09-.23,2.22-.22,3.32.04v4.21c-.7-.2-1.45-.25-2.17-.11-1.25.24-2.38,1.14-2.86,2.32-.47,1.15-.36,2.53.33,3.56.71,1.06,1.95,1.72,3.23,1.71,1.29,0,2.53-.66,3.23-1.73.66-1,1-2.18.99-3.37V0L12.53.02z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#1877F2] ease-in duration-200 hover:bg-opacity-90"
                  title="Bagikan ke Facebook"
                >
                  <svg
                    width="9"
                    height="18"
                    viewBox="0 0 9 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.13643 7H6.78036H6.29605V6.43548V4.68548V4.12097H6.78036H7.79741C8.06378 4.12097 8.28172 3.89516 8.28172 3.55645V0.564516C8.28172 0.254032 8.088 0 7.79741 0H6.02968C4.11665 0 2.78479 1.58064 2.78479 3.92339V6.37903V6.94355H2.30048H0.65382C0.314802 6.94355 0 7.25403 0 7.70564V9.7379C0 10.1331 0.266371 10.5 0.65382 10.5H2.25205H2.73636V11.0645V16.7379C2.73636 17.1331 3.00273 17.5 3.39018 17.5H5.66644C5.81174 17.5 5.93281 17.4153 6.02968 17.3024C6.12654 17.1895 6.19919 16.9919 6.19919 16.8226V11.0927V10.5282H6.70771H7.79741C8.11222 10.5282 8.35437 10.3024 8.4028 9.96371V9.93548V9.90726L8.74182 7.95968C8.76604 7.7621 8.74182 7.53629 8.59653 7.31048C8.54809 7.16935 8.33016 7.02823 8.13643 7Z"
                      fill="white"
                    ></path>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#25D366] ease-in duration-200 hover:bg-opacity-90"
                  title="Bagikan ke WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.987 0 1.763.461 3.479 1.332 5.004l-1.417 5.176 5.302-1.391c1.5 0.814 3.195 1.242 4.922 1.242l0.005 0c5.507 0 9.986-4.479 9.986-9.987 0-2.659-1.036-5.158-2.92-7.042-1.884-1.884-4.383-2.92-7.043-2.92zM12.012 20.25c-1.579 0-3.136-0.421-4.502-1.218l-0.323-0.188-3.149 0.826 0.841-3.072-0.207-0.33c-0.876-1.396-1.339-3.013-1.339-4.679 0-4.839 3.935-8.775 8.778-8.775 2.345 0 4.549 0.913 6.208 2.573s2.573 3.863 2.573 6.208c-0.001 4.84-3.936 8.775-8.778 8.775zM16.141 13.567c-0.226-0.113-1.339-0.661-1.547-0.736s-0.358-0.113-0.509 0.113-0.584 0.736-0.716 0.886-0.264 0.169-0.49 0.056c-0.226-0.113-0.955-0.352-1.819-1.124-0.672-0.599-1.125-1.339-1.257-1.565s-0.014-0.348 0.099-0.461c0.101-0.102 0.226-0.264 0.339-0.396s0.151-0.226 0.226-0.377 0.038-0.283-0.019-0.396-0.509-1.225-0.697-1.678c-0.183-0.442-0.365-0.382-0.509-0.389l-0.433-0.008c-0.151 0-0.396 0.056-0.603 0.283s-0.792 0.773-0.792 1.884 0.811 2.187 0.924 2.338c0.113 0.151 1.595 2.435 3.864 3.412 0.54 0.233 0.961 0.371 1.291 0.475 0.542 0.172 1.035 0.148 1.424 0.09 0.433-0.064 1.339-0.547 1.527-1.075s0.189-0.98 0.132-1.075c-0.056-0.094-0.207-0.151-0.433-0.264z"/>
                  </svg>
                </a>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center w-[35px] h-[35px] rounded-full bg-gray-3 ease-in duration-200 hover:bg-gray-4"
                  title="Salin Link"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
    </>
  );
};

export default BlogDetails;
