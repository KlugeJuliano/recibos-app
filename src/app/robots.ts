import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/gerar'],
      disallow: ['/dashboard', '/login'],
    },
    sitemap: 'https://www.recibopro.com.br/sitemap.xml',
  };
}