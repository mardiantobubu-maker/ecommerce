import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { domain } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: products }, { data: blogs }] = await Promise.all([
    supabase.from('products').select('id, created_at'),
    supabase.from('blogs').select('slug, created_at'),
  ])

  const productUrls: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${domain}/shop-details?id=${product.id}`,
    lastModified: product.created_at ? new Date(product.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const blogUrls: MetadataRoute.Sitemap = (blogs || [])
    .filter((blog) => Boolean(blog.slug))
    .map((blog) => ({
      url: `${domain}/blogs/${encodeURIComponent(blog.slug)}`,
      lastModified: blog.created_at ? new Date(blog.created_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  const staticRoutes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/seragamsekolah', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/blogs/blog-grid', changeFrequency: 'daily' as const, priority: 0.8 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/privacy-policy', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/refund-policy', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/terms-conditions', changeFrequency: 'yearly' as const, priority: 0.4 },
  ]

  const staticUrls: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${domain}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  return [...staticUrls, ...productUrls, ...blogUrls]
}
