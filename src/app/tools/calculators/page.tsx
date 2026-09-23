import React from 'react';
import { Metadata } from 'next';
import CategoryPageLayout from '@/components/CategoryPageLayout';
import { tools, CATEGORIES } from '@/lib/tools';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/calculators/',
  },
  title: 'Calculators & Converters - Health, Finance & Academic Tools | ToolsVerse',
  description: 'Fast, accurate online calculators for BMI, loan EMI, age, percentage, GPA, and unit conversions.',
  keywords: ["calculators","bmi calculator","loan calculator","age calculator","percentage calculator"],
};

export default function CategoryPage() {
  const category = CATEGORIES.find((c) => c.slug === 'calculators')!;
  const categoryTools = tools.filter((t) => t.categorySlug === 'calculators');

  return <CategoryPageLayout category={category} tools={categoryTools} />;
}
