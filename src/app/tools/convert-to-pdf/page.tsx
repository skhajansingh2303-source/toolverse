import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'Convert to PDF - Images, Word, Excel & PowerPoint to PDF Online | ToolsVerse',
  description: 'Convert JPG, PNG, Word DOCX, Excel XLSX, PPTX, and HTML web pages to PDF online for free. Fast, private, and secure.',
  keywords: ["convert to pdf","jpg to pdf","word to pdf","image to pdf","excel to pdf"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'convert-to-pdf')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'convert-to-pdf');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
