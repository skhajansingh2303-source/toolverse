'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

export default function GoogleTranslator() {
  useEffect(() => {
    // Define global callback for Google Translate
    (window as any).googleTranslateElementInit = function () {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,es,fr,de,pt,ja,ar,ru,bn,zh-CN',
            autoDisplay: false,
          },
          'google_translate_element'
        );

        // Apply saved language if any
        const savedLang = localStorage.getItem('toolsverse_lang');
        if (savedLang && savedLang !== 'en') {
          setTimeout(() => {
            const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
            if (select && select.value !== savedLang) {
              select.value = savedLang;
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
