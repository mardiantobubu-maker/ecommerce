import React from "react";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Inspirasi Seragam Sekolah | Blog Toko Seragam",
  description: "Dapatkan inspirasi dan tren terbaru seputar seragam sekolah nasional, pramuka, dan batik hanya di blog kami.",
};

const BlogGridWithSidebarPage = () => {
  return (
    <>
      <BlogGridWithSidebar />
    </>
  );
};

export default BlogGridWithSidebarPage;
