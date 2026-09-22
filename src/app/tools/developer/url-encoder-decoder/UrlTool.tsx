'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ParsedUrl {
  protocol: string;
  host: string;
  pathname: string;
  searchParams: Record<string, string>;
  hash: string;
}

export default function UrlTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null);

  useEffect(() => {
    // Try to parse the input as a URL whenever it changes
    if (input.trim()) {
      try {
        const url = new URL(input.trim().startsWith('http') ? input.trim() : `https://${input.trim()}`);
        const params: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        setParsedUrl({
          protocol: url.protocol,
          host: url.host,
          pathname: url.pathname,
          searchParams: params,
          hash: url.hash
        });
      } catch (e) {
        setParsedUrl(null);
      }
    } else {
      setParsedUrl(null);
    }
  }, [input]);

  const handleAction = (action: 'encodeComponent' | 'decodeComponent' | 'encodeURI' | 'decodeURI') => {
    try {
      setError('');
      let result = '';
      if (action === 'encodeComponent') result = encodeURIComponent(input);
      else if (action === 'decodeComponent') result = decodeURIComponent(input);
      else if (action === 'encodeURI') result = encodeURI(input);
      else if (action === 'decodeURI') result = decodeURI(input);
      
      setOutput(result);
    } catch (err) {
      setError(`Failed to ${action.includes('decode') ? 'decode' : 'encode'} the input string.`);
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
    setParsedUrl(null);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <nav className="text-sm font-medium text-gray-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">URL Encoder/Decoder</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">URL Encoder / Decoder</h1>
              <p className="text-gray-600">Encode special characters for URLs or decode encoded strings back to human-readable text.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">Input String or URL</label>
                <textarea
                  id="input"
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 font-mono text-sm"
                  placeholder="https://example.com/?q=hello world"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => handleAction('encodeComponent')}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-3 font-semibold transition-colors text-sm"
                >
                  Encode Component
                </button>
                <button
                  onClick={() => handleAction('decodeComponent')}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-3 font-semibold transition-colors text-sm"
                >
                  Decode Component
                </button>
                <button
                  onClick={() => handleAction('encodeURI')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 font-semibold transition-colors text-sm"
                >
                  Encode Full URL
                </button>
                <button
                  onClick={() => handleAction('decodeURI')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 font-semibold transition-colors text-sm"
                >
                  Decode Full URL
                </button>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleSwap}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-3 font-semibold transition-colors"
                  title="Swap Input and Output"
                >
                  ↕️ Swap Input/Output
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-3 font-semibold transition-colors"
                >
                  Clear All
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="output" className="block text-sm font-medium text-gray-700 mb-2">Output</label>
                <textarea
                  id="output"
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-gray-700 font-mono text-sm"
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

        {parsedUrl && input && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Parsed URL Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div className="font-semibold text-gray-600">Protocol</div>
                  <div className="sm:col-span-2 font-mono text-gray-900">{parsedUrl.protocol}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div className="font-semibold text-gray-600">Host</div>
                  <div className="sm:col-span-2 font-mono text-gray-900">{parsedUrl.host}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div className="font-semibold text-gray-600">Path</div>
                  <div className="sm:col-span-2 font-mono text-gray-900 break-all">{parsedUrl.pathname}</div>
                </div>
                {parsedUrl.hash && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                    <div className="font-semibold text-gray-600">Hash</div>
                    <div className="sm:col-span-2 font-mono text-gray-900">{parsedUrl.hash}</div>
                  </div>
                )}
                
                {Object.keys(parsedUrl.searchParams).length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Query Parameters</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(parsedUrl.searchParams).map(([key, value]) => (
                            <tr key={key}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">{key}</td>
                              <td className="px-4 py-3 text-sm text-gray-500 font-mono break-all">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-600">
            <li>Paste your URL or text into the Input area.</li>
            <li>Click <strong>Encode Component</strong> for query parameters or fragments, or <strong>Encode Full URL</strong> for an entire web address.</li>
            <li>Click <strong>Decode</strong> to convert encoded gibberish back into readable text.</li>
            <li>If you paste a valid URL, the parser automatically breaks it down into easy-to-read components at the bottom of the screen.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
