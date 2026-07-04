"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const Categories = () => {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      const { data } = await supabase
        .from('blogs')
        .select('category');

      if (data) {
        const counts: { [key: string]: number } = {};
        data.forEach(blog => {
          if (blog.category) {
            counts[blog.category] = (counts[blog.category] || 0) + 1;
          }
        });

        const formatted = Object.entries(counts).map(([name, count]) => ({
          name,
          count
        }));

        // Urutkan kategori sesuai urutan standar
        const order = ["Seragam SD", "Seragam SMP", "Seragam SMA", "Seragam Pramuka", "Seragam Batik", "Seragam Olahraga", "Aksesori"];
        formatted.sort((a, b) => {
          const indexA = order.indexOf(a.name);
          const indexB = order.indexOf(b.name);
          if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setCategories(formatted);
      }
    };

    fetchCategoryCounts();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Kategori Populer</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <Link 
              key={cat.name}
              href={`/blogs/blog-grid?tag=${encodeURIComponent(cat.name)}`}
              className="group flex items-center justify-between ease-out duration-200 text-dark hover:text-blue"
            >
              {cat.name}
              <span className="inline-flex rounded-[30px] bg-gray-2 text-custom-xs px-2 py-0.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue font-bold">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
