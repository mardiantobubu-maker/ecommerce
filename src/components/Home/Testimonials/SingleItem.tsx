import React from "react";
import { Testimonial } from "@/types/testimonial";
import Image from "next/image";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="shadow-testimonial bg-white rounded-[10px] p-4 sm:p-6 m-1">
      <div className="flex items-center gap-1 mb-5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={i < (testimonial.rating || 5) ? "fill-[#FFA645]" : "fill-gray-4"}
            width="16"
            height="16"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z" />
          </svg>
        ))}
      </div>

      <p className="text-[16px] text-dark mb-6 leading-relaxed italic font-medium">"{testimonial.review}"</p>

      <div className="flex items-center gap-4">
        <div className="w-12.5 h-12.5 rounded-full bg-blue/5 flex items-center justify-center text-blue font-black text-base border border-blue/10 shadow-sm flex-shrink-0">
          {testimonial.authorName ? testimonial.authorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
        </div>

        <div>
          <h3 className="font-bold text-[14px] text-dark">{testimonial.authorName}</h3>
          <p className="text-custom-sm text-dark-4">{testimonial.authorRole}</p>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
