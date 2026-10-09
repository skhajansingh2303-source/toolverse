'use client';

import React, { useEffect } from 'react';
import {
  GOOGLE_TRANSLATE_LANGS,
  LANGUAGE_CODES,
  clearGoogleTranslateCookies,
  clearGoogTransHash,
  restoreEnglish,
  setGoogleTranslateCookie,
} from '@/lib/languages';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslator() {
  useEffect(() => {
    // 1. Check if URL specifies language (e.g. ?lang=it or ?lang=zh-CN)
    let initialLang: string | null = null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryLang = urlParams.get('lang');
      if (queryLang && LANGUAGE_CODES.includes(queryLang)) {
        initialLang = queryLang;
        localStorage.setItem('toolsverse_lang', queryLang);
      } else {
        const saved = localStorage.getItem('toolsverse_lang');
        if (saved && LANGUAGE_CODES.includes(saved)) {
          initialLang = saved;
        } else {
          // 2. Auto-detect user browser language
          const browserLang = navigator.language || (navigator as any).userLanguage || '';
          const match = LANGUAGE_CODES.find(
            (code) =>
              browserLang.toLowerCase() === code.toLowerCase() ||
              browserLang.toLowerCase().startsWith(code.toLowerCase() + '-') ||
              browserLang.toLowerCase().startsWith(code.toLowerCase())
          );
          if (match && match !== 'en') {
            initialLang = match;
            localStorage.setItem('toolsverse_lang', match);
          }
        }
      }
    } catch {
      // Ignore
    }

    // Set cookie proactively and update <html lang="..."> attribute in DOM
    if (!initialLang || initialLang === 'en') {
      document.documentElement.lang = 'en';
      document.documentElement.setAttribute('lang', 'en');
      // Clear all Google Translate state (cookies + hash + widget)
      restoreEnglish();
      return;
    }

    if (initialLang) {
      document.documentElement.lang = initialLang;
      document.documentElement.setAttribute('lang', initialLang);
      setGoogleTranslateCookie(initialLang);
    }

    const applyTargetLanguage = (targetLang: string, retries = 0) => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select && select.options.length > 1) {
        if (select.value !== targetLang) {
          select.value = targetLang;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (retries < 25) {
        setTimeout(() => applyTargetLanguage(targetLang, retries + 1), 200);
      }
    };

    if (initialLang && initialLang !== 'en') {
      applyTargetLanguage(initialLang);
    }
  }, []);

  return null;
}
