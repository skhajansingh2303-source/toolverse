'use client';

import React from 'react';
import Link from 'next/link';

interface ToolCardProps {
  name: string;
  description: string;
  slug: string;
  categorySlug?: string;
  icon: string;
  color: string;
  category: string;
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
}

const FEATURED_SLUGS = [
  'compress-pdf',
  'merge-pdf',
  'split-pdf',
  'pdf-to-jpg',
  'word-to-pdf',
  'image-to-pdf',
  'sign-pdf',
  'age-calculator',
  'json-formatter',
  'image-compressor',
  'bmi-calculator',
  'qr-code-generator',
  'resume-builder'
];

export default function ToolCard({
  name,
  description,
  slug,
  categorySlug,
  icon,
  color,
  category,
  isFavorite = false,
  onToggleFavorite,
}: ToolCardProps) {
  const isFeatured = FEATURED_SLUGS.includes(slug);
  const targetUrl = categorySlug ? `/tools/${categorySlug}/${slug}` : `/tools/${slug}`;

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'organize pdf':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/40';
      case 'convert to pdf':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-900/40';
      case 'convert from pdf':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-900/40';
      case 'optimize pdf':
        return 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200/70 dark:border-violet-900/40';
      case 'edit pdf':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-900/40';
      case 'pdf security':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/40';
      case 'calculators':
        return 'bg-lime-50 dark:bg-lime-950/60 text-lime-800 dark:text-lime-300 border-lime-200/70 dark:border-lime-900/40';
      case 'developer':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-900/40';
      case 'media':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/70 dark:border-purple-900/40';
      case 'design':
        return 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200/70 dark:border-pink-900/40';
      case 'office':
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200/70 dark:border-orange-900/40';
      case 'text':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/70 dark:border-teal-900/40';
      default:
        return 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200/60 dark:border-slate-700';
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-primary-500/80 dark:hover:border-primary-500/70 hover:-translate-y-1.5 transition-all duration-250 flex flex-col justify-between overflow-hidden">
      
      {/* Subtle hover gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top Bar: Category, Badges & Favorite Star */}
      <div className="relative z-10 flex items-center justify-between mb-3.5">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(category)}`}>
          {category}
        </span>

        <div className="flex items-center gap-1.5">
          {isFeatured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-xs">
              <span>🔥</span>
              <span>Popular</span>
            </span>
          )}
          
          {/* Favorite Star Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(slug);
              }}
              className={`p-1.5 rounded-lg text-sm transition-all active:scale-125 ${
                isFavorite
                  ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/50'
                  : 'text-gray-300 dark:text-slate-600 hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              ★
            </button>
          )}
        </div>
      </div>

      {/* Main Clickable Area */}
      <Link href={targetUrl} className="relative z-10 block focus:outline-none flex-1">
        <div className="flex items-start gap-3.5 mb-3">
          {/* Icon Box */}
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl shrink-0 group-hover:scale-110 group-hover:rotate-2 shadow-sm shadow-primary-500/20 transition-all duration-300`}
          >
            {icon}
          </div>

          {/* Title & Description */}
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-extrabold text-gray-950 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug mb-1">
              {name}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </Link>

      {/* Card Footer with High-Clickable Pill Button */}
      <div className="relative z-10 mt-4 pt-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 dark:text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>In-Browser Private</span>
        </div>

        <Link 
          href={targetUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 dark:bg-slate-800 group-hover:bg-primary-600 dark:group-hover:bg-primary-600 text-gray-800 dark:text-slate-200 group-hover:text-white transition-all duration-200 text-xs font-bold shadow-2xs group-hover:shadow-md"
        >
          <span>Open</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
