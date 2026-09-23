'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QuickSearch from './QuickSearch';
import ToolDrawer from './ToolDrawer';
import ThemeToggle from './ThemeToggle';
import PdfMegaMenu from './PdfMegaMenu';
import { tools, getToolUrl } from '@/lib/tools';

import { SUPPORTED_LANGUAGES as LANGUAGES } from '@/lib/languages';

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [megaMenuConvertOnly, setMegaMenuConvertOnly] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState('en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [recentMenuOpen, setRecentMenuOpen] = useState(false);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  
  const headerRef = useRef<HTMLElement>(null);

  // Load saved language and recent tools on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('toolsverse_lang');
      if (savedLang) {
        setSelectedLang(savedLang);
      }
      const storedRecent = localStorage.getItem('toolsverse_recent');
      if (storedRecent) {
        setRecentSlugs(JSON.parse(storedRecent));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Keyboard shortcut (⌘K / Ctrl+K)
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

  // Catch PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSelectLang = (code: string, label: string) => {
    setSelectedLang(code);
    setLangMenuOpen(false);

    try {
      localStorage.setItem('toolsverse_lang', code);

      if (code === 'en') {
        document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
          select.value = 'en';
          select.dispatchEvent(new Event('change'));
        }
        window.location.reload();
      } else {
        document.cookie = `googtrans=/en/${code}; path=/;`;
        document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname};`;

        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
          select.value = code;
          select.dispatchEvent(new Event('change'));
        } else {
          window.location.reload();
        }
      }
    } catch (e) {
      console.warn('Language switch error:', e);
    }

    window.dispatchEvent(
      new CustomEvent('toolsverse-toast', {
        detail: { message: `🌐 Translating site to ${label}...` },
      })
    );
  };

  const recentTools = recentSlugs
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter(Boolean);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMenuHoverOpen = (convertOnly: boolean) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenuConvertOnly(convertOnly);
    setMegaMenuOpen(true);
    setLangMenuOpen(false);
    setRecentMenuOpen(false);
  };

  const handleMenuHoverLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const handleMenuMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleOtherLinkHover = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenuOpen(false);
  };

  const toggleAllPdfTools = () => {
    if (megaMenuOpen && !megaMenuConvertOnly) {
      setMegaMenuOpen(false);
    } else {
      setMegaMenuConvertOnly(false);
      setMegaMenuOpen(true);
      setLangMenuOpen(false);
      setRecentMenuOpen(false);
    }
  };

  const toggleConvertPdf = () => {
    if (megaMenuOpen && megaMenuConvertOnly) {
      setMegaMenuOpen(false);
    } else {
      setMegaMenuConvertOnly(true);
      setMegaMenuOpen(true);
      setLangMenuOpen(false);
      setRecentMenuOpen(false);
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            
            {/* ───── Left: Drawer Menu Button + Logo ───── */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <button
                onClick={() => {
                  setDrawerOpen(true);
                  setMegaMenuOpen(false);
                }}
                className="p-2 -ml-1 text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Open Side Menu Drawer"
                aria-label="Open Side Menu Drawer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link
                href="/"
                onClick={() => setMegaMenuOpen(false)}
                onMouseEnter={handleOtherLinkHover}
                className="flex items-center space-x-2 sm:space-x-2.5 group shrink-0"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-red-600 via-rose-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-black text-sm sm:text-base tracking-tighter">TV</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg xl:text-xl font-black text-gray-900 dark:text-white leading-none">
                    Tools<span className="text-red-600 dark:text-red-400">Verse</span>
                  </span>
                  <span className="hidden sm:inline text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
                    103+ Free Tools
                  </span>
                </div>
              </Link>
            </div>

            {/* ───── Middle Navigation (iLovePDF Style with Cursor Hover) ───── */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-xs xl:text-sm font-bold tracking-tight uppercase shrink-0">
              <Link
                href="/tools/organize-pdf/merge-pdf"
                onClick={() => setMegaMenuOpen(false)}
                onMouseEnter={handleOtherLinkHover}
                className="text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
              >
                Merge PDF
              </Link>
              <Link
                href="/tools/organize-pdf/split-pdf"
                onClick={() => setMegaMenuOpen(false)}
                onMouseEnter={handleOtherLinkHover}
                className="text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
              >
                Split PDF
              </Link>
              <Link
                href="/tools/optimize-pdf/compress-pdf"
                onClick={() => setMegaMenuOpen(false)}
                onMouseEnter={handleOtherLinkHover}
                className="text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
              >
                Compress PDF
              </Link>
              
              {/* Convert PDF Dropdown Trigger with Hover */}
              <button
                onClick={toggleConvertPdf}
                onMouseEnter={() => handleMenuHoverOpen(true)}
                onMouseLeave={handleMenuHoverLeave}
                className={`flex items-center gap-1 transition-colors whitespace-nowrap py-2 ${
                  megaMenuOpen && megaMenuConvertOnly
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                <span>Convert PDF</span>
                <span
                  className={`text-[10px] transition-transform duration-200 ${
                    megaMenuOpen && megaMenuConvertOnly ? 'rotate-180 text-red-600' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* ALL PDF TOOLS Mega Menu Trigger with Hover (Prominent Red) */}
              <button
                onClick={toggleAllPdfTools}
                onMouseEnter={() => handleMenuHoverOpen(false)}
                onMouseLeave={handleMenuHoverLeave}
                className={`flex items-center gap-1 font-extrabold px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  megaMenuOpen && !megaMenuConvertOnly
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/40'
                }`}
              >
                <span>All PDF Tools</span>
                <span
                  className={`text-[10px] transition-transform duration-200 ${
                    megaMenuOpen && !megaMenuConvertOnly ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* Guides & Blog Link */}
              <Link
                href="/blog"
                onClick={() => setMegaMenuOpen(false)}
                onMouseEnter={handleOtherLinkHover}
                className="text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
              >
                Guides
              </Link>
            </nav>

            {/* ───── Right Actions: Search, Language, Theme, PWA, Drawer ───── */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              
              {/* PWA Install Button (Compact) */}
              {installPrompt && (
                <button
                  onClick={handleInstallApp}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
                  title="Install ToolsVerse App on Device"
                >
                  <span>📱</span>
                  <span className="hidden xl:inline">Install</span>
                </button>
              )}

              {/* Recent Tools Dropdown Button */}
              {recentTools.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setRecentMenuOpen(!recentMenuOpen);
                      setLangMenuOpen(false);
                      setMegaMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shrink-0"
                    title="Recently Used Tools"
                  >
                    <span>⏱️</span>
                    <span className="hidden sm:inline text-[11px] font-bold">Recent</span>
                  </button>

                  {recentMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 p-2 text-left">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-800 mb-1">
                        Recently Used Tools
                      </div>
                      <div className="space-y-1">
                        {recentTools.map((tool) => (
                          <Link
                            key={tool!.slug}
                            href={getToolUrl(tool!)}
                            onClick={() => setRecentMenuOpen(false)}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="text-base">{tool!.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {tool!.name}
                              </div>
                              <div className="text-[10px] text-gray-400 truncate">{tool!.category}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  data-lang-trigger="true"
                  onClick={() => {
                    setLangMenuOpen(!langMenuOpen);
                    setRecentMenuOpen(false);
                    setMegaMenuOpen(false);
                  }}
                  className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shrink-0"
                  title="Translate Website"
                >
                  <span className="text-sm">
                    {LANGUAGES.find((l) => l.code === selectedLang)?.flag || '🌐'}
                  </span>
                  <span className="hidden sm:inline uppercase text-[11px] font-bold">
                    {selectedLang}
                  </span>
                  <span className="text-[9px] text-gray-400">▼</span>
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5 max-h-80 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-800 mb-1">
                      Choose Language
                    </div>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleSelectLang(lang.code, lang.label)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                          selectedLang === lang.code
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {selectedLang === lang.code && (
                          <span className="text-red-600 font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle (Light / Dark) */}
              <div className="shrink-0">
                <ThemeToggle />
              </div>

              {/* Search Bar trigger button */}
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setMegaMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-300 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all shadow-2xs shrink-0"
                title="Search tools (Ctrl+K)"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <kbd className="hidden md:inline text-[10px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>
        </div>

        {/* ───── PDF Mega Menu Dropdown (Matching iLovePDF Screenshot) ───── */}
        <PdfMegaMenu
          isOpen={megaMenuOpen}
          onClose={() => setMegaMenuOpen(false)}
          filterConvertOnly={megaMenuConvertOnly}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuHoverLeave}
        />
      </header>

      {/* Quick Search Spotlight Modal */}
      <QuickSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Side Navigation Drawer (Full catalog with all 103 tools) */}
      <ToolDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
