'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function CsvJsonConverter() {
  const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [input, setInput] = useState(
    'id,name,role,email\n1,Alice Johnson,Developer,alice@example.com\n2,Bob Smith,Designer,bob@example.com\n3,Charlie Brown,Manager,charlie@example.com'
  );
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const convert = () => {
    setError('');
    if (!input.trim()) return;

    try {
      if (mode === 'csv2json') {
        const lines = input.trim().split('\n');
        if (lines.length < 2) {
          throw new Error('CSV must contain at least a header row and one data row.');
        }
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        const rows = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
          const obj: Record<string, any> = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] !== undefined ? values[i] : '';
          });
          return obj;
        });
        setOutput(JSON.stringify(rows, null, 2));
      } else {
        // JSON to CSV
        const parsed = JSON.parse(input);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Input must be a non-empty JSON array of objects.');
        }
        const keys = Array.from(new Set(parsed.flatMap((item) => Object.keys(item))));
        const headerRow = keys.join(',');
        const dataRows = parsed.map((item) =>
          keys.map((k) => {
            const val = item[k] === undefined || item[k] === null ? '' : String(item[k]);
            return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
          }).join(',')
        );
        setOutput([headerRow, ...dataRows].join('\n'));
      }
    } catch (err: any) {
      setError(err.message || 'Conversion failed.');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const isJson = mode === 'csv2json';
    const blob = new Blob([output], { type: isJson ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isJson ? 'converted.json' : 'converted.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300 dark:text-slate-600">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">CSV to JSON Converter</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              📊
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              CSV ↔ JSON Converter
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Convert tabular CSV files into JSON arrays or format JSON arrays into standard comma-separated spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newMode = mode === 'csv2json' ? 'json2csv' : 'csv2json';
              setMode(newMode);
              setInput(output || (newMode === 'csv2json' ? 'id,name\n1,Alice\n2,Bob' : '[{"id": 1, "name": "Alice"}]'));
              setOutput('');
              setError('');
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-colors"
          >
            ⇄ Switch to {mode === 'csv2json' ? 'JSON to CSV' : 'CSV to JSON'}
          </button>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Action controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={convert}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            Convert Now
          </button>
          <button
            onClick={() => { setInput(''); setOutput(''); setError(''); }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!output}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-800 hover:bg-gray-50 text-gray-700 dark:text-slate-200 transition-colors disabled:opacity-40"
          >
            {copied ? '✓ Copied' : 'Copy Output'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!output}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-800 hover:bg-gray-50 text-gray-700 dark:text-slate-200 transition-colors disabled:opacity-40"
          >
            Download File
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-4 mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-slate-200 flex justify-between">
            <span>Input ({mode === 'csv2json' ? 'CSV Format' : 'JSON Array'})</span>
            <span className="text-gray-400 dark:text-slate-400 font-normal">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'csv2json' ? 'Paste CSV with headers here...' : 'Paste JSON array here...'}
            className="w-full h-80 p-4 font-mono text-xs text-gray-800 dark:text-slate-100 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-slate-200 flex justify-between">
            <span>Output ({mode === 'csv2json' ? 'JSON Array' : 'CSV Format'})</span>
            <span className="text-gray-400 dark:text-slate-400 font-normal">{output.length} chars</span>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Converted result will appear here..."
            className="w-full h-80 p-4 font-mono text-xs text-gray-800 dark:text-slate-100 bg-gray-50/50 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">How to Convert CSV &amp; JSON</h2>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-600 dark:text-slate-300">
          <li>For CSV to JSON: ensure the first row has column headers (e.g. name, email, role).</li>
          <li>For JSON to CSV: ensure the input is an array of objects (e.g. [&#123;&quot;id&quot;: 1, &quot;name&quot;: &quot;Alice&quot;&#125;]).</li>
          <li>Click <strong>Convert Now</strong> and copy the result or download the converted spreadsheet.</li>
        </ul>
      </div>
    </div>
  );
}
