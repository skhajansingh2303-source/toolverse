import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/media/',
  },
  title: 'Media & Image Tools - Compress, Convert, Resize & Color Picker | ToolsVerse',
  description: 'Browser-based image utilities. Compress JPG and PNG, convert formats, resize images, and pick colors without uploading files.',
  keywords: ["image compressor","image converter","color picker","heic to jpg","favicon generator"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'media')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'media');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
