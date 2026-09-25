'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<number | string>(2);
  const [error, setError] = useState<{ message: string; line?: number; column?: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleJson = `{
  "site": "ToolsVerse",
  "version": "2.0.0",
  "features": [
    "100% Client-Side Privacy",
    "Lightning Fast WebAssembly",
    "High Precision Validation"
  ],
  "author": {
    "organization": "Open Tools Labs",
    "verified": true
  },
  "metrics": {
    "totalTools": 20,
    "uptime": 0.9999
  }
}`;

  // Calculate detailed JSON statistics
  const stats = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const parsed = JSON.parse(input);
      let keyCount = 0;
      let maxDepth = 0;
      let arrayCount = 0;

      const traverse = (obj: any, depth: number) => {
        if (depth > maxDepth) maxDepth = depth;
        if (Array.isArray(obj)) {
          arrayCount++;
          obj.forEach((item) => traverse(item, depth + 1));
        } else if (typeof obj === 'object' && obj !== null) {
          const keys = Object.keys(obj);
          keyCount += keys.length;
          keys.forEach((k) => traverse(obj[k], depth + 1));
        }
      };

      traverse(parsed, 1);
      return {
        bytes: new Blob([input]).size,
        formattedBytes: output ? new Blob([output]).size : 0,
        keys: keyCount,
        depth: maxDepth,
        arrays: arrayCount,
        isValid: true,
      };
    } catch {
      return {
        bytes: new Blob([input]).size,
        formattedBytes: 0,
        keys: 0,
        depth: 0,
        arrays: 0,
        isValid: false,
      };
    }
  }, [input, output]);

  const parseJsonSafe = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      setError(null);
      return parsed;
    } catch (err: any) {
      let line: number | undefined;
      let column: number | undefined;
      const match = err.message.match(/at position (\d+)/);
      if (match) {
        const pos = parseInt(match[1], 10);
        const upToError = raw.slice(0, pos);
        line = upToError.split('\n').length;
        column = pos - upToError.lastIndexOf('\n');
      }
      setError({
        message: err.message,
        line,
        column,
      });
      return null;
    }
  };

  const handleFormat = () => {
    if (!input.trim()) return;
    const parsed = parseJsonSafe(input);
    if (parsed !== null) {
      const space = indent === 'tab' ? '\t' : Number(indent);
      setOutput(JSON.stringify(parsed, null, space));
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    const parsed = parseJsonSafe(input);
    if (parsed !== null) {
      setOutput(JSON.stringify(parsed));
    }
  };

  const handleCopy = async () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = output || input;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300 dark:text-slate-600">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">JSON Formatter &amp; Validator</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              {'{ }'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              JSON Formatter &amp; Validator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Prettify, validate, minify, and inspect JSON payloads with high precision error detection and structure diagnostics.
          </p>
        </div>

        {/* Validation Status Badge */}
        {stats && (
          <div>
            {stats.isValid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Valid JSON Syntax
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Invalid JSON
              </span>
            )}
          </div>
        )}
      </div>

      {/* Top Ad Slot */}
      <AdSlot format="horizontal" />

      {/* Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFormat}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-xs"
          >
            Prettify / Format
          </button>
          <button
            onClick={handleMinify}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-black text-white transition-all shadow-xs"
          >
            Minify JSON
          </button>
          <button
            onClick={() => {
              setInput(sampleJson);
              setOutput('');
              setError(null);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-colors"
          >
            Load Sample
          </button>
          <button
            onClick={() => {
              setInput('');
              setOutput('');
              setError(null);
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Indent option & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300 font-medium">
            <span>Indent:</span>
            <select
              value={indent}
              onChange={(e) => setIndent(e.target.value)}
              className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-gray-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>

          <button
            onClick={handleCopy}
            disabled={!output && !input}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-800 hover:bg-gray-50 text-gray-700 dark:text-slate-200 transition-colors disabled:opacity-40"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            disabled={!output && !input}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-800 hover:bg-gray-50 text-gray-700 dark:text-slate-200 transition-colors disabled:opacity-40"
          >
            Download .json
          </button>
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-xs text-red-800 flex items-start gap-2.5">
          <span className="text-base leading-none">⚠️</span>
          <div>
            <p className="font-bold">JSON Syntax Error</p>
            <p className="mt-0.5 font-mono text-[11px]">{error.message}</p>
            {error.line && (
              <p className="mt-1 text-[11px] text-red-600">
                Hint: Check Line <strong>{error.line}</strong>, Column <strong>{error.column}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Input Pane */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-600 dark:text-slate-300">
            <span>Input JSON</span>
            <span className="text-gray-400 dark:text-slate-400 font-normal">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste raw unformatted or minified JSON here..."
            className="w-full h-96 p-4 font-mono text-xs text-gray-800 dark:text-slate-100 resize-none outline-none focus:ring-1 focus:ring-primary-400 leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output Pane */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-600 dark:text-slate-300">
            <span>Formatted Result</span>
            <span className="text-gray-400 dark:text-slate-400 font-normal">
              {output ? `${output.split('\n').length} lines` : 'Waiting for format'}
            </span>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Prettified or minified output will appear here..."
            className="w-full h-96 p-4 font-mono text-xs text-gray-800 dark:text-slate-100 bg-slate-50/50 resize-none outline-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Real-time Document Diagnostics Bar */}
      {stats && stats.isValid && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs mb-10">
          <h3 className="text-xs uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider mb-3">
            Structure Diagnostics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
              <span className="block text-lg font-black text-gray-900 dark:text-white">{stats.keys}</span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">Object Keys</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
              <span className="block text-lg font-black text-gray-900 dark:text-white">{stats.depth}</span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">Nesting Depth</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
              <span className="block text-lg font-black text-gray-900 dark:text-white">{stats.arrays}</span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">Arrays Count</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
              <span className="block text-lg font-black text-gray-900 dark:text-white">{stats.bytes} B</span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">Payload Size</span>
            </div>
          </div>
        </div>
      )}

      {/* Step by Step Guide & SEO Description */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">How to Use the JSON Formatter</h2>
        <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-6">
          <li>Paste any valid or invalid JSON string into the left input pane.</li>
          <li>Click <strong>Prettify / Format</strong> to indent and restructure, or <strong>Minify</strong> to condense into one line.</li>
          <li>If an error occurs, inspect the exact line and column pointer to correct missing quotes or trailing commas.</li>
          <li>Click <strong>Copy</strong> to clipboard or <strong>Download .json</strong> to save the formatted file.</li>
        </ol>

        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Privacy &amp; Security Guarantee</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          Your confidential JSON data is evaluated locally inside your browser using the native V8 JavaScript parser. No network requests are made, ensuring your API tokens and credentials remain completely confidential.
        </p>
      </div>
    </div>
  );
}
