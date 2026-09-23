import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/organize-pdf/',
  },
  title: 'Organize PDF - Merge, Split, Remove, Rotate & Reorder PDF Pages | ToolsVerse',
  description: 'Easily organize PDF files online. Merge multiple documents, split pages, remove unwanted pages, and rotate PDF pages instantly.',
  keywords: ["organize pdf","merge pdf","split pdf","rotate pdf","rearrange pdf pages"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'organize-pdf')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'organize-pdf');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
