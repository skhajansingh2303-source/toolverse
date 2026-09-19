'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ToolDrawer from './ToolDrawer';
import ThemeToggle from './ThemeToggle';

export default function BottomNavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/';

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 shadow-lg px-2 py-1.5 flex items-center justify-around safe-area-bottom">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isHome
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isHome ? 2.5 : 2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-[10px]">Home</span>
        </Link>

        {/* 2. Tools (Triggers Side Navigation Drawer) */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          <span className="text-[10px]">Tools</span>
        </button>

        {/* 3. Quick Action / Scanner / PDF shortcut */}
        <Link
          href="/tools/merge-pdf"
          className="flex flex-col items-center justify-center -mt-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 active:scale-95 transition-transform">
            <span className="text-lg">📄</span>
          </div>
          <span className="text-[10px] font-bold text-gray-600 dark:text-slate-400 mt-0.5">PDF</span>
        </Link>

        {/* 4. Calculators */}
        <Link
          href="/tools/age-calculator"
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[10px]">Calcs</span>
        </Link>

        {/* 5. Theme / Dark Mode toggle */}
        <div className="flex flex-col items-center justify-center py-1 px-2">
          <ThemeToggle />
          <span className="text-[10px] text-gray-500 dark:text-slate-400">Theme</span>
        </div>
      </nav>

      {/* Side Navigation Drawer */}
      <ToolDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
