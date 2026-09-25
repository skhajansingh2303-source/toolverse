'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  oldLineNum?: number;
  newLineNum?: number;
  content: string;
}

export default function TextDiffChecker() {
  const [oldText, setOldText] = useState(
    '// Version 1.0\nfunction calculateTax(subtotal) {\n  return subtotal * 0.05;\n}\nconsole.log(calculateTax(100));'
  );
  const [newText, setNewText] = useState(
    '// Version 2.0 (Updated tax)\nfunction calculateTax(subtotal, state = "CA") {\n  const rate = state === "CA" ? 0.0725 : 0.05;\n  return subtotal * rate;\n}\nconsole.log(calculateTax(100, "CA"));'
  );
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  // Compute accurate line diff
  const diffResult = useMemo(() => {
    const rawOld = oldText.split('\n');
    const rawNew = newText.split('\n');

    const clean = (str: string) => {
      let s = str;
      if (ignoreWhitespace) s = s.trim().replace(/\s+/g, ' ');
      if (ignoreCase) s = s.toLowerCase();
      return s;
    };

    const lines: DiffLine[] = [];
    let oldIndex = 0;
    let newIndex = 0;
    let oldLineNum = 1;
    let newLineNum = 1;

    let addedCount = 0;
    let removedCount = 0;
    let unchangedCount = 0;

    while (oldIndex < rawOld.length || newIndex < rawNew.length) {
      const o = rawOld[oldIndex];
      const n = rawNew[newIndex];

      if (o !== undefined && n !== undefined && clean(o) === clean(n)) {
        lines.push({
          type: 'unchanged',
          oldLineNum: oldLineNum++,
          newLineNum: newLineNum++,
          content: n,
        });
        oldIndex++;
        newIndex++;
        unchangedCount++;
      } else if (o !== undefined && (n === undefined || !rawNew.slice(newIndex).some((line) => clean(line) === clean(o)))) {
        lines.push({
          type: 'removed',
          oldLineNum: oldLineNum++,
          content: o,
        });
        oldIndex++;
        removedCount++;
      } else if (n !== undefined) {
        lines.push({
          type: 'added',
          newLineNum: newLineNum++,
          content: n,
        });
        newIndex++;
        addedCount++;
      }
    }

    return {
      lines,
      addedCount,
      removedCount,
      unchangedCount,
    };
  }, [oldText, newText, ignoreCase, ignoreWhitespace]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300 dark:text-slate-600">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Text Diff Checker</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              🔍
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              Text &amp; Code Diff Checker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Compare two texts, configurations, or code snippets side-by-side to highlight added, removed, and modified lines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const temp = oldText;
              setOldText(newText);
              setNewText(temp);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-colors"
          >
            ⇄ Swap Texts
          </button>
          <button
            onClick={() => {
              setOldText('');
              setNewText('');
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Settings Ribbon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 text-gray-700 dark:text-slate-200 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="accent-primary-600 rounded"
            />
            Ignore Whitespace
          </label>
          <label className="flex items-center gap-2 text-gray-700 dark:text-slate-200 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="accent-primary-600 rounded"
            />
            Ignore Case
          </label>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold border border-emerald-200">
            +{diffResult.addedCount} added
          </span>
          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-lg font-semibold border border-red-200">
            -{diffResult.removedCount} removed
          </span>
          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg font-semibold border border-gray-200 dark:border-slate-800">
            {diffResult.unchangedCount} unchanged
          </span>
        </div>
      </div>

      {/* Side by Side Input Textareas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-slate-200">
            Original Text (Before)
          </div>
          <textarea
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
            placeholder="Paste initial text or code..."
            className="w-full h-64 p-4 font-mono text-xs text-gray-800 dark:text-slate-100 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-slate-200">
            Modified Text (After)
          </div>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Paste modified text or code..."
            className="w-full h-64 p-4 font-mono text-xs text-gray-800 dark:text-slate-100 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Visual Diff Output Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden mb-8">
        <div className="px-6 py-3.5 bg-gray-900 text-white flex items-center justify-between text-xs font-bold">
          <span>Unified Diff Output</span>
          <span className="text-gray-400 dark:text-slate-400 font-normal text-[11px]">
            {diffResult.lines.length} total lines rendered
          </span>
        </div>

        <div className="font-mono text-xs overflow-x-auto divide-y divide-gray-100 dark:divide-slate-800">
          {diffResult.lines.map((line, idx) => {
            const isAdded = line.type === 'added';
            const isRemoved = line.type === 'removed';

            return (
              <div
                key={idx}
                className={`flex items-start px-4 py-1.5 transition-colors ${
                  isAdded
                    ? 'bg-emerald-50/80 text-emerald-900'
                    : isRemoved
                    ? 'bg-red-50/80 text-red-900'
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                {/* Line number indicators */}
                <div className="w-16 flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-400 select-none mr-4 shrink-0 font-mono">
                  <span>{line.oldLineNum || ''}</span>
                  <span>{line.newLineNum || ''}</span>
                  <span className="font-bold ml-1">
                    {isAdded ? '+' : isRemoved ? '-' : ' '}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 whitespace-pre-wrap break-all leading-relaxed">
                  {line.content || ' '}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
