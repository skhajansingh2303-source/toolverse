import { MetadataRoute } from 'next'
import { tools } from '@/lib/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `https://toolsverseapp.com/tools/${tool.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://toolsverseapp.com/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://toolsverseapp.com/about/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://toolsverseapp.com/contact/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://toolsverseapp.com/privacy/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://toolsverseapp.com/terms/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  return [...staticPages, ...toolEntries]
}
