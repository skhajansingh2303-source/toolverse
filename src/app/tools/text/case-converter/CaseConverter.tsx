'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function CaseConverter() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyVal = async (val: string, key: string) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Accurate Title Case (AP / Chicago style)
  const toTitleCase = (str: string) => {
    const minorWords = new Set([
      'and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet', 'a', 'an', 'the',
      'at', 'by', 'for', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via'
    ]);
    return str
      .toLowerCase()
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0 || !minorWords.has(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  // Sentence Case
  const toSentenceCase = (str: string) => {
    return str
      .toLowerCase()
      .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  // camelCase
  const toCamelCase = (str: string) => {
    const words = str.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/);
    return words
      .map((w, idx) =>
        idx === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join('');
  };

  // PascalCase
  const toPascalCase = (str: string) => {
    const words = str.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/);
    return words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
  };

  // snake_case
  const toSnakeCase = (str: string) => {
    return str
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  };

  // kebab-case
  const toKebabCase = (str: string) => {
    return str
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  };

  // CONSTANT_CASE
  const toConstantCase = (str: string) => {
    return toSnakeCase(str).toUpperCase();
  };

  // slugify
  const toSlug = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Alternating case
  const toAlternating = (str: string) => {
    return str
      .split('')
      .map((char, index) =>
        index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
      )
      .join('');
  };

  const cases = [
    { key: 'upper', label: 'UPPERCASE', value: text.toUpperCase() },
    { key: 'lower', label: 'lowercase', value: text.toLowerCase() },
    { key: 'title', label: 'Title Case (AP Style)', value: toTitleCase(text) },
    { key: 'sentence', label: 'Sentence case', value: toSentenceCase(text) },
    { key: 'camel', label: 'camelCase', value: toCamelCase(text) },
    { key: 'pascal', label: 'PascalCase', value: toPascalCase(text) },
    { key: 'snake', label: 'snake_case', value: toSnakeCase(text) },
    { key: 'kebab', label: 'kebab-case', value: toKebabCase(text) },
    { key: 'constant', label: 'CONSTANT_CASE', value: toConstantCase(text) },
    { key: 'slug', label: 'URL slug-case', value: toSlug(text) },
    { key: 'alternating', label: 'aLtErNaTiNg cAsE', value: toAlternating(text) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">Case Converter</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              Aa
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
              Text Case Converter
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Convert text instantly between UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, and URL slugs.
          </p>
        </div>

        <button
          onClick={() => setText('')}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
        >
          Clear Input
        </button>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Text Input */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 mb-8">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Type or Paste Text Below
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert..."
          className="w-full h-36 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 outline-none resize-none focus:ring-1 focus:ring-primary-500"
        />
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>{text.length} characters • {text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
          <span>Click any card below to copy converted text</span>
        </div>
      </div>

      {/* Converted Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cases.map((c) => {
          const isCopied = copiedKey === c.key;
          return (
            <div
              key={c.key}
              onClick={() => copyVal(c.value, c.key)}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-primary-400 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {c.label}
                  </span>
                  <span className="text-[11px] font-semibold text-primary-600 group-hover:underline">
                    {isCopied ? '✓ Copied' : 'Copy'}
                  </span>
                </div>
                <p className="font-mono text-xs text-gray-900 break-all line-clamp-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  {c.value || <span className="text-gray-300 italic">No text</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
