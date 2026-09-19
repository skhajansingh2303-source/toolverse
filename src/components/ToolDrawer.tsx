'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tools } from '@/lib/tools';

interface ToolDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ToolDrawer({ isOpen, onClose }: ToolDrawerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const pathname = usePathname();

  const currentSlug = pathname?.startsWith('/tools/')
    ? pathname.replace('/tools/', '')
    : null;

  // Load favorites
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolsverse_favorites');
      if (stored) {
        setFavoriteSlugs(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, [isOpen]);

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: tools.length,
      PDF: 0,
      Calculators: 0,
      Media: 0,
      Developer: 0,
      Text: 0,
      Favorites: favoriteSlugs.length,
    };
    tools.forEach((t) => {
      if (counts[t.category] !== undefined) {
        counts[t.category]++;
      } else {
        counts[t.category] = 1;
      }
    });
    return counts;
  }, [favoriteSlugs]);

  const navCategories = [
    { id: 'All', label: 'All Tools', icon: '⚡', count: tools.length, color: 'text-indigo-500' },
    { id: 'PDF', label: 'PDF Suite', icon: '📄', count: categoryCounts['PDF'] || 0, color: 'text-red-500' },
    { id: 'Media', label: 'Image & Media', icon: '🖼️', count: categoryCounts['Media'] || 0, color: 'text-emerald-500' },
    { id: 'Calculators', label: 'Calculators & Finance', icon: '🧮', count: categoryCounts['Calculators'] || 0, color: 'text-amber-500' },
    { id: 'Developer', label: 'Developer Utilities', icon: '💻', count: categoryCounts['Developer'] || 0, color: 'text-cyan-500' },
    { id: 'Favorites', label: 'Starred Favorites', icon: '⭐', count: favoriteSlugs.length, color: 'text-yellow-400' },
  ];

  // Filter tools
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.category.toLowerCase().includes(search.toLowerCase());

      let matchesCat = true;
      if (selectedCategory === 'Favorites') {
        matchesCat = favoriteSlugs.includes(tool.slug);
      } else if (selectedCategory !== 'All') {
        matchesCat = tool.category.toLowerCase() === selectedCategory.toLowerCase();
      }

      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory, favoriteSlugs]);

  // Handle ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Slides from LEFT - Android Material Drawer Standard) */}
      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 shadow-2xl border-r border-gray-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-left duration-300 transition-colors">
          
          {/* Header Banner - iLovePDF Style */}
          <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-primary-600/10 via-indigo-600/10 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-primary-500/20">
                TV
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight flex items-center gap-1.5">
                  Tools<span className="text-primary-600 dark:text-primary-400">Verse</span>
                  <span className="text-[9px] uppercase tracking-wider bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                </h2>
                <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400">
                  {tools.length}-in-1 Offline Suite
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm"
              title="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Side Navigation Categories */}
          <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 space-y-1">
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
              Workspaces & Categories
            </div>
            {navCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200/70 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search Bar */}
          <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative">
              <svg
                className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter tools..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filtered Tools List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-gray-50 dark:divide-slate-800/30">
            {filteredTools.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-slate-500 text-xs">
                {selectedCategory === 'Favorites'
                  ? 'No favorites yet! Tap the ⭐ icon on any tool card to add.'
                  : `No tools found matching "${search}".`}
              </div>
            ) : (
              filteredTools.map((tool) => {
                const isCurrent = currentSlug === tool.slug;
                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all group ${
                      isCurrent
                        ? 'bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-950 dark:text-primary-200 shadow-2xs'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/70 text-gray-800 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white text-base shadow-xs shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {tool.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">
                          {tool.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[8px] bg-primary-600 text-white font-bold uppercase px-1 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                        {tool.description}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-gray-300 dark:text-slate-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      →
                    </span>
                  </Link>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Links */}
          <div className="p-3.5 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline Ready</span>
            </div>
            <Link
              href="/"
              onClick={onClose}
              className="text-primary-600 dark:text-primary-400 hover:underline font-bold"
            >
              Home Dashboard
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
