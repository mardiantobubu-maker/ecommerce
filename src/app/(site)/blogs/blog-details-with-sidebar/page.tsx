import React from "react";
import BlogDetailsWithSidebar from "@/components/BlogDetailsWithSidebar";
import blogData from "@/components/BlogGrid/blogData";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Panduan Lengkap Seragam Sekolah | Blog Toko Seragam",
  description: "Baca panduan lengkap mengenai pemilihan bahan, ukuran, dan perawatan seragam sekolah untuk semua jenjang pendidikan.",
};

const BlogDetailsWithSidebarPage = () => {
  const blog = blogData[0];
  return (
    <main>
      <BlogDetailsWithSidebar blog={blog} />
    </main>
  );
};

export default BlogDetailsWithSidebarPage;
