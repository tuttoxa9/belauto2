import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://autobelcenter.by'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/adminbel',
          '/api',
          '/_next',
          '/uploads'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/adminbel',
          '/api'
        ],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: [
          '/adminbel',
          '/api'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}
