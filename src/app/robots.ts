import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/seragamsekolah-admin/'],
    },
    sitemap: 'https://www.seragamsekolah.com/sitemap.xml',
  }
}
