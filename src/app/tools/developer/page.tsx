import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/developer/',
  },
  title: 'Developer Tools - JSON, JWT, Base64, RegEx & Hash Utilities | ToolsVerse',
  description: 'Essential developer tools. JSON formatters, JWT decoders, base64 encoders, UUID generators, and RegEx testers.',
  keywords: ["developer tools","json formatter","jwt decoder","uuid generator","base64 encoder"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'developer')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'developer');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
