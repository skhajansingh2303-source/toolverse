'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function ListCleaner() {
  const [text, setText] = useState('Apple\nBanana\napple\nOrange\nBanana\nGrape\nMango\n  Apple  \n');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [copied, setCopied] = useState(false);

  const getLines = () => text.split('\n');

  const removeDuplicates = (caseInsensitive = true) => {
    const lines = getLines();
    const seen = new Set<string>();
    const result: string[] = [];

    lines.forEach((line) => {
      const key = caseInsensitive ? line.trim().toLowerCase() : line.trim();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line.trim());
      }
    });
    setText(result.join('\n'));
  };

  const sortLines = (direction: 'asc' | 'desc' | 'length' | 'shuffle') => {
    let lines = getLines().map((l) => l.trim()).filter(Boolean);
    if (direction === 'asc') {
      lines.sort((a, b) => a.localeCompare(b));
    } else if (direction === 'desc') {
      lines.sort((a, b) => b.localeCompare(a));
    } else if (direction === 'length') {
      lines.sort((a, b) => a.length - b.length);
    } else if (direction === 'shuffle') {
      lines = lines.sort(() => Math.random() - 0.5);
    }
    setText(lines.join('\n'));
  };

  const trimLines = () => {
    const lines = getLines().map((l) => l.trim()).filter(Boolean);
    setText(lines.join('\n'));
  };

  const numberLines = () => {
    const lines = getLines().map((l) => l.trim()).filter(Boolean);
    const numbered = lines.map((l, i) => `${i + 1}. ${l}`);
    setText(numbered.join('\n'));
  };

  const applyAffixes = () => {
    const lines = getLines().map((l) => l.trim()).filter(Boolean);
    const updated = lines.map((l) => `${prefix}${l}${suffix}`);
    setText(updated.join('\n'));
  };

  const joinDelimiter = (delimiter: string) => {
    const lines = getLines().map((l) => l.trim()).filter(Boolean);
    setText(lines.join(delimiter));
  };

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linesCount = text.split('\n').filter((l) => l.trim().length > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-600">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">List Cleaner &amp; Deduplicator</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              📋
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              List Cleaner &amp; Sorter
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Remove duplicate entries, alphabetize, trim whitespace, add numbered bullets, and reformat list lines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 transition-colors disabled:opacity-40"
          >
            {copied ? '✓ Copied' : 'Copy List'}
          </button>
          <button
            onClick={() => setText('')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-xs mb-6 space-y-4">
        <div>
          <span className="block text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">
            Quick Operations
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => removeDuplicates(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-all"
            >
              Deduplicate (Remove Duplicates)
            </button>
            <button
              onClick={() => sortLines('asc')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 transition-colors"
            >
              Sort A → Z
            </button>
            <button
              onClick={() => sortLines('desc')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 transition-colors"
            >
              Sort Z → A
            </button>
            <button
              onClick={() => sortLines('length')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 transition-colors"
            >
              Sort by Length
            </button>
            <button
              onClick={() => sortLines('shuffle')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 transition-colors"
            >
              Shuffle / Randomize
            </button>
            <button
              onClick={trimLines}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 transition-colors"
            >
              Trim Spaces &amp; Blanks
            </button>
            <button
              onClick={numberLines}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 transition-colors"
            >
              Add Numbers (1, 2, 3...)
            </button>
          </div>
        </div>

        {/* Prefix / Suffix and Joiner */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-slate-400 font-medium">Add Prefix:</span>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. - or quotes"
              className="w-24 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs"
            />
            <span className="text-gray-500 dark:text-slate-400 font-medium ml-2">Suffix:</span>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="e.g. , or quotes"
              className="w-20 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs"
            />
            <button
              onClick={applyAffixes}
              className="px-2.5 py-1 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold ml-1"
            >
              Apply
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
            <span>Join with:</span>
            <button onClick={() => joinDelimiter(', ')} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded">Comma (,)</button>
            <button onClick={() => joinDelimiter('; ')} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded">Semicolon (;)</button>
            <button onClick={() => joinDelimiter(' ')} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded">Space</button>
          </div>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden mb-8">
        <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-slate-300">
          <span>List Content</span>
          <span className="text-gray-500 dark:text-slate-400">{linesCount} items</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste one item per line here..."
          className="w-full h-96 p-6 font-mono text-xs text-gray-800 dark:text-slate-100 outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
