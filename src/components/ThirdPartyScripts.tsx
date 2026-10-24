'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { GOOGLE_TRANSLATE_LANGS } from '@/lib/languages';

export default function ThirdPartyScripts() {
  const [loadScripts, setLoadScripts] = useState(false);

  useEffect(() => {
    // If user already requested translation in a non-English language, load immediately
    try {
      const savedLang = localStorage.getItem('toolsverse_lang');
      if (savedLang && savedLang !== 'en') {
        setLoadScripts(true);
        return;
      }
    } catch {}

    // Load on first user interaction or after a 4s idle timer
    const trigger = () => {
      setLoadScripts(true);
      cleanup();
    };

    const events = ['scroll', 'touchstart', 'mousemove', 'keydown', 'click'];
    events.forEach((ev) => window.addEventListener(ev, trigger, { passive: true, once: true }));

    const timer = setTimeout(trigger, 4000);

    const cleanup = () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, trigger));
    };

    return cleanup;
  }, []);

  if (!loadScripts) return null;

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-TQHCS9HWNJ"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TQHCS9HWNJ');
          `,
        }}
      />
      {/* Google AdSense Script */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1902327524390179"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {/* Google Translate Integration */}
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.googleTranslateElementInit = function() {
              if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: '${GOOGLE_TRANSLATE_LANGS}',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            };
          `,
        }}
      />
      <Script
        id="google-translate-script"
        strategy="afterInteractive"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
    </>
  );
}
