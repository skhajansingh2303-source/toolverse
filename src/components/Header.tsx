'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QuickSearch from './QuickSearch';
import ToolDrawer from './ToolDrawer';
import ThemeToggle from './ThemeToggle';
import { tools } from '@/lib/tools';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState('en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [recentMenuOpen, setRecentMenuOpen] = useState(false);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

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
        // Reset to original English
        document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
          select.value = 'en';
          select.dispatchEvent(new Event('change'));
        }
        window.location.reload();
      } else {
        // Set Google Translate cookie and trigger translation
        document.cookie = `googtrans=/en/${code}; path=/;`;
        document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname};`;

        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
          select.value = code;
          select.dispatchEvent(new Event('change'));
        } else {
          // If translation script is not initialized yet, reload with cookie
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

  return (
    <>
      <header className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Drawer Menu Button + Logo */}
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
              <Link href="/tools/compress-pdf" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Compress PDF
              </Link>
              <Link href="/tools/merge-pdf" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                PDF Suite
              </Link>
              <Link href="/tools/image-compressor" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Media
              </Link>
              <Link href="/tools/json-formatter" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Developer
              </Link>
              <Link href="/#tools" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold text-gray-700 dark:text-slate-200">
                All {tools.length} Tools
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              
              {/* PWA Install Button */}
              {installPrompt && (
                <button
                  onClick={handleInstallApp}
                  className="hidden md:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95 animate-pulse"
                  title="Install ToolsVerse App on Desktop/Mobile"
                >
                  <span>📱</span>
                  <span>Install App</span>
                </button>
              )}

              {/* Recent Tools Dropdown Button */}
              {recentTools.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setRecentMenuOpen(!recentMenuOpen);
                      setLangMenuOpen(false);
                    }}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                    title="Recently Used Tools"
                  >
                    <span>⏱️</span>
                    <span className="text-[11px] font-bold">Recent</span>
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
                            href={`/tools/${tool!.slug}`}
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

              {/* Working Language Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setLangMenuOpen(!langMenuOpen);
                    setRecentMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                  title="Translate Website"
                >
                  <span className="text-sm">
                    {LANGUAGES.find((l) => l.code === selectedLang)?.flag || '🌐'}
                  </span>
                  <span className="hidden sm:inline uppercase text-[11px] font-bold">
                    {selectedLang}
                  </span>
                  <span className="text-[10px] text-gray-400">▼</span>
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
                            ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {selectedLang === lang.code && (
                          <span className="text-primary-600 font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle (Light / Dark) */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* Quick Tool Drawer Trigger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
                title="Browse All Tools"
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
