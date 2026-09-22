import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'Office Document Tools - Word, Excel & PowerPoint Converters | ToolsVerse',
  description: 'Process and convert Microsoft Office files in your browser. Excel to CSV, Word to HTML, PowerPoint viewers, and invoice builders.',
  keywords: ["office tools","excel to csv","word editor","invoice generator","powerpoint viewer"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'office')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'office');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
