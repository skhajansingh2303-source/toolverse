import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/text/',
  },
  title: 'Text Utilities - Word Counter, Case Converter & Text Cleaner | ToolsVerse',
  description: 'Online text utilities. Count words and characters, convert letter cases, clean lists, and generate lorem ipsum placeholder text.',
  keywords: ["word counter","case converter","list cleaner","text tools","lorem ipsum"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'text')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'text');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
