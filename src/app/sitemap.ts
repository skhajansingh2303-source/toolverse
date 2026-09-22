import { MetadataRoute } from 'next'
import { tools } from '@/lib/tools'
import { LANGUAGE_CODES } from '@/lib/languages'

const BASE_URL = 'https://toolsverseapp.com';

function buildLanguageAlternates(path: string) {
  const languages: Record<string, string> = {
    'x-default': `${BASE_URL}${path}`,
  };
  for (const code of LANGUAGE_CODES) {
    languages[code] = `${BASE_URL}${path}?lang=${code}`;
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => {
    const path = `/tools/${tool.slug}/`;
    return {
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: buildLanguageAlternates(path),
    };
  });

  const staticPagesList = [
    { path: '/', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/about/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/contact/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/privacy/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/terms/', changeFrequency: 'monthly' as const, priority: 0.7 },
  ];

  const staticPages: MetadataRoute.Sitemap = staticPagesList.map((item) => ({
    url: `${BASE_URL}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
    alternates: buildLanguageAlternates(item.path),
  }));

  return [...staticPages, ...toolEntries];
}
