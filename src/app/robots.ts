import { MetadataRoute } from 'next'
import { domain } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/seragamsekolah-admin/'],
    },
    sitemap: `${domain}/sitemap.xml`,
  }
}
