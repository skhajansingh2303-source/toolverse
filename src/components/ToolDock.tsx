'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tools, Tool } from '@/lib/tools';
import ToolDrawer from './ToolDrawer';
import QuickSearch from './QuickSearch';

export default function ToolDock() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const pathname = usePathname();

  const currentSlug = pathname?.startsWith('/tools/')
    ? pathname.replace('/tools/', '')
    : null;

  // Load minimized preference & recent tools
  useEffect(() => {
    try {
      const savedMin = localStorage.getItem('toolsverse_dock_minimized');
      if (savedMin !== null) {
        setMinimized(savedMin === 'true');
      }
      const stored = localStorage.getItem('toolsverse_recent');
      if (stored) {
        setRecentSlugs(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Update recent tools on route change
  useEffect(() => {
    if (!currentSlug) return;
    try {
      const stored = localStorage.getItem('toolsverse_recent');
      let recents: string[] = stored ? JSON.parse(stored) : [];
      recents = [currentSlug, ...recents.filter((s) => s !== currentSlug)].slice(0, 5);
      setRecentSlugs(recents);
      localStorage.setItem('toolsverse_recent', JSON.stringify(recents));
    } catch {
      // Ignore
    }
  }, [currentSlug]);

  const toggleMinimize = (value: boolean) => {
    setMinimized(value);
    try {
      localStorage.setItem('toolsverse_dock_minimized', String(value));
    } catch {
      // Ignore
    }
  };

  const currentIndex = useMemo(() => {
    return tools.findIndex((t) => t.slug === currentSlug);
  }, [currentSlug]);

  const prevTool = useMemo(() => {
    if (currentIndex <= 0) return tools[tools.length - 1];
    return tools[currentIndex - 1];
  }, [currentIndex]);

  const nextTool = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= tools.length - 1) return tools[0];
    return tools[currentIndex + 1];
  }, [currentIndex]);

  const recentTools = useMemo(() => {
    return recentSlugs
      .map((slug) => tools.find((t) => t.slug === slug))
      .filter((t): t is Tool => Boolean(t && t.slug !== currentSlug))
      .slice(0, 3);
  }, [recentSlugs, currentSlug]);

  return (
    <>
      {/* Floating Action Bar Container (Desktop) */}
      <aside
        aria-label="Quick Tool Navigation Bar"
        className="hidden md:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] pointer-events-auto transition-all duration-300 ease-out select-none"
      >
        {minimized ? (
          /* Sleek Minimized Capsule - Razor sharp contrast */
          <button
            onClick={() => toggleMinimize(false)}
            className="flex items-center gap-2 bg-gray-950 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.5)] border border-gray-700 ring-2 ring-white/20 hover:scale-105 transition-all group"
            title="Open Quick Tool Bar"
          >
            <span className="text-amber-400 group-hover:rotate-12 transition-transform text-sm">⚡</span>
            <span className="text-white font-bold tracking-wide">Quick Tools</span>
            <span className="bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-xs">{tools.length}</span>
          </button>
        ) : (
          /* High-Contrast Professional Command Bar - Clear in both Light and Dark mode */
          <div className="flex items-center gap-2 sm:gap-2.5 bg-gray-950 text-white px-2.5 sm:px-3.5 py-2 rounded-full shadow-[0_16px_50px_rgba(0,0,0,0.55)] border border-gray-800 ring-1 ring-white/20">
            
            {/* 1. All Tools Drawer Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 group shrink-0"
              title={`Open full catalog of ${tools.length} tools with category filters`}
            >
              <span className="text-amber-300 group-hover:rotate-12 transition-transform text-sm">⚡</span>
              <span className="text-white tracking-wide">All {tools.length} Tools</span>
            </button>

            {/* 2. Instant Search Trigger (⌘K) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/20 group shrink-0"
              title="Quick Search Tools (Ctrl+K or ⌘K)"
            >
              <svg className="w-3.5 h-3.5 text-white group-hover:text-amber-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-white hidden sm:inline">Search</span>
              <kbd className="hidden md:inline text-[9px] bg-white/20 border border-white/30 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                ⌘K
              </kbd>
            </button>

            {/* Divider */}
            {currentSlug && (
              <div className="hidden sm:block h-4 w-px bg-white/25" />
            )}

            {/* 3. Sequential Tool Navigation: Previous & Next */}
            {currentSlug && prevTool && (
              <Link
                href={`/tools/${prevTool.slug}`}
                className="relative group hidden sm:flex items-center justify-center w-7 h-7 rounded-full text-white bg-white/10 hover:bg-white/25 border border-white/15 transition-all active:scale-95"
                title={`Previous: ${prevTool.name}`}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2.5 py-1 rounded-md bg-black border border-white/30 text-white text-[11px] font-bold shadow-2xl whitespace-nowrap pointer-events-none z-50">
                  Prev: {prevTool.name}
                </div>
              </Link>
            )}

            {currentSlug && nextTool && (
              <Link
                href={`/tools/${nextTool.slug}`}
                className="relative group hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/25 border border-white/15 transition-all active:scale-95"
                title={`Next: ${nextTool.name}`}
              >
                <span className="text-gray-200">Next:</span>
                <span className="text-white max-w-[120px] truncate">{nextTool.name}</span>
                <svg className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2.5 py-1 rounded-md bg-black border border-white/30 text-white text-[11px] font-bold shadow-2xl whitespace-nowrap pointer-events-none z-50">
                  Next: {nextTool.name}
                </div>
              </Link>
            )}

            {/* Divider */}
            {recentTools.length > 0 && (
              <div className="hidden lg:block h-4 w-px bg-white/25" />
            )}

            {/* 4. Recent Tools Quick Switchers (Circular Badges with Instant Tooltips) */}
            {recentTools.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-extrabold text-amber-300 px-0.5 tracking-wider">
                  Recent:
                </span>
                {recentTools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="relative group w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 border border-white/25 flex items-center justify-center text-xs transition-all hover:scale-110 active:scale-95 shadow-sm"
                  >
                    <span>{t.icon}</span>
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2.5 py-1 rounded-md bg-black border border-white/30 text-white text-[11px] font-bold shadow-2xl whitespace-nowrap pointer-events-none z-50">
                      {t.name}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* 5. Minimize / Close Button */}
            <button
              onClick={() => toggleMinimize(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 text-xs transition-colors shrink-0 ml-0.5"
              title="Minimize bar (can restore anytime)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </aside>

      {/* Slide-over Drawer (Browse All 53 Tools with categories & search) */}
      <ToolDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Quick Search Modal (Spotlight ⌘K search) */}
      <QuickSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
