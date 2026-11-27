import BlogDetails from "@/components/BlogDetails";
import React from "react";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { domain } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const { data: blog } = await supabase
    .from('blogs')
    .select('title, img, content')
    .eq('slug', slug)
    .maybeSingle();

  if (!blog) return { title: "Blog Not Found" };

  const cleanDesc = blog.content
    ? blog.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 155)
    : `Baca selengkapnya mengenai ${blog.title} hanya di Toko Seragam Sekolah.`;

  return {
    title: blog.title,
    description: cleanDesc,
    openGraph: {
      type: "article",
      title: blog.title,
      description: cleanDesc,
      url: `${domain}/blogs/${slug}`,
      ...(blog.img ? { images: [blog.img] } : {}),
    },
    alternates: {
      canonical: `${domain}/blogs/${slug}`,
    },
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    image: formattedBlog.img.startsWith("http") ? formattedBlog.img : `${domain}${formattedBlog.img}`,
    datePublished: blog.created_at || new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "Toko Seragam Sekolah",
    },
    publisher: {
      "@type": "Organization",
      name: "Toko Seragam Sekolah",
      logo: {
        "@type": "ImageObject",
        url: `${domain}/images/logo/logo.svg`,
      },
    },
    mainEntityOfPage: `${domain}/blogs/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogDetails blog={formattedBlog} />
    </>
  );
};

export default BlogDetailsPage;
