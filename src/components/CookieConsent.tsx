'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('toolsverse_cookie_consent');
      if (!consent) {
        // Show after a brief delay so page load isn't obstructed
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('toolsverse_cookie_consent', 'accepted');
    } catch {}
    setVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('toolsverse_cookie_consent', 'essential_only');
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">🍪</span>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Privacy &amp; Cookie Preferences
            </h4>
            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
              We use essential local browser storage to keep ToolsVerse free, fast, and 100% private. Your documents are never uploaded to our servers. Learn more in our{' '}
              <Link href="/privacy" className="text-red-600 dark:text-red-400 font-semibold underline hover:text-red-700">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all active:scale-95"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
