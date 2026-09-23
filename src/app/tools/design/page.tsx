import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/design/',
  },
  title: 'Design & Visual Tools - Palettes, CSS Shadows & QR Code Maker | ToolsVerse',
  description: 'Creative design tools. Generate harmonic color palettes, CSS box shadows, customizable QR codes, and professional resumes.',
  keywords: ["design tools","color palette generator","qr code generator","box shadow generator","resume builder"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'design')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'design');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
