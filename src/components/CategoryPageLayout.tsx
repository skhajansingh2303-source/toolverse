'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import { Tool, ToolCategory, getToolUrl } from '@/lib/tools';

interface Props {
  category: ToolCategory;
  tools: Tool[];
}

export default function CategoryPageLayout({ category, tools }: Props) {
  const [filter, setFilter] = useState('');

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {category.name}
          </span>
        </nav>

        {/* Hero Header */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-10 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 flex items-center justify-center text-3xl shadow-sm shrink-0">
                {category.icon}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
                  {category.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                  {category.description} Free, client-side, with zero server uploads for 100% privacy.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{tools.length} Tools Ready</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="relative max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder={`Search within ${category.name}...`}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.slug}
                name={tool.name}
                description={tool.description}
                slug={tool.slug}
                categorySlug={tool.categorySlug}
                icon={tool.icon}
                category={tool.category}
                color={tool.color}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
            <p className="text-gray-500 dark:text-gray-400">
              No tools found matching &quot;{filter}&quot;
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
