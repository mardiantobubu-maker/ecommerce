import React from "react";
import BlogGrid from "@/components/BlogGrid";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog Seragam Sekolah | Tips & Panduan Lengkap",
  description: "Temukan berbagai tips memilih, merawat, dan panduan lengkap seputar seragam sekolah berkualitas untuk SD, SMP, dan SMA.",
};

const BlogGridPage = () => {
  return (
    <main>
      <React.Suspense fallback={null}>
        <BlogGrid />
      </React.Suspense>
    </main>
  );
};

export default BlogGridPage;
