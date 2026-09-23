import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/convert-from-pdf/',
  },
  title: 'Convert from PDF - Extract & Convert PDF to Word, Excel, JPG, PNG | ToolsVerse',
  description: 'Convert PDF files to Word, Excel, PowerPoint, JPG, PNG, HTML, and Text online for free. 100% private in-browser processing.',
  keywords: ["convert from pdf","pdf to word","pdf to jpg","pdf to excel","pdf converter online"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'convert-from-pdf')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'convert-from-pdf');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
