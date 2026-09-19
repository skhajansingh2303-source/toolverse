'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { tools } from '@/lib/tools';

export default function NotFound() {
  const [search, setSearch] = useState('');

  const matchingTools = search.trim()
    ? tools
        .filter(
          (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const popularSlugs = [
    'compress-pdf',
    'merge-pdf',
    'extract-pdf-images',
    'image-compressor',
    'age-calculator',
    'json-formatter',
  ];
  const popularTools = tools.filter((t) => popularSlugs.includes(t.slug));

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl shadow-primary-500/20 mb-6 text-white animate-bounce">
        🔍
      </div>

      <span className="text-xs uppercase font-extrabold tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mt-4 mb-3 tracking-tight">
        Page or Tool Not Found
      </h1>

      <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-8">
        We couldn&apos;t find the exact page you&apos;re looking for. Search our 103+ utilities below or pick a popular tool:
      </p>

      {/* Instant Search in 404 */}
      <div className="max-w-md mx-auto mb-10 relative">
        <input
          type="text"
          placeholder="Search any tool (e.g. compress, merge, pdf, image)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium"
        />

        {matchingTools.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-20 text-left divide-y divide-gray-100 dark:divide-slate-800">
            {matchingTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="text-xl">{tool.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {tool.name}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">{tool.category}</div>
                </div>
                <span className="text-xs font-bold text-primary-600">Open →</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Popular Tools Grid */}
      <div className="mb-10 text-left">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 text-center">
          Popular Tools You Might Need
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {popularTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white text-base shrink-0 shadow-xs`}>
                {tool.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {tool.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate">{tool.category}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
      >
        <span>←</span>
        <span>Back to All 103 Tools</span>
      </Link>
    </div>
  );
}
