'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { tools, Tool, getToolUrl } from '@/lib/tools';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSearch({ isOpen, onClose }: QuickSearchProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-gray-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 max-w-xl w-full overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-slate-800">
          <svg className="w-5 h-5 text-gray-400 dark:text-slate-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any of 53 tools (e.g. pdf, age, json, compress)..."
            className="w-full text-base bg-transparent border-none outline-none text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 font-medium"
          />
          <button 
            onClick={onClose}
            className="text-xs font-semibold text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-gray-50 dark:divide-slate-800/50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">
              No tools matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((tool) => (
              <Link
                key={tool.slug}
                href={getToolUrl(tool)}
                onClick={onClose}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white text-lg shadow-sm group-hover:scale-105 transition-transform`}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {tool.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                    {tool.description}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))
          )}
        </div>

        <div className="bg-gray-50 dark:bg-slate-950 px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 font-medium">
          <span>Search 53 privacy-first tools</span>
          <span>Press Enter to select</span>
        </div>
      </div>
      
      {/* Backdrop click */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
