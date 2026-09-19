'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [wrapper, setWrapper] = useState<string>('none');
  const [separator, setSeparator] = useState<string>('newline');
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateV4 = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  };

  const formatUuid = (uuid: string) => {
    let formatted = uuid;
    if (!hyphens) formatted = formatted.replace(/-/g, '');
    if (uppercase) formatted = formatted.toUpperCase();
    
    if (wrapper === 'braces') formatted = `{${formatted}}`;
    else if (wrapper === 'quotes') formatted = `"${formatted}"`;
    
    return formatted;
  };

  const generateUuids = () => {
    const newUuids = [];
    for (let i = 0; i < quantity; i++) {
      newUuids.push(formatUuid(generateV4()));
    }
    setUuids(newUuids);
  };

  useEffect(() => {
    generateUuids();
  }, [quantity, uppercase, hyphens, wrapper, separator]);

  const getOutputString = () => {
    const sepStr = separator === 'comma' ? ', ' : '\n';
    return uuids.join(sepStr);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(getOutputString());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (uuid: string, index: number) => {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getOutputString()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800 bg-gray-50 min-h-screen">
      <nav className="text-sm mb-6 text-gray-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">UUID Generator</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">UUID Generator</h1>
        <p className="text-gray-600">Generate secure version 4 universally unique identifiers (UUIDs/GUIDs) instantly.</p>
      </header>

      <AdSlot format="horizontal" />

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <select 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 p-3 bg-white"
              >
                <option value="1">1</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Case</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!uppercase} onChange={() => setUppercase(false)} className="text-primary-600 focus:ring-primary-500" />
                  <span>Lowercase</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={uppercase} onChange={() => setUppercase(true)} className="text-primary-600 focus:ring-primary-500" />
                  <span>Uppercase</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hyphens</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} className="text-primary-600 rounded focus:ring-primary-500" />
                <span>Include Hyphens</span>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Wrapper</label>
              <select 
                value={wrapper} 
                onChange={(e) => setWrapper(e.target.value)}
                className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 p-3 bg-white"
              >
                <option value="none">None</option>
                <option value="braces">Braces {'{...}'}</option>
                <option value="quotes">Quotes "..."</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Separator</label>
              <select 
                value={separator} 
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 p-3 bg-white"
              >
                <option value="newline">New Line</option>
                <option value="comma">Comma ( , )</option>
              </select>
            </div>
            
            <div className="pt-2">
              <button 
                onClick={generateUuids}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
              >
                Generate New UUIDs
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Generated UUIDs</h2>
            <div className="flex gap-3">
              <button 
                onClick={handleDownload}
                className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Download .txt
              </button>
              <button 
                onClick={handleCopyAll}
                className="bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {copiedAll ? 'Copied!' : 'Copy All'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 max-h-[400px] overflow-y-auto">
            {separator === 'comma' ? (
              <p className="font-mono text-sm text-gray-700 break-all">{getOutputString()}</p>
            ) : (
              <ul className="space-y-1">
                {uuids.map((uuid, i) => (
                  <li key={i} className="flex justify-between items-center group hover:bg-gray-100 p-2 rounded-lg transition-colors">
                    <span className="font-mono text-sm text-gray-700">{uuid}</span>
                    <button 
                      onClick={() => handleCopySingle(uuid, i)}
                      className={`text-xs px-2 py-1 rounded font-medium transition-colors ${copiedIndex === i ? 'bg-green-100 text-green-700' : 'opacity-0 group-hover:opacity-100 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {copiedIndex === i ? 'Copied' : 'Copy'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use the UUID Generator</h2>
        <ol className="list-decimal pl-5 space-y-3 text-gray-700">
          <li>Select the number of UUIDs you want to generate using the <strong>Quantity</strong> dropdown.</li>
          <li>Choose whether you want the letters to be <strong>Lowercase</strong> or <strong>Uppercase</strong>.</li>
          <li>Toggle <strong>Include Hyphens</strong> to add or remove standard dashes in the UUID.</li>
          <li>Select a <strong>Wrapper</strong> if you need the UUIDs enclosed in braces or quotes.</li>
          <li>Click <strong>Generate New UUIDs</strong> to create a fresh batch.</li>
          <li>Use the <strong>Copy All</strong> or <strong>Download .txt</strong> buttons to export your generated UUIDs.</li>
        </ol>
      </div>
    </div>
  );
}
