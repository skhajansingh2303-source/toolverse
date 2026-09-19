'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QuickSearch from './QuickSearch';
import ToolDrawer from './ToolDrawer';
import ThemeToggle from './ThemeToggle';
import { tools } from '@/lib/tools';

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Hamburger Menu (iLovePDF Style) + Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 -ml-1 text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Open Side Menu Drawer"
                aria-label="Open Side Menu Drawer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
                <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-black text-base tracking-tighter">TV</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                    Tools<span className="text-primary-600 dark:text-primary-400">Verse</span>
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
                    {tools.length}-in-1 Suite
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle navigation (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-600 dark:text-slate-300">
              <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Home
              </Link>
              <Link href="/tools/merge-pdf" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                PDF Suite
              </Link>
              <Link href="/tools/age-calculator" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Calculators
              </Link>
              <Link href="/tools/json-formatter" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Developer
              </Link>
              <Link href="/#tools" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold text-gray-700 dark:text-slate-200">
                All {tools.length} Tools
              </Link>
            </nav>

            {/* Right actions: ThemeToggle + Instant Tool Switcher + Search */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              
              {/* Theme Toggle (Light / Dark) */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* Quick Tool Switcher Button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
                title="Open Side Menu Drawer"
              >
                <span>⚡</span>
                <span>All Tools</span>
              </button>

              {/* Search Bar trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-400 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-xl transition-all shadow-2xs"
                title="Search tools (Ctrl+K)"
              >
                <svg className="w-4 h-4 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <kbd className="hidden sm:inline text-[10px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Search Spotlight Modal */}
      <QuickSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Side Navigation Drawer (Left-Slide) */}
      <ToolDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
