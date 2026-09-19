"use client";
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
    const vars = colors.map((c, i) => '  --color-' + (i + 1) + ': ' + c.hex + ';').join('\n');
    const css = ':root {\n' + vars + '\n}';
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
