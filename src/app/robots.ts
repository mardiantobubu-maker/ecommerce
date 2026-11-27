import { MetadataRoute } from 'next'
import { domain } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/seragamsekolah-admin/',
        '/cart/',
        '/checkout/',
        '/my-account/',
        '/transactions/',
        '/wishlist/',
        '/signin/',
        '/signup/',
        '/reset-password/',
      ],
    },
    sitemap: `${domain}/sitemap.xml`,
  }
}
