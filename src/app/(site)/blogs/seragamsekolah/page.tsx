import React from "react";
import BlogGrid from "@/components/BlogGrid";
import { domain } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

import { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog Seragam Sekolah | Tips & Panduan Lengkap",
  description: "Temukan berbagai tips memilih, merawat, dan panduan lengkap seputar seragam sekolah berkualitas untuk SD, SMP, dan SMA.",
  alternates: {
    canonical: `${domain}/blogs/seragamsekolah`,
  },
};

const BlogSeragamSekolahPage = async () => {
  const [{ data: initialBlogs, count }, { data: catRows }] = await Promise.all([
    supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 5),
    supabase.from('blogs').select('category'),
  ]);

  const order = ["Seragam SD", "Seragam SMP", "Seragam SMA", "Seragam Pramuka", "Seragam Batik", "Seragam Olahraga", "Aksesori"];
  const uniqueCategories = Array.from(new Set((catRows || []).map((b: any) => b.category).filter(Boolean))) as string[];
  uniqueCategories.sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <React.Suspense fallback={null}>
      <BlogGrid
        initialBlogs={initialBlogs || []}
        initialTotalItems={count ?? (initialBlogs?.length || 0)}
        initialTags={["Semua", ...uniqueCategories]}
      />
    </React.Suspense>
  );
};

export default BlogSeragamSekolahPage;
