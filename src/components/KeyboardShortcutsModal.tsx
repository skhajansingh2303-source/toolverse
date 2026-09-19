'use client';

import React, { useState, useEffect } from 'react';

export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘K / Ctrl+K', desc: 'Open instant Spotlight Search' },
    { key: '?', desc: 'Open Keyboard Shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close any modal, drawer, or search overlay' },
    { key: 'Enter', desc: 'Confirm search selection or trigger action' },
    { key: '↑ / ↓', desc: 'Navigate search suggestions and tool list' },
    { key: 'Tab', desc: 'Move between inputs and action buttons' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
              ⌨️
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900">Keyboard Shortcuts</h3>
              <p className="text-xs text-gray-500">Speed up your workflow across ToolsVerse</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="divide-y divide-gray-100 my-4">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-gray-700 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-800 rounded-lg font-mono font-bold text-[11px] shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Pro tip: Press <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">⌘K</kbd> anywhere to switch tools</span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 bg-gray-950 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
