"use client";
import React from "react";
import type { BlogItem } from "@/types/blogItem";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const BlogItem = ({ blog, priority }: { blog: BlogItem; priority?: boolean }) => {
  const [currentViews, setCurrentViews] = React.useState(blog.views || 0);

  React.useEffect(() => {
    let isMounted = true;
    if (blog.id) {
      const channel = supabase
        .channel(`blog-item-${blog.id}-v2`)
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
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }
    return () => { isMounted = false; };
  }, [blog.id]);

  return (
    <div className="shadow-1 bg-white rounded-xl px-4 sm:px-5 pt-5 pb-4 transition-all hover:shadow-lg group">
      <Link href={`/blogs/${blog.slug}`} className="rounded-md overflow-hidden block relative aspect-[330/210] bg-gray-50">
        <Image
          src={blog.img || (blog as any).image_url || "/images/products/terbaru-seragam-sd.png"}
          alt="blog"
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-md object-contain p-2 group-hover:scale-105 transition-all duration-300"
        />
      </Link>

      <div className="mt-5.5">
        <span className="flex items-center gap-3 mb-2.5">
          <span className="text-custom-sm text-dark-4 font-medium whitespace-nowrap">
            {(() => {
              // Prioritaskan data tanggal manual dari Admin jika ada
              if (blog.date) return blog.date;

              const dateToUse = blog.updated_at || blog.created_at;
              if (!dateToUse) return "Tanpa Tanggal";
              const date = new Date(dateToUse);
              const now = new Date();
              const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
              if (diffInHours < 24) return "Baru saja diperbarui";
              return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            })()}
          </span>

          {/* <!-- divider --> */}
          <span className="block w-px h-4 bg-gray-4"></span>

          <div className="flex items-center gap-1.5 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue"></span>
            </span>
            <span className="text-custom-sm text-blue font-bold whitespace-nowrap">
              {currentViews} Dilihat
            </span>
          </div>
        </span>

        <h2 className="font-medium text-dark text-base sm:text-xl ease-out duration-200 mb-4 hover:text-blue">
          <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h2>

        <Link
          href={`/blogs/${blog.slug}`}
          className="text-custom-sm inline-flex items-center gap-2 py-2 ease-out duration-200 hover:text-blue"
        >
          Baca Selengkapnya
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.1023 4.10225C10.3219 3.88258 10.6781 3.88258 10.8977 4.10225L15.3977 8.60225C15.6174 8.82192 15.6174 9.17808 15.3977 9.39775L10.8977 13.8977C10.6781 14.1174 10.3219 14.1174 10.1023 13.8977C9.88258 13.6781 9.88258 13.3219 10.1023 13.1023L13.642 9.5625H3C2.68934 9.5625 2.4375 9.31066 2.4375 9C2.4375 8.68934 2.68934 8.4375 3 8.4375H13.642L10.1023 4.89775C9.88258 4.67808 9.88258 4.32192 10.1023 4.10225Z"
              fill=""
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default BlogItem;
