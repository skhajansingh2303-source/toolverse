'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { GOOGLE_TRANSLATE_LANGS, LANGUAGE_CODES } from '@/lib/languages';

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
          // 2. Auto-detect user browser language (e.g. Italian in Italy, Chinese in China)
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

    // Set cookie proactively so Google translate loads in target language immediately
    if (initialLang && initialLang !== 'en') {
      document.cookie = `googtrans=/en/${initialLang}; path=/;`;
      document.cookie = `googtrans=/en/${initialLang}; path=/; domain=${window.location.hostname};`;
    }

    // Define global callback for Google Translate
    (window as any).googleTranslateElementInit = function () {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: GOOGLE_TRANSLATE_LANGS,
            autoDisplay: false,
          },
          'google_translate_element'
        );

        if (initialLang && initialLang !== 'en') {
          setTimeout(() => {
            const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
            if (select && select.value !== initialLang) {
              select.value = initialLang;
              select.dispatchEvent(new Event('change'));
            }
          }, 600);
        }
      }
    };
  }, []);

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }} />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
