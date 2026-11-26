import BlogDetails from "@/components/BlogDetails";
import React from "react";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const { data: blog } = await supabase
    .from('blogs')
    .select('title')
    .eq('slug', slug)
    .maybeSingle();

  if (!blog) return { title: "Blog Not Found" };

  return {
    title: `${blog.title} | Toko Seragam Sekolah`,
    description: `Baca selengkapnya mengenai ${blog.title} hanya di Toko Seragam Sekolah.`,
  };
}

const BlogDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!blog) {
    notFound();
  }

  // Map Supabase fields to BlogItem type if necessary
  const formattedBlog = {
    ...blog,
    img: blog.img || "/images/blog/blog-01.jpg"
  };

  return (
    <main>
      <BlogDetails blog={formattedBlog} />
    </main>
  );
};

export default BlogDetailsPage;
