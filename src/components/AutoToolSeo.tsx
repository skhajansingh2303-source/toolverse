'use client';

import React from 'react';
import ToolSeoContent from '@/components/ToolSeoContent';
import { getToolSeoData } from '@/lib/toolSeoRegistry';

interface AutoToolSeoProps {
  slug: string;
}

export default function AutoToolSeo({ slug }: AutoToolSeoProps) {
  const seo = getToolSeoData(slug);
  if (!seo) return null;

  return (
    <ToolSeoContent
      toolName={seo.toolName}
      toolSlug={seo.toolSlug}
      categoryName={seo.categoryName}
      categorySlug={seo.categorySlug}
      steps={seo.steps}
      faqs={seo.faqs}
      relatedSlugs={seo.relatedSlugs}
    />
  );
}
