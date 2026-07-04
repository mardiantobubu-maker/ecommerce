import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.seragamsekolah.com'
 
  // Fetch products for dynamic sitemap entries
  const { data: products } = await supabase.from('products').select('id, updated_at')
 
  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/shop-details?id=${product.id}`,
    lastModified: product.updated_at || new Date(),
  }))
 
  const staticUrls = [
    '',
    '/shop-with-sidebar',
    '/contact',
    '/faq',
    '/privacy-policy',
    '/refund-policy',
    '/terms-conditions',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))
 
  return [...staticUrls, ...productUrls]
}
