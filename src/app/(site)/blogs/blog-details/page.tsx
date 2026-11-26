import BlogDetails from "@/components/BlogDetails";
import React from "react";
import blogData from "@/components/BlogGrid/blogData";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Detail Blog | Toko Seragam Sekolah",
  description: "Informasi lengkap mengenai seragam sekolah berkualitas.",
};

const BlogDetailsPage = () => {
  const blog = blogData[0];
  return (
    <main>
      <BlogDetails blog={blog} />
    </main>
  );
};

export default BlogDetailsPage;
