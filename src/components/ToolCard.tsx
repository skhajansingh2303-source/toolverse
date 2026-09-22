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
  'extract-pdf-images',
  'age-calculator',
  'json-formatter',
  'image-compressor',
  'sign-pdf',
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
      case 'pdf':
        return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200/60 dark:border-red-900/40';
      case 'calculators':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40';
      case 'developer':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/40';
      case 'security':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40';
      case 'text':
        return 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-900/40';
      case 'media':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-900/40';
      case 'design':
        return 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-200/60 dark:border-pink-900/40';
      case 'student':
        return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/40';
      case 'career':
        return 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-900/40';
      default:
        return 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200/60 dark:border-slate-700';
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500/60 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
      
      {/* Top Bar: Category, Badges & Favorite Star */}
      <div className="flex items-center justify-between mb-3.5">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(category)}`}>
          {category}
        </span>

        <div className="flex items-center gap-1.5">
          {isFeatured && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              Popular
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
              className={`p-1.5 rounded-lg text-sm transition-transform active:scale-125 ${
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

      {/* Main Link Area */}
      <Link href={targetUrl} className="block focus:outline-none flex-1">
        <div className="flex items-start gap-3.5 mb-3">
          {/* Icon Box */}
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-lg shrink-0 group-hover:scale-110 shadow-sm transition-transform duration-200`}
          >
            {icon}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight mb-1">
              {name}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </Link>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300">
        <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">Free • Client-side</span>
        <Link 
          href={targetUrl}
          className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs font-bold text-primary-600 dark:text-primary-400"
        >
          <span>Use Tool</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
