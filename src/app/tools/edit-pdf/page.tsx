import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'Edit PDF - Add Watermark, Page Numbers, Bookmarks & Crop PDF | ToolsVerse',
  description: 'Edit PDF documents directly in your browser. Add text, page numbers, watermarks, crop pages, and adjust page size.',
  keywords: ["edit pdf","watermark pdf","page numbers pdf","crop pdf","pdf editor online"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'edit-pdf')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'edit-pdf');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
