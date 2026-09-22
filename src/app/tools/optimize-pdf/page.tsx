import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'Optimize PDF - Compress, Repair, OCR & Flatten PDF Online Free | ToolsVerse',
  description: 'Reduce PDF file size, repair damaged documents, run OCR text recognition, and optimize PDF documents for email and web.',
  keywords: ["optimize pdf","compress pdf","reduce pdf size","repair pdf","pdf ocr"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'optimize-pdf')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'optimize-pdf');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
