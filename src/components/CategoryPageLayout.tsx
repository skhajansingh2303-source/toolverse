'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import { Tool, ToolCategory, getToolUrl } from '@/lib/tools';
import { BLOG_POSTS } from '@/lib/blogData';

interface Props {
  category: ToolCategory;
  tools: Tool[];
}

export default function CategoryPageLayout({ category, tools }: Props) {
  const [filter, setFilter] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.description.toLowerCase().includes(filter.toLowerCase())
  );

  // Find guides that match tools in this category
  const categoryGuides = BLOG_POSTS.filter((post) =>
    tools.some((t) => t.slug === post.targetToolSlug)
  );

  const categoryFaqs = [
    {
      q: `Are ${category.name} tools 100% free with no hidden charges?`,
      a: `Yes! Every utility inside our ${category.name} suite is completely free with no usage limits, no credit card requirements, and zero subscription paywalls.`,
    },
    {
      q: `Do files processed in ${category.name} get uploaded to remote servers?`,
      a: 'Never. ToolsVerse operates strictly inside your web browser sandbox using client-side WebAssembly, HTML5 APIs, and memory processing. Your private documents never touch our servers.',
    },
    {
      q: `Can I use ${category.name} on my smartphone or tablet?`,
      a: 'Absolutely. ToolsVerse is built as an offline-ready Progressive Web App (PWA) that adapts smoothly to iPhone, iPad, Android, Windows, Mac, and Linux screens.',
    },
    {
      q: `Can I use outputs from ${category.name} for commercial or legal purposes?`,
      a: 'Yes. All outputs generated belong 100% to you. We add zero promotional watermarks and claim no rights over your files.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {category.name}
          </span>
        </nav>

        {/* Hero Header */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 flex items-center justify-center text-3xl shadow-sm shrink-0">
                {category.icon}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
                  {category.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                  {category.description} Free, client-side, with zero server uploads for 100% privacy.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{tools.length} Tools Ready</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="relative max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder={`Search within ${category.name}...`}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No tools found matching &quot;{filter}&quot;
            </p>
          </div>
        )}

        {/* Category Educational Architecture (Prevents AdSense 'Thin Content' rejection) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-gray-200/80 dark:border-slate-800 shadow-sm space-y-8">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Technical Principles
            </span>
            <h2 className="text-2xl font-black text-gray-950 dark:text-white mt-1">
              Why Users Choose ToolsVerse {category.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-3xl">
              Engineered from the ground up for privacy, reliability, and precision. Learn how our browser sandbox outclasses traditional cloud converter models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-2">
              <span className="text-2xl">🔒</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Strict Local Isolation</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                Zero data packets travel across external network connections. Your files stay strictly isolated in device RAM.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-2">
              <span className="text-2xl">⚡</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sub-Second Processing</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              Eliminate server queues and multi-megabyte cloud upload waits. Local hardware handles conversions instantly.
            </p>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-2">
              <span className="text-2xl">💯</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Zero Paywalls &amp; Limits</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                No daily quotas, no page caps, and no forced account creation. Designed as an open universal web standard.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Guides for this Category */}
        {categoryGuides.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                  Step-by-Step Tutorials
                </span>
                <h3 className="text-xl font-black text-gray-950 dark:text-white mt-0.5">
                  Guides for {category.name}
                </h3>
              </div>
              <Link
                href="/blog/"
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <span>View All 30 Guides</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/blog/${guide.slug}/`}
                  className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 hover:border-primary-500 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                      {guide.readTime}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                      {guide.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {guide.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-primary-600 dark:text-primary-400">
                    <span>Read Tutorial</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category FAQs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-gray-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Got Questions?
            </span>
            <h3 className="text-2xl font-black text-gray-950 dark:text-white mt-1">
              Frequently Asked Questions: {category.name}
            </h3>
          </div>

          <div className="space-y-3">
            {categoryFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-gray-200/70 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-lg transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : 'text-gray-400'}`}>
                      ⌄
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed border-t border-gray-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
