import { MetadataRoute } from 'next'
import { tools, CATEGORIES } from '@/lib/tools'
import { LANGUAGE_CODES } from '@/lib/languages'
import { BLOG_POSTS } from '@/lib/blogData'

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

  // 1. Tool pages with category in URL (/tools/category/tool/)
  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => {
    const path = `/tools/${tool.categorySlug}/${tool.slug}/`;
    return {
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: buildLanguageAlternates(path),
    };
  });

  // 2. Category landing pages (/tools/category/)
  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((cat) => {
    const path = `/tools/${cat.slug}/`;
    return {
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
      alternates: buildLanguageAlternates(path),
    };
  });

  // 3. Blog & Guides pages (/blog/ and /blog/[slug]/)
  const blogIndexEntry: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog/`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.95,
      alternates: buildLanguageAlternates('/blog/'),
    },
  ];

  const blogPostEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => {
    const path = `/blog/${post.slug}/`;
    return {
      url: `${BASE_URL}${path}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: buildLanguageAlternates(path),
    };
  });

  // 4. Static main pages
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

  return [...staticPages, ...categoryEntries, ...toolEntries, ...blogIndexEntry, ...blogPostEntries];
}
