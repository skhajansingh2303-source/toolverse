import os

base_path = '/home/khajan/toolsverse/src/app/tools'

tools = {
    'json-formatter': {
        'page': '''import { Metadata } from 'next';
import JsonFormatter from './JsonFormatter';

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator - Format JSON Online Free',
  description: 'Format, validate, prettify, and minify your JSON data instantly. A fast, secure, free online JSON tool.',
  keywords: ['json formatter', 'json validator', 'json minifier', 'format json', 'prettify json']
};

export default function Page() {
  return <JsonFormatter />;
}
''',
        'comp': '''"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [copied, setCopied] = useState(false);

  const sampleJson = '{"name": "ToolsVerse", "type": "Tool", "features": ["fast", "secure", "free"], "isOnline": true}';

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setStatus('valid');
      setError(null);
    } catch (err: any) {
      setStatus('invalid');
      setError(err.message);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setStatus('valid');
      setError(null);
    } catch (err: any) {
      setStatus('invalid');
      setError(err.message);
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(input);
      setStatus('valid');
      setError(null);
    } catch (err: any) {
      setStatus('invalid');
      setError(err.message);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-primary-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">JSON Formatter</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">JSON Formatter & Validator</h1>
        <p className="text-gray-600">Format, validate, prettify, and minify your JSON data instantly.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-4 mb-4">
          <button onClick={formatJson} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2 font-semibold">Format</button>
          <button onClick={minifyJson} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2 font-semibold">Minify</button>
          <button onClick={validateJson} className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl px-6 py-2 font-semibold">Validate</button>
          <button onClick={() => { setInput(''); setOutput(''); setStatus('idle'); setError(null); }} className="bg-red-50 hover:bg-red-100 text-red-600 rounded-xl px-6 py-2 font-semibold">Clear</button>
          <button onClick={() => setInput(sampleJson)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl px-6 py-2 font-semibold">Sample</button>
        </div>

        <div className="mb-4">
          {status === 'valid' && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Valid JSON</span>}
          {status === 'invalid' && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Invalid JSON</span>}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
            <textarea
              className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 font-mono text-sm min-h-[400px]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
            />
          </div>
          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Output</label>
              <button onClick={copyToClipboard} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4 font-mono text-sm min-h-[400px] bg-gray-50"
              value={output}
              readOnly
              placeholder="Formatted JSON will appear here..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Paste your JSON data into the Input area on the left.</li>
          <li>Click 'Format' to prettify the JSON with indentation.</li>
          <li>Click 'Minify' to compress the JSON into a single string.</li>
          <li>Click 'Validate' to check for errors. If invalid, the error message will show where the problem is.</li>
        </ol>
      </div>
    </div>
  );
}
''',
        'comp_name': 'JsonFormatter.tsx'
    },
    'qr-code-generator': {
        'page': '''import { Metadata } from 'next';
import QrCodeGenerator from './QrCodeGenerator';

export const metadata: Metadata = {
  title: 'QR Code Generator - Create QR Codes Free Online',
  description: 'Create custom QR codes instantly. Enter text or a URL and download your QR code as a PNG image.',
  keywords: ['qr code generator', 'create qr code', 'free qr code', 'qr code png']
};

export default function Page() {
  return <QrCodeGenerator />;
}
''',
        'comp': '''"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function QrCodeGenerator() {
  const [text, setText] = useState('https://toolsverse.com');
  const [size, setSize] = useState<number>(200);
  const [color, setColor] = useState('#000000');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !text) return;
      try {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: size,
          margin: 1,
          color: {
            dark: color,
            light: '#ffffff'
          }
        });
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(() => {
      generateQR();
    }, 300);

    return () => clearTimeout(timer);
  }, [text, size, color]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = url;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-primary-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">QR Code Generator</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
        <p className="text-gray-600">Create custom QR codes for your URLs, text, and more.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text or URL</label>
              <textarea
                className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or URL here..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size: {size}px</label>
              <select
                className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-4"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option value={150}>150x150</option>
                <option value={200}>200x200</option>
                <option value={300}>300x300</option>
                <option value={400}>400x400</option>
                <option value={500}>500x500</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <input
                type="color"
                className="h-12 w-full rounded-xl cursor-pointer"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-8 border border-gray-200">
            <canvas ref={canvasRef} className="mb-6 shadow-sm rounded-lg bg-white"></canvas>
            <button
              onClick={downloadQR}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-3 font-semibold w-full max-w-xs"
            >
              Download PNG
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Enter any text, website URL, or contact information into the text field.</li>
          <li>Select the desired size for your QR code image.</li>
          <li>Choose a custom color to match your brand or preference.</li>
          <li>Click the Download PNG button to save the generated QR code to your device.</li>
        </ol>
      </div>
    </div>
  );
}
''',
        'comp_name': 'QrCodeGenerator.tsx'
    },
    'password-generator': {
        'page': '''import { Metadata } from 'next';
import PasswordGenerator from './PasswordGenerator';

export const metadata: Metadata = {
  title: 'Password Generator - Create Strong Secure Passwords',
  description: 'Generate strong, secure, random passwords online. Customize length and characters to meet security requirements.',
  keywords: ['password generator', 'strong password', 'random password', 'secure password generator']
};

export default function Page() {
  return <PasswordGenerator />;
}
''',
        'comp': '''"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);

  const generatePassword = useCallback(() => {
    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      setPassword('');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  const generateBulk = () => {
    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') return;

    const newBulk = [];
    for (let j = 0; j < 5; j++) {
      let pwd = '';
      for (let i = 0; i < length; i++) {
        pwd += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      newBulk.push(pwd);
    }
    setBulkPasswords(newBulk);
  };

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getStrength = () => {
    let score = 0;
    if (length > 8) score++;
    if (length > 12) score++;
    if (useUpper) score++;
    if (useLower) score++;
    if (useNumbers) score++;
    if (useSymbols) score++;

    if (score < 3) return { label: 'Weak', color: 'bg-red-500', w: 'w-1/4' };
    if (score < 5) return { label: 'Medium', color: 'bg-yellow-500', w: 'w-2/4' };
    if (score < 6) return { label: 'Strong', color: 'bg-green-500', w: 'w-3/4' };
    return { label: 'Very Strong', color: 'bg-green-600', w: 'w-full' };
  };

  const strength = getStrength();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-primary-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Password Generator</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Generator</h1>
        <p className="text-gray-600">Create strong, secure passwords instantly.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="relative mb-6">
          <div className="flex justify-between items-center bg-gray-50 border border-gray-300 rounded-xl p-4">
            <span className="font-mono text-xl text-gray-800 break-all">{password || 'Select options...'}</span>
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <button onClick={generatePassword} className="p-2 text-gray-500 hover:text-primary-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors" aria-label="Regenerate">
                🔄
              </button>
              <button onClick={() => copyToClipboard(password)} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 font-medium">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Strength: {strength.label}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`${strength.color} ${strength.w} h-2 rounded-full transition-all duration-300`}></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Password Length</label>
              <span className="text-primary-600 font-bold">{length}</span>
            </div>
            <input
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
              <span className="text-gray-700">Uppercase (A-Z)</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
              <span className="text-gray-700">Lowercase (a-z)</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
              <span className="text-gray-700">Numbers (0-9)</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
              <span className="text-gray-700">Symbols (!@#$...)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button onClick={generateBulk} className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl px-6 py-3 font-semibold w-full mb-4">
              Bulk Generate (5 Passwords)
            </button>
            {bulkPasswords.length > 0 && (
              <div className="space-y-2">
                {bulkPasswords.map((pwd, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="font-mono text-sm text-gray-800 break-all mr-2">{pwd}</span>
                    <button onClick={() => copyToClipboard(pwd)} className="text-primary-600 hover:text-primary-700 text-sm font-medium whitespace-nowrap">
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Use the slider to choose your desired password length.</li>
          <li>Check or uncheck the character types you want to include.</li>
          <li>Click the copy button or the refresh button to generate a new password.</li>
          <li>Use the Bulk Generate button if you need multiple passwords at once.</li>
        </ol>
      </div>
    </div>
  );
}
''',
        'comp_name': 'PasswordGenerator.tsx'
    },
    'color-palette-generator': {
        'page': '''import { Metadata } from 'next';
import ColorPaletteGenerator from './ColorPaletteGenerator';

export const metadata: Metadata = {
  title: 'Color Palette Generator - Create Beautiful Color Schemes',
  description: 'Generate beautiful color palettes, harmonies, and schemes. Export as CSS variables for your next project.',
  keywords: ['color palette', 'color generator', 'css colors', 'color scheme generator']
};

export default function Page() {
  return <ColorPaletteGenerator />;
}
''',
        'comp': '''"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Color {
  hex: string;
  locked: boolean;
}

export default function ColorPaletteGenerator() {
  const [colors, setColors] = useState<Color[]>([
    { hex: '#ffffff', locked: false },
    { hex: '#ffffff', locked: false },
    { hex: '#ffffff', locked: false },
    { hex: '#ffffff', locked: false },
    { hex: '#ffffff', locked: false },
  ]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generateRandomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 100);
    const l = Math.floor(Math.random() * 60) + 20; // avoid too bright/dark
    return hslToHex(h, s, l);
  };

  const generatePalette = useCallback(() => {
    setColors(prev => prev.map(c => c.locked ? c : { hex: generateRandomColor(), locked: false }));
  }, []);

  useEffect(() => {
    generatePalette();
  }, [generatePalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        generatePalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generatePalette]);

  const toggleLock = (index: number) => {
    setColors(prev => {
      const next = [...prev];
      next[index].locked = !next[index].locked;
      return next;
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedColor(text);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const exportCSS = () => {
    const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
    copyToClipboard(css);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-primary-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Color Palette Generator</span>
        </nav>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Palette Generator</h1>
            <p className="text-gray-600">Press spacebar to generate new beautiful color schemes.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={exportCSS} className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl px-4 py-2 font-semibold">
              Export CSS
            </button>
            <button onClick={generatePalette} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2 font-semibold">
              Generate
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[50vh] min-h-[400px] mb-8 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        {colors.map((color, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col justify-end p-6 transition-all duration-300 relative group"
            style={{ backgroundColor: color.hex }}
          >
            <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex flex-col items-center justify-center transition-opacity bg-black bg-opacity-10">
              <button
                onClick={() => toggleLock(index)}
                className="bg-white text-gray-900 p-3 rounded-full shadow-lg mb-4 hover:bg-gray-100 transition-colors"
                aria-label={color.locked ? "Unlock" : "Lock"}
              >
                {color.locked ? '🔒' : '🔓'}
              </button>
            </div>
            <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-sm z-10 text-center">
              <button
                onClick={() => copyToClipboard(color.hex)}
                className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors uppercase"
              >
                {copiedColor === color.hex ? 'COPIED!' : color.hex}
              </button>
              <div className="text-sm text-gray-600 font-mono mt-1">
                RGB: {hexToRgb(color.hex)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Press the Spacebar or click "Generate" to create a new random palette.</li>
          <li>Hover over a color and click the lock icon to keep it when generating new colors.</li>
          <li>Click on a hex code to copy it to your clipboard.</li>
          <li>Use "Export CSS" to copy all colors as CSS variables for your project.</li>
        </ol>
      </div>
    </div>
  );
}
''',
        'comp_name': 'ColorPaletteGenerator.tsx'
    },
    'word-counter': {
        'page': '''import { Metadata } from 'next';
import WordCounter from './WordCounter';

export const metadata: Metadata = {
  title: 'Word Counter - Count Words, Characters & Reading Time',
  description: 'Free online word counter and character counter. Calculate reading time, speaking time, sentences, and paragraphs in real-time.',
  keywords: ['word counter', 'character counter', 'reading time calculator', 'text stats']
};

export default function Page() {
  return <WordCounter />;
}
''',
        'comp': '''"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    words: 0,
    charsWithSpaces: 0,
    charsWithoutSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    avgWordLength: 0,
    readingTime: 0,
    speakingTime: 0
  });

  useEffect(() => {
    const trimmed = text.trim();
    const wordsArray = trimmed === '' ? [] : trimmed.split(/\\s+/);
    const charsWithSpaces = text.length;
    const charsWithoutSpaces = text.replace(/\\s/g, '').length;
    
    // Sentence count roughly
    const sentencesArray = text.match(/[^.!?]+[.!?]+/g) || [];
    let sentences = sentencesArray.length;
    if (sentences === 0 && trimmed.length > 0) sentences = 1;

    // Paragraph count
    const paragraphsArray = text.split(/\\n\\s*\\n/).filter(p => p.trim().length > 0);
    const paragraphs = paragraphsArray.length;

    const avgWordLength = wordsArray.length > 0 ? (charsWithoutSpaces / wordsArray.length).toFixed(1) : 0;
    
    const readingTime = Math.ceil(wordsArray.length / 200); // 200 wpm
    const speakingTime = Math.ceil(wordsArray.length / 130); // 130 wpm

    setStats({
      words: wordsArray.length,
      charsWithSpaces,
      charsWithoutSpaces,
      sentences,
      paragraphs,
      avgWordLength: Number(avgWordLength),
      readingTime,
      speakingTime
    });
  }, [text]);

  const StatCard = ({ icon, label, value, unit = '' }: { icon: string, label: string, value: number | string, unit?: string }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
        <div className="text-2xl font-bold text-gray-900">
          {value} {unit && <span className="text-base font-normal text-gray-500">{unit}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-primary-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Word Counter</span>
        </nav>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Word & Character Counter</h1>
            <p className="text-gray-600">Get real-time text statistics as you type.</p>
          </div>
          <button 
            onClick={() => setText('')} 
            className="bg-red-50 hover:bg-red-100 text-red-600 rounded-xl px-6 py-2 font-semibold transition-colors"
          >
            Clear Text
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📝" label="Words" value={stats.words} />
        <StatCard icon="🔤" label="Characters" value={stats.charsWithSpaces} />
        <StatCard icon="🔡" label="No Spaces" value={stats.charsWithoutSpaces} />
        <StatCard icon="📏" label="Avg Word Length" value={stats.avgWordLength} />
        <StatCard icon="📚" label="Sentences" value={stats.sentences} />
        <StatCard icon="¶" label="Paragraphs" value={stats.paragraphs} />
        <StatCard icon="📖" label="Reading Time" value={stats.readingTime} unit="min" />
        <StatCard icon="🗣️" label="Speaking Time" value={stats.speakingTime} unit="min" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8">
        <textarea
          className="w-full min-h-[400px] border-0 focus:ring-0 resize-y p-4 text-gray-800 text-lg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Type or paste your content into the large text area above.</li>
          <li>Watch the statistics update in real-time as you type.</li>
          <li>Check reading and speaking time estimates to pace your content.</li>
          <li>Use the Clear Text button to start over with a blank slate.</li>
        </ol>
      </div>
    </div>
  );
}
''',
        'comp_name': 'WordCounter.tsx'
    }
}

for folder, data in tools.items():
    dir_path = os.path.join(base_path, folder)
    os.makedirs(dir_path, exist_ok=True)
    
    with open(os.path.join(dir_path, 'page.tsx'), 'w') as f:
        f.write(data['page'])
        
    with open(os.path.join(dir_path, data['comp_name']), 'w') as f:
        f.write(data['comp'])

print("All tools created successfully.")

