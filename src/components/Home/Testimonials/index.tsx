"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

// Import Swiper styles
import "swiper/css/navigation";
import "swiper/css";
import SingleItem from "./SingleItem";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      const dummyTestimonials = [
        { id: 1, name: "Budi Santoso", role: "Ketua Koperasi Sekolah", comment: "Pemesanan seragam kodi sangat mudah dan pengirimannya cepat. Kualitas bahan sangat memuaskan untuk siswa kami.", rating: 5, image_url: "https://i.pravatar.cc/150?u=budi" },
        { id: 2, name: "Ani Wijaya", role: "Pemilik Toko Retail", comment: "Harga grosirnya sangat kompetitif. Pelayanan admin sangat responsif saat saya menanyakan stok ukuran jumbo.", rating: 5, image_url: "https://i.pravatar.cc/150?u=ani" },
        { id: 3, name: "Dedi Kurniawan", role: "Pengelola Yayasan Pendidikan", comment: "Sistem checkout-nya sangat profesional. Sangat membantu dalam pengadaan seragam tahunan sekolah kami.", rating: 5, image_url: "https://i.pravatar.cc/150?u=dedi" }
      ];

      if (data && data.length > 0) {
        setTestimonials(data);
      } else {
        setTestimonials(dummyTestimonials);
      }
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  if (loading) return null;

  return (
    <section className="mt-0 pt-4 pb-10 lg:pt-15">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
        <div className="">
          <div className="swiper testimonial-carousel common-carousel p-5">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                  <Image src="/images/icons/icon-08.svg" alt="icon" width={20} height={20} />
                  Testimonial
                </span>
                <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">Ulasan Pengguna</h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  aria-label="Previous testimonial"
                  className="swiper-button-prev cursor-pointer flex items-center justify-center"
                >
                  <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15.4881 4.43057C15.8026 4.70014 15.839 5.17361 15.5694 5.48811L9.98781 12L15.5694 18.5119C15.839 18.8264 15.8026 19.2999 15.4881 19.5695C15.1736 19.839 14.7001 19.8026 14.4306 19.4881L8.43056 12.4881C8.18981 12.2072 8.18981 11.7928 8.43056 11.5119L14.4306 4.51192C14.7001 4.19743 15.1736 4.161 15.4881 4.43057Z" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next testimonial"
                  className="swiper-button-next cursor-pointer flex items-center justify-center"
                >
                  <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8.51192 4.43057C8.82641 4.161 9.29989 4.19743 9.56946 4.51192L15.5695 11.5119C15.8102 11.7928 15.8102 12.2072 15.5695 12.4881L9.56946 19.4881C9.29989 19.8026 8.82641 19.839 8.51192 19.5695C8.19743 19.2999 8.161 18.8264 8.43057 18.5119L14.0122 12L8.43057 5.48811C8.161 5.17361 8.19743 4.70014 8.51192 4.43057Z" />
                  </svg>
                </button>
              </div>
            </div>

            <Swiper
              ref={sliderRef}
              slidesPerView={3}
              spaceBetween={20}
              breakpoints={{
                0: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                1200: { slidesPerView: 3 },
              }}
            >
              {testimonials.map((item, key) => (
                <SwiperSlide key={key}>
                  <SingleItem testimonial={{
                    ...item,
                    authorImg: item.image_url || `https://i.pravatar.cc/150?u=${item.id}`,
                    authorName: item.name,
                    authorRole: item.role,
                    review: item.comment,
                    rating: item.rating
                  }} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
