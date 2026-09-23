import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/pdf-security/',
  },
  title: 'PDF Security - Sign, Encrypt, Unlock, Redact & Fill PDF Forms | ToolsVerse',
  description: 'Bank-grade PDF security in your browser. Sign documents with legal e-signatures, password protect, remove passwords, and blackout sensitive text.',
  keywords: ["pdf security","sign pdf","protect pdf","unlock pdf","redact pdf"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'pdf-security')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'pdf-security');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
