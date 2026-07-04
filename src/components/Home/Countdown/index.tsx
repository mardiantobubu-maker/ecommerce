"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

const CounDown = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [promo, setPromo] = useState<any>(null);

  const fetchPromo = async () => {
    const { data } = await supabase
      .from('promos')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (data) setPromo(data);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPromoSafe = async () => {
      const { data } = await supabase
        .from('promos')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (isMounted && data) setPromo(data);
    };

    fetchPromoSafe();

    // Subscribe to realtime updates for the promos table
    const channel = supabase
      .channel('promo-updates-v2')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'promos'
        },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === 'DELETE') {
            setPromo(null);
          } else {
            setPromo(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!promo?.target_date) return;

    const target = new Date(promo.target_date).getTime();
    if (isNaN(target)) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const time = target - now;
      
      if (time > 0) {
        setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
        setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
        setMinutes(Math.floor((time / 1000 / 60) % 60));
        setSeconds(Math.floor((time / 1000) % 60));
      } else {
        setDays(0); setHours(0); setMinutes(0); setSeconds(0);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [promo]);

  // Hide the entire section if promo is missing or has already ended
  const isExpired = promo?.target_date ? new Date(promo.target_date).getTime() <= Date.now() : true;
  if (!promo || isExpired) return null;

  return (
    <section className="overflow-hidden mt-0 pt-4 pb-0 lg:py-20">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
        <div className="relative overflow-hidden z-1 rounded-[10px] bg-[#D0E9F3] p-6 sm:p-7.5 lg:p-10 xl:p-15 shadow-sm border border-gray-3">
          <div className="max-w-[422px] w-full">
            <span className="block font-medium text-custom-1 text-blue mb-2.5">
              Jangan Lewatkan!!
            </span>

            <h2 className="font-bold text-dark text-base lg:text-heading-4 xl:text-heading-3 mb-3 leading-tight">
              {promo.title}
            </h2>

            <p className="text-[#212121] text-sm">{promo.description}</p>

            <div className="flex flex-wrap gap-4 sm:gap-6 mt-6">
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {days < 10 ? "0" + days : days}
                </span>
                <span className="block text-custom-sm text-dark text-center">Hari</span>
              </div>
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {hours < 10 ? "0" + hours : hours}
                </span>
                <span className="block text-custom-sm text-dark text-center">Jam</span>
              </div>
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {minutes < 10 ? "0" + minutes : minutes}
                </span>
                <span className="block text-custom-sm text-dark text-center">Menit</span>
              </div>
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {seconds < 10 ? "0" + seconds : seconds}
                </span>
                <span className="block text-custom-sm text-dark text-center">Detik</span>
              </div>
            </div>

            <a
              href={promo.button_link || "/shop"}
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-3 px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 shadow-md transform active:scale-95"
            >
              {promo.button_text || "Lihat Sekarang!"}
            </a>
          </div>

          <Image
            src="/images/countdown/countdown-bg.png"
            alt="bg shapes"
            className="hidden sm:block absolute right-0 bottom-0 -z-1 opacity-50"
            width={737}
            height={482}
          />
          <div className="hidden lg:block absolute right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1 drop-shadow-2xl animate-float">
             <Image
               src="/images/products/terbaru-seragam-sd.png"
               alt="Promo"
               width={450}
               height={450}
               className="max-w-[450px] h-auto rounded-lg object-contain"
             />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounDown;
