'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const getByteSize = (str: string) => {
    return new Blob([str]).size;
  };

  const handleEncode = () => {
    try {
      setError('');
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
    } catch (err) {
      setError('Failed to encode text.');
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
    } catch (err) {
      setError('Invalid Base64 string.');
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setError('');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <nav className="text-sm font-medium text-gray-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Base64 Encoder/Decoder</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Base64 Encoder / Decoder</h1>
              <p className="text-gray-600">Easily encode text to Base64 format or decode Base64 strings back to text.</p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="input" className="block text-sm font-medium text-gray-700">Input</label>
                  <span className="text-xs text-gray-500">{getByteSize(input)} bytes</span>
                </div>
                <textarea
                  id="input"
                  rows={5}
                  className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4"
                  placeholder="Enter text or Base64 here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleEncode}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
                >
                  Encode
                </button>
                <button
                  onClick={handleDecode}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
                >
                  Decode
                </button>
                <button
                  onClick={handleSwap}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl px-4 py-3 font-semibold transition-colors"
                  title="Swap Input and Output"
                >
                  ↕️ Swap
                </button>
                <button
                  onClick={handleClear}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl px-4 py-3 font-semibold transition-colors ml-auto"
                >
                  Clear
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="output" className="block text-sm font-medium text-gray-700">Output</label>
                  <span className="text-xs text-gray-500">{getByteSize(output)} bytes</span>
                </div>
                <textarea
                  id="output"
                  rows={5}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-gray-700"
                  readOnly
                  value={output}
                  placeholder="Result will appear here..."
                />
              </div>

              {output && (
                <div className="flex justify-end">
                  <button
                    onClick={handleCopy}
                    className="bg-gray-800 hover:bg-gray-900 text-white rounded-xl px-6 py-3 font-semibold transition-colors flex items-center gap-2"
                  >
                    {copied ? 'Copied!' : 'Copy Output'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to Use</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-600">
            <li>Paste your plain text or Base64 encoded string into the Input area.</li>
            <li>Click <strong>Encode</strong> to convert plain text into Base64 format.</li>
            <li>Click <strong>Decode</strong> to convert a Base64 string back to readable text.</li>
            <li>Use the <strong>Swap</strong> button to quickly move the output to the input for chaining operations.</li>
            <li>Click <strong>Copy Output</strong> to copy the result to your clipboard.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
