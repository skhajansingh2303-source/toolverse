'use client';

import React from 'react';
import Link from 'next/link';
import { tools, Tool, getToolUrl } from '@/lib/tools';

interface RelatedToolsProps {
  currentSlug: string;
}

export default function RelatedTools({ currentSlug }: RelatedToolsProps) {
  const currentTool = tools.find((t) => t.slug === currentSlug);
  if (!currentTool) return null;

  // Find tools in same category or popular fallback
  const sameCategory = tools
    .filter((t) => t.category === currentTool.category && t.slug !== currentSlug)
    .slice(0, 4);

  // If fewer than 4, fill with other popular tools
  const otherTools = tools
    .filter((t) => t.category !== currentTool.category && t.slug !== currentSlug)
    .slice(0, 4 - sameCategory.length);

  const related = [...sameCategory, ...otherTools];

  return (
    <div className="mt-12 pt-8 border-t border-gray-200/80">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 block">
            Discover More
          </span>
          <h3 className="text-lg font-bold text-gray-950">
            More Tools You Might Need
          </h3>
        </div>
        <span className="text-xs font-semibold text-gray-400">
          Category: {currentTool.category}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map((tool) => (
          <Link
            key={tool.slug}
            href={getToolUrl(tool)}
            className="group bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md hover:border-primary-300 hover:-translate-y-0.5 transition-all flex items-center gap-3.5"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white text-lg shrink-0 group-hover:scale-105 transition-transform shadow-xs`}
            >
              {tool.icon}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors block truncate">
                {tool.name}
              </span>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {tool.description}
              </p>
            </div>
            <span className="text-xs font-bold text-gray-300 group-hover:text-primary-600 transition-colors">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
