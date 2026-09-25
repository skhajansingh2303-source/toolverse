'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export default function CodeBeautifierMinifier() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [language, setLanguage] = useState<'html' | 'css' | 'js'>('html');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{orig: number, new: number, reduction: number} | null>(null);

  const formatCode = (action: 'beautify' | 'minify') => {
    let result = inputCode;

    if (action === 'minify') {
      if (language === 'html') {
        result = result
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/>\s+</g, '><')
          .replace(/\s{2,}/g, ' ')
          .trim();
      } else if (language === 'css') {
        result = result
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}\[\]:;,])\s*/g, '$1')
          .replace(/;}/g, '}')
          .trim();
      } else if (language === 'js') {
        result = result
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*/g, '')
          .replace(/\s+/g, ' ')
          .replace(/\s*([=+\-*/<>&|!?:;{},()[\]])\s*/g, '$1')
          .trim();
      }
    } else {
      // Very basic formatting logic for beautify fallback (since we can't use external libs like Prettier easily here)
      if (language === 'html') {
        let formatted = '';
        let indent = 0;
        result.replace(/>\s*</g, '><').split(/(?=<)|(?<=>)/).forEach(element => {
          if (element.match(/^<\/\w/)) indent--;
          formatted += '  '.repeat(Math.max(0, indent)) + element + '\n';
          if (element.match(/^<\w[^>]*[^\/]>.*$/) && !element.includes('</')) indent++;
        });
        result = formatted.trim();
      } else if (language === 'css') {
        result = result
          .replace(/\s*([{}])\s*/g, '\n$1\n')
          .replace(/;\s*/g, ';\n')
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .join('\n')
          .replace(/{/g, ' {\n  ')
          .replace(/}/g, '\n}\n')
          .replace(/;\n([^}])/g, ';\n  $1');
      } else if (language === 'js') {
        let indent = 0;
        result = result
          .replace(/([{}])/g, '\n$1\n')
          .replace(/([;])/g, '$1\n')
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => {
            if (line.includes('}')) indent--;
            const currentLine = '  '.repeat(Math.max(0, indent)) + line;
            if (line.includes('{')) indent++;
            return currentLine;
          })
          .join('\n');
      }
    }

    setOutputCode(result);
    
    if (action === 'minify') {
      const origSize = new Blob([inputCode]).size;
      const newSize = new Blob([result]).size;
      const red = origSize > 0 ? ((origSize - newSize) / origSize * 100).toFixed(1) : 0;
      setStats({ orig: origSize, new: newSize, reduction: Number(red) });
    } else {
      setStats(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = { html: 'html', css: 'css', js: 'js' };
    const ext = extensions[language];
    const blob = new Blob([outputCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    if (language === 'html') {
      setInputCode('<!DOCTYPE html><html><head><title>Test</title></head><body><div><p>Hello World</p></div></body></html>');
    } else if (language === 'css') {
      setInputCode('body { background: #fff; color: #333; } h1 { font-size: 2em; margin: 0; }');
    } else {
      setInputCode('function greet(name){console.log("Hello, "+name);if(name==="World"){alert("Hello!");}}');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors">
      <nav className="text-sm mb-6 text-gray-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Code Beautifier & Minifier</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Code Beautifier & Minifier</h1>
        <p className="text-gray-600">Format or minify your HTML, CSS, and JavaScript code easily.</p>
      </header>

      <AdSlot format="horizontal" />

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-8 mt-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-700">Language:</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as any);
                setInputCode('');
                setOutputCode('');
                setStats(null);
              }}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 p-2 bg-white min-w-[150px]"
            >
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="js">JavaScript</option>
            </select>
            <button onClick={loadSample} className="text-sm text-primary-600 hover:text-primary-700">Load Sample</button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => formatCode('beautify')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 font-semibold transition-colors"
            >
              Beautify
            </button>
            <button 
              onClick={() => formatCode('minify')}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2 font-semibold transition-colors"
            >
              Minify
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Input Code</label>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 font-mono text-sm min-h-[400px]"
              placeholder="Paste your code here..."
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Output Code</label>
              {outputCode && (
                <div className="flex gap-2">
                  <button onClick={handleDownload} className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded">Download</button>
                  <button onClick={handleCopy} className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={outputCode}
              readOnly
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 p-4 font-mono text-sm min-h-[400px]"
              placeholder="Output will appear here..."
            />
            {stats && (
              <div className="mt-3 text-sm text-gray-600 flex justify-between bg-green-50 p-3 rounded-xl border border-green-100">
                <span>Original: <strong>{stats.orig} bytes</strong></span>
                <span>Minified: <strong>{stats.new} bytes</strong></span>
                <span className="text-green-700 font-semibold">Reduced by {stats.reduction}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use the Code Beautifier & Minifier</h2>
        <ol className="list-decimal pl-5 space-y-3 text-gray-700">
          <li>Select your code <strong>Language</strong> (HTML, CSS, or JavaScript) from the dropdown.</li>
          <li>Paste your unformatted or minified code into the <strong>Input Code</strong> box on the left.</li>
          <li>Click <strong>Beautify</strong> to add proper indentation and line breaks to make the code readable.</li>
          <li>Click <strong>Minify</strong> to remove all unnecessary spaces, line breaks, and comments to reduce file size.</li>
          <li>If you minified the code, view the stats below the output to see how much space was saved.</li>
          <li>Use the <strong>Copy</strong> or <strong>Download</strong> buttons to save your processed code.</li>
        </ol>
      </div>
    </div>
  );
}
